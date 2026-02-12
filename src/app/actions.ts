'use server';

import { generateEncouragement } from '@/ai/flows/generate-encouragement';


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
