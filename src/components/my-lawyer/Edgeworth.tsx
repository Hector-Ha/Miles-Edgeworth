"use client";

import Image from "next/image";
import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Mood } from "./Courtroom";
import {
  useSpriteAnimation,
  createSpriteConfig,
  isAnimatedSprite,
} from "@/hooks/my-lawyer/useSpriteAnimation";

interface EdgeworthProps {
  mood: Mood;
  isLoading: boolean;
}

/**
 * Sprite paths mapped to mood states
 * Supports both static images (.png) and animated images (.gif)
 */
const SPRITES: Record<Mood, string | string[]> = {
  IDLE: "/my-lawyer/sprites/characters/Edgeworth/gifs/thinking.gif",
  THINKING: "/my-lawyer/sprites/characters/Edgeworth/gifs/thinking.gif",
  PRESENTING:
    "/my-lawyer/sprites/characters/Edgeworth/gifs/presenting_normally.gif",
  CONFIDENT: [
    "/my-lawyer/sprites/characters/Edgeworth/gifs/presenting_confident.gif",
    "/my-lawyer/sprites/characters/Edgeworth/gifs/presenting_normally.gif",
    "/my-lawyer/sprites/characters/Edgeworth/gifs/presenting_normally_2.gif",
  ],
  OBJECTING: "/my-lawyer/sprites/characters/Edgeworth/gifs/objection.gif",
  POINTING:
    "/my-lawyer/sprites/characters/Edgeworth/gifs/presenting_confident.gif",
  BOWING:
    "/my-lawyer/sprites/characters/Edgeworth/gifs/presenting_normally.gif",
  SERIOUS:
    "/my-lawyer/sprites/characters/Edgeworth/gifs/presenting_serious.gif",
  EXPLAINING:
    "/my-lawyer/sprites/characters/Edgeworth/gifs/presenting_normally.gif",
  SMIRKING: "/my-lawyer/sprites/characters/Edgeworth/gifs/smirking.gif",
};

/**
 * Get sprite path, randomly selecting if multiple options exist
 */
function getSpriteForMood(mood: Mood): string {
  const sprite = SPRITES[mood];
  if (Array.isArray(sprite)) {
    return sprite[Math.floor(Math.random() * sprite.length)];
  }
  return sprite;
}

/**
 * Transition duration for sprite crossfade (ms)
 */
const SPRITE_TRANSITION_MS = 150;

/**
 * Motion animation variants for the component
 */
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.1,
    },
  },
};

const polaroidVariants = {
  hidden: { opacity: 0, scale: 0.9, rotate: -2 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -1.5,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/**
 * Edgeworth - Sprite display component for Miles Edgeworth
 *
 * Displays the appropriate sprite based on the current mood state
 * with smooth crossfade transitions between states.
 * Features modern polaroid-style framing with subtle brass accents.
 */
export function Edgeworth({ mood, isLoading }: EdgeworthProps) {
  const spritePath = useMemo(() => getSpriteForMood(mood), [mood]);
  const spriteConfig = createSpriteConfig(spritePath);
  const { currentSprite, isTransitioning, opacity } = useSpriteAnimation(
    spriteConfig,
    SPRITE_TRANSITION_MS,
  );

  const isAnimated = isAnimatedSprite(currentSprite);

  return (
    <motion.aside
      className="text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Polaroid-style Frame */}
      <motion.div
        className="relative inline-block"
        variants={polaroidVariants}
        whileHover={{
          scale: 1.02,
          rotate: 0,
          transition: { duration: 0.2 },
        }}
      >
        {/* Outer polaroid frame */}
        <div className="bg-white rounded-xl p-3 pb-14 sm:p-4 sm:pb-16 shadow-md border border-amber-700/10 hover:shadow-lg transition-shadow duration-300">
          {/* Inner cream background for sprite */}
          <div className="bg-stone-50/50 rounded-lg overflow-hidden">
            {/* Main Sprite with transition */}
            <motion.div
              className="relative mx-auto w-[180px] h-[180px] sm:w-[250px] sm:h-[250px]"
              animate={{
                opacity: isTransitioning ? opacity : 1,
              }}
              transition={{ duration: SPRITE_TRANSITION_MS / 1000 }}
            >
              <Image
                src={currentSprite}
                alt={`Miles Edgeworth - ${mood}`}
                fill
                sizes="(max-width: 640px) 180px, 250px"
                className={`
                  drop-shadow-lg object-contain
                  ${isLoading && !isAnimated ? "animate-pulse" : ""}
                `}
                style={{ imageRendering: "pixelated" }}
                priority
                unoptimized={isAnimated}
              />
            </motion.div>
          </div>

          {/* Name text positioned at bottom of polaroid */}
          <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 text-center">
            <h3 className="font-serif text-sm sm:text-base text-stone-900 tracking-wide">
              Miles Edgeworth
            </h3>
            <p className="text-[10px] text-stone-500 font-light tracking-widest uppercase mt-0.5">
              Attorney
            </p>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}
