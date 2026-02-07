const playerService = require('../services/playerService');
const matchService = require('../services/matchService');

async function getProfile(req, res) {
  try {
    const player = await playerService.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ player });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateProfile(req, res) {
  try {
    const player = await playerService.update(req.params.id, req.body);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json({ player });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getPlayerMatches(req, res) {
  try {
    const matches = await matchService.getPlayerMatches(req.params.id);
    res.json({ matches });
  } catch (err) {
    console.error('Get player matches error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAll(req, res) {
  try {
    const players = await playerService.findAll();
    res.json({ players });
  } catch (err) {
    console.error('Get all players error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getAll, getProfile, updateProfile, getPlayerMatches };
