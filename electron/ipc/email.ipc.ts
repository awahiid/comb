import { ipcMain } from "electron";
import sendEmail, {getEmails} from "../lib/email";
import { PostEmailDTO } from "../../shared/types";
import { IPC } from "./channels";
import {getConfig} from "../store";

export function registerEmailIpc() {
    let lastSent = 0;
    const MIN_INTERVAL_MS = 10_000;

    ipcMain.handle(IPC.EMAIL.SEND, (_, info: PostEmailDTO) => {
        const { user, pass, hostname, SMTPPort } = getConfig()

        if(!user || !pass || !SMTPPort || !hostname || !info.address || !info.subject || !info.content || !info.attachments){
            throw new Error(`Missing required fields when sending email:
                ${!user ? ">> user is undefined" : ""}
                ${!pass ? ">> pass is undefined" : ""}
                ${!SMTPPort ? ">> SMTPPort is undefined" : ""}
                ${!hostname ? ">> hostname is undefined" : ""}
                ${!info.address ? ">> address is undefined" : ""}
                ${!info.content ? ">> content is undefined" : ""}
                ${!info.attachments ? ">> attachments is undefined" : ""}
            `)
        }

        if(getConfig().requiredAttachment && info.attachments.length < 0){
            throw new Error("Required attachment. Add an attachment before sending an email or deactivate this option in configuration.");
        }

        const now = Date.now();
        if (now - lastSent < MIN_INTERVAL_MS) {
            const secondsLeft = Math.ceil((MIN_INTERVAL_MS - (now - lastSent)) / 1000);
            throw new Error(`Rate limit. Wait ${secondsLeft}s before sending another email.` );
        }
        lastSent = now;
        return sendEmail({ user, pass, hostname, SMTPPort, ...info });
    });

    ipcMain.handle(IPC.EMAIL.GET, (_, address: string) => {
        const { user, pass, IMAPPort, hostname } = getConfig();

        if(!user || !pass || !IMAPPort || !hostname){
            throw new Error(`Missing required fields when getting emails from ${address}:
                ${!user ? ">> user is undefined" : ""}
                ${!pass ? ">> pass is undefined" : ""}
                ${!IMAPPort ? ">> IMAPPort is undefined" : ""}
                ${!hostname ? ">> hostname is undefined" : ""}
            `)
        }

        return getEmails({user, pass, IMAPPort, hostname, address});
    });
}