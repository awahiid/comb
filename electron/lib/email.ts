import nodemailer from "nodemailer";
import {GetEmailConfig, GetEmailDTO, PostEmailConfig, PostEmailDTO, SentEmail} from "../../shared/types";
import {ImapFlow} from "imapflow";

export async function getEmails({user, pass, hostname, IMAPPort, address}: GetEmailConfig & GetEmailDTO): Promise<SentEmail[]> {
    const client = new ImapFlow({
        host: hostname,
        port: Number(IMAPPort),
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
    });

    await client.connect();

    const mailboxes = await client.list()
    const sent = mailboxes.find(m => m.specialUse === '\\Sent');
    if (!sent) throw new Error("Sent folder not found");

    const lock = await client.getMailboxLock(sent.path);

    try {
        const uids = await client.search({ to: address }, { uid: true });
        if (!uids || !uids.length) return [];

        const messages = await client.fetchAll(uids, { envelope: true }, { uid: true });
        return messages
            .filter((m): m is typeof m & { envelope: NonNullable<typeof m.envelope> } => !!m.envelope)
            .map(m => ({
                id: m.uid,
                subject: m.envelope.subject ?? "(no subject)",
                date: m.envelope.date,
            }));
    } finally {
        lock.release();
        await client.logout();
    }
}

export default async function sendEmail({ user, pass, hostname, SMTPPort, address, subject, content, attachments}: PostEmailConfig & PostEmailDTO) {
    const transporter = nodemailer.createTransport({
        host: hostname,
        port: Number(SMTPPort),
        secure: Number(SMTPPort) === 465,
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