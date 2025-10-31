/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { Theme, ThemeContextType } from "@/src/presentation/modules/Dashboard/layout/Sidebar/types/index";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("system");
  const [manualTheme, setManualTheme] = useState<Exclude<Theme, "system">>("light");
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme | null) || "system";
    setTheme(savedTheme);
    if (savedTheme === "light" || savedTheme === "dark") setManualTheme(savedTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (ev?: MediaQueryListEvent | MediaQueryList) => {
      const matches = "matches" in media ? media.matches : false;
      setSystemPrefersDark(matches);
    };
    apply(media);
    media.addEventListener?.("change", apply);
    setIsInitialized(true);
    return () => {
      media.removeEventListener?.("change", apply as any);
    };
  }, []);

  const effectiveTheme: Exclude<Theme, "system"> = theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("theme", theme);
    if (effectiveTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, effectiveTheme, isInitialized]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = (prev === "dark" ? "light" : "dark") as Theme;
      setManualTheme(next as Exclude<Theme, "system">);
      return next;
    });
  };

  const setFollowSystem = (v: boolean) => {
    if (v) {
      setTheme("system");
    } else {
      setTheme(manualTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, toggleTheme, setTheme, followSystem: theme === "system", setFollowSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
