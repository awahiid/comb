import { create } from "zustand";
import {Company} from "@/types";
import {chat} from "@/lib/utils";

import {PH_CMP_SCRAP} from "@/placeholders";
import {WritableKeysOf} from "type-fest";
import {useDataStore} from "@/stores/use-data-store";

type CompanyState = Partial<Company> & {
    set: <K extends WritableKeysOf<Company>>(key: K, value: Company[K]) => void;
    generateDescription: (prompt: string) => AsyncGenerator<string, void>;
    setCompany: (company: Company) => void;
};

export const useCompanyStore = create<CompanyState>((set, get) => ({
    setCompany: (company: Company) => set({ ...company }),

    set: (k, v) => {
        const id = get().id;
        if(id == undefined) return;
        const updateCompany = useDataStore.getState().updateCompany;
        updateCompany(id, {[k]: v})
        set({[k]: v});
    },

    generateDescription: async function* (prompt: string) {
        const {id, web} = get();
        if (id == undefined) return;

        const res = await fetch("/api/scraper", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: web,
        });

        if (!res.ok) return;

        const scrapedText = await res.text();

        prompt = prompt.replace(PH_CMP_SCRAP, scrapedText);

        for await (const chunk of chat(prompt)) {
            yield chunk;
        }
    },
}));