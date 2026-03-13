import { app, BrowserWindow } from "electron";
import path from "path";
import { registerGroqIpc } from "./ipc/groq.ipc";
import { registerScraperIpc } from "./ipc/scraper.ipc";
import { registerEmailIpc } from "./ipc/email.ipc";
import { registerConfigIpc } from "./ipc/config.ipc";

function registerIpc() {
    registerGroqIpc();
    registerScraperIpc();
    registerEmailIpc();
    registerConfigIpc();
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, '../../shared/assets/icons/png/512x512.png'),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, "../../out/index.html"));
    } else {
        win.loadURL("http://localhost:3000");
    }
}

app.whenReady().then(() => {
    registerIpc();
    createWindow();
});