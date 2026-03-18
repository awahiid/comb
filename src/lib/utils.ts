import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {toast} from "sonner";

import {Alert} from "@/types";

export const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(str: string): string {
  return str.replace(/^(\s*\p{L})/u, (c) => c.toUpperCase());
}

export const extractEmails = (text: string) => {
  const matches = [...text.matchAll(emailRegex)];
  return matches[0]?.map(email => email.toLowerCase()) ?? [];
}

export const formatDate = (date: number) => {
  return new Date(date).toLocaleDateString();
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function showAlert (alert: Alert) {
  toast(alert.title, {
    toasterId: alert.toasterId,
    description: alert.content,
    dismissible: true,
    // @ts-expect-error type attribute type is not importable
    type: alert.type ?? "default",
    closeButton: true,
  })
}