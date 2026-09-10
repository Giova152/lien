import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { sanitizeUsername } from '@/lib/utils';
import { PublicProfileRenderer } from '@/components/public/PublicProfileRenderer';

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
  const { username, section } = await params;
  return <PublicProfileRenderer username={username} section={section} />;
}

