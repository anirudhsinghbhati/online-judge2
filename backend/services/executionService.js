const HttpError = require('../utils/httpError');
const { getProblemTestcases, parseProblemId } = require('./problemService');
const cache = require('../utils/cache');

const judge0BaseUrl = (process.env.JUDGE0_API_URL || 'http://65.0.173.238:2358').replace(/\/+$/, '');
const judge0AuthToken = process.env.JUDGE0_AUTH_TOKEN || '';
const judge0AuthUser = process.env.JUDGE0_AUTH_USER || '';
const judge0LanguageId = Number(process.env.JUDGE0_LANGUAGE_ID || 54);
const judge0CompilerOptions = process.env.JUDGE0_COMPILER_OPTIONS || '-std=c++17';
const judge0PollIntervalMs = Math.max(Number(process.env.JUDGE0_POLL_INTERVAL_MS || 300), 100);
const judge0ResultTimeoutMs = Math.max(Number(process.env.JUDGE0_RESULT_TIMEOUT_MS || 15000), 1000);
const defaultTimeoutMs = Number(process.env.EXECUTION_TIMEOUT_MS || 5000);

function normalizeOutput(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim();
}

function toBase64(value) {
  return Buffer.from(String(value ?? ''), 'utf8').toString('base64');
}

function fromBase64(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return Buffer.from(String(value), 'base64').toString('utf8');
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createJudge0Headers(body = false) {
  const headers = {
    Accept: 'application/json'
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (judge0AuthToken) {
    headers['X-Auth-Token'] = judge0AuthToken;
  }

  if (judge0AuthUser) {
    headers['X-Auth-User'] = judge0AuthUser;
  }

  return headers;
}

async function judge0Request(pathname, { method = 'GET', query = {}, body } = {}) {
  const url = new URL(`${judge0BaseUrl}${pathname}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  let response;

  try {
    response = await fetch(url, {
      method,
      headers: createJudge0Headers(Boolean(body)),
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (error) {
    throw new HttpError(502, `Unable to reach Judge0: ${error.message}`);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new HttpError(response.status, payload.error || payload.message || 'Judge0 request failed');
  }

  return payload;
}

async function createSubmission(sourceCode, stdin = '', languageId = judge0LanguageId, compilerOptions = judge0CompilerOptions) {
  const payload = {
    source_code: toBase64(sourceCode),
    language_id: Number.isInteger(Number(languageId)) ? Number(languageId) : judge0LanguageId,
    stdin: toBase64(stdin)
  };

  if (compilerOptions) {
    payload.compiler_options = compilerOptions;
  }

  return judge0Request('/submissions', {
    method: 'POST',
    query: {
      base64_encoded: 'true',
      wait: 'false'
    },
    body: payload
  });
}

async function getSubmission(token) {
  return judge0Request(`/submissions/${encodeURIComponent(token)}`, {
    query: {
      base64_encoded: 'true',
      fields: 'stdout,stderr,compile_output,message,status,exit_code,time,memory,token'
    }
  });
}

async function waitForSubmission(token, timeoutMs = judge0ResultTimeoutMs) {
  const startedAt = Date.now();

  while (true) {
    const submission = await getSubmission(token);
    const statusId = Number(submission?.status?.id);

    if (statusId !== 1 && statusId !== 2) {
      return submission;
    }

    if (Date.now() - startedAt >= timeoutMs) {
      throw new HttpError(504, 'Judge0 timed out while waiting for the execution result');
    }

    await delay(judge0PollIntervalMs);
  }
}

function buildExecutionResult(submission) {
  const statusId = Number(submission?.status?.id);
  const compilationErrors = [submission?.compile_output, submission?.stderr, submission?.message]
    .map(fromBase64)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (statusId === 6) {
    return {
      compiled: false,
      compilationErrors: compilationErrors || 'Compilation failed.'
    };
  }

  return {
    compiled: true,
    stdout: fromBase64(submission?.stdout),
    stderr: fromBase64(submission?.stderr),
    exitCode: typeof submission?.exit_code === 'number' ? submission.exit_code : null,
    timedOut: statusId === 5,
    judge0Status: submission?.status?.description || ''
  };
}

async function runCode(code, input = '', languageId = judge0LanguageId, compilerOptions = judge0CompilerOptions, timeoutMs = defaultTimeoutMs) {
  const creation = await createSubmission(code, input, languageId, compilerOptions);
  const submission = await waitForSubmission(creation.token, timeoutMs);

  return buildExecutionResult(submission);
}

async function saveSubmissionAndStats(userId, problemId, code, languageId, verdict, passedCount, totalCount) {
  if (!userId) return;
  const { pool } = require('../database/connection');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'INSERT INTO submissions (user_id, problem_id, code, language_id, verdict, passed_count, total_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, problemId, code, languageId, verdict, passedCount, totalCount]
    );

    const [statsRows] = await connection.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN verdict = "Accepted" THEN 1 ELSE 0 END) as accepted FROM submissions WHERE user_id = ?',
      [userId]
    );

    const totalSubmissions = statsRows[0].total || 1;
    const acceptedSubmissions = statsRows[0].accepted || 0;
    const acceptanceRate = Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(2));

    await connection.query(
      'UPDATE users SET submissions_count = ?, acceptance_rate = ?, last_activity = "Just now" WHERE id = ?',
      [totalSubmissions, acceptanceRate, userId]
    );

    await connection.commit();

    // Invalidate user practice problems status cache
    await cache.del(`problems:practice:${userId}`);
  } catch (error) {
    await connection.rollback();
    console.error('Failed to save submission or update user statistics:', error);
  } finally {
    connection.release();
  }
}

async function submitSolution(problemId, code, languageId = judge0LanguageId, compilerOptions = judge0CompilerOptions, userId = null, timeoutMs = defaultTimeoutMs) {
  if (typeof userId === 'object' && userId !== null) {
    // shift args if needed
    timeoutMs = userId;
    userId = null;
  }
  const parsedProblemId = parseProblemId(problemId);
  const testcases = await getProblemTestcases(parsedProblemId);

  const details = [];
  let passedCount = 0;
  let failedTestcaseNumber = null;
  let verdict = 'Accepted';

  for (let index = 0; index < testcases.length; index += 1) {
    const testcase = testcases[index];
    const creation = await createSubmission(code, testcase.input_data, languageId, compilerOptions);
    const submission = await waitForSubmission(creation.token, timeoutMs);
    const execution = buildExecutionResult(submission);

    if (!execution.compiled) {
      const compilationVerdict = 'Compilation Error';
      await saveSubmissionAndStats(userId, parsedProblemId, code, languageId, compilationVerdict, 0, testcases.length);
      return {
        verdict: compilationVerdict,
        passedCount: 0,
        totalCount: testcases.length,
        failedTestcaseNumber: null,
        compilationErrors: execution.compilationErrors,
        details: []
      };
    }

    const actualOutput = normalizeOutput(execution.stdout);
    const expectedOutput = normalizeOutput(testcase.expected_output);
    const passed = !execution.timedOut && actualOutput === expectedOutput && Number(submission?.status?.id) === 3;

    details.push({
      testcaseNumber: index + 1,
      input: testcase.input_data,
      expectedOutput: testcase.expected_output,
      actualOutput: execution.stdout,
      stderr: execution.stderr,
      exitCode: execution.exitCode,
      timedOut: execution.timedOut,
      judge0Status: execution.judge0Status,
      passed
    });

    if (!passed) {
      failedTestcaseNumber = index + 1;

      if (execution.timedOut) {
        verdict = 'Time Limit Exceeded';
      } else if (Number(submission?.status?.id) >= 7) {
        verdict = 'Runtime Error';
      } else {
        verdict = 'Wrong Answer';
      }

      break;
    }

    passedCount += 1;
  }

  await saveSubmissionAndStats(userId, parsedProblemId, code, languageId, verdict, passedCount, testcases.length);

  return {
    verdict,
    passedCount,
    totalCount: testcases.length,
    failedTestcaseNumber,
    compilationErrors: '',
    details
  };
}

module.exports = {
  runCode,
  submitSolution
};
