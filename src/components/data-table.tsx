"use client";

import React, {useMemo} from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useDataStore} from "@/stores/use-data-store";
import {cn} from "@/lib/utils";
import {PageSize} from "@/stores/use-data-store";
import {MdOutlineArrowOutward} from "react-icons/md";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import DataLoader from "@/components/data-loader";

export default function DataTable() {
    const {company, setCompany} = useCompanyStore(
        useShallow(state => ({
            company: state.company,
            setCompany: state.setCompany
        }))
    );

    const companies = useDataStore(state => state.companies);
    const page = useDataStore(state => state.page);
    const setPage = useDataStore(state => state.setPage);
    const pageSize = useDataStore(state => state.pageSize);
    const setPageSize = useDataStore(state => state.setPageSize);

    const pageCompanies = useMemo(() => {
        const start = (page - 1) * pageSize;
        return companies.slice(start, start + pageSize);
    }, [companies, page, pageSize]);

    const totalPages = useMemo(() => Math.ceil(companies.length / pageSize), [companies, pageSize]);

    if(companies.length === 0) return <DataLoader />;

    return (
        <div className={"flex flex-col items-center"}>
            <div className="mb-4 w-full">
                <label>
                    Rows: {" "}
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
                    >
                        {[10, 20, 30, 50].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className={"p-4  border border-black"}>
                <Table className="max-w-2xl  border-gray-300">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-auto"></TableHead>
                            <TableHead className="w-auto">Name</TableHead>
                            <TableHead className="w-auto">Type</TableHead>
                            <TableHead className="w-auto">Location</TableHead>
                            <TableHead className="w-auto">Google Maps</TableHead>
                            <TableHead className="w-auto">OSM</TableHead>
                            <TableHead className="w-auto">Sent</TableHead>
                            <TableHead className="w-auto">Mail</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageCompanies.map(row => (
                            <TableRow
                                key={row.id}
                                className={cn("hover:bg-gray-50 cursor-pointer transition-none", company?.id == row.id ? "hover:bg-secondary-foreground  bg-secondary-foreground text-primary-foreground " : "")}
                                onClick={() => setCompany(row)}
                            >
                                <TableCell className={"max-w-75 w-fit text-ellipsis overflow-hidden"}>
                                    {row.id}
                                </TableCell>
                                <TableCell className={"max-w-75 w-fit text-ellipsis overflow-hidden"}>
                                    {row.name}
                                </TableCell>
                                <TableCell className={"max-w-75 w-fit text-ellipsis overflow-hidden"}>
                                    {row.type}
                                </TableCell>
                                <TableCell className={"max-w-75 w-fit text-ellipsis overflow-hidden"}>
                                    {row.location}
                                </TableCell>
                                <TableCell className={"max-w-75 w-fit text-ellipsis overflow-hidden"}>
                                    <Button variant={"secondary"} className={"flex gap-2 items-center border py-1 px-2 justify-center rounded-full w-fit flex-nowrap"}>
                                        <a href={row.gmaps} target={"_blank"}>Open in GMaps </a>
                                        <MdOutlineArrowOutward/>
                                    </Button>
                                </TableCell>
                                <TableCell className={"max-w-75 w-fit text-ellipsis overflow-hidden"}>
                                    <Button variant={"secondary"} className={"flex gap-2 items-center border py-1 px-2 justify-center rounded-full w-fit flex-nowrap"}>
                                        <a href={row.osm} target={"_blank"}>Open in OSM</a>
                                        <MdOutlineArrowOutward/>
                                    </Button>
                                </TableCell>
                                <TableCell className={"max-w-75 w-fit text-ellipsis overflow-hidden"}>
                                    {row.sent?.toString() ?? "Not sent yet"}
                                </TableCell>
                                <TableCell className={"max-w-75 w-fit text-ellipsis overflow-hidden"}>
                                    {row.email ?? "Not sent yet"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <section className="mt-10 flex flex-col gap-4 justify-between items-center">
                <div className={"flex gap-2"}>
                    <Button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                    >
                        Anterior
                    </Button>

                    {
                        [0,1,2,3].map(i => {
                            const index = (4 * Math.floor(page / 4)) + i
                            return index > 0 && index <= totalPages && <Button
                                key={i}
                                className={"transition-none"}
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
                    >
                        Siguiente
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
                      className="border text-center text-sm w-12 no-spinner mx-2 p-0 rounded-none shadow-none focus-visible:ring-0 leading-1 h-fit"
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
        </div>
    );
}