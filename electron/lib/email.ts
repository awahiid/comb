import nodemailer from "nodemailer";
import {EmailSendInfo} from "../../shared/types";

export default async function sendEmail({ user, pass, hostname, port, address, subject, content, attachments}: EmailSendInfo) {
    const transporter = nodemailer.createTransport({
        host: hostname,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false
        }
    })

    const info = await transporter.sendMail({
        from: user,
        to: address,
        subject,
        text: content,
        attachments: await Promise.all(attachments.map(async attachment => ({
            filename: attachment.filename,
            content: Buffer.from(attachment.content),
        })))
    })

    if (info.accepted.length === 0) {
        throw new Error("Email sent failed.")
    }

    return {
        messageId: info.messageId,
        serverResponse: info.response,
        accepted: info.accepted,
        rejected: info.rejected
    }
}