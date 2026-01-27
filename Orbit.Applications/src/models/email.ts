import nodemailer from "nodemailer";

export type EmailRequest = {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
};

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "walter.222brito@gmail.com",
        pass: "ucys jzqn auyk geem",
    },
});