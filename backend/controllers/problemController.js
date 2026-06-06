const problemService = require('../services/problemService');

async function listProblems(req, res) {
  const problems = await problemService.getAllProblems();
  res.json({ success: true, data: problems });
}

async function getProblem(req, res) {
  const problem = await problemService.getProblemById(req.params.id);
  res.json({ success: true, data: problem });
}

async function createProblem(req, res) {
  const createdProblem = await problemService.createProblem(req.body || {});
  res.status(201).json({ success: true, data: createdProblem });
}

async function updateProblem(req, res) {
  const updatedProblem = await problemService.updateProblem(req.params.id, req.body || {});
  res.json({ success: true, data: updatedProblem });
}

async function deleteProblem(req, res) {
  await problemService.deleteProblem(req.params.id);
  res.json({ success: true, message: 'Problem deleted successfully' });
}

async function listPracticeProblems(req, res) {
  const userId = req.query.userId ? Number(req.query.userId) : null;
  const problems = await problemService.getPracticeProblems(userId);
  res.json({ success: true, data: problems });
}

module.exports = {
  createProblem,
  deleteProblem,
  getProblem,
  listProblems,
  updateProblem,
  listPracticeProblems
};
