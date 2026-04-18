import {Scraper} from "../scraper";
import {appendCompanyToCsv, appendToCSV} from "../csv-manage";
import {Company} from "../../../../shared/types";
import {getCompanyByName} from "../empresia/empresia";
import * as cheerio from "cheerio";
import {cleanCSV} from "../cleaners";

const CSV_NAMES_PATH = "tech-talent-nombres.csv";
const CSV_COMPANIES_PATH = "extremadura-tech-talent.csv";
const CSV_COMPANIES_URLS = "tech-talent-urls.csv"
const MAIN_PAGE = 'https://techtalent.oficinaparalainnovacion.es/empresas/';
const BATCH_SIZE = 10;
const getPage = (page: number) => `https://techtalent.oficinaparalainnovacion.es/empresas/page/${page}/`;

async function* navigate(): AsyncGenerator<string> {
    const { browser, page } = await Scraper.createBrowser({ rotateIp: false, headless: true });
    try {
        let index = 2;
        console.log(`[Tech Talent] 🔍 Navegando a ${MAIN_PAGE}`);
        await page.goto(MAIN_PAGE);

        while (true) {
            yield await page.content();

            const next = await page.$("a.pagination-item-next-link");
            if (!next) break;

            console.log(`[Tech Talent] 🔍 Navegando a ${getPage(index)}`);
            await page.goto(getPage(index++));
        }
    } catch (e) {
        console.error(`[Tech Talent] ❌ Error scraping:`, e);
    } finally {
        await browser.close();
    }
}

async function getCompanyNames(autoSave: boolean = false): Promise<string[]> {
    const companyNames: string[] = [];

    for await (const html of navigate()) {
        const $ = cheerio.load(html);
        const names = $("h4.tbk__title").map((_, el) => $(el).text().trim()).get();
        if(autoSave) names.map(name => appendToCSV(CSV_NAMES_PATH, name) );
        companyNames.push(...names);
    }

    console.log(`[Tech Talent] ✅ ${companyNames.length} nombres encontrados`);
    return companyNames;
}

async function getCompanyURLS(autoSave: boolean = false): Promise<string[]> {
    const companyURLS: string[] = [];

    for await (const html of navigate()) {
        const $ = cheerio.load(html);
        const urls = $("a.boton-empresas").map((_, el) => $(el).attr('href')).get();
        if(autoSave) urls.map(url => appendToCSV(CSV_COMPANIES_URLS, url || "") );
        companyURLS.push(...urls);
    }

    console.log(`[Tech Talent] ✅ ${companyURLS.length} URLs encontradas`);
    return companyURLS;
}

export async function getCompanyByURL(url: string, autoSave: boolean = false): Promise<Company | null> {
    const { browser, page } = await Scraper.createBrowser({ rotateIp: false, headless: true });

    try {
        console.log(`[Tech Talent] Obteniendo empresa de ${url}`);
        await page.goto(url, { waitUntil: "domcontentloaded" });

        const $ = cheerio.load(await page.content());

        const company: Company = {
            id:          0,
            name:        $("h4.tbk__title").first().text().trim(),
            description: $("h4.tbk__subtitle").first().text().trim(),
            web:         $("a.enlace_oferta").attr("href") || "",
            email:       undefined,
            location:    "",
            type:        "Software",
            osm:         "",
            osmNode:     "",
            lat:         0,
            long:        0,
            gmaps:       "",
        };

        console.log(`[Tech Talent] ✅ ${company.name} | 🌐 ${company.web || "sin web"}`);
        if (autoSave) appendCompanyToCsv(CSV_COMPANIES_PATH, company);
        return company;
    } catch (e) {
        console.error(`[Tech Talent] ❌ Error obteniendo empresa de ${url}`, e);
        return null;
    } finally {
        await browser.close();
    }
}

export async function getCompanies(autoSave: boolean = false): Promise<Company[]> {
    const urls = await getCompanyURLS(autoSave);
    const results: Company[] = [];

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batch = urls.slice(i, i + BATCH_SIZE);
        const companies = await Promise.all(batch.map(url => getCompanyByURL(url, autoSave)));
        const valid = companies.filter((c): c is Company => c !== null);
        results.push(...valid);
        console.log(`[Tech Talent] 📦 Batch ${Math.floor(i / BATCH_SIZE) + 1} completado — ${results.length}/${urls.length} empresas`);
    }

    console.log(`[Tech Talent] ✅ ${results.length} empresas obtenidas en total`);
    return results;
}

// export async function getCompaniesWithEmpresia(): Promise<Company[]> {
//     const companyNames = await getCompanyNames();
//     if (!companyNames) return [];
//
//     const results = await Promise.all(companyNames.map(name => getCompanyByName(name)));
//     return results.filter(c => c !== null);
// }

async function main() {
    await getCompanies(true);
    cleanCSV("tech-talent.csv", "tech-talent-clean.csv");
}

if (require.main === module) {
    main().catch(console.error);
}