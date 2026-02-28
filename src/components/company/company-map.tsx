import { useEffect, useState } from "react"
import "leaflet/dist/leaflet.css"
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";

export default function CompanyMap() {
    const { osmNode } = useCompanyStore(
        useShallow(state => ({
            osmNode: state.company?.osmNode
        }))
    )

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

    if (!osmNode) return null

    if (!coords) return <div>Loading</div>

    const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon-0.005},${coords.lat-0.005},${coords.lon+0.005},${coords.lat+0.005}&layer=mapnik&marker=${coords.lat},${coords.lon}`

    return <iframe
        src={embedUrl}
        width="100%"
        height="300"
        loading="lazy"
        className={"border"}
    />
}