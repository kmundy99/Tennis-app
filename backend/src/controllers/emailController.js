const playerService = require('../services/playerService');
const matchService = require('../services/matchService');
const { sendEmail } = require('../notifications/emailService');
const { customEmail } = require('../notifications/emailTemplates');

async function sendCustom(req, res) {
  try {
    const { player_ids, match_ids, message, sender_id } = req.body;

    if (!player_ids || !Array.isArray(player_ids) || player_ids.length === 0) {
      return res.status(400).json({ error: 'player_ids is required and must be a non-empty array' });
    }
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (!sender_id) {
      return res.status(400).json({ error: 'sender_id is required' });
    }

    const sender = await playerService.findById(sender_id);
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    // Fetch match details
    const matches = [];
    if (match_ids && Array.isArray(match_ids)) {
      for (const mid of match_ids) {
        const match = await matchService.findById(mid);
        if (match) matches.push(match);
      }
    }

    // Build email
    const { subject, html } = customEmail(sender.name, message, matches);

    // Send to each selected player
    let sent = 0;
    for (const pid of player_ids) {
      const player = await playerService.findById(pid);
      if (player && player.email) {
        sendEmail({ to: player.email, subject, html });
        sent++;
      }
    }

    res.json({ sent });
  } catch (err) {
    console.error('Send custom email error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { sendCustom };
