import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThemeConfig } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_THEME: ThemeConfig = {
  background_type: 'gradient',
  background_value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
  button_style: 'rounded-xl',
  button_color: 'rgba(255, 255, 255, 0.08)',
  button_text_color: '#ffffff',
  button_border_color: 'rgba(255, 255, 255, 0.15)',
  font_family: 'Inter',
  text_color: '#ffffff',
  accent_color: '#6366f1',
  card_glass: true,
};

export const THEME_PRESETS: { name: string; theme: ThemeConfig }[] = [
  {
    name: 'Nuit Étoilée (Sombre)',
    theme: {
      background_type: 'gradient',
      background_value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
      button_style: 'rounded-xl',
      button_color: 'rgba(255, 255, 255, 0.08)',
      button_text_color: '#ffffff',
      button_border_color: 'rgba(255, 255, 255, 0.15)',
      font_family: 'Inter',
      text_color: '#ffffff',
      accent_color: '#818cf8',
      card_glass: true,
    },
  },
  {
    name: 'Minimaliste Clair',
    theme: {
      background_type: 'color',
      background_value: '#f8fafc',
      button_style: 'rounded-xl',
      button_color: '#ffffff',
      button_text_color: '#0f172a',
      button_border_color: '#e2e8f0',
      font_family: 'Inter',
      text_color: '#0f172a',
      accent_color: '#4f46e5',
      card_glass: false,
    },
  },
  {
    name: 'Émeraude Luxe',
    theme: {
      background_type: 'gradient',
      background_value: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      button_style: 'rounded-full',
      button_color: 'rgba(255, 255, 255, 0.1)',
      button_text_color: '#ecfdf5',
      button_border_color: 'rgba(52, 211, 153, 0.3)',
      font_family: 'Playfair Display',
      text_color: '#ecfdf5',
      accent_color: '#10b981',
      card_glass: true,
    },
  },
  {
    name: 'Sunset Neon',
    theme: {
      background_type: 'gradient',
      background_value: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
      button_style: 'rounded-xl',
      button_color: 'rgba(0, 0, 0, 0.25)',
      button_text_color: '#ffffff',
      button_border_color: 'rgba(255, 255, 255, 0.3)',
      font_family: 'Outfit',
      text_color: '#ffffff',
      accent_color: '#ffd166',
      card_glass: true,
    },
  },
  {
    name: 'Élégance Or & Ivoire',
    theme: {
      background_type: 'color',
      background_value: '#FBF9F4',
      button_style: 'rounded-xl',
      button_color: '#ffffff',
      button_text_color: '#1f1f1f',
      button_border_color: '#e8e2d5',
      font_family: 'Playfair Display',
      text_color: '#1f1f1f',
      accent_color: '#b8860b',
      card_glass: false,
    },
  },
  {
    name: 'Cyberpunk Noir',
    theme: {
      background_type: 'color',
      background_value: '#09090b',
      button_style: 'rounded-none',
      button_color: '#18181b',
      button_text_color: '#38bdf8',
      button_border_color: '#38bdf8',
      font_family: 'Space Grotesk',
      text_color: '#f4f4f5',
      accent_color: '#38bdf8',
      card_glass: false,
    },
  },
];

export function sanitizeUsername(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 30);
}
