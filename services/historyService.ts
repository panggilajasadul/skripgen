import { ScriptData } from '../types';
import { authService } from './authService';

const LOCAL_HISTORY_KEY = 'scriptgen_history';

class HistoryService {

    private getLocalHistory(): ScriptData[] {
        const historyJson = localStorage.getItem(LOCAL_HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    }
    
    private saveLocalHistory(history: ScriptData[]): void {
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
    }

    async getHistory(): Promise<ScriptData[]> {
        // Note: local history is shared across all users in the same browser.
        return this.getLocalHistory();
    }

    async saveScript(script: Omit<ScriptData, 'id' | 'createdAt'>): Promise<void> {
        const newScript = {
            ...script,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        const history = [newScript, ...this.getLocalHistory()];
        this.saveLocalHistory(history);
    }
    
    async deleteScript(scriptId: string): Promise<void> {
        let history = this.getLocalHistory();
        history = history.filter(item => item.id !== scriptId);
        this.saveLocalHistory(history);
    }

    async updateScriptVariations(scriptId: string, variations: ScriptData['variations']): Promise<void> {
         let history = this.getLocalHistory();
         const itemIndex = history.findIndex(item => item.id === scriptId);
         if (itemIndex > -1) {
             history[itemIndex].variations = variations;
             this.saveLocalHistory(history);
         }
    }
}

export const historyService = new HistoryService();