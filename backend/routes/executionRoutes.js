const router = require('express').Router();

const asyncHandler = require('../utils/asyncHandler');
const executionController = require('../controllers/executionController');
const { submissionLimiter } = require('../middleware/rateLimiter');

router.post('/run', submissionLimiter, asyncHandler(executionController.runCode));
router.post('/submit', submissionLimiter, asyncHandler(executionController.submitSolution));

module.exports = router;
