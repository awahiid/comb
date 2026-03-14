import {create} from "zustand";
import {Configuration} from "@shared/types";
import {DEFAULT_CONFIG} from "@shared/config";
import {useEmailStore} from "@/stores/use-email-store";
import {showAlert} from "@/lib/utils";

const MIN_INTERVAL_SECONDS = 10;

type AutoConfiguration = {
    autoGenerate: boolean;
    autoSend: boolean;
    sendIntervalSeconds: number;
}

type ConfigurationState = {
    config: Configuration;
    autoConfig: AutoConfiguration;
    setConfig: (config: Configuration) => void;
    configSetter:  <K extends keyof Configuration>(key: K, value: Configuration[K]) => void;
    autoSetter: <K extends keyof AutoConfiguration>(key: K, value: AutoConfiguration[K]) => void;
    save: (config: Configuration) => Promise<void>;
    load: () => Promise<void>;
};

function sanitizeAuto(auto: AutoConfiguration, requiredAttachment: boolean, hasAttachments: boolean): AutoConfiguration {
    const blockAuto = requiredAttachment && !hasAttachments;
    return {
        ...auto,
        autoGenerate: blockAuto ? false : auto.autoGenerate,
        autoSend: blockAuto ? false : auto.autoSend,
        sendIntervalSeconds: (auto.sendIntervalSeconds > MIN_INTERVAL_SECONDS) ? auto.sendIntervalSeconds : MIN_INTERVAL_SECONDS
    }
}

export const useConfigurationStore = create<ConfigurationState>((set, get) => ({
    config: DEFAULT_CONFIG,

    autoConfig: {
        autoGenerate: false,
        autoSend: false,
        sendIntervalSeconds: 30
    },

    setConfig: (config: Configuration) => set(prev => ({
        config: {...config},
        autoConfig: sanitizeAuto(
            prev.autoConfig,
            config.requiredAttachment,
            useEmailStore.getState().attachments.length > 0
        )
    })),

    configSetter: (key, value) => {
        const prev = get().config;
        get().setConfig({ ...prev, [key]: value });
    },

    autoSetter: (key, value) => {
        if (key === "autoGenerate" && value && get().config.requiredAttachment && useEmailStore.getState().attachments.length <= 0) {
            showAlert({ title: "Error", content: "Required attachment.", type: "error" });
            return;
        }

        if (key === "autoSend" && value && !get().autoConfig.autoGenerate) {
            showAlert({ title: "Error", content: "Enable auto mode first.", type: "error" });
            return;
        }

        set(prev => ({
            autoConfig: sanitizeAuto(
                { ...prev.autoConfig, [key]: value },
                prev.config.requiredAttachment,
                useEmailStore.getState().attachments.length > 0
            )
        }));
    },

    save: async (config: Configuration) => {
        await window.electronAPI.saveConfig(config);
        get().setConfig(config);
    },

    load: async () => {
        const config = await window.electronAPI.loadConfig() ?? DEFAULT_CONFIG;
        get().setConfig(config);
    }
}));