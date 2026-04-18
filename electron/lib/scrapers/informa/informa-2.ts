import fs from "fs";
import * as cheerio from "cheerio";
import { Scraper } from "../scraper";
import {Company} from "../../../shared/types";

const CSV_FILE = "informa-extremadura-informatica-clean.csv";

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

async function getCompanyInfo(html: string): Promise<Company> {
    const $ = cheerio.load(html);

    // Nombre
    const name = $("h1.nombre_empresa").text().trim() || $("meta[itemprop='name']").attr("content") || "";

    // Descripción
    let description;
    const descRow = $("#table-datos-pples tr:contains('Objeto Social') td").first().text().trim();
    if (descRow) {
        description = descRow;
    } else {
        // Alternativa: primer párrafo en #descripcion
        description = $("#descripcion p").first().text().trim();
    }

    // Dirección/Localización
    let location;
    const street = $(".adr .street-address").text().trim();
    const locality = $(".adr .locality").text().trim();
    if (street || locality) {
        location = street + (street && locality ? ", " : "") + locality;
    } else {
        // Alternativa: buscar en Domicilio Social
        location = $("#table-datos-pples tr:contains('Domicilio Social') td").first().text().replace(/\s+Cómo llegar.*/, "").trim();
    }

    // Tipo (CNAE o Actividad Informa)
    let type = $("#table-datos-pples tr:contains('Actividad Informa') td").first().text().trim();
    if (!type) {
        type = $("#table-datos-pples tr:contains('CNAE') td").first().text().trim();
    }

    // Web
    let web = $("#table-datos-pples tr:contains('URLS') .website a").first().text().trim();
    if (!web) {
        // Alternativa: buscar en #descripcion
        web = $("#descripcion a[href^='http']").first().attr("href") || "";
    }
    web = web.replace(/^https?:\/\//, "");

    // Email (no aparece en el ejemplo)
    const email = undefined;

    // gmaps
    const gmaps = $("#table-datos-pples tr:contains('Domicilio Social') a#como_llegar").attr("href") || "";

    // Lat/Long
    let lat = 0, long = 0;
    const mapSrc = $("#map_canvas iframe#map_image_route2").attr("src") || "";
    const match = mapSrc.match(/[?&]q=([\d.-]+),([\d.-]+)/);
    if (match) {
        lat = parseFloat(match[1]);
        long = parseFloat(match[2]);
    }

    return {
        id: 0,
        name,
        description,
        osm: "",
        osmNode: "",
        lat,
        long,
        gmaps,
        type,
        location,
        web,
        email
    };
}


async function main() {
    const urls = fs.readFileSync("inf-extremadura-urls.csv", "utf-8")
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

    for (const url of urls) {
        let browser, page, proxy;
        try {
            ({ browser, page, proxy } = await Scraper.createBrowser({ rotateIp: true, headless: false }));
            if (proxy) {
                console.log(`🕵️ Usando proxy: ${proxy.username}@${proxy.server}`);
            }
            await Scraper.goto(page, url, { rotateIp: false });
            const html = await page.content();
            const company = await getCompanyInfo(html);
            appendToCsv(company)
            console.log("✅ Guardado: ", company.name);
            await Scraper.randomDelay(1500, 3500);
        } catch (e) {
            console.error(`Error en ${url}:`, e);
        } finally {
            if (browser) await browser.close();
        }
    }
}

if (require.main === module) {
    main().catch(console.error);
}
