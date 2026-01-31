/**
 * Parse File API Route
 *
 * POST /api/my-lawyer/parse-file - Parse PDF/DOCX files server-side
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    let content = "";

    if (mimeType === "application/pdf") {
      content = await parsePdf(buffer);
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      content = await parseDocx(buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    return NextResponse.json({ content, filename: file.name });
  } catch (error) {
    console.error("[ParseFile] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse document",
      },
      { status: 500 },
    );
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const { extractText } = await import("unpdf");
  
  const uint8Array = new Uint8Array(buffer);
  const { text } = await extractText(uint8Array);
  
  const fullText = Array.isArray(text) ? text.join("\n") : text;
  return fullText.trim() || "[No text content found in PDF]";
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim() || "[No text content found in DOCX]";
}
