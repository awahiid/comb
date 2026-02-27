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
}

export const useDataStore = create<DataState>((set) => ({
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
                const companies: Company[] = (results.data as never[]).map((row, index) => ({
                    id: index,
                    name: row["Negocio"] || "",
                    description: row["Descripcion"] || "",
                    osm: row["OpenStreet URL"] || "",
                    osmNode: row["OSM_Node"] || "",
                    lat: row["Lat"] || 0,
                    long: row["Long"] || 0,
                    gmaps: row["Coordenadas"] || "",
                    type: row["Tipo"] || "",
                    location: row["Direccion"] || "",
                    web: row["Web"] || "",
                    email: row["Mail"] || undefined,
                    sent: row["Enviado"] || undefined,
                    status: row["Status"] || undefined,
                }));

                set({page: 1, fileName: csv.name, companies});
            },
        });
    }
}));