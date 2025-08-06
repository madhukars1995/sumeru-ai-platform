import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../components/NotificationSystem';

type Theme = 'dark' | 'light' | 'auto';

interface ThemeConfig {
  name: string;
  description: string;
  icon: string;
}

const themes: Record<Theme, ThemeConfig> = {
  dark: {
    name: 'Dark',
    description: 'Dark theme for low-light environments',
    icon: '🌙'
  },
  light: {
    name: 'Light',
    description: 'Light theme for bright environments',
    icon: '☀️'
  },
  auto: {
    name: 'Auto',
    description: 'Automatically switch based on system preference',
    icon: '🔄'
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSystemDark, setIsSystemDark] = useState(false);
  const { addNotification } = useNotifications();

  // Check system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = theme === 'auto' ? (isSystemDark ? 'dark' : 'light') : theme;
    
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    document.body.className = `theme-${effectiveTheme}`;
    
    // Update CSS custom properties
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.style.setProperty('--bg-canvas', '#0a0a0a');
      root.style.setProperty('--bg-card', '#1a1a1a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-muted', '#a0a0a0');
      root.style.setProperty('--border-primary', '#333333');
      root.style.setProperty('--accent', '#3b82f6');
      root.style.setProperty('--accent-success', '#10b981');
      root.style.setProperty('--accent-error', '#ef4444');
    } else {
      root.style.setProperty('--bg-canvas', '#ffffff');
      root.style.setProperty('--bg-card', '#f8f9fa');
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-muted', '#6b7280');
      root.style.setProperty('--border-primary', '#e5e7eb');
      root.style.setProperty('--accent', '#3b82f6');
      root.style.setProperty('--accent-success', '#10b981');
      root.style.setProperty('--accent-error', '#ef4444');
    }
  }, [theme, isSystemDark]);

  const changeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    addNotification({
      type: 'success',
      title: 'Theme Changed',
      message: `Switched to ${themes[newTheme].name} theme`,
      duration: 2000
    });
  }, [addNotification]);

  const toggleTheme = useCallback(() => {
    const currentIndex = Object.keys(themes).indexOf(theme);
    const nextIndex = (currentIndex + 1) % Object.keys(themes).length;
    const nextTheme = Object.keys(themes)[nextIndex] as Theme;
    changeTheme(nextTheme);
  }, [theme, changeTheme]);

  const getCurrentThemeConfig = useCallback(() => {
    return themes[theme];
  }, [theme]);

  const getEffectiveTheme = useCallback(() => {
    return theme === 'auto' ? (isSystemDark ? 'dark' : 'light') : theme;
  }, [theme, isSystemDark]);

  return {
    theme,
    themes,
    changeTheme,
    toggleTheme,
    getCurrentThemeConfig,
    getEffectiveTheme,
    isSystemDark
  };
}; 