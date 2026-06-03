/**
 * server.js — Express backend for the portfolio contact workflow.
 * Handles validation, rate limiting, email delivery (Nodemailer / Gmail SMTP)
 * and message persistence.
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const contactRoutes = require('./routes/contact.routes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- Security & middleware ---------- */
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (curl, mobile apps, same-origin)
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['POST', 'GET'],
  })
);

/* ---------- Rate limiting ---------- */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 submissions per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/* ---------- Routes ---------- */
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/contact', contactLimiter, contactRoutes);

/* ---------- 404 + error handling ---------- */
app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;
