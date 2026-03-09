import {useConfigurationStore} from "@/stores/use-configuration-store";
import React, {useEffect, useState} from "react";
import {IoCloseSharp} from "react-icons/io5";
import {Input} from "@/components/ui/input";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {Button} from "@/components/ui/button";
import {emailRegex, extractEmails} from "@/lib/utils";

export default function EmailAddress() {
    const { user, auto } = useConfigurationStore(
        useShallow(state => ({
            user: state.config.user,
            auto: state.config.auto,
        }))
    );

    const { id, savedAddress, description, set } = useCompanyStore(
        useShallow(state => ({
            id: state.id,
            savedAddress: state.email,
            description: state.description,
            set: state.set
        }))
    );

    const baseAddress = savedAddress?.match(emailRegex) ? savedAddress : (extractEmails(description ?? "")[0] ?? savedAddress);
    const [address, setAddress] = useState<string | undefined>(baseAddress);

    if (address !== baseAddress) setAddress(baseAddress);
    const isDirty = address !== savedAddress;

    const handleEmailToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setAddress(extractEmails(e.target.value)[0]);
        e.target.value = "";
    }

    useEffect(() => {
        if(auto) set("email", baseAddress);
    }, [id, baseAddress, auto, set]);

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
                {isDirty && <div className={"w-fit flex gap-1"}>
                    <Button variant={"ghost"} className={"h-lh py-1"} onClick={() => setAddress(savedAddress)}>
                        Undo
                    </Button>
                    <Button className={"h-lh py-1"} onClick={() => {
                        if(address !== savedAddress) set("email", address);
                    }}>
                        Save
                    </Button>
                </div>}
            </div>
        </div>
        <div className={"mt-2 flex gap-2 w-full"}>
            <span>From</span>
            <p> {user || "no one"} </p>
        </div>
    </>
}