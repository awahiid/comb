import {useEmailStore} from "@/stores/use-email-store";
import {useConfigurationStore} from "@/stores/use-configuration-store";
import React, {useEffect, useMemo, useState} from "react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import EmailAttachments from "@/components/email/email-attachments";
import {useCompanyStore} from "@/stores/use-company-store";
import EmailContentChat from "@/components/email/email-content-chat";
import {useShallow} from "zustand/shallow";
import {PH_CMP_DESCRIPTION} from "@/placeholders";

export default function EmailContent() {
    const description = useCompanyStore(state => state.company?.description)!;
    const {content, set, generateContent} = useEmailStore(
        useShallow(state => ({
            content: state.content,
            set: state.setEmail,
            generateContent: state.generateContent
        }))
    )

    const contentBasePrompt = useConfigurationStore(state => state.config.contentBasePrompt);

    const derivedPrompt = useMemo(() => {
        return contentBasePrompt.replace(PH_CMP_DESCRIPTION, description || "");
    }, [contentBasePrompt, description]);

    const [contentPrompt, setContentPrompt] = useState(derivedPrompt);

    useEffect(() => {
        setContentPrompt(derivedPrompt);
    }, [derivedPrompt]);

    useEffect(() => {
        if(!description) {
            set("content", "No description yet.")
            return
        }
        generateContent(derivedPrompt)
    }, [description, derivedPrompt, generateContent, set]);

    useEffect(() => {
        console.log("CONTENIDO RERENDERIZADO")
    });

    return <>
        <CardContent>
            <Textarea
                value={content}
                className={"bg-secondary p-4 border-none shadow-none min-h-fit resize-none focus-visible:ring-[0px] rounded-none "}
                onChange={(e) => set("content", e.target.value)}
            />
        </CardContent>
        <EmailAttachments/>
        <CardFooter>
            <EmailContentChat
                value={contentPrompt}
                onClick={() => generateContent(contentPrompt)}
                onChange={setContentPrompt}
            />
        </CardFooter>
    </>
}