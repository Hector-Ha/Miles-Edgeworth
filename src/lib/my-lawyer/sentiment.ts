/**
 * Sentiment Analysis Module
 *
 * Analyzes user messages to detect mood and determine the appropriate
 * response strategy for Edgeworth.
 */

import type { Strategy } from "./prompts";

export type Mood = "POSITIVE" | "NEUTRAL" | "SKEPTICAL" | "HOSTILE";

interface SentimentResult {
  mood: Mood;
  score: number;
  strategy: Strategy;
}

/**
 * Words and phrases that indicate anger or hostility
 */
const ANGER_WORDS = [
  "stupid",
  "wrong",
  "disagree",
  "hate",
  "terrible",
  "useless",
  "bad",
  "worst",
  "awful",
  "ridiculous",
  "nonsense",
  "garbage",
  "trash",
  "liar",
  "fake",
  "scam",
];

/**
 * Phrases that indicate skepticism or doubt
 */
const SKEPTICAL_PHRASES = [
  "i don't think",
  "i dont think",
  "that's not true",
  "thats not true",
  "prove it",
  "not convinced",
  "i doubt",
  "unlikely",
  "hard to believe",
  "show me proof",
  "yeah right",
  "sure...",
  "really?",
  "are you sure",
  "i'm not sure",
  "im not sure",
];

/**
 * Positive and friendly indicators
 */
const POSITIVE_WORDS = [
  "great",
  "awesome",
  "excellent",
  "amazing",
  "impressive",
  "wonderful",
  "fantastic",
  "love",
  "thank",
  "thanks",
  "please",
  "interesting",
  "cool",
  "nice",
  "good",
  "helpful",
];

/**
 * Analyze a single text and return raw score delta
 */
function analyzeTextScore(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;

  // Check for anger words (+15 each)
  for (const word of ANGER_WORDS) {
    if (lower.includes(word)) {
      score += 15;
    }
  }

  // Check for skeptical phrases (+10 each)
  for (const phrase of SKEPTICAL_PHRASES) {
    if (lower.includes(phrase)) {
      score += 10;
    }
  }

  // Check for positive words (-8 each)
  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) {
      score -= 8;
    }
  }

  // Caps lock = shouting (+12 per ALL-CAPS word of 3+ letters)
  const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
  score += capsWords.length * 12;

  // Multiple punctuation = emphasis (+8 each)
  const multiExclamation = (text.match(/!{2,}/g) || []).length;
  const multiQuestion = (text.match(/\?{2,}/g) || []).length;
  score += (multiExclamation + multiQuestion) * 8;

  return score;
}

/**
 * Analyze text and return a sentiment score (0-100)
 * Higher score = more negative sentiment
 * Considers conversation history with decay (older messages have less weight)
 */
export function analyzeSentiment(
  text: string,
  history?: { role: string; content: string }[]
): SentimentResult {
  let totalScore = 0;

  // Analyze conversation history with decay
  // Most recent messages have more weight
  if (history && history.length > 0) {
    const userMessages = history.filter((m) => m.role === "user");
    const decayFactor = 0.6; // Each older message contributes 60% of previous weight

    for (let i = 0; i < userMessages.length; i++) {
      const messageAge = userMessages.length - 1 - i; // 0 = oldest, length-1 = most recent
      const weight = Math.pow(decayFactor, userMessages.length - 1 - messageAge);
      const messageScore = analyzeTextScore(userMessages[i].content);
      totalScore += messageScore * weight;
    }
  }

  // Current message has full weight
  totalScore += analyzeTextScore(text);

  // Ensure score is within bounds
  const finalScore = Math.max(0, Math.min(Math.round(totalScore), 100));

  // Determine mood and strategy based on score
  const mood = getMoodFromScore(finalScore);
  const strategy = getStrategyFromMood(mood);

  return {
    mood,
    score: finalScore,
    strategy,
  };
}

/**
 * Map sentiment score to mood category
 */
function getMoodFromScore(score: number): Mood {
  if (score >= 70) return "HOSTILE";
  if (score >= 40) return "SKEPTICAL";
  if (score >= 20) return "NEUTRAL";
  return "POSITIVE";
}

/**
 * Map mood to response strategy
 */
function getStrategyFromMood(mood: Mood): Strategy {
  switch (mood) {
    case "POSITIVE":
      return "AGGRESSIVE";
    case "NEUTRAL":
      return "ASSERTIVE";
    case "SKEPTICAL":
      return "DIPLOMATIC";
    case "HOSTILE":
      return "YIELDING";
    default:
      return "ASSERTIVE";
  }
}

/**
 * Get strategy directly from text
 */
export function getStrategy(
  text: string,
  history?: { role: string; content: string }[]
): Strategy {
  return analyzeSentiment(text, history).strategy;
}