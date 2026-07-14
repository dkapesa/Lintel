"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export const THEME_PREFERENCE_STORAGE_KEY = "lintel.themePreference.v1";

export type ThemePreference = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function normalizeThemePreference(value: unknown): ThemePreference {
  return value === "dark" || value === "light" || value === "system" ? value : "system";
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  return preference === "system" ? (systemPrefersDark ? "dark" : "light") : preference;
}

function systemPrefersDark() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyResolvedTheme(theme: ResolvedTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const preferenceRef = useRef<ThemePreference>("system");
  const transitionRemovalTimer = useRef<number | null>(null);

  const applyThemeWithTransition = (theme: ResolvedTheme) => {
    const root = document.documentElement;
    if (transitionRemovalTimer.current !== null) {
      window.clearTimeout(transitionRemovalTimer.current);
      transitionRemovalTimer.current = null;
    }

    const reducedMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      root.classList.remove("theme-transitioning");
      applyResolvedTheme(theme);
      return;
    }

    root.classList.add("theme-transitioning");
    applyResolvedTheme(theme);
    transitionRemovalTimer.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      transitionRemovalTimer.current = null;
    }, 180);
  };

  useEffect(() => {
    let storedPreference: ThemePreference = "system";
    try {
      storedPreference = normalizeThemePreference(window.localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY));
    } catch {
      // A blocked storage area must never prevent application rendering.
    }

    const media = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
    const applyPreference = (nextPreference: ThemePreference) => {
      const nextTheme = resolveTheme(nextPreference, media?.matches ?? true);
      preferenceRef.current = nextPreference;
      setPreference(nextPreference);
      setResolvedTheme(nextTheme);
      applyResolvedTheme(nextTheme);
    };

    applyPreference(storedPreference);
    const onSystemThemeChange = () => {
      if (preferenceRef.current === "system") applyPreference("system");
    };
    media?.addEventListener("change", onSystemThemeChange);
    return () => {
      media?.removeEventListener("change", onSystemThemeChange);
      if (transitionRemovalTimer.current !== null) {
        window.clearTimeout(transitionRemovalTimer.current);
        transitionRemovalTimer.current = null;
      }
      document.documentElement.classList.remove("theme-transitioning");
    };
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    preference,
    resolvedTheme,
    setThemePreference(nextPreference) {
      const safePreference = normalizeThemePreference(nextPreference);
      try {
        window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, safePreference);
      } catch {
        // The selected theme still applies for this browser session.
      }
      const nextTheme = resolveTheme(safePreference, systemPrefersDark());
      preferenceRef.current = safePreference;
      setPreference(safePreference);
      setResolvedTheme(nextTheme);
      applyThemeWithTransition(nextTheme);
    },
  }), [preference, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}

export function ThemeControl() {
  const { preference, resolvedTheme, setThemePreference } = useTheme();

  return (
    <label className="shell-theme-control">
      <span>Theme</span>
      <select
        value={preference}
        onChange={(event) => setThemePreference(normalizeThemePreference(event.target.value))}
        aria-label="Theme preference"
        title={`Theme preference: ${preference}. Resolved ${resolvedTheme}.`}
      >
        <option value="system">System</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </label>
  );
}
