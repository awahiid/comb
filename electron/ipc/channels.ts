export const IPC = {
    GROQ: {
        ASK: "groq:ask",
        CHUNK: (id: string) => `groq:chunk:${id}`,
        ERROR: (id: string) => `groq:error:${id}`,
        END: (id: string) => `groq:end:${id}`,
    },
    SCRAPER: {
        SCRAP: "scraper:scrap",
        CANCEL: "scraper:cancel",
    },
    EMAIL: {
        SEND: "email:send",
    },
    CONFIG: {
        LOAD: "config:load",
        SAVE: "config:save",
    },
} as const;