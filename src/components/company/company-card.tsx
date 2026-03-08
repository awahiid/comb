"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {capitalize} from "@/lib/utils";
import CompanyMap from "@/components/company/company-map";
import {useCompanyStore} from "@/stores/use-company-store";
import CompanyDescription from "@/components/company/company-description";
import {useDataStore} from "@/stores/use-data-store";
import CompanyTags from "@/components/company/company-tags";
import {Separator} from "@/components/ui/separator";
import {useShallow} from "zustand/shallow";

export default function CompanyCard() {
    const {companies, pageSize, setPage} = useDataStore(
        useShallow(state => ({
            companies: state.companies,
            pageSize: state.pageSize,
            setPage: state.setPage
        }))
    );

    const {id, name, type, location, setCompany} = useCompanyStore(
        useShallow(state => ({
            id: state.id,
            name: state.name,
            type: state.type,
            location: state.location,
            setCompany: state.setCompany,
        }))
    );

    const handleNext = (position: number) => {
        if(id == undefined || companies.length <= 0) return;
        const next = companies.findIndex(c => c.id === id) + position;
        if(next < 0 || next >= companies.length) return;
        setCompany(companies[next]);
        setPage(Math.floor(next/pageSize + 1));
    }

    if(id == undefined) return ;

    return <Card className={"h-full w-sm"}>
        <CardHeader>
            <CardTitle className={"flex text-sm justify-between"}>
                <p className={"mr-4 flex-1"}>{id}.&nbsp;&nbsp;&nbsp;{name}</p>
                <p className={"font-medium flex-"}>{capitalize(type ?? "Unnamed")} in {location}</p>
            </CardTitle>
        </CardHeader>
        <CardContent className={"flex flex-col h-full"}>
            <CompanyMap/>
            <CompanyTags/>
            <Separator className={"my-4"}/>
            <CompanyDescription key={id}/>
            <div className={"flex gap-2 w-full h-fit"}>
                <Button className={"flex-1 border"} variant={"ghost"} onClick={() => handleNext(-1)}>Prev</Button>
                <Button className={"flex-1"} onClick={() => handleNext(1)}>Next</Button>
            </div>
        </CardContent>
    </Card>
}