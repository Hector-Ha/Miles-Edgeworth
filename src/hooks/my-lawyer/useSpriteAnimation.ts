"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Sprite configuration for a mood state
 */
export interface SpriteConfig {
  src: string;
  isAnimated: boolean;
  frameDuration?: number;
}

interface UseSpriteAnimationReturn {
  currentSprite: string;
  isTransitioning: boolean;
  opacity: number;
}

/**
 * useSpriteAnimation - Hook for smooth sprite transitions
 *
 * Handles crossfade transitions between sprite states to prevent jarring
 * visual changes when mood changes mid-animation or rapidly.
 *
 * @param sprite - Current sprite configuration
 * @param transitionDuration - Fade transition duration in ms (default: 150ms)
 * @returns Object with currentSprite path, transition state, and opacity
 */
export function useSpriteAnimation(
  sprite: SpriteConfig,
  transitionDuration: number = 150
): UseSpriteAnimationReturn {
  const [currentSprite, setCurrentSprite] = useState(sprite.src);
  const [nextSprite, setNextSprite] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousSpriteRef = useRef(sprite.src);

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (sprite.src === previousSpriteRef.current) {
      return;
    }

    clearTransitionTimeout();
    setIsTransitioning(true);
    setNextSprite(sprite.src);

    setOpacity(0);

    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentSprite(sprite.src);
      setNextSprite(null);
      setOpacity(1);
      setIsTransitioning(false);
      previousSpriteRef.current = sprite.src;
    }, transitionDuration);

    return clearTransitionTimeout;
  }, [sprite.src, transitionDuration, clearTransitionTimeout]);

  return {
    currentSprite: nextSprite ?? currentSprite,
    isTransitioning,
    opacity,
  };
}

/**
 * Determine if a sprite path is an animated format
 */
export function isAnimatedSprite(src: string): boolean {
  const animatedExtensions = [".gif", ".webp", ".apng"];
  const lowerSrc = src.toLowerCase();
  return animatedExtensions.some((ext) => lowerSrc.endsWith(ext));
}

/**
 * Create sprite config from path, auto-detecting animation
 */
export function createSpriteConfig(src: string): SpriteConfig {
  return {
    src,
    isAnimated: isAnimatedSprite(src),
  };
}