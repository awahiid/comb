import {create} from "zustand";
import {Configuration} from "@shared/types";
import {DEFAULT_CONFIG} from "@shared/config";

type ConfigurationState = {
    config: Configuration;
    set:  <K extends keyof Configuration>(key: K, value: Configuration[K]) => void;
    save: (config: Configuration) => void;
    load: () => void;
};

export const useConfigurationStore = create<ConfigurationState>((set) => ({
    config: DEFAULT_CONFIG,

    set: (key, value) => {
        set(prev => ({
            config: {
                ...prev.config,
                [key]: value
            }
        }))
    },

    save: (config: Configuration) => {
        window.electronAPI.saveConfig(config);
        config.autoSend = false;
        set({ config });
    },

    load: async () => set({config: await window.electronAPI.loadConfig() ?? DEFAULT_CONFIG})
}));