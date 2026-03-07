import {useEmailStore} from "@/stores/use-email-store";
import React from "react";
import {CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {FaRegFile} from "react-icons/fa6";
import {IoAdd, IoCloseSharp} from "react-icons/io5";
import EmailSendButton from "@/components/email/email-send-button";
import {useShallow} from "zustand/shallow";
import CombAI from "@/assets/comb-ai.svg";

export default function EmailAttachments({ onGenerate }: { onGenerate: () => void }) {
    const {attachments, addAttachment, removeAttachment} = useEmailStore(
        useShallow(state => ({
            attachments: state.attachments,
            addAttachment: state.addAttachment,
            removeAttachment: state.removeAttachment
        }))
    );

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        Array.from(e.target.files).forEach((file) => addAttachment(file));
        e.target.value = "";
    };

    return <CardContent className={"flex flex-col gap-4 w-full"}>
        {attachments.length > 0 && <div className={"flex items-center gap-2 max-w-full flex-wrap"}>
            {
                attachments.map(attachment => {
                    return <Button
                        key={attachment.id}
                        variant={"ghost"}
                        className={"border relative max-w-full"}
                        onClick={() => {
                            removeAttachment(attachment.id)
                        }}
                    >
                        <FaRegFile/>
                        <p className={"max-w-full overflow-hidden text-ellipsis"}>
                            {attachment.file.name}
                        </p>
                        <IoCloseSharp/>
                    </Button>
                })
            }
        </div>}
        <div className={"flex w-full items-center gap-2 max-w-full justify-between"}>
            <Button variant="ghost" className="size-9 relative overflow-hidden hover:cursor-pointer">
                <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer hover:cursor-pointer"
                />
                <IoAdd/>
            </Button>
            <div>
                <Button onClick={onGenerate} variant={"ghost"} className={"justify-between mr-2"}>
                    Generate
                    <CombAI/>
                </Button>
                <EmailSendButton />
            </div>
        </div>
    </CardContent>
}