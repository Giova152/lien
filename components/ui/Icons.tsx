import React from 'react';
import {
  MessageCircle,
  Video,
  Mail,
  Phone,
  Globe,
  Trash2,
  Edit,
  Plus,
  GripVertical,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  QrCode,
  User,
  Share2,
  Download,
  Eye,
  EyeOff,
  BarChart3,
  Settings,
  Lock,
  LogOut,
  Palette,
  Link as LinkIcon,
  PhoneCall,
  MapPin,
  Building2,
  Briefcase,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  X,
  Menu,
  MoreHorizontal,
  Upload,
  ArrowRight,
  ChevronRight,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Trophy,
  Layers,
  Camera,
  LayoutDashboard,
  Wifi,
  Battery,
  Signal,
  Calendar,
  UserCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  ShieldCheck,
  Star,
  UserPlus,
  Gift,
  Users,
  XCircle,
  CheckCircle,
  Send,
  DollarSign,
  CreditCard,
  ListOrdered,
  Crown,
  FileText,
  Award,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ShoppingBag,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
} from 'lucide-react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name?: string;
  className?: string;
  size?: number;
}

// Authentic Official SVG Logos for Social Brands
export function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function YoutubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function WhatsappIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export function TiktokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.18V9.28a6.34 6.34 0 0 0-5.85 6.33 6.34 6.34 0 0 0 10.74 4.54A6.29 6.29 0 0 0 15.82 15V8.69a8.28 8.28 0 0 0 4.77 1.5V6.74a4.86 4.86 0 0 1-1-.05z" />
    </svg>
  );
}

export function TwitterIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function LinkedinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

// Authentic Full-Color Circular Badges for Quick Actions
export function OfficialWhatsappIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#25D366" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.5 13.5C31.7 10.7 28 9.2 24 9.2C15.8 9.2 9.2 15.8 9.2 24C9.2 26.6 9.9 29.2 11.2 31.5L9 39.5L17.3 37.3C19.4 38.5 21.7 39.1 24 39.1C32.2 39.1 38.8 32.5 38.8 24.3C38.8 20.3 37.3 16.3 34.5 13.5ZM24 36.6C21.9 36.6 19.9 36 18.2 35L17.7 34.7L12.8 36L14.1 31.2L13.8 30.7C12.7 28.7 12.1 26.4 12.1 24C12.1 17.4 17.4 12.1 24 12.1C27.2 12.1 30.2 13.3 32.5 15.6C34.8 17.9 36 20.9 36 24.1C36 30.7 30.6 36.6 24 36.6ZM30.6 27.2C30.2 27 28.4 26.1 28.1 26C27.7 25.8 27.5 25.8 27.3 26.1C27.1 26.5 26.4 27.3 26.2 27.5C26 27.7 25.8 27.8 25.4 27.6C25 27.4 23.8 27 22.4 25.7C21.3 24.7 20.5 23.5 20.3 23.1C20.1 22.7 20.3 22.5 20.5 22.3C20.7 22.1 20.9 21.8 21.1 21.6C21.3 21.4 21.4 21.2 21.5 21C21.6 20.8 21.6 20.6 21.5 20.4C21.4 20.2 20.8 18.8 20.5 18.2C20.3 17.6 20.1 17.7 19.9 17.7C19.7 17.7 19.5 17.7 19.3 17.7C19.1 17.7 18.8 17.8 18.5 18.1C18.2 18.4 17.5 19.1 17.5 20.5C17.5 21.9 18.5 23.2 18.7 23.4C18.9 23.6 20.7 26.5 23.5 27.7C24.2 28 24.7 28.2 25.2 28.4C26 28.6 26.7 28.6 27.3 28.5C28 28.4 29.4 27.6 29.7 26.8C30 26 30 25.3 29.9 25.1C29.8 25 29.6 24.9 29.2 24.7H30.6V27.2Z"
        fill="white"
      />
    </svg>
  );
}

export function OfficialPhoneIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#34C759" />
      <path
        d="M32.6 27.4C31.2 27.4 29.8 27.1 28.5 26.7C27.9 26.5 27.2 26.7 26.8 27.1L24.6 29.3C21.3 27.6 18.5 24.8 16.8 21.5L19 19.3C19.4 18.9 19.6 18.2 19.4 17.6C19 16.3 18.7 14.9 18.7 13.5C18.7 12.7 18 12 17.2 12H14.1C13.3 12 12.6 12.7 12.6 13.5C12.6 24.6 21.5 33.5 32.6 33.5C33.4 33.5 34.1 32.8 34.1 32V28.9C34.1 28.1 33.4 27.4 32.6 27.4Z"
        fill="white"
      />
    </svg>
  );
}

export function OfficialMailIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#EA4335" />
      <path
        d="M13.5 16C12.4 16 11.5 16.9 11.5 18V30C11.5 31.1 12.4 32 13.5 32H34.5C35.6 32 36.5 31.1 36.5 30V18C36.5 16.9 35.6 16 34.5 16H13.5ZM14.3 18H33.7L24 24.1L14.3 18ZM13.5 20.3L23.4 26.5C23.8 26.7 24.2 26.7 24.6 26.5L34.5 20.3V30H13.5V20.3Z"
        fill="white"
      />
    </svg>
  );
}

export function OfficialGmailIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="24" fill="#FFFFFF" />
      <rect x="0.5" y="0.5" width="47" height="47" rx="23.5" stroke="#E2E8F0" />
      <path d="M13 33V18.5L24 26.8L35 18.5V33C35 34.1 34.1 35 33 35H15C13.9 35 13 34.1 13 33Z" fill="#EA4335" />
      <path d="M13 18.5V15C13 13.9 13.9 13 15 13H17L24 18.2L31 13H33C34.1 13 35 13.9 35 15V18.5L24 26.8L13 18.5Z" fill="#4285F4" />
      <path d="M13 18.5L24 26.8L13 33V18.5Z" fill="#FBBC05" />
      <path d="M35 18.5L24 26.8L35 33V18.5Z" fill="#34A853" />
    </svg>
  );
}

export function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

import { Icon as IconifyIcon } from '@iconify/react';

export function PlatformIcon({ name, className = 'w-5 h-5' }: IconProps) {
  if (name?.includes(':')) {
    return <IconifyIcon icon={name} className={className} />;
  }

  switch (name?.toLowerCase()) {
    case 'instagram':
      return <InstagramIcon className={className} />;
    case 'youtube':
      return <YoutubeIcon className={className} />;
    case 'facebook':
      return <FacebookIcon className={className} />;
    case 'x':
    case 'twitter':
      return <TwitterIcon className={className} />;
    case 'linkedin':
      return <LinkedinIcon className={className} />;
    case 'github':
      return <GithubIcon className={className} />;
    case 'whatsapp':
      return <WhatsappIcon className={className} />;
    case 'tiktok':
      return <TiktokIcon className={className} />;
    case 'email':
      return <Mail className={className} />;
    case 'phone':
    case 'tel':
      return <Phone className={className} />;
    case 'website':
    default:
      return <Globe className={className} />;
  }
}

export {
  InstagramIcon as Instagram,
  YoutubeIcon as Youtube,
  FacebookIcon as Facebook,
  TwitterIcon as Twitter,
  LinkedinIcon as Linkedin,
  GithubIcon as Github,
  WhatsappIcon as Whatsapp,
  TiktokIcon as Tiktok,
  MessageCircle,
  Video,
  Mail,
  Phone,
  Globe,
  Trash2,
  Edit,
  Plus,
  GripVertical,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  QrCode,
  User,
  Share2,
  Download,
  Eye,
  EyeOff,
  BarChart3,
  Settings,
  Lock,
  LogOut,
  Palette,
  LinkIcon,
  PhoneCall,
  MapPin,
  Building2,
  Briefcase,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  X,
  Menu,
  MoreHorizontal,
  Upload,
  ArrowRight,
  ChevronRight,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Trophy,
  Layers,
  Camera,
  LayoutDashboard,
  Wifi,
  Battery,
  Signal,
  Calendar,
  UserCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  IconifyIcon,
  Zap,
  Shield,
  ShieldCheck,
  Star,
  UserPlus,
  Gift,
  Users,
  XCircle,
  CheckCircle,
  Send,
  ShoppingBag,
  DollarSign,
  CreditCard,
  ListOrdered,
  Crown,
  FileText,
  Award,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
};
