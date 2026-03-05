"use client"

import {Button} from "@/components/ui/button";

export default function TestComponent() {
    async function fetchSecret() {
        if (typeof window !== "undefined" && window.electronAPI) {
            const secret = await window.electronAPI.serverOnlyOperation()
            console.log(secret)
        }
    }

    return (
        <Button onClick={fetchSecret}>
            Probar
        </Button>
    )
}