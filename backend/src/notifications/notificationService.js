const pool = require('../db/pool');
const { sendEmail } = require('./emailService');
const templates = require('./emailTemplates');

async function notifyNewMatch(match) {
  try {
    // Find all active players with EmailMe preference who meet the NTRP requirement
    let query = `
      SELECT id, email, name, ntrp_level
      FROM players
      WHERE deleted_at IS NULL
        AND notification_preference = 'EmailMe'
        AND email IS NOT NULL
        AND id != $1`;
    const values = [match.organizer_id];

    if (match.min_ntrp_level) {
      query += ` AND ntrp_level >= $2`;
      values.push(match.min_ntrp_level);
    }

    const { rows: players } = await pool.query(query, values);
    const { subject, html } = templates.newMatchCreated(match);

    for (const player of players) {
      sendEmail({ to: player.email, subject, html });
    }

    console.log(`[NOTIFY] New match ${match.id}: notifying ${players.length} eligible players`);
  } catch (err) {
    console.error('[NOTIFY] Error notifying new match:', err.message);
  }
}

async function notifyMatchCancelled(matchId) {
  try {
    const match = await require('../services/matchService').findById(matchId);
    if (!match) return;

    const { rows: registrations } = await pool.query(
      `SELECT mr.*, p.email, p.name, p.notification_preference
       FROM match_registrations mr
       JOIN players p ON mr.player_id = p.id
       WHERE mr.match_id = $1 AND p.deleted_at IS NULL AND p.email IS NOT NULL`,
      [matchId]
    );

    const { subject, html } = templates.matchCancelled(match);

    for (const reg of registrations) {
      if (reg.notification_preference === 'DontNotifyMe') continue;
      sendEmail({ to: reg.email, subject, html });
    }

    console.log(`[NOTIFY] Match ${matchId} cancelled: notifying ${registrations.length} players`);
  } catch (err) {
    console.error('[NOTIFY] Error notifying match cancellation:', err.message);
  }
}

async function notifyWaitlistPromotion(matchId, playerId) {
  try {
    const match = await require('../services/matchService').findById(matchId);
    if (!match) return;

    const { rows } = await pool.query(
      'SELECT email, name FROM players WHERE id = $1 AND deleted_at IS NULL',
      [playerId]
    );
    if (rows.length === 0 || !rows[0].email) return;

    const player = rows[0];
    const { subject, html } = templates.waitlistPromotion(match, player.name);

    // Always send regardless of notification preference
    sendEmail({ to: player.email, subject, html });
    console.log(`[NOTIFY] Waitlist promotion: player ${playerId} for match ${matchId}`);
  } catch (err) {
    console.error('[NOTIFY] Error notifying waitlist promotion:', err.message);
  }
}

async function sendMatchReminders(label, hours) {
  try {
    const flagCol = hours === 24 ? 'reminder_24h_sent' : 'reminder_1h_sent';

    // Find matches within the time window that haven't been reminded yet
    const { rows: matches } = await pool.query(
      `SELECT m.*, p.name AS organizer_name
       FROM matches m
       JOIN players p ON m.organizer_id = p.id
       WHERE m.status = 'scheduled'
         AND m.${flagCol} = false
         AND m.start_time > NOW()
         AND m.start_time <= NOW() + INTERVAL '${hours} hours'`
    );

    for (const match of matches) {
      const { rows: registrations } = await pool.query(
        `SELECT mr.*, p.name, p.email, p.ntrp_level, p.notification_preference, mr.registration_type
         FROM match_registrations mr
         JOIN players p ON mr.player_id = p.id
         WHERE mr.match_id = $1 AND p.deleted_at IS NULL`,
        [match.id]
      );

      const { subject, html } = templates.matchReminder(match, registrations, label);

      const registered = registrations.filter(r => r.registration_type === 'registered');
      for (const reg of registered) {
        if (reg.notification_preference === 'DontNotifyMe') continue;
        if (!reg.email) continue;
        sendEmail({ to: reg.email, subject, html });
      }

      await pool.query(`UPDATE matches SET ${flagCol} = true WHERE id = $1`, [match.id]);
    }

    if (matches.length > 0) {
      console.log(`[SCHEDULER] Sent ${label} reminders for ${matches.length} match(es)`);
    }
  } catch (err) {
    console.error(`[SCHEDULER] Error sending ${label} reminders:`, err.message);
  }
}

async function sendUnfilledMatchNotifications() {
  try {
    // Find unfilled matches ~3 days out that haven't been notified
    const { rows: matches } = await pool.query(
      `SELECT m.*, p.name AS organizer_name,
         (SELECT COUNT(*) FROM match_registrations mr WHERE mr.match_id = m.id AND mr.registration_type = 'registered') AS registered_count
       FROM matches m
       JOIN players p ON m.organizer_id = p.id
       WHERE m.status = 'scheduled'
         AND m.unfilled_3day_sent = false
         AND m.start_time > NOW()
         AND m.start_time <= NOW() + INTERVAL '3 days'`
    );

    for (const match of matches) {
      const registeredCount = parseInt(match.registered_count, 10);
      if (registeredCount >= match.max_players) {
        // Match is full — mark as sent so we don't check again
        await pool.query('UPDATE matches SET unfilled_3day_sent = true WHERE id = $1', [match.id]);
        continue;
      }

      const openSpots = match.max_players - registeredCount;

      // Find eligible players not already registered
      let query = `
        SELECT id, email, name
        FROM players
        WHERE deleted_at IS NULL
          AND notification_preference = 'EmailMe'
          AND email IS NOT NULL
          AND id NOT IN (SELECT player_id FROM match_registrations WHERE match_id = $1)`;
      const values = [match.id];

      if (match.min_ntrp_level) {
        query += ` AND ntrp_level >= $2`;
        values.push(match.min_ntrp_level);
      }

      const { rows: players } = await pool.query(query, values);
      const { subject, html } = templates.unfilledMatch(match, openSpots);

      for (const player of players) {
        sendEmail({ to: player.email, subject, html });
      }

      await pool.query('UPDATE matches SET unfilled_3day_sent = true WHERE id = $1', [match.id]);
      console.log(`[SCHEDULER] Unfilled match ${match.id}: notifying ${players.length} players (${openSpots} spots open)`);
    }
  } catch (err) {
    console.error('[SCHEDULER] Error sending unfilled match notifications:', err.message);
  }
}

module.exports = { notifyNewMatch, notifyMatchCancelled, notifyWaitlistPromotion, sendMatchReminders, sendUnfilledMatchNotifications };
