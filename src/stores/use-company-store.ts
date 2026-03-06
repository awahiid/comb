import { create } from "zustand";
import {Company} from "@shared/types";
import {chat} from "@/lib/utils";

import {PH_CMP_SCRAP} from "@shared/placeholders";
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
        if (id == undefined || !web) return;

        const scrapedText = await window.electronAPI.scrap(web);

        prompt = prompt.replace(PH_CMP_SCRAP, scrapedText);

        for await (const chunk of chat(prompt)) {
            yield chunk;
        }
    },
}));