import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { InteractiveLandingDemo } from '@/components/landing/InteractiveLandingDemo';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingComparison } from '@/components/landing/LandingComparison';
import { LandingUseCases } from '@/components/landing/LandingUseCases';
import { LandingPricingCards } from '@/components/landing/LandingPricingCards';
import { LandingFaq } from '@/components/landing/LandingFaq';
import {
  ArrowRight,
  Check,
} from '@/components/ui/Icons';
import { Logo } from '@/components/ui/Logo';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    profile = data;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      <Navbar user={user} profile={profile} />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-24 px-4 flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-neutral-600 text-xs font-semibold mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-neutral-900" />
            <span>Carte de visite digitale & profil professionnel</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-[-0.03em] text-neutral-950 mb-6 max-w-4xl leading-[1.08]">
            Tous vos liens, vos contacts et vos offres.{' '}
            <span className="text-neutral-400 font-extrabold">Sur une seule page.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mb-10 leading-relaxed font-normal">
            Partagez facilement votre univers professionnel. Vos interlocuteurs enregistrent votre fiche contact (<strong className="font-semibold text-neutral-900">.vcf</strong>) dans leur répertoire en un appui, réservent vos créneaux et découvrent vos prestations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-10">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md text-sm cursor-pointer"
              >
                <span>Accéder à mon tableau de bord</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md text-sm cursor-pointer"
              >
                <span>Créer ma page gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <a
              href="#preview"
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold rounded-xl text-sm transition-all border border-neutral-200/80 cursor-pointer"
            >
              Tester la démo
            </a>
          </div>

          {/* Reassurance points */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-neutral-900" />
              <span>Prêt en 2 minutes</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-neutral-900" />
              <span>Compatible iPhone & Android</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-neutral-900" />
              <span>Sans abonnement obligatoire</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Section */}
      <section id="preview" className="py-20 sm:py-28 px-4 bg-neutral-50/70 border-y border-neutral-200/70 scroll-mt-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Aperçu en situation réelle
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-neutral-950 tracking-tight mb-2.5">
              À quoi ressemble votre profil sur mobile ?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Testez la navigation ci-dessous comme si vous étiez directement sur le smartphone de votre interlocuteur.
            </p>
          </div>

          <InteractiveLandingDemo />
        </div>
      </section>

      {/* Dynamic Features Bento Grid */}
      <section id="features" className="py-24 sm:py-32 px-4 max-w-6xl mx-auto w-full scroll-mt-16">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Fonctionnalités essentielles
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 mb-3.5">
            Tout ce dont vous avez besoin pour être contacté
          </h2>
          <p className="text-sm sm:text-base text-neutral-500">
            Conçu pour remplacer les cartes en carton et les arborescences de liens lentes.
          </p>
        </div>

        <LandingFeatures />
      </section>

      {/* Real-World Use Cases */}
      <section className="py-24 sm:py-32 px-4 bg-neutral-50/70 border-y border-neutral-200/70">
        <div className="max-w-5xl mx-auto text-center">
          <div className="max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Usages quotidiens
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 mb-3">
              Pensé pour tous vos moments de rencontre
            </h2>
            <p className="text-sm text-neutral-500">
              Trois situations concrètes où Lien-Bio fait toute la différence.
            </p>
          </div>

          <LandingUseCases />
        </div>
      </section>

      {/* Modern Side-by-Side Comparison */}
      <section className="py-24 sm:py-32 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Comparaison concrète
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 mb-3">
            L&apos;ancienne méthode vs Lien-Bio
          </h2>
          <p className="text-sm text-neutral-500">
            Pourquoi abandonner les cartes papier et les listes basiques.
          </p>
        </div>

        <LandingComparison />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 px-4 bg-neutral-50/70 border-t border-neutral-200/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Tarifs clairs
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-950 tracking-tight mb-2">
            Des tarifs simples. Zéro frais cachés.
          </h2>
          <p className="text-sm text-neutral-500 mb-14 max-w-lg">
            Démarrez gratuitement sans carte bancaire ou passez au niveau supérieur avec nos formules PRO.
          </p>

          <LandingPricingCards user={user} />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 sm:py-32 px-4 max-w-5xl mx-auto w-full scroll-mt-16">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Foire aux questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 mb-3">
            Questions fréquentes
          </h2>
          <p className="text-sm text-neutral-500">
            Tout ce que vous devez savoir pour démarrer sereinement.
          </p>
        </div>

        <LandingFaq />
      </section>

      {/* Final Call To Action Banner */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl bg-neutral-950 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-xl border border-neutral-800">
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
              Créez votre profil professionnel dès aujourd&apos;hui
            </h2>

            <p className="text-sm sm:text-base text-neutral-400 mb-8 leading-relaxed">
              Votre carte de visite digitale et votre QR Code prêts en 2 minutes. Sans engagement, sans carte bancaire requise.
            </p>

            <Link
              href={user ? '/dashboard' : '/register'}
              className="px-8 py-3.5 bg-white hover:bg-neutral-100 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{user ? 'Accéder à mon espace' : 'Créer ma page gratuitement'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-6 mt-6 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-neutral-300" />
                <span>Gratuit à vie</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-neutral-300" />
                <span>Sans carte bancaire requise</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Craft Footer */}
      <footer className="w-full py-12 border-t border-neutral-200 bg-white text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Logo href="/" size="sm" showBadge={true} />
            <span className="text-neutral-300 hidden sm:inline">|</span>
            <span className="text-neutral-500">Carte de visite digitale & profil pro</span>
          </div>

          <div className="flex items-center gap-6 text-neutral-600 font-medium">
            <a href="#features" className="hover:text-neutral-900 transition">
              Fonctionnalités
            </a>
            <a href="#preview" className="hover:text-neutral-900 transition">
              Aperçu
            </a>
            <a href="#pricing" className="hover:text-neutral-900 transition">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-neutral-900 transition">
              FAQ
            </a>
          </div>

          <div className="text-neutral-400">
            © {new Date().getFullYear()} Lien-Bio. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
