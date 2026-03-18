import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import React, {useEffect, useState} from "react";
import {ConfigComponentProps} from "@/components/config/configuration-card";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Configuration, KEY_TYPES} from "@shared/types";

export function AIConfiguration({config, onChange}: ConfigComponentProps) {
    return <Label className={"flex flex-col items-start"}>
        <span className={"font-bold"}>AI Configuration</span>
        <Label className="flex gap-2 w-full text-md">
            API Service
            <Select value={config.keyType} onValueChange={value => onChange("keyType", value as Configuration["keyType"])}>
                <SelectTrigger className="w-fit z-[200]">
                    <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent className="w-full z-[200]">
                    <SelectGroup>
                        <SelectLabel>Providers</SelectLabel>
                        {KEY_TYPES.map(kt => (
                            <SelectItem key={kt} value={kt} className="min-w-fit">
                                {kt}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </Label>
        <KeyConfiguration config={config} onChange={onChange} />
        <ModelConfiguration config={config} onChange={onChange} />
    </Label>;
}

function KeyConfiguration({config, onChange}: ConfigComponentProps) {
    return (
        <Label className={"flex gap-2 w-full text-md"}>
            API Key
            <Input
                onChange={e => onChange("key", e.target.value)}
                value={config.key}
                placeholder={"Get yours at https://groq.com/"}
                className={"border-t-0 text-md border-x-0 rounded-none flex-2 min-w-20 max-w-full px-0 focus-visible:ring-0 shadow-none"}
            />
        </Label>
    )
}

function ModelConfiguration({config, onChange}: ConfigComponentProps) {
    const [models, setModels] = useState<string[]>(config.model ? [config.model] : []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!config.key || !config.keyType) return;

        const fetchModels = async () => {
            setLoading(true);
            try {
                const models: string[] = await window.electronAPI.getModels();
                console.log(models);
                setModels(models);
            } catch {
                setModels(config.model ? [config.model] : []);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [config.key, config.keyType]);

    return (
        <Label>
            Model
            <Select value={config.model} onValueChange={value => onChange("model", value)} disabled={loading || !config.key}>
                <SelectTrigger className="w-fit z-[200]">
                    <SelectValue placeholder={loading ? "Loading models..." : (!config.key ? "Set a Groq API key first" : "Select a model")}/>
                </SelectTrigger>
                <SelectContent className="w-full z-[200]">
                    <SelectGroup>
                        <SelectLabel>Models</SelectLabel>
                        {models.map((model) => (
                            <SelectItem key={model} value={model} className={"min-w-fit"}>
                                {model}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </Label>
    );
}