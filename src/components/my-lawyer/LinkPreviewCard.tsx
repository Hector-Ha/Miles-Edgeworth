"use client";

import { motion } from "framer-motion";
import { Link2, X, Loader2, AlertCircle } from "lucide-react";
import type { LinkPreview } from "@/lib/my-lawyer/file-processor";

interface LinkPreviewCardProps {
  preview: LinkPreview;
  onRemove: () => void;
}

export function LinkPreviewCard({ preview, onRemove }: LinkPreviewCardProps) {
  const hostname = (() => {
    try {
      return new URL(preview.url).hostname.replace("www.", "");
    } catch {
      return preview.url;
    }
  })();

  const statusClass =
    preview.status === "fetching"
      ? "fetching"
      : preview.status === "error"
        ? "error"
        : "";

  const statusText =
    preview.status === "fetching"
      ? "Loading..."
      : preview.status === "error"
        ? "Failed"
        : "Ready";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`link-preview-card ${statusClass}`}
    >
      {preview.status === "fetching" ? (
        <Loader2 className="link-preview-icon file-spinner" />
      ) : preview.status === "error" ? (
        <AlertCircle className="link-preview-icon" style={{ color: "rgb(239 68 68)" }} />
      ) : preview.favicon ? (
        <img
          src={preview.favicon}
          alt=""
          className="link-preview-favicon"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.nextElementSibling?.classList.remove("hidden");
          }}
        />
      ) : (
        <Link2 className="link-preview-icon" />
      )}

      <div className="link-preview-info">
        <span className="link-preview-title">
          {preview.title || hostname}
        </span>
        <div className="link-preview-meta">
          <span className="link-preview-domain">{hostname}</span>
          <span className="link-preview-status">• {statusText}</span>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="file-card-remove"
        aria-label="Remove link"
      >
        <X className="file-card-remove-icon" />
      </button>
    </motion.div>
  );
}
