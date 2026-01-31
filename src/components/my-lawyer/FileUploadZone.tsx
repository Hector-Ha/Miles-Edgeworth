"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Upload } from "lucide-react";
import {
  type FileAttachment,
  validateFiles,
  processFile,
} from "@/lib/my-lawyer/file-processor";

interface FileUploadZoneProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function FileUploadZone({
  attachments,
  onAttachmentsChange,
  disabled,
  children,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const dragCounter = useRef(0);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const { valid, errors: validationErrors } = validateFiles(
        fileArray,
        attachments,
      );

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setTimeout(() => setErrors([]), 5000);
      }

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

      onAttachmentsChange([...attachments, ...pendingAttachments]);

      const processed = await Promise.all(valid.map(processFile));

      onAttachmentsChange([...attachments, ...processed]);
    },
    [attachments, onAttachmentsChange],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files?.length) {
        handleFiles(files);
      }
    },
    [disabled, handleFiles],
  );

  return (
    <div
      className="file-upload-zone"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      <AnimatePresence>
        {isDragging && !disabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="file-drag-overlay"
          >
            <div className="file-drag-overlay-content">
              <Upload className="file-drag-overlay-icon animate-bounce" />
              <p className="file-drag-overlay-title">Drop files here</p>
              <p className="file-drag-overlay-subtitle">
                Images, PDFs, DOCX, TXT, MD, CSV
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="file-error-toast"
          >
            {errors.map((error, i) => (
              <div key={i} className="file-error-item">
                {error}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface UploadButtonProps {
  onFilesSelected: (files: FileList) => void;
  disabled?: boolean;
}

export function UploadButton({ onFilesSelected, disabled }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFilesSelected(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="upload-button"
        aria-label="Upload files"
        title="Upload files (Images, PDF, DOCX, TXT, MD, CSV)"
      >
        <Paperclip className="upload-button-icon" />
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.docx,.txt,.md,.csv"
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </>
  );
}
