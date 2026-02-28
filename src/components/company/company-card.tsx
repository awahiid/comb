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

export default function CompanyCard() {
    const companies = useDataStore(state => state.companies);
    const pageSize = useDataStore(state => state.pageSize);
    const setPage = useDataStore(state => state.setPage);

    const company = useCompanyStore(state => state.company);
    const setCompany = useCompanyStore(state => state.setCompany);

    const handleNext = () => {
        if(!company || companies.length <= 0) return;
        const next = companies.indexOf(company) + 1;
        if(next == companies.length) return;
        setCompany(companies[next]);
        setPage(Math.floor(next/pageSize + 1));
    }

    const handlePrev = () => {
        if(!company || companies.length <= 0) return;
        const prev = companies.indexOf(company) - 1;
        if(prev == -1) return;
        setCompany(companies[prev]);
        setPage(Math.floor(prev/pageSize + 1));
    }

    if(!company) {
        return <h1 className={"mt-10"}>Load a CSV file first and select a company.</h1>
    }

    return <Card className={"size-full max-w-sm rounded-xs gap-4"}>
        <CardHeader>
            <CardTitle className={"flex text-sm justify-between"}>
                <p className={"mr-4 flex-1"}>{company.id}.&nbsp;&nbsp;&nbsp;{company.name}</p>
                <p className={"font-medium flex-"}>{capitalize(company.type)} in {company.location}</p>
            </CardTitle>
        </CardHeader>
        <CardContent className={"flex flex-col gap-2w-full flex-wrap"}>
            <CompanyMap/>
            <Separator className={"my-4"}/>
            <CompanyTags/>
            <Separator className={"my-4"}/>
            <div className={"flex gap-2 w-full"}>
                <Button className={"flex-1 border"} variant={"ghost"} onClick={handlePrev}>Prev</Button>
                <Button className={"flex-1"} onClick={handleNext}>Next</Button>
            </div>
            <CompanyDescription/>
        </CardContent>
    </Card>
}