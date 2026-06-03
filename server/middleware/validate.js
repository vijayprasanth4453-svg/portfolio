/**
 * validate.js — input validation & sanitization middleware.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function validateContact(req, res, next) {
  const body = req.body || {};

  // Honeypot: bots fill the hidden "company" field.
  if (body.company) {
    return res.status(200).json({ success: true, message: 'Message received.' });
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const subject = (body.subject || '').trim();
  const message = (body.message || '').trim();

  const errors = [];
  if (name.length < 2 || name.length > 100) errors.push('Invalid name.');
  if (!EMAIL_RE.test(email) || email.length > 150) errors.push('Invalid email.');
  if (subject.length < 3 || subject.length > 150) errors.push('Invalid subject.');
  if (message.length < 10 || message.length > 5000) errors.push('Invalid message.');

  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  // Attach sanitized values for downstream use.
  req.contact = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject),
    message: escapeHtml(message),
  };

  next();
}

module.exports = { validateContact, escapeHtml };
