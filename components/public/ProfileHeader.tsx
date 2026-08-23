'use client';

import React from 'react';
import Image from 'next/image';
import { Profile, ThemeConfig } from '@/types';
import { Building2, Briefcase } from '@/components/ui/Icons';

interface ProfileHeaderProps {
  profile: Profile;
  theme: ThemeConfig;
}

export function ProfileHeader({ profile, theme }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center text-center w-full max-w-md mx-auto pt-6 pb-4 px-4 relative">
      {/* Banner / Cover photo if exists */}
      {profile.cover_url && (
        <div className="w-full h-36 rounded-2xl overflow-hidden mb-[-48px] relative shadow-lg">
          <Image
            src={profile.cover_url}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Avatar */}
      <div className="relative mb-4 z-10">
        {profile.avatar_url ? (
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-xl relative bg-neutral-900">
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
            className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/20 shadow-xl text-white"
            style={{ backgroundColor: theme.accent_color || '#6366f1' }}
          >
            {getInitials(profile.display_name || profile.username)}
          </div>
        )}
      </div>

      {/* Display Name */}
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: theme.text_color }}>
        {profile.display_name}
      </h1>

      {/* Title & Company */}
      {(profile.title || profile.company) && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium opacity-90 mb-3">
          {profile.title && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4 opacity-75" />
              {profile.title}
            </span>
          )}
          {profile.title && profile.company && <span>•</span>}
          {profile.company && (
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4 opacity-75" />
              {profile.company}
            </span>
          )}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm opacity-80 max-w-xs leading-relaxed whitespace-pre-line mb-2">
          {profile.bio}
        </p>
      )}
    </div>
  );
}
