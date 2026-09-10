import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { sanitizeUsername, slugify } from '@/lib/utils';
import { PublicBookingClient } from '@/components/calendar/PublicBookingClient';
import { UnpublishedProfileView } from '@/components/public/UnpublishedProfileView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CalendarBookingSlugProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: CalendarBookingSlugProps): Promise<Metadata> {
  const resolvedParams = await params;
  const username = sanitizeUsername(resolvedParams.username);
  const slug = resolvedParams.slug;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, title, bio, avatar_url, is_published, theme')
    .ilike('username', username)
    .maybeSingle();

  if (!profile || !profile.is_published) {
    return {
      title: 'Agenda indisponible — Lien-Bio',
    };
  }

  const service = (profile.theme?.services || []).find((s: any) => s.is_native_booking && slugify(s.title) === slug);
  const serviceName = service ? service.title : 'Rendez-vous';

  const title = `Réserver : ${serviceName} avec ${profile.display_name} | Agenda Pro`;
  const description = `Réservez votre créneau en ligne directement avec ${profile.display_name}.`;

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

export default async function CalendarBookingSlugPage({ params }: CalendarBookingSlugProps) {
  const resolvedParams = await params;
  const username = sanitizeUsername(resolvedParams.username);
  const slug = resolvedParams.slug;
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

  // Check if service exists
  const serviceExists = (profile.theme?.services || []).some((s: any) => s.is_native_booking && slugify(s.title) === slug);
  
  if (!serviceExists) {
    notFound();
  }

  return <PublicBookingClient profile={profile} serviceSlug={slug} />;
}
