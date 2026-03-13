import { ipcMain } from "electron";
import sendEmail from "../lib/email";
import { EmailSendInfo } from "../../shared/types";
import { IPC } from "./channels";

export function registerEmailIpc() {
    ipcMain.handle(IPC.EMAIL.SEND, (_, info: EmailSendInfo) => sendEmail(info));
}