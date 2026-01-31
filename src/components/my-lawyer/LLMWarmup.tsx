"use client";

import { useEffect } from "react";

const WARMUP_KEY = "llm-warmup-done";

/**
 * LLMWarmup - Silent component that warms up the LLM on first page load only
 *
 * This component sends a minimal request to the LLM API to trigger
 * cold start before the user navigates to the chatbot.
 * Only runs once per session (uses sessionStorage to track).
 * No UI is rendered - this is purely a background operation.
 */
export function LLMWarmup() {
  useEffect(() => {
    // Skip if already warmed up this session
    if (sessionStorage.getItem(WARMUP_KEY)) {
      return;
    }

    const warmupLLM = async () => {
      try {
        await fetch("/api/my-lawyer/warmup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        // Mark as done for this session
        sessionStorage.setItem(WARMUP_KEY, "true");
      } catch {
        // Silently ignore warmup failures
      }
    };

    // Delay warmup to prioritize main content rendering
    const timer = setTimeout(warmupLLM, 1000);
    return () => clearTimeout(timer);
  }, []);

  // This component renders nothing
  return null;
}
