/**
 * Router Module for "My Lawyer"
 * Handles deep linking and smart routing based on user intent.
 */

export type Category =
  | "All Projects"
  | "Full-Stack App"
  | "Front-End Focus"
  | "Animation Lab";

export interface Project {
  slug: string;
  title: string;
  category: "Full-Stack App" | "Front-End Focus" | "Animation Lab";
  description: string;
  image: string;
  repoUrl: string;
  liveUrl?: string;
  tags: string[];
  comingSoon?: boolean;
  scope?: string;
  techStack?: string[];
  challenge?: string;
  objective?: string;
  results?: string;
  midImages?: string[];
  bottomImages?: string[];
}

const projects: Project[] = [
  {
    slug: "interlock",
    title: "Interlock",
    category: "Full-Stack App",
    description:
      "A secure, full-stack fintech application that bridges the gap between banking data and payment processing using Plaid and Dwolla.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/Hector-Ha/Interlock",
    tags: ["Next.js", "Bun", "TypeScript", "Plaid", "Dwolla"],
    scope: "Full Stack Architecture, API Integration, Security Implementation",
    techStack: [
      "Languages: TypeScript, HTML/CSS, SQL",
      "Frontend: React, Next.js, Tailwind CSS, Shadcn UI, Zustand, React Hook Form, Chart.js",
      "Backend: Bun, Express, Prisma, Plaid API, Dwolla API",
      "Databases: PostgreSQL",
      "Developer Tools: Git/GitHub, Docker, Sentry, ESLint, Concurrently",
    ],

    challenge:
      "The primary challenge was orchestrating a secure, atomic handshake between two complex financial APIs. Plaid for reading data and Dwolla for moving money, while strictly adhering to compliance and security standards. This required synchronizing local transaction records with remote banking state to ensure accuracy, implementing AES-256 encryption for PII at rest, and managing distinct sandbox configurations for multiple third-party services without leaking credentials.",
    objective:
      "The objective was to architect and build a robust Fintech MVP that safeguards sensitive user data while providing a frictionless modern banking experience. The goal was to go beyond simple API connections to create a scalable architecture capable of handling real-world financial workflows, including real-time account verification, balance checks, and legally compliant money transfers.",
    results:
      "Interlock delivered a polished, production-ready MVP that allows users to securely onboard, instantly link real-world bank accounts, and execute ACH transfers with immediate feedback. The final product features a 100% TypeScript codebase for maintainability and utilizes a high-performance Bun/Express backend to handle webhooks and concurrent API requests with minimal latency.",
    midImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
    bottomImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
  },
  {
    slug: "altshift",
    title: "AltShift",
    category: "Full-Stack App",
    description:
      "A real-time collaborative document editor bridging the gap between traditional word processing and AI-assisted creation.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/Hector-Ha/AltShift.git",
    liveUrl: "https://altshift.vercel.app",
    tags: ["React 19", "Bun", "Socket.IO", "AI", "TypeScript"],
    scope: "Full Stack Architecture, Real-time Systems Engineering",
    techStack: [
      "Languages: JavaScript/TypeScript, HTML/CSS",
      "Frontend: React 19, Vite, Slate.js (Rich Text), Socket.IO Client, Apollo Client, Lucide React",
      "Backend: Bun (Runtime), Express 5, Apollo Server (GraphQL), Socket.IO, Mongoose",
      "Databases: MongoDB",
      "Services: Groq AI, SendGrid",
      "Developer Tools: Docker, GraphQL Codegen, ESLint, Concurrently",
    ],
    challenge:
      "The core engineering challenge was synchronizing complex rich-text state across multiple clients in real-time. Integrating Slate.js with Socket.IO required developing custom state management logic to prevent write conflicts and ensure consistency. Additionally, orchestrating low-latency AI streaming responses without blocking the main collaboration thread required careful optimization of the backend event loop and frontend state updates.",
    objective:
      "The primary objective was to engineer a production-grade full-stack application that rivals commercial real-time editors like Google Docs. Key goals included mastering the Bun runtime, implementing a robust real-time collaboration protocol, and creating a modern, distraction-free UI that effectively integrates AI tools without disrupting the user's creative flow.",
    results:
      "The final result is a robust, performant application where multiple users can edit documents simultaneously with sub-second latency. The platform successfully bridges the gap between human creativity and AI support, offering features like instant content generation and smart formatting in a secure, polished environment.",
    midImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
    bottomImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
  },
  {
    slug: "xdevverse",
    title: "XDevVerse",
    category: "Full-Stack App",
    description:
      "An enterprise-grade hackathon management platform enabling developers to participate in competitions, submit projects, and receive evaluations through an intelligent, AI-powered ecosystem.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/Hector-Ha/XDevVerse",
    liveUrl: "https://x-dev-verse.vercel.app/",
    tags: ["React", "TypeScript", "Node.js", "MongoDB", "AI"],
    scope: "Full Stack Development, System Architecture, UI/UX Design",
    techStack: [
      "Languages: TypeScript, JavaScript, HTML/CSS",
      "Frontend: React 19, Material-UI (MUI), Redux Toolkit, Framer Motion, React Router, Recharts, Axios, Vite",
      "Backend: Node.js, Express, Socket.io, Mongoose, JWT, Groq SDK (AI Integration)",
      "Databases: MongoDB",
      "Developer Tools: Git/GitHub, ESLint, Prettier, Vitest, Nodemon, Postman",
    ],
    challenge:
      "One of the main challenges was designing a scalable architecture capable of handling real-time interactions for three distinct user roles (Participants, Organizers, Judges) concurrently. Integrating the Groq AI SDK for real-time code assistance and automated evaluation feedback while maintaining low latency required careful optimization of the backend and API response handling.",
    objective:
      "The goal was to streamline the entire hackathon lifecycle, from event creation and team formation to project submission and judging, into a single, cohesive ecosystem. We aimed to reduce the administrative burden on organizers and provide participants with intelligent tools to enhance their hackathon experience.",
    results:
      "We successfully delivered a comprehensive platform featuring role-based dashboards, a real-time leaderboard, and an AI-powered coding assistant. The system supports complex evaluation criteria and provides instant feedback, significantly improving the efficiency of hackathon management and participant engagement.",
    midImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
    bottomImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
  },
  {
    slug: "nexus-ems",
    title: "Employee Management System (EMS)",
    category: "Full-Stack App",
    description:
      "A full-stack web application for managing employee records, tracking retirement timelines, and maintaining organizational staff information features.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/Hector-Ha/NexusEMS",
    tags: ["React", "GraphQL", "MongoDB", "Express", "Node.js"],
    scope: "Full Stack Development, System Architecture",
    techStack: [
      "Languages: JavaScript (ES6+), HTML5, CSS3, GraphQL",
      "Frontend: React 18.2, React Router 6, React Bootstrap, Webpack 5, Babel, React Icons",
      "Backend: Node.js, Express.js, Apollo Server 3, Mongoose (MongoDB ODM), GraphQL Scalars",
      "Databases: MongoDB (Atlas/Local)",
      "Developer Tools: Git, ESLint, Nodemon, Postman (implied), VS Code",
    ],
    challenge:
      "Implementing a robust retirement calculation engine that accurately tracks timelines based on dynamic employee data while ensuring data integrity through strict validation rules. Additionally, structuring the application as a monorepo with separate API and UI concerns required careful configuration of Webpack and proxy servers.",
    objective:
      "To create a centralized, efficient system for HR departments to manage the entire employee lifecycle, from onboarding to retirement, with a focus on ease of use, real-time feedback, and automated tracking of critical dates.",
    results:
      "Delivered a responsive, high-performance application that simplifies employee management. The system features a powerful GraphQL API for flexible data querying, real-time form validation for error-free data entry, and an intuitive dashboard for monitoring upcoming retirements.",
    midImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
    bottomImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
  },
  {
    slug: "typorush",
    title: "TypoRush",
    category: "Front-End Focus",
    description:
      "A dynamic typing speed test application featuring leaderboards, multiple test durations, and accuracy tracking.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/Hector-Ha/TypoRush",

    tags: ["JavaScript", "HTML", "CSS", "Local Storage"],
    scope: "UI/UX Design, Frontend Development",
    techStack: [
      "Languages: JavaScript, HTML, CSS",
      "Frontend: Vanilla JavaScript, HTML5, CSS3",
      "Backend: N/A (Client-side only)",
      "Databases: Local Storage",
      "Developer Tools: Git/GitHub",
    ],
    challenge:
      "The main challenge was ensuring design and functionality consistency across all pages while collaborating with a team. We needed to prevent style inconsistencies that could arise from independent work on different screens.",
    objective:
      "To create a dynamic, user-friendly typing test application with a consistent visual style and flow, featuring real-time progress tracking, multiple test modes (1 & 5 minutes), and competitive leaderboards.",
    results:
      "Delivered a polished, cohesive application with a unified design system. The project demonstrated effective collaboration and resulted in a seamless user experience with functional leaderboards, accuracy tracking, and responsive feedback.",
    midImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
    bottomImages: [
      "/images/project-placeholder.webp",
      "/images/project-placeholder.webp",
    ],
  },
];

export interface RouteAction {
  type: "NAVIGATE";
  path: string;
  label: string;
}

/**
 * Map keywords/intents to specific application routes.
 */
export const ROUTE_MAP: Record<string, string> = {
  // Main Sections
  about: "/about",
  contact: "/about#contact",
  resume: "/about#resume",
  projects: "/projects",
  work: "/projects",

  // Specific Projects (Dynamic mapping could involve finding by slug)
  interlock: "/projects/interlock",
  altshift: "/projects/altshift",
  xdevverse: "/projects/xdevverse",
  nexus: "/projects/nexus-ems",
  ems: "/projects/nexus-ems",
  typo: "/projects/typorush",
  typorush: "/projects/typorush",
};

/**
 * Parse a query or AI response tag to find a valid route.
 * @param text The text to analyze (user query or AI tag)
 * @returns A RouteAction if a match is found, otherwise null.
 */
export function findRoute(text: string): RouteAction | null {
  const lowerText = text.toLowerCase();

  // 1. Check for manual project matches from the projects data
  for (const project of projects) {
    if (
      lowerText.includes(project.title.toLowerCase()) ||
      lowerText.includes(project.slug)
    ) {
      return {
        type: "NAVIGATE",
        path: `/projects/${project.slug}`,
        label: `View ${project.title}`,
      };
    }
  }

  // 2. Check the static route map
  for (const [key, path] of Object.entries(ROUTE_MAP)) {
    if (lowerText.includes(key)) {
      // Create a nice label from the key
      const label = `Go to ${key.charAt(0).toUpperCase() + key.slice(1)}`;
      return {
        type: "NAVIGATE",
        path,
        label,
      };
    }
  }

  return null;
}