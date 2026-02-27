import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import React from "react";
import {ConfigComponentProps} from "@/components/config/configuration-card";

export function BridgeConfiguration({config, onChange}: ConfigComponentProps) {
    return <Label className={"flex flex-col items-start"}>
        <span className={"font-bold"}>SMTP Configuration</span>
        <div className={"w-full flex flex-col gap-2"}>
            <Label className={"flex gap-2 w-full text-md"}>
                User
                <Input
                    value={config.user}
                    onChange={e => onChange("user", e.target.value)}
                    placeholder={"your@email.com"}
                    className={"border-t-0 text-md border-x-0 rounded-none flex-2 min-w-20 max-w-full px-0 focus-visible:ring-0 shadow-none"}
                />
            </Label>
            <Label className={"flex gap-2 w-full text-md"}>
                Pass
                <Input
                    value={config.pass}
                    onChange={e => onChange("pass", e.target.value)}
                    placeholder={"securepassword"}
                    className={"border-t-0 text-md border-x-0 rounded-none flex-2 min-w-20 max-w-full px-0 focus-visible:ring-0 shadow-none"}
                />
            </Label>
            <Label className={"flex gap-2 w-full text-md"}>
                Hostname
                <Input
                    value={config.hostname}
                    onChange={e => onChange("hostname", e.target.value)}
                    placeholder={"127.0.0.1"}
                    className={"border-t-0 text-md border-x-0 rounded-none flex-2 min-w-20 max-w-full px-0 focus-visible:ring-0 shadow-none"}
                />
            </Label>
            <Label className={"flex gap-2 w-full text-md"}>
                Port
                <Input
                    value={config.port}
                    onChange={e => onChange("port", e.target.value)}
                    placeholder={"1569"}
                    className={"border-t-0 text-md border-x-0 rounded-none flex-2 min-w-20 max-w-full px-0 focus-visible:ring-0 shadow-none"}
                />
            </Label>
        </div>
    </Label>;
}