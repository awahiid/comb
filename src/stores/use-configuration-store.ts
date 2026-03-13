import {create} from "zustand";
import {Configuration} from "@shared/types";
import {DEFAULT_CONFIG} from "@shared/config";

type ConfigurationState = {
    config: Configuration;
    set:  <K extends keyof Configuration>(key: K, value: Configuration[K]) => void;
    save: (config: Configuration) => Promise<void>;
    load: () => Promise<void>;
};

export const useConfigurationStore = create<ConfigurationState>((set, get) => ({
    config: DEFAULT_CONFIG,

    set: (key, value) => {
        set(prev => ({
            config: {
                ...prev.config,
                [key]: value
            }
        }))
    },

    save: async (config: Configuration) => {
        await window.electronAPI.saveConfig(config);
        set({ config });
    },

    load: async () => {
        const config = await window.electronAPI.loadConfig() ?? DEFAULT_CONFIG;
        set({ config });
    }
}));