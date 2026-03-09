import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";
import {search} from "duck-duck-scrape";

interface ZefixCompany {
    name: string;
    uid: string;
    legalSeat: string;
    rabNumber?: string;
    chid?: string;
}

interface ZefixResponse {
    list: ZefixCompany[];
    hits: number;
}

type CsvRecord = {
    name: string;
    uid: string;
    location: string;
    zefix: string;
    web: string;
};

const csvWriter = createObjectCsvWriter({
    path: "./docs/zefix-software.csv",
    header: [
        { id: "name", title: "name" },
        { id: "uid", title: "uid" },
        { id: "location", title: "location" },
        { id: "zefix", title: "zefix" },
        { id: "web", title: "web" },
    ],
});

const KEYWORDS = [
    "software", "technologies", "solutions", "digital", "systems",
    "consulting", "IT", "tech", "data", "cloud", "cyber", "dev",
    "apps", "web", "code", "programming",
];

const BLACKLIST = [
    "linkedin", "facebook", "twitter", "instagram", "zefix",
    "google", "youtube", "xing", "wikipedia", "admin.ch",
    "trustpilot", "yelp", "glassdoor", "indeed", "kununu",
];

const TECH_KEYWORDS = [
    "software", "technology", "digital", "cloud", "data", "IT",
    "solutions", "development", "consulting", "engineering", "platform",
    "saas", "api", "code", "programming", "web", "app", "cyber",
];

async function searchZefix(keyword: string): Promise<ZefixResponse> {
    const res = await axios.post(
        "https://www.zefix.admin.ch/ZefixREST/api/v1/firm/search.json",
        { name: keyword, maxEntries: 500, offset: 0, activeOnly: true },
        { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
}

async function getCandidateUrls(companyName: string): Promise<string[]> {
    const cleanName = companyName
        .replace(/GmbH|AG|SA|Sàrl|Srl|Ltd|LLC|SAS|NV|BV/gi, "")
        .replace(/[^\w\s]/g, " ")
        .trim();

    const queries = [
        `"${companyName}" switzerland`,
        `${cleanName} switzerland`,
    ];

    for (const query of queries) {
        console.log(`    🔍 Buscando: ${query}`);
        try {
            const results = await search(query, { safeSearch: 0 });
            console.log(`    📄 ${results.results.length} resultados encontrados`);

            const urls = results.results
                .map((r) => {
                    try { return new URL(r.url).origin; } catch { return ""; }
                })
                .filter((url) => url && !BLACKLIST.some((b) => url.includes(b)));

            console.log(`    ✅ ${urls.length} URLs válidas tras filtrar blacklist:`, urls);

            if (urls.length > 0) return urls.slice(0, 10);
        } catch (err) {
            console.log(`    ❌ Error en query "${query}": ${(err as Error).message}`);
        }
    }

    console.log(`    ⚠ Sin resultados para "${companyName}"`);
    return [];
}

async function scoreUrl(url: string, companyName: string): Promise<number> {
    try {
        const { data: html } = await axios.get(url, {
            timeout: 5000,
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        const $ = cheerio.load(html);
        const text = ($("body").text() + " " + $("title").text()).toLowerCase();
        const name = companyName.toLowerCase();

        let score = 0;

        // Nombre de la empresa en el contenido
        if (text.includes(name)) score += 10;

        // Palabras clave tech
        for (const kw of TECH_KEYWORDS) {
            if (text.includes(kw)) score += 1;
        }

        // Switzerland / swiss en el contenido
        if (text.includes("switzerland") || text.includes("swiss")) score += 3;

        return score;
    } catch {
        return -1; // inaccesible
    }
}

async function findWebsite(companyName: string): Promise<string> {
    try {
        const candidates = await getCandidateUrls(companyName);
        console.log(candidates)
        if (candidates.length === 0) return "";

        // Puntuar cada candidato en paralelo
        const scored = await Promise.all(
            candidates.map(async (url) => ({
                url,
                score: await scoreUrl(url, companyName),
            }))
        );

        const best = scored
            .filter((s) => s.score >= 0)
            .sort((a, b) => b.score - a.score)[0];

        return best?.score > 0 ? best.url : "";
    } catch (err) {
        console.error(`  Error para "${companyName}":`, (err as Error).message);
        return "";
    }
}

async function run(): Promise<void> {
    if (!fs.existsSync("./docs")) fs.mkdirSync("./docs");

    const seen = new Set<string>();
    const records: CsvRecord[] = [];

    if (fs.existsSync("./docs/zefix-software.csv")) {
        console.log("CSV existente encontrado, cargando empresas...");
        const existing = fs.readFileSync("./docs/zefix-software.csv", "utf-8");
        const lines = existing.trim().split("\n").slice(1); // saltar header
        for (const line of lines) {
            const [name, uid, location, zefix, web] = line.split(",").map(s => s.trim());
            if (uid) {
                seen.add(uid);
                records.push({ name, uid, location, zefix, web: web ?? "" });
            }
        }
        console.log(`${records.length} empresas cargadas del CSV.`);
    } else {
        // 1. Recopilar empresas de Zefix
        for (const keyword of KEYWORDS) {
            console.log(`Buscando: "${keyword}"...`);
            try {
                const data = await searchZefix(keyword);
                for (const company of data.list) {
                    if (seen.has(company.uid)) continue;
                    seen.add(company.uid);
                    records.push({
                        name: company.name,
                        uid: company.uid ?? "",
                        location: company.legalSeat ?? "",
                        zefix: company.chid
                            ? `https://www.zefix.admin.ch/en/search/entity/list/firm/${company.chid}`
                            : "",
                        web: "",
                    });
                }
                console.log(`  → ${data.list.length} resultados (total: ${records.length})`);
            } catch (err) {
                console.error(`  Error con "${keyword}":`, (err as Error).message);
            }
            await new Promise((r) => setTimeout(r, 300));
        }
    }


    // 2. Buscar y puntuar webs
    console.log(`\nBuscando webs para ${records.length} empresas...`);

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        process.stdout.write(`  [${i + 1}/${records.length}] ${record.name}... `);

        record.web = await findWebsite(record.name);
        console.log(record.web || "no encontrada");

        // Pausa entre requests para evitar bloqueo de Google
        await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000));
    }

    const withWeb = records.filter((r) => r.web !== "");
    console.log(`\n${withWeb.length}/${records.length} empresas con web.`);

    await csvWriter.writeRecords(records);
    console.log(`CSV creado: ./docs/zefix-software.csv`);
}

run().catch(console.error);