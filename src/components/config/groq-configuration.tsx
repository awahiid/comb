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

export function GroqConfiguration({config, onChange}: ConfigComponentProps) {
    return <Label className={"flex flex-col items-start"}>
        <span className={"font-bold"}>Groq</span>
        <Label className={"flex gap-2 w-full text-md"}>
            Groq key
            <Input
                onChange={e => onChange("groqKey", e.target.value)}
                value={config.groqKey}
                placeholder={"Get yours at https://groq.com/"}
                className={"border-t-0 text-md border-x-0 rounded-none flex-2 min-w-20 max-w-full px-0 focus-visible:ring-0 shadow-none"}
            />
        </Label>
        <ModelConfiguration config={config} onChange={onChange} />
    </Label>;
}

interface GroqModel {
    id: string;
    object: string;
}

interface GroqModelsResponse {
    data: GroqModel[];
}

function ModelConfiguration({config, onChange}: ConfigComponentProps) {
    const [models, setModels] = useState<string[]>(config.model ? [config.model] : []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!config.groqKey) return;

        const fetchModels = async () => {
            setLoading(true);
            try {
                const res = await fetch("https://api.groq.com/openai/v1/models", {
                    headers: {Authorization: `Bearer ${config.groqKey}`}
                });
                const data: GroqModelsResponse = await res.json();
                const ids = data.data
                    .filter((m) => m.object === "model")
                    .map((m) => m.id)
                    .sort();
                setModels(ids);
            } catch (e) {
                setModels(config.model ? [config.model] : []);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [config.groqKey]);

    return (
        <Label>
            Model
            <Select value={config.model} onValueChange={value => onChange("model", value)} disabled={loading || !config.groqKey}>
                <SelectTrigger className="w-fit z-[200]">
                    <SelectValue placeholder={loading ? "Loading models..." : (!config.groqKey ? "Set a Groq API key first" : "Select a model")}/>
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