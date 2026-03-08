import Groq, { APIError } from "groq-sdk";

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
            if (content) event.sender.send(`groq-channel-${id}`, content);
        }
    } catch (e) {
        if(e instanceof APIError) {
            switch(e.status) {
                case 429: {
                    const retryAfter = e.headers?.['retry-after'];
                    const waitMsg = retryAfter
                        ? `Rate limit reached, try again in ${retryAfter}s.`
                        : "Rate limit reached, try again later.";
                    event.sender.send(`groq-error-${id}`, waitMsg);
                    break;
                }
                case 401: event.sender.send(`groq-error-${id}`, "Invalid API key."); break;
                case 503: event.sender.send(`groq-error-${id}`, "Groq service unavailable."); break;
                default:  event.sender.send(`groq-error-${id}`, e.message);
            }
        } else if(e instanceof Error) {
            event.sender.send(`groq-error-${id}`, e.message);
        }
        console.error("Unknown error on Groq call " + e)
        event.sender.send(`groq-error-${id}`, "Unknown error on Groq call")
    } finally {
        event.sender.send(`groq-end-${id}`);
    }
}