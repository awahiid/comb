import {useEmailStore} from "@/stores/use-email-store";
import React, {useEffect} from "react";
import {Button} from "@/components/ui/button";
import {IoCheckmarkSharp} from "react-icons/io5";
import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {useConfigurationStore} from "@/stores/use-configuration-store";

export default function EmailSendButton() {
    const config = useConfigurationStore(state => state.config);

    const {address, setCompanyAttribute} = useCompanyStore(
        useShallow(state => ({
            address: state.email ?? "",
            setCompanyAttribute: state.set
        }))
    )

    const {send, status, setEmailStatus} = useEmailStore(
        useShallow(state => ({
            send: state.send,
            status: state.status,
            setEmailStatus: state.setStatus,
        }))
    )

    const time = 4000;

    useEffect(() => {
        if (status === "success" || status === "error") {
            const timer = setTimeout(() => {
                setEmailStatus("idle");
            }, time);

            return () => clearTimeout(timer);
        }
    }, [status, setEmailStatus]);

    const handleSend = async () => {
        const response = await send(config, [address]);
        if(response){
            setEmailStatus("success");
            setCompanyAttribute("sentOn", Date.now())
            setCompanyAttribute("status", "sent")
            setCompanyAttribute("messageId", response.messageId)
        }else {
            setEmailStatus("error");
        }
    }

    if(status === "idle") return <Button onClick={handleSend} className={"w-fit"}> Send ?? </Button>;
    if(status === "pending") return <Button className={"w-fit  pointer-events-none"}> Sending ... </Button>;
    if(status === "success") return <Button className={"w-fit pointer-events-none"}> Success <IoCheckmarkSharp/> </Button>;
    if(status === "error") return <Button className={"w-fit bg-destructive pointer-events-none"}> Error :( </Button>;
}