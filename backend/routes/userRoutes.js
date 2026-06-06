const router = require('express').Router();
const { pool } = require('../database/connection');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

router.get('/:id/profile', asyncHandler(async (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new HttpError(400, 'Invalid user id');
  }

  // 1. Get User details
  const [userRows] = await pool.query(
    'SELECT id, name, email, role, valid_till, status, submissions_count, acceptance_rate, contests_count, last_activity, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (userRows.length === 0) {
    throw new HttpError(404, 'User not found');
  }

  const user = userRows[0];

  // 2. Count distinct solved problems by difficulty
  const [solvedRows] = await pool.query(
    `SELECT p.difficulty, COUNT(DISTINCT s.problem_id) as solved_count
     FROM submissions s
     INNER JOIN problems p ON s.problem_id = p.id
     WHERE s.user_id = ? AND s.verdict = 'Accepted'
     GROUP BY p.difficulty`,
    [userId]
  );

  // 3. Count total problems by difficulty
  const [totalProblemsRows] = await pool.query(
    `SELECT difficulty, COUNT(*) as total_count
     FROM problems
     WHERE is_practice = 1
     GROUP BY difficulty`
  );

  // 4. Get recent submissions
  const [submissionRows] = await pool.query(
    `SELECT s.id, s.problem_id, s.language_id, s.verdict, s.passed_count, s.total_count, s.created_at,
            p.title as problem_title, p.difficulty as problem_difficulty
     FROM submissions s
     INNER JOIN problems p ON s.problem_id = p.id
     WHERE s.user_id = ?
     ORDER BY s.id DESC
     LIMIT 20`,
    [userId]
  );

  // Parse stats
  const difficultyStats = {
    Easy: { solved: 0, total: 0 },
    Medium: { solved: 0, total: 0 },
    Hard: { solved: 0, total: 0 }
  };

  solvedRows.forEach((row) => {
    if (difficultyStats[row.difficulty]) {
      difficultyStats[row.difficulty].solved = row.solved_count;
    }
  });

  totalProblemsRows.forEach((row) => {
    if (difficultyStats[row.difficulty]) {
      difficultyStats[row.difficulty].total = row.total_count;
    }
  });

  const totalSolved = Object.values(difficultyStats).reduce((acc, curr) => acc + curr.solved, 0);
  const totalPracticeProblems = Object.values(difficultyStats).reduce((acc, curr) => acc + curr.total, 0);

  res.json({
    success: true,
    data: {
      user,
      stats: {
        totalSolved,
        totalPracticeProblems,
        difficultyBreakdown: difficultyStats,
        recentSubmissions: submissionRows
      }
    }
  });
}));

module.exports = router;
