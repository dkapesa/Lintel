import type { Metadata } from "next";
import "./globals.css";
import "./design-system.css";
import GuidedTour from "./guided-tour";

export const metadata: Metadata = {
  title: "Lintel — Decide what’s ready to merge",
  description:
    "Lintel is a local-first merge-readiness workspace. It turns pull requests into clear merge decisions: risks with evidence, missing tests, operational readiness, and the conditions to clear before merge.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><GuidedTour>{children}</GuidedTour></body>
    </html>
  );
}
