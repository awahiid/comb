import {useCompanyStore} from "@/stores/use-company-store";
import {useShallow} from "zustand/shallow";
import {Button} from "@/components/ui/button";
import {MdOutlineArrowOutward} from "react-icons/md";

export default function CompanyTags() {
    const {email, web, gmaps} = useCompanyStore(
        useShallow(state => ({
            email: state.email ,
            web: state.web,
            gmaps: state.gmaps,
        }))
    );

    return <div className={"flex flex-col gap-2 max-w-full h-fit mb-4"}>
        <Button variant={"ghost"} size={"sm"} className={"max-w-full w-fit"}>{email || "Contact unknown"}</Button>
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
