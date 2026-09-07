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

  const getFontFamily = (font?: string): string => {
    if (!font || font.toLowerCase() === 'arial' || font === 'Outfit') {
      return 'Arial, "Helvetica Neue", Helvetica, sans-serif';
    }
    if (font === 'Inter') return 'var(--font-inter), Inter, Arial, sans-serif';
    if (font === 'Playfair Display') return 'var(--font-playfair), "Playfair Display", Georgia, serif';
    if (font === 'Space Grotesk') return 'var(--font-space), "Space Grotesk", monospace';
    return `${font}, Arial, Helvetica, sans-serif`;
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 antialiased ${className}`}
      style={{
        ...getBackgroundStyle(),
        color: theme.text_color || '#1C1A17',
        fontFamily: getFontFamily(theme.font_family),
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </div>
  );
}
