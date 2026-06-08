async function runMigrations(pool) {
  console.log('Running automatic database migrations...');
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Ensure 'problems' table exists and has latest columns
    const [tables] = await connection.query('SHOW TABLES LIKE "problems"');
    if (tables.length > 0) {
      const [columns] = await connection.query('DESCRIBE problems');
      
      const hasOfficialSolution = columns.some(col => col.Field === 'official_solution');
      const hasIsPractice = columns.some(col => col.Field === 'is_practice');

      if (!hasOfficialSolution) {
        console.log('Migration: Adding "official_solution" to "problems" table...');
        await connection.query('ALTER TABLE problems ADD COLUMN official_solution TEXT NULL');
        console.log('Migration: "official_solution" added successfully.');
      }

      if (!hasIsPractice) {
        console.log('Migration: Adding "is_practice" to "problems" table...');
        await connection.query('ALTER TABLE problems ADD COLUMN is_practice BOOLEAN NOT NULL DEFAULT TRUE');
        console.log('Migration: "is_practice" added successfully.');
      }
    }

    // 2. Ensure 'submissions' table exists (it might be missing in older deployments)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        problem_id INT NOT NULL,
        code TEXT NOT NULL,
        language_id INT NOT NULL,
        verdict VARCHAR(64) NOT NULL,
        passed_count INT NOT NULL DEFAULT 0,
        total_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_submissions_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_submissions_problem
          FOREIGN KEY (problem_id)
          REFERENCES problems(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration: Checked/Created "submissions" table.');

    // 3. Ensure other tables from schema.sql exist just in case
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source VARCHAR(64) NOT NULL,
        event VARCHAR(255) NOT NULL,
        severity VARCHAR(32) NOT NULL DEFAULT 'Info',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Database migrations completed successfully.');
  } catch (error) {
    console.error('Database migration failed:', error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = { runMigrations };
