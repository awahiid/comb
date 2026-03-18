import {WritableKeysOf} from "type-fest";

export type SentEmail = {
    id: number;
    subject: string;
    date: Date | undefined;
}

export type GetEmailConfig = {
    user: string,
    pass: string
    hostname: string,
    IMAPPort: string
}

export type GetEmailDTO = {
    address: string
}

export type PostEmailConfig = {
    user: string,
    pass: string
    hostname: string,
    SMTPPort: string
}

export type PostEmailDTO = {
    address: string,
    subject: string,
    content: string,
    attachments: {
        filename: string,
        content: number[]
    }[]
}

export const BASE_URLS = {
    openai:     undefined,
    groq:       "https://api.groq.com/openai/v1",
    github:     "https://models.inference.ai.azure.com",
    ollama:     "http://localhost:11434/v1",
    openrouter: "https://openrouter.ai/api/v1",
    deepseek:   "https://api.deepseek.com/v1",
} as const;

export const KEY_TYPES = Object.keys(BASE_URLS) as (keyof typeof BASE_URLS)[];

export type KeyType = keyof typeof BASE_URLS;

export type Configuration = {
    key: string;
    keyType: KeyType;
    model: string;
    user: string,
    pass: string,
    hostname: string,
    SMTPPort: string,
    IMAPPort: string,
    requiredAttachment: boolean,
    contentBasePrompt: string,
    subjectBasePrompt: string,
    descriptionBasePrompt: string,
}

export type SuccessSendEmailResponse = {
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
    email: string | undefined,
    sentEmails: SentEmail[]
}

export type MutableCompany = Pick<Company, WritableKeysOf<Company>>