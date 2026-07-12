import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import "./design-system.css";
import GuidedTour from "./guided-tour";

/* Deterministic landing typography (W1). The application keeps its existing
   font stacks; these variables are only consumed inside the `.lp` scope. */
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const newsreader = Newsreader({ subsets: ["latin"], weight: ["400", "500"], style: ["normal"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: "Lintel — Engineering verification for human and agent code",
  description:
    "Lintel turns pull requests into inspectable evidence, unresolved conditions and a clear engineering decision. Agents create code; Lintel verifies what is ready — and the engineer stays the final authority.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geist.variable} ${geistMono.variable} ${newsreader.variable}`}><GuidedTour>{children}</GuidedTour></body>
    </html>
  );
}
