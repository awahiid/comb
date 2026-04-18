import fs from "fs";
import {Company} from "../../../shared/types";

const CSV_HEADERS = "name,location,type,email,web,osmNode,lat,long,gmaps";

export function appendCompanyToCsv(csvPath: string, company: Company) {
    if (!fs.existsSync(csvPath)) fs.writeFileSync(csvPath, CSV_HEADERS + "\n", "utf-8");

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

    console.log(`[CSV] 💾 "${company.name}" → ${csvPath}`);
    fs.appendFileSync(csvPath, row + "\n", "utf-8");
}

export function appendToCSV(csvPath: string, line: string) {
    if (!fs.existsSync(csvPath)) fs.writeFileSync(csvPath, CSV_HEADERS + "\n", "utf-8");
    fs.appendFileSync(csvPath, line + "\n", "utf-8");
}