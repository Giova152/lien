'use client';

import React from 'react';
import Image from 'next/image';
import { Profile, ThemeConfig, ContactInfo } from '@/types';
import { MapPin } from '@/components/ui/Icons';

interface ProfileHeaderProps {
  profile: Profile;
  theme: ThemeConfig;
  contact?: ContactInfo | null;
  activeTab?: 'profil' | 'services' | 'shop';
  onTabChange?: (tab: 'profil' | 'services' | 'shop') => void;
}

export function ProfileHeader({ profile, theme, contact, activeTab = 'profil', onTabChange }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isLuxuryTheme = theme.font_family === 'Playfair Display';
  const accentColor = theme.accent_color || '#C5A059';
  const isPro = Boolean(profile.is_pro || theme.is_pro);
  const hasServicesOrProducts = Boolean(
    (theme.services && theme.services.length > 0) || (theme.products && theme.products.length > 0)
  );
  const showTabs = isPro || hasServicesOrProducts;

  const whatsappUrl = contact?.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`
    : null;
  const emailUrl = contact?.email ? `mailto:${contact.email}` : null;
  const phoneUrl = contact?.phone ? `tel:${contact.phone}` : null;

  return (
    <div className="flex flex-col items-center text-center w-full max-w-md mx-auto pt-4 pb-2 px-4 relative">
      {/* Banner / Cover photo if exists */}
      {profile.cover_url && (
        <div className="w-full h-36 rounded-3xl overflow-hidden mb-[-48px] relative shadow-lg">
          <Image
            src={profile.cover_url}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Avatar with Double Ring Accent */}
      <div className="relative mb-3 z-10">
        <div
          className="p-1 rounded-full border-2 shadow-xl backdrop-blur-md"
          style={{ borderColor: `${accentColor}55` }}
        >
          {profile.avatar_url ? (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/40 shadow-xl relative bg-neutral-900">
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/40 shadow-xl text-white"
              style={{ backgroundColor: accentColor }}
            >
              {getInitials(profile.display_name || profile.username)}
            </div>
          )}
        </div>
      </div>

      {/* Display Name + Verified Creator Badge */}
      <h1
        className={`text-2xl sm:text-3xl font-black tracking-normal mb-1 flex items-center justify-center gap-2 ${
          isLuxuryTheme ? 'font-serif' : ''
        }`}
        style={{ color: theme.text_color }}
      >
        <span>{profile.display_name}</span>
        {isPro && (
          <span
            className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black flex items-center justify-center shadow-md shrink-0"
            title="Créateur Vérifié PRO"
          >
            <svg className="w-3 h-3 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </h1>

      {/* Diamond Separator Ornament */}
      <div className="flex items-center gap-2 my-1" style={{ color: accentColor }}>
        <div className="w-6 h-[1px]" style={{ backgroundColor: `${accentColor}55` }} />
        <span className="text-[10px]">◆</span>
        <div className="w-6 h-[1px]" style={{ backgroundColor: `${accentColor}55` }} />
      </div>

      {/* Title & Company (Subtitle) */}
      {(profile.title || profile.company) && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold tracking-normal opacity-90 mb-2" style={{ color: theme.text_color }}>
          {profile.title && <span>{profile.title}</span>}
          {profile.title && profile.company && <span>·</span>}
          {profile.company && <span>{profile.company}</span>}
        </div>
      )}

      {/* Location / City */}
      {(theme.location || contact?.address) && (
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-normal opacity-85 mb-3" style={{ color: theme.text_color }}>
          <MapPin className="w-3.5 h-3.5 opacity-80" />
          <span>{theme.location || contact?.address}</span>
        </div>
      )}

      {/* Quick Action Icons Row (Realistic Icons8 3D) */}
      <div className="flex items-center justify-center gap-3.5 mb-5">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
            title="WhatsApp"
          >
            <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/5 dark:border-white/10 flex items-center justify-center p-2 group-hover:shadow-[0_6px_16px_rgba(37,211,102,0.25)] group-hover:ring-2 group-hover:ring-emerald-500/30 transition-all">
              <Image
                src="/icons/icons8-wa-3d-fluency.png"
                alt="WhatsApp"
                width={38}
                height={38}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
              />
            </div>
          </a>
        )}

        {phoneUrl && (
          <a
            href={phoneUrl}
            className="group relative flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
            title="Appeler"
          >
            <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/5 dark:border-white/10 flex items-center justify-center p-2 group-hover:shadow-[0_6px_16px_rgba(0,180,216,0.25)] group-hover:ring-2 group-hover:ring-sky-500/30 transition-all">
              <Image
                src="/icons/icons8-phone-3d-fluency.png"
                alt="Téléphone"
                width={38}
                height={38}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
              />
            </div>
          </a>
        )}

        {emailUrl && (
          <a
            href={emailUrl}
            className="group relative flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
            title="Email"
          >
            <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/5 dark:border-white/10 flex items-center justify-center p-2 group-hover:shadow-[0_6px_16px_rgba(234,67,53,0.25)] group-hover:ring-2 group-hover:ring-red-500/30 transition-all">
              <Image
                src="/icons/icons8-gmail-3d-fluency.png"
                alt="Email"
                width={38}
                height={38}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
              />
            </div>
          </a>
        )}
      </div>

      {/* Navigation Pill Switcher ([ PROFIL ] [ SERVICES ] [ BOUTIQUE ]) */}
      {showTabs && (
        <div
          className="w-full max-w-xs sm:max-w-sm p-1 rounded-2xl border flex items-center justify-between mb-4 shadow-2xs backdrop-blur-md"
          style={{
            backgroundColor: `${accentColor}12`,
            borderColor: `${accentColor}25`,
          }}
        >
          {(['profil', 'services', 'shop'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const tabLabel = tab === 'profil' ? 'Profil' : tab === 'services' ? 'Services' : 'Boutique';
            return (
              <button
                key={tab}
                onClick={() => onTabChange && onTabChange(tab)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'shadow-xs scale-[1.02]'
                    : 'opacity-65 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? accentColor : 'transparent',
                  color: isActive ? '#ffffff' : theme.text_color,
                }}
              >
                <span>{tabLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
