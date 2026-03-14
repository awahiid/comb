import Groq, { APIError } from "groq-sdk";
import {IPC} from "../ipc/channels";

export async function askGroq (event: Electron.IpcMainEvent, key: string, model: string, prompt: string, id: string) {
    const groq = new Groq({
        apiKey: key,
        timeout: 10 * 1000
    });

    try {
        const stream = await groq.chat.completions.create({
            messages: [{role: "user", content: prompt}],
            model,
            stream: true
        });

        let content = "";

        for await (const chunk of stream) {
            content = chunk.choices?.[0]?.delta?.content ?? "";
            if (content) event.sender.send(IPC.GROQ.CHUNK(id), content);
        }
    } catch (e) {
        if(e instanceof APIError) {
            switch(e.status) {
                case 429: {
                    const retryAfter = e.headers?.['retry-after'];
                    const waitMsg = retryAfter
                        ? `Rate limit reached, try again in ${retryAfter}s.`
                        : "Rate limit reached, try again later.";
                    event.sender.send(IPC.GROQ.ERROR(id), waitMsg);
                    break;
                }
                case 401: event.sender.send(IPC.GROQ.ERROR(id), "Invalid API key."); break;
                case 503: event.sender.send(IPC.GROQ.ERROR(id), "Groq service unavailable."); break;
                default:  event.sender.send(IPC.GROQ.ERROR(id), e.message);
            }
        } else if(e instanceof Error) {
            event.sender.send(IPC.GROQ.ERROR(id), e.message);
        }
        console.error("Unknown error on Groq call " + e)
        event.sender.send(IPC.GROQ.ERROR(id), "Unknown error on Groq call")
    } finally {
        event.sender.send(IPC.GROQ.END(id));
    }
}