import { Template } from '../types';
import { TEMPLATES as DEFAULT_TEMPLATES } from '../constants';

const LOCAL_TEMPLATES_KEY = 'scriptgen_templates';

class TemplateService {
    constructor() {
        this.initializeLocal();
    }

    private initializeLocal(): void {
        if (!localStorage.getItem(LOCAL_TEMPLATES_KEY)) {
            localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES));
        }
    }

    private getLocalTemplates(): Template[] {
        const templatesJson = localStorage.getItem(LOCAL_TEMPLATES_KEY);
        return templatesJson ? JSON.parse(templatesJson) : [];
    }
    
    private saveLocalTemplates(templates: Template[]): void {
        localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(templates));
    }

    async getTemplates(): Promise<Template[]> {
        return this.getLocalTemplates();
    }

    async saveTemplate(template: Template): Promise<void> {
        let templates = this.getLocalTemplates();
        const existingIndex = templates.findIndex(t => t.id === template.id);
        if (existingIndex > -1) templates[existingIndex] = template;
        else templates.push(template);
        this.saveLocalTemplates(templates);
    }

    async deleteTemplate(templateId: string): Promise<void> {
        let templates = this.getLocalTemplates();
        templates = templates.filter(t => t.id !== templateId);
        this.saveLocalTemplates(templates);
    }
}

export const templateService = new TemplateService();