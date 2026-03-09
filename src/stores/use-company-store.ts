import { create } from "zustand";
import {Company} from "@shared/types";

import {PH_CMP_SCRAP} from "@shared/placeholders";
import {WritableKeysOf} from "type-fest";
import {useDataStore} from "@/stores/use-data-store";
import {chat} from "@/lib/chat";
import {showAlert} from "@/lib/utils";
import {useConfigurationStore} from "@/stores/use-configuration-store";

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

export const useCompanyStore = create<CompanyState>((set, get) => ({
    emailDraft: undefined,

    descriptionDraft: undefined,

    loadingDescription: false,

    descriptionStatus: "",

    setEmailDraft: emailDraft => set({emailDraft}),

    setDescriptionDraft: descriptionDraft => set({descriptionDraft}),

    setCompany: (company: Company) => {
        set({
            ...company,
            emailDraft: undefined,
            descriptionDraft: undefined,
            loadingDescription: false,
            email: company.email,
            description: company.description
        })

        const { auto, descriptionBasePrompt } = useConfigurationStore.getState().config;
        if (!company.description && auto) {
            get().generateDescription(descriptionBasePrompt);
        }
    },

    set: (k, v) => {
        const id = get().id;
        if(id == undefined) return;
        const updateCompany = useDataStore.getState().updateCompany;
        updateCompany(id, {[k]: v})
        set({[k]: v});
    },

    generateDescription: async (prompt: string) => {
        const {id, web} = get();
        if (id == undefined || !web) return;
        const auto = useConfigurationStore.getState().config.auto

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

            if(auto && !get().description) set(state => ({description: state.descriptionDraft}));
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
    },
}));