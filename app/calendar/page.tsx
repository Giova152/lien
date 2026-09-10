import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CalendarWorkspaceClient } from '@/components/calendar/CalendarWorkspaceClient';
import { Calendar, ArrowRight, CheckCircle2, ShieldCheck, Clock } from '@/components/ui/Icons';
import { Logo } from '@/components/ui/Logo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CalendarHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si l'utilisateur est connecté, afficher directement son espace de travail Calendar Pro
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      return (
        <CalendarWorkspaceClient
          initialProfile={profile}
          userEmail={user.email || ''}
        />
      );
    }
  }

  // Si non connecté, afficher la vitrine / page d'accueil de Calendar Pro
  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 font-sans flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <header className="w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Calendar Pro
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://lien-bio.site/login"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-1.5 transition"
            >
              Connexion
            </a>
            <a
              href="https://lien-bio.site/register"
              className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl transition shadow-2xs"
            >
              Créer mon compte
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-6">
          <Calendar className="w-7 h-7" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight max-w-2xl leading-tight mb-4">
          Votre prise de rendez-vous professionnelle en ligne.
        </h1>

        <p className="text-sm sm:text-base text-neutral-600 max-w-xl mb-8 leading-relaxed">
          Partagez votre agenda, définissez vos disponibilités et recevez vos réservations directement synchronisées avec votre profil.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-14">
          <a
            href="https://lien-bio.site/register"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
          >
            <span>Démarrer avec mon Agenda Pro</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="https://lien-bio.site/login"
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-800 font-semibold border border-neutral-200 rounded-xl text-xs transition shadow-2xs"
          >
            J'ai déjà un compte
          </a>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 mb-1">Créneaux automatiques</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Vos clients choisissent parmi vos plages horaires libres sans échange d'e-mails interminables.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 mb-1">Prise de RDV simplifiée</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Interface sans friction, rapide et parfaitement optimisée pour smartphone.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 mb-1">Inclus dans votre offre</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Pas besoin de payer un abonnement tiers supplémentaire (Calendly ou Cal.com).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 bg-white py-6 text-center text-xs text-neutral-400">
        <p>© {new Date().getFullYear()} Lien-Bio • Suite Agenda Pro</p>
      </footer>
    </div>
  );
}
