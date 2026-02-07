const pool = require('../db/pool');

async function findByPhoneOrEmail(phoneOrEmail) {
  const { rows } = await pool.query(
    'SELECT * FROM players WHERE phone_or_email = $1 AND deleted_at IS NULL',
    [phoneOrEmail]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM players WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  return rows[0] || null;
}

async function create({ phone_or_email, name, email, phone, gender, address, ntrp_level, notification_preference }) {
  const { rows } = await pool.query(
    `INSERT INTO players (phone_or_email, name, email, phone, gender, address, ntrp_level, notification_preference)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [phone_or_email, name, email, phone, gender, address, ntrp_level, notification_preference]
  );
  return rows[0];
}

async function update(id, fields) {
  const allowed = ['name', 'email', 'phone', 'gender', 'address', 'ntrp_level', 'notification_preference'];
  const sets = [];
  const values = [];
  let paramIndex = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = $${paramIndex}`);
      values.push(fields[key]);
      paramIndex++;
    }
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE players SET ${sets.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
    values
  );
  return rows[0] || null;
}

async function softDelete(id) {
  const { rows } = await pool.query(
    'UPDATE players SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
    [id]
  );
  return rows[0] || null;
}

async function findAll() {
  const { rows } = await pool.query(
    'SELECT id, name, phone_or_email, email, phone, ntrp_level, gender, address, notification_preference FROM players WHERE deleted_at IS NULL ORDER BY name'
  );
  return rows;
}

module.exports = { findAll, findByPhoneOrEmail, findById, create, update, softDelete };
