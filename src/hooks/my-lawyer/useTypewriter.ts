"use client";

import { useState, useEffect } from "react";

interface UseTypewriterReturn {
  displayText: string;
  isComplete: boolean;
}

/**
 * useTypewriter - Custom hook for typewriter text effect
 *
 * Reveals text character by character for Ace Attorney-style text presentation.
 *
 * @param text - The full text to display
 * @param speed - Milliseconds per character (default: 30ms)
 * @returns Object containing displayText and isComplete status
 */
export function useTypewriter(
  text: string,
  speed: number = 30
): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset on text change
    setDisplayText("");
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      return;
    }

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}