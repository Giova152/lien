import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { sanitizeUsername } from '@/lib/utils';
import { PublicProfileRenderer } from '@/components/public/PublicProfileRenderer';

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
  const { username } = await params;
  return <PublicProfileRenderer username={username} />;
}
