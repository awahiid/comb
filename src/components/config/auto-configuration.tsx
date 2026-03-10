import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {useShallow} from "zustand/shallow";

export default function AutoConfiguration() {
    const {auto, autoSend, set} = useConfigurationStore(
        useShallow(state => ({
            auto: state.config.auto,
            autoSend: state.config.autoSend,
            set: state.set
        }))
    )

    return <div className={"flex gap-4"}>
        {auto && <div className="flex items-center space-x-2 justify-center">
            <Label htmlFor="auto-mode" className={autoSend ? "text-destructive" : ""}>Auto send</Label>
            <Switch id="auto-mode" checked={autoSend} onCheckedChange={checked => set("autoSend", checked)}/>
        </div>}
        <div className="flex items-center space-x-2 justify-center">
            <Label htmlFor="auto-mode">Auto mode</Label>
            <Switch id="auto-mode" checked={auto} onCheckedChange={checked => set("auto", checked)} />
        </div>
    </div>
}