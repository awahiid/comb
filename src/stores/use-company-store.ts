import { create } from "zustand";
import {Company} from "@shared/types";

import {PH_CMP_SCRAP} from "@shared/placeholders";
import {WritableKeysOf} from "type-fest";
import {useDataStore} from "@/stores/use-data-store";
import {chat} from "@/lib/chat";
import {showAlert} from "@/lib/utils";

type CompanyState = Partial<Company> & {
    descriptionStatus: string;
    set: <K extends WritableKeysOf<Company>>(key: K, value: Company[K]) => void;
    generateDescription: (prompt: string) => AsyncGenerator<string, void>;
    setCompany: (company: Company) => void;
};

export const useCompanyStore = create<CompanyState>((set, get) => ({
    descriptionStatus: "",

    setCompany: (company: Company) => set({
        ...company,
        email: company.email,
        description: company.description
    }),

    set: (k, v) => {
        const id = get().id;
        if(id == undefined) return;
        const updateCompany = useDataStore.getState().updateCompany;
        updateCompany(id, {[k]: v})
        set({[k]: v});
    },

    generateDescription: async function* (prompt: string) {
        const { id, web } = get();
        if (id == undefined || !web) return;

        const controller = new AbortController();

        const unsubscribe = useCompanyStore.subscribe((state, prev) => {
            if(prev.id != undefined && state.id != prev.id) {
                controller.abort();
                window.electronAPI.cancelScrap(id.toString());
            }
        });

        try {
            set({descriptionStatus: "Scraping web..."})
            const scrapedText = await window.electronAPI.scrap(web, id.toString());
            if(controller.signal.aborted) return;

            if (!scrapedText.length) throw new Error("Unable to scrap company information.");

            prompt = prompt.replace(PH_CMP_SCRAP, scrapedText);

            set({descriptionStatus: "Generating description with AI..."})
            for await (const chunk of chat(prompt, controller)) {
                if (controller.signal.aborted) return;
                yield chunk;
            }
        } catch (e) {
            showAlert({
                 title: "Error",
                content: e instanceof Error ? "Unable to generate description. " + e.message : "Unknown error",
                type: "error",
            })
        } finally {
            set({descriptionStatus: ""})
            unsubscribe();
        }
    },
}));