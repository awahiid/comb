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

    return <Card className={"size-full max-w-lg rounded-xs"}>
        <CardHeader>
            <CardTitle className={"flex items-center mb-5"}><span
                className={"mr-4"}>{company.id}.</span>{company.name}<span
                className={"ml-auto font-medium"}>{capitalize(company.type)} in {company.location}</span>
            </CardTitle>
        </CardHeader>
        <CardContent className={"flex flex-col gap-2 w-full flex-wrap"}>
            <CompanyDescription/>
            <CompanyTags/>
            <Separator className={"mt-4"}/>
            <div className={"flex gap-2 w-full"}>
                <Button className={"flex-1 border"} variant={"ghost"} onClick={handlePrev}>Prev</Button>
                <Button className={"flex-1"} onClick={handleNext}>Next</Button>
            </div>
            <CompanyMap/>
        </CardContent>
    </Card>
}