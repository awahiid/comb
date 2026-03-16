import {useEmailStore} from "@/stores/use-email-store";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import React from "react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import EmailAttachments from "@/components/email/email-attachments";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {PH_CMP_DESCRIPTION} from "@shared/placeholders";

export default function EmailContent() {
    const description = useCompanyStore(state => state.description);

    const contentBasePrompt = useConfigurationStore(state => state.config.contentBasePrompt);

    const { content, loadingContent, set, generateContent } = useEmailStore(
        useShallow(state => ({
            content: state.content,
            loadingContent: state.loadingContent,
            set: state.setterEmail,
            generateContent: state.generateContent
        }))
    )

    const contentPrompt = contentBasePrompt.replace(PH_CMP_DESCRIPTION, description || "");

    return <>
        <CardContent className={"h-full"}>
            <Textarea
                value={content}
                placeholder={loadingContent ? "Generating email content..." : "Generate an email content or write it down"}
                className={"field-sizing-fixed rounded-sm bg-secondary p-4 shadow-none resize-none focus-visible:ring-[0px] h-full"}
                onChange={(e) => set("content", e.target.value)}
            />
        </CardContent>
        <CardFooter className={"p-0"}>
            <EmailAttachments onGenerate={() => generateContent(contentPrompt)}/>
        </CardFooter>
    </>
}