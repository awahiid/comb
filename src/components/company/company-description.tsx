import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {useEffect, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import CombAI from "@/assets/comb-ai.svg";

export default function CompanyDescription() {
    const { basePrompt, auto } = useConfigurationStore(
        useShallow(state => ({
            basePrompt: state.config.descriptionBasePrompt,
            auto: state.config.auto
        }))
    );

    const { id, savedDescription, set, generateDescription } = useCompanyStore(
        useShallow(state => ({
            id: state.id,
            savedDescription: state.description,
            set: state.set,
            generateDescription: state.generateDescription
        }))
    );

    const [description, setDescription] = useState(savedDescription);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        setDescription(undefined);
        let result = "";
        try {
            for await (const chunk of generateDescription(basePrompt)) {
                setLoading(false);
                result += chunk;
                setDescription(result);
            }
        } finally {
            setLoading(false);
        }
        return result;
    };

    const saveDescription = () => {
        if (description != "") set("description", description)
    }

    useEffect(() => {
        setDescription(savedDescription);
        if(!savedDescription && auto) generate().then(result => {
            if (result) set("description", result);
        });
    }, [id])  // eslint-disable-line react-hooks/exhaustive-deps

    return <>
        {!loading && <Textarea
            className="field-sizing-fixed h-full bg-secondary border-x-0 pb-2 min-h-lh border-t-0 border-gray-300 focus-visible:ring-0 focus:border-black focus:outline-none resize-none no-scrollbar"
            value={description ?? ""}
            placeholder={"No description yet."}
            onChange={e => setDescription(e.target.value)}
        />}
        {loading && <Skeleton className="h-full p-2">Generating description...</Skeleton>}
        <div className={"flex items-center py-4"}>
            <p className={"text-sm text-nowrap"}> {description == savedDescription ? "Saved" : "Not saved"} </p>
            <div className={"flex h-fit w-full justify-end items-center gap-2"}>
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
                <Button onClick={saveDescription}>Save</Button>
            </div>
        </div>

    </>
}
