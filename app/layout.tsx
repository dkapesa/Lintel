import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import "./design-system.css";
import GuidedTour from "./guided-tour";

/* Deterministic typography (W1 landing, E7.0 application). Geist Sans and
   Geist Mono are the application faces (via --font-sans/--font-mono in
   design-system.css); Newsreader is consumed only inside the `.lp` scope. */
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
    <html lang="en" data-scroll-behavior="smooth" className={`${geist.variable} ${geistMono.variable} ${newsreader.variable}`}>
      <body><GuidedTour>{children}</GuidedTour></body>
    </html>
  );
}
