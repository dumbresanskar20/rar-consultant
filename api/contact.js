import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { fullName, email, mobile, service, message } = req.body || {};

    if (!fullName || !email || !mobile || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fullName, email, mobile, and message are required.',
      });
    }

    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'dumbresanskar23@gmail.com';
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const recipient = process.env.ENQUIRY_RECIPIENT || 'dumbresanskar23@gmail.com';

    if (!smtpPass) {
      console.warn('SMTP_PASS is not configured in environment variables.');
      return res.status(500).json({
        success: false,
        reason: 'missing-smtp-password',
        message: 'Server mailer is not configured. Please set SMTP_PASS (Gmail App Password) in Vercel Environment Variables.',
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587
      auth: {
        user: smtpUser,
        pass: smtpPass.replace(/\s+/g, ''), // strip any spaces in app password
      },
    });

    const mailOptions = {
      from: `"RAR Consultant Website" <${smtpUser}>`,
      to: recipient,
      replyTo: email,
      subject: `New Enquiry from ${fullName} – ${service || 'General'} | RAR Consultant`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1a202c;">
          <div style="border-bottom: 2px solid #ff1a1a; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #0b1133; margin: 0 0 6px 0; font-size: 22px;">New Client Enquiry</h2>
            <p style="color: #718096; margin: 0; font-size: 14px;">Submitted via RAR Consultant website contact form</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096; width: 140px;"><strong>Client Name:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #2d3748; font-weight: 600;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096;"><strong>Mobile Number:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #2d3748;">
                <a href="tel:${mobile}" style="color: #ff1a1a; text-decoration: none; font-weight: 600;">${mobile}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096;"><strong>Email Address:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #2d3748;">
                <a href="mailto:${email}" style="color: #ff1a1a; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #718096;"><strong>Selected Service:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; color: #2d3748;">${service || 'General Enquiry'}</td>
            </tr>
          </table>

          <div style="background: #f7fafc; border-left: 4px solid #ff1a1a; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <strong style="display: block; color: #2d3748; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Enquiry Message:</strong>
            <p style="margin: 0; color: #4a5568; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${message}</p>
          </div>

          <div style="border-top: 1px solid #edf2f7; padding-top: 14px; font-size: 12px; color: #a0aec0; text-align: center;">
            <p style="margin: 0;">Sent directly from RAR Consultant Website · Hosted on Vercel</p>
          </div>
        </div>
      `,
      text: `New Enquiry from ${fullName}\n\nMobile: ${mobile}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Enquiry sent successfully' });
  } catch (error) {
    console.error('Nodemailer sending error:', error);
    return res.status(500).json({
      success: false,
      reason: 'smtp-error',
      message: error.message || 'Failed to send email via SMTP',
    });
  }
}

