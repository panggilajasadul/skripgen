import { Quote } from '../types';
import { MOTIVATIONAL_QUOTES as DEFAULT_MOTIVATIONAL, TOUGH_LOVE_QUOTES as DEFAULT_TOUGH_LOVE } from '../constants';

const LOCAL_MOTIVATIONAL_KEY = 'scriptgen_quotes_motivational';
const LOCAL_TOUGH_LOVE_KEY = 'scriptgen_quotes_tough_love';

class QuoteService {
    constructor() {
        this.initializeLocal();
    }

    private initializeLocal(): void {
        if (!localStorage.getItem(LOCAL_MOTIVATIONAL_KEY)) {
            localStorage.setItem(LOCAL_MOTIVATIONAL_KEY, JSON.stringify(DEFAULT_MOTIVATIONAL));
        }
        if (!localStorage.getItem(LOCAL_TOUGH_LOVE_KEY)) {
            localStorage.setItem(LOCAL_TOUGH_LOVE_KEY, JSON.stringify(DEFAULT_TOUGH_LOVE));
        }
    }

    private getLocalQuotes(key: string): Quote[] {
        const quotesJson = localStorage.getItem(key);
        return quotesJson ? JSON.parse(quotesJson) : [];
    }

    private saveLocalQuotes(key: string, quotes: Quote[]): void {
        localStorage.setItem(key, JSON.stringify(quotes));
    }
    
    async getMotivationalQuotes(): Promise<Quote[]> {
        return this.getLocalQuotes(LOCAL_MOTIVATIONAL_KEY);
    }

    async getToughLoveQuotes(): Promise<Quote[]> {
        return this.getLocalQuotes(LOCAL_TOUGH_LOVE_KEY);
    }

    async saveMotivationalQuote(quote: Quote): Promise<void> {
         let quotes = this.getLocalQuotes(LOCAL_MOTIVATIONAL_KEY);
         const index = quotes.findIndex(q => q.id === quote.id);
         if (index > -1) quotes[index] = quote;
         else quotes.push(quote);
         this.saveLocalQuotes(LOCAL_MOTIVATIONAL_KEY, quotes);
    }
    
    async saveToughLoveQuote(quote: Quote): Promise<void> {
         let quotes = this.getLocalQuotes(LOCAL_TOUGH_LOVE_KEY);
         const index = quotes.findIndex(q => q.id === quote.id);
         if (index > -1) quotes[index] = quote;
         else quotes.push(quote);
         this.saveLocalQuotes(LOCAL_TOUGH_LOVE_KEY, quotes);
    }

    async deleteMotivationalQuote(quoteId: string): Promise<void> {
        let quotes = this.getLocalQuotes(LOCAL_MOTIVATIONAL_KEY);
        quotes = quotes.filter(q => q.id !== quoteId);
        this.saveLocalQuotes(LOCAL_MOTIVATIONAL_KEY, quotes);
    }

    async deleteToughLoveQuote(quoteId: string): Promise<void> {
        let quotes = this.getLocalQuotes(LOCAL_TOUGH_LOVE_KEY);
        quotes = quotes.filter(q => q.id !== quoteId);
        this.saveLocalQuotes(LOCAL_TOUGH_LOVE_KEY, quotes);
    }
}

export const quoteService = new QuoteService();