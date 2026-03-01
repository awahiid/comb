import { create } from "zustand";
import {Company} from "@/types";
import Papa from "papaparse";

export type PageSize = 10 | 20 | 30 | 50

type DataState = {
    companies: Company[];

    fileName?: string;
    page: number;
    pageSize: PageSize;

    setPage: (page: number) => void;
    setPageSize: (pageSize: PageSize) => void;
    loadData: (csv: File) => void;
    saveData: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
    companies: [],

    page: 1,
    pageSize: 10,

    setPageSize: (pageSize: PageSize) => set({pageSize}),
    setPage: (page: number) => set({page}),
    loadData: (csv: File) => {
        Papa.parse(csv, {
            header: true,
            worker: true,
            skipEmptyLines: true,
            complete: (results) => {
                const companies: Company[] = (results.data as Omit<Company, "id">[])
                    .map((row, index) => ({
                        ...row,
                        id: index
                    }));

                set({page: 1, fileName: csv.name, companies});
            },
        });
    },
    saveData: () => {
        const { companies, fileName } = get();
        if (companies.length <= 0) return;
        const csv = Papa.unparse(companies);

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName?.replace(".csv", `-${new Date().toLocaleString()}.csv`) ?? `companies-${new Date().toLocaleString()}.csv`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}));