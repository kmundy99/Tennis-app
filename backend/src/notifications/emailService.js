const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.log('[EMAIL] Gmail credentials not configured — emails will be skipped');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return transporter;
}

async function sendEmail({ to, subject, html }) {
  try {
    const t = getTransporter();
    if (!t) return;

    await t.sendMail({
      from: `"Tennis App" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error(`[EMAIL] Failed to send "${subject}" to ${to}:`, err.message);
  }
}

module.exports = { sendEmail };
