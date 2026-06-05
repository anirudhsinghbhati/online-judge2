const crypto = require('crypto');

const { pool } = require('../database/connection');
const HttpError = require('../utils/httpError');
const { recordLog, listLogs } = require('./adminLogService');
const problemService = require('./problemService');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePositiveId(value, label) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return id;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function normalizeUserPayload(payload) {
  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email).toLowerCase();
  const role = normalizeText(payload.role) || 'Contestant';
  const password = normalizeText(payload.password);
  const validTill = normalizeText(payload.validTill || payload.valid_till) || null;

  if (!name) {
    throw new HttpError(400, 'Name is required');
  }

  if (!email) {
    throw new HttpError(400, 'Email is required');
  }

  return {
    name,
    email,
    role,
    password,
    validTill
  };
}

async function listUsers(search = '') {
  const term = normalizeText(search);
  const params = [];
  let sql = 'SELECT id, name, email, role, valid_till, status, submissions_count, acceptance_rate, contests_count, last_activity, created_at, updated_at FROM users';

  if (term) {
    sql += ' WHERE name LIKE ? OR email LIKE ? OR role LIKE ?';
    params.push(`%${term}%`, `%${term}%`, `%${term}%`);
  }

  sql += ' ORDER BY id DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getUserById(id) {
  const userId = parsePositiveId(id, 'user id');
  const [rows] = await pool.query(
    'SELECT id, name, email, role, valid_till, status, submissions_count, acceptance_rate, contests_count, last_activity, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    throw new HttpError(404, 'User not found');
  }

  const user = rows[0];

  return {
    ...user,
    analytics: {
      submissions: user.submissions_count,
      acceptanceRate: Number(user.acceptance_rate),
      contests: user.contests_count,
      lastActivity: user.last_activity
    }
  };
}

async function createUser(payload) {
  const { name, email, role, password, validTill } = normalizeUserPayload(payload);
  const passwordToStore = password ? hashPassword(password) : hashPassword('change-me');

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new HttpError(409, 'Email already exists');
  }

  const [result] = await pool.query(
    'INSERT INTO users (name, email, role, password_hash, valid_till, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, role, passwordToStore, validTill, 'Active']
  );

  await recordLog('User', `Created user #${result.insertId} (${email})`, 'Info');

  return getUserById(result.insertId);
}

async function updateUser(id, payload) {
  const userId = parsePositiveId(id, 'user id');
  const existing = await getUserById(userId);
  const nextName = normalizeText(payload.name) || existing.name;
  const nextEmail = normalizeText(payload.email).toLowerCase() || existing.email;
  const nextRole = normalizeText(payload.role) || existing.role;
  const nextValidTill = normalizeText(payload.validTill || payload.valid_till) || existing.valid_till;
  const nextStatus = normalizeText(payload.status) || existing.status;

  const password = normalizeText(payload.password);
  const passwordHash = password ? hashPassword(password) : undefined;

  if (nextEmail !== existing.email) {
    const [emailRows] = await pool.query('SELECT id FROM users WHERE email = ? AND id <> ?', [nextEmail, userId]);
    if (emailRows.length > 0) {
      throw new HttpError(409, 'Email already exists');
    }
  }

  const fields = ['name = ?', 'email = ?', 'role = ?', 'valid_till = ?', 'status = ?'];
  const values = [nextName, nextEmail, nextRole, nextValidTill, nextStatus];

  if (passwordHash) {
    fields.push('password_hash = ?');
    values.push(passwordHash);
  }

  values.push(userId);

  const [result] = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw new HttpError(404, 'User not found');
  }

  await recordLog('User', `Updated user #${userId} (${nextEmail})`, 'Info');

  return getUserById(userId);
}

async function setUserStatus(id, status) {
  const userId = parsePositiveId(id, 'user id');
  const nextStatus = normalizeText(status) || 'Active';

  const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [nextStatus, userId]);
  if (result.affectedRows === 0) {
    throw new HttpError(404, 'User not found');
  }

  await recordLog('User', `Set user #${userId} status to ${nextStatus}`, 'Warning');

  return getUserById(userId);
}

async function deleteUser(id) {
  const userId = parsePositiveId(id, 'user id');
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  if (result.affectedRows === 0) {
    throw new HttpError(404, 'User not found');
  }

  await recordLog('User', `Deleted user #${userId}`, 'Warning');
  return { deleted: true };
}

function normalizeContestPayload(payload) {
  const contestName = normalizeText(payload.contestName || payload.name);
  const contestCode = normalizeText(payload.contestCode || payload.code);
  const description = normalizeText(payload.description);
  const startDate = normalizeText(payload.startDate || payload.start_date);
  const startTime = normalizeText(payload.startTime || payload.start_time);
  const endDate = normalizeText(payload.endDate || payload.end_date);
  const endTime = normalizeText(payload.endTime || payload.end_time);
  const duration = normalizeText(payload.duration);
  const visibility = normalizeText(payload.visibility) || 'Public';
  const accessControl = normalizeText(payload.accessControl || payload.access_control) || 'Allowed Users';
  const allowedUsers = normalizeText(payload.allowedUsers || payload.allowed_users);
  const status = normalizeText(payload.status) || 'Upcoming';
  const problemIds = Array.isArray(payload.problemIds) ? payload.problemIds.map((value) => Number.parseInt(value, 10)).filter((value) => Number.isInteger(value) && value > 0) : [];

  if (!contestName) {
    throw new HttpError(400, 'Contest name is required');
  }

  if (!contestCode) {
    throw new HttpError(400, 'Contest code is required');
  }

  if (!startDate || !startTime || !endDate || !endTime) {
    throw new HttpError(400, 'Contest start and end dates are required');
  }

  if (!duration) {
    throw new HttpError(400, 'Duration is required');
  }

  return {
    contestName,
    contestCode,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    duration,
    visibility,
    accessControl,
    allowedUsers,
    status,
    problemIds
  };
}

async function listContests(search = '') {
  const term = normalizeText(search);
  const params = [];
  let sql = 'SELECT id, contest_name, contest_code, description, start_date, start_time, end_date, end_time, duration, visibility, access_control, allowed_users, status, created_at, updated_at FROM contests';

  if (term) {
    sql += ' WHERE contest_name LIKE ? OR contest_code LIKE ? OR status LIKE ?';
    params.push(`%${term}%`, `%${term}%`, `%${term}%`);
  }

  sql += ' ORDER BY start_date DESC, start_time DESC, id DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getContestById(id) {
  const contestId = parsePositiveId(id, 'contest id');
  const [rows] = await pool.query(
    'SELECT id, contest_name, contest_code, description, start_date, start_time, end_date, end_time, duration, visibility, access_control, allowed_users, status, created_at, updated_at FROM contests WHERE id = ?',
    [contestId]
  );

  if (rows.length === 0) {
    throw new HttpError(404, 'Contest not found');
  }

  const [problemRows] = await pool.query(
    'SELECT p.id, p.title FROM contest_problems cp INNER JOIN problems p ON p.id = cp.problem_id WHERE cp.contest_id = ? ORDER BY cp.id ASC',
    [contestId]
  );

  const [participantRows] = await pool.query(
    'SELECT u.id, u.name, u.email FROM contest_participants cp INNER JOIN users u ON u.id = cp.user_id WHERE cp.contest_id = ? ORDER BY cp.id ASC',
    [contestId]
  );

  return {
    ...rows[0],
    problems: problemRows,
    participants: participantRows,
    leaderboard: participantRows.map((participant, index) => ({
      rank: index + 1,
      name: participant.name,
      score: Math.max(0, 1000 - index * 80)
    }))
  };
}

async function createContest(payload) {
  const contest = normalizeContestPayload(payload);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO contests (contest_name, contest_code, description, start_date, start_time, end_date, end_time, duration, visibility, access_control, allowed_users, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [contest.contestName, contest.contestCode, contest.description, contest.startDate, contest.startTime, contest.endDate, contest.endTime, contest.duration, contest.visibility, contest.accessControl, contest.allowedUsers, contest.status]
    );

    for (const problemId of contest.problemIds) {
      await connection.query(
        'INSERT INTO contest_problems (contest_id, problem_id, source) VALUES (?, ?, ?)',
        [result.insertId, problemId, 'existing']
      );
    }

    await recordLog('Contest', `Created contest #${result.insertId} (${contest.contestName})`, 'Info', connection);

    await connection.commit();

    return getContestById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateContest(id, payload) {
  const contestId = parsePositiveId(id, 'contest id');
  const contest = normalizeContestPayload(payload);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'UPDATE contests SET contest_name = ?, contest_code = ?, description = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?, duration = ?, visibility = ?, access_control = ?, allowed_users = ?, status = ? WHERE id = ?',
      [contest.contestName, contest.contestCode, contest.description, contest.startDate, contest.startTime, contest.endDate, contest.endTime, contest.duration, contest.visibility, contest.accessControl, contest.allowedUsers, contest.status, contestId]
    );

    if (result.affectedRows === 0) {
      throw new HttpError(404, 'Contest not found');
    }

    await connection.query('DELETE FROM contest_problems WHERE contest_id = ?', [contestId]);

    for (const problemId of contest.problemIds) {
      await connection.query(
        'INSERT INTO contest_problems (contest_id, problem_id, source) VALUES (?, ?, ?)',
        [contestId, problemId, 'existing']
      );
    }

    await recordLog('Contest', `Updated contest #${contestId} (${contest.contestName})`, 'Info', connection);

    await connection.commit();

    return getContestById(contestId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function setContestStatus(id, status) {
  const contestId = parsePositiveId(id, 'contest id');
  const nextStatus = normalizeText(status) || 'Upcoming';

  const [result] = await pool.query('UPDATE contests SET status = ? WHERE id = ?', [nextStatus, contestId]);
  if (result.affectedRows === 0) {
    throw new HttpError(404, 'Contest not found');
  }

  await recordLog('Contest', `Set contest #${contestId} status to ${nextStatus}`, 'Warning');

  return getContestById(contestId);
}

async function deleteContest(id) {
  const contestId = parsePositiveId(id, 'contest id');
  const [result] = await pool.query('DELETE FROM contests WHERE id = ?', [contestId]);
  if (result.affectedRows === 0) {
    throw new HttpError(404, 'Contest not found');
  }

  await recordLog('Contest', `Deleted contest #${contestId}`, 'Warning');
  return { deleted: true };
}

async function listAdminProblems() {
  return problemService.getAllProblems();
}

async function getAdminProblemById(id) {
  return problemService.getProblemById(id, undefined, { includeHidden: true });
}

async function createAdminProblem(payload) {
  return problemService.createProblem(payload);
}

async function updateAdminProblem(id, payload) {
  return problemService.updateProblem(id, payload);
}

async function deleteAdminProblem(id) {
  return problemService.deleteProblem(id);
}

module.exports = {
  createAdminProblem,
  createContest,
  createUser,
  deleteAdminProblem,
  deleteContest,
  deleteUser,
  getAdminProblemById,
  getContestById,
  getUserById,
  listAdminProblems,
  listContests,
  listLogs,
  listUsers,
  setContestStatus,
  setUserStatus,
  updateAdminProblem,
  updateContest,
  updateUser
};