import { app, ipcMain, BrowserWindow } from "electron"
import path from "path"
import scrapePageText from "./lib/scraper";
import sendEmail from "./lib/email";
import {askGroq} from "./lib/groq";
import Store from 'electron-store';
import {EmailSendInfo} from "../shared/types";
import {DEFAULT_CONFIG} from "../shared/config";

const store = new Store({
    defaults: {
        config: DEFAULT_CONFIG
    }
})

console.log(store.path)

ipcMain.on("ask-groq", (event, {key, prompt}) => askGroq(event, key, prompt))
ipcMain.handle("scrap", (_, { url } ) => scrapePageText(url))
ipcMain.handle("send-email", (_, info: EmailSendInfo ) => sendEmail(info))
ipcMain.handle("config-load", () => store.get('config'))
ipcMain.handle("config-save", (_, config) => store.set('config', config))

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, "../out/index.html"));
    } else {
        win.loadURL("http://localhost:3000");
    }
}

app.whenReady().then(createWindow)