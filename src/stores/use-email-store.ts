import {create} from "zustand";
import {chat} from "@/lib/utils";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {Configuration, SuccessEmailResponse} from "@/types";
import {useCompanyStore} from "@/stores/use-company-store";

type Attachment = {
    id: string;
    file: File;
    previewUrl?: string;
};

type EmailStatus = "idle" | "pending" | "success" | "error"

type Email = {
    subject: string;
    content: string;
    attachments: Attachment[];
}

type EmailState = Email & {
    status: EmailStatus;

    setEmail: <K extends keyof Email>(key: K, value: Email[K]) => void;
    setStatus: (status: EmailStatus) => void;
    addAttachment: (file: File) => void;
    removeAttachment: (id: string) => void;

    generateSubject: (prompt: string) => Promise<void>;
    generateContent: (prompt: string) => Promise<void>;
    send: (config: Configuration, to: string[]) => Promise<SuccessEmailResponse | undefined>;

    init: () => Promise<void>;
};

export const useEmailStore = create<EmailState>((set, get) => ({
    subject: "",

    content: "",

    attachments: [],

    status: "idle",

    setEmail: (key, value) => set({[key]: value}),

    setStatus: (status: EmailStatus) => set({status}),

    addAttachment: file => {
        const attachments = get().attachments;
        const set =  get().setEmail;

        if(attachments.find(att => att.id === file.name)) return;

        set("attachments", [...attachments, {id: file.name, file, previewUrl: URL.createObjectURL(file)}]);
    },

    removeAttachment: id => {
        const attachments = get().attachments;
        const setEmail =  get().setEmail;

        setEmail("attachments", [...attachments.filter((att) => att.id !== id)]);
    },

    generateSubject: async (prompt): Promise<void> => {
        set({subject: ""});

        for await (const chunk of chat(prompt)) {
            set({subject: get().subject + chunk});
        }
    },

    generateContent: async (prompt) => {
        set({content: ""});

        for await (const chunk of chat(prompt)) {
            set({content: get().content + chunk});
        }
    },

    send: async ({user, pass, hostname, port}, to) => {
        set({status: "pending"});
        const {subject, content, attachments} = get()
        if(to.length <= 0 || !subject || !content || !attachments || !user || !pass || !hostname || !port) {
            set({status: "error"});
            return;
        }

        const formData = new FormData()

        formData.append("user", user)
        formData.append("pass", pass)
        formData.append("hostname", hostname)
        formData.append("port", port)
        formData.append("subject", subject)
        formData.append("content", content)

        to.forEach(address => {
            formData.append("to", address)
        })

        attachments.forEach(a => {
            formData.append("attachments", a.file)
        })

        const res = await fetch("/api/email", {
            method: "POST",
            body: formData
        })

        if(!res.ok) {
            set({status: "error"})
            return
        }

        const info = await res.json() as SuccessEmailResponse
        set({status: "success"})
        return info;
    },

    init: async () => {
        const company = useCompanyStore.getState().company;
        if(!company?.description) return;
        const {contentBasePrompt, subjectBasePrompt} = useConfigurationStore.getState().config;

        const { generateSubject, generateContent } = get()

        const contentPrompt = contentBasePrompt.replace("%companyDescription%", company.description);
        const subjectPrompt = subjectBasePrompt.replace("%companyDescription%", company.description);

        await generateSubject(subjectPrompt)
        await generateContent(contentPrompt)
    }
}));

