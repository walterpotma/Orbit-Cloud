export type EmailRequest = {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
};