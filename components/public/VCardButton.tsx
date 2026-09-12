'use client';

import React from 'react';
import { Profile, ContactInfo, ThemeConfig } from '@/types';
import { downloadVCard } from '@/lib/vcard';
import { Download } from '@/components/ui/Icons';

interface VCardButtonProps {
  profile: Profile;
  contact: ContactInfo | null;
  theme: ThemeConfig;
  label?: string;
}

export function VCardButton({ profile, contact, theme, label }: VCardButtonProps) {
  const handleSaveContact = () => {
    downloadVCard(profile, contact);
  };

  const accentColor = theme.accent_color || '#18181B';

  return (
    <button
      type="button"
      onClick={handleSaveContact}
      className="w-full max-w-sm py-3 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all transform hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] cursor-pointer"
      style={{
        backgroundColor: accentColor,
        color: '#ffffff',
      }}
    >
      <Download className="w-4 h-4" />
      <span>{label || 'Enregistrer le contact'}</span>
    </button>
  );
}
