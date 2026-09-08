'use client';

import React from 'react';
import { Profile, LinkItem, ContactInfo } from '@/types';
import { PublicProfileView } from '@/components/public/PublicProfileView';
import { Smartphone, Signal, Wifi, Battery } from '@/components/ui/Icons';
import { LogoIcon } from '@/components/ui/Logo';

interface MobilePreviewProps {
  profile: Profile | null;
  links: LinkItem[];
  contact: ContactInfo | null;
}

export function MobilePreview({ profile, links, contact }: MobilePreviewProps) {
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-neutral-200/80 rounded-[48px] text-neutral-400 h-[680px] w-[340px] shadow-sm">
        <LogoIcon size="lg" className="mb-3 animate-pulse" />
        <p className="text-xs font-semibold text-neutral-500">Chargement de l'aperçu mobile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Title Badge */}
      <div className="flex items-center gap-2 mb-3.5 px-3 py-1 rounded-full bg-white border border-neutral-200/80 text-[11px] font-bold text-neutral-700 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
        <span>Aperçu Mobile en Direct</span>
      </div>

      {/* Realistic Smartphone Shell (Titanium Style) */}
      <div className="w-[320px] sm:w-[350px] h-[690px] rounded-[52px] bg-neutral-900 border-[9px] border-neutral-900 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden relative flex flex-col ring-1 ring-black/10">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2 gap-1.5 shadow-inner pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-neutral-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-950 border border-indigo-500/40" />
        </div>

        {/* Status Bar */}
        <div className="w-full h-8 px-6 pt-1 flex items-center justify-between text-[10px] font-semibold text-neutral-800 z-20 select-none pointer-events-none">
          <span className="font-medium">09:41</span>
          <div className="flex items-center gap-1.5 opacity-80">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Scrollable Viewport */}
        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar">
          <PublicProfileView profile={profile} links={links} contact={contact} />
        </div>

        {/* Home Bar Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/30 rounded-full z-30 pointer-events-none" />
      </div>
    </div>
  );
}
