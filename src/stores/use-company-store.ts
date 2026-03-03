import { create } from "zustand";
import {Company, Email} from "@/types";
import {chat} from "@/lib/utils";

import {PH_CMP_SCRAP} from "@/placeholders";
import {WritableKeysOf} from "type-fest";
import {useDataStore} from "@/stores/use-data-store";
import {useConfigurationStore} from "@/stores/use-configuration-store";

type CompanyState = Partial<Company> & {
    set: <K extends WritableKeysOf<Company>>(key: K, value: Company[K]) => void;
    emails: Email[];
    generateDescription: (prompt: string) => AsyncGenerator<string, void>;
    setCompany: (company: Company) => void;
};

export const useCompanyStore = create<CompanyState>((set, get) => ({
    emails: [],

    setCompany: async (company: Company) => {
        set({...company})
        if (!company.email) return;
        const {user, pass, hostname, IMAPPort} = useConfigurationStore.getState().config

        const formData = new FormData()

        formData.append("user", user)
        formData.append("pass", pass)
        formData.append("hostname", hostname)
        formData.append("port", IMAPPort)
        formData.append("addresses", company.email)

        const res = await fetch("/api/email", {
            method: "PUT",
            body: formData
        })

        if(!res.body) return;

        const emails: Email[] = await res.json();
        set({ emails });
    },

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