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
            const res = await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmNode}.json`)
            const data = await res.json()
            const node = data.elements[0]
            setCoords({ lat: node.lat, lon: node.lon })
        }
        fetchNode()
    }, [osmNode])

    useEffect(() => {
        if (!coords || !mapRef.current) return

        const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false}).setView([coords.lat, coords.lon], 16)

        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}").addTo(map)

        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}").addTo(map)

        L.marker([coords.lat, coords.lon]).addTo(map)

        return () => { map.remove() }
    }, [coords])

    if (!osmNode) return null
    if (!coords) return <div>Loading</div>

    return <div ref={mapRef} className="border border-black mb-4 h-full z-0" />
}