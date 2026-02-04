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
    slug: "project-atlas",
    title: "Project Atlas",
    category: "Full-Stack App",
    description:
      "A secure, full-stack finance prototype that connects accounts and enables transfers.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/example/project-atlas",
    tags: ["Next.js", "TypeScript", "Security", "APIs"],
    scope: "Full Stack Architecture, API Integration, Security Implementation",
    techStack: [
      "Languages: TypeScript, HTML/CSS, SQL",
      "Frontend: React, Next.js, Tailwind CSS",
      "Backend: Node.js, Express",
      "Databases: PostgreSQL",
      "Developer Tools: Git, Docker, ESLint",
    ],
    challenge:
      "Designing secure data flows across external APIs while keeping the UX simple.",
    objective:
      "Build a reliable MVP with strong security guarantees and clear onboarding.",
    results:
      "Delivered a working prototype with account linking and transfer workflows.",
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
    slug: "project-beacon",
    title: "Project Beacon",
    category: "Full-Stack App",
    description:
      "A real-time collaborative editor bridging drafting and AI-assisted creation.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/example/project-beacon",
    liveUrl: "https://example.com/project-beacon",
    tags: ["React", "WebSockets", "AI", "TypeScript"],
    scope: "Full Stack Architecture, Real-time Systems Engineering",
    techStack: [
      "Languages: TypeScript, HTML/CSS",
      "Frontend: React, Vite, Rich Text Editor",
      "Backend: Node.js, Express, WebSockets",
      "Databases: MongoDB",
      "Services: AI text assistance",
      "Developer Tools: Docker, ESLint",
    ],
    challenge:
      "Synchronizing rich-text state across clients in real-time without conflicts.",
    objective:
      "Engineer a collaborative editor with seamless live updates and AI tooling.",
    results:
      "Delivered sub-second updates with reliable presence indicators.",
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
    slug: "project-cascade",
    title: "Project Cascade",
    category: "Full-Stack App",
    description:
      "An event management platform supporting registration, submissions, and scoring.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/example/project-cascade",
    liveUrl: "https://example.com/project-cascade",
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    scope: "Full Stack Development, System Architecture, UI/UX Design",
    techStack: [
      "Languages: TypeScript, JavaScript, HTML/CSS",
      "Frontend: React, UI component library",
      "Backend: Node.js, Express, REST APIs",
      "Databases: PostgreSQL",
      "Developer Tools: Git, ESLint, Prettier",
    ],
    challenge:
      "Designing a scalable architecture for multiple roles and workflows.",
    objective:
      "Streamline the event lifecycle from registration to scoring.",
    results:
      "Delivered dashboards, leaderboards, and automated scoring workflows.",
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
    slug: "project-delta",
    title: "Project Delta",
    category: "Full-Stack App",
    description:
      "A web application for managing employee records, timelines, and workflows.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/example/project-delta",
    tags: ["React", "GraphQL", "MongoDB", "Node.js"],
    scope: "Full Stack Development, System Architecture",
    techStack: [
      "Languages: JavaScript, HTML/CSS",
      "Frontend: React, React Router",
      "Backend: Node.js, Express, GraphQL",
      "Databases: MongoDB",
      "Developer Tools: Git, ESLint",
    ],
    challenge:
      "Implementing reliable data validation while keeping workflows simple.",
    objective:
      "Create a centralized system for HR teams to manage the employee lifecycle.",
    results:
      "Delivered a responsive app with a flexible API and clear data entry flows.",
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
    slug: "project-echo",
    title: "Project Echo",
    category: "Front-End Focus",
    description:
      "A typing speed test featuring leaderboards, multiple modes, and accuracy tracking.",
    image: "/images/project-placeholder.webp",
    repoUrl: "https://github.com/example/project-echo",
    tags: ["JavaScript", "HTML", "CSS", "Local Storage"],
    scope: "UI/UX Design, Frontend Development",
    techStack: [
      "Languages: JavaScript, HTML, CSS",
      "Frontend: Vanilla JavaScript",
      "Backend: N/A (Client-side only)",
      "Databases: Local Storage",
      "Developer Tools: Git",
    ],
    challenge:
      "Maintaining design consistency while coordinating UI updates and scoring logic.",
    objective:
      "Build a fast, engaging typing experience with clear feedback.",
    results:
      "Delivered a cohesive UI with responsive feedback and configurable test modes.",
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

  // Specific Projects
  atlas: "/projects/project-atlas",
  beacon: "/projects/project-beacon",
  cascade: "/projects/project-cascade",
  delta: "/projects/project-delta",
  echo: "/projects/project-echo",
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
