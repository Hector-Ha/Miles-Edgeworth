/**
 * Warmup API Route
 *
 * POST /api/my-lawyer/warmup - Silent warmup request to wake up the LLM
 *
 * This endpoint sends a minimal request to the LLM to trigger cold start
 * before the user actually needs it. Response is intentionally minimal.
 */

import { NextResponse } from "next/server";
import axios from "axios";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const LLM_MODEL = "minimaxai/minimax-m2";

export async function POST(): Promise<NextResponse> {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ warmed: false, reason: "no_key" });
  }

  try {
    console.log("[Edgeworth] Warmup request initiated...");

    const response = await axios.post(
      NVIDIA_API_URL,
      {
        model: LLM_MODEL,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 5,
        temperature: 0.1,
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

    if (response.data?.choices?.[0]) {
      console.log("[Edgeworth] Warmup successful - model is ready");
      return NextResponse.json({ warmed: true });
    }

    return NextResponse.json({ warmed: false, reason: "no_response" });
  } catch (error) {
    console.log("[Edgeworth] Warmup failed (model may still be cold)");
    return NextResponse.json({ warmed: false, reason: "error" });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "warmup endpoint ready" });
}
