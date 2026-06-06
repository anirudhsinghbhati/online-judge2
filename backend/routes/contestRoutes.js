const router = require('express').Router();
const adminService = require('../services/adminService');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const contests = await adminService.listContests(req.query.search || '');
  // Only return public contests to normal users
  const publicContests = contests.filter((c) => c.visibility === 'Public');
  res.json({ success: true, data: publicContests });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const contest = await adminService.getContestById(req.params.id);

  // If the contest is upcoming, do not return problems list to contestants
  if (contest.status === 'Upcoming') {
    contest.problems = [];
  }

  res.json({ success: true, data: contest });
}));

module.exports = router;
