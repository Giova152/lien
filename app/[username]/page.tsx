import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { sanitizeUsername } from '@/lib/utils';
import { PublicProfileView } from '@/components/public/PublicProfileView';
import { UnpublishedProfileView } from '@/components/public/UnpublishedProfileView';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PublicProfileProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PublicProfileProps): Promise<Metadata> {
  const resolvedParams = await params;
  const username = sanitizeUsername(resolvedParams.username);
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

  const title = `${profile.display_name}${profile.title ? ` — ${profile.title}` : ''} | Carte digitale`;
  const description = profile.bio || `Consultez la carte de visite et les liens de ${profile.display_name}.`;

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

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const resolvedParams = await params;
  const username = sanitizeUsername(resolvedParams.username);
  const supabase = await createClient();

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

  // Si le profil est masqué, la page publique ne doit pas afficher le contenu du profil
  if (!profile.is_published) {
    return (
      <UnpublishedProfileView
        isOwner={isOwner}
        profileId={profile.id}
        username={profile.username || username}
      />
    );
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

  // Client-side view tracker script with device and timezone hints
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
      <PublicProfileView profile={normalizedProfile} links={links} contact={contact} isOwner={isOwner} />
    </>
  );
}
