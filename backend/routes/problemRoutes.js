const router = require('express').Router();

const asyncHandler = require('../utils/asyncHandler');
const problemController = require('../controllers/problemController');

router.get('/', asyncHandler(problemController.listProblems));
router.get('/practice', asyncHandler(problemController.listPracticeProblems));
router.get('/:id', asyncHandler(problemController.getProblem));
router.post('/', asyncHandler(problemController.createProblem));
router.put('/:id', asyncHandler(problemController.updateProblem));
router.delete('/:id', asyncHandler(problemController.deleteProblem));

module.exports = router;
