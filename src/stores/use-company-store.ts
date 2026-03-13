import { create } from "zustand";
import {Company} from "@shared/types";

import {PH_CMP_SCRAP} from "@shared/placeholders";
import {WritableKeysOf} from "type-fest";
import {useDataStore} from "@/stores/use-data-store";
import {chat} from "@/lib/chat";
import {emailRegex, extractEmails, showAlert, sleep} from "@/lib/utils";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {useEmailStore} from "@/stores/use-email-store";

type CompanyState = Partial<Company> & {
    emailDraft: string | undefined;
    descriptionDraft: string | undefined;
    loadingDescription: boolean;
    descriptionStatus: string;
    setEmailDraft: (emailDraft: string | undefined) => void;
    setDescriptionDraft: (descriptionDraft: string | undefined) => void;

    set: <K extends WritableKeysOf<Company>>(key: K, value: Company[K]) => void;
    generateDescription: (prompt: string) => Promise<void>;
    setCompany: (company: Company) => void;
};

const getAddress = (saved: string | undefined, description: string | undefined)=> {
    return saved?.match(emailRegex) ? saved : (extractEmails(description ?? "")[0] ?? saved);
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
    emailDraft: undefined,

    descriptionDraft: undefined,

    loadingDescription: false,

    descriptionStatus: "",

    setEmailDraft: emailDraft => set({emailDraft}),

    setDescriptionDraft: descriptionDraft => set({descriptionDraft}),

    setCompany: async (company: Company) => {
        set({
            ...company,
            emailDraft: company.email,
            descriptionDraft: company.description,
            loadingDescription: false,
            email: company.email,
            description: company.description
        })

        const config = useConfigurationStore.getState().config;
        useEmailStore.getState().reset();

        if (config.auto) {
            if(!company.description) {
                await get().generateDescription(config.descriptionBasePrompt);
                const { descriptionDraft } = get();

                set({emailDraft: getAddress(company.email, descriptionDraft)});
                get().set("description", descriptionDraft);
                get().set("email", getAddress(company.email, descriptionDraft));
            }

            const isLast = company.id === useDataStore.getState().companies.at(-1)?.id;
            if (!isLast && config.autoSend) {
                if (get().email) {
                    await useEmailStore.getState().generateEmail();
                    await useEmailStore.getState().send(config, [get().email!]);
                    await sleep(config.sendIntervalSeconds * 1000);
                }

                useDataStore.getState().moveToCompany(1);
            } else {
                useEmailStore.getState().generateEmail();
            }
        }
    },

    set: (k, v) => {
        const id = get().id;
        if(id == undefined) return;
        useDataStore.getState().updateCompany(id, {[k]: v});
        set({[k]: v});

        if(k === "description" && get().email == undefined && get().emailDraft == undefined) {
            set({emailDraft: getAddress(get().email, v)});
        }
    },

    generateDescription: async (prompt: string) => {
        const {id, web} = get();
        if (id == undefined || !web) return;

        const controller = new AbortController();

        const unsubscribe = useCompanyStore.subscribe((state, prev) => {
            if (prev.id != undefined && state.id != prev.id) {
                controller.abort();
                window.electronAPI.cancelScrap(id.toString());
            }
        });

        try {
            set({descriptionStatus: "Scraping web..."})
            set({loadingDescription: true})
            const scrapedText = await window.electronAPI.scrap(web, id.toString());
            if (controller.signal.aborted) return;

            if (!scrapedText.length) throw new Error("Unable to scrap company information.");

            prompt = prompt.replace(PH_CMP_SCRAP, scrapedText);

            set({descriptionStatus: "Generating description with AI..."})
            set({descriptionDraft: ""});
            for await (const chunk of chat(prompt, controller)) {
                if (controller.signal.aborted) return;
                set(prev => ({descriptionDraft: prev.descriptionDraft! + chunk}));
            }
        } catch (e) {
            showAlert({
                title: "Error",
                content: e instanceof Error ? "Unable to generate description. " + e.message : "Unknown error",
                type: "error",
            })
        } finally {
            set({descriptionStatus: "", loadingDescription: false})
            unsubscribe();
        }
    }
}));