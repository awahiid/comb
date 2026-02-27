import { create } from "zustand";
import {Configuration} from "@/types";

type ConfigurationState = {
    config: Configuration;
    set:  <K extends keyof Configuration>(key: K, value: Configuration[K]) => void;
    save: (config: Configuration) => void;
};

export const useConfigurationStore = create<ConfigurationState>((set, get) => ({
    config: {
        groqKey: "",
        user: "",
        pass: "",
        hostname: "",
        port: "",
        contentBasePrompt: "%companyDescription%",
        subjectBasePrompt: "%companyDescription%",
        descriptionBasePrompt: "%companyInformation%",
    },

    set: (key, value) => set(prev => ({
        config: {
            ...prev.config,
            [key]: value
        }
    })),

    save: (config: Configuration) => set({config})
}));