import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
    serverOnlyOperation: () => ipcRenderer.invoke("server-only-operation")
})