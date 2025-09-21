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

export async function sendEmail(message: EmailRequest) {
    try {
        await transporter.sendMail(message);
        return "Email enviado com sucesso";
    } catch (error) {
        return "Erro ao enviar email" + error;
    }
}