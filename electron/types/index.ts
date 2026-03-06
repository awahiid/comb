export type EmailSendInfo = {
    user: string,
    pass: string
    hostname: string,
    port: string,
    address: string,
    subject: string,
    content: string,
    attachments: {
        filename: string
        content: number[]
    }[]
}