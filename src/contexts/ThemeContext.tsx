"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get resolved theme (actual theme being used)
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    setMounted(true);
    
    // Get initial theme from localStorage or default to system
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      setThemeState(storedTheme);
    }

    // Detect system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(resolvedTheme);
    
    // Update CSS variables for smooth transitions
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--background', '210 6% 12%'); // User's preferred greyish background
      root.style.setProperty('--foreground', '0 0% 98%');
      root.style.setProperty('--card', '210 6% 17%'); // Lighter card background for contrast
      root.style.setProperty('--card-foreground', '0 0% 98%');
      root.style.setProperty('--popover', '210 6% 17%');
      root.style.setProperty('--popover-foreground', '0 0% 98%');
      root.style.setProperty('--primary', '217.2 91.2% 59.8%'); // Keep blue primary
      root.style.setProperty('--primary-foreground', '0 0% 100%'); // White text on primary
      root.style.setProperty('--secondary', '210 6% 22%'); // Darker secondary for proper contrast
      root.style.setProperty('--secondary-foreground', '0 0% 98%');
      root.style.setProperty('--muted', '210 6% 20%'); // Proper muted background
      root.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
      root.style.setProperty('--accent', '217.2 91.2% 59.8%'); // Use primary blue for accent
      root.style.setProperty('--accent-foreground', '0 0% 100%');
      root.style.setProperty('--destructive', '0 84.2% 60.2%');
      root.style.setProperty('--destructive-foreground', '0 0% 98%');
      root.style.setProperty('--border', '210 6% 22%'); // Visible borders
      root.style.setProperty('--input', '210 6% 17%'); // Same as cards
      root.style.setProperty('--ring', '217.2 91.2% 59.8%');
      root.style.setProperty('--sidebar-background', '210 6% 15%'); // Slightly darker sidebar
      root.style.setProperty('--sidebar-foreground', '0 0% 98%');
      root.style.setProperty('--sidebar-primary', '217.2 91.2% 59.8%');
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
      root.style.setProperty('--sidebar-accent', '210 6% 22%');
      root.style.setProperty('--sidebar-accent-foreground', '0 0% 98%');
      root.style.setProperty('--sidebar-border', '210 6% 22%');
      root.style.setProperty('--sidebar-ring', '217.2 91.2% 59.8%');
    } else {
      root.style.setProperty('--background', '210 20% 95%'); // User's preferred light greyish background
      root.style.setProperty('--foreground', '222.2 84% 4.9%');
      root.style.setProperty('--card', '0 0% 100%'); // Pure white cards for contrast
      root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--primary', '217.2 91.2% 59.8%');
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--secondary', '210 40% 96%');
      root.style.setProperty('--secondary-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--muted', '210 40% 96%');
      root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');
      root.style.setProperty('--accent', '217.2 91.2% 59.8%');
      root.style.setProperty('--accent-foreground', '0 0% 100%');
      root.style.setProperty('--destructive', '0 84.2% 60.2%');
      root.style.setProperty('--destructive-foreground', '0 0% 100%');
      root.style.setProperty('--border', '214.3 31.8% 91.4%');
      root.style.setProperty('--input', '0 0% 100%'); // White input backgrounds
      root.style.setProperty('--ring', '217.2 91.2% 59.8%');
      root.style.setProperty('--sidebar-background', '210 20% 98%'); // Very light sidebar
      root.style.setProperty('--sidebar-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--sidebar-primary', '217.2 91.2% 59.8%');
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
      root.style.setProperty('--sidebar-accent', '210 40% 96%');
      root.style.setProperty('--sidebar-accent-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--sidebar-border', '214.3 31.8% 91.4%');
      root.style.setProperty('--sidebar-ring', '217.2 91.2% 59.8%');
    }
  }, [resolvedTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        systemTheme,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}