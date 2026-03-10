"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {capitalize} from "@/lib/utils";
import {useCompanyStore} from "@/stores/use-company-store";
import CompanyDescription from "@/components/company/company-description";
import {useDataStore} from "@/stores/use-data-store";
import CompanyTags from "@/components/company/company-tags";
import {Separator} from "@/components/ui/separator";
import {useShallow} from "zustand/shallow";
import dynamic from "next/dynamic"
const CompanyMap = dynamic(() => import("@/components/company/company-map"), { ssr:false })

export default function CompanyCard() {
    const moveToCompany = useDataStore(state => state.moveToCompany);

    const {id, name, type, location} = useCompanyStore(
        useShallow(state => ({
            id: state.id,
            name: state.name,
            type: state.type,
            location: state.location,
            setCompany: state.setCompany
        }))
    );

    if(id == undefined) return ;

    return <Card className={"h-full w-sm"}>
        <CardHeader>
            <CardTitle className="flex text-sm justify-between items-start max-h-10 overflow-hidden">
                <p className="mr-4 flex-1 truncate font-semibold">{id}.&nbsp;&nbsp;&nbsp;{name}</p>
                <p className="font-medium text-end text-xs text-muted-foreground shrink-0 max-w-[40%] line-clamp-2">{capitalize(type ?? "Unnamed")} in {location}</p>
            </CardTitle>
        </CardHeader>
        <CardContent className={"flex flex-col h-full"}>
            <CompanyMap key={id}/>
            <CompanyTags/>
            <Separator className={"my-4"}/>
            <CompanyDescription/>
            <div className={"flex gap-2 w-full h-20"}>
                <Button className={"flex-1 border"} variant={"ghost"} onClick={() => moveToCompany(-1)}>Prev</Button>
                <Button className={"flex-1"} onClick={() => moveToCompany(1)}>Next</Button>
            </div>
        </CardContent>
    </Card>
}