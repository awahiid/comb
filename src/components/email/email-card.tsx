'use client';

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import EmailAddress from "@/components/email/email-address";
import EmailSubject from "@/components/email/email-subject";
import EmailContent from "@/components/email/email-content";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {formatDate} from "@/lib/utils";
import {useEffect} from "react";
import {useEmailStore} from "@/stores/use-email-store";

export default function EmailCard(){
    const {id, name, email, status, sentOn, messageId, description} = useCompanyStore(
        useShallow(state => ({
            id: state.id,
            name: state.name,
            email: state.email,
            status: state.status,
            sentOn: state.sentOn,
            messageId: state.messageId,
            description: state.description,
        }))
    );

    const generateEmail = useEmailStore(state => state.generateEmail);

    useEffect(() => {
        generateEmail()
    }, [generateEmail, id, description]);

    if(id == undefined) return;

    if(status) {
        return <Card className={"size-full w-2xl h-fit rounded-xs"}>
                <CardHeader>
                    <CardTitle className={"flex items-center w-full h-fit"}>
                        Email {status}
                    </CardTitle>
                </CardHeader>
                <CardContent className={"flex flex-col gap-2"}>
                    <p>The email to <span className={"font-bold"}>{name}</span> ({email}) was successfully sent on {sentOn && formatDate(sentOn)}</p>
                    <p>Message Id {messageId}</p>
                </CardContent>
            </Card>
    }

    return <Card className={"w-2xl rounded-xs"}>
        <CardHeader>
            <CardTitle className={"flex items-center w-full h-fit"}>
                Email
            </CardTitle>
            <EmailAddress/>
            <EmailSubject/>
        </CardHeader>
        <EmailContent/>
    </Card>
}

