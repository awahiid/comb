import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as dotenv from "dotenv";

dotenv.config();
chromium.use(StealthPlugin());

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
    return {
        server: `http://p.webshare.io:80`,
        username: `${process.env.PROXY_USER}-${n}`,
        password: process.env.PROXY_PASS
    };
}

function randomDelay(min = 1500, max = 4000): Promise<void> {
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min)) + min));
}

function pageDelay(): Promise<void> {
    return new Promise(r => setTimeout(r, Math.floor(Math.random() * (12000 - 6000)) + 6000));
}

export class Scraper {
    static async createBrowser({ rotateIp = true, headless = false }: { rotateIp?: boolean, headless?: boolean } = {}) {
        const proxy = rotateIp ? nextProxy() : undefined;
        const browser = await chromium.launch({
            headless,
            slowMo: 50,
            proxy,
        });
        const context = await browser.newContext({
            userAgent: randomUserAgent(),
            viewport: {
                width: 1280 + Math.floor(Math.random() * 120),
                height: 800 + Math.floor(Math.random() * 80),
            },
            locale: "es-ES",
        });
        const page = await context.newPage();
        await page.addInitScript(
            "Object.defineProperty(navigator, 'webdriver', { get: () => undefined });\n" +
            "Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });\n" +
            "Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });\n" +
            "Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });\n"
        );

        if(proxy) console.log(`🕵️ Usando proxy: ${proxy.username}@${proxy.server}`);
        return { browser, page, proxy };
    }

    static async goto(page: import('playwright').Page, url: string, { rotateIp = true, stealth = true }: { rotateIp?: boolean, stealth?: boolean } = {}) {
        // Si rotateIp, cerrar el browser y crear uno nuevo con proxy distinto
        // (esto se gestiona fuera de este método normalmente)
        if(rotateIp) {

        }
        console.log(`➡️ Navegando a ${url} ${rotateIp ? "(rotando IP)" : ""} ${stealth ? "(modo sigiloso)" : ""}`);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await randomDelay(2000, 5000);
        await this.moveMouseRandom(page, Math.floor(7 + Math.random() * 7));
        await this.randomScroll(page, Math.floor(2 + Math.random() * 3));
    }

    static async moveMouseRandom(page: import('playwright').Page, interactions = 10) {
        const { width, height } = await page.viewportSize() || { width: 1280, height: 800 };
        for (let i = 0; i < interactions; i++) {
            const x = Math.floor(Math.random() * width * 0.95);
            const y = Math.floor(Math.random() * height * 0.95);
            await page.mouse.move(x, y, { steps: Math.floor(3 + Math.random() * 5) });
            await page.waitForTimeout(Math.random() * 600 + 200);
        }
    }

    static async randomScroll(page: import('playwright').Page, scrolls = 3) {
        for (let i = 0; i < scrolls; i++) {
            await page.mouse.wheel(0, Math.floor(Math.random() * 400 + 120));
            await page.waitForTimeout(Math.random() * 800 + 350);
        }
    }

    static randomDelay = randomDelay;
    static pageDelay = pageDelay;
    static randomUserAgent = randomUserAgent;
    static nextProxy = nextProxy;
}
