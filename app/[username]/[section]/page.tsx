import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { sanitizeUsername } from '@/lib/utils';
import { PublicProfileView } from '@/components/public/PublicProfileView';
import { UnpublishedProfileView } from '@/components/public/UnpublishedProfileView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SectionPageProps {
  params: Promise<{ username: string; section: string }>;
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const username = sanitizeUsername(resolvedParams.username);
  const rawSection = (resolvedParams.section || '').toLowerCase();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, title, company, bio, avatar_url, is_published')
    .ilike('username', username)
    .maybeSingle();

  if (!profile || !profile.is_published) {
    return {
      title: 'Profil indisponible — Lien-Bio',
    };
  }

  let sectionLabel = 'Prestations';
  if (rawSection === 'coaching') sectionLabel = 'Coachings & Séances';
  else if (rawSection === 'accompagnement') sectionLabel = 'Accompagnements';
  else if (rawSection === 'formations' || rawSection === 'formation' || rawSection === 'cours') sectionLabel = 'Formations';
  else if (rawSection === 'shop') sectionLabel = 'Boutique';

  const title = `${profile.display_name} — ${sectionLabel}`;
  const description = profile.bio || `Découvrez les ${sectionLabel.toLowerCase()} proposées par ${profile.display_name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function PublicSectionPage({ params }: SectionPageProps) {
  const resolvedParams = await params;
  const username = sanitizeUsername(resolvedParams.username);
  const section = (resolvedParams.section || '').toLowerCase().trim();
  const supabase = await createClient();

  // If user requests /rdv or /agenda, forward directly to calendar.lien-bio.site
  if (section === 'rdv' || section === 'agenda' || section === 'calendar') {
    redirect(`https://calendar.lien-bio.site/${username}`);
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  // Check if caller is owner
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  // If profile unpublished
  if (!profile.is_published) {
    return (
      <UnpublishedProfileView
        isOwner={isOwner}
        profileId={profile.id}
        username={profile.username || username}
      />
    );
  }

  // Determine initialTab and initialCategory based on section
  let initialTab: 'profil' | 'services' | 'shop' = 'services';
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
  } else if (section === 'bio' || section === 'profil') {
    initialTab = 'profil';
  } else {
    // If unknown section, default to services with that category name
    initialTab = 'services';
    initialCategory = section;
  }

  // Fetch Links
  const { data: linksData } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true });

  const links = linksData || [];

  // Fetch Contact Info
  const { data: contact } = await supabase
    .from('contact_info')
    .select('*')
    .eq('profile_id', profile.id)
    .maybeSingle();

  // Client-side view tracker script
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

