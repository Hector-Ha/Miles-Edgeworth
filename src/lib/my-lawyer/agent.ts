/**
 * Agent Module
 *
 * Provides RAG-powered evidence retrieval using keyword matching
 * and HuggingFace Inference API for response generation.
 */

import axios from "axios";
import fs from "fs/promises";
import path from "path";

/**
 * Evidence document loaded from data files
 */
interface EvidenceDoc {
  type: string;
  content: string;
  keywords: string[];
}

// Types
export interface ChatResponse {
  text: string;
  chunks: string[];
  spriteState: "idle" | "thinking" | "presenting" | "pointing" | "confident";
  mood: string;
  isObjection: boolean;
  queryType?: "brief" | "default" | "detailed";
}

// NVIDIA API configuration
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const LLM_MODEL = "minimaxai/minimax-m2";

// Singleton instances
let evidenceCache: EvidenceDoc[] | null = null;

/**
 * Resolve the data directory path
 */
async function resolveDataDir(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), "src", "data", "my-lawyer"),
    path.join(process.cwd(), "data", "my-lawyer"),
    path.join(process.cwd(), "PortfolioWebsite", "src", "data", "my-lawyer"),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error(
    `Data directory not found. Searched: ${candidates.join(", ")}`,
  );
}

/**
 * Extract keywords from text for matching
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

/**
 * Split text into logical chunks for chat bubbles
 */
function chunkText(text: string): string[] {
  // Split by double newlines (paragraphs)
  const rawChunks = text.split(/\n\s*\n/);

  // Filter out empty chunks and trim
  return rawChunks
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

/**
 * Detect query type for word limit adjustments
 */
export function detectQueryType(
  query: string,
): "brief" | "default" | "detailed" {
  const lowerQuery = query.toLowerCase();

  const briefKeywords = [
    "generally",
    "general",
    "briefly",
    "quick",
    "short",
    "summary",
    "summarize",
  ];
  const detailedKeywords = [
    "detail",
    "in-depth",
    "explain",
    "elaborate",
    "comprehensive",
    "deep dive",
    "specifics",
  ];

  if (briefKeywords.some((k) => lowerQuery.includes(k))) return "brief";
  if (detailedKeywords.some((k) => lowerQuery.includes(k))) return "detailed";

  return "default";
}

/**
 * Get NVIDIA API key
 */
function getNvidiaApiKey(): string {
  const token = process.env.NVIDIA_API_KEY;
  if (!token) {
    throw new Error(
      "NVIDIA_API_KEY environment variable is not set. Please add it to .env",
    );
  }
  return token;
}

/**
 * Load evidence documents from data folder
 */
async function loadEvidence(): Promise<EvidenceDoc[]> {
  if (evidenceCache) return evidenceCache;

  console.log("[Edgeworth] Loading evidence files...");

  /* 93:   const dataDir = await resolveDataDir(); */
  const dataDir = await resolveDataDir();
  const files = [
    "bio.json",
    "skills.json",
    "experience.json",
    "education.json",
  ];
  const documents: EvidenceDoc[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(dataDir, file);
      const contentRaw = await fs.readFile(filePath, "utf-8");
      // If it's JSON, parse it then stringify for better keyword matching context
      let content = contentRaw;
      if (file.endsWith(".json")) {
        try {
          const json = JSON.parse(contentRaw);
          content = JSON.stringify(json, null, 2);
        } catch (e) {
          console.warn(
            `[Edgeworth] Failed to parse JSON for ${file}, using raw text.`,
          );
        }
      }

      const docType = file.replace(".json", "").replace(".txt", "");

      documents.push({
        type: docType,
        content,
        keywords: extractKeywords(content),
      });

      console.log(`[Edgeworth] Loaded evidence: ${file}`);
    } catch (error) {
      console.warn(`[Edgeworth] Could not load ${file}:`, error);
    }
  }

  if (documents.length === 0) {
    throw new Error("No evidence documents found in data/ folder");
  }

  evidenceCache = documents;
  console.log("[Edgeworth] Evidence loaded. Court is in session.");
  return documents;
}

/**
 * Load persona configuration from JSON
 */
export async function loadPersona(): Promise<any> {
  const dataDir = await resolveDataDir();
  const filePath = path.join(dataDir, "persona.json");
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.warn("[Edgeworth] Failed to load persona.json:", e);
    return {};
  }
}

/**
 * Load Bio data specifically for prompt construction
 */
export async function loadBio(): Promise<any> {
  const dataDir = await resolveDataDir();
  const filePath = path.join(dataDir, "bio.json");
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.warn("[Edgeworth] Failed to load bio.json:", e);
    return {};
  }
}

/**
 * Search evidence using keyword matching
 */
export async function searchEvidence(query: string): Promise<string> {
  const evidence = await loadEvidence();
  const queryKeywords = extractKeywords(query);

  // Score each document by keyword overlap
  const scored = evidence.map((doc) => {
    const matches = queryKeywords.filter((kw) =>
      doc.keywords.includes(kw),
    ).length;
    return { doc, score: matches };
  });

  // Sort by score and take top matches
  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter((s) => s.score > 0).slice(0, 3);

  if (relevant.length === 0) {
    // Return all evidence if no keyword matches
    return evidence
      .map((d) => `[${d.type.toUpperCase()}]\n${d.content}`)
      .join("\n\n---\n\n");
  }

  return relevant
    .map((r) => `[${r.doc.type.toUpperCase()}]\n${r.doc.content}`)
    .join("\n\n---\n\n");
}

/**
 * History message for context
 */
export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Generate a response using HuggingFace Inference API
 * @param query - Current user query
 * @param systemPrompt - System prompt for persona
 * @param history - Previous conversation messages (max 6 for context)
 * @param attachedContext - Optional context from uploaded files or links
 */
export async function chat(
  query: string,
  systemPrompt: string,
  history: HistoryMessage[] = [],
  attachedContext?: string,
  queryType: "brief" | "default" | "detailed" = "default",
): Promise<ChatResponse> {
  const apiKey = getNvidiaApiKey();

  // Search for relevant evidence
  const evidence = await searchEvidence(query);

  // Build user message with evidence context
  let userMessage = `EVIDENCE FROM HECTOR'S FILES:
${evidence}`;

  // Add attached context from files/links if provided
  if (attachedContext) {
    userMessage += `

USER-PROVIDED CONTENT (from uploaded files or links):
${attachedContext}`;
  }

  userMessage += `
USER QUESTION: ${query}

RESPONSE REQUIREMENTS:
- Use "Translated Sonkeigo" tone (polite, humble, respectful).
- ${queryType === "brief" ? "Keep response UNDER 50 WORDS." : queryType === "detailed" ? "Provide a COMPREHENSIVE, DETAILED response." : "Keep response concise (approx 100 words)."}
- NO markdown headers (##). Use paragraphs only.

Respond naturally. If the user refers to something from earlier, use context from our conversation. End with one of these mood tags: [PRESENTING], [THINKING], [CONFIDENT], [OBJECTING], [SMIRKING], [SERIOUS], [EXPLAINING], [POINTING].`;

  // Build messages array: system + history + current
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: systemPrompt }];

  // Add history (limit to last 6 messages to stay within token limits)
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current user message
  messages.push({ role: "user", content: userMessage });

  try {
    console.log(`[Edgeworth] Using model: ${LLM_MODEL}`);

    const response = await axios.post(
      NVIDIA_API_URL,
      {
        model: LLM_MODEL,
        messages,
        max_tokens:
          queryType === "brief" ? 256 : queryType === "detailed" ? 1024 : 512,
        temperature: 0.8,
        top_p: 0.95,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 120000,
      },
    );

    console.log("[Edgeworth] Response received successfully");

    let generatedText = response.data?.choices?.[0]?.message?.content || "";

    // Extract and log <think> content (reasoning traces from some models)
    // Robust regex to capture think tags across multiple lines
    const thinkMatch = generatedText.match(/<think>([\s\S]*?)<\/think>/i);
    if (thinkMatch) {
      console.log("[Edgeworth] Model reasoning:", thinkMatch[1].trim());
      // Remove think block completely before any other processing
      generatedText = generatedText
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();
    }

    // Parse mood tag from response
    const moodMatch = generatedText.match(
      /\[(CONFIDENT|THINKING|PRESENTING|OBJECTING|SMIRKING|SERIOUS|EXPLAINING|POINTING)\]/i,
    );
    const moodTag = moodMatch ? moodMatch[1].toUpperCase() : "PRESENTING";

    // Clean response text
    let cleanText = generatedText
      // Remove mood tags
      .replace(
        /\[(CONFIDENT|THINKING|PRESENTING|OBJECTING|SMIRKING|SERIOUS|EXPLAINING|POINTING)\]/gi,
        "",
      )
      // Remove markdown bold/italic
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      .replace(/_(.+?)_/g, "$1")
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove markdown links but keep text
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      // Remove code backticks
      .replace(/`(.+?)`/g, "$1")
      // Clean up extra whitespace
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Determine sprite state
    const spriteState = moodToSprite(moodTag);

    // Check for objection trigger
    const isObjection =
      moodTag === "OBJECTING" || cleanText.toLowerCase().includes("objection!");

    // Log mood/sprite info for debugging
    console.log(
      `[Edgeworth] Mood Tag: ${moodTag} | Sprite State: ${spriteState} | isObjection: ${isObjection}`,
    );

    // Generate chunks
    const chunks = chunkText(
      cleanText || "The evidence requires further examination...",
    );

    return {
      text: cleanText || "The evidence requires further examination...",
      chunks,
      spriteState,
      mood: moodTag,
      isObjection,
      queryType,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("[Edgeworth] API error details:");
      console.error("  Status:", error.response?.status);
      console.error("  Status Text:", error.response?.statusText);
      console.error("  Data:", JSON.stringify(error.response?.data, null, 2));
      console.error("  Code:", error.code);
      console.error("  Message:", error.message);
    } else if (error instanceof Error) {
      console.error("[Edgeworth] Error:", error.message);
    } else {
      console.error("[Edgeworth] Unknown error:", error);
    }

    return {
      text: "Objection! Technical difficulties in the courtroom. Please try again.",
      chunks: [
        "Objection! Technical difficulties in the courtroom. Please try again.",
      ],
      spriteState: "thinking",
      mood: "THINKING",
      isObjection: false,
    };
  }
}

/**
 * Map mood tag to sprite state
 */
function moodToSprite(
  mood: string,
): "idle" | "thinking" | "presenting" | "pointing" | "confident" {
  switch (mood.toUpperCase()) {
    case "OBJECTING":
    case "POINTING":
      return "pointing";
    case "CONFIDENT":
    case "SMIRKING":
      return "confident";
    case "THINKING":
      return "thinking";
    case "PRESENTING":
    case "SERIOUS":
    case "EXPLAINING":
      return "presenting";
    default:
      return "presenting";
  }
}