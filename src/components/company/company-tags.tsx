import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {Button} from "@/components/ui/button";
import {MdOutlineArrowOutward} from "react-icons/md";
import {formatDate} from "@/lib/utils";

export default function CompanyTags() {
    const {email, sent, status, web, gmaps} = useCompanyStore(
        useShallow(state => ({
            email: state.company?.email,
            sent: state.company?.sentOn,
            status: state.company?.status,
            web: state.company?.web,
            gmaps: state.company?.gmaps,
            messageId: state.company?.messageId,
        }))
    );

    return <div className={"flex flex-col gap-2 max-w-full"}>
        <Button variant={"ghost"} size={"sm"} className={"max-w-full w-fit"}>{email || "Contact unknown"}</Button>
        <Button variant={"ghost"} size={"sm"} className={"justify-start w-fit min-h-fit"}>
            {!status && "Not sent yet"}
            {status === "sent" &&
                <p className={"flex items-center gap-1 text-wrap text-start"}>
                    Sent on {sent && formatDate(sent)} <MdOutlineArrowOutward/>
                </p>
            }
        </Button>
        <Button asChild variant="ghost" size={"sm"} className={"max-w-full w-fit"}>
            <a
                href={web}
                target="_blank"
                rel="noopener noreferrer"
            >
                <p className="text-ellipsis overflow-hidden">{web}</p> <MdOutlineArrowOutward/>
            </a>
        </Button>
        <Button asChild variant="ghost" size={"sm"} className={"max-w-full w-fit"}>
            <a
                href={gmaps}
                target="_blank"
                rel="noopener noreferrer"
            >
                <p className="text-ellipsis overflow-hidden">{gmaps}</p> <MdOutlineArrowOutward/>
            </a>
        </Button>
    </div>;
}
