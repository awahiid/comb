import {useEmailStore} from "@/stores/use-email-store";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import CombAI from "@/assets/comb-ai.svg";
import React, {useMemo} from "react";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {PH_CMP_DESCRIPTION} from "@shared/placeholders";

export default function EmailSubject() {
    const description = useCompanyStore(state => state.description)!;

    const subjectBasePrompt = useConfigurationStore(state => state.config.subjectBasePrompt)

    const {subject, loadingSubject, set, generateSubject} = useEmailStore(
        useShallow(state => ({
            subject: state.subject,
            loadingSubject: state.loadingSubject,
            set: state.setEmail,
            generateSubject: state.generateSubject
        }))
    )

    const subjectPrompt = useMemo(() => (
        subjectBasePrompt.replace(PH_CMP_DESCRIPTION, description || "")
    ), [subjectBasePrompt, description]);

    return <div className={"mt-2 flex items-center gap-2"}>
        <span>Subject</span>
        <Input
            value={subject}
            placeholder={loadingSubject ? "Generating subject..." : ""}
            className={"border-t-0 border-x-0 rounded-none shadow-none focus-visible:ring-[0px] leading-1 h-fit p-0"}
            onChange={(e) => set("subject", e.target.value)}
        />
        <Button
            variant={"ghost"}
            className={"rounded-full size-8"}
            onClick={() => generateSubject(subjectPrompt)}
        >
            <CombAI className="w-6 right-0 top-0"/>
        </Button>
    </div>;
}