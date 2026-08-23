'use client';

import React from 'react';
import Image from 'next/image';
import { Profile, ThemeConfig } from '@/types';
import { Facebook, Whatsapp, Tiktok, Mail, Instagram } from '@/components/ui/Icons';

interface ProfileHeaderProps {
  profile: Profile;
  theme: ThemeConfig;
  activeTab?: 'profil' | 'services' | 'shop';
  onTabChange?: (tab: 'profil' | 'services' | 'shop') => void;
}

export function ProfileHeader({ profile, theme, activeTab = 'profil', onTabChange }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isLuxuryTheme = theme.font_family === 'Playfair Display' || theme.background_value === '#FBF9F4';
  const accentColor = theme.accent_color || '#C5A059';

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

      {/* Display Name */}
      <h1
        className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 ${
          isLuxuryTheme ? 'font-serif' : ''
        }`}
        style={{ color: theme.text_color }}
      >
        {profile.display_name}
      </h1>

      {/* Diamond Separator Ornament */}
      <div className="flex items-center gap-2 my-1" style={{ color: accentColor }}>
        <div className="w-6 h-[1px]" style={{ backgroundColor: `${accentColor}55` }} />
        <span className="text-[10px]">◆</span>
        <div className="w-6 h-[1px]" style={{ backgroundColor: `${accentColor}55` }} />
      </div>

      {/* Title & Company (Subtitle) */}
      {(profile.title || profile.company) && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest opacity-80 mb-3" style={{ color: theme.text_color }}>
          {profile.title && <span>{profile.title}</span>}
          {profile.title && profile.company && <span>·</span>}
          {profile.company && <span>{profile.company}</span>}
        </div>
      )}

      {/* Quick Social Action Icons Row (Authentic Official SVG Logos) */}
      <div className="flex items-center justify-center gap-2.5 mb-4">
        {[
          { icon: Facebook, label: 'Facebook' },
          { icon: Whatsapp, label: 'WhatsApp' },
          { icon: Tiktok, label: 'TikTok' },
          { icon: Mail, label: 'Email' },
        ].map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <a
              key={idx}
              href="#"
              className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
              style={{ color: theme.text_color }}
              title={item.label}
            >
              <IconComponent className="w-4 h-4" />
            </a>
          );
        })}
      </div>

      {/* Navigation Pill Switcher ([ PROFIL ] [ SERVICES ] [ SHOP ]) */}
      <div className="w-full max-w-sm p-1 rounded-full bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-between mb-4 backdrop-blur-md">
        {(['profil', 'services', 'shop'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange && onTabChange(tab)}
              className={`flex-1 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? 'shadow-md scale-[1.02]'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isActive ? accentColor : 'transparent',
                color: isActive ? '#ffffff' : theme.text_color,
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
