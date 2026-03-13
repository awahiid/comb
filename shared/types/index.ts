import {WritableKeysOf} from "type-fest";
import {ElectronAPI} from "../../electron/preload";

declare global {
    interface Window {
        electronAPI: ElectronAPI;
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
    requiredAttachment: boolean,
    auto: boolean,
    autoSend: boolean,
    sendIntervalSeconds: number,
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