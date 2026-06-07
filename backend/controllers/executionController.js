const executionService = require('../services/executionService');
const HttpError = require('../utils/httpError');

async function runCode(req, res) {
  const { code, problemId, input = '', languageId, compilerOptions } = req.body || {};

  if (typeof code !== 'string' || !code.trim()) {
    throw new HttpError(400, 'Code is required');
  }

  let result;
  if (problemId) {
    result = await executionService.runCodeForProblem(problemId, code, languageId, compilerOptions);
  } else {
    result = await executionService.runCode(code, input, languageId, compilerOptions);
  }
  res.json({ success: true, data: result });
}

async function submitSolution(req, res) {
  const { code, problemId, languageId, compilerOptions, userId } = req.body || {};

  if (typeof code !== 'string' || !code.trim()) {
    throw new HttpError(400, 'Code is required');
  }

  if (!problemId) {
    throw new HttpError(400, 'Problem id is required');
  }

  const result = await executionService.submitSolution(problemId, code, languageId, compilerOptions, userId);
  res.json({ success: true, data: result });
}

module.exports = {
  runCode,
  submitSolution
};
