import { ipcMain } from "electron";
import { store } from "../store";
import { Configuration } from "../../shared/types";
import { DEFAULT_CONFIG } from "../../shared/config";
import { IPC } from "./channels";

export function registerConfigIpc() {
    ipcMain.handle(IPC.CONFIG.LOAD, () => {
        const saved = store.get('config') as Partial<Configuration>;
        const config = { ...DEFAULT_CONFIG, ...saved };
        const cleaned: Configuration = {
            ...config,
            auto: config.requiredAttachment ? false : config.auto,
            autoSend: false,
            sendIntervalSeconds: config.sendIntervalSeconds ?? 10,
        };
        store.set('config', cleaned);
        return cleaned;
    });

    ipcMain.handle(IPC.CONFIG.SAVE, (_, config: Configuration) =>
        store.set('config', config)
    );
}