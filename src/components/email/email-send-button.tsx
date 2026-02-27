import {useEmailStore} from "@/stores/use-email-store";
import React, {useEffect} from "react";
import {Button} from "@/components/ui/button";
import {IoCheckmarkSharp} from "react-icons/io5";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {useConfigurationStore} from "@/stores/use-configuration-store";

export default function EmailSendButton() {
    const config = useConfigurationStore(state => state.config);

    const {address, setMailStatus} = useCompanyStore(
        useShallow(state => ({
            address: state.company?.email ?? "",
            setMailStatus: state.setMailStatus
        }))
    )

    const {send, status, setStatus} = useEmailStore(
        useShallow(state => ({
            send: state.send,
            status: state.status,
            setStatus: state.setStatus,
        }))
    )

    const time = 4000;

    useEffect(() => {
        if (status === "success" || status === "error") {
            if(status === "success") setMailStatus("sent")

            const timer = setTimeout(() => {
                setStatus("idle");
            }, time);

            return () => clearTimeout(timer);
        }
    }, [status, setStatus, setMailStatus]);

    const handleSend = async () => {
        await send(config, [address]);
    }

    if(status === "idle") return <Button onClick={handleSend} className={"w-fit"}> Send ?? </Button>;
    if(status === "pending") return <Button className={"w-fit  pointer-events-none"}> Sending ... </Button>;
    if(status === "success") return <Button className={"w-fit pointer-events-none"}> Success <IoCheckmarkSharp/> </Button>;
    if(status === "error") return <Button className={"w-fit bg-destructive pointer-events-none"}> Error :( </Button>;
}