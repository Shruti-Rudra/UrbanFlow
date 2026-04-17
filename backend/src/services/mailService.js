const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  // Note: In a real app, you would use service like SendGrid, Mailgun or Gmail
  // For now, we use a development-friendly config that logs to console if no SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'UrbanFlow Transit'} <${process.env.FROM_EMAIL || 'noreply@urbanflow.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">UrbanFlow Authentication</h2>
        <p>${options.message}</p>
        <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
          ${options.otp}
        </div>
        <p style="font-size: 12px; color: #666;">This OTP will expire in 10 minutes.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.log('Email delivery failed - displaying OTP in console for development:');
    console.log(`>>> OTP for ${options.email}: ${options.otp} <<<`);
  }
};

module.exports = sendEmail;
