const { pool } = require('../database/connection');
const { recordLog } = require('./adminLogService');
const HttpError = require('../utils/httpError');

function parseProblemId(value) {
  const problemId = Number.parseInt(value, 10);

  if (!Number.isInteger(problemId) || problemId <= 0) {
    throw new HttpError(400, 'Invalid problem id');
  }

  return problemId;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeVisibility(value) {
  const visibility = normalizeText(value).toLowerCase();
  return visibility === 'hidden' ? 'hidden' : 'visible';
}

function normalizeTestcases(testcases) {
  if (!Array.isArray(testcases)) {
    throw new HttpError(400, 'Testcases must be an array');
  }

  if (testcases.length === 0) {
    throw new HttpError(400, 'At least one testcase is required');
  }

  if (testcases.length > 10) {
    throw new HttpError(400, 'A maximum of 10 testcases is allowed');
  }

  return testcases.map((testcase) => ({
    input_data: typeof testcase?.input_data === 'string' ? testcase.input_data : '',
    expected_output: typeof testcase?.expected_output === 'string' ? testcase.expected_output : '',
    visibility: normalizeVisibility(testcase?.visibility),
    sort_order: Number.isInteger(testcase?.sort_order) ? testcase.sort_order : 0
  }));
}

async function getAllProblems() {
  const [rows] = await pool.query(
    'SELECT id, title, description, difficulty, topic, constraints_text AS constraints, image_url, created_at, updated_at FROM problems ORDER BY id DESC'
  );
  return rows;
}

async function getProblemById(id, executor = pool, options = {}) {
  const problemId = parseProblemId(id);
  const includeHidden = Boolean(options.includeHidden);

  const [problemRows] = await executor.query(
    'SELECT id, title, description, difficulty, topic, constraints_text AS constraints, image_url, created_at, updated_at FROM problems WHERE id = ?',
    [problemId]
  );

  if (problemRows.length === 0) {
    throw new HttpError(404, 'Problem not found');
  }

  const testcaseQuery = includeHidden
    ? 'SELECT id, input_data, expected_output, visibility, sort_order FROM testcases WHERE problem_id = ? ORDER BY sort_order ASC, id ASC'
    : 'SELECT id, input_data, expected_output, visibility, sort_order FROM testcases WHERE problem_id = ? AND visibility = "visible" ORDER BY sort_order ASC, id ASC';

  const [testcaseRows] = await executor.query(testcaseQuery, [problemId]);

  return {
    ...problemRows[0],
    testcases: testcaseRows
  };
}

async function createProblem(payload, executor = pool) {
  const title = normalizeText(payload.title);
  const description = normalizeText(payload.description);
  const difficulty = normalizeText(payload.difficulty) || 'Easy';
  const topic = normalizeText(payload.topic) || 'General';
  const constraints = normalizeText(payload.constraints || payload.constraints_text);
  const imageUrl = normalizeText(payload.imageUrl || payload.image_url);
  const testcases = normalizeTestcases(payload.testcases);

  if (!title) {
    throw new HttpError(400, 'Title is required');
  }

  if (!description) {
    throw new HttpError(400, 'Description is required');
  }

  const connection = await pool.getConnection();
  const runner = executor === pool ? connection : executor;

  try {
    await runner.beginTransaction();

    const [insertResult] = await connection.query(
      'INSERT INTO problems (title, description, difficulty, topic, constraints_text, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, difficulty, topic, constraints, imageUrl]
    );

    const problemId = insertResult.insertId;

    for (const [index, testcase] of testcases.entries()) {
      await runner.query(
        'INSERT INTO testcases (problem_id, input_data, expected_output, visibility, sort_order) VALUES (?, ?, ?, ?, ?)',
        [problemId, testcase.input_data, testcase.expected_output, testcase.visibility, testcase.sort_order || index]
      );
    }

    await recordLog('Problem', `Created problem #${problemId} (${title})`, 'Info', runner);

    await runner.commit();

    return getProblemById(problemId, runner, { includeHidden: true });
  } catch (error) {
    await runner.rollback();
    throw error;
  } finally {
    if (runner === connection) {
      connection.release();
    }
  }
}

async function updateProblem(id, payload, executor = pool) {
  const problemId = parseProblemId(id);
  const title = normalizeText(payload.title);
  const description = normalizeText(payload.description);
  const difficulty = normalizeText(payload.difficulty) || 'Easy';
  const topic = normalizeText(payload.topic) || 'General';
  const constraints = normalizeText(payload.constraints || payload.constraints_text);
  const imageUrl = normalizeText(payload.imageUrl || payload.image_url);
  const testcases = normalizeTestcases(payload.testcases);

  if (!title) {
    throw new HttpError(400, 'Title is required');
  }

  if (!description) {
    throw new HttpError(400, 'Description is required');
  }

  const connection = await pool.getConnection();
  const runner = executor === pool ? connection : executor;

  try {
    await runner.beginTransaction();

    const [updateResult] = await connection.query(
      'UPDATE problems SET title = ?, description = ?, difficulty = ?, topic = ?, constraints_text = ?, image_url = ? WHERE id = ?',
      [title, description, difficulty, topic, constraints, imageUrl, problemId]
    );

    if (updateResult.affectedRows === 0) {
      throw new HttpError(404, 'Problem not found');
    }

    await runner.query('DELETE FROM testcases WHERE problem_id = ?', [problemId]);

    for (const [index, testcase] of testcases.entries()) {
      await runner.query(
        'INSERT INTO testcases (problem_id, input_data, expected_output, visibility, sort_order) VALUES (?, ?, ?, ?, ?)',
        [problemId, testcase.input_data, testcase.expected_output, testcase.visibility, testcase.sort_order || index]
      );
    }

    await recordLog('Problem', `Updated problem #${problemId} (${title})`, 'Info', runner);

    await runner.commit();

    return getProblemById(problemId, runner, { includeHidden: true });
  } catch (error) {
    await runner.rollback();
    throw error;
  } finally {
    if (runner === connection) {
      connection.release();
    }
  }
}

async function deleteProblem(id) {
  const problemId = parseProblemId(id);

  const [deleteResult] = await pool.query('DELETE FROM problems WHERE id = ?', [problemId]);

  if (deleteResult.affectedRows === 0) {
    throw new HttpError(404, 'Problem not found');
  }

  await recordLog('Problem', `Deleted problem #${problemId}`, 'Warning');

  return { deleted: true };
}

async function getProblemTestcases(id, executor = pool, options = {}) {
  const problem = await getProblemById(id, executor, options);
  return problem.testcases;
}

module.exports = {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblemById,
  getProblemTestcases,
  parseProblemId,
  updateProblem
};
