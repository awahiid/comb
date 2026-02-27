'use client';

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import EmailAddress from "@/components/email/email-address";
import EmailSubject from "@/components/email/email-subject";
import EmailContent from "@/components/email/email-content";
import {useCompanyStore} from "@/stores/use-company-store";

export default function EmailCard(){
    const company = useCompanyStore(state => state.company);
    if(!company) return;

    if(company.status !== undefined) {
        return <Card className={"size-full max-w-3xl h-fit rounded-xs"}>
                <CardHeader>
                    <CardTitle className={"flex items-center w-full h-fit"}>
                        Mail
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The email to this company was already sent.</p>
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

