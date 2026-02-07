const pool = require('../db/pool');

async function findAll(filters = {}) {
  let query = `
    SELECT m.*, p.name AS organizer_name,
      (SELECT COUNT(*) FROM match_registrations mr WHERE mr.match_id = m.id AND mr.registration_type = 'registered') AS registered_count
    FROM matches m
    JOIN players p ON m.organizer_id = p.id
    WHERE m.status = 'scheduled'
  `;
  const values = [];
  let paramIndex = 1;

  if (filters.from) {
    query += ` AND m.start_time >= $${paramIndex}`;
    values.push(filters.from);
    paramIndex++;
  }
  if (filters.to) {
    query += ` AND m.start_time <= $${paramIndex}`;
    values.push(filters.to);
    paramIndex++;
  }
  if (filters.playerId) {
    query += ` AND EXISTS (SELECT 1 FROM match_registrations mr WHERE mr.match_id = m.id AND mr.player_id = $${paramIndex})`;
    values.push(filters.playerId);
    paramIndex++;
  }

  query += ' ORDER BY m.start_time ASC';

  const { rows } = await pool.query(query, values);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT m.*, p.name AS organizer_name
     FROM matches m
     JOIN players p ON m.organizer_id = p.id
     WHERE m.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ organizer_id, court_address, start_time, end_time, min_ntrp_level, max_players }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create the match
    const { rows } = await client.query(
      `INSERT INTO matches (organizer_id, court_address, start_time, end_time, min_ntrp_level, max_players)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [organizer_id, court_address, start_time, end_time, min_ntrp_level, max_players || 4]
    );
    const match = rows[0];

    // Auto-register the organizer
    await client.query(
      `INSERT INTO match_registrations (match_id, player_id, registration_type)
       VALUES ($1, $2, 'registered')`,
      [match.id, organizer_id]
    );

    await client.query('COMMIT');
    return match;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function cancel(matchId, organizerId) {
  const { rows } = await pool.query(
    `UPDATE matches SET status = 'cancelled', cancelled_at = NOW()
     WHERE id = $1 AND organizer_id = $2 AND status = 'scheduled'
     RETURNING *`,
    [matchId, organizerId]
  );
  return rows[0] || null;
}

async function getRegistrations(matchId) {
  const { rows } = await pool.query(
    `SELECT mr.*, p.name, p.email, p.phone, p.ntrp_level, p.gender, p.notification_preference
     FROM match_registrations mr
     JOIN players p ON mr.player_id = p.id
     WHERE mr.match_id = $1
     ORDER BY mr.registration_type ASC, mr.position_on_waitlist ASC NULLS FIRST, mr.registered_at ASC`,
    [matchId]
  );
  return rows;
}

async function joinMatch(matchId, playerId) {
  // Check match exists and is scheduled
  const match = await findById(matchId);
  if (!match) throw new Error('Match not found');
  if (match.status !== 'scheduled') throw new Error('Match is not open for registration');

  // Check if already registered
  const { rows: existing } = await pool.query(
    'SELECT * FROM match_registrations WHERE match_id = $1 AND player_id = $2',
    [matchId, playerId]
  );
  if (existing.length > 0) throw new Error('Already registered for this match');

  // Count current registrations
  const { rows: countRows } = await pool.query(
    "SELECT COUNT(*) AS cnt FROM match_registrations WHERE match_id = $1 AND registration_type = 'registered'",
    [matchId]
  );
  const registeredCount = parseInt(countRows[0].cnt, 10);

  if (registeredCount < match.max_players) {
    // Register directly
    const { rows } = await pool.query(
      `INSERT INTO match_registrations (match_id, player_id, registration_type)
       VALUES ($1, $2, 'registered')
       RETURNING *`,
      [matchId, playerId]
    );
    return { ...rows[0], action: 'registered' };
  } else {
    // Add to waitlist
    const { rows: waitlistRows } = await pool.query(
      "SELECT COALESCE(MAX(position_on_waitlist), 0) AS max_pos FROM match_registrations WHERE match_id = $1 AND registration_type = 'waitlist'",
      [matchId]
    );
    const nextPos = parseInt(waitlistRows[0].max_pos, 10) + 1;
    if (nextPos > 3) throw new Error('Waitlist is full (max 3)');

    const { rows } = await pool.query(
      `INSERT INTO match_registrations (match_id, player_id, registration_type, position_on_waitlist)
       VALUES ($1, $2, 'waitlist', $3)
       RETURNING *`,
      [matchId, playerId, nextPos]
    );
    return { ...rows[0], action: 'waitlisted' };
  }
}

async function leaveMatch(matchId, playerId) {
  const { rows } = await pool.query(
    'DELETE FROM match_registrations WHERE match_id = $1 AND player_id = $2 RETURNING *',
    [matchId, playerId]
  );
  if (rows.length === 0) throw new Error('Not registered for this match');

  // If a registered player left, promote first waitlisted player
  if (rows[0].registration_type === 'registered') {
    const { rows: waitlist } = await pool.query(
      "SELECT * FROM match_registrations WHERE match_id = $1 AND registration_type = 'waitlist' ORDER BY position_on_waitlist ASC LIMIT 1",
      [matchId]
    );
    if (waitlist.length > 0) {
      await pool.query(
        "UPDATE match_registrations SET registration_type = 'registered', position_on_waitlist = NULL WHERE id = $1",
        [waitlist[0].id]
      );
      // Reorder remaining waitlist positions
      await pool.query(
        "UPDATE match_registrations SET position_on_waitlist = position_on_waitlist - 1 WHERE match_id = $1 AND registration_type = 'waitlist'",
        [matchId]
      );
      const { notifyWaitlistPromotion } = require('../notifications/notificationService');
      notifyWaitlistPromotion(matchId, waitlist[0].player_id);
    }
  }

  return rows[0];
}

async function getPlayerMatches(playerId) {
  const { rows } = await pool.query(
    `SELECT m.*, mr.registration_type, mr.position_on_waitlist, p.name AS organizer_name,
      (SELECT COUNT(*) FROM match_registrations r WHERE r.match_id = m.id AND r.registration_type = 'registered') AS registered_count
     FROM match_registrations mr
     JOIN matches m ON mr.match_id = m.id
     JOIN players p ON m.organizer_id = p.id
     WHERE mr.player_id = $1 AND m.status = 'scheduled'
     ORDER BY m.start_time ASC`,
    [playerId]
  );
  return rows;
}

module.exports = { findAll, findById, create, cancel, getRegistrations, joinMatch, leaveMatch, getPlayerMatches };
