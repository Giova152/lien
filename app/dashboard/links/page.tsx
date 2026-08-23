'use client';

import React from 'react';
import { LinkEditor } from '@/components/dashboard/LinkEditor';
import { LinkItem } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useDashboard } from '@/lib/context/DashboardContext';
import { toast } from 'sonner';

export default function LinksPage() {
  const { profile, links, setLinks, refreshDashboard } = useDashboard();
  const supabase = createClient();

  const handleLinksChange = (updated: LinkItem[]) => {
    if (setLinks) setLinks(updated);
  };

  const handleSaveLink = async (linkData: Partial<LinkItem>) => {
    if (!profile) {
      toast.error('Profil non chargé. Veuillez rafraîchir la page.');
      return;
    }

    if (linkData.id) {
      // Update
      const { error } = await supabase
        .from('links')
        .update(linkData)
        .eq('id', linkData.id);

      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase.from('links').insert({
        profile_id: profile.id,
        label: linkData.label,
        url: linkData.url,
        platform: linkData.platform || 'website',
        type: linkData.type || 'custom',
        position: linkData.position ?? links.length,
        is_active: linkData.is_active ?? true,
      });

      if (error) throw error;
    }

    if (refreshDashboard) refreshDashboard();
  };

  const handleDeleteLink = async (linkId: string) => {
    const { error } = await supabase.from('links').delete().eq('id', linkId);
    if (error) throw error;
    if (refreshDashboard) refreshDashboard();
  };

  const handleReorderLinks = async (reorderedLinks: LinkItem[]) => {
    const updates = reorderedLinks.map((l) =>
      supabase.from('links').update({ position: l.position }).eq('id', l.id)
    );
    await Promise.all(updates);
    if (refreshDashboard) refreshDashboard();
  };

  return (
    <LinkEditor
      links={links}
      onLinksChange={handleLinksChange}
      onSaveLink={handleSaveLink}
      onDeleteLink={handleDeleteLink}
      onReorderLinks={handleReorderLinks}
    />
  );
}
