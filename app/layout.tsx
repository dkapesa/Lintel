import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import "./design-system.css";
import "./app-shell.css";
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

/* R2B — logged-in AppShell routes render one authoritative dark theme. The
   bootstrap forces dark for these paths at first paint (no light flash on hard
   load/refresh) without ever reading or writing the stored public preference.
   AppShell re-asserts the same lock for client-side navigations. */
const SHELL_DARK_PATHS = [
  "/new",
  "/report",
  "/review-operations",
  "/team",
  "/review-policies",
  "/github-action",
  "/slack-handoff",
  "/settings",
];

const themeBootstrapScript = `(() => {
  var shellPaths = ${JSON.stringify(SHELL_DARK_PATHS)};
  function isShellPath() {
    try {
      var path = window.location.pathname;
      for (var i = 0; i < shellPaths.length; i++) {
        if (path === shellPaths[i] || path.indexOf(shellPaths[i] + "/") === 0) return true;
      }
    } catch (e) {}
    return false;
  }
  try {
    const key = ${JSON.stringify(THEME_PREFERENCE_STORAGE_KEY)};
    const stored = window.localStorage.getItem(key);
    const preference = stored === "dark" || stored === "light" || stored === "system" ? stored : "system";
    const resolved = preference === "system"
      ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    const applied = isShellPath() ? "dark" : resolved;
    document.documentElement.dataset.theme = applied;
    document.documentElement.style.colorScheme = applied;
  } catch {
    let resolved = "dark";
    try {
      if (typeof window.matchMedia === "function") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    } catch {
      // Match-media access can also be unavailable in restricted contexts.
    }
    const applied = isShellPath() ? "dark" : resolved;
    document.documentElement.dataset.theme = applied;
    document.documentElement.style.colorScheme = applied;
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
