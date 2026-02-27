import axios from "axios";
import * as cheerio from "cheerio";

export default async function scrapePageText(url: string): Promise<string> {
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Scraper/1.0)",
            },
        });

        const $ = cheerio.load(html);

        $("script, style, noscript").remove();

        const bodyText = $("body").text();

        return bodyText
            .replace(/\s+/g, " ")
            .trim();
    } catch (err) {
        console.error("Error scraping:", err);
        return "";
    }
}

// // Ejemplo de uso
// (async () => {
//     const url = "https://bergerhof.ch/";
//     const text = await scrapePageText(url);
//     console.log(text.substring(0, 5000));
// })();