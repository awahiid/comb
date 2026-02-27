import { create } from "zustand";
import {Configuration} from "@/types";
import {DEFAULT_CONFIG} from "@/config";

export const PH_CMP_DESCRIPTION = "%companyDescription%";
export const PH_CMP_SCRAP = "%companyScrap%";

type ConfigurationState = {
    config: Configuration;
    set:  <K extends keyof Configuration>(key: K, value: Configuration[K]) => void;
    save: (config: Configuration) => void;
};

export const useConfigurationStore = create<ConfigurationState>((set) => ({
    config: DEFAULT_CONFIG,

    set: (key, value) => set(prev => ({
        config: {
            ...prev.config,
            [key]: value
        }
    })),

    save: (config: Configuration) => set({config})
}));