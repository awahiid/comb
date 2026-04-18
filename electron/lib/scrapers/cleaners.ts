import * as fs from "fs";
import * as path from "path";

// ─── Core functions ───────────────────────────────────────────────────────────

export function cleanString(value: string): string {
    return value
        .replace(/\u00A0/g, " ")   // NBSP
        .replace(/\u200B/g, "")    // Zero-width space
        .replace(/\uFEFF/g, "")    // BOM
        .replace(/\u00AD/g, "")    // Soft hyphen
        .trim();
}

export function parseCSV(raw: string): string[][] {
    const rows: string[][] = [];
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
        if (!line.trim()) continue;
        const fields: string[] = [];
        let i = 0;

        while (i < line.length) {
            if (line[i] === '"') {
                let val = "";
                i++;
                while (i < line.length) {
                    if (line[i] === '"' && line[i + 1] === '"') {
                        val += '"';
                        i += 2;
                    } else if (line[i] === '"') {
                        i++;
                        break;
                    } else {
                        val += line[i++];
                    }
                }
                fields.push(val);
                if (line[i] === ",") i++;
            } else {
                let val = "";
                while (i < line.length && line[i] !== ",") val += line[i++];
                fields.push(val);
                if (line[i] === ",") i++;
            }
        }

        rows.push(fields);
    }

    return rows;
}

export function serializeCSV(rows: string[][]): string {
    return rows
        .map(fields =>
            fields
                .map(f => {
                    const needsQuotes = f.includes(",") || f.includes('"') || f.includes("\n");
                    return needsQuotes ? `"${f.replace(/"/g, '""')}"` : f;
                })
                .join(",")
        )
        .join("\n");
}

export function dedupeRows(rows: string[][]): { rows: string[][], removed: number } {
    const seen = new Set<string>();
    const deduped = rows.filter(row => {
        const key = row.join("\x00");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    return { rows: deduped, removed: rows.length - deduped.length };
}

// ─── High-level API ───────────────────────────────────────────────────────────

export interface CleanCSVResult {
    inputRows: number;
    outputRows: number;
    duplicatesRemoved: number;
    outputPath: string;
}

export function cleanCSV(inputPath: string, outputPath?: string): CleanCSVResult {
    const raw = fs.readFileSync(inputPath, "utf-8");
    const rows = parseCSV(raw);

    if (rows.length === 0) throw new Error(`No data found in ${inputPath}`);

    const [header, ...dataRows] = rows;
    const cleaned = dataRows.map(row => row.map(cleanString));
    const { rows: deduped, removed } = dedupeRows(cleaned);

    const resolvedOutputPath = outputPath ?? path.join(
        path.dirname(inputPath),
        path.basename(inputPath, ".csv") + "_cleaned.csv"
    );

    fs.writeFileSync(resolvedOutputPath, serializeCSV([header, ...deduped]), "utf-8");

    return {
        inputRows: cleaned.length,
        outputRows: deduped.length,
        duplicatesRemoved: removed,
        outputPath: resolvedOutputPath,
    };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

if (require.main === module) {
    const inputPath = process.argv[2];
    if (!inputPath) {
        console.error("Usage: npx ts-node cleaners.ts <input.csv>");
        process.exit(1);
    }

    const result = cleanCSV(inputPath);
    console.log(`✔ Input rows:         ${result.inputRows}`);
    console.log(`✔ Duplicates removed: ${result.duplicatesRemoved}`);
    console.log(`✔ Output rows:        ${result.outputRows}`);
    console.log(`✔ Saved to:           ${result.outputPath}`);
}