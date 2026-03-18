type ToastTypes = "normal" | "action" | "success" | "info" | "warning" | "error" | "loading" | "default"

export type Alert = {
    toasterId?: string;
    title: string;
    content: string;
    type?: ToastTypes;
};