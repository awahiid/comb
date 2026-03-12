import {Label} from "@/components/ui/label";
import React from "react";
import {ConfigComponentProps} from "@/components/config/configuration-card";
import {Switch} from "@/components/ui/switch";

export function RequiredAttachmentConfig({config, onChange}: ConfigComponentProps) {
    return <div className="flex flex-col gap-2 space-x-2">
        <Label htmlFor="auto-mode" className={"font-bold"}>Required attachment</Label>
        <div className={"flex gap-2 text-sm"}>
            <Switch id="auto-mode" checked={config.requiredAttachment} onCheckedChange={checked => onChange("requiredAttachment", checked)} />
            <p>Set this field to require an attachment.</p>
        </div>
    </div>;
}