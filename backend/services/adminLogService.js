const { pool } = require('../database/connection');

async function recordLog(source, event, severity = 'Info', executor = pool) {
  await executor.query(
    'INSERT INTO admin_logs (source, event, severity) VALUES (?, ?, ?)',
    [source, event, severity]
  );
}

async function listLogs(limit = 100) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 500) : 100;
  const [rows] = await pool.query(
    'SELECT id, source, event, severity, created_at FROM admin_logs ORDER BY id DESC LIMIT ?',
    [safeLimit]
  );
  return rows;
}

module.exports = {
  listLogs,
  recordLog
};