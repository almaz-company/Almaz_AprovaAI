export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
};

export type Theme = "light" | "dark" | "system";

export type ThemeContextType = {
  theme: Theme;
  effectiveTheme: Exclude<Theme, "system">;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  followSystem: boolean;
  setFollowSystem: (v: boolean) => void;
};

export interface SearchItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    href: string;
    group: string;
    keywords?: string[];
}
