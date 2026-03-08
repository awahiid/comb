'use client';

import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import EmailAddress from "@/components/email/email-address";
import EmailSubject from "@/components/email/email-subject";
import EmailContent from "@/components/email/email-content";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {useEffect} from "react";
import {useEmailStore} from "@/stores/use-email-store";
import AutoConfiguration from "@/components/config/auto-configuration";

export default function EmailCard(){

    const {id, description} = useCompanyStore(
        useShallow(state => ({
            id: state.id,
            description: state.description,
        }))
    );

    const generateEmail = useEmailStore(state => state.generateEmail);

    useEffect(() => {
        generateEmail()
    }, [generateEmail, id, description]);

    if(id == undefined) return;

    return <Card className={"w-2xl"}>
        <CardHeader>
            <CardTitle className={"flex items-center justify-between w-full h-fit"}>
                Email
                <AutoConfiguration/>
            </CardTitle>
            <EmailAddress/>
            <EmailSubject/>
        </CardHeader>
        <EmailContent/>
    </Card>
}

