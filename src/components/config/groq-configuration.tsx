import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import React from "react";
import {ConfigComponentProps} from "@/components/config/configuration-card";

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
    </Label>;
}