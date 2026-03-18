import OpenAI from "openai";
import { IPC } from "../ipc/channels";
import {BASE_URLS, KeyType} from "../../shared/types";

async function getGitHubModels(key: string): Promise<string[]> {
    const res = await fetch("https://models.github.ai/catalog/models", {
        headers: {
            "Authorization": `Bearer ${key}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
    });

    if (!res.ok) throw new Error(`GitHub Models API error: ${res.status}`);

    const data = await res.json();
    return  data.map((m: { id: string }) => m.id);
}

export async function getModels(key: string, keyType: KeyType): Promise<string[]> {
    if (keyType === "github") return getGitHubModels(key);

    const client = new OpenAI({
        apiKey: key,
        baseURL: BASE_URLS[keyType],
        timeout: 10 * 1000,
    });

    const { data } = await client.models.list();
    return data.map(m => m.id);
}

export async function askAI(
    event: Electron.IpcMainEvent,
    key: string,
    keyType: KeyType,
    model: string,
    prompt: string,
    id: string
) {
    const resolvedModel = keyType === "github"
        ? model.split("/").pop()!
        : model;

    const client = new OpenAI({
        apiKey: key,
        baseURL: BASE_URLS[keyType],
        timeout: 10 * 1000,
    });

    try {
        const stream = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: resolvedModel,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content ?? "";
            if (content) event.sender.send(IPC.AI.CHUNK(id), content);
        }
    } catch (e) {
        if (e instanceof OpenAI.APIError) {
            switch (e.status) {
                case 429: {
                    const retryAfter = e.headers?.["retry-after"];
                    const waitMsg = retryAfter
                        ? `Rate limit reached, try again in ${retryAfter}s.`
                        : "Rate limit reached, try again later.";
                    event.sender.send(IPC.AI.ERROR(id), waitMsg);
                    break;
                }
                case 401: event.sender.send(IPC.AI.ERROR(id), "Invalid token."); break;
                case 503: event.sender.send(IPC.AI.ERROR(id), "Service unavailable."); break;
                default:  event.sender.send(IPC.AI.ERROR(id), e.message);
            }
        } else if (e instanceof Error) {
            event.sender.send(IPC.AI.ERROR(id), e.message);
        } else {
            console.error("Unknown error on AI call", e);
            event.sender.send(IPC.AI.ERROR(id), "Unknown error");
        }
    } finally {
        event.sender.send(IPC.AI.END(id));
    }
}