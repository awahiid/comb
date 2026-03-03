import nodemailer from "nodemailer"
import { ImapFlow, SearchObject } from "imapflow";
import { simpleParser } from "mailparser";
import {Email} from "@/types";
import {normalizeAddresses} from "@/lib/utils";

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

export async function PUT(req: Request) {
    const formData = await req.formData();

    const user = formData.get("user") as string;
    const pass = formData.get("pass") as string;
    const hostname = formData.get("hostname") as string;
    const port = Number(formData.get("port") as string);
    const addresses = formData.getAll("addresses") as string[];

    const client = new ImapFlow({
        host: hostname,
        port,
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        logger: false
    });

    await client.connect();
    const lock = await client.getMailboxLock('All Mail');

    try {
        if(!addresses.length) return new Response("No addresses provided.", { status: 400 })

        let query: SearchObject | null = null;
        for (const address of addresses) {
            const pair: SearchObject = { or: [{ from: address }, { to: address }] };
            query = query ? { or: [query, pair] } : pair;
        }

        console.log(query);

        const uids = await client.search({ or: [{ to: addresses[0] }] });

        if(!uids) return new Response("No messages found.", { status: 204 })

        const emails: Email[] = []

        const messages = await client.fetchAll(uids, { source: true });

        for (const msg of messages) {
            if (!msg.source) continue;
            const parsed = await simpleParser(msg.source);
            const email: Email = {
                id: parsed.messageId,
                subject: parsed.subject,
                from: parsed.from?.text,
                to: normalizeAddresses(parsed.to),
                date: parsed.date,
                content: parsed.text
            };

            emails.push(email);
        }

        return Response.json(emails);
    } finally {
        await client.logout();
        lock.release();
    }
}



