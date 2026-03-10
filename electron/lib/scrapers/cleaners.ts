import * as fs from "fs";
import * as path from "path";

const inputPath = process.argv[2];

if (!inputPath) {
    console.error("Usage: npx ts-node cleaners.ts <input.csv>");
    process.exit(1);
}

function cleanString(value: string): string {
    return value
        .replace(/\u00A0/g, " ")   // NBSP
        .replace(/\u200B/g, "")    // Zero-width space
        .replace(/\uFEFF/g, "")    // BOM
        .replace(/\u00AD/g, "")    // Soft hyphen
        .trim();
}

function parseCSV(raw: string): string[][] {
    const rows: string[][] = [];
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
        if (!line.trim()) continue;
        const fields: string[] = [];
        let i = 0;

        while (i < line.length) {
            if (line[i] === '"') {
                let val = "";
                i++; // skip opening quote
                while (i < line.length) {
                    if (line[i] === '"' && line[i + 1] === '"') {
                        val += '"';
                        i += 2;
                    } else if (line[i] === '"') {
                        i++; // skip closing quote
                        break;
                    } else {
                        val += line[i++];
                    }
                }
                fields.push(val);
                if (line[i] === ",") i++;
            } else {
                let val = "";
                while (i < line.length && line[i] !== ",") {
                    val += line[i++];
                }
                fields.push(val);
                if (line[i] === ",") i++;
            }
        }

        rows.push(fields);
    }

    return rows;
}

function serializeCSV(rows: string[][]): string {
    return rows
        .map((fields) =>
            fields
                .map((f) => {
                    const needsQuotes = f.includes(",") || f.includes('"') || f.includes("\n");
                    const escaped = f.replace(/"/g, '""');
                    return needsQuotes ? `"${escaped}"` : f;
                })
                .join(",")
        )
        .join("\n");
}

// --- Main ---
const raw = fs.readFileSync(inputPath, "utf-8");
const rows = parseCSV(raw);

if (rows.length === 0) {
    console.error("No data found.");
    process.exit(1);
}

const [header, ...dataRows] = rows;

// Clean all values
const cleaned = dataRows.map((row) => row.map(cleanString));

// Remove duplicate rows (compare all fields)
const seen = new Set<string>();
const deduped = cleaned.filter((row) => {
    const key = row.join("\x00");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
});

const removedDupes = cleaned.length - deduped.length;

// Output
const outputPath = path.join(
    path.dirname(inputPath),
    path.basename(inputPath, ".csv") + "_cleaned.csv"
);

const output = serializeCSV([header, ...deduped]);
fs.writeFileSync(outputPath, output, "utf-8");

console.log(`✔ Input rows:        ${cleaned.length}`);
console.log(`✔ Duplicates removed: ${removedDupes}`);
console.log(`✔ Output rows:       ${deduped.length}`);
console.log(`✔ Saved to:          ${outputPath}`);