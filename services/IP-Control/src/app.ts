import express, { Request, Response } from "express";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import { updateDnsRecord } from "./services/dns-update";

const app = express();
const port = 3000;
const email_destino = "walterpotma@gmail.com";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "walter.222brito@gmail.com",
        pass: "ucys jzqn auyk geem",
    },
});

app.get("/", async (req: Request, res: Response) => {
    try {
        const ipv4Response = await fetch("https://api.ipify.org?format=text");
        const ipv6Response = await fetch("https://api64.ipify.org?format=text");

        const ipv4 = (await ipv4Response.text()).trim();
        const ipv6 = (await ipv6Response.text()).trim();

        const message = {
            from: '"IP Notifier - Services"',
            to: `${email_destino}`,
            subject: "🌐 IP Público do Servidor",
            text: `IPv4: ${ipv4}\nIPv6: ${ipv6}`,
            html: `<p><b>IPv4:</b> ${ipv4}</p><p><b>IPv6:</b> ${ipv6}</p>`,
        };
        await transporter.sendMail(message);

        // try {
        //     const result = await updateDnsRecord("crion.dev", "orbit", ipv4);
        //     res.json(result);
        // }
        // catch (error) {
        //     res.json(error);
        // }

        res.json({ success: true, ipv4, ipv6 });
    } catch (error) {
        res.status(500).json({ error: "Erro ao consultar IP público" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta :${port}`);
});