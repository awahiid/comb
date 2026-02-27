import {useEmailStore} from "@/stores/use-email-store";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import CombAI from "@/assets/comb-ai.svg";
import React, {useEffect, useMemo} from "react";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";

export default function EmailSubject() {
    const description = useCompanyStore(state => state.company?.description)!;

    const {subject, set, generateSubject} = useEmailStore(
        useShallow(state => ({
            subject: state.subject,
            set: state.setEmail,
            generateSubject: state.generateSubject
        }))
    )

    const subjectBasePrompt = useConfigurationStore(state => state.config.subjectBasePrompt)

    const derivedPrompt = useMemo(() => {
        return subjectBasePrompt.replace("%companyDescription%", description || "");
    }, [subjectBasePrompt, description]);

    useEffect(() => {
        if(!description) {
            set("subject", "No description yet.")
            return
        }
        generateSubject(derivedPrompt).then()
    }, [description, derivedPrompt, generateSubject, set]);

    return <div className={"mt-2 flex items-center gap-2"}>
        <span>Subject</span>
        <Input
            value={subject}
            className={"border-t-0 border-x-0 rounded-none shadow-none focus-visible:ring-[0px] leading-1 h-fit p-0"}
            onChange={(e) => set("subject", e.target.value)}
        />
        <Button
            variant={"ghost"}
            className={"rounded-full size-8"}
            onClick={() => generateSubject(derivedPrompt)}
        >
            <CombAI className="w-6 right-0 top-0"/>
        </Button>
    </div>;
}