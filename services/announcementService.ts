import { Announcement } from '../types';

const LOCAL_ANNOUNCEMENT_KEY = 'scriptgen_global_announcement';
const SEEN_ANNOUNCEMENT_KEY_PREFIX = 'scriptgen_seen_announcement_';

class AnnouncementService {
    
    async setAnnouncement(title: string, message: string): Promise<void> {
        const newAnnouncement: Announcement = {
            id: Date.now().toString(),
            title,
            message,
        };
        localStorage.setItem(LOCAL_ANNOUNCEMENT_KEY, JSON.stringify(newAnnouncement));
    }

    async getAnnouncement(): Promise<Announcement | null> {
        const announcementJson = localStorage.getItem(LOCAL_ANNOUNCEMENT_KEY);
        return announcementJson ? JSON.parse(announcementJson) : null;
    }

    async clearAnnouncement(): Promise<void> {
        localStorage.removeItem(LOCAL_ANNOUNCEMENT_KEY);
    }
    
    hasSeenCurrentAnnouncement(announcementId: string): boolean {
        const seenId = localStorage.getItem(`${SEEN_ANNOUNCEMENT_KEY_PREFIX}${announcementId}`);
        return seenId === 'true';
    }
    
    markAsSeen(announcementId: string): void {
        localStorage.setItem(`${SEEN_ANNOUNCEMENT_KEY_PREFIX}${announcementId}`, 'true');
    }
}

export const announcementService = new AnnouncementService();