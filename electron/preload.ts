import { contextBridge, ipcRenderer } from "electron"
import {Configuration, EmailSendInfo} from "../shared/types";

contextBridge.exposeInMainWorld("electronAPI", {
    scrap: (url: string) =>
        ipcRenderer.invoke("scrap", {url}),

    sendEmail: async (info: EmailSendInfo) =>
        ipcRenderer.invoke("send-email", info),

    askGroq: (key: string, prompt: string) =>
        ipcRenderer.send("ask-groq", { key, prompt }),

    onChunk: (cb: (content: string) => void) =>
        ipcRenderer.on("groq-channel", (_, content) => cb(content)),

    onEnd: (cb: () => void) =>
        ipcRenderer.once("groq-end", cb),

    cleanup: () => {
        ipcRenderer.removeAllListeners("groq-channel");
        ipcRenderer.removeAllListeners("groq-end");
    },

    loadConfig: ()=>
        ipcRenderer.invoke("config-load"),

    saveConfig: (config: Configuration)=>
        ipcRenderer.invoke("config-save", config),
})