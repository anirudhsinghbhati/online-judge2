const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'code_judge_mvp',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false
});

const { runMigrations } = require('./migrations');

async function verifyDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
    // Run migrations automatically
    await runMigrations(pool);
  } finally {
    connection.release();
  }
}


module.exports = {
  pool,
  verifyDatabaseConnection
};
