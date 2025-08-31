import { QuoteSettings } from '../types';

const LOCAL_SETTINGS_KEY = 'scriptgen_global_settings';

const DEFAULT_SETTINGS: QuoteSettings = {
    motivationalEnabled: false,
    toughLoveEnabled: true,
    toughLoveThreshold: 3,
};

class SettingsService {
    constructor() {
        this.initializeLocal();
    }

    private initializeLocal(): void {
        if (!localStorage.getItem(LOCAL_SETTINGS_KEY)) {
            localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
        }
    }

    async getSettings(): Promise<QuoteSettings> {
        const settingsJson = localStorage.getItem(LOCAL_SETTINGS_KEY);
        const savedSettings = settingsJson ? JSON.parse(settingsJson) : {};
        return { ...DEFAULT_SETTINGS, ...savedSettings };
    }

    async saveSettings(settings: QuoteSettings): Promise<void> {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    }
}

export const settingsService = new SettingsService();