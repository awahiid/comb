import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeLocalCh(keyword: string): Promise<void> {
    const url = `https://www.local.ch/de/s/${encodeURIComponent(keyword)}`;
    console.log(`\nBuscando: ${url}`);

    const { data: html } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "de-CH,de;q=0.9",
        },
    });

    const $ = cheerio.load(html);

    const links: string[] = [];
    $("a[href]").each((_, el) => {
        const href = $(el).attr("href") ?? "";
        if (href.startsWith("http") && !href.includes("local.ch")) {
            links.push(href);
        }
    });

    console.log(`URLs externas (${links.length}):`);
    links.forEach(l => console.log(" -", l));
}

async function main () {
    // Probar varias keywords
    for (const kw of ["Software", "IT", "Tech"]) {
        await scrapeLocalCh(kw);
        await new Promise(r => setTimeout(r, 1000));
    }
}

main()
