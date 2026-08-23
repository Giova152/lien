'use client';

import React, { useState } from 'react';
import { ThemeEditor } from '@/components/dashboard/ThemeEditor';
import { Profile, ThemeConfig } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_THEME } from '@/lib/utils';
import { toast } from 'sonner';

interface ThemePageProps {
  profile?: Profile;
  setProfile?: React.Dispatch<React.SetStateAction<Profile | null>>;
  refreshDashboard?: () => void;
}

export default function ThemePage({
  profile,
  setProfile,
  refreshDashboard,
}: ThemePageProps) {
  const supabase = createClient();

  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(
    profile?.theme || DEFAULT_THEME
  );
  const [saving, setSaving] = useState(false);

  const handleThemeChange = (updatedTheme: ThemeConfig) => {
    setCurrentTheme(updatedTheme);
    if (setProfile) {
      setProfile((prev) => (prev ? { ...prev, theme: updatedTheme } : prev));
    }
  };

  const handleSaveTheme = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({ theme: currentTheme })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Thème visuel mis à jour avec succès !');
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde du thème');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemeEditor
      theme={currentTheme}
      onChange={handleThemeChange}
      onSave={handleSaveTheme}
      saving={saving}
    />
  );
}
