import {useConfigurationStore} from "@/stores/use-configuration-store";
import React, {useEffect, useMemo, useState} from "react";
import {IoCloseSharp} from "react-icons/io5";
import {Input} from "@/components/ui/input";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {Button} from "@/components/ui/button";
import {extractEmails} from "@/lib/utils";

export default function EmailAddress() {
    const user = useConfigurationStore(state => state.config.user);

    const { savedAddress, description, saveAddress } = useCompanyStore(
        useShallow(state => ({
            savedAddress: state.company?.email,
            description: state.company?.description,
            saveAddress: state.setAddress
        }))
    );

    const baseAddress = useMemo(() => {
        if(savedAddress) return savedAddress;
        if(description) return extractEmails(description)[0];
    }, [savedAddress, description]);

    const [address, setAddress] = useState(baseAddress);

    const handleEmailToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setAddress(extractEmails(e.target.value)[0]);
        e.target.value = "";
    }

    useEffect(() => {
        setAddress(baseAddress)
    }, [baseAddress]);

    return <>
        <div className={"mt-2 flex gap-2 w-full"}>
            <span>To</span>
            <div className={"focus-within:border-b-black flex pb-1 w-full gap-1 h-fit justify-between items-center"}>
                {address && <div className={"flex w-fit gap-1 justify-between"}>
                    <div
                        onClick={() => setAddress(undefined)}
                        className={"px-1 hover:bg-secondary h-lh cursor-pointer w-fit text-nowrap flex items-center justify-center gap-1  border "}
                    >
                        {address}<IoCloseSharp/>
                    </div>
                </div>}
                {!address && <Input
                    onBlur={handleEmailToChange}
                    placeholder={"no one"}
                    className={"rounded-none border-t-0 border-x-0 flex-2 min-w-20 max-w-full p-0 focus-visible:ring-0 h-lh shadow-none"}
                />}
                {baseAddress !== address && <div className={"w-fit flex gap-1"}>
                    <Button variant={"ghost"} className={"h-lh py-1"} onClick={() => setAddress(baseAddress)}>
                        Undo
                    </Button>
                    <Button className={"h-lh py-1"} onClick={() => {
                        if(address !== baseAddress) {
                            saveAddress(address)
                        }
                    }}>
                        Save
                    </Button>
                </div>}
            </div>
        </div>
        <div className={"mt-2 flex gap-2 w-full"}>
            <span>From</span>
            <p> {user.length > 0 && user || "Set an email"} </p>
        </div>
    </>
}