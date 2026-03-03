"use client";

import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatDate} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ArrowDown, ArrowUp} from "lucide-react";
import {Email} from "@/types";
import {useState} from "react";

export default function CompanyEmails() {
    const { id, emails } = useCompanyStore(
        useShallow(state => ({
            id: state.id,
            emails: state.emails,
        }))
    )

    if(id === undefined || emails.length <= 0) return;

    return (
        <div className={"flex flex-col gap-2"}>
            {emails.map(email => <CompanyEmail key={email.id} email={email} />)}
        </div>
    )
}

function CompanyEmail({ email }: { email: Email }) {
    const [showDescription, setShowDescription] = useState(false);

    return <Card className={"rounded-none shadow-none max-w-3xl p-4 relative"}>
        <CardHeader className={"p-0"}>
            <CardTitle><span className={"font-medium"}>Email from </span> {email.from} <span className={"font-medium"}>to</span> {email.to}</CardTitle>
            <CardDescription>
                <p>Sent on {email.date != undefined ? formatDate(new Date(email.date).getTime()) : ""}</p>
            </CardDescription>
            <CardContent className={"p-0"} hidden={!showDescription}>
                <p>{email.content}</p>
            </CardContent>
            <CardContent>
                <Button variant={"ghost"} onClick={() => setShowDescription(!showDescription)} className={"p-0 size-6 rounded-full absolute top-2 right-2"}>
                    {showDescription ? <ArrowUp/> : <ArrowDown/>}
                </Button>
            </CardContent>
        </CardHeader>
    </Card>
}