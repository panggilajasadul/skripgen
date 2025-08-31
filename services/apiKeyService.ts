// The API key is now managed via environment variables as per guidelines.
// This service provides a consistent interface for the rest of the app.
class ApiKeyService {
    async getApiKey(): Promise<string | null> {
        // FIX: Replaced `import.meta.env.VITE_API_KEY` with `process.env.API_KEY`
        // to align with the strict coding guidelines and resolve the TypeScript error
        // 'Property 'env' does not exist on type 'ImportMeta''. The build system is
        // responsible for making `process.env.API_KEY` available in the client environment.
        const apiKey = process.env.API_KEY;
        return Promise.resolve(apiKey || null);
    }

    async saveApiKey(key: string): Promise<void> {
        // This is a no-op. The key is managed by the environment.
        console.warn("API Key management is handled by environment variables and cannot be set via the app.");
    }
    
    async clearApiKey(): Promise<void> {
        // This is a no-op. The key is managed by the environment.
        console.warn("API Key management is handled by environment variables and cannot be cleared via the app.");
    }
}

export const apiKeyService = new ApiKeyService();