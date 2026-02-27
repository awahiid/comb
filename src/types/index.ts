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
    id: number
    name: string
    description: string
    osm: string
    osmNode: string
    lat: number
    long: number
    gmaps: string
    type: string
    location: string
    web: string
    email?: string
    sent?: Date
    status: MailStatus
}