const router = require('express').Router();
const adminService = require('../services/adminService');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const rows = await adminService.listNotices();
  res.json({ success: true, data: rows });
}));

module.exports = router;
