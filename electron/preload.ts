import { contextBridge, ipcRenderer } from "electron";
import { Configuration, PostEmailDTO } from "../shared/types";
import { IPC } from "./ipc/channels";

const electronAPI = {
    scrap: (url: string, id: string) =>
        ipcRenderer.invoke(IPC.SCRAPER.SCRAP, { url, id }),

    cancelScrap: (id: string) =>
        ipcRenderer.send(IPC.SCRAPER.CANCEL, { id }),

    getEmails: (address: string) =>
        ipcRenderer.invoke(IPC.EMAIL.GET, address),

    sendEmail: (info: PostEmailDTO) =>
        ipcRenderer.invoke(IPC.EMAIL.SEND, info),

    getModels: async () =>
        ipcRenderer.invoke(IPC.AI.MODELS),

    askAI: (prompt: string, id: string) =>
        ipcRenderer.send(IPC.AI.ASK, { prompt, id }),

    onChunk: (id: string, cb: (content: string) => void) =>
        ipcRenderer.on(IPC.AI.CHUNK(id), (_, content) => cb(content)),

    onError: (id: string, cb: (error: string) => void) =>
        ipcRenderer.on(IPC.AI.ERROR(id), (_, error) => cb(error)),

    onEnd: (id: string, cb: () => void) =>
        ipcRenderer.once(IPC.AI.END(id), cb),

    cleanup: (id: string) => {
        ipcRenderer.removeAllListeners(IPC.AI.CHUNK(id));
        ipcRenderer.removeAllListeners(IPC.AI.END(id));
    },

    loadConfig: () =>
        ipcRenderer.invoke(IPC.CONFIG.LOAD),

    saveConfig: (config: Configuration) =>
        ipcRenderer.invoke(IPC.CONFIG.SAVE, config),
} as const;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export type ElectronAPI = typeof electronAPI;