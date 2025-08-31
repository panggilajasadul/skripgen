import { BrandProfile } from '../types';
import { authService } from './authService';

const LOCAL_BRAND_PROFILE_KEY_PREFIX = 'scriptgen_brand_profile_';

class BrandProfileService {
    
    private getLocalProfile(userId: string): BrandProfile | null {
        const key = `${LOCAL_BRAND_PROFILE_KEY_PREFIX}${userId}`;
        const profileJson = localStorage.getItem(key);
        return profileJson ? JSON.parse(profileJson) : null;
    }
    
    private saveLocalProfile(userId: string, profile: BrandProfile): void {
        const key = `${LOCAL_BRAND_PROFILE_KEY_PREFIX}${userId}`;
        localStorage.setItem(key, JSON.stringify(profile));
    }

    async getBrandProfile(): Promise<BrandProfile | null> {
        const user = await authService.getCurrentUser();
        if (!user) return null;
        
        return this.getLocalProfile(user.id);
    }

    async saveBrandProfile(profile: BrandProfile): Promise<void> {
        const user = await authService.getCurrentUser();
        if (!user) {
            console.error("Cannot save profile: no user logged in.");
            return;
        }
        
        this.saveLocalProfile(user.id, profile);
    }
}

export const brandProfileService = new BrandProfileService();