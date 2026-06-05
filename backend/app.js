const express = require('express');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoutes');
const problemRoutes = require('./routes/problemRoutes');
const executionRoutes = require('./routes/executionRoutes');
const HttpError = require('./utils/httpError');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

app.use('/api/problems', problemRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', executionRoutes);

app.use((req, res, next) => {
  next(new HttpError(404, 'Route not found'));
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'Internal Server Error'
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== 'production' && error.stack) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
});

module.exports = app;
