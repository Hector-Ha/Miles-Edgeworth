/**
 * Chat API Route
 *
 * POST /api/my-lawyer/chat - Handle chat queries with sentiment-aware responses
 * GET /api/my-lawyer/chat - Health check
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeSentiment } from "@/lib/my-lawyer/sentiment";
import {
  generateSystemPrompt,
  shouldTriggerObjection,
} from "@/lib/my-lawyer/prompts";
import {
  chat,
  loadPersona,
  loadBio,
  detectQueryType,
  type ChatResponse,
  type HistoryMessage,
} from "@/lib/my-lawyer/agent";

/**
 * Request body type
 */
interface ChatRequest {
  query: string;
  history?: HistoryMessage[];
  context?: string;
}

/**
 * Handle POST requests for chat
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as ChatRequest;
    const { query, history = [], context } = body;

    // Validate input
    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json(
        {
          error: "Silence in the court! No query provided.",
          spriteState: "thinking",
          mood: "THINKING",
          isObjection: false,
        },
        { status: 400 },
      );
    }

    const trimmedQuery = query.trim();

    // Analyze user sentiment to determine strategy (considers conversation history)
    const sentiment = analyzeSentiment(trimmedQuery, history);

    // Detect query type for word limit and formatting
    const queryType = detectQueryType(trimmedQuery);

    console.log(
      `[Edgeworth] Query: "${trimmedQuery.substring(0, 50)}..." | ` +
        `Sentiment: ${sentiment.score}/100 | Strategy: ${sentiment.strategy} | Type: ${queryType}`,
    );

    // Load persona and bio data
    const [persona, bio] = await Promise.all([loadPersona(), loadBio()]);

    // Get system prompt based on strategy and data
    const systemPrompt = generateSystemPrompt(
      sentiment.strategy,
      persona,
      bio,
      queryType,
    );

    // Generate response with history context and any attached content
    const response: ChatResponse = await chat(
      trimmedQuery,
      systemPrompt,
      history,
      context,
      queryType,
    );

    // Override objection check with our helper
    const isObjection = shouldTriggerObjection(response.text, response.mood);

    return NextResponse.json({
      text: response.text,
      chunks: response.chunks,
      spriteState: response.spriteState,
      mood: response.mood,
      isObjection,
      // Include debug info in development
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          sentimentScore: sentiment.score,
          sentimentMood: sentiment.mood,
          strategy: sentiment.strategy,
        },
      }),
    });
  } catch (error) {
    console.error("[Edgeworth] API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Check if it's a HF_TOKEN error
    if (errorMessage.includes("HF_TOKEN")) {
      return NextResponse.json(
        {
          error:
            "The court lacks proper credentials. Please set HF_TOKEN in .env",
          spriteState: "thinking",
          mood: "THINKING",
          isObjection: false,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Technical difficulties in the courtroom. Please try again.",
        spriteState: "thinking",
        mood: "THINKING",
        isObjection: false,
      },
      { status: 500 },
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "Court is in session",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
