import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { sanitizeUsername } from '@/lib/utils';
import { ProfileHeader } from '@/components/public/ProfileHeader';
import { LinkButton } from '@/components/public/LinkButton';
import { VCardButton } from '@/components/public/VCardButton';
import { QrCodeModal } from '@/components/public/QrCodeModal';
import { ThemeWrapper } from '@/components/public/ThemeWrapper';
import { ShieldAlert, Sparkles } from '@/components/ui/Icons';
import Link from 'next/link';

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
      title: 'Profil indisponible — Lien.me',
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

  // If unpublished and not owner, display unavailable message
  if (!profile.is_published && !isOwner) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Ce profil n'est pas disponible</h1>
        <p className="text-sm text-neutral-400 max-w-sm mb-6">
          Ce profil a été temporairement dépublié par son propriétaire ou n'est plus accessible.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-medium text-xs rounded-xl transition"
        >
          Retour à l'accueil
        </Link>
      </div>
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

  // Client-side view tracker script trigger script
  const trackViewScript = `
    (function() {
      try {
        fetch('/api/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: '${profile.id}' })
        }).catch(function(){});
      } catch(e){}
    })();
  `;

  return (
    <ThemeWrapper theme={profile.theme}>
      <script dangerouslySetInnerHTML={{ __html: trackViewScript }} />

      <div className="min-h-screen w-full flex flex-col items-center px-4 pb-20 pt-4">
        {/* Unpublished Warning Badge for Owner */}
        {!profile.is_published && isOwner && (
          <div className="w-full max-w-md bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-semibold text-center mb-4 flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Mode Aperçu : Votre profil est actuellement masqué au public.</span>
          </div>
        )}

        {/* Profile Header */}
        <ProfileHeader profile={profile} theme={profile.theme} />

        {/* Links List */}
        <div className="w-full flex flex-col items-center gap-2 mt-4">
          {links.length > 0 ? (
            links.map((link) => (
              <LinkButton key={link.id} link={link} theme={profile.theme} />
            ))
          ) : (
            <div className="p-6 text-center text-xs opacity-60 border border-dashed border-white/20 rounded-xl w-full max-w-md">
              Aucun lien pour le moment.
            </div>
          )}
        </div>

        {/* VCard Download Button */}
        {contact && contact.show_save_contact_button && (
          <div className="w-full flex justify-center mt-3">
            <VCardButton profile={profile} contact={contact} theme={profile.theme} />
          </div>
        )}

        {/* QR Code Modal Trigger */}
        <QrCodeModal profile={profile} />

        {/* Branding Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-[11px] font-medium opacity-70 hover:opacity-100 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Créé avec Lien.me</span>
          </Link>
        </div>
      </div>
    </ThemeWrapper>
  );
}
