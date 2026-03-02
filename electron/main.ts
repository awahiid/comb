import { app, BrowserWindow } from "electron"
import { spawn, ChildProcess } from "child_process"

let nextProcess: ChildProcess | null = null
let mainWindow: BrowserWindow | null = null

function createWindow() {
    mainWindow = new BrowserWindow({ width: 1200, height: 800 })
    mainWindow.loadURL("http://localhost:3000")

    mainWindow.on("closed", () => {
        mainWindow = null
        if (nextProcess) {
            nextProcess.kill()
            nextProcess = null
        }
    })
}

app.whenReady().then(() => {
    nextProcess = spawn("npx", ["next", "start", "-p", "3000"], {
        shell: true,
        stdio: "inherit",
    })

    setTimeout(createWindow, 3000)
})

app.on("will-quit", () => {
    if (nextProcess) nextProcess.kill()
})