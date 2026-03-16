import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {Textarea} from "@/components/ui/textarea";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import CombAI from "@/assets/comb-ai.svg";

export default function CompanyDescription() {
    const basePrompt = useConfigurationStore(state => state.config.descriptionBasePrompt);

    const { description, loading, setDescription, savedDescription, set, generateDescription, descriptionStatus } = useCompanyStore(
        useShallow(state => ({
            description: state.descriptionDraft,
            loading: state.loadingDescription,
            setDescription: state.setDescriptionDraft,
            savedDescription: state.description,
            set: state.set,
            generateDescription: state.generateDescription,
            descriptionStatus: state.descriptionStatus
        }))
    );

    const isDirty = savedDescription != description && !loading;

    return <>
        {!loading && <Textarea
            className="field-sizing-fixed h-full border pb-2 min-h-lh border-gray-300 focus-visible:ring-0 focus:border-black focus:outline-none resize-none no-scrollbar"
            value={description ?? ""}
            placeholder={"No description yet."}
            onChange={e => setDescription(e.target.value)}
        />}
        {loading && <Skeleton className="h-full rounded-none border p-2">{descriptionStatus}</Skeleton>}
        <div className={"flex items-center py-4"}>
            <p className={"text-sm text-nowrap"}> {description == savedDescription ? "Saved" : "Not saved"} </p>
            <div className={"flex h-fit w-full justify-end items-center gap-2"}>
                {isDirty &&
                    <Button
                        variant={"ghost"}
                        className={"border-none hover:text-destructive hover:bg-card"}
                        onClick={() => setDescription(savedDescription ?? "")}
                    >
                        Undo
                    </Button>
                }
                <Button variant={"ghost"} className={"rounded-full p-0 size-10"} onClick={() => generateDescription(basePrompt)}> <CombAI/> </Button>
                <Button onClick={() => set("description", description)}>Save</Button>
            </div>
        </div>
    </>
}
