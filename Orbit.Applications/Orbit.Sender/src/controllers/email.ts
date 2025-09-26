import { Request, Response } from 'express';
import * as emailService from '../services/email';

export async function SendEmail(req: Request, res: Response) {
    try {
        const { destination, subject, text, html } = req.body;

        const message = {
            from: '"Orbit - Services"',
            to: destination,
            subject: subject,
            text: text,
            html: html,
        };

        const emailResponse = await emailService.sendEmail(message);
        res.status(200).json({
            success: true,
            message: emailResponse,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error,
        });
    }
}