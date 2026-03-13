import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useConfigurationStore } from "@/stores/use-configuration-store"
import { useShallow } from "zustand/shallow"
import { showAlert } from "@/lib/utils"
import { useRef } from "react"
import {useEmailStore} from "@/stores/use-email-store";

export default function AutoConfiguration() {
    const { auto, autoSend, interval, set, save, config } = useConfigurationStore(
        useShallow(state => ({
            config: state.config,
            auto: state.config.auto,
            interval: state.config.sendIntervalSeconds,
            autoSend: state.config.autoSend,
            set: state.set,
            save: state.save
        }))
    )

    const attachments = useEmailStore(state => state.attachments);

    const prevIntervalRef = useRef(interval)

    const handleSaveInterval = (value: number) => {
        if (value !== prevIntervalRef.current) {
            prevIntervalRef.current = value
            save(config)
            showAlert({
                title: "Info",
                content: `The auto send interval has been set to ${value} seconds.`
            })
        }
    }

    const handleSaveAuto = (checked: boolean) => {
        if(checked && config.requiredAttachment && attachments.length <= 0) {
            showAlert({
                title: "Error",
                content: "Required attachment, add an attachment first before turning on auto mode",
                type: "error"
            })
            return
        }

        set("auto", checked)
    }

    return <div className={"flex gap-4"}>
        {auto && <div className="flex items-center space-x-2 justify-center">
            <Label htmlFor="send-interval" className={autoSend ? "text-destructive" : ""}>
                Auto send every
                <input
                    id="send-interval"
                    value={interval}
                    onFocus={e => { prevIntervalRef.current = Number(e.target.value) }}
                    onBlur={e => handleSaveInterval(Number(e.target.value))}
                    onChange={e => set("sendIntervalSeconds", Number(e.target.value))}
                    type={"number"}
                    min={10}
                    className={"rounded-none w-fit field-sizing-content h-lh px-1 gap-2 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-black border-0 border-b shadow-none"}
                />s
            </Label>
            <Switch id="auto-send" checked={autoSend} onCheckedChange={checked => set("autoSend", checked)} />
        </div>}
        <div className="flex items-center space-x-2 justify-center">
            <Label htmlFor="auto-mode">Auto mode</Label>
            <Switch id="auto-mode" checked={auto} onCheckedChange={handleSaveAuto} />
        </div>
    </div>
}