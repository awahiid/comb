import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useConfigurationStore } from "@/stores/use-configuration-store"
import { useShallow } from "zustand/shallow"
import { useRef } from "react"

export default function AutoConfiguration() {
    const { config, set } = useConfigurationStore(
        useShallow(state => ({
            config: state.autoConfig,
            set: state.autoSetter
        }))
    )

    const prevIntervalRef = useRef(config.sendIntervalSeconds)

    const handleSaveInterval = (value: number) => {
        if (value !== prevIntervalRef.current) {
            prevIntervalRef.current = value
            set("sendIntervalSeconds", value)
        }
    }

    return <div className={"flex gap-4"}>
        {config.autoGenerate && <div className="flex items-center space-x-2 justify-center">
            <Label htmlFor="send-interval" className={config.autoSend ? "text-destructive" : ""}>
                Auto send every
                <input
                    id="send-interval"
                    value={config.sendIntervalSeconds}
                    onFocus={e => { prevIntervalRef.current = Number(e.target.value) }}
                    onBlur={e => handleSaveInterval(Number(e.target.value))}
                    onChange={e => set("sendIntervalSeconds", Number(e.target.value))}
                    type={"number"}
                    min={10}
                    className={"rounded-none w-fit field-sizing-content h-lh px-1 gap-2 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-black border-0 border-b shadow-none"}
                />s
            </Label>
            <Switch id="auto-send" checked={config.autoSend} onCheckedChange={checked => set("autoSend", checked)} />
        </div>}
        <div className="flex items-center space-x-2 justify-center">
            <Label htmlFor="auto-mode">Auto mode</Label>
            <Switch id="auto-mode" checked={config.autoGenerate} onCheckedChange={checked => set("autoGenerate", checked)} />
        </div>
    </div>
}