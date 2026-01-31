/**
 * Component barrel exports
 * Provides clean imports for MyLawyer components
 */

// Main components
export { ChatBox } from "./ChatBox";
export { Courtroom } from "./Courtroom";
export { Edgeworth } from "./Edgeworth";
export { ErrorBoundary } from "./ErrorBoundary";
export { FileUploadZone, UploadButton } from "./FileUploadZone";
export { LinkPreviewCard } from "./LinkPreviewCard";
export { MyLawyerModal } from "./MyLawyerModal";
export { ObjectionOverlay } from "./ObjectionOverlay";

// UI components
export { Button, buttonVariants } from "./ui/button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
export { Input } from "./ui/input";
export { ScrollArea, ScrollBar } from "./ui/scroll-area";

// Re-export types
export type { Mood, Message } from "./Courtroom";
