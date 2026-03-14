import Store from 'electron-store';
import { Configuration } from "../shared/types";
import { DEFAULT_CONFIG } from "../shared/config";

export const store = new Store<{ config: Configuration }>({
    defaults: { config: DEFAULT_CONFIG }
});

export const getConfig = () => store.get("config")