'use client';

import React from 'react';
import { ThemeConfig } from '@/types';
import { DEFAULT_THEME } from '@/lib/utils';

interface ThemeWrapperProps {
  theme?: ThemeConfig;
  children: React.ReactNode;
  className?: string;
}

export function ThemeWrapper({ theme = DEFAULT_THEME, children, className = '' }: ThemeWrapperProps) {
  const getBackgroundStyle = (): React.CSSProperties => {
    if (theme.background_type === 'gradient') {
      return { background: theme.background_value };
    }
    if (theme.background_type === 'image') {
      return {
        backgroundImage: `url(${theme.background_value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return { backgroundColor: theme.background_value || '#0f172a' };
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${className}`}
      style={{
        ...getBackgroundStyle(),
        color: theme.text_color || '#ffffff',
        fontFamily: theme.font_family || 'Inter, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
