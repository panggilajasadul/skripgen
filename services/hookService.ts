// This service is deprecated. The hook generation logic has been migrated to an AI-based
// approach in `services/geminiService.ts`. This file can be removed if no other
// parts of the application depend on it.

import { HookGeneratorFormData } from '../types';

export const generateHooks = (data: HookGeneratorFormData): string[] => {
    console.warn("`generateHooks` from `hookService` is deprecated. Use `generateHooksWithAI` from `geminiService` instead.");
    return [
      "This is a deprecated function.",
      "Please use the AI-powered hook generator.",
      "It provides much better and more dynamic results.",
      "Thank you for using SkripGen 3.0!",
      "This old generator is no longer maintained.",
      "The new generator has replaced this one.",
      "The button you clicked already uses the new AI.",
      "This code should not be running.",
      "The system has been successfully upgraded.",
      "Enjoy the new AI features!"
    ];
};