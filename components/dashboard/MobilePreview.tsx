'use client';

import React from 'react';
import { Profile, LinkItem, ContactInfo } from '@/types';
import { ThemeWrapper } from '@/components/public/ThemeWrapper';
import { ProfileHeader } from '@/components/public/ProfileHeader';
import { LinkButton } from '@/components/public/LinkButton';
import { VCardButton } from '@/components/public/VCardButton';
import { Smartphone } from '@/components/ui/Icons';

interface MobilePreviewProps {
  profile: Profile | null;
  links: LinkItem[];
  contact: ContactInfo | null;
}

export function MobilePreview({ profile, links, contact }: MobilePreviewProps) {
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-neutral-500 h-[640px]">
        <Smartphone className="w-12 h-12 mb-3 animate-pulse text-indigo-400" />
        <p>Chargement de l'aperçu mobile...</p>
      </div>
    );
  }

  const activeLinks = links.filter((l) => l.is_active).sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        <Smartphone className="w-4 h-4 text-indigo-400" />
        <span>Aperçu en direct (Smartphone)</span>
      </div>

      {/* Phone Outer Shell */}
      <div className="w-[320px] sm:w-[340px] h-[680px] rounded-[48px] bg-neutral-900 border-[10px] border-neutral-800 shadow-2xl overflow-hidden relative flex flex-col ring-1 ring-white/10">
        {/* Phone Speaker Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-neutral-800 rounded-b-xl z-30 flex items-center justify-center">
          <div className="w-12 h-1 bg-neutral-700 rounded-full" />
        </div>

        {/* Screen Content Wrapper */}
        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar pt-6">
          <ThemeWrapper theme={profile.theme}>
            <div className="flex flex-col items-center min-h-full px-4 pb-12">
              <ProfileHeader profile={profile} theme={profile.theme} />

              {/* Links List */}
              <div className="w-full flex flex-col items-center gap-2 mt-4">
                {activeLinks.length > 0 ? (
                  activeLinks.map((link) => (
                    <LinkButton key={link.id} link={link} theme={profile.theme} />
                  ))
                ) : (
                  <div className="p-4 text-center text-xs opacity-60 border border-dashed border-white/20 rounded-xl w-full max-w-md">
                    Aucun lien actif à afficher pour le moment
                  </div>
                )}
              </div>

              {/* VCard Button */}
              {contact && contact.show_save_contact_button && (
                <div className="w-full flex justify-center mt-3">
                  <VCardButton profile={profile} contact={contact} theme={profile.theme} />
                </div>
              )}
            </div>
          </ThemeWrapper>
        </div>
      </div>
    </div>
  );
}
