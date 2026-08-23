const nodemailer = require('nodemailer');

let transporter = null;

// Initialize Transporter if SMTP credentials exist
function initTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
}

async function sendInquiryAlert(messageData) {
  try {
    if (!transporter) {
      initTransporter();
    }

    if (!transporter) {
      console.log('ℹ️  SMTP credentials not configured in .env; skipping email dispatch.');
      return { success: false, message: 'SMTP not configured' };
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'contact@badtameezmusic.com';
    const fromAddress = process.env.SMTP_FROM || `"Badtameez Music Studio" <${process.env.SMTP_USER}>`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0a09; color: #f5f5f4; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #292524;">
        <div style="border-bottom: 2px solid #c8a97e; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #c8a97e; margin: 0; font-size: 22px; letter-spacing: 1px;">BADTAMEEZ MUSIC STUDIO</h2>
          <p style="color: #a8a29e; font-size: 14px; margin: 4px 0 0 0;">New Collaboration / Inquiries Alert</p>
        </div>

        <div style="background-color: #1c1917; padding: 18px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #c8a97e;">
          <p style="margin: 0 0 10px 0;"><strong>Sender Name:</strong> <span style="color: #f5f5f4;">${messageData.name}</span></p>
          <p style="margin: 0 0 10px 0;"><strong>Email Address:</strong> <a href="mailto:${messageData.email}" style="color: #c8a97e; text-decoration: none;">${messageData.email}</a></p>
          <p style="margin: 0 0 10px 0;"><strong>Creative Intent / Service:</strong> <span style="background: #292524; color: #c8a97e; padding: 3px 8px; border-radius: 4px; font-size: 13px;">${messageData.service}</span></p>
          <p style="margin: 0;"><strong>Submitted:</strong> <span style="color: #a8a29e; font-size: 13px;">${new Date().toLocaleString()}</span></p>
        </div>

        <div style="background-color: #171412; padding: 18px; border-radius: 6px; margin-bottom: 24px;">
          <h4 style="color: #c8a97e; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Message:</h4>
          <p style="color: #e7e5e4; line-height: 1.6; margin: 0; white-space: pre-wrap;">${messageData.message}</p>
        </div>

        <div style="text-align: center;">
          <a href="mailto:${messageData.email}?subject=Re: Creative Collaboration / Badtameez Music" style="display: inline-block; background-color: #c8a97e; color: #0c0a09; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 4px; letter-spacing: 0.5px;">Reply Directly to ${messageData.name}</a>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `✨ New Inquiry: ${messageData.name} (${messageData.service})`,
      html: htmlContent
    });

    console.log('📧 Inquiry email notification sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending inquiry email:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendInquiryAlert
};
