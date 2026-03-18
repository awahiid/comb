import { useCompanyStore } from "@/stores/use-company-store";
import { useShallow } from "zustand/shallow";
import { MdOutlineArrowOutward } from "react-icons/md";

export default function CompanyTags() {
    const { email, web, gmaps, sentEmails } = useCompanyStore(
        useShallow(state => ({
            email: state.email,
            web: state.web,
            gmaps: state.gmaps,
            sentEmails: state.sentEmails,
        }))
    );

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <Tag>
                <span className="tabular-nums font-medium">{sentEmails?.length ?? 0}</span>
                <span className="text-muted-foreground"> sent to </span>
                <span className="truncate max-w-[160px]">{!email ? "unknown" : email}</span>
            </Tag>

            <LinkTag href={web}>
                <span className="truncate max-w-[160px]">{web}</span>
            </LinkTag>

            <LinkTag href={gmaps}>
                Google Maps
            </LinkTag>
        </div>
    );
}

function Tag({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center p-1 gap-1.5 text-xs border">
            {icon}
            {children}
        </span>
    );
}


function LinkTag({ href, icon, children }: { href?: string; icon?: React.ReactNode; children: React.ReactNode }) {
    if (!href) return null;
    return (
        <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex border items-center gap-1 text-xs p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
    >
        {icon}
        {children}
        <MdOutlineArrowOutward/>
        </a>
    );
}