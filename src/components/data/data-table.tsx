"use client";

import React, {useMemo, useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table"
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useDataStore} from "@/stores/use-data-store";
import {cn} from "@/lib/utils";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import DataLoader from "@/components/data/data-loader";
import {ArrowLeft, ArrowRight} from "lucide-react";
import {Card} from "@/components/ui/card";

export default function DataTable() {
    const [collapsed, setCollapsed] = useState(false);

    const {currentId, setCompany} = useCompanyStore(
        useShallow(state => ({
            currentId: state.id,
            setCompany: state.setCompany
        }))
    );

    const {companies, page, setPage, pageSize} = useDataStore(
        useShallow(state => ({
            companies: state.companies,
            page: state.page,
            setPage: state.setPage,
            pageSize: state.pageSize
        }))
    );

    const pageCompanies = useMemo(() => {
        const start = (page - 1) * pageSize;
        return companies.slice(start, start + pageSize);
    }, [companies, page, pageSize]);

    const totalPages = useMemo(() => Math.ceil(companies.length / pageSize), [companies, pageSize]);

    if(companies.length === 0) return <DataLoader />;

    return (
        <Card className={cn("pt-0 gap-0", collapsed ? "size-10 " : "h-full")}>
            <Button className={cn("p-0 w-full border-0 justify-start rounded-none", collapsed ? "" : "" )} variant={"ghost"} onClick={() => setCollapsed(!collapsed)}>
                {!collapsed ? <ArrowLeft size={16}/> : <ArrowRight size={16}/>}
            </Button>
            {!collapsed && <>
                <div className={"w-md border-y overflow-y-auto mt-0 no-scrollbar mb-4"}>
                    <Table>
                        <TableBody>
                            {pageCompanies.map(row => (
                                <TableRow
                                    key={row.id}
                                    className={cn("cursor-pointer transition-none overflow-x-hidden", currentId == row.id ? "hover:bg-secondary-foreground  bg-secondary-foreground text-primary-foreground " : "")}
                                    onClick={() => setCompany(row)}
                                >
                                    <TableCell className={"max-w-75 w-fit text-ellipsis"}>
                                        {row.id}
                                    </TableCell>
                                    <TableCell className={"max-w-75 w-fit text-ellipsis"}>
                                        {row.type}
                                    </TableCell>
                                    <TableCell className={"max-w-75 w-fit text-ellipsis"}>
                                        {row.name}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <section className="flex flex-col gap-4 justify-between items-center mt-auto">
                    <div className={"flex gap-1"}>
                        <Button
                            variant={"ghost"}
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className={"size-8 rounded-full"}
                        >
                            <ArrowLeft/>
                        </Button>

                        {
                            [0,1,2,3].map(i => {
                                const index = (4 * Math.floor(page / 4)) + i
                                return index > 0 && index <= totalPages && <Button
                                    key={i}
                                    className={"transition-none size-8  rounded-full"}
                                    variant={page === index ? "default" : "ghost"}
                                    onClick={() => setPage(index)}
                                >
                                    {index}
                                </Button>
                            })
                        }

                        <Button
                            disabled={page === totalPages}
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            variant={"ghost"}
                            className={"size-8 rounded-full"}
                        >
                            <ArrowRight/>
                        </Button>
                    </div>
                    <span className="text-sm">
                  Page
                  <Input
                      id="current-page"
                      value={page}
                      min={1}
                      max={totalPages}
                      type="number"
                      className="rounded-full text-center text-sm w-12 no-spinner mx-2 p-0 shadow-none focus-visible:ring-0 leading-1 h-fit"
                      onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                              setPage(Math.min(Math.max(1, val), totalPages));
                          }
                      }}
                  />
                  of {totalPages}
                </span>
                </section>
            </>}
        </Card>
    );
}