const router = require('express').Router();

const asyncHandler = require('../utils/asyncHandler');
const executionController = require('../controllers/executionController');

router.post('/run', asyncHandler(executionController.runCode));
router.post('/submit', asyncHandler(executionController.submitSolution));

module.exports = router;
