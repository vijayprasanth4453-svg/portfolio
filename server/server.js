/**
 * server.js — Express backend for the portfolio contact workflow.
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const contactRoutes = require('./routes/contact.routes');
const { isEmailConfigured } = require('./controllers/contact.controller');

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// Required on Render — sits behind a reverse proxy (fixes rate-limit X-Forwarded-For error)
app.set('trust proxy', 1);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(express.json({ limit: '10kb' }));

app.use(
  cors({
    origin: isDev
      ? true
      : (origin, cb) => {
          if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return cb(null, true);
          }
          return cb(new Error('Not allowed by CORS'));
        },
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    emailConfigured: isEmailConfigured(),
  });
});

app.use('/api/contact', contactLimiter, contactRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  if (isDev) console.log('   CORS: all origins allowed (development mode)');
  else console.log(`   CORS: ${allowedOrigins.join(', ') || 'all origins'}`);
  if (isEmailConfigured()) {
    console.log('📧 Email delivery: configured');
  } else {
    console.warn('⚠️  Email delivery: NOT configured — set GMAIL_APP_PASSWORD in server/.env');
  }
});

module.exports = app;
