import { create } from "zustand";
import {Company, MutableCompany} from "@shared/types";
import Papa from "papaparse";
import {useCompanyStore} from "@/stores/use-company-store";

export type PageSize = number

type DataState = {
    companies: Company[];

    fileName?: string;
    page: number;
    pageSize: PageSize;

    updateCompany: (id: number, values: Partial<MutableCompany>) => void;
    moveToCompany: (position: number) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: PageSize) => void;
    loadData: (csv: File) => void;
    saveData: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
    companies: [],

    page: 1,

    pageSize: 19,

    updateCompany: (id, values) => {
        set(state => ({
            companies: state.companies.map(c => c.id === id ? { ...c, ...values } : c)
        }))
    },

    setPageSize: (pageSize: PageSize) => set({pageSize}),

    setPage: (page: number) => set({page}),

    loadData: (csv: File) => {
        const setCompany = useCompanyStore.getState().setCompany

        Papa.parse(csv, {
            header: true,
            worker: true,
            skipEmptyLines: true,
            complete: (results) => {
                const companies: Company[] = (results.data as Omit<Company, "id">[])
                    .map((row, index) => ({
                        ...row,
                        id: index,
                        sentOn: row["sentOn"] ? Number(row["sentOn"]) : undefined,
                    }));

                set({page: 1, fileName: csv.name, companies});
                setCompany(companies[0])
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
    },

    moveToCompany: (position: number) => {
        const {id, setCompany} = useCompanyStore.getState();
        const {companies, pageSize, setPage} = get();

        if(id == undefined || companies.length <= 0) return;
        const next = companies.findIndex(c => c.id === id) + position;
        if(next < 0 || next >= companies.length) return;
        setCompany(companies[next]);
        setPage(Math.floor(next/pageSize + 1));
    }
}));