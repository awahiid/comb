import {useConfigurationStore} from "@/stores/use-configuration-store";

export async function* chat(prompt: string, controller?: AbortController) {
    const key = useConfigurationStore.getState().config.groqKey;
    if (key === "") {
        yield "Groq key not set";
        return;
    }
    const id = crypto.randomUUID()

    window.electronAPI.cleanup(id);

    const queue: string[] = [];
    let done = false;
    let notify: (() => void) | null = null;
    let aborted = false;
    let error: string | undefined;

    controller?.signal.addEventListener('abort', () => {
        aborted = true;
        notify?.();
    }, {once: true});

    window.electronAPI.onChunk(id, (content) => {
        queue.push(content);
        notify?.();
    });

    window.electronAPI.onError(id, e => {
        done = true;
        notify?.();
        error = e;
    });

    window.electronAPI.onEnd(id, () => {
        done = true;
        notify?.();
    });

    window.electronAPI.askGroq(key, prompt, id);

    while (!aborted) {
        if (error) {
            window.electronAPI.cleanup(id);
            throw new Error(`${error}`);
        }

        if (queue.length > 0) {
            yield queue.shift()!;
        } else if (done) {
            break;
        } else {
            await new Promise<void>((r) => {
                notify = r;
                controller?.signal.addEventListener('abort', () => {
                    r()
                }, {once: true});
            });

            if (aborted) {
                window.electronAPI.cleanup(id);
                return;
            }
        }
    }

    window.electronAPI.cleanup(id);
}