export const IPC = {
    AI: {
        ASK: "ai:ask",
        MODELS: "ai:models",
        CHUNK: (id: string) => `ai:chunk:${id}`,
        ERROR: (id: string) => `ai:error:${id}`,
        END: (id: string) => `ai:end:${id}`,
    },
    SCRAPER: {
        SCRAP: "scraper:scrap",
        CANCEL: "scraper:cancel",
    },
    EMAIL: {
        SEND: "email:send",
        GET: "email:get"
    },
    CONFIG: {
        LOAD: "config:load",
        SAVE: "config:save",
    },
} as const;