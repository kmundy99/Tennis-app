const matchService = require('../services/matchService');
const { notifyNewMatch, notifyMatchCancelled } = require('../notifications/notificationService');

async function getAll(req, res) {
  try {
    const filters = {};
    if (req.query.from) filters.from = req.query.from;
    if (req.query.to) filters.to = req.query.to;
    if (req.query.playerId) filters.playerId = req.query.playerId;

    const matches = await matchService.findAll(filters);
    res.json({ matches });
  } catch (err) {
    console.error('Get matches error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getById(req, res) {
  try {
    const match = await matchService.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const registrations = await matchService.getRegistrations(req.params.id);
    const registered = registrations.filter(r => r.registration_type === 'registered');
    const waitlist = registrations.filter(r => r.registration_type === 'waitlist');

    res.json({ match, registered, waitlist });
  } catch (err) {
    console.error('Get match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function create(req, res) {
  try {
    const { organizer_id, court_address, start_time, end_time, min_ntrp_level, max_players } = req.body;

    if (!organizer_id || !court_address || !start_time || !end_time) {
      return res.status(400).json({ error: 'organizer_id, court_address, start_time, and end_time are required' });
    }

    const match = await matchService.create({
      organizer_id, court_address, start_time, end_time, min_ntrp_level, max_players,
    });

    notifyNewMatch(match);
    res.status(201).json({ match });
  } catch (err) {
    console.error('Create match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function cancel(req, res) {
  try {
    const { organizer_id } = req.body;
    if (!organizer_id) {
      return res.status(400).json({ error: 'organizer_id is required' });
    }

    const match = await matchService.cancel(req.params.id, organizer_id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found or you are not the organizer' });
    }

    notifyMatchCancelled(match.id);
    res.json({ match });
  } catch (err) {
    console.error('Cancel match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function join(req, res) {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      return res.status(400).json({ error: 'player_id is required' });
    }

    const registration = await matchService.joinMatch(req.params.id, player_id);
    res.status(201).json({ registration });
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('not open') ||
        err.message.includes('Already') || err.message.includes('full')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Join match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function leave(req, res) {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      return res.status(400).json({ error: 'player_id is required' });
    }

    const registration = await matchService.leaveMatch(req.params.id, player_id);
    res.json({ message: 'Successfully left match', registration });
  } catch (err) {
    if (err.message.includes('Not registered')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Leave match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getAll, getById, create, cancel, join, leave };
