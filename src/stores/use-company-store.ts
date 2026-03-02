import { create } from "zustand";
import {Company} from "@/types";
import {chat} from "@/lib/utils";

import {PH_CMP_SCRAP} from "@/placeholders";
import {WritableKeysOf} from "type-fest";

type CompanyState = {
    company?: Company;
    setCompany: (company: Company) => void;
    set: <K extends WritableKeysOf<Company>>(key: K, value: Company[K]) => void;
    generateDescription: (prompt: string) => AsyncGenerator<string, void>;
};

export const useCompanyStore = create<CompanyState>((set, get) => ({
    company: undefined,

    setCompany: (company: Company) => set({ company }),

    set: (k, v) => {
        const company = get().company;
        if(!company) return;
        set({company: {...company, [k]: v}});
    },

    generateDescription: async function* (prompt: string) {
        const company = get().company;
        if (!company) return;

        const res = await fetch("/api/scraper", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: company.web,
        });

        if (!res.ok) return;

        const scrapedText = await res.text();

        prompt = prompt.replace(PH_CMP_SCRAP, scrapedText);

        for await (const chunk of chat(prompt)) {
            yield chunk;
        }
    },
}));