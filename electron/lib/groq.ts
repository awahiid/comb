import Groq from "groq-sdk";

export async function askGroq (event: Electron.IpcMainEvent, key: string, prompt: string) {
    const groq = new Groq({
        apiKey: key,
    });

    const stream = await groq.chat.completions.create({
        messages: [{role: "user", content: prompt}],
        model: "llama-3.1-8b-instant",
        stream: true,
    });

    let content = "";

    for await (const chunk of stream) {
        content = chunk.choices?.[0]?.delta?.content ?? "";
        if (content) event.sender.send("groq-channel", content);
    }

    event.sender.send("groq-end");
}