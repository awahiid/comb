import { useEffect, useState } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import {useCompanyStore} from "@/stores/use-company-store";

export default function CompanyMap() {
    const osmNode = useCompanyStore(state => state.osmNode)

    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

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
        if (!coords) return

        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })

        const map = L.map("map", { zoomControl: false, attributionControl: false}).setView([coords.lat, coords.lon], 16)

        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}").addTo(map)

        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}").addTo(map)

        L.marker([coords.lat, coords.lon]).addTo(map)

        return () => { map.remove() }
    }, [coords])

    if (!osmNode) return null
    if (!coords) return <div>Loading</div>

    return <div id="map" className="border border-black mb-4 h-full" />
}