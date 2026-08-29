import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Lazy loads and returns the configured nodemailer transporter.
 * If SMTP credentials are missing, it initializes a temporary Ethereal test account.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    console.log('📬 Initializing SMTP Mail Transporter with environment credentials...');
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    console.log('⚠️ SMTP_USER or SMTP_PASS not set. Initializing fallback Ethereal Mock SMTP...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`ℹ️ Ethereal Mock Mailbox created! User: ${testAccount.user}`);
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (err) {
      console.error('❌ Failed to create Ethereal mock email account, using console logging fallback:', err.message);
      // Absolute fallback transporter that just logs to console
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('🖨️ [Console Email Fallback] Mail options:');
          console.log(JSON.stringify(mailOptions, null, 2));
          return { messageId: `console_mock_${Date.now()}` };
        }
      };
    }
  }
  return transporter;
}

/**
 * Sends a complaint registration confirmation email to the farmer.
 */
export async function sendTicketConfirmationEmail({ to, name, ticketId, productModel, description }) {
  try {
    const client = await getTransporter();
    const from = process.env.SMTP_FROM || 'Smart Irrigation Support <no-reply@smartirrigation.com>';

    const plainText = `Dear ${name},

Your complaint has been successfully registered.

Ticket ID: ${ticketId}
Product: ${productModel}
Issue: ${description}

Our support team will contact you shortly by phone.

Thank you,
Smart Irrigation Support Team`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1f2937;">
        <div style="background-color: #059669; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-weight: 800; tracking-wide: 0.05em;">SMART IRRIGATION SUPPORT</h2>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; margin-top: 0;">Dear <strong>${name}</strong>,</p>
          <p>Your complaint has been successfully registered in our system.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #4b5563; width: 120px;">Ticket ID:</td>
                <td style="padding: 6px 0; font-family: monospace; font-weight: 800; color: #047857; font-size: 15px;">${ticketId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #4b5563;">Product:</td>
                <td style="padding: 6px 0; color: #111827;">${productModel}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #4b5563; vertical-align: top;">Issue:</td>
                <td style="padding: 6px 0; color: #111827; white-space: pre-wrap;">${description}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #374151;">Our support team will contact you shortly by phone to resolve your issue.</p>
          <p style="margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 15px; color: #6b7280; font-size: 14px;">
            Thank you,<br />
            <strong>Smart Irrigation Support Team</strong>
          </p>
        </div>
      </div>
    `;

    const info = await client.sendMail({
      from,
      to,
      subject: 'Smart Irrigation - Complaint Registered',
      text: plainText,
      html: htmlContent
    });

    console.log(`📧 Sent confirmation email to ${to}. Message ID: ${info.messageId}`);
    
    // Get mock inbox preview url if Ethereal transport is active
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Ethereal preview link: ${previewUrl}`);
    }
    
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`❌ Failed to send confirmation email to ${to}:`, error);
    return { success: false, error: error.message };
  }
}
