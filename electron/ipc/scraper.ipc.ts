import { ipcMain } from "electron";
import scrapePageText from "../lib/scraper";
import { IPC } from "./channels";

const controllers = new Map<string, AbortController>();

export function registerScraperIpc() {
    ipcMain.handle(IPC.SCRAPER.SCRAP, async (_, { url, id }) => {
        const controller = new AbortController();
        controllers.set(id, controller);
        try {
            return await scrapePageText(url, controller.signal);
        } finally {
            controllers.delete(id);
        }
    });

    ipcMain.on(IPC.SCRAPER.CANCEL, (_, { id }) => {
        controllers.get(id)?.abort();
        controllers.delete(id);
    });
}