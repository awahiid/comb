import nodemailer from "nodemailer"

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