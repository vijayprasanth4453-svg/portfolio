/**
 * contact.controller.js — handles email delivery and message persistence.
 */
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const STORE_PATH = path.join(__dirname, '..', 'data', 'messages.json');

/* ---------- Transport ---------- */
function createTransporter() {
  // Gmail SMTP using an App Password (recommended) or full SMTP config.
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

/* ---------- Persistence ---------- */
function storeMessage(entry) {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let list = [];
    if (fs.existsSync(STORE_PATH)) {
      list = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8') || '[]');
    }
    list.push(entry);
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2));
  } catch (err) {
    console.error('Failed to store message:', err.message);
  }
}

/* ---------- Email templates ---------- */
function ownerEmail({ name, email, subject, message }) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;background:#0b1120;color:#fff;border-radius:14px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#3B82F6,#8B5CF6,#06B6D4);padding:22px 26px">
      <h2 style="margin:0;font-size:20px">New Portfolio Message</h2>
    </div>
    <div style="padding:26px">
      <p style="margin:0 0 6px"><strong>Name:</strong> ${name}</p>
      <p style="margin:0 0 6px"><strong>Email:</strong> ${email}</p>
      <p style="margin:0 0 6px"><strong>Subject:</strong> ${subject}</p>
      <p style="margin:16px 0 6px"><strong>Message:</strong></p>
      <p style="margin:0;color:#cbd5e1;line-height:1.6">${message.replace(/\n/g, '<br>')}</p>
    </div>
  </div>`;
}

function autoReplyEmail({ name }) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;background:#0b1120;color:#fff;border-radius:14px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#3B82F6,#8B5CF6,#06B6D4);padding:22px 26px">
      <h2 style="margin:0;font-size:20px">Thanks for reaching out!</h2>
    </div>
    <div style="padding:26px;color:#cbd5e1;line-height:1.6">
      <p>Hi ${name},</p>
      <p>Thank you for your message. I've received it and will get back to you within 24 hours.</p>
      <p>Best regards,<br><strong style="color:#fff">V. Vijayprasanth</strong><br>Full Stack Developer</p>
    </div>
  </div>`;
}

/* ---------- Controller ---------- */
async function submitContact(req, res) {
  const { name, email, subject, message } = req.contact;

  // Persist first so no message is lost even if email fails.
  storeMessage({
    name, email, subject, message,
    ip: req.ip,
    receivedAt: new Date().toISOString(),
  });

  try {
    const transporter = createTransporter();
    const fromAddr = process.env.GMAIL_USER || process.env.SMTP_USER;
    const toAddr = process.env.CONTACT_RECEIVER || fromAddr;

    // 1) Notify the owner
    await transporter.sendMail({
      from: `"Portfolio Contact" <${fromAddr}>`,
      to: toAddr,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: ownerEmail({ name, email, subject, message }),
    });

    // 2) Auto-reply to the sender
    await transporter.sendMail({
      from: `"V. Vijayprasanth" <${fromAddr}>`,
      to: email,
      subject: 'Thanks for contacting V. Vijayprasanth',
      html: autoReplyEmail({ name }),
    });

    return res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Email error:', err.message);
    // Message is already stored; report graceful failure.
    return res.status(502).json({
      success: false,
      message: 'Message saved but email delivery failed. I will still see it.',
    });
  }
}

module.exports = { submitContact };
