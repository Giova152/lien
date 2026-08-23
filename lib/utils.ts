import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThemeConfig } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_THEME: ThemeConfig = {
  background_type: 'color',
  background_value: '#F4EFE6',
  button_style: 'rounded-xl',
  button_color: '#FFFFFF',
  button_text_color: '#1C1917',
  button_border_color: '#E8E2D5',
  font_family: 'Playfair Display',
  text_color: '#1C1917',
  accent_color: '#C5A059',
  card_glass: false,
};

export const THEME_PRESETS: { name: string; theme: ThemeConfig }[] = [
  {
    name: 'Élégance Or & Ivoire (Default)',
    theme: {
      background_type: 'color',
      background_value: '#F4EFE6',
      button_style: 'rounded-xl',
      button_color: '#FFFFFF',
      button_text_color: '#1C1917',
      button_border_color: '#E8E2D5',
      font_family: 'Playfair Display',
      text_color: '#1C1917',
      accent_color: '#C5A059',
      card_glass: false,
    },
  },
  {
    name: 'Obsidienne Noir & Or',
    theme: {
      background_type: 'color',
      background_value: '#0C0A09',
      button_style: 'rounded-xl',
      button_color: '#1C1917',
      button_text_color: '#FAFAFA',
      button_border_color: '#292524',
      font_family: 'Playfair Display',
      text_color: '#FAFAFA',
      accent_color: '#D4AF37',
      card_glass: false,
    },
  },
  {
    name: 'Sauge Nordique & Crème',
    theme: {
      background_type: 'color',
      background_value: '#EAEFE9',
      button_style: 'rounded-xl',
      button_color: '#FBF9F5',
      button_text_color: '#2D3A2F',
      button_border_color: '#D3DDD2',
      font_family: 'Outfit',
      text_color: '#2D3A2F',
      accent_color: '#738676',
      card_glass: false,
    },
  },
  {
    name: 'Rose Poudré Haute Couture',
    theme: {
      background_type: 'color',
      background_value: '#F9F3F5',
      button_style: 'rounded-xl',
      button_color: '#FFFFFF',
      button_text_color: '#2B121C',
      button_border_color: '#EADBE0',
      font_family: 'Playfair Display',
      text_color: '#2B121C',
      accent_color: '#D9829B',
      card_glass: false,
    },
  },
  {
    name: 'Bleu Saphir Executive',
    theme: {
      background_type: 'color',
      background_value: '#0F172A',
      button_style: 'rounded-xl',
      button_color: '#1E293B',
      button_text_color: '#F8FAFC',
      button_border_color: '#334155',
      font_family: 'Inter',
      text_color: '#F8FAFC',
      accent_color: '#38BDF8',
      card_glass: false,
    },
  },
  {
    name: 'Studio Monochromie Noir',
    theme: {
      background_type: 'color',
      background_value: '#F4F4F5',
      button_style: 'rounded-xl',
      button_color: '#18181B',
      button_text_color: '#FFFFFF',
      button_border_color: '#27272A',
      font_family: 'Space Grotesk',
      text_color: '#09090B',
      accent_color: '#18181B',
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
