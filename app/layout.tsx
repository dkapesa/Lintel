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

/* R3D — public metadata, per R3A §29. Truthful category language, no
   superlatives, no unsupported claim. No canonical deployment URL, social
   handle or share image is asserted here: the social/product-proof asset
   system belongs to R3E. */
const PUBLIC_TITLE = "Lintel — engineering verification for pull requests";
const PUBLIC_DESCRIPTION =
  "Lintel helps engineers decide whether a pull request is ready to merge: inspect the evidence behind a change, identify missing proof, see what must be resolved before merge, and record the final decision.";

export const metadata: Metadata = {
  title: PUBLIC_TITLE,
  description: PUBLIC_DESCRIPTION,
  openGraph: {
    title: PUBLIC_TITLE,
    description: PUBLIC_DESCRIPTION,
    siteName: "Lintel",
    type: "website",
  },
};

/* R2B — logged-in AppShell routes render one authoritative dark theme. The
   R4F.1 supersedes that historical rule below: production logged-in paths are
   light at first paint, while only the explicit rollback route stays dark.
   The public preference is never read as product authority or overwritten. */
const PRODUCT_LIGHT_PATHS = [
  "/workspace",
  "/home",
  "/new",
  "/report",
  "/review-operations",
  "/team",
  "/review-policies",
  "/github-action",
  "/slack-handoff",
  "/settings",
];

const LEGACY_DARK_PATHS = ["/workspace-legacy"];

const themeBootstrapScript = `(() => {
  var lightPaths = ${JSON.stringify(PRODUCT_LIGHT_PATHS)};
  var legacyDarkPaths = ${JSON.stringify(LEGACY_DARK_PATHS)};
  function matches(paths) {
    try {
      var path = window.location.pathname;
      for (var i = 0; i < paths.length; i++) {
        if (path === paths[i] || path.indexOf(paths[i] + "/") === 0) return true;
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
    const applied = matches(lightPaths) ? "light" : matches(legacyDarkPaths) ? "dark" : resolved;
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
    const applied = matches(lightPaths) ? "light" : matches(legacyDarkPaths) ? "dark" : resolved;
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
