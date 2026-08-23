export type BackgroundType = 'color' | 'gradient' | 'image';
export type ButtonStyle = 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-full' | 'outline' | 'glass';

export interface ThemeConfig {
  background_type: BackgroundType;
  background_value: string;
  button_style: ButtonStyle;
  button_color: string;
  button_text_color: string;
  button_border_color?: string;
  font_family: string;
  text_color: string;
  accent_color: string;
  card_glass?: boolean;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  theme: ThemeConfig;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkItem {
  id: string;
  profile_id: string;
  type: 'social' | 'custom';
  platform?: string | null;
  label: string;
  url: string;
  icon?: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  id?: string;
  profile_id: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  show_save_contact_button: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileView {
  id: string;
  profile_id: string;
  viewed_at: string;
  referrer?: string | null;
  device?: string | null;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  viewsByDate: { date: string; views: number }[];
  clicksByLink: { id: string; label: string; url: string; platform?: string | null; clicks: number }[];
}
