import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { sanitizeUsername, slugify } from '@/lib/utils';
import { ServiceItem } from '@/types';
import { UnpublishedProfileView } from '@/components/public/UnpublishedProfileView';
import Link from 'next/link';
import { Clock, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CalendarBookingProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: CalendarBookingProps): Promise<Metadata> {
  const resolvedParams = await params;
  const username = sanitizeUsername(resolvedParams.username);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, title, bio, avatar_url, is_published')
    .ilike('username', username)
    .maybeSingle();

  if (!profile || !profile.is_published) {
    return {
      title: 'Agenda indisponible — Lien-Bio',
    };
  }

  const title = `Prendre rendez-vous avec ${profile.display_name} | Agenda Pro`;
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

export default async function CalendarDirectoryPage({ params }: CalendarBookingProps) {
  const resolvedParams = await params;
  const username = sanitizeUsername(resolvedParams.username);
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

  const nativeServices = (profile.theme?.services || []).filter((s: ServiceItem) => s.is_native_booking);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-100">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-24 h-24 rounded-full mx-auto mb-6 object-cover shadow-sm ring-4 ring-neutral-50"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-6 bg-neutral-100 flex items-center justify-center ring-4 ring-neutral-50">
                <span className="text-3xl text-neutral-400 font-medium">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-2">
              {profile.display_name}
            </h1>
            <p className="text-neutral-500 text-lg">
              Sélectionnez un type de rendez-vous
            </p>
          </div>

          {/* Service List */}
          {nativeServices.length > 0 ? (
            <div className="space-y-4">
              {nativeServices.map((service: ServiceItem) => {
                const serviceSlug = slugify(service.title);
                return (
                  <Link
                    key={service.id}
                    href={`/${username}/${serviceSlug}`}
                    className="block group bg-white border border-neutral-200 rounded-2xl p-6 hover:border-black hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-neutral-50 text-neutral-600 flex items-center justify-center shrink-0 group-hover:bg-neutral-100 transition-colors">
                          <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                            {service.title}
                          </h3>
                          <div className="flex items-center text-neutral-500 text-sm gap-4">
                            {service.duration_minutes && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{service.duration_minutes} min</span>
                              </div>
                            )}
                            {service.price && (
                              <div className="font-medium">
                                {service.price}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-neutral-100">
              <CalendarIcon className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500 text-lg">Aucun type de rendez-vous disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
