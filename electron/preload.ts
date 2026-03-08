import { contextBridge, ipcRenderer } from "electron"
import {Configuration, EmailSendInfo} from "../shared/types";

contextBridge.exposeInMainWorld("electronAPI", {
    scrap: (url: string, id: string) =>
        ipcRenderer.invoke("scrap", {url, id}),

    cancelScrap: (id: string) =>
        ipcRenderer.send("cancel-scrap", {id}),

    sendEmail: async (info: EmailSendInfo) =>
        ipcRenderer.invoke("send-email", info),

    askGroq: (key: string, prompt: string, id: string) =>
        ipcRenderer.send("ask-groq", { key, prompt, id }),

    onChunk: (id: string, cb: (content: string) => void) =>
        ipcRenderer.on(`groq-channel-${id}`, (_, content) => cb(content)),

    onError: (id: string, cb: (error: string) => void) =>
        ipcRenderer.on(`groq-error-${id}`, (_, error) => cb(error)),

    onEnd: (id: string, cb: () => void) =>
        ipcRenderer.once(`groq-end-${id}`, cb),

    cleanup: (id: string) => {
        ipcRenderer.removeAllListeners(`groq-channel-${id}`);
        ipcRenderer.removeAllListeners(`groq-end-${id}`);
    },

    loadConfig: ()=>
        ipcRenderer.invoke("config-load"),

    saveConfig: (config: Configuration)=>
        ipcRenderer.invoke("config-save", config),
})