import { app, BrowserWindow, ipcMain } from "electron"
import path from "path"

ipcMain.handle("server-only-operation", () => {
    return process.env.SECRET_KEY ?? "NO SECRET"
})

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

    win.loadURL("http://localhost:3000")
}

app.whenReady().then(createWindow)