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
    sent?: Date
    status: MailStatus
}