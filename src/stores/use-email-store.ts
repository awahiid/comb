import {create} from "zustand";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {useCompanyStore} from "@/stores/use-company-store";
import {PH_CMP_DESCRIPTION} from "@shared/placeholders";
import {Configuration, SuccessEmailResponse} from "@shared/types";
import {chat} from "@/lib/chat";
import {showAlert} from "@/lib/utils";

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

    setterEmail: <K extends keyof Email>(key: K, value: Email[K]) => void;
    setStatus: (status: EmailStatus) => void;
    addAttachment: (file: File) => void;
    removeAttachment: (id: string) => void;

    generateSubject: (prompt: string) => Promise<void>;
    generateContent: (prompt: string) => Promise<void>;
    send: (config: Configuration, to: string[]) => Promise<SuccessEmailResponse | undefined>;
    reset: () => void;

    generateEmail: () => void;
};

export const useEmailStore = create<EmailState>((set, get) => ({
    subject: "",

    content: "",

    attachments: [],

    status: "idle",

    loadingContent: false,

    loadingSubject: true,

    setterEmail: (key, value) => set({[key]: value}),

    setStatus: (status: EmailStatus) => set({status}),

    addAttachment: file => {
        const attachments = get().attachments;
        const setterEmail =  get().setterEmail;

        if(attachments.find(att => att.id === file.name)) return;

        setterEmail("attachments", [...attachments, {id: file.name, file, previewUrl: URL.createObjectURL(file)}]);
    },

    removeAttachment: id => {
        const attachments = get().attachments;
        const setterEmail =  get().setterEmail;

        setterEmail("attachments", [...attachments.filter((att) => att.id !== id)]);
    },

    generateSubject:  (() => {
        let controller: AbortController | null;

        return async (prompt) => {
            const unsubscribe = useCompanyStore.subscribe((state, prev) => {
                if(prev.id != undefined && state.id != prev.id) {
                    controller?.abort();
                }
            });

            set({loadingSubject: true})
            controller?.abort();
            controller = new AbortController();

            set({subject: ""});
            try {
                for await (const chunk of chat(prompt, controller)) {
                    set({loadingSubject: false});
                    if(!controller.signal.aborted) set({subject: get().subject + chunk});
                }
            } catch (e) {
                showAlert({
                    title: "Error",
                    content: e instanceof Error ? "Unable to generate email content. " + e.message : "Unknown error.",
                    type: "error",
                })
            } finally {
                set({loadingSubject: false})
                unsubscribe();
            }
        }
    })(),

    generateContent: (() => {
        let controller: AbortController | null;

        return async (prompt) => {
            const unsubscribe = useCompanyStore.subscribe((state, prev) => {
                if(prev.id != undefined && state.id != prev.id) {
                    controller?.abort();
                }
            });

            set({loadingContent: true})
            controller?.abort();
            controller = new AbortController();

            set({content: ""});
            try {
                for await (const chunk of chat(prompt, controller)) {
                    set({loadingContent: false});
                    if(!controller.signal.aborted) set({content: get().content + chunk})
                }
            } catch (e) {
                showAlert({
                    title: "Error",
                    content: e instanceof Error ? "Unable to generate email content. " + e.message : "Unknown error.",
                    type: "error",
                })
            } finally {
                set({loadingContent: false})
                unsubscribe();
            }
        }
    })(),

    reset: () => set({subject: "", content: ""}),

    send: async ({user, pass, hostname, port}, to) => {
        set({status: "pending"});
        const {subject, content, attachments} = get()
        if(to.length <= 0 || !subject || !content || !attachments || !user || !pass || !hostname || !port) {
            set({status: "error"});
            showAlert({
                title: "Error",
                content: "Unable to send email. There are some missing or invalid fields.",
                type: "error",
            })
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
            set({status: "error"})
            showAlert({
                title: "Error",
                content: "Unable to send email. Unknown error.",
                type: "error",
            })
            return
        }
    },

    generateEmail: () => {
        const { id, description } = useCompanyStore.getState();
        const auto = useConfigurationStore.getState().config.auto;

        if(!auto || id == undefined || !description) {
            set({content: "", subject: ""});
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

