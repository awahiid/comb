import React from "react";
import {Button} from "@/components/ui/button";
import CombAI from "@/assets/comb-ai.svg";

export default function EmailContentChat({ onClick }: {
    value: string,
    onClick: () => Promise<void>,
    onChange: (contentPrompt: string) => void,
}) {
    return <div className={"flex flex-col gap-2 w-full h-20 min-h-fit"}>
        <div className={"flex flex-col gap-2  mt-auto flex-1"}>
            <Button onClick={onClick} variant={"ghost"} className={"justify-between"}>
                Generate
                <CombAI/>
            </Button>
        </div>
    </div>;
}