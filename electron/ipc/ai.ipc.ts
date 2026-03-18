import { ipcMain } from "electron";
import {askAI, getModels} from "../lib/ai";
import { IPC } from "./channels";
import { getConfig } from "../store";

export function registerAIIpc() {
    ipcMain.handle(IPC.AI.MODELS, async () => {
        const {key, keyType} = getConfig();
        if (!key || !keyType) throw new Error("Key or key type not set.");
        return await getModels(key, keyType);
    })

    ipcMain.on(IPC.AI.ASK, (event, { prompt, id }) => {
        const { key, keyType, model } = getConfig();

        if (!key || !keyType || !model) {
            event.sender.send(IPC.AI.ERROR(id), "Key not set.");
        } else {
            askAI(event, key, keyType, model, prompt, id);
        }
    })
}