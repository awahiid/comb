import {ipcMain} from "electron";
import {getConfig, store} from "../store";
import {Configuration} from "../../shared/types";
import {IPC} from "./channels";

export function registerConfigIpc() {
    ipcMain.handle(IPC.CONFIG.LOAD, () => {
        return getConfig() as Partial<Configuration>;
    });

    ipcMain.handle(IPC.CONFIG.SAVE, (_, config: Configuration) =>
        store.set('config', config)
    );
}