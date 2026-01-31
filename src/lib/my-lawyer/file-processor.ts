/**
 * File Processor Module
 *
 * Client-side file processing for TXT, MD, CSV files.
 * Delegates PDF/DOCX to server API.
 * Uses Tesseract.js for OCR on images.
 */

export interface FileAttachment {
  id: string;
  name: string;
  type: "image" | "document";
  mimeType: string;
  size: number;
  content: string;
  status: "pending" | "processing" | "ready" | "error";
  error?: string;
  preview?: string;
}

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  favicon?: string;
  status: "pending" | "fetching" | "ready" | "error";
  content?: string;
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total
const MAX_FILES = 5;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
];

const SUPPORTED_EXTENSIONS: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".csv": "text/csv",
};

export function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getFileType(file: File): "image" | "document" | null {
  const mimeType = file.type || getMimeTypeFromExtension(file.name);

  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
    return "image";
  }
  if (SUPPORTED_DOCUMENT_TYPES.includes(mimeType)) {
    return "document";
  }
  return null;
}

function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
  return SUPPORTED_EXTENSIONS[ext] || "";
}

export function validateFiles(
  files: File[],
  existingFiles: FileAttachment[],
): { valid: File[]; errors: string[] } {
  const errors: string[] = [];
  const valid: File[] = [];

  const totalExistingSize = existingFiles.reduce((sum, f) => sum + f.size, 0);
  let newTotalSize = totalExistingSize;

  if (existingFiles.length + files.length > MAX_FILES) {
    errors.push(`Maximum ${MAX_FILES} files allowed`);
    return { valid: [], errors };
  }

  for (const file of files) {
    const fileType = getFileType(file);

    if (!fileType) {
      errors.push(`${file.name}: Unsupported file type`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: Exceeds 10MB limit`);
      continue;
    }

    if (newTotalSize + file.size > MAX_TOTAL_SIZE) {
      errors.push(`${file.name}: Would exceed 20MB total limit`);
      continue;
    }

    newTotalSize += file.size;
    valid.push(file);
  }

  return { valid, errors };
}

export async function processFile(file: File): Promise<FileAttachment> {
  const fileType = getFileType(file);
  const mimeType = file.type || getMimeTypeFromExtension(file.name);

  const attachment: FileAttachment = {
    id: generateFileId(),
    name: file.name,
    type: fileType!,
    mimeType,
    size: file.size,
    content: "",
    status: "processing",
  };

  try {
    if (fileType === "image") {
      attachment.preview = await createImagePreview(file);
      attachment.content = await extractTextFromImage(file);
    } else {
      attachment.content = await extractTextFromDocument(file, mimeType);
    }
    attachment.status = "ready";
  } catch (error) {
    attachment.status = "error";
    attachment.error =
      error instanceof Error ? error.message : "Processing failed";
  }

  return attachment;
}

async function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

async function extractTextFromImage(file: File): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");

  try {
    const imageUrl = URL.createObjectURL(file);
    const {
      data: { text },
    } = await worker.recognize(imageUrl);
    URL.revokeObjectURL(imageUrl);

    if (!text.trim()) {
      return `[Image: ${file.name} - No text detected]`;
    }
    return `[Image OCR from ${file.name}]:\n${text.trim()}`;
  } finally {
    await worker.terminate();
  }
}

async function extractTextFromDocument(
  file: File,
  mimeType: string,
): Promise<string> {
  if (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    mimeType === "text/csv"
  ) {
    return await readTextFile(file);
  }

  if (
    mimeType === "application/pdf" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await parseDocumentOnServer(file);
  }

  throw new Error(`Unsupported document type: ${mimeType}`);
}

async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      resolve(`[${file.name}]:\n${text}`);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

async function parseDocumentOnServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/my-lawyer/parse-file", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to parse document");
  }

  const result = await response.json();
  return `[${file.name}]:\n${result.content}`;
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const preview: LinkPreview = {
    url,
    title: "",
    description: "",
    status: "fetching",
  };

  try {
    const response = await fetch("/api/my-lawyer/fetch-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch link");
    }

    const result = await response.json();
    return {
      ...preview,
      title: result.title,
      description: result.description,
      favicon: result.favicon,
      content: result.content,
      status: "ready",
    };
  } catch (error) {
    return {
      ...preview,
      status: "error",
      error: error instanceof Error ? error.message : "Failed to fetch link",
    };
  }
}

export function detectUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  return text.match(urlRegex) || [];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}