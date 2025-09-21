import nodemailer from "nodemailer";
import { EmailRequest } from "../models/email";
import { Request, Response } from "express";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "walter.222brito@gmail.com",
        pass: "ucys jzqn auyk geem",
    },
});

export async function sendEmail(req: Request, res: Response, message: EmailRequest) {
    try {
        await transporter.sendMail(message);
        res.json({ success: true, message: "Email enviado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao enviar email" });
    }
}