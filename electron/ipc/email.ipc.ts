import { ipcMain } from "electron";
import sendEmail from "../lib/email";
import { EmailSendInfo } from "../../shared/types";
import { IPC } from "./channels";
import {getConfig} from "../store";

export function registerEmailIpc() {
    let lastSent = 0;
    const MIN_INTERVAL_MS = 10_000;

    ipcMain.handle(IPC.EMAIL.SEND, (_, info: EmailSendInfo) => {
        if(getConfig().requiredAttachment && info.attachments.length < 0){
            throw new Error("Required attachment. Add an attachment before sending an email or deactivate this option in configuration.");
        }

        const now = Date.now();
        if (now - lastSent < MIN_INTERVAL_MS) {
            const secondsLeft = Math.ceil((MIN_INTERVAL_MS - (now - lastSent)) / 1000);
            throw new Error(`Rate limit. Wait ${secondsLeft}s before sending another email.` );
        }
        lastSent = now;
        return sendEmail(info);
    });
}