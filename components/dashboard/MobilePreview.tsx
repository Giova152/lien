'use client';

import React from 'react';
import { Profile, LinkItem, ContactInfo } from '@/types';
import { ThemeWrapper } from '@/components/public/ThemeWrapper';
import { ProfileHeader } from '@/components/public/ProfileHeader';
import { LinkButton } from '@/components/public/LinkButton';
import { VCardButton } from '@/components/public/VCardButton';
import { Smartphone, Sparkles, Wifi, Battery, Signal } from '@/components/ui/Icons';

interface MobilePreviewProps {
  profile: Profile | null;
  links: LinkItem[];
  contact: ContactInfo | null;
}

export function MobilePreview({ profile, links, contact }: MobilePreviewProps) {
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-neutral-500 h-[660px] w-[340px]">
        <Smartphone className="w-12 h-12 mb-3 animate-pulse text-indigo-400 opacity-60" />
        <p className="text-xs font-medium">Chargement de l'aperçu mobile...</p>
      </div>
    );
  }

  const activeLinks = links.filter((l) => l.is_active).sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col items-center">
      {/* Title */}
      <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-400 shadow-sm">
        <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
        <span>Aperçu Smartphone Live</span>
      </div>

      {/* Realistic Smartphone Shell */}
      <div className="w-[320px] sm:w-[350px] h-[680px] rounded-[52px] bg-neutral-950 border-[10px] border-neutral-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative flex flex-col ring-1 ring-white/10">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2 gap-1.5 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-950 border border-indigo-500/40" />
        </div>

        {/* Status Bar */}
        <div className="w-full h-8 px-6 pt-1 flex items-center justify-between text-[10px] font-semibold text-white/80 z-20 select-none">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Scrollable Viewport */}
        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar pt-2">
          <ThemeWrapper theme={profile.theme}>
            <div className="flex flex-col items-center min-h-full px-4 pb-12">
              {/* Profile Header */}
              <ProfileHeader profile={profile} theme={profile.theme} />

              {/* Links List */}
              <div className="w-full flex flex-col items-center gap-2 mt-4">
                {activeLinks.length > 0 ? (
                  activeLinks.map((link) => (
                    <LinkButton key={link.id} link={link} theme={profile.theme} />
                  ))
                ) : (
                  <div className="p-5 text-center text-xs opacity-60 border border-dashed border-white/20 rounded-2xl w-full max-w-md">
                    Aucun lien actif pour le moment
                  </div>
                )}
              </div>

              {/* VCard Button */}
              {contact && contact.show_save_contact_button && (
                <div className="w-full flex justify-center mt-4">
                  <VCardButton profile={profile} contact={contact} theme={profile.theme} />
                </div>
              )}
            </div>
          </ThemeWrapper>
        </div>

        {/* Home Bar Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-30 pointer-events-none" />
      </div>
    </div>
  );
}
