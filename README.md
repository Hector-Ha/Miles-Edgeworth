# Miles Edgeworth - The Personal Lawyer

> **An Ace Attorney–inspired interactive portfolio chatbot where Miles Edgeworth presents evidence of a candidate’s professional qualifications.**

## TL;DR

Miles Edgeworth is a courtroom‑themed portfolio experience built with **Next.js (App Router)**, **React 19**, and **TypeScript**, featuring a persona‑driven chatbot powered by the **NVIDIA Inference API**. It uses RAG‑style “evidence” from local JSON files and supports file uploads (OCR + PDF/DOCX parsing) and URL content ingestion to enrich answers.

### Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Setup Environment
# Create a .env file in the project root with:
# NVIDIA_API_KEY=your_key_here

# 3. Run Development Server
bun run dev
```

Open `http://localhost:3000`.

## Feature Overview

| Category               | Status        | Capabilities                                                                  |
| ---------------------- | ------------- | ----------------------------------------------------------------------------- |
| **Courtroom UI**       | ✅ Integrated | Edgeworth sprite states, objection overlay, animated courtroom layout         |
| **Chat Experience**    | ✅ Integrated | Quick questions, pause/thinking state, message chips, animated responses      |
| **Persona + RAG**      | ✅ Integrated | Evidence‑driven answers from local JSON data (bio/skills/experience/projects) |
| **LLM Integration**    | ✅ Integrated | NVIDIA Inference API with sentiment‑aware prompt strategies                   |
| **File & Link Intake** | ✅ Integrated | OCR on images, PDF/DOCX parsing, URL preview + content ingestion              |
| **Infrastructure**     | ✅ Integrated | Next.js API routes, client‑side validation, warmup endpoint                   |

## Features & Roadmap

### Core Features (Implemented)

- [x] **Courtroom‑themed UI** with animated Edgeworth sprite and objection overlays
- [x] **Persona‑driven chatbot** that speaks in-character and adapts tone via sentiment
- [x] **RAG evidence retrieval** from local JSON data (bio, skills, experience, education, projects)
- [x] **File uploads** with OCR for images and parsing for PDF/DOCX/TXT/MD/CSV
- [x] **Link preview + content ingestion** for external URLs
- [x] **LLM warmup endpoint** to reduce cold‑start latency

### Future Enhancements

- [ ] True streaming token‑by‑token responses
- [ ] Expanded file type support (PPTX/XLSX) and larger attachments
- [ ] Richer link extraction (readability mode, structured metadata)

## Known Issues

1. **LLM latency** depends on NVIDIA API availability and cold starts.
2. **OCR performance** can be slow on large images; accuracy varies by image quality.
3. **Attachment limits**: max 5 files, 10MB each, 20MB total.
4. **Link previews** are best‑effort; non‑HTML content returns limited metadata.
5. **Session persistence** is not implemented; chat history resets on reload.

## Architecture

- **Frontend**: Next.js App Router, React 19, TypeScript, Tailwind CSS, Framer Motion
- **API Routes**: `/api/my-lawyer` for chat, file parsing, link fetch, and warmup
- **LLM Layer**: NVIDIA Inference API (`minimaxai/minimax-m2`) with prompt strategies
- **Data Layer**: Local JSON evidence in `src/data/my-lawyer`
- **File Processing**: Client‑side validation + OCR (Tesseract.js) and server parsing (unpdf, mammoth)

## Getting Started

### Prerequisites

- **Node.js** 18+ (or 20+ recommended)
- **Bun**
- **NVIDIA_API_KEY** for the NVIDIA Inference API

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd miles-edgeworth
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the project root:

   ```env
   NVIDIA_API_KEY=your_key_here
   ```

4. **Start Development**

   ```bash
   bun run dev
   ```

   - App: `http://localhost:3000`

## Security Features

- **Server‑side API key storage** (NVIDIA key is never exposed to the client)
- **URL validation + timeouts** in link‑fetching API
- **File type/size limits** enforced before processing
- **Server‑side parsing** for PDFs and DOCX files

## Contributing

For questions or collaboration inquiries, please contact the maintainer.

## Acknowledgments

- **Ace Attorney / Capcom** for inspiration and thematic direction.
- Built with:
  - [Next.js](https://nextjs.org)
  - [React](https://react.dev)
  - [Tailwind CSS](https://tailwindcss.com)
  - [Framer Motion](https://www.framer.com/motion)
  - [Radix UI](https://www.radix-ui.com)
  - [NVIDIA Inference API](https://developer.nvidia.com)
  - [Tesseract.js](https://tesseract.projectnaptha.com)
  - [unpdf](https://github.com/3rd-Eden/unpdf)
  - [mammoth](https://github.com/mwilliamson/mammoth.js)
  - [Lucide](https://lucide.dev)
