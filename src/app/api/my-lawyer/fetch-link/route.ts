/**
 * Fetch Link API Route
 *
 * POST /api/my-lawyer/fetch-link - Fetch URL content and metadata for preview
 */

import { NextRequest, NextResponse } from "next/server";

interface LinkMetadata {
  title: string;
  description: string;
  favicon?: string;
  content: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const metadata = await fetchUrlMetadata(url);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("[FetchLink] Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch URL";

    if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Could not connect to the website" },
        { status: 502 },
      );
    }

    if (message.includes("timeout")) {
      return NextResponse.json(
        { error: "Request timed out" },
        { status: 504 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchUrlMetadata(url: string): Promise<LinkMetadata> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HectorPortfolioBot/1.0; +https://hectorha.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      return {
        title: new URL(url).hostname,
        description: `Non-HTML content (${contentType})`,
        content: `[Link to ${url} - Content type: ${contentType}]`,
      };
    }

    const html = await response.text();
    const parsed = parseHtmlMetadata(html, url);

    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

function parseHtmlMetadata(html: string, url: string): LinkMetadata {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || new URL(url).hostname;

  const descriptionMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const description = descriptionMatch?.[1]?.trim() || "";

  const faviconMatch =
    html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i) ||
    html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["']/i);
  let favicon = faviconMatch?.[1] || "";

  if (favicon && !favicon.startsWith("http")) {
    const urlObj = new URL(url);
    favicon = favicon.startsWith("/")
      ? `${urlObj.origin}${favicon}`
      : `${urlObj.origin}/${favicon}`;
  }

  if (!favicon) {
    favicon = `${new URL(url).origin}/favicon.ico`;
  }

  const textContent = extractTextContent(html);
  const truncatedContent =
    textContent.length > 2000 ? textContent.substring(0, 2000) + "..." : textContent;

  return {
    title: decodeHtmlEntities(title),
    description: decodeHtmlEntities(description),
    favicon,
    content: `[Content from ${url}]:\nTitle: ${title}\n\n${truncatedContent}`,
  };
}

function extractTextContent(html: string): string {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return decodeHtmlEntities(text);
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
