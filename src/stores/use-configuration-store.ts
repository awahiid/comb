import {create} from "zustand";
import {Configuration} from "@shared/types";
import {PH_CMP_DESCRIPTION, PH_CMP_SCRAP} from "@shared/placeholders";

type ConfigurationState = {
    config: Configuration;
    set:  <K extends keyof Configuration>(key: K, value: Configuration[K]) => void;
    save: (config: Configuration) => void;
    load: () => void;
};

const DEFAULT_CONFIG: Configuration = {
    groqKey: ``,
    model: ``,
    user: ``,
    pass: ``,
    hostname: ``,
    port: ``,
    auto: false,
    subjectBasePrompt: `${PH_CMP_DESCRIPTION}`,
    contentBasePrompt: `${PH_CMP_DESCRIPTION}`,
    descriptionBasePrompt: `${PH_CMP_SCRAP}`,
}

export const useConfigurationStore = create<ConfigurationState>((set) => ({
    config: DEFAULT_CONFIG,

    set: (key, value) => set(prev => ({
        config: {
            ...prev.config,
            [key]: value
        }
    })),

    save: (config: Configuration) => {
        window.electronAPI.saveConfig(config);
        set({config});
    },

    load: async () => set({config: await window.electronAPI.loadConfig() ?? DEFAULT_CONFIG})
}));