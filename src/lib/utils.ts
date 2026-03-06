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

export const formatDate = (date: number) => {
  return new Date(date).toLocaleDateString();
}

export async function* chat(prompt: string, controller?: AbortController) {
  const key = useConfigurationStore.getState().config.groqKey;
  if (key === "") { yield "Groq key not set"; return; }

  window.electronAPI.cleanup();

  const queue: string[] = [];
  let done = false;
  let notify: (() => void) | null = null;

  window.electronAPI.onChunk((content) => {
    queue.push(content);
    notify?.();
  });

  window.electronAPI.onEnd(() => {
    done = true;
    notify?.();
  });

  window.electronAPI.askGroq(key, prompt);

  while (true) {
    if(controller?.signal.aborted){
      window.electronAPI.cleanup();
      return;
    }

    if (queue.length > 0) {
      yield queue.shift()!;
    } else if (done) {
      break;
    } else {
      await new Promise<void>((r) => (notify = r));
    }
  }

  window.electronAPI.cleanup();
}