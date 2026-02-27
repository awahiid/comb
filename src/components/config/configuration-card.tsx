'use client'

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {IoMdSettings} from "react-icons/io";
import {Separator} from "@/components/ui/separator";
import {buttonVariants} from "@/components/ui/button";
import { useConfigurationStore} from "@/stores/use-configuration-store";
import React, {useState} from "react";
import {cn} from "@/lib/utils";
import {GroqConfiguration} from "@/components/config/groq-configuration";
import {BridgeConfiguration} from "@/components/config/bridge-configuration";
import {BasePromptsConfiguration} from "@/components/config/base-prompts-configuration";
import {Configuration} from "@/types";
import {useShallow} from "zustand/shallow";

export type ConfigComponentProps = {
    config: Configuration;
    onChange: <K extends keyof Configuration>(key: K, value: Configuration[K]) => void;
}

export default function ConfigurationCard(){
    const {savedConfig, save} = useConfigurationStore(
        useShallow(state => ({
            savedConfig: state.config,
            save: state.save
        }))
    );
    const [config, setConfig] = useState<Configuration>(savedConfig);

    const handleChange = <K extends keyof Configuration>(key: K, value: Configuration[K]) => {
        setConfig(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const sync = (open: boolean) => {
        if(open) setConfig({...savedConfig})
    }

    return (
        <Dialog onOpenChange={sync}>
            <DialogTrigger className={"cursor-pointer"}>
                <IoMdSettings size={24}/>
            </DialogTrigger>
            <DialogContent
                className={"overflow-hidden max-h-4/5 border-black shadow-none rounded-none min-w-2xl flex flex-col z-100"}>
                <DialogHeader>
                    <DialogTitle>Configuration</DialogTitle>
                    <DialogDescription>
                        Edit base prompts and email configurations.
                    </DialogDescription>
                </DialogHeader>
                <Separator/>
                <div className={"h-screen border-b flex flex-col gap-4 no-scrollbar -mx-4 overflow-y-auto px-4 pb-4"}>
                    <GroqConfiguration config={config} onChange={handleChange}/>
                    <BridgeConfiguration config={config} onChange={handleChange}/>
                    <BasePromptsConfiguration config={config} onChange={handleChange}/>
                </div>
                <div className={"flex gap-2"}>
                    <DialogClose className={cn(buttonVariants({
                        variant: "ghost",
                        size: "default",
                        className: "w-full flex-1"
                    }))}>Cancel</DialogClose>
                    <DialogClose className={cn(buttonVariants({
                        variant: "default",
                        size: "default",
                        className: "w-full flex-1"
                    }))} onClick={() => save(config)}>Save</DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}