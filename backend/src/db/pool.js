const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_URL || process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = pool;
