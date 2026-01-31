/**
 * Predefined answers for common quick questions.
 * This ensures instant, accurate responses for key portfolio information.
 */

import { Mood } from "@/components/my-lawyer/Courtroom";

interface PredefinedResponse {
  texts: string[];
  mood: Mood;

  spriteState?:
    | "idle"
    | "thinking"
    | "presenting"
    | "pointing"
    | "confident"
    | "bowing";
  isObjection?: boolean;
  chips?: string[]; // Suggested follow-up chips
}

import predefinedData from "@/data/my-lawyer/predefined_responses.json";

export const PREDEFINED_ANSWERS: Record<string, PredefinedResponse> =
  predefinedData.predefined_answers as unknown as Record<
    string,
    PredefinedResponse
  >;

export const WELCOME_MESSAGES: string[] = predefinedData.welcome_messages;

/**
 * Responses when user pauses/cancels the thinking process
 */
export const PAUSED_RESPONSES: string[] = [
  "Very well. I shall pause my deliberation. Please, take your time.",
  "Understood. I await your next inquiry when you are ready.",
  "Of course. Allow me to hold that thought for now.",
  "As you wish. I shall set aside this matter for the moment.",
];