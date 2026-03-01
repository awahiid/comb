'use client';

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import EmailAddress from "@/components/email/email-address";
import EmailSubject from "@/components/email/email-subject";
import EmailContent from "@/components/email/email-content";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {formatDate} from "@/lib/utils";

export default function EmailCard(){
    const {company, name, email, status, sentOn, messageId} = useCompanyStore(
        useShallow(state => ({
            company: state.company,
            name: state.company?.name,
            email: state.company?.email,
            status: state.company?.status,
            sentOn: state.company?.sentOn,
            messageId: state.company?.messageId
        }))
    );

    if(!company) return;

    if(status !== undefined) {
        return <Card className={"size-full max-w-3xl h-fit rounded-xs"}>
                <CardHeader>
                    <CardTitle className={"flex items-center w-full h-fit"}>
                        Email
                    </CardTitle>
                </CardHeader>
                <CardContent className={"flex flex-col gap-2"}>
                    <p>The email to <span className={"font-bold"}>{name}</span> ({email}) was successfully sent on {sentOn && formatDate(sentOn)}</p>
                    <p>Message Id {messageId}</p>
                </CardContent>
            </Card>
    }

    return <Card className={"size-full max-w-3xl h-fit rounded-xs"}>
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

