"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Edgeworth } from "./Edgeworth";
import { ChatBox } from "./ChatBox";
import {
  ObjectionOverlay,
  ObjectionType,
  getRandomObjectionType,
} from "./ObjectionOverlay";
import {
  PREDEFINED_ANSWERS,
  WELCOME_MESSAGES,
  PAUSED_RESPONSES,
} from "@/lib/my-lawyer/predefined";
import { findRoute, RouteAction } from "@/lib/my-lawyer/router";
import { useRouter } from "next/navigation";

/**
 * Mood states for Edgeworth sprite display
 */
export type Mood =
  | "IDLE"
  | "THINKING"
  | "PRESENTING"
  | "CONFIDENT"
  | "OBJECTING"
  | "POINTING"
  | "BOWING"
  | "SERIOUS"
  | "EXPLAINING"
  | "SMIRKING";

/**
 * Message structure for chat history
 */
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  chips?: string[];
}

/**
 * API response structure from /api/my-lawyer/chat
 */
interface ChatApiResponse {
  text: string;
  chunks?: string[];
  spriteState: "idle" | "thinking" | "presenting" | "pointing" | "confident";
  mood: string;
  isObjection: boolean;
  error?: string;
}

/**
 * Map API sprite state to Mood type
 */
function spriteStateToMood(
  spriteState: ChatApiResponse["spriteState"],
  isObjection: boolean,
  mood: string,
): Mood {
  // Priority: Objection > Explicit Mood > Sprite State
  if (isObjection) return "OBJECTING";

  const normalizedMood = mood.toUpperCase();
  if (
    [
      "SMIRKING",
      "SERIOUS",
      "EXPLAINING",
      "CONFIDENT",
      "THINKING",
      "PRESENTING",
      "IDLE",
    ].includes(normalizedMood)
  ) {
    return normalizedMood as Mood;
  }
  // Fallback map if mood tag wasn't specific
  switch (spriteState) {
    case "confident":
      return Math.random() > 0.2 ? "CONFIDENT" : "SMIRKING";
    case "presenting":
      const presentingMoods: Mood[] = ["PRESENTING", "EXPLAINING", "SERIOUS"];
      return presentingMoods[
        Math.floor(Math.random() * presentingMoods.length)
      ];
    case "pointing":
      return "OBJECTING";
    case "thinking":
      return "THINKING";
    default:
      return "IDLE";
  }
}

/**
 * Motion animation variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const spriteVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const chatVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, delay: 0.3 },
  },
};

/**
 * Courtroom - Main container component for the Miles Edgeworth portfolio chatbot
 *
 * Features:
 * - Modern editorial layout with light theme
 * - Staggered entrance animations
 * - Court-themed styling with brass/gold accents
 * - Manages chat messages, mood state, and overlays
 */

interface CourtroomProps {
  onClose?: () => void;
}

export function Courtroom({ onClose }: CourtroomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mood, setMood] = useState<Mood>("IDLE");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedResponse, setPausedResponse] = useState<Message | null>(null);
  const [showObjection, setShowObjection] = useState(false);
  const [objectionType, setObjectionType] =
    useState<ObjectionType>("objection");
  const abortControllerRef = useRef<AbortController | null>(null);
  const quickQuestions = [
    "My Work",
    "Experience",
    "Skills",
    "About Me",
    "Contact Me",
    "Resume",
  ];

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized) {
      const text =
        WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
      setMessages([
        {
          id: "welcome",
          text,
          isUser: false,
          chips: [
            "My Work",
            "Experience",
            "Skills",
            "About Me",
            "Contact Me",
            "Resume",
          ],
        },
      ]);
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const moodResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const objectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearMoodResetTimeout = useCallback(() => {
    if (moodResetTimeoutRef.current) {
      clearTimeout(moodResetTimeoutRef.current);
      moodResetTimeoutRef.current = null;
    }
  }, []);

  const clearObjectionTimeout = useCallback(() => {
    if (objectionTimeoutRef.current) {
      clearTimeout(objectionTimeoutRef.current);
      objectionTimeoutRef.current = null;
    }
  }, []);

  const handlePause = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsPaused(true);
    setMood("IDLE");

    const pausedText =
      PAUSED_RESPONSES[Math.floor(Math.random() * PAUSED_RESPONSES.length)];
    const pausedMessage: Message = {
      id: `paused-${Date.now()}`,
      text: pausedText,
      isUser: false,
      chips: [
        "My Work",
        "Experience",
        "Skills",
        "About Me",
        "Contact Me",
        "Resume",
      ],
    };
    setPausedResponse(pausedMessage);
  }, []);

  const handleSendMessage = useCallback(
    async (query: string, context?: string) => {
      clearMoodResetTimeout();
      clearObjectionTimeout();
      setIsPaused(false);
      setPausedResponse(null);

      const userMessage: Message = {
        id: Date.now().toString(),
        text: query,
        isUser: true,
      };
      setMessages((prev) => [...prev, userMessage]);
      setMood("THINKING");
      setIsLoading(true);

      // Skip predefined answers if there's attached context
      const predefined = context ? undefined : PREDEFINED_ANSWERS[query];

      if (predefined) {
        // Simulate a short delay for natural feel
        setTimeout(() => {
          setMood(predefined.mood);
          // Pick a random text variation
          const randomText =
            predefined.texts[
              Math.floor(Math.random() * predefined.texts.length)
            ];

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: randomText,
            isUser: false,
            chips: predefined.chips,
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);

          // Reset to idle after reading
          const wordCount = randomText.split(/\s+/).length;
          const readingTimeMs = Math.max(4000, wordCount * 150);
          moodResetTimeoutRef.current = setTimeout(
            () => setMood("IDLE"),
            readingTimeMs,
          );
        }, 600); // 600ms 'thinking' delay
        return;
      }

      try {
        // Build history from existing messages for context
        const history = messages.map((msg) => ({
          role: msg.isUser ? "user" : ("assistant" as const),
          content: msg.text,
        }));

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/my-lawyer/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, history, context }),
          signal: abortControllerRef.current.signal,
        });

        const data: ChatApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "API request failed");
        }

        // Calculate the target "talking" mood
        const talkingMood = spriteStateToMood(
          data.spriteState,
          false,
          data.mood,
        );

        if (data.isObjection) {
          // Sequence: Objection -> Talking
          // Randomize between Objection and Hold It (50/50)
          const randomType = getRandomObjectionType();
          setMood("OBJECTING");
          setObjectionType(randomType);
          setShowObjection(true);

          objectionTimeoutRef.current = setTimeout(() => {
            setShowObjection(false);
            setMood(talkingMood);
          }, 1500);
        } else {
          // Direct transition
          setMood(talkingMood);
        }

        // Helper to add chunks with delay
        if (data.chunks && data.chunks.length > 0) {
          let currentDelay = 0;

          data.chunks.forEach((chunk, index) => {
            const isLast = index === data.chunks!.length - 1;
            // Delay for each chunk (except the first one which is immediate to replace loading state)
            const delay = index === 0 ? 0 : 600;
            currentDelay += delay;

            setTimeout(() => {
              const aiMessage: Message = {
                id: (Date.now() + index).toString(),
                text: chunk,
                isUser: false,
                chips: isLast
                  ? [
                      "My Work",
                      "Experience",
                      "Skills",
                      "About Me",
                      "Contact Me",
                      "Resume",
                    ]
                  : undefined,
              };
              setMessages((prev) => [...prev, aiMessage]);

              // If this is the last chunk, set the reading timeout
              if (isLast) {
                const wordCount = data.text.split(/\s+/).length;
                const readingTimeMs = Math.max(4000, wordCount * 150);
                moodResetTimeoutRef.current = setTimeout(
                  () => setMood("IDLE"),
                  readingTimeMs,
                );
              }
            }, currentDelay);
          });
        } else {
          // Fallback for non-chunked response
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.text,
            isUser: false,
            chips: [
              "My Work",
              "Experience",
              "Skills",
              "About Me",
              "Contact Me",
              "Resume",
            ],
          };
          setMessages((prev) => [...prev, aiMessage]);

          const wordCount = data.text.split(/\s+/).length;
          const readingTimeMs = Math.max(4000, wordCount * 150);
          moodResetTimeoutRef.current = setTimeout(
            () => setMood("IDLE"),
            readingTimeMs,
          );
        }
      } catch (error) {
        // Skip error message if request was aborted (user paused)
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("API Error:", error);
        const errorText =
          error instanceof Error ? error.message : "Unknown error";

        setMood("THINKING");
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: `Objection! ${errorText}. Please try again.`,
            isUser: false,
          },
        ]);
      } finally {
        if (!predefined) {
          setIsLoading(false);
        }
      }
    },
    [clearMoodResetTimeout, clearObjectionTimeout, messages],
  );

  return (
    <motion.div
      className="bg-transparent lg:bg-background w-full h-full flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Mobile Header (Pill Shaped) */}
      <header className="lg:hidden flex items-center justify-center gap-2 pt-0 pb-4 shrink-0 z-10 relative">
        {/* Avatar - Outside Pill */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border bg-muted shrink-0 shadow-sm">
          <Image
            src="/my-lawyer/sprites/profile_images/Profile_Lawyer.png"
            alt="Miles Edgeworth"
            fill
            className="object-cover"
          />
        </div>

        {/* Info Pill - Separate, White Background */}
        <div className="flex flex-col justify-center px-4 py-1.5 border border-border rounded-full bg-[#FFF] shadow-sm">
          <h1 className="font-serif font-bold text-base text-foreground leading-none">
            Miles Edgeworth
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium leading-none mt-1">
            Attorney at Law
          </p>
        </div>

        {/* Close Button - Same Size as Avatar (w-10 h-10), Absolute Right */}
        <button
          onClick={onClose}
          className="absolute right-0 w-10 h-10 flex items-center justify-center rounded-full border border-border bg-[#FFF] shadow-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Hero Header Section (Desktop Only) */}
      <motion.header
        className="hidden lg:block pt-6 pb-4 px-6 shrink-0 z-10 bg-dot-line-b"
        variants={headerVariants}
        layout
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              className="font-serif text-ms text-foreground"
              variants={headerVariants}
            >
              The Prosecution of the Candidate
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-base -mt-0.5"
              variants={subtitleVariants}
            >
              Miles Edgeworth presents the case for qualification
            </motion.p>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Column: Edgeworth Sprite (Desktop Only) */}
        <motion.section
          className="hidden lg:flex w-full md:w-[380px] lg:w-[420px] shrink-0 bg-muted bg-dot-line-b md:bg-dot-line-r p-6 flex-col items-center justify-center relative"
          variants={spriteVariants}
        >
          <div className="relative z-10 scale-110 sm:scale-125 md:scale-110 lg:scale-125 transition-transform duration-500">
            <Edgeworth mood={mood} isLoading={isLoading} />
          </div>
        </motion.section>

        {/* Right Column: Chat Interface */}
        <motion.section
          className="flex-1 bg-transparent lg:bg-background flex flex-col h-full overflow-hidden p-0 lg:p-6"
          variants={chatVariants}
        >
          <ChatBox
            messages={messages}
            isLoading={isLoading}
            isPaused={isPaused}
            pausedResponse={pausedResponse}
            onSendMessage={handleSendMessage}
            onPause={handlePause}
            quickQuestions={quickQuestions}
          />
        </motion.section>
      </div>

      {/* Objection Overlay */}
      <AnimatePresence>
        {showObjection && <ObjectionOverlay type={objectionType} />}
      </AnimatePresence>
    </motion.div>
  );
}
