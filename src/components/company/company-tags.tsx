import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {Button} from "@/components/ui/button";
import {MdOutlineArrowOutward} from "react-icons/md";
import {IoCheckmarkSharp} from "react-icons/io5";

export default function CompanyTags() {
    const {email, status, web, gmaps} = useCompanyStore(
        useShallow(state => ({
            email: state.company?.email,
            status: state.company?.status,
            web: state.company?.web,
            gmaps: state.company?.gmaps
        }))
    );

    return <div className={"flex flex-wrap gap-2 max-w-full"}>
        <Button variant={"ghost"} size={"sm"} className={"max-w-full"}>
            {!status && "Not sent"}
            {status === "sent" && <><IoCheckmarkSharp/> Sent</>}
        </Button>
        <Button variant={"ghost"} size={"sm"} className={"max-w-full"}>{email || "Contact unknown"}</Button>
        <Button asChild variant="ghost" size={"sm"} className={"max-w-full"}>
            <a
                href={web}
                target="_blank"
                rel="noopener noreferrer"
            >
                <p className="text-ellipsis overflow-hidden">{web}</p> <MdOutlineArrowOutward/>
            </a>
        </Button>
        <Button asChild variant="ghost" size={"sm"} className={"max-w-full"}>
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
