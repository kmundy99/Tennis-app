require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/players');
const matchRoutes = require('./routes/matches');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/email', emailRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const pool = require('./db/pool');
  let dbStatus = 'unknown';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.3',
    database: dbStatus,
    hasDbUrl: !!process.env.DATABASE_URL,
    dbHost: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'not set',
    envKeys: Object.keys(process.env).sort(),
  });
});

// Start notification scheduler
const { startScheduler } = require('./notifications/scheduler');
startScheduler();

app.listen(PORT, () => {
  console.log(`Tennis app backend running on http://localhost:${PORT}`);
});
