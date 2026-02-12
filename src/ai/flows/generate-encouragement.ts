'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating encouraging messages for a child learning letters.
 *
 * - generateEncouragement - A function that generates an encouraging message.
 * - GenerateEncouragementInput - The input type for the generateEncouragement function (empty).
 * - GenerateEncouragementOutput - The return type for the generateEncouragement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEncouragementInputSchema = z.void();
export type GenerateEncouragementInput = z.infer<typeof GenerateEncouragementInputSchema>;

const GenerateEncouragementOutputSchema = z.object({
  message: z.string().describe('A short, positive, and encouraging message for a child learning letters.'),
});
export type GenerateEncouragementOutput = z.infer<typeof GenerateEncouragementOutputSchema>;

export async function generateEncouragement(input: GenerateEncouragementInput): Promise<GenerateEncouragementOutput> {
  return generateEncouragementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEncouragementPrompt',
  input: {schema: GenerateEncouragementInputSchema},
  output: {schema: GenerateEncouragementOutputSchema},
  prompt: `Generate a very short, positive, and encouraging message for a young child who is learning to recognize letters.
Keep the message simple, child-friendly, and very brief. Examples: "Great job!", "You're doing wonderfully!", "Keep up the great work!"`,
});

const generateEncouragementFlow = ai.defineFlow(
  {
    name: 'generateEncouragementFlow',
    inputSchema: GenerateEncouragementInputSchema,
    outputSchema: GenerateEncouragementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
