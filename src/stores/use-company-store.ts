import { create } from "zustand";
import {Company, MailStatus} from "@/types";
import {chat} from "@/lib/utils";
import {PH_CMP_SCRAP} from "@/stores/use-configuration-store";

type CompanyState =  {
    company?: Company;
    setAddress: (address?: string) => void;
    setMailStatus: (mailStatus: MailStatus) => void;
    setDescription: (description: string) => void;
    setCompany: (company: Company) => void;
    generateDescription: (prompt: string) => AsyncGenerator<string, void>;
};

export const useCompanyStore = create<CompanyState>((set, get) => ({
    company: undefined,

    setCompany: async (company: Company) => set({ company }),

    setAddress: async (address?: string) => {
        const company = get().company;
        if(!company) return;
        company.email = address;
        set({company});
    },

    setMailStatus: (status: MailStatus) => {
        const company = get().company;
        if(!company) return;
        company.status = status;
        set({company});
    },

    setDescription: async (description: string) => {
        const company = get().company;
        if(!company) return;
        company.description = description;
        set({company});
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