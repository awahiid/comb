import {chromium, ElementHandle} from "playwright";
import axios from "axios";
import {Company} from "../../../shared/types";
import fs from "fs";

import * as cheerio from "cheerio";
import {Scraper} from "../scraper";

const CSV_FILE = "informatica-extremadura-empresia.csv";
const CSV_HEADERS = "name,location,type,email,web,osmNode,lat,long,gmaps";
const MAIN_PAGE = "https://www.empresia.es/busqueda/?q=";
const NAMES_FILE = "informatica-extremadura-nombres.csv"

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


export async function getCompanyByURL(url: string): Promise<Company> {
    // Descargar el HTML de la página de la empresa
    let html = "";
    if (url.startsWith("file://")) {
        // Para pruebas locales
        html = fs.readFileSync(url.replace("file://", ""), "utf-8");
    } else {
        // Producción: usar playwright
        const { chromium } = await import("playwright");
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded" });
        console.log(`[Empresia] Navegando a ${url}`);
        html = await page.content();
        await browser.close();
    }
    const $ = cheerio.load(html);

    // Nombre
    const name = $("h1.iffyTip, .bolder").first().text().trim() || $("span.bolder").first().text().trim();

    // Dirección
    let location = "";
    const addressIcon = $('i.fa-address-book').parent();
    if (addressIcon.length) {
        location = addressIcon.text().replace(/\s+Ver mapa/, "").replace(/\s+/g, " ").trim();
    }

    // Web
    let web = "";
    const webIcon = $('i.fa-globe').parent();
    if (webIcon.length) {
        web = webIcon.text().replace(/www\./, "http://www.").replace(/\s+/g, "").trim();
    }

    // Email (no suele estar, pero por si acaso)
    let email: string | undefined = undefined;
    const emailIcon = $('i.fa-envelope').parent();
    if (emailIcon.length) {
        const possible = emailIcon.text().trim();
        if (possible.includes("@")) email = possible;
    }

    // Teléfono
    let description = undefined;
    const phoneIcon = $('i.fa-phone').parent();
    if (phoneIcon.length) {
        description = phoneIcon.text().trim();
    }

    // Tipo (CNAE)
    let type = "";
    const cnae = $(".list-group-item-text:contains('CNAE')").text();
    if (cnae) {
        type = cnae.split("CNAE").pop()?.trim() || "";
    }

    // Lat/Long y gmaps
    let lat = 0, long = 0, gmaps = url;
    const gmapsA = $('a[title="Ver en Google Maps"]');
    if (gmapsA.length) {
        gmaps = gmapsA.attr('href') || url;
        // Extraer lat/long del enlace
        const match = gmaps.match(/maps\?q=([\-0-9.]+),\s*([\-0-9.]+)/);
        if (match) {
            long = parseFloat(match[1]);
            lat = parseFloat(match[2]);
        }
    }


    // osm y osmNode no disponibles
    const company = {
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

    console.log(`[Empresia] ✅ ${company.name} | 📍 ${company.location} | 🌐 ${company.web || "sin web"} | 📂 ${company.type || "sin CNAE"}`);
    return company;
}

export async function getCompanyByName(name: string): Promise<Company | null> {
    const MAIN_URL = 'https://www.empresia.es/';
    const QUERY_URL = MAIN_URL + 'busqueda/?q=' + encodeURIComponent(name);

    const { browser, page } = await Scraper.createBrowser({ rotateIp: false, headless: true });
    try {
        await page.goto(QUERY_URL, { waitUntil: "domcontentloaded" });
        console.log(`[Empresia]: Navegando a ${QUERY_URL}`);

        const result = await page.$('td > a[href^="/empresa/"]');
        if (!result) return null

        const href = await result.getAttribute('href');
        const COMPANY_URL = MAIN_URL + href;

        console.log(`[Empresia] 🔍 "${name}" → ${COMPANY_URL}`);
        return getCompanyByURL(COMPANY_URL);
    } catch (e) {
        console.error(e);
        return null;
    } finally {
        await browser.close();
    }
}

async function main() {
    const namesRaw = fs.readFileSync(NAMES_FILE, "utf-8");
    const names = namesRaw.split(/\r?\n/).filter(line => line.trim().length > 0);

    const browser = await chromium.launch();
    const page = await browser.newPage();


    for (const name of names) {
        const searchUrl = MAIN_PAGE + encodeURIComponent(name);
        console.log(`Buscando: ${name} -> ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
        const html = await page.content();
        const $ = cheerio.load(html);

        // Buscar el primer enlace de empresa
        const firstCompanyA = $('td > a[href^="/empresa/"]').first();
        if (firstCompanyA.length === 0) {
            console.log(`No se encontró empresa para: ${name}`);
            continue;
        }
        const href = firstCompanyA.attr('href');

        if (!href) {
            console.log(`No se encontró href para: ${name}`);
            continue;
        }

        const companyUrl = `https://www.empresia.es${href}`;
        console.log(`URL empresa encontrada: ${companyUrl}`);

        const company = await getCompanyByURL(companyUrl);
        appendToCsv(company);

        await page.waitForTimeout(500);
    }

    await browser.close();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}
