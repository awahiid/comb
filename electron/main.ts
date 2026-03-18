import { app, BrowserWindow } from "electron";
import path from "path";
import { registerAIIpc } from "./ipc/ai.ipc";
import { registerScraperIpc } from "./ipc/scraper.ipc";
import { registerEmailIpc } from "./ipc/email.ipc";
import { registerConfigIpc } from "./ipc/config.ipc";

function registerIpc() {
    registerAIIpc();
    registerScraperIpc();
    registerEmailIpc();
    registerConfigIpc();
}


function createWindow() {
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        icon: path.join(__dirname, '../../shared/assets/icons/png/512x512.png'),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
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