import { chromium } from "playwright-extra";
import { Company } from "../../../shared/types";
import fs from "fs";
import * as cheerio from "cheerio";
import readline from "readline";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as dotenv from "dotenv";
dotenv.config();

// Registrar el plugin UNA sola vez — playwright-extra ignora registros duplicados
chromium.use(StealthPlugin());

// Delay aleatorio entre min y max ms para simular comportamiento humano
function randomDelay(min = 1500, max = 4000): Promise<void> {
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min)) + min));
}

// Delay más largo entre páginas para no saturar el servidor
function pageDelay(): Promise<void> {
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (12000 - 6000)) + 6000));
}

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
];

function randomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function nextProxy() {
    const n = Math.floor(Math.random() * 20000) + 1;
    console.log(`🔄 Usando proxy p.webshare.io:80 usuario ${process.env.PROXY_USER}-${n}`);
    return {
        server: `http://p.webshare.io:80`,
        username: `${process.env.PROXY_USER}-${n}`,
        password: process.env.PROXY_PASS
    };
}

/**
 * Mueve el ratón de forma suave/aleatoria dentro del viewport
 */
async function moveMouseRandom(page: import('playwright').Page, interactions = 10) {
    const { width, height } = await page.viewportSize() || {width: 1280, height: 800};

    for (let i = 0; i < interactions; i++) {
        const x = Math.floor(Math.random() * width * 0.95);
        const y = Math.floor(Math.random() * height * 0.95);
        await page.mouse.move(x, y, { steps: Math.floor(3 + Math.random() * 5) });
        await page.waitForTimeout(Math.random() * 600 + 200);
    }
}

/**
 * Realiza uno o varios scrolls aleatorios en la página principal
 */
async function randomScroll(page: import('playwright').Page, scrolls = 3) {
    for (let i = 0; i < scrolls; i++) {
        await page.mouse.wheel(0, Math.floor(Math.random() * 400 + 120));
        await page.waitForTimeout(Math.random() * 800 + 350);
    }
}

const CSV_FILE = "informatica-extremadura-1.csv";
const CSV_HEADERS = "name,location,type,email,web,osmNode,lat,long,gmaps,url";
const MAIN_PAGE = "https://www.informa.es/directorio-empresas/620_PROGRAMACION-CONSULTORIA-OTRAS-ACTIVIDADES-RELACIONADAS-INFORMATICA/Comunidad_EXTREMADURA.html";

if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, CSV_HEADERS + "\n", "utf-8");
}

function appendToCsv(company: Company & { url: string }) {
    const row = [
        company.name,
        company.location,
        company.type,
        company.email ?? "",
        company.web ?? "",
        company.osmNode ?? "",
        company.lat,
        company.long,
        company.gmaps ?? "",
        company.url,
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");

    fs.appendFileSync(CSV_FILE, row + "\n", "utf-8");
}

async function createContext(browser: Awaited<ReturnType<typeof chromium.launch>>) {
    const proxy = nextProxy();
    // Hay que cerrar el browser y relanzar porque Playwright no permite
    // cambiar el proxy de un context existente
    await browser.close();
    const newBrowser = await chromium.launch({
        headless: false,
        slowMo: 50,
        proxy,
    });
    const context = await newBrowser.newContext({
        userAgent: randomUserAgent(),
        viewport: {
            width:  1280 + Math.floor(Math.random() * 120),
            height:  800 + Math.floor(Math.random() * 80),
        },
        locale: "es-ES",
        // Sin cookies preexistentes — contexto limpio en cada rotación
    });
    const page = await context.newPage();
    await page.addInitScript(
        "Object.defineProperty(navigator, 'webdriver', { get: () => undefined });\n" +
        "Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] }); // Mimic common plugin count\n" +
        "Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });\n" +
        "Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 }); // Mimic common device memory\n"
    )
    return { browser: newBrowser, page };
}

async function createBrowser() {
    const proxy = nextProxy();
    const browser = await chromium.launch({
        headless: false,
        slowMo: 50,
        proxy,
    });
    const context = await browser.newContext({
        userAgent: randomUserAgent(),
        viewport: {
            width:  1280 + Math.floor(Math.random() * 120),
            height:  800 + Math.floor(Math.random() * 80),
        },
        locale: "es-ES",
    });
    const page = await context.newPage();
    return { browser, page };
}

async function main() {
    let pageNum = 5;
    let currentPage = pageNum ? MAIN_PAGE + '/Empresas-' + pageNum + '.html' : MAIN_PAGE;
    let hasNext = true;
    let companyId = 1;
    let minTime = 10 * 1000;
    let maxTime = 20 * 1000;

    let { browser, page } = await createBrowser();

    while (hasNext) {
        // Rotar IP en cada página — nueva IP, nuevo user-agent, contexto limpio
        if (pageNum > 1) {
            ({ browser, page } = await createContext(browser));
        }

        try {
            await page.goto(currentPage, { waitUntil: "domcontentloaded" });
        } catch (e) { continue }

        await randomDelay(minTime, maxTime);

        await moveMouseRandom(page, Math.floor(7 + Math.random()*7));   // entre 7 y 14 movimientos random
        await randomScroll(page, Math.floor(2 + Math.random()*3));      // entre 2 y 5 scrolls

        try {
            await page.click('button:has-text("Aceptar")', { timeout: 2000 });
        } catch {}

        await randomDelay(minTime, maxTime);

        if (await page.$('iframe[src*="recaptcha"]')) {
            console.log("⚠️ Captcha detectado. Resuélvelo en la ventana y pulsa ENTER aquí para continuar...");
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            await new Promise<void>(resolve =>
                rl.question("Presiona ENTER para continuar después de resolver el captcha...", () => {
                    rl.close();
                    resolve();
                })
            );
        }

        const html = await page.content();

        const $ = cheerio.load(html);
        const rows = $("tr[itemprop='itemListElement']");
        console.log(`Página ${pageNum} - Filas encontradas: ${rows.length}`);

        rows.each((_, el) => {
            const name = $(el).find("td.nom_empresa span[itemprop='name']").text().trim();
            if (!name) return;

            // URL de la ficha en informa.es (para enriquecer datos después)
            const rawUrl =
                $(el).find("td.nom_empresa a[itemprop='url']").attr("href") ??
                $(el).find("td.nom_empresa a").attr("href") ??
                "";
            const url = rawUrl.startsWith("http")
                ? rawUrl
                : rawUrl
                    ? `https://www.informa.es${rawUrl}`
                    : "";

            const location = $(el).find("td[itemprop='address'] span[itemprop='addressLocality']").text().trim();
            const type = $(el).find("td[itemprop='address'] span[itemprop='addressRegion']").text().trim();

            let web = $(el).find("td").eq(3).text().trim();
            if (web && !web.startsWith("www.") && web.includes(".")) web = "www." + web;

            const company: Company & { url: string } = {
                id: companyId++,
                name,
                description: "",
                osm: "",
                osmNode: "",
                lat: 0,
                long: 0,
                gmaps: "",
                type,
                location,
                web,
                email: undefined,
                url,
            };

            appendToCsv(company);
            console.log(company);
        });

        // Siguiente página
        const nextBtn = $("a.next[aria-label='Next']");
        if (nextBtn.length > 0) {
            const nextHref = nextBtn.attr("href");
            if (nextHref) {
                currentPage = nextHref.startsWith("http")
                    ? nextHref
                    : `https://www.informa.es${nextHref}`;
                pageNum++;
                console.log(`⏳ Esperando antes de la página ${pageNum}...`);
                await pageDelay();
            } else {
                hasNext = false;
            }
        } else {
            hasNext = false;
        }
    }

    await browser.close();
    console.log(`\n✅ Scraping finalizado. ${companyId - 1} empresas guardadas en ${CSV_FILE}`);
}

if (require.main === module) {
    main().catch(console.error);
}