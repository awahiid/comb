import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import CombAI from "@/assets/comb-ai.svg";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {IoIosArrowDown} from "react-icons/io";

export default function EmailContentChat({value, onClick, onChange}: {
    value: string,
    onClick: () => Promise<void>,
    onChange: (contentPrompt: string) => void,
}) {
    const [collapse, setCollapse] = useState(true);

    return <div className={"flex flex-col gap-2 w-full h-20 min-h-fit"}>
        <div className={"flex flex-col gap-2  mt-auto flex-1"}>
            <Button onClick={onClick} variant={"ghost"} className={"justify-between"}>
                Generate
                <CombAI/>
            </Button>
        </div>

        <div className={"relative h-fit overflow-hidden"}>
            <Textarea
                id="user-prompt"
                onFocus={() => setCollapse(false)}
                onBlur={() => setCollapse(true)}
                className={cn("max-w-full w-full resize-none p-2 transition-all", collapse ? "line-clamp-4 pb-2" : "min-h-fit")}
                placeholder="Edita el email..."
                value={value}
                onChange={e => onChange(e.target.value)}
            />

            {collapse &&
                <button
                    className="absolute right-0 top-0 p-1 m-2 opacity-80 hover:opacity-100 transition-all cursor-pointer bg-secondary border rounded-full "
                    onClick={() => setCollapse(!collapse)}
                >
                    <IoIosArrowDown/>
                </button>
            }
        </div>
    </div>;
}