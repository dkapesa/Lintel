import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import "./design-system.css";
import GuidedTour from "./guided-tour";
import { ThemeProvider, THEME_PREFERENCE_STORAGE_KEY } from "./theme-provider";

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

const themeBootstrapScript = `(() => {
  try {
    const key = ${JSON.stringify(THEME_PREFERENCE_STORAGE_KEY)};
    const stored = window.localStorage.getItem(key);
    const preference = stored === "dark" || stored === "light" || stored === "system" ? stored : "system";
    const resolved = preference === "system"
      ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch {
    let resolved = "dark";
    try {
      if (typeof window.matchMedia === "function") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    } catch {
      // Match-media access can also be unavailable in restricted contexts.
    }
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geist.variable} ${geistMono.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} /></head>
      <body><ThemeProvider><GuidedTour>{children}</GuidedTour></ThemeProvider></body>
    </html>
  );
}
