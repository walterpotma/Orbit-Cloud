import { EmailRequest, transporter } from "../models/email";

export async function sendEmail(message: EmailRequest) {
    try {
        await transporter.sendMail(message);
        return "Email enviado com sucesso";
    } catch (error) {
        return "Erro ao enviar email" + error;
    }
}