import { chromium } from "playwright";
import axios from "axios";
import {Company} from "../../../shared/types";
import fs from "fs";

const CSV_FILE = "suiza-software.csv";
const CSV_HEADERS = "name,location,type,email,web,osmNode,lat,long,gmaps";

// Crear el CSV con headers si no existe
if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, CSV_HEADERS + "\n", "utf-8");
}

function appendToCsv(company: Company) {
    const row = [
        company.name,
        company.location,
        company.type,
        company.email ?? "",
        company.web ?? "",
        company.osmNode,
        company.lat,
        company.long,
        company.gmaps,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");

    fs.appendFileSync(CSV_FILE, row + "\n", "utf-8");
}


async function scrapeLocalCh(keyword: string): Promise<Company[]> {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();

    await context.addCookies([{
        name: "CookieConsent",
        value: "true",
        domain: ".local.ch",
        path: "/",
    }]);

    const page = await context.newPage();

    console.log(`🔍 Buscando "${keyword}" en local.ch...`);
    await page.goto(`https://www.local.ch/de/s/${encodeURIComponent(keyword)}`);
    await page.waitForSelector("a.lD");

    const hrefs: { name: string, location: string, href: string }[] = [];
    let pageNum = 1;

    while (pageNum < 2) {
        console.log(`📄 Página ${pageNum}...`);
        await page.goto(`https://www.local.ch/de/s/${encodeURIComponent(keyword)}?page=${pageNum}`);
        await page.waitForSelector("a.lD");

        const pageHrefs = await page.$$eval("a.lD", els =>
            els.map(el => ({
                name: el.querySelector("h2")?.textContent?.trim() ?? "",
                location: el.querySelector("address")?.textContent?.trim() ?? "",
                href: el.getAttribute("href") ?? "",
            }))
        );

        hrefs.push(...pageHrefs);
        console.log(`  → ${pageHrefs.length} empresas (total: ${hrefs.length})`);

        // Comprobar si el botón "Weiter" está desactivado o no existe
        const hasNextPage = await page.$eval(
            "button#load-next-page",
            el => !el.hasAttribute("disabled")
        ).catch(() => false);

        if (!hasNextPage) {
            console.log(`  ⛔ Última página alcanzada`);
            break;
        }

        pageNum++;
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`📋 ${hrefs.length} empresas encontradas`);

    const results: Company[] = [];

    for (let i = 0; i < hrefs.length; i++) {
        const item = hrefs[i];
        console.log(`\n[${i + 1}/${hrefs.length}] Procesando: ${item.name}`);

        try {
            const [, nominatimData] = await Promise.all([
                (async () => {
                    await page.goto(`https://www.local.ch${item.href}`);
                    await page.waitForSelector("div.to");
                })(),
                axios.get(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(item.location)}&format=json&limit=1`,
                    { headers: { "User-Agent": "comb-app/1.0" } }
                ).then(r => r.data),
            ]);

            const [email, web] = await Promise.all([
                page.$eval("a[data-testid='contact-link'][href^='mailto:']", el => el.getAttribute("href")?.replace("mailto:", "") ?? null).catch(() => null),
                page.$eval("a[data-testid='contact-link'][href^='http']", el => el.getAttribute("href") ?? null).catch(() => null),
            ]);

            const osmNode = nominatimData.length ? `${nominatimData[0].osm_type[0].toUpperCase()}${nominatimData[0].osm_id}` : "";
            const lat = nominatimData.length ? parseFloat(nominatimData[0].lat) : 0;
            const long = nominatimData.length ? parseFloat(nominatimData[0].lon) : 0;
            const gmaps = lat && long ? `https://www.google.com/maps?q=${lat},${long}` : "";

            console.log(`  ✉️  Email: ${email ?? "—"}`);
            console.log(`  🌐 Web:   ${web ?? "—"}`);
            console.log(`  📍 OSM:   ${osmNode || "—"} (${lat}, ${long})`);

            const company: Company = { name: item.name, location: item.location, type: keyword, email: email ?? undefined, web, osmNode, lat, long, gmaps };

            results.push(company);
            appendToCsv(company);  // 💾 guardar inmediatamente
            console.log(`  💾 Guardado en ${CSV_FILE}`);

        } catch (err) {
            console.error(`  ❌ Error procesando ${item.name}:`, err);
        }

        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n✅ Scraping completado: ${results.length} empresas`);
    await browser.close();
    return results;
}

async function main() {
    for (const kw of ["Software"]) {
        const results = await scrapeLocalCh(kw);
        console.log("\n📦 Resultado final:");
        console.log(JSON.stringify(results, null, 2));
    }
}

main();
