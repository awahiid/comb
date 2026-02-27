import Groq from "groq-sdk";

export async function POST(req: Request) {
    const { key, prompt } = await req.json();

    const groq = new Groq({
        apiKey: key,
    });

    const stream = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        stream: true,
    });

    const encoder = new TextEncoder();

    return new Response(
        new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices?.[0]?.delta?.content;
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();
            },
        }),
        {
            headers: { "Content-Type": "text/plain" },
        }
    );
}