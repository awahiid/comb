import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {useEffect, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import CombAI from "@/assets/comb-ai.svg";

export default function CompanyDescription() {
    const { savedDescription, saveDescription, generateDescription } = useCompanyStore(
        useShallow(state => ({
            savedDescription: state.company?.description ?? "",
            saveDescription: state.setDescription,
            generateDescription: state.generateDescription
        }))
    )

    const basePrompt = useConfigurationStore(state => state.config.descriptionBasePrompt);

    const [description, setDescription] = useState(savedDescription);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setDescription(savedDescription);
    }, [savedDescription]);

    const generate = async () => {
        setLoading(true);
        setDescription("");
        try {
            for await (const chunk of generateDescription(basePrompt)) {
                setLoading(false);
                setDescription(prev => prev + chunk);
            }
        } finally {
            setLoading(false);
        }
    };

    return <>
        <div className={"flex justify-between items-center   py-4"}>
            <p className={"text-sm text-nowrap"}> {description == savedDescription ? "Saved" : "Not saved"} </p>
            <div className={"flex w-full justify-end items-center gap-2"}>
                {savedDescription != description && !loading &&
                    <Button
                        variant={"ghost"}
                        className={"border-none hover:text-destructive hover:bg-card"}
                        onClick={() => setDescription(savedDescription ?? "")}
                    >
                        Undo
                    </Button>
                }
                <Button variant={"ghost"} className={"rounded-full p-0 size-10"} onClick={generate}> <CombAI/> </Button>
                <Button onClick={() => {
                    if (description != "") saveDescription(description)
                }}>Save</Button>
            </div>
        </div>
        {!loading && <Textarea
            className="p-0 border-x-0 pb-2 min-h-lh border-t-0 mt-2 border-gray-300 focus-visible:ring-0 focus:border-black focus:outline-none resize-none h-fit"
            value={description}
            placeholder={"No description yet."}
            onChange={e => setDescription(e.target.value)}
        />}
        {loading && <Skeleton className="h-lh"/>}
    </>
}
