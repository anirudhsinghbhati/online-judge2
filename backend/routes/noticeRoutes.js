const router = require('express').Router();
const { pool } = require('../database/connection');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, title, content, created_at FROM notices ORDER BY id DESC');
  res.json({ success: true, data: rows });
}));

module.exports = router;
