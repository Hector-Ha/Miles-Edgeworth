"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "./Courtroom";
import { ArrowUp } from "lucide-react";
import { FileUploadZone, UploadButton } from "./FileUploadZone";
import { LinkPreviewCard } from "./LinkPreviewCard";
import { X, Loader2, Pause } from "lucide-react";
import {
  type FileAttachment,
  type LinkPreview,
  validateFiles,
  processFile,
  fetchLinkPreview,
  detectUrls,
  formatFileSize,
} from "@/lib/my-lawyer/file-processor";
import "./chatbox.css";

interface ChatBoxProps {
  messages: Message[];
  isLoading: boolean;
  isPaused?: boolean;
  pausedResponse?: Message | null;
  onSendMessage: (query: string, context?: string) => void;
  onPause?: () => void;
  quickQuestions?: string[];
}

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export function ChatBox({
  messages,
  isLoading,
  isPaused = false,
  pausedResponse = null,
  onSendMessage,
  onPause,
  quickQuestions = [],
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const linkFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInput(value);

      if (linkFetchTimeoutRef.current) {
        clearTimeout(linkFetchTimeoutRef.current);
      }

      const urls = detectUrls(value);
      const newUrl = urls[0] || null;

      if (newUrl && newUrl !== detectedUrl) {
        setDetectedUrl(newUrl);
        setLinkPreview({
          url: newUrl,
          title: "",
          description: "",
          status: "pending",
        });

        linkFetchTimeoutRef.current = setTimeout(async () => {
          setLinkPreview((prev) =>
            prev ? { ...prev, status: "fetching" } : null,
          );
          const preview = await fetchLinkPreview(newUrl);
          setLinkPreview(preview);
        }, 500);
      } else if (!newUrl && detectedUrl) {
        setDetectedUrl(null);
        setLinkPreview(null);
      }
    },
    [detectedUrl],
  );

  const handleFilesSelected = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);
      const { valid } = validateFiles(fileArray, attachments);

      if (valid.length === 0) return;

      const pendingAttachments: FileAttachment[] = valid.map((file) => ({
        id: `pending-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "document",
        mimeType: file.type,
        size: file.size,
        content: "",
        status: "processing" as const,
      }));

      setAttachments((prev) => [...prev, ...pendingAttachments]);

      const processed = await Promise.all(valid.map(processFile));
      setAttachments((prev) => {
        const existing = prev.filter(
          (a) =>
            !a.id.startsWith("pending-") ||
            !pendingAttachments.some((p) => p.id === a.id),
        );
        return [
          ...existing.filter((a) => !a.id.startsWith("pending-")),
          ...processed,
        ];
      });
    },
    [attachments],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (
        (!input.trim() && attachments.length === 0 && !linkPreview) ||
        isLoading
      )
        return;

      const processingFiles = attachments.filter(
        (a) => a.status === "processing",
      );
      if (processingFiles.length > 0) return;

      let contextParts: string[] = [];

      const readyAttachments = attachments.filter((a) => a.status === "ready");
      if (readyAttachments.length > 0) {
        contextParts.push(
          readyAttachments.map((a) => a.content).join("\n\n---\n\n"),
        );
      }

      if (linkPreview?.status === "ready" && linkPreview.content) {
        contextParts.push(linkPreview.content);
      }

      const context =
        contextParts.length > 0 ? contextParts.join("\n\n---\n\n") : undefined;
      const messageText =
        input.trim() || "Please analyze the attached content.";

      onSendMessage(messageText, context);

      setInput("");
      setAttachments([]);
      setLinkPreview(null);
      setDetectedUrl(null);
    },
    [input, attachments, linkPreview, isLoading, onSendMessage],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const removeLinkPreview = useCallback(() => {
    setLinkPreview(null);
    setDetectedUrl(null);
  }, []);

  const hasContent =
    input.trim() ||
    attachments.some((a) => a.status === "ready") ||
    linkPreview?.status === "ready";

  const isProcessing = attachments.some((a) => a.status === "processing");

  return (
    <FileUploadZone
      attachments={attachments}
      onAttachmentsChange={setAttachments}
      disabled={isLoading}
    >
      <div className="chatbox chatbox-container">
        {/* Messages Area */}
        <div
          ref={scrollContainerRef}
          className="chatbox-messages"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => {
              // A message is last if: it's the last in array AND not loading AND (not paused OR no pausedResponse)
              const isLastMessage =
                index === messages.length - 1 &&
                !isLoading &&
                (!isPaused || !pausedResponse);
              return (
                <motion.div
                  key={msg.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`message-row ${msg.isUser ? "user" : "assistant"}`}
                >
                  {/* Message Content */}
                  <div className="message-content">
                    <div className="message-bubble-wrapper">
                      {/* Avatar - aligned at bottom of bubble */}
                      <div className="message-avatar hidden md:block">
                        <Image
                          src={
                            msg.isUser
                              ? "/my-lawyer/sprites/profile_images/Profile_User.png"
                              : "/my-lawyer/sprites/profile_images/Profile_Lawyer.png"
                          }
                          alt={msg.isUser ? "You" : "Edgeworth"}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div
                        className={`message-bubble ${msg.isUser ? "user" : "assistant"}${isLastMessage ? " last-message" : ""}`}
                      >
                        {msg.isUser ? (
                          <p>{msg.text}</p>
                        ) : (
                          msg.text
                            .split("\n")
                            .filter((line) => line.trim() !== "")
                            .map((line, i) => (
                              <motion.p
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.08, duration: 0.3 }}
                              >
                                {line}
                              </motion.p>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Chips below assistant message with divider */}
                    {!msg.isUser && msg.chips && msg.chips.length > 0 && (
                      <>
                        <div className="message-chips-divider" />
                        <motion.div
                          className="message-chips"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                        >
                          {msg.chips.map((chip) => (
                            <button
                              key={chip}
                              onClick={() => onSendMessage(chip)}
                              disabled={isLoading}
                              className="chip-button"
                            >
                              {chip}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading Indicator */}
          <AnimatePresence>
            {(isLoading || isPaused) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="message-row assistant"
              >
                <div className="message-content">
                  <div className="message-bubble-wrapper">
                    <div className="message-avatar hidden md:block">
                      <Image
                        src="/my-lawyer/sprites/profile_images/Profile_Lawyer.png"
                        alt="Edgeworth"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="loading-indicator">
                      {!isPaused && (
                        <div className="loading-dots">
                          <span className="loading-dot" />
                          <span className="loading-dot" />
                          <span className="loading-dot" />
                        </div>
                      )}
                      <span className="loading-text">
                        Edgeworth is reviewing the evidence...
                      </span>
                      {isPaused ? (
                        <span className="paused-text">Paused</span>
                      ) : (
                        onPause && (
                          <button
                            onClick={onPause}
                            className="pause-button"
                            title="Pause thinking"
                            aria-label="Pause thinking"
                          >
                            <Pause className="pause-button-icon" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Paused Response - appears below the paused indicator */}
          <AnimatePresence>
            {isPaused && pausedResponse && (
              <motion.div
                key={pausedResponse.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="message-row assistant"
              >
                <div className="message-content">
                  <div className="message-bubble-wrapper">
                    <div className="message-avatar hidden md:block">
                      <Image
                        src="/my-lawyer/sprites/profile_images/Profile_Lawyer.png"
                        alt="Edgeworth"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="message-bubble assistant last-message">
                      <p>{pausedResponse.text}</p>
                    </div>
                  </div>
                  {pausedResponse.chips && pausedResponse.chips.length > 0 && (
                    <>
                      <div className="message-chips-divider" />
                      <motion.div
                        className="message-chips"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        {pausedResponse.chips.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => onSendMessage(chip)}
                            disabled={isLoading}
                            className="chip-button"
                          >
                            {chip}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="chatbox-input-area">
          {/* File Previews - Above Input */}
          {attachments.length > 0 && (
            <AttachmentPreview
              attachments={attachments}
              onRemove={(id) =>
                setAttachments((prev) => prev.filter((a) => a.id !== id))
              }
            />
          )}

          {/* Link Preview - Above Input */}
          <AnimatePresence>
            {linkPreview && linkPreview.status !== "pending" && (
              <LinkPreviewCard
                preview={linkPreview}
                onRemove={removeLinkPreview}
              />
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="chatbox-form">
            <UploadButton
              onFilesSelected={handleFilesSelected}
              disabled={isLoading}
            />
            <div className="chatbox-input-wrapper">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Hector's qualifications..."
                disabled={isLoading}
                className="chatbox-input"
              />
              <button
                type="submit"
                disabled={isLoading || !hasContent || isProcessing}
                className="chatbox-submit"
                title={
                  isProcessing
                    ? "Processing files..."
                    : "Send message (Ctrl+Enter)"
                }
              >
                <ArrowUp className="chatbox-submit-send-icon" />
              </button>
            </div>
          </form>

          {/* Quick Questions */}
          {quickQuestions.length > 0 && (
            <div className="quick-questions !hidden md:!flex">
              <span className="quick-questions-label">Quick Questions</span>
              <div className="quick-questions-list">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => onSendMessage(question)}
                    disabled={isLoading}
                    className="quick-question-btn"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </FileUploadZone>
  );
}

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return ext ? `.${ext}` : "";
}

interface AttachmentPreviewProps {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
}

function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  // On mobile/tablet, show all attachments (scrollable). On desktop, limit to 5.
  const maxVisible =
    typeof window !== "undefined" && window.innerWidth < 1024
      ? attachments.length
      : 5;
  const visibleAttachments = attachments.slice(0, maxVisible);
  const overflowCount = attachments.length - maxVisible;

  return (
    <div className="attachment-preview-bar">
      <div className="attachment-preview-list">
        <AnimatePresence mode="popLayout">
          {visibleAttachments.map((attachment) => (
            <FileCard
              key={attachment.id}
              attachment={attachment}
              onRemove={() => onRemove(attachment.id)}
            />
          ))}
        </AnimatePresence>

        {overflowCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="file-overflow-badge"
          >
            +{overflowCount}
          </motion.div>
        )}
      </div>
      <div className="upload-divider" />
    </div>
  );
}

interface FileCardProps {
  attachment: FileAttachment;
  onRemove: () => void;
}

function FileCard({ attachment, onRemove }: FileCardProps) {
  const extension = getFileExtension(attachment.name);
  const statusClass =
    attachment.status === "processing"
      ? "processing"
      : attachment.status === "error"
        ? "error"
        : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      layout
      className={`file-card ${statusClass}`}
    >
      <div className="file-card-info">
        <span className="file-card-name">{attachment.name}</span>
        <div className="file-card-meta">
          <span className="file-card-type">{extension || "FILE"}</span>
          <span className="file-card-size">
            {formatFileSize(attachment.size)}
          </span>
        </div>
      </div>

      {attachment.status === "processing" ? (
        <Loader2 className="file-spinner" />
      ) : (
        <button
          onClick={onRemove}
          className="file-card-remove"
          aria-label={`Remove ${attachment.name}`}
        >
          <X className="file-card-remove-icon" />
        </button>
      )}
    </motion.div>
  );
}
