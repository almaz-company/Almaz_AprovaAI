"use client";

import type React from "react";
import { createContext, useContext, useEffect } from "react";
import { ThemeContextType } from "@/src/presentation/modules/Dashboard/layout/Sidebar/types/index";

// Tema fixo em "light". Este provider mantém a API, mas desativa
// totalmente o sistema de dark/light em toda a aplicação.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    try {
      document.documentElement.classList.remove("dark");
      if (typeof localStorage !== "undefined") localStorage.removeItem("theme");
    } catch {
      /* ignore */
    }
  }, []);

  const value: ThemeContextType = {
    theme: "light",
    effectiveTheme: "light",
    toggleTheme: () => {},
    setTheme: () => {},
    followSystem: false,
    setFollowSystem: () => {},
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
