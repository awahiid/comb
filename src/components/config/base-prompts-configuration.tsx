import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import React from "react";
import {ConfigComponentProps} from "@/components/config/configuration-card";

export function BasePromptsConfiguration({config, onChange}: ConfigComponentProps) {
    return <>
        <Label className={"flex flex-col items-start"}>
            <span className={"font-bold"}>Subject base prompt</span>
            <Textarea value={config.subjectBasePrompt} onChange={e => onChange("subjectBasePrompt", e.target.value)}/>
        </Label>
        <Label className={"flex flex-col items-start"}>
            <span className={"font-bold"}>Email base prompt</span>
            <Textarea value={config.contentBasePrompt} onChange={e => onChange("contentBasePrompt", e.target.value)}/>
        </Label>
        <Label className={"flex flex-col items-start"}>
            <span className={"font-bold"}>Description base prompt</span>
            <Textarea value={config.descriptionBasePrompt} onChange={e => onChange("descriptionBasePrompt", e.target.value)}/>
        </Label>
    </>;
}