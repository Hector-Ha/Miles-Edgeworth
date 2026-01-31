import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import { LLMWarmup } from "@/components/my-lawyer/LLMWarmup";

const ppNeueMontreal = localFont({
  src: [
    {
      path: "../fonts/pp-neue-montreal/ppneuemontreal-thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/pp-neue-montreal/ppneuemontreal-book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/pp-neue-montreal/ppneuemontreal-italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/pp-neue-montreal/ppneuemontreal-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/pp-neue-montreal/ppneuemontreal-semibolditalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../fonts/pp-neue-montreal/ppneuemontreal-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "The Prosecution of Hector | Miles Edgeworth",
  description:
    "Interactive portfolio chatbot where Miles Edgeworth presents evidence of Hector Ha's professional qualifications. Cross-examine the defendant!",
  keywords: [
    "portfolio",
    "chatbot",
    "Miles Edgeworth",
    "Ace Attorney",
    "developer",
    "interactive",
    "courtroom",
    "Hector Ha",
  ],
  openGraph: {
    title: "The Prosecution of Hector | Miles Edgeworth",
    description: "Interactive portfolio chatbot with Ace Attorney theme",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ppNeueMontreal.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        {children}
        <LLMWarmup />
      </body>
    </html>
  );
}
