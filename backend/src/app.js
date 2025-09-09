const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const path = require('path');

const app = express();

// Security & misc middleware
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
// const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
// app.use(cors({
//   origin: (origin, cb) => {
//     if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
//       return cb(null, true);
//     }
//     cb(new Error('Not allowed by CORS'));
//   },
//   credentials: true
// }));

// CORS: Permitir cualquier origen para desarrollo
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); // Permitir cualquier origen
  },
  credentials: true
}));

// Logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api', routes);

// Static assets (avatars, etc.)
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

// 404 and errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
