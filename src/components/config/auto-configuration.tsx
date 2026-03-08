import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {useShallow} from "zustand/shallow";

export default function AutoConfiguration() {
    const {auto, set} = useConfigurationStore(
        useShallow(state => ({
            auto: state.config.auto,
            set: state.set
        }))
    )

    return <div className="flex items-center space-x-2 justify-center">
        <Label htmlFor="auto-mode">Auto mode</Label>
        <Switch id="auto-mode" checked={auto} onCheckedChange={checked => set("auto", checked)} />
    </div>
}