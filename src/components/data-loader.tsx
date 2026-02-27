import {IoAdd} from "react-icons/io5";
import React, {useRef} from "react";
import {useDataStore} from "@/stores/use-data-store";


export default function DataLoader() {
    const fileInput = useRef<HTMLInputElement>(null);
    const loadCSV = useDataStore(state => state.loadData);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        loadCSV(file)
    };

    return <div
        onClick={() => {
            if (fileInput.current) fileInput.current.click();
        }}
        className="cursor-pointer py-20 flex items-center w-2xl size-fit border-dashed border gap-4 flex-col bg-secondary"
    >
        <IoAdd/>
        Select or drag a CSV file
        <input ref={fileInput} type="file" accept=".csv" onChange={handleFile} className={"hidden"}/>
    </div>
}