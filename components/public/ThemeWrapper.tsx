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
    return { backgroundColor: theme.background_value || '#F7F3EC' };
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${className}`}
      style={{
        ...getBackgroundStyle(),
        color: theme.text_color || '#1C1A17',
        fontFamily: theme.font_family || 'Outfit, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
