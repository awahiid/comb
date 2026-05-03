import { Configuration } from "./types";
import { PH_CMP_DESCRIPTION, PH_CMP_SCRAP } from "./placeholders";

/**
 * To start using comb you might want to edit the default configuration.
 * Use this file to set up your information so it does not get lost when reloading.
 * */
export const DEFAULT_CONFIG: Configuration = {
    key: ``,
    keyType: `groq`,
    model: ``,
    user: ``,
    pass: ``,
    hostname: ``,
    SMTPPort: ``,
    IMAPPort: ``,
    requiredAttachment: false,
    subjectBasePrompt: `${PH_CMP_DESCRIPTION}`,
    contentBasePrompt: `${PH_CMP_DESCRIPTION}`,
    descriptionBasePrompt: `${PH_CMP_SCRAP}`
} as const;