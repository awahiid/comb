'use client';

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import EmailAddress from "@/components/email/email-address";
import EmailSubject from "@/components/email/email-subject";
import EmailContent from "@/components/email/email-content";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {formatDate} from "@/lib/utils";

export default function EmailCard(){
    const {company, status, sentOn, messageId} = useCompanyStore(
        useShallow(state => ({
            company: state.company,
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
                        Mail
                    </CardTitle>
                </CardHeader>
                <CardContent className={"flex flex-col gap-2"}>
                    <p>The email to this company was sent successfully on {sentOn && formatDate(sentOn)}</p>
                    <p>Message Id {messageId}</p>
                </CardContent>
            </Card>
    }

    return <Card className={"size-full max-w-3xl h-fit rounded-xs"}>
        <CardHeader>
            <CardTitle className={"flex items-center w-full h-fit"}>
                Mail
            </CardTitle>
            <EmailAddress/>
            <EmailSubject/>
        </CardHeader>
        <EmailContent/>
    </Card>
}

