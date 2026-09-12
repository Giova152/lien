import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { InteractiveLandingDemo } from '@/components/landing/InteractiveLandingDemo';
import { LandingPricingCards } from '@/components/landing/LandingPricingCards';
import { LandingFaq } from '@/components/landing/LandingFaq';
import {
  Download,
  QrCode,
  ArrowRight,
  Palette,
  CheckCircle2,
  PhoneCall,
  BarChart3,
  BookOpen,
  Smartphone,
  Check,
  Sparkles,
  ShieldCheck,
  Star,
  Globe,
  Calendar,
  Zap,
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
      <section className="relative pt-12 sm:pt-20 pb-20 px-4 flex flex-col items-center text-center overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(99,102,241,0.12),rgba(255,255,255,0))]">
        {/* Subtle Decorative Background Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          {/* Subtle Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50/90 border border-neutral-200/90 text-neutral-800 text-xs font-semibold mb-6 shadow-xs hover:border-indigo-300 transition-colors">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>La nouvelle référence pour vos liens & votre carte digitale</span>
            <ArrowRight className="w-3 h-3 text-neutral-400" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-neutral-950 mb-6 max-w-4xl leading-[1.08]">
            Tous vos liens, contacts et offres.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 bg-clip-text text-transparent">
              Sur une seule page.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-neutral-600 max-w-2xl mb-8 leading-relaxed font-normal">
            Partagez facilement votre univers professionnel. Vos interlocuteurs enregistrent votre fiche contact (<strong className="font-semibold text-neutral-900">.vcf</strong>) dans leur répertoire en un clic, réservent vos créneaux et découvrent vos services.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-10">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                <span>Accéder à mon tableau de bord</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                <span>Créer ma page gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <a
              href="#demo"
              className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-neutral-50 text-neutral-800 font-bold rounded-2xl text-sm transition-all border border-neutral-200/90 shadow-xs hover:border-neutral-300"
            >
              Tester la démo interactive
            </a>
          </div>

          {/* Social Proof Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div className="flex -space-x-2">
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Utilisatrice Lien-Bio"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Utilisateur Lien-Bio"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs"
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                alt="Utilisatrice Lien-Bio"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                alt="Utilisateur Lien-Bio"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-600">
                Rejoint par <strong>+1 200 créateurs & indépendants</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Section */}
      <section id="preview" className="py-16 px-4 bg-slate-50/70 border-y border-neutral-200/70 scroll-mt-16 relative">
        <div id="demo" className="sr-only" />
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIMULATION INTERACTIVE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-2.5">
              À quoi ressemble votre page ?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Testez la navigation ci-dessous comme si vous étiez directement sur le smartphone de votre client.
            </p>
          </div>

          {/* Interactive Mobile Widget */}
          <InteractiveLandingDemo />
        </div>
      </section>

      {/* Bento Grid Features - Premium & Asymmetric */}
      <section id="features" className="py-24 px-4 max-w-6xl mx-auto w-full scroll-mt-16">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold mb-3">
            <span>FONCTIONNALITÉS ESSENTIELLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 mb-3.5">
            Tout ce qu'il vous faut pour être contacté immédiatement
          </h2>
          <p className="text-sm sm:text-base text-neutral-500">
            Conçu sur-mesure pour remplacer les cartes papier et les listes de liens impersonnelles.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Fiche Contact .VCF (Large 2 Cols) */}
          <div className="md:col-span-2 p-7 sm:p-8 rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white via-white to-slate-50 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-neutral-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 mb-5 shadow-xs">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 mb-2">
                  Enregistrement de contact direct (.vcf)
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md">
                  En un seul clic, votre client télécharge votre fiche complète directement dans son carnet d'adresses (iPhone Contacts ou Google Contacts) avec nom, numéro, WhatsApp, photo et réseaux. Zéro numéro mal recopié.
                </p>
              </div>

              {/* Visual Mini Mockup */}
              <div className="w-full sm:w-56 p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-sm shrink-0 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    LB
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Fiche Contact Pro</div>
                    <div className="text-[10px] text-emerald-600 font-medium">✓ Format .vcf iOS & Android</div>
                  </div>
                </div>
                <div className="py-2 px-3 rounded-xl bg-neutral-900 text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enregistrer dans le tél</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-neutral-500 pt-2 border-t border-neutral-100">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Compatible iPhone & Android</span>
              </span>
              <span>•</span>
              <span>100% Hors ligne</span>
            </div>
          </div>

          {/* Card 2: QR Code HD */}
          <div className="p-7 sm:p-8 rounded-3xl border border-neutral-200/90 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-600 mb-5 shadow-xs">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 mb-2">
                QR Code haute définition
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Téléchargez votre QR code en haute résolution vectorielle pour vos cartes de visite, devis, vitrines ou stands de salon.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Format vectoriel SVG & PNG HD</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Boutons Appel & WhatsApp */}
          <div className="p-7 sm:p-8 rounded-3xl border border-neutral-200/90 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 mb-5 shadow-xs">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 mb-2">
                Appel & WhatsApp en 1 clic
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Appel direct, message WhatsApp pré-rédigé ou email. Vos prospects communiquent instantanément avec vous sans barrière.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-bold text-neutral-500">
              Message d&apos;accueil pré-configuré
            </div>
          </div>

          {/* Card 4: Services & Prise de RDV */}
          <div className="p-7 sm:p-8 rounded-3xl border border-neutral-200/90 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 mb-5 shadow-xs">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 mb-2">
                Prise de RDV & Calendrier
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Affichez vos forfaits de conseil, coaching ou prestations avec lien de réservation directe (Calendly, Google Meet).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-bold text-neutral-500">
              Synchronisation d&apos;agenda direct
            </div>
          </div>

          {/* Card 5: Boutique Digitale */}
          <div className="p-7 sm:p-8 rounded-3xl border border-neutral-200/90 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 mb-5 shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 mb-2">
                Boutique E-books & Guides PDF
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Vendez vos guides, templates ou fichiers numériques directement sur votre page avec paiement sécurisé CB et Mobile Money.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-bold text-neutral-500">
              Livraison automatique après achat
            </div>
          </div>

          {/* Card 6: Thèmes de Luxe & Analytics (Large 2 Cols) */}
          <div className="md:col-span-2 p-7 sm:p-8 rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white via-white to-slate-50 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-600 mb-5 shadow-xs">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 mb-2">
                  Thèmes de luxe & 100% sans filigrane
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md">
                  Palettes élégantes (Linette Ivoire, Obsidienne, Noir Royal, Blanc Pur), typographies haut de gamme et nom de domaine dédié. Votre image de marque reste immaculée.
                </p>
              </div>

              {/* Theme Color Palette Preview */}
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-sm shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border-2 border-amber-200 shadow-xs" title="Ivoire" />
                <div className="w-8 h-8 rounded-full bg-[#18181B] border-2 border-neutral-700 shadow-xs" title="Obsidienne" />
                <div className="w-8 h-8 rounded-full bg-[#0F172A] border-2 border-indigo-400 shadow-xs" title="Bleu Nuit" />
                <div className="w-8 h-8 rounded-full bg-[#064E3B] border-2 border-emerald-400 shadow-xs" title="Émeraude" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-neutral-500 pt-2 border-t border-neutral-100">
              <span className="flex items-center gap-1.5 text-indigo-600">
                <BarChart3 className="w-4 h-4" />
                <span>Statistiques de clics & provenance en temps réel</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section: Pourquoi Lien-Bio ? */}
      <section className="py-20 px-4 bg-neutral-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold mb-3">
              <span>COMPARATIF CLAIR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
              Pourquoi choisir Lien-Bio ?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Comparez avec les cartes papier traditionnelles et les listes de liens génériques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* 1. Carte Papier */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Traditionnel
                </span>
                <h3 className="text-lg font-black text-white mb-4">Carte de visite papier</h3>
                <ul className="flex flex-col gap-3 text-xs text-neutral-400">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Coûteux à imprimer et réimprimer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Se perd, s&apos;abîme ou finit à la poubelle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Le client doit recopier votre numéro à la main</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Impossible à modifier une fois imprimé</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-800 text-[11px] text-neutral-500 font-semibold">
                Obsolète dès qu&apos;un contact change
              </div>
            </div>

            {/* 2. Linktree Basique */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Agrégateur classique
                </span>
                <h3 className="text-lg font-black text-white mb-4">Linktree & outils basiques</h3>
                <ul className="flex flex-col gap-3 text-xs text-neutral-400">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Aucun enregistrement automatique dans le téléphone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Logo de la plateforme imposé en bas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Boutons rectangulaires impersonnels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Pas de boutique e-book ni de calendrier direct</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-800 text-[11px] text-neutral-500 font-semibold">
                Une simple liste de liens froids
              </div>
            </div>

            {/* 3. Lien-Bio PRO */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-neutral-900 border-2 border-indigo-500 shadow-xl flex flex-col justify-between relative ring-2 ring-indigo-500/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                ⭐ La Solution Complète
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                  Lien-Bio
                </span>
                <h3 className="text-lg font-black text-white mb-4">Profil & Carte Digitale</h3>
                <ul className="flex flex-col gap-3 text-xs text-neutral-200">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Fiche .vcf enregistrée en 1 clic</strong> dans l&apos;iPhone / Android</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>QR Code HD permanent</strong> (modifiable à tout moment)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Boutique PDF & Prise de RDV</strong> intégrées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Thèmes de luxe sur-mesure</strong> sans filigrane</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-800 text-[11px] text-indigo-400 font-bold">
                Le réflexe moderne pour développer votre réseau
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Témoignages */}
      <section className="py-20 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold mb-3">
            <span>ILS EN PARLENT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 mb-3">
            Adopté par les professionnels exigeants
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl border border-neutral-200/90 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-6">
                « En rendez-vous client, je fais simplement flasher mon QR Code. En 2 secondes, mon contact complet avec mon WhatsApp et ma photo est enregistré dans leur répertoire. C&apos;est infiniment plus efficace qu&apos;une carte papier. »
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                MD
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900">Marc Delcourt</div>
                <div className="text-[11px] text-neutral-500">Consultant en Stratégie</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-neutral-200/90 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-6">
                « J&apos;ai remplacé mon Linktree par Lien-Bio pour mon activité photo. Mes clients peuvent réserver leur séance et commander directement mes presets. Le design Linette est sublime. »
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-900 font-bold flex items-center justify-center text-xs">
                AK
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900">Amina K.</div>
                <div className="text-[11px] text-neutral-500">Photographe Éditoriale</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-neutral-200/90 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-6">
                « Tout est propre, rapide et sans fioritures. L&apos;enregistrement direct de la fiche contact dans le téléphone du prospect augmente radicalement le taux de retour et de relance. »
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs">
                JB
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900">Julien B.</div>
                <div className="text-[11px] text-neutral-500">Directeur d&apos;Agence Web</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-slate-50/70 border-t border-neutral-200/80 scroll-mt-16">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-200/80 text-neutral-700 text-xs font-bold mb-3">
            <span>TARIFICATION CLAIRE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight mb-2">
            Des tarifs simples. Zéro frais cachés.
          </h2>
          <p className="text-sm text-neutral-500 mb-12 max-w-lg">
            Démarrez gratuitement sans carte bancaire ou passez au niveau supérieur avec nos formules PRO.
          </p>

          <LandingPricingCards user={user} />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 max-w-5xl mx-auto w-full scroll-mt-16">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold mb-3">
            <span>RÉPONSES À VOS QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 mb-3">
            Foire Aux Questions
          </h2>
          <p className="text-sm text-neutral-500">
            Tout ce que vous devez savoir pour démarrer sereinement.
          </p>
        </div>

        <LandingFaq />
      </section>

      {/* Final Irresistible Call To Action Card */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <div className="rounded-[36px] bg-neutral-950 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-neutral-800">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-5 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prêt en moins de 2 minutes</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Donnez une première impression inoubliable.
            </h2>

            <p className="text-sm sm:text-base text-neutral-400 mb-8 leading-relaxed">
              Créez votre carte de visite digitale et votre QR Code dès aujourd&apos;hui. Sans engagement, sans carte bancaire requise.
            </p>

            <Link
              href={user ? '/dashboard' : '/register'}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-sm sm:text-base transition-all shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{user ? 'Accéder à mon espace' : 'Créer ma page gratuitement'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-6 mt-6 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gratuit à vie</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sans carte bancaire</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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

          <div className="flex items-center gap-2 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Tous les systèmes opérationnels</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
