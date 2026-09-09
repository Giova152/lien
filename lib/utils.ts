import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThemeConfig } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_THEME: ThemeConfig = {
  background_type: 'color',
  background_value: '#F7F3EC',
  button_style: 'rounded-full',
  button_color: '#EDE8DE',
  button_text_color: '#1C1A17',
  button_border_color: 'rgba(184, 145, 77, 0.25)',
  font_family: 'Playfair Display',
  text_color: '#1C1A17',
  accent_color: '#B8914D',
  card_glass: false,
};

export const THEME_PRESETS: { name: string; theme: ThemeConfig }[] = [
  {
    name: 'Ivoire & Or Luxe (Linette - Default)',
    theme: {
      background_type: 'color',
      background_value: '#F7F3EC',
      button_style: 'rounded-full',
      button_color: '#EDE8DE',
      button_text_color: '#1C1A17',
      button_border_color: 'rgba(184, 145, 77, 0.25)',
      font_family: 'Playfair Display',
      text_color: '#1C1A17',
      accent_color: '#B8914D',
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
      font_family: 'Space Grotesk',
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

export function formatExternalUrl(url?: string): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Automatically detects the user's browser language.
 * Returns 'fr' if French is preferred, otherwise defaults to 'en' for international visitors.
 */
export function detectBrowserLanguage(): 'fr' | 'en' {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'fr';
  try {
    const navLangs =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language || (navigator as any).userLanguage || ''];

    for (const l of navLangs) {
      if (!l) continue;
      const lower = l.toLowerCase();
      if (lower.startsWith('fr')) return 'fr';
      if (lower.startsWith('en')) return 'en';
    }

    // If preferred language is not French (e.g. es, de, it, pt, etc.), default to English for international visitors
    const primary = (navigator.language || '').toLowerCase();
    if (primary && !primary.startsWith('fr')) {
      return 'en';
    }
  } catch (e) {
    // ignore
  }
  return 'fr';
}

