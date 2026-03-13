import { contextBridge, ipcRenderer } from "electron";
import { Configuration, EmailSendInfo } from "../shared/types";
import { IPC } from "./ipc/channels";

const electronAPI = {
    scrap: (url: string, id: string) =>
        ipcRenderer.invoke(IPC.SCRAPER.SCRAP, { url, id }),

    cancelScrap: (id: string) =>
        ipcRenderer.send(IPC.SCRAPER.CANCEL, { id }),

    sendEmail: (info: EmailSendInfo) =>
        ipcRenderer.invoke(IPC.EMAIL.SEND, info),

    askGroq: (key: string, model: string, prompt: string, id: string) =>
        ipcRenderer.send(IPC.GROQ.ASK, { key, model, prompt, id }),

    onChunk: (id: string, cb: (content: string) => void) =>
        ipcRenderer.on(IPC.GROQ.CHUNK(id), (_, content) => cb(content)),

    onError: (id: string, cb: (error: string) => void) =>
        ipcRenderer.on(IPC.GROQ.ERROR(id), (_, error) => cb(error)),

    onEnd: (id: string, cb: () => void) =>
        ipcRenderer.once(IPC.GROQ.END(id), cb),

    cleanup: (id: string) => {
        ipcRenderer.removeAllListeners(IPC.GROQ.CHUNK(id));
        ipcRenderer.removeAllListeners(IPC.GROQ.END(id));
    },

    loadConfig: () =>
        ipcRenderer.invoke(IPC.CONFIG.LOAD),

    saveConfig: (config: Configuration) =>
        ipcRenderer.invoke(IPC.CONFIG.SAVE, config),
} as const;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

export type ElectronAPI = typeof electronAPI;