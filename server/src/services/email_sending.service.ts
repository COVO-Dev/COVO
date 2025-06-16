import nodemailer from 'nodemailer';
import { config } from '../config/configuration';
import { EmailData } from '../types';
import { emailQueue } from '../utils/redis';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

const transporter = nodemailer.createTransport({
    service: config.SMTP_SERVICE,
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false,
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASSWORD,
    },
});

// Helper to compile a Handlebars template
const compileTemplate = (templateName: string, data: object): string => {
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
