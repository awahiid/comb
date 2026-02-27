import scrapePageText from "@/lib/scraper";

export async function POST(req: Request) {
    const url = await req.text();
    const scrapedText = await scrapePageText(url);

    return new Response(scrapedText, {
        headers: { "Content-Type": "text/plain" },
    });
}