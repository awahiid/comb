import { ipcMain } from "electron";
import { askGroq } from "../lib/groq";
import { IPC } from "./channels";

export function registerGroqIpc() {
    ipcMain.on(IPC.GROQ.ASK, (event, { key, prompt, model, id }) =>
        askGroq(event, key, model, prompt, id)
    );
}