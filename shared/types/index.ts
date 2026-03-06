import {WritableKeysOf} from "type-fest";

declare global {
    interface Window {
        electronAPI: {
            serverOnlyOperation: () => Promise<string>,
            askGroq: (key: string, prompt: string) => void,
            onChunk: (cb: (content: string) => void) => void,
            onEnd: (cb: () => void) => void,
            cleanup: () => void,
            scrap: (url: string) => Promise<string>;
            sendEmail: (info: EmailSendInfo) => Promise<SuccessEmailResponse>;
            saveConfig: (config: Configuration) => void;
            loadConfig: () => Promise<Configuration>;
        }
    }
}

export type EmailSendInfo = {
    user: string,
    pass: string
    hostname: string,
    port: string,
    address: string,
    subject: string,
    content: string,
    attachments: {
        filename: string,
        content: number[]
    }[]
}

export type MailStatus = undefined | "sent" | "positive" | "negative"

export type Configuration = {
    groqKey: string;
    user: string,
    pass: string,
    hostname: string,
    port: string,
    contentBasePrompt: string,
    subjectBasePrompt: string,
    descriptionBasePrompt: string,
}

export type SuccessEmailResponse = {
    messageId: string,
    serverResponse: string,
    accepted: string[],
    rejected:string[]
}

export type Company = {
    readonly id: number
    readonly name: string
    description: string
    readonly osm: string
    readonly osmNode: string
    readonly lat: number
    readonly long: number
    readonly gmaps: string
    readonly type: string
    readonly location: string
    readonly web: string
    email?: string
    status: MailStatus
    sentOn?: number
    messageId?: string
}

export type MutableCompany = Pick<Company, WritableKeysOf<Company>>