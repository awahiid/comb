import {create} from "zustand";
import {chat} from "@/lib/utils";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {useCompanyStore} from "@/stores/use-company-store";
import {PH_CMP_DESCRIPTION} from "@shared/placeholders";
import {Configuration, SuccessEmailResponse} from "@shared/types";

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
    loadingContent: boolean;
    loadingSubject: boolean;

    setEmail: <K extends keyof Email>(key: K, value: Email[K]) => void;
    setStatus: (status: EmailStatus) => void;
    addAttachment: (file: File) => void;
    removeAttachment: (id: string) => void;

    generateSubject: (prompt: string) => Promise<void>;
    generateContent: (prompt: string) => Promise<void>;
    send: (config: Configuration, to: string[]) => Promise<SuccessEmailResponse | undefined>;

    generateEmail: () => void;
};

export const useEmailStore = create<EmailState>((set, get) => ({
    subject: "",

    content: "",

    attachments: [],

    status: "idle",

    loadingContent: false,

    loadingSubject: true,

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

    generateSubject:  (() => {
        let controller: AbortController | null;

        return async (prompt) => {
            set({loadingSubject: true})
            controller?.abort();
            controller = new AbortController();

            set({subject: ""});

            for await (const chunk of chat(prompt, controller)) {
                set({loadingSubject: false});
                if(!controller.signal.aborted) set({subject: get().subject + chunk});
            }
        }
    })(),

    generateContent: (() => {
        let controller: AbortController | null;

        return async (prompt) => {
            set({loadingContent: true})
            controller?.abort();
            controller = new AbortController();

            set({content: ""});

            for await (const chunk of chat(prompt, controller)) {
                set({loadingContent: false});
                if(!controller.signal.aborted) set({content: get().content + chunk})
            }
        }
    })(),

    send: async ({user, pass, hostname, port}, to) => {
        set({status: "pending"});
        const {subject, content, attachments} = get()
        if(to.length <= 0 || !subject || !content || !attachments || !user || !pass || !hostname || !port) {
            set({status: "error"});
            return;
        }

        try {
            const data = {
                user,
                pass,
                hostname,
                port,
                address: to[0],
                subject,
                content,
                attachments: await Promise.all(attachments.map(async (attachment) => ({
                    filename: attachment.file.name,
                    content: Array.from(new Uint8Array(await attachment.file.arrayBuffer()))
                })))
            }

            const response = await window.electronAPI.sendEmail(data)

            set({status: "success"})
            return response;
        } catch (e) {
            console.error(e);
            set({status: "error"})
            return
        }
    },

    generateEmail: () => {
        const { id, description } = useCompanyStore.getState();

        if(id == undefined || !description) {
            set({content: "No description yet", subject: "No description yet"});
            return;
        }

        const {contentBasePrompt, subjectBasePrompt} = useConfigurationStore.getState().config;

        const { generateSubject, generateContent } = get()

        const contentPrompt = contentBasePrompt.replace(PH_CMP_DESCRIPTION, description);
        const subjectPrompt = subjectBasePrompt.replace(PH_CMP_DESCRIPTION, description);

        generateSubject(subjectPrompt)
        generateContent(contentPrompt)
    }
}));

