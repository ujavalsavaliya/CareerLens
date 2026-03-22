const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
    if (transporter) return transporter;

    if (!process.env.SMTP_HOST) {
        console.warn('SMTP_HOST not set, email sending disabled.');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    return transporter;
}

async function sendEmail({ to, subject, html }) {
    const tx = getTransporter();
    if (!tx) return;

    await tx.sendMail({
        from: process.env.EMAIL_FROM || '"CareerLens" <no-reply@careerlens.app>',
        to,
        subject,
        html
    });
}

module.exports = { sendEmail };

