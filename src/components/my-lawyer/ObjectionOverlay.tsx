"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export type ObjectionType = "objection" | "holdit";

const TEXT_SPRITES: Record<ObjectionType, { src: string; alt: string }> = {
  objection: { src: "/my-lawyer/sprites/text/Objection.png", alt: "OBJECTION!" },
  holdit: { src: "/my-lawyer/sprites/text/Hold It.png", alt: "HOLD IT!" },
};

interface ObjectionOverlayProps {
  type: ObjectionType;
}

export function ObjectionOverlay({ type }: ObjectionOverlayProps) {
  const sprite = TEXT_SPRITES[type];

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm z-[200]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        initial={{ scaleX: 0, scaleY: 0.1, opacity: 0 }}
        animate={{
          scaleX: [0, 1.05, 1],
          scaleY: [0.1, 1.05, 1],
          opacity: 1,
        }}
        exit={{ scaleX: 0, scaleY: 0.1, opacity: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.7, 1],
        }}
        style={{ transformOrigin: "center center" }}
      >
        <Image
          src={sprite.src}
          alt={sprite.alt}
          width={600}
          height={300}
          className="max-w-[90vw] sm:max-w-[600px] h-auto drop-shadow-[0_0_40px_rgba(184,135,61,0.6)]"
          style={{
            filter:
              "drop-shadow(0 0 40px rgba(184, 135, 61, 0.6)) drop-shadow(0 0 80px rgba(184, 135, 61, 0.3))",
          }}
          priority
        />
      </motion.div>
    </motion.div>
  );
}

export function getRandomObjectionType(): ObjectionType {
  return Math.random() < 0.5 ? "objection" : "holdit";
}
