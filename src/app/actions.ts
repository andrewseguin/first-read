'use server';

import { generateEncouragement } from '@/ai/flows/generate-encouragement';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { PHONICS_SOUNDS } from '@/lib/letters';


export async function getEncouragement(): Promise<string> {
    try {
        const result = await generateEncouragement();
        return result.message;
    } catch(e) {
        console.error("Failed to generate encouragement:", e);
        // Provide a friendly, static fallback message
        return "You're doing great!";
    }
}

export async function getPhonicsSound(letter: string): Promise<string | null> {
    const sound = PHONICS_SOUNDS[letter.toLowerCase()];
    if (!sound) {
        console.warn(`No phonics sound found for letter: ${letter}`);
        return null;
    }

    const text = `${letter.toUpperCase()} says ${sound}`;

    try {
        const result = await textToSpeech(text);
        return result.media;
    } catch (e) {
        console.error("Failed to generate phonics sound:", e);
        return null;
    }
}
