'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/themeStore';

export default function ThemeInitializer() {
  const { isDark, setDark } = useTheme();

  useEffect(() => {
    // Check localStorage on mount
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (shouldBeDark && !isDark) {
      setDark(true);
    }
  }, []);

  return null;
}