import {Toaster} from "sonner";

export function CombToaster({id}: {id?: string}) {
    return <Toaster
        id={id}
        position={"bottom-center"}
        toastOptions={{
            unstyled: true,
            classNames: {
                toast: "toast",
                title: "title",
                content: "content",
                actionButton: "action-button",
                cancelButton: "cancel-button",
                closeButton: "close-button",
                icon: "icon",
                error: "error",
            }
        }}

    />;
}