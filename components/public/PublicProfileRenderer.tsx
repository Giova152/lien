import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { sanitizeUsername } from '@/lib/utils';
import { PublicProfileView } from '@/components/public/PublicProfileView';
import { UnpublishedProfileView } from '@/components/public/UnpublishedProfileView';

interface PublicProfileRendererProps {
  username: string;
  section?: string;
}

export async function PublicProfileRenderer({ username: rawUsername, section: rawSection }: PublicProfileRendererProps) {
  const username = sanitizeUsername(rawUsername);
  const section = (rawSection || '').toLowerCase().trim();

  // Redirection immédiate pour /rdv, /agenda ou /calendar
  if (section === 'rdv' || section === 'agenda' || section === 'calendar') {
    redirect(`https://calendar.lien-bio.site/${username}`);
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  if (!profile.is_published) {
    return (
      <UnpublishedProfileView
        isOwner={isOwner}
        profileId={profile.id}
        username={profile.username || username}
      />
    );
  }

  let initialTab: 'profil' | 'services' | 'shop' = 'profil';
  let initialCategory: string | undefined = undefined;

  if (section === 'coaching') {
    initialTab = 'services';
    initialCategory = 'Coaching';
  } else if (section === 'accompagnement') {
    initialTab = 'services';
    initialCategory = 'Accompagnement';
  } else if (
    section === 'formations' ||
    section === 'formation' ||
    section === 'cours' ||
    section === 'shop' ||
    section === 'boutique'
  ) {
    initialTab = 'shop';
  } else if (section === 'services' || section === 'offres' || section === 'prestations') {
    initialTab = 'services';
  } else if (section) {
    initialTab = 'services';
    initialCategory = section;
  }

  const { data: linksData } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true });

  const links = linksData || [];

  const { data: contact } = await supabase
    .from('contact_info')
    .select('*')
    .eq('profile_id', profile.id)
    .maybeSingle();

  const trackViewScript = `
    (function() {
      try {
        var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.innerWidth < 768);
        var deviceType = isMobile ? 'mobile' : 'desktop';
        var tz = '';
        try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch(e){}
        fetch('/api/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: '${profile.id}',
            device: deviceType,
            referrer: document.referrer || '',
            timezone: tz
          })
        }).catch(function(){});
      } catch(e){}
    })();
  `;

  const normalizedProfile = {
    ...profile,
    is_pro: Boolean(profile.is_pro || profile.theme?.is_pro),
    theme: {
      ...profile.theme,
      font_family:
        !profile.theme?.font_family || profile.theme?.font_family === 'Outfit'
          ? 'Arial'
          : profile.theme.font_family,
    },
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: trackViewScript }} />
      <PublicProfileView
        profile={normalizedProfile}
        links={links}
        contact={contact}
        isOwner={isOwner}
        initialTab={initialTab}
        initialCategory={initialCategory}
      />
    </>
  );
}

