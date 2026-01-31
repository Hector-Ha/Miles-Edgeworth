"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Courtroom } from "./Courtroom";
import { ErrorBoundary } from "./ErrorBoundary";

/**
 * MyLawyerModal - Modal wrapper for the MyLawyer chatbot
 *
 * Features:
 * - Dark overlay backdrop
 * - Centered modal container
 * - Close on X button, ESC key, or click outside
 * - Navigates back on close (or to homepage if no history)
 */
export function MyLawyerModal() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    // Try to go back, otherwise go to homepage
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Lock native scroll
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* White overlay backdrop - click to close */}
        <motion.div
          className="absolute inset-0 bg-white"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          aria-label="Close modal"
        />

        {/* Modal container */}
        <motion.div
          className="relative z-10 w-full max-w-6xl h-[95vh] sm:h-[90vh] bg-transparent lg:bg-background rounded-xl shadow-soft overflow-hidden flex flex-col lg:border lg:border-border"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent
        >
          {/* Close button */}
          {/* Close button - Desktop Only */}
          <button
            onClick={handleClose}
            className="hidden lg:flex absolute top-4 right-4 z-50 p-2 rounded-full bg-muted hover:bg-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Courtroom content */}
          <ErrorBoundary>
            <div className="flex-1 w-full h-full overflow-hidden">
              <Courtroom onClose={handleClose} />
            </div>
          </ErrorBoundary>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
