import { emailQueue } from '../utils/redis';
import fs from 'fs';
import handlebars from 'handlebars';

jest.mock('fs');
jest.mock('handlebars');
jest.mock('nodemailer');
let capturedProcessFn: Function | undefined = undefined;
jest.mock('../utils/redis', () => ({
    emailQueue: {
        add: jest.fn(),
        process: (fn: Function) => {
            capturedProcessFn = fn;
        },
    }
}));

import nodemailer from 'nodemailer';
const mockSendMail = jest.fn();
(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail });

import * as EmailService from '../services/email_sending.service';
import { captureRejections } from 'events';
const { sendWelcomeEmail, sendPasswordResetEmail, sendNotificationEmail } = EmailService;


describe('Email Service', () => {
    const mockTemplate = '<p>Hello {{firstName}}</p>';
    const compiledTemplate = jest.fn().mockReturnValue('<p>Hello John</p>');

    beforeEach(() => {
        jest.clearAllMocks();
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(mockTemplate);
        (handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);
    });

    describe('sendWelcomeEmail', () => {
        it('queues a welcome email with compiled HTML', async () => {
            await sendWelcomeEmail('john@example.com', 'John');
            expect(emailQueue.add).toHaveBeenCalledWith(expect.objectContaining({
                to: 'john@example.com',
                subject: 'Welcome to Our Platform!',
                html: '<p>Hello John</p>',
            }));
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('queues password reset email with link', async () => {
            await sendPasswordResetEmail('john@example.com', 'John', 'https://reset.url');
            expect(emailQueue.add).toHaveBeenCalledWith(expect.objectContaining({
                to: 'john@example.com',
                subject: 'Reset Your Password John',
                html: '<p>Hello John</p>',
            }));
        });
    });

    describe('sendNotificationEmail', () => {
        it('queues notification email from Admin', async () => {
            await sendNotificationEmail('john@example.com', 'John', 'Admin');
            expect(emailQueue.add).toHaveBeenCalledWith(expect.objectContaining({
                to: 'john@example.com',
                subject: 'New Notification from Admin',
                html: '<p>Hello John</p>',
            }));
        });
    });

    describe('sendEmail', () => {
        it('calls nodemailer to send email', async () => {
            mockSendMail.mockResolvedValueOnce({});
            await EmailService.sendEmail({
                to: 'john@example.com',
                subject: 'Test Subject',
                html: '<p>Hello</p>',
                from: 'support@example.com'
            });
            expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
                to: 'john@example.com',
                subject: 'Test Subject',
                html: '<p>Hello</p>'
            }));
        });

        it('throws error on failure', async () => {
            mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));
            await expect(EmailService.sendEmail({
                to: 'fail@example.com',
                subject: 'Fail',
                html: '<p>Fail</p>',
                from: ''
            })).rejects.toThrow('Error sending email');
        });
    });

    describe('compileTemplate', () => {
        it('throws if file does not exist', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            const { compileTemplate } = jest.requireActual('../services/email_sending.service');
            expect(() => compileTemplate('missing', {})).toThrow(/Template file missing.html not found/);
        });

        it('returns compiled HTML from template', () => {
            const { compileTemplate } = jest.requireActual('../services/email_sending.service');
            const result = compileTemplate('template', { firstName: 'John' });
            expect(result).toBe('<p>Hello John</p>');
        });

        it('throws if handlebars.compile fails', () => {
            (handlebars.compile as jest.Mock).mockImplementationOnce(() => { throw new Error('Template error') });
            const { compileTemplate } = jest.requireActual('../services/email_sending.service');
            expect(() => compileTemplate('errorTemplate', {})).toThrow('Template error');
        });
    });

    describe('emailQueue.process', () => {
        const mockJob = {
            data: {
                to: 'john@example.com',
                subject: 'Test Email',
                html: '<p>Hello</p>',
            },
        };

        it('should call sendEmail with job data and log success', async () => {
            const sendEmailSpy = jest.spyOn(EmailService, 'sendEmail').mockResolvedValueOnce();
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

            expect(capturedProcessFn).toBeDefined();
            await capturedProcessFn!(mockJob);

            expect(sendEmailSpy).toHaveBeenCalledWith(mockJob.data);
            expect(logSpy).toHaveBeenCalledWith('Email sent to john@example.com');
        });

        it('should catch error and throw new error if sendEmail fails', async () => {
            const error = new Error('SMTP failure');
            const sendEmailSpy = jest.spyOn(EmailService, 'sendEmail').mockRejectedValueOnce(error);
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            expect(capturedProcessFn).toBeDefined();
            await expect(capturedProcessFn!(mockJob)).rejects.toThrow('Error sending email: SMTP failure');

            expect(sendEmailSpy).toHaveBeenCalledWith(mockJob.data);
            expect(errorSpy).toHaveBeenCalledWith(error);
        });
    });
});