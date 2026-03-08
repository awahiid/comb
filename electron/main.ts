import { app, ipcMain, BrowserWindow } from "electron"
import path from "path"
import scrapePageText from "./lib/scraper";
import sendEmail from "./lib/email";
import {askGroq} from "./lib/groq";
import Store from 'electron-store';
import {Configuration, EmailSendInfo} from "../shared/types";
import {DEFAULT_CONFIG} from "../shared/config";

const store = new Store({
    defaults: {
        config: DEFAULT_CONFIG
    }
})

const controllers = new Map<string, AbortController>()

ipcMain.on("ask-groq", (event, {key, prompt, id}) => askGroq(event, key, prompt, id))

ipcMain.handle("scrap", async (_, {url, id}) => {
    const controller = new AbortController()
    controllers.set(id, controller)
    try {
        return await scrapePageText(url, controller.signal);
    } finally {
        controllers.delete(id);
    }
})

ipcMain.on("cancel-scrap", (_, id) => {
    controllers.get(id)?.abort()
    controllers.delete(id)
})

ipcMain.handle("send-email", (_, info: EmailSendInfo ) => sendEmail(info))
ipcMain.handle("config-load", () => {
    const saved = store.get('config') as Partial<Configuration>;
    return { ...DEFAULT_CONFIG, ...saved };
})
ipcMain.handle("config-save", (_, config) => store.set('config', config))

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, '../../shared/assets/icons/png/512x512.png'),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, "../../out/index.html"));
    } else {
        win.loadURL("http://localhost:3000");
    }
}

app.whenReady().then(createWindow)