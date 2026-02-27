import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {useConfigurationStore} from "@/stores/use-configuration-store";

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

export async function* chat(prompt: string, controller?: AbortController) {
  const key = useConfigurationStore.getState().config.groqKey
  if(key === "") yield "Groq key not set";

  const res = await fetch("/api/comb", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({key, prompt}),
  });

  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    if(controller?.signal.aborted) return;
    const {done, value} = await reader.read();
    if (done) break;

    yield decoder.decode(value, {stream: true});
  }
}