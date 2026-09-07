import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import {
  Sparkles,
  Download,
  QrCode,
  ArrowRight,
  Palette,
  CheckCircle2,
  PhoneCall,
  Zap,
  BarChart3,
  ShieldCheck,
  Smartphone,
  BookOpen,
  Star,
} from '@/components/ui/Icons';

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
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar user={user} profile={profile} />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 overflow-hidden flex flex-col items-center text-center bg-gradient-to-b from-slate-50/80 via-white to-white">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/8 to-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-48 left-1/4 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100/90 text-indigo-700 text-xs font-bold tracking-wide mb-6 shadow-xs backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Carte de Visite Digitale & Link-in-Bio Nouvelle Génération</span>
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-neutral-900 max-w-4xl">
            Un seul lien d'exception pour{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              tous vos contacts
            </span>{' '}
            & services.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-neutral-600 max-w-2xl mb-10 leading-relaxed font-normal">
            Créez votre page bio professionnelle en 1 minute. Téléchargement vCard instantané, QR Code haute définition, onglets Services & E-books et suivi des visites en temps réel.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-12">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base group"
              >
                <span>Accéder à mon Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base group"
              >
                <span>Créer ma carte gratuitement</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

            <a
              href="#preview"
              className="w-full sm:w-auto px-6 py-4 bg-neutral-100/80 hover:bg-neutral-150 border border-neutral-200/80 text-neutral-800 font-bold rounded-2xl flex items-center justify-center gap-2 transition text-sm sm:text-base"
            >
              <span>Voir un exemple en direct</span>
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold text-neutral-500">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-neutral-800 font-bold">4.9/5</span>
              <span>par +2 500 professionnels</span>
            </div>
            <div className="hidden sm:inline-block w-1 h-1 rounded-full bg-neutral-300" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conforme RGPD & Zéro publicité</span>
            </div>
            <div className="hidden sm:inline-block w-1 h-1 rounded-full bg-neutral-300" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Prêt en 60 secondes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mockup Showcase Section */}
      <section id="preview" className="pb-24 px-4 max-w-6xl mx-auto w-full">
        <div className="relative mx-auto max-w-4xl p-3 sm:p-5 rounded-3xl sm:rounded-[40px] bg-gradient-to-b from-neutral-100/90 to-slate-100/60 border border-neutral-200/80 shadow-2xl shadow-indigo-500/5">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200/60 mb-4 text-xs font-semibold text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="px-4 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 text-[11px] font-mono shadow-xs">
              https://lien.me/sophie.martin
            </div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Aperçu interactif</span>
            </div>
          </div>

          {/* Realistic Dual-column Showcase Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-4 sm:p-8">
            {/* Left Column: Key Highlights */}
            <div className="md:col-span-6 flex flex-col gap-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-bold w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Thème Ivoire & Or Prestige</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-snug">
                Sublimez votre présence et convertissez chaque rencontre en opportunité.
              </h3>

              <p className="text-sm text-neutral-600 leading-relaxed">
                Vos interlocuteurs scannent votre QR code ou cliquent sur votre lien pour accéder à votre univers : sauvegarde instantanée de votre contact (.vcf), vos réseaux, vos prises de rendez-vous et vos ventes d'e-books.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900">Enregistrement vCard en 1 clic :</span>
                    <span className="text-xs text-neutral-600 ml-1">Numéro, adresse, email et réseaux directement dans les contacts du smartphone.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900">Catalogue Services & Shop intégré :</span>
                    <span className="text-xs text-neutral-600 ml-1">Vendez vos e-books et proposez vos séances de coaching sans coder.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900">Statistiques de visite détaillées :</span>
                    <span className="text-xs text-neutral-600 ml-1">Suivez les vues quotidiennes et découvrez quels liens génèrent le plus de clics.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Mini Phone Frame */}
            <div className="md:col-span-6 flex justify-center">
              <div className="w-[300px] sm:w-[320px] rounded-[42px] bg-neutral-900 p-3 shadow-2xl border-4 border-neutral-800 ring-1 ring-black/10">
                <div className="w-full rounded-[34px] overflow-hidden bg-[#F7F3EC] text-[#1C1A17] p-4 flex flex-col items-center text-center shadow-inner">
                  {/* Mini Cover & Avatar */}
                  <div className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-700/20 to-amber-900/30 mb-[-24px] relative" />
                  <div className="w-16 h-16 rounded-full border-4 border-[#F7F3EC] overflow-hidden shadow-md bg-white relative z-10 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                      alt="Sophie Martin"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-extrabold text-sm text-[#1C1A17]">Sophie Martin</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-black">✓</span>
                    </div>
                    <p className="text-[11px] text-[#B8914D] font-bold">Fondatrice & Coach Business</p>
                  </div>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 gap-1.5 w-full my-3 p-2 rounded-xl bg-white/70 border border-[#B8914D]/20 text-[10px]">
                    <div>
                      <div className="font-extrabold text-xs text-[#B8914D]">12+</div>
                      <div className="text-[8px] text-neutral-500">Ans exp.</div>
                    </div>
                    <div className="border-x border-neutral-200">
                      <div className="font-extrabold text-xs text-[#B8914D]">2.4k</div>
                      <div className="text-[8px] text-neutral-500">Clients</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-[#B8914D]">9</div>
                      <div className="text-[8px] text-neutral-500">Programmes</div>
                    </div>
                  </div>

                  {/* Quick Action Contact Pills */}
                  <div className="flex gap-1.5 w-full mb-3">
                    <div className="flex-1 py-1.5 rounded-xl bg-[#EDE8DE] border border-[#B8914D]/25 text-[10px] font-bold text-[#1C1A17] flex items-center justify-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      <span>Appeler</span>
                    </div>
                    <div className="flex-1 py-1.5 rounded-xl bg-[#EDE8DE] border border-[#B8914D]/25 text-[10px] font-bold text-[#1C1A17] flex items-center justify-center gap-1">
                      <Download className="w-3 h-3 text-indigo-600" />
                      <span>vCard</span>
                    </div>
                  </div>

                  {/* Fake Links */}
                  <div className="flex flex-col gap-2 w-full">
                    <div className="w-full py-2 px-3 rounded-xl bg-white/80 border border-[#B8914D]/20 text-xs font-bold text-neutral-800 flex items-center justify-between shadow-xs">
                      <span>Prendre un rendez-vous (30 min)</span>
                      <ArrowRight className="w-3 h-3 text-[#B8914D]" />
                    </div>
                    <div className="w-full py-2 px-3 rounded-xl bg-white/80 border border-[#B8914D]/20 text-xs font-bold text-neutral-800 flex items-center justify-between shadow-xs">
                      <span>Guide Offert : Développer sa visibilité</span>
                      <ArrowRight className="w-3 h-3 text-[#B8914D]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-20 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fonctionnalités Clés</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 mb-3">
            Tout pour marquer les esprits dès le premier contact.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            Une boîte à outils complète pensée pour les professionnels indépendants et les créateurs exigeants.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: vCard */}
          <div className="bg-slate-50/70 border border-neutral-200/80 rounded-3xl p-7 flex flex-col justify-between hover:border-indigo-300/80 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-5">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Fichier Contact vCard (.vcf)</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Permettez à vos interlocuteurs d'enregistrer instantanément votre numéro, email, adresse et réseaux dans leur répertoire téléphonique en un seul tapotement.
              </p>
            </div>
          </div>

          {/* Card 2: QR Code */}
          <div className="bg-slate-50/70 border border-neutral-200/80 rounded-3xl p-7 flex flex-col justify-between hover:border-purple-300/80 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center mb-5">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">QR Code Haute Définition</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Générez et téléchargez votre QR code haute résolution en PNG vectorisé pour l'imprimer directement sur vos cartes de visite physiques, kakemonos ou vitrines.
              </p>
            </div>
          </div>

          {/* Card 3: Multi-onglets */}
          <div className="bg-slate-50/70 border border-neutral-200/80 rounded-3xl p-7 flex flex-col justify-between hover:border-emerald-300/80 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-5">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Multi-onglets Services & Boutique</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Ne vous limitez pas à une simple liste de liens. Affichez vos offres de prestation avec accordéons et vendez vos guides ou e-books directement depuis votre carte.
              </p>
            </div>
          </div>

          {/* Card 4: Drag & Drop */}
          <div className="bg-slate-50/70 border border-neutral-200/80 rounded-3xl p-7 flex flex-col justify-between hover:border-amber-300/80 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/10 text-amber-600 flex items-center justify-center mb-5">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Thèmes Luxe & Polices Google</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Personnalisez les couleurs, les arrondis, les effets de verre dépoli et choisissez parmi des typographies raffinées comme Playfair Display, Outfit ou Inter.
              </p>
            </div>
          </div>

          {/* Card 5: Analytics */}
          <div className="bg-slate-50/70 border border-neutral-200/80 rounded-3xl p-7 flex flex-col justify-between hover:border-rose-300/80 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Statistiques & Taux de Clics</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Mesurez l'impact de vos rencontres : consultez le graphique des visites jour par jour et identifiez avec précision les liens les plus performants.
              </p>
            </div>
          </div>

          {/* Card 6: Live Mobile Mockup */}
          <div className="bg-slate-50/70 border border-neutral-200/80 rounded-3xl p-7 flex flex-col justify-between hover:border-sky-300/80 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-sky-600/10 text-sky-600 flex items-center justify-center mb-5">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Aperçu Mobile en Temps Réel</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Visualisez chaque ajustement instantanément sur une maquette de smartphone interactive intégrée à votre tableau de bord d'administration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Lifetime Section */}
      <section id="pricing" className="py-20 px-4 bg-slate-50/60 border-y border-neutral-200/80">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Offre Exclusive À Vie</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight mb-4">
            Un investissement unique. Zéro abonnement récurrent.
          </h2>

          <p className="text-base text-neutral-600 max-w-xl mb-10">
            Commencez gratuitement dès aujourd'hui ou passez au forfait Pro à vie pour débloquer toutes les fonctionnalités avancées.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl text-left">
            {/* Free Plan */}
            <div className="bg-white border border-neutral-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Formule Découverte</span>
                <div className="mt-2 mb-4">
                  <span className="text-4xl font-black text-neutral-900">0 €</span>
                  <span className="text-xs text-neutral-500 ml-1">pour toujours</span>
                </div>
                <p className="text-xs text-neutral-600 mb-6">Idéal pour créer rapidement sa première carte de visite digitale.</p>

                <ul className="flex flex-col gap-3 text-xs text-neutral-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Page de profil avec URL personnalisée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Boutons de contact directs (Appel, WhatsApp)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Liens sociaux et personnalisés illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Génération de QR Code automatique</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full mt-8 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 text-xs font-bold text-center transition"
              >
                Créer gratuitement
              </Link>
            </div>

            {/* Pro Lifetime Plan */}
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden ring-1 ring-amber-400/30">
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider">
                Le plus populaire
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Accès Pro À Vie</span>
                <div className="mt-2 mb-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">186 $</span>
                  <span className="text-xs text-neutral-400">paiement unique</span>
                </div>
                <p className="text-xs text-neutral-400 mb-6">Toutes les fonctionnalités actuelles et futures, sans abonnement.</p>

                <ul className="flex flex-col gap-3 text-xs text-neutral-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Tout le plan gratuit inclus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Thèmes Luxe exclusifs (Or, Obsidienne, Poudré)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Boutique E-books & Guides en téléchargement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Catalogue de Services & Prise de RDV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Badge Créateur Vérifié officiel</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-neutral-950 text-xs font-black text-center transition shadow-lg shadow-amber-500/20"
              >
                Obtenir mon accès Pro à vie
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 border-t border-neutral-200 bg-white text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-neutral-900">Lien.me</span>
            <span>— Votre Carte de Visite Digitale</span>
          </div>

          <p>© {new Date().getFullYear()} Lien.me. Tous droits réservés.</p>

          <div className="flex items-center gap-5 text-neutral-600 font-semibold">
            <Link href="/login" className="hover:text-neutral-900 transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="hover:text-neutral-900 transition-colors">
              Inscription
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
