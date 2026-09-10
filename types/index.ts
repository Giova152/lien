export type BackgroundType = 'color' | 'gradient' | 'image';
export type ButtonStyle = 'rounded-none' | 'rounded-md' | 'rounded-xl' | 'rounded-full' | 'outline' | 'glass';

export interface StatItem {
  id: string;
  value: string; // e.g. "12+"
  label: string; // e.g. "Ans d'expérience"
  hidden?: boolean; // Permet de masquer/afficher l'indicateur
}

export type LocationType = 'google_meet' | 'zoom' | 'phone' | 'physical' | 'custom_link';

export interface ServiceItem {
  id: string;
  title: string;
  category?: string; // e.g. "COACHING", "RDV" (facultatif)
  subtitle?: string;
  price?: string; // e.g. "Gratuit" or "49 €"
  url?: string;
  button_text?: string; // e.g. "Prendre RDV", "Réserver", "Planifier"
  is_native_booking?: boolean; // True si réservation de créneaux native sur Lien-Bio
  duration_minutes?: number; // Durée du RDV (ex: 30, 45, 60 min)
  
  // 📍 Lieu & Modalité du RDV
  location_type?: LocationType;
  location_details?: string; // URL Google Meet/Zoom, numéro de téléphone, ou adresse physique

  // 📅 Horaires spécifiques au service
  has_custom_availability?: boolean;
  custom_availability?: BookingAvailability;

  // 💳 Paiements & Tarifs
  is_paid?: boolean;
  price_amount?: number;
  currency?: string; // e.g. "EUR", "XOF", "USD"
}

export interface BookingAvailability {
  enabled_days: string[]; // e.g. ['mon', 'tue', 'wed', 'thu', 'fri']
  start_time: string; // e.g. '09:00'
  end_time: string; // e.g. '18:00'
  slot_duration: number; // e.g. 30, 45, 60 min
  break_start?: string; // e.g. '12:00'
  break_end?: string; // e.g. '14:00'
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';
export type AppointmentPaymentStatus = 'free' | 'pending' | 'paid' | 'refunded';

export interface AppointmentBooking {
  id: string;
  profile_id: string;
  service_id: string;
  service_title: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  date: string; // YYYY-MM-DD
  time_slot: string; // e.g. "14:00"
  status: AppointmentStatus;
  notes?: string;
  location_type?: LocationType;
  location_details?: string;
  is_paid?: boolean;
  payment_status?: AppointmentPaymentStatus;
  created_at: string;
}

export interface ShopProduct {
  id: string;
  title: string;
  price: string; // e.g. "Gratuit" or "10 $"
  type: 'free' | 'paid';
  image_url?: string;
  url?: string;
}

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

  // Custom profile sections (100% editable from Dashboard!)
  location?: string | null;
  stats?: StatItem[];
  expertise_tags?: string[];
  services?: ServiceItem[];
  enable_service_categories?: boolean;
  products?: ShopProduct[];
  // Team & Collaborators
  team_members?: TeamMember[];
  // Agenda & Native Appointment Booking
  booking_availability?: BookingAvailability;
  appointments?: AppointmentBooking[];

  // Custom Domain Name (PRO Feature)
  custom_domain?: string | null;
  custom_domain_status?: 'pending' | 'active' | 'error' | null;

  // PRO subscription details stored in JSONB theme
  is_pro?: boolean;
  plan?: string;
  pro_since?: string;
}

export type TeamRole = 'admin' | 'assistant';
export type TeamMemberStatus = 'pending' | 'accepted';

export interface TeamMember {
  id: string;
  card_owner_id: string;
  member_email: string;
  member_user_id?: string | null;
  role: TeamRole;
  status: TeamMemberStatus;
  created_at: string;
  updated_at?: string;
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
  is_pro?: boolean;
  plan?: 'free' | 'pro_lifetime' | 'pro_subscription' | string;
  custom_domain?: string | null;
  custom_domain_status?: 'pending' | 'active' | 'error' | null;
  stripe_payment_id?: string | null;
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

export interface DeviceStats {
  mobile: number;
  desktop: number;
  tablet: number;
  totalWithDevice: number;
  mobilePercentage: number;
  desktopPercentage: number;
  tabletPercentage: number;
}

export interface CountryStat {
  code: string;
  name: string;
  flag: string;
  views: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  viewsByDate: { date: string; views: number }[];
  clicksByLink: { id: string; label: string; url: string; platform?: string | null; clicks: number }[];
  deviceStats?: DeviceStats;
  topCountries?: CountryStat[];
}
