import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {useConfigurationStore} from "@/stores/use-configuration-store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(str: string): string {
  return str.replace(/^(\s*\p{L})/u, (c) => c.toUpperCase());
}

export async function* chat(prompt: string) {
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
    const {done, value} = await reader.read();
    if (done) break;

    yield decoder.decode(value, {stream: true});
  }
}