import { Request, Response } from 'express';
import * as ipService from '../services/ip.service';
import * as emailService from '../services/email.service';

export async function getExternalIp(req: Request, res: Response) {
    try {
        const email_destino = "walterpotma@gmail.com";

        const response = await ipService.getExternalIp();

        const message = {
            from: '"IP Notifier - Services"',
            to: `${email_destino}`,
            subject: "🌐 IP Público do Servidor",
            text: `IPv4: ${response.ipv4}\nIPv6: ${response.ipv6}`,
            html: `<p><b>IPv4:</b> ${response.ipv4}</p><p><b>IPv6:</b> ${response.ipv6}</p>`,
        };

        const emailResponse = await emailService.sendEmail(message);

        res.status(200).json({
            success: true,
            message: emailResponse,
            data: {
                ipv4: response.ipv4,
                ipv6: response.ipv6
            }
        });
    }
    catch (error) {
        return error;
    }
}