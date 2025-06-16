import nodemailer from 'nodemailer';
import { config } from '../config/configuration';
import { EmailData } from '../types';
import fs from 'fs';
import path from 'path';

/**
 * Development email service that saves emails to the file system
 * instead of sending them via SMTP. This is useful for testing
 * without having to set up a real email account.
 */
function createTestEmailService() {
  // Create a directory for test emails if it doesn't exist
  const emailDir = path.join(process.cwd(), 'dev-emails');
  if (!fs.existsSync(emailDir)) {
    fs.mkdirSync(emailDir, { recursive: true });
  }

  return {
    async sendMail(mailOptions: any) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}-${mailOptions.to}.html`;
      const filePath = path.join(emailDir, filename);
      
      const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Development Email: ${mailOptions.subject}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .email-container { border: 1px solid #ddd; padding: 20px; max-width: 600px; margin: 0 auto; }
            .header { background: #f8f9fa; padding: 10px; margin-bottom: 20px; }
            .content { padding: 10px 0; }
            .footer { font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <strong>From:</strong> ${mailOptions.from}<br>
              <strong>To:</strong> ${mailOptions.to}<br>
              <strong>Subject:</strong> ${mailOptions.subject}<br>
              <strong>Date:</strong> ${new Date().toLocaleString()}
            </div>
            <div class="content">
              ${mailOptions.html}
            </div>
            <div class="footer">
              This is a development email saved to the filesystem. No actual email was sent.
            </div>
          </div>
        </body>
      </html>
      `;
      
      fs.writeFileSync(filePath, emailContent);
      console.log(`Development email saved to: ${filePath}`);
      
      // Return a successful result
      return {
        accepted: [mailOptions.to],
        rejected: [],
        response: 'Development mode - Email saved to file system',
        messageId: `dev-${timestamp}`,
      };
    }
  };
};

// Export the function
export { createTestEmailService };
