'use client';

import {useEffect, useRef, useState} from "react"
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import {useCompanyStore} from "@/stores/use-company-store";

export default function CompanyMap() {
    const osmNode = useCompanyStore(state => state.osmNode)
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
    const mapRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function fetchNode() {
            const type = { N: "node", W: "way", R: "relation" }[osmNode![0]] ?? "node";
            const id = osmNode!.slice(1);

            const query = `[out:json];${type}(${id});out center;`;
            const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await res.json();
            const el = data.elements[0];

            setCoords({ lat: el.lat ?? el.center.lat, lon: el.lon ?? el.center.lon });
        }

        if (osmNode) fetchNode();
    }, [osmNode])

    useEffect(() => {
        if (!coords || !mapRef.current) return

        const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false}).setView([coords.lat, coords.lon], 16)

        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}").addTo(map)

        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}").addTo(map)

        L.marker([coords.lat, coords.lon]).addTo(map)

        return () => { map.remove() }
    }, [osmNode, coords])

    if(!osmNode) return <div className="border border-black mb-4 h-full z-0 flex items-center justify-center">No map :[</div>
    if (!coords ) return <div className="border border-black mb-4 h-full z-0 flex items-center justify-center">Loading map :/ ...</div>

    return <div ref={mapRef} className="border border-black mb-4 h-full z-0" />
}