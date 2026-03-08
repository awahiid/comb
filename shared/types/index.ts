import {WritableKeysOf} from "type-fest";

declare global {
    interface Window {
        electronAPI: {
            askGroq: (key: string, model: string, prompt: string, id: string) => void,
            onChunk: (id: string, cb: (content: string) => void) => void,
            onError: (id: string, cb: (error: string) => void) => void,
            onEnd: (id: string, cb: () => void) => void,
            cleanup: (id: string) => void,
            scrap: (url: string, id: string) => Promise<string>;
            cancelScrap: (id: string) => Promise<string>;
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
    model: string;
    user: string,
    pass: string,
    hostname: string,
    port: string,
    auto: boolean,
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
    description: string | undefined
    readonly osm: string
    readonly osmNode: string
    readonly lat: number
    readonly long: number
    readonly gmaps: string
    readonly type: string
    readonly location: string
    readonly web: string
    email: string | undefined
}

export type MutableCompany = Pick<Company, WritableKeysOf<Company>>

type ToastTypes = "normal" | "action" | "success" | "info" | "warning" | "error" | "loading" | "default"

export type Alert = {
    toasterId?: string;
    title: string;
    content: string;
    type?: ToastTypes;
};