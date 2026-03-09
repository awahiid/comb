import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import { Company } from "../../../shared/types";

interface OsmElement {
    type: "node" | "way" | "relation";
    id: number;
    lat?: number;
    lon?: number;
    center?: {
        lat: number;
        lon: number;
    };
    tags?: {
        name?: string;
        website?: string;
        shop?: string;
        tourism?: string;
        amenity?: string;
        man_made?: string;
        "addr:city"?: string;
        "addr:municipality"?: string;
        "addr:state"?: string;
    };
}

interface OsmResponse {
    elements: OsmElement[];
}

type CsvRecord = Omit<Company, "id" | "description" | "email">

if (!fs.existsSync("./docs")) {
    fs.mkdirSync("./docs");
}

const csvWriter = createObjectCsvWriter({
    path: "./docs/suiza-software.csv",
    header: [
        { id: "name", title: "name" },
        { id: "osm", title: "osm" },
        { id: "osmNode", title: "osmNode" },
        { id: "lat", title: "lat" },
        { id: "long", title: "long" },
        { id: "type", title: "type" },
        { id: "gmaps", title: "gmaps" },
        { id: "location", title: "location" },
        { id: "web", title: "web" },
    ],
});

const query = `
[out:json][timeout:180];
area["boundary"="administrative"]["ISO3166-1:alpha2"="CH"]->.a;
(
    node["shop"="farm"](area.a);
    way["shop"="farm"](area.a);
    node["landuse"="farmyard"](area.a);
    way["landuse"="farmyard"](area.a);
    node["building"="farm"](area.a);
    way["building"="farm"](area.a);
);
out center;
`;

const url = "https://overpass-api.de/api/interpreter";

async function run(): Promise<void> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    const data: OsmResponse = await res.json();

    const records: CsvRecord[] = data.elements.flatMap((el) => {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        const type = el.tags?.shop ?? el.tags?.tourism ?? el.tags?.amenity ?? el.tags?.man_made;
        const location = el.tags?.["addr:city"] ?? el.tags?.["addr:municipality"] ?? el.tags?.["addr:state"];

        if (!el.tags?.name || !el.tags?.website || !lat || !lon || !type || !location) return [];

        return [{
            name: el.tags.name,
            osm: `https://www.openstreetmap.org/${el.type}/${el.id}`,
            osmNode: `${el.id}`,
            lat,
            long: lon,
            type,
            gmaps: `https://www.google.com/maps?q=${lat},${lon}`,
            location,
            web: el.tags.website,
        } satisfies CsvRecord];
    });

    await csvWriter.writeRecords(records);
    console.log(`CSV creado con ${records.length} registros.`);
}

run().catch(console.error);