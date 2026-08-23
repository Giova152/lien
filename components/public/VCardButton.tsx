'use client';

import React from 'react';
import { Profile, ContactInfo, ThemeConfig } from '@/types';
import { downloadVCard } from '@/lib/vcard';
import { Download } from '@/components/ui/Icons';

interface VCardButtonProps {
  profile: Profile;
  contact: ContactInfo | null;
  theme: ThemeConfig;
}

export function VCardButton({ profile, contact, theme }: VCardButtonProps) {
  const handleSaveContact = () => {
    downloadVCard(profile, contact);
  };

  return (
    <button
      onClick={handleSaveContact}
      className="w-full max-w-md my-2 py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2.5 shadow-md transition-all transform hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
      style={{
        backgroundColor: theme.accent_color || '#6366f1',
        color: '#ffffff',
      }}
    >
      <Download className="w-5 h-5" />
      <span>Enregistrer le contact</span>
    </button>
  );
}
