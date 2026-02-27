import nodemailer from "nodemailer"
import { ImapFlow } from "imapflow";

export async function POST(req: Request) {
    const formData = await req.formData()

    const user = formData.get("user") as string
    const pass = formData.get("pass") as string
    const hostname = formData.get("hostname") as string
    const port = formData.get("port") as string
    const address = formData.get("to") as string
    const subject = formData.get("subject") as string
    const content = formData.get("content") as string

    const files = formData.getAll("attachments") as File[]

    console.log(address)

    const attachments = await Promise.all(
        files.map(async (file) => {
            const buffer = Buffer.from(await file.arrayBuffer())
            return {
                filename: file.name,
                content: buffer
            }
        })
    )

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
        attachments
    })

    if (info.accepted.length === 0) {
        return new Response(JSON.stringify({
            error: "Email not sent",
            serverResponse: info.response
        }), { status: 500 })
    }

    return new Response(JSON.stringify({
        messageId: info.messageId,
        serverResponse: info.response,
        accepted: info.accepted,
        rejected: info.rejected
    }), { status: 200 })
}

export async function GET(req: Request) {
    const formData = await req.formData();

    const user = formData.get("user") as string;
    const pass = formData.get("pass") as string;
    const hostname = formData.get("hostname") as string;
    const port = Number(formData.get("port") as string);
    const messageId = formData.get("messageId") as string;

    const client = new ImapFlow({
        host: hostname,
        port,
        secure: true,
        auth: { user, pass }
    });

    await client.connect();
    await client.mailboxOpen("INBOX");

    // for await (const msg of client.fetch(
    //     { header: { messageId } },
    //     { source: true, uid: true }
    // )) {
    //     const parsed = simpleParser(msg.source);
    //     await client.logout();
    //
    //     return new Response(JSON.stringify({
    //         uid: msg.uid,
    //         subject: parsed.subject,
    //         from: parsed.from?.text,
    //         date: parsed.date,
    //         text: parsed.text
    //     }), { headers: { "Content-Type": "application/json" }});
    // }
    //
    // await client.logout();
    // return new Response("Message not found", { status: 404 });
}