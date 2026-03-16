import {getAddress, useCompanyStore} from "@/stores/use-company-store";
import { useConfigurationStore } from "@/stores/use-configuration-store";
import { Company } from "@shared/types";
import {useDataStore} from "@/stores/use-data-store";
import {useEmailStore} from "@/stores/use-email-store";
import {sleep} from "@/lib/utils";

export default async function runAuto(company: Company) {
    const { autoConfig, config } = useConfigurationStore.getState();
    if (!autoConfig.autoGenerate) return;

    const { generateDescription, setEmailDraft, set } = useCompanyStore.getState();

    if(!company.description) {
        await generateDescription(config.descriptionBasePrompt);

        const { descriptionDraft } = useCompanyStore.getState();
        setEmailDraft(getAddress(company.email, descriptionDraft));
        set("description", descriptionDraft);
        set("email", getAddress(company.email, descriptionDraft));
    }

    const isLast = company.id === useDataStore.getState().companies.at(-1)?.id;

    const { email } = useCompanyStore.getState();

    if (!isLast && autoConfig.autoSend) {
        if (email) {
            try {
                await useEmailStore.getState().generateEmail();
                if(await useEmailStore.getState().send(config, [email])) {
                    await sleep(autoConfig.sendIntervalSeconds * 1000);
                }
            } catch { }
        }

        useDataStore.getState().moveToCompany(1);
    } else {
        useEmailStore.getState().generateEmail();
    }
}