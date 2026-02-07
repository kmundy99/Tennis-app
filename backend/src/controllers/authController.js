const playerService = require('../services/playerService');

async function login(req, res) {
  try {
    const { phone_or_email } = req.body;
    if (!phone_or_email) {
      return res.status(400).json({ error: 'phone_or_email is required' });
    }

    const player = await playerService.findByPhoneOrEmail(phone_or_email);
    if (!player) {
      return res.status(404).json({ error: 'Player not found. Please register first.' });
    }

    res.json({ player });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function register(req, res) {
  try {
    const { phone_or_email, name, email, phone, gender, address, ntrp_level, notification_preference } = req.body;

    if (!phone_or_email || !name) {
      return res.status(400).json({ error: 'phone_or_email and name are required' });
    }

    // Check if already exists
    const existing = await playerService.findByPhoneOrEmail(phone_or_email);
    if (existing) {
      return res.status(409).json({ error: 'Player already registered with this phone/email' });
    }

    const player = await playerService.create({
      phone_or_email, name, email, phone, gender, address, ntrp_level, notification_preference,
    });

    res.status(201).json({ player });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteAccount(req, res) {
  try {
    const { player_id } = req.body;
    if (!player_id) {
      return res.status(400).json({ error: 'player_id is required' });
    }

    const deleted = await playerService.softDelete(player_id);
    if (!deleted) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { login, register, deleteAccount };
