import { contextBridge, ipcRenderer } from "electron"
import {Configuration, EmailSendInfo} from "../shared/types";

contextBridge.exposeInMainWorld("electronAPI", {
    scrap: (url: string) =>
        ipcRenderer.invoke("scrap", {url}),

    sendEmail: async (info: EmailSendInfo) =>
        ipcRenderer.invoke("send-email", info),

    askGroq: (key: string, prompt: string, id: string) =>
        ipcRenderer.send("ask-groq", { key, prompt, id }),

    onChunk: (id: string, cb: (content: string) => void) =>
        ipcRenderer.on(`groq-channel-${id}`, (_, content) => cb(content)),

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