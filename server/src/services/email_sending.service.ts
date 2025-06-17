import nodemailer from 'nodemailer';
import { config } from '../config/configuration';
import { EmailData } from '../types';
import { emailQueue } from '../utils/redis';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { createTestEmailService } from '../utils/dev-email-service';

// Check if we should use development email service
const useDevEmailService = process.env.NODE_ENV !== 'production' && process.env.USE_DEV_EMAIL === 'true';

// Emergency override - if we're having issues with the dev email service
const useConsoleLoggingOnly = false; // Set to true to bypass file-based dev emails

interface EmailTransporter {
    sendMail(mailOptions: nodemailer.SendMailOptions): Promise<{response: string}>;
    verify?(callback: (error: Error | null, success: boolean) => void): void;
}

let transporter: EmailTransporter;

if (useConsoleLoggingOnly) {
    console.log('Using console-only email logging (emergency override)');
    transporter = {
        sendMail: async (options: any) => {
            console.log('EMAIL (CONSOLE ONLY):', {
                to: options.to,
                subject: options.subject,
                text: options.text || 'No text content',
                html: options.html ? 'HTML content available, not shown in console' : 'No HTML content'
            });
            return { response: 'console-log-only' };
        }
    };
} else if (useDevEmailService) {
    console.log('Using development email service (emails will be saved to files instead of being sent)');
    try {
        transporter = createTestEmailService();
        console.log('Development email service created successfully');
    } catch (error) {
        console.error('Error creating development email service:', error);
        // Fall back to console logging emails
        transporter = {
            sendMail: async (options: any) => {
                console.log('EMAIL (DEV MODE):', {
                    to: options.to,
                    subject: options.subject,
                    text: options.text || 'No text content',
                    html: options.html ? 'HTML content available, not shown in console' : 'No HTML content'
                });
                return { response: 'dev-mode-console-log' };
            }
        };
    }
} else if (!useConsoleLoggingOnly) {
    // Use real SMTP transport
    console.log('Setting up real SMTP transport with:', {
        service: config.SMTP_SERVICE,
        host: config.SMTP_HOST,
        port: Number(config.SMTP_PORT) || 587,
        user: config.SMTP_USER,
    });
    
    transporter = nodemailer.createTransport({
        service: config.SMTP_SERVICE,
        host: config.SMTP_HOST,
        port: Number(config.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASSWORD,
        },
        // Adding debug to help troubleshoot email issues
        debug: true,
        logger: true,
    });
    
    // Verify connection configuration
    transporter.verify(function(error, success) {
        if (error) {
            console.error('SMTP connection error:', error);
        } else {
            console.log('SMTP server is ready to take our messages');
        }
    });
}
// Helper to compile a Handlebars template
export const compileTemplate = (templateName: string, data: object): string => {
    const filePath = path.join(__dirname, '..', 'views/templates', `${templateName}.html`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Template file ${templateName}.html not found at ${filePath}`);
    }
    const source = fs.readFileSync(filePath, 'utf8');
    const template = handlebars.compile(source);
    return template(data);
};

export const sendEmail = async (data: EmailData) => {
    try {
        await transporter.sendMail({
            from: `"Covo " <${config.SMTP_FROM_USER}>`,
            to: data.to,
            subject: data.subject,
            html: data.html,
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error sending email');
    }
};

emailQueue.process(async (job) => {
    try {
        await sendEmail(job.data);
        console.log(`Email sent to ${job.data.to}`);
    } catch (error) {
        console.error(error);
        throw new Error(`Error sending email: ${error.message}`);
    }
});

export const sendWelcomeEmail = async (to: string, firstName: string) => {
    const htmlContent = compileTemplate('welcome', { firstName: firstName });
    await emailQueue.add({
        from: `"Covo " <${config.SMTP_FROM_USER}>`,
        to,
        subject: 'Welcome to Our Platform!',
        html: htmlContent,
    });
};


export const sendPasswordResetEmail = async (to: string, firstName: string, resetUrl: string) => {
    const htmlContent = compileTemplate('resetPassword', { firstName: firstName, resetUrl: resetUrl });
    await emailQueue.add({
        from: `"Covo " <${config.SMTP_FROM_USER}>`,
        to,
        subject: `Reset Your Password ${firstName}`,
        html: htmlContent,
    });
};



export const sendNotificationEmail = async (
    to: string,
    firstName: string,
    senderName: string,
) => {
    const htmlContent = compileTemplate('notification', { senderName: senderName, firstName: firstName });
    await emailQueue.add({
        from: `"Covo " <${config.SMTP_FROM_USER}>`,
        to,
        subject: `New Notification from ${senderName}`,
        html: htmlContent,
    });
};
