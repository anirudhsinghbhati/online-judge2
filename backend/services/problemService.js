const { pool } = require('../database/connection');
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
    expected_output: typeof testcase?.expected_output === 'string' ? testcase.expected_output : ''
  }));
}

async function getAllProblems() {
  const [rows] = await pool.query('SELECT id, title, description FROM problems ORDER BY id DESC');
  return rows;
}

async function getProblemById(id, executor = pool) {
  const problemId = parseProblemId(id);

  const [problemRows] = await executor.query(
    'SELECT id, title, description FROM problems WHERE id = ?',
    [problemId]
  );

  if (problemRows.length === 0) {
    throw new HttpError(404, 'Problem not found');
  }

  const [testcaseRows] = await executor.query(
    'SELECT id, input_data, expected_output FROM testcases WHERE problem_id = ? ORDER BY id ASC',
    [problemId]
  );

  return {
    ...problemRows[0],
    testcases: testcaseRows
  };
}

async function createProblem(payload) {
  const title = normalizeText(payload.title);
  const description = normalizeText(payload.description);
  const testcases = normalizeTestcases(payload.testcases);

  if (!title) {
    throw new HttpError(400, 'Title is required');
  }

  if (!description) {
    throw new HttpError(400, 'Description is required');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [insertResult] = await connection.query(
      'INSERT INTO problems (title, description) VALUES (?, ?)',
      [title, description]
    );

    const problemId = insertResult.insertId;

    for (const testcase of testcases) {
      await connection.query(
        'INSERT INTO testcases (problem_id, input_data, expected_output) VALUES (?, ?, ?)',
        [problemId, testcase.input_data, testcase.expected_output]
      );
    }

    await connection.commit();

    return getProblemById(problemId, connection);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateProblem(id, payload) {
  const problemId = parseProblemId(id);
  const title = normalizeText(payload.title);
  const description = normalizeText(payload.description);
  const testcases = normalizeTestcases(payload.testcases);

  if (!title) {
    throw new HttpError(400, 'Title is required');
  }

  if (!description) {
    throw new HttpError(400, 'Description is required');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [updateResult] = await connection.query(
      'UPDATE problems SET title = ?, description = ? WHERE id = ?',
      [title, description, problemId]
    );

    if (updateResult.affectedRows === 0) {
      throw new HttpError(404, 'Problem not found');
    }

    await connection.query('DELETE FROM testcases WHERE problem_id = ?', [problemId]);

    for (const testcase of testcases) {
      await connection.query(
        'INSERT INTO testcases (problem_id, input_data, expected_output) VALUES (?, ?, ?)',
        [problemId, testcase.input_data, testcase.expected_output]
      );
    }

    await connection.commit();

    return getProblemById(problemId, connection);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteProblem(id) {
  const problemId = parseProblemId(id);

  const [deleteResult] = await pool.query('DELETE FROM problems WHERE id = ?', [problemId]);

  if (deleteResult.affectedRows === 0) {
    throw new HttpError(404, 'Problem not found');
  }

  return { deleted: true };
}

async function getProblemTestcases(id, executor = pool) {
  const problem = await getProblemById(id, executor);
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
