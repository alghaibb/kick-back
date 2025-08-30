"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const COOKIE_NAME = "active_theme";
const DEFAULT_THEME = "default";

function setThemeCookie(theme: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${
    window.location.protocol === "https:" ? "Secure;" : ""
  }`;
}

type ThemeContextType = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
}: {
  children: ReactNode;
  initialTheme?: string;
}) {
  const [activeTheme, setActiveThemeState] = useState(initialTheme);

  useEffect(() => {
    const localStorageTheme = localStorage.getItem("shadcn-theme");
    const theme = localStorageTheme || initialTheme;

    // Apply the theme class to <html>
    document.documentElement.classList.remove(
      ...Array.from(document.documentElement.classList).filter((cls) =>
        cls.startsWith("theme-")
      )
    );
    document.documentElement.classList.add(`theme-${theme}`);

    localStorage.setItem("shadcn-theme", theme);
    setThemeCookie(theme);
    setActiveThemeState(theme);
  }, [initialTheme]);

  const setActiveTheme = (theme: string) => {
    document.documentElement.classList.remove(
      ...Array.from(document.documentElement.classList).filter((cls) =>
        cls.startsWith("theme-")
      )
    );
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem("shadcn-theme", theme);
    setThemeCookie(theme);
    setActiveThemeState(theme);
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeConfig must be used within ActiveThemeProvider");
  }
  return context;
}
