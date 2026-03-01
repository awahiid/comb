'use client';

import {Button} from "@/components/ui/button";
import { useDataStore } from "@/stores/use-data-store";
import {MdOutlineFileDownload} from "react-icons/md";

export default function SaveDataButton() {
    const saveData = useDataStore(state => state.saveData)

    return <Button variant={"ghost"} onClick={saveData} className={"size-7 rounded-full p-2"}>
        <MdOutlineFileDownload size={20}/>
    </Button>
}