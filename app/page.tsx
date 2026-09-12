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
  Calendar,
  Check,
  Sparkles,
  Star,
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

      {/* Hero Section - Airy, Minimalist & Quiet Luxury */}
      <section className="relative pt-16 sm:pt-28 pb-20 sm:pb-28 px-4 flex flex-col items-center text-center bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.07),rgba(255,255,255,0))]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-50 border border-neutral-200/80 text-neutral-600 text-xs font-semibold mb-8 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Carte de visite digitale & profil professionnel</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[70px] font-black tracking-[-0.03em] text-neutral-950 mb-6 max-w-4xl leading-[1.08]">
            Tous vos liens, vos contacts et vos offres.{' '}
            <span className="text-neutral-400 font-extrabold">Sur une seule page.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-neutral-600 max-w-2xl mb-10 leading-relaxed font-normal">
            Partagez facilement votre univers professionnel. Vos interlocuteurs enregistrent votre fiche contact (<strong className="font-semibold text-neutral-900">.vcf</strong>) dans leur répertoire en un clic, réservent vos créneaux et découvrent vos services.
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
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 text-sm cursor-pointer"
              >
                <span>Créer ma page gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <a
              href="#demo"
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold rounded-xl text-sm transition-all border border-neutral-200/80 cursor-pointer"
            >
              Voir la démo interactive
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
      <section id="preview" className="py-20 sm:py-28 px-4 bg-slate-50/60 border-y border-neutral-200/60 scroll-mt-16">
        <div id="demo" className="sr-only" />
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200/80 text-neutral-700 text-xs font-semibold mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>SIMULATION INTERACTIVE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight mb-2.5">
              À quoi ressemble votre résultat ?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Testez la navigation ci-dessous comme si vous étiez directement sur le smartphone de votre client.
            </p>
          </div>

          {/* Real Interactive Widget */}
          <InteractiveLandingDemo />
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 sm:py-32 px-4 max-w-6xl mx-auto w-full scroll-mt-16">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold mb-3">
            <span>FONCTIONNALITÉS ESSENTIELLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 mb-3.5">
            Tout ce qu&apos;il vous faut pour être contacté rapidement
          </h2>
          <p className="text-sm sm:text-base text-neutral-500">
            Conçu sur-mesure pour remplacer les cartes papier et les listes de liens impersonnelles.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Fiche Contact .VCF (Large 2 Cols) */}
          <div className="md:col-span-2 p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 mb-2">
                  Enregistrement de contact direct (.vcf)
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md">
                  En un clic, vos interlocuteurs téléchargent votre fiche complète directement dans leur répertoire (iPhone Contacts ou Google Contacts) avec nom, numéro, WhatsApp, photo et réseaux. Zéro numéro mal recopié.
                </p>
              </div>

              {/* Visual Mini Mockup */}
              <div className="w-full sm:w-56 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs shrink-0 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    LB
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Fiche Contact Pro</div>
                    <div className="text-[10px] text-emerald-600 font-medium">✓ Format .vcf universel</div>
                  </div>
                </div>
                <div className="py-2 px-3 rounded-xl bg-neutral-900 text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enregistrer dans le tél</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500 pt-3 border-t border-neutral-100">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Compatible iPhone & Android</span>
              </span>
              <span>•</span>
              <span>Fonctionne 100% sans application</span>
            </div>
          </div>

          {/* Card 2: QR Code HD */}
          <div className="p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 mb-2">
                QR Code haute définition
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Téléchargez votre QR code vectoriel en haute résolution pour l&apos;imprimer sur vos cartes de visite, devis, vitrines ou stands de salon.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-bold text-indigo-600 flex items-center justify-between">
              <span>Format vectoriel SVG & PNG</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Appel & WhatsApp */}
          <div className="p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 mb-2">
                Appel & WhatsApp en 1 clic
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Appel direct, message WhatsApp pré-rédigé ou email. Vos prospects communiquent instantanément sans barrière.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-medium text-neutral-500">
              Message d&apos;accueil personnalisable
            </div>
          </div>

          {/* Card 4: Prise de RDV */}
          <div className="p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 mb-2">
                Prise de RDV & Calendrier
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Présentez vos forfaits de conseil, séances de coaching ou services avec réservation directe (Calendly, Google Meet).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-medium text-neutral-500">
              Synchronisation de votre agenda
            </div>
          </div>

          {/* Card 5: Boutique E-books */}
          <div className="p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 mb-2">
                Boutique & Produits PDF
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Vendez vos guides, templates ou fichiers numériques avec livraison automatique après paiement sécurisé.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-medium text-neutral-500">
              Paiement CB & Mobile Money
            </div>
          </div>

          {/* Card 6: Thèmes de Luxe (Large 2 Cols) */}
          <div className="md:col-span-2 p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950 mb-2">
                  Thèmes de luxe & 100% sans filigrane
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md">
                  Palettes élégantes (Linette Ivoire, Obsidienne, Noir Royal), typographies haut de gamme et nom de domaine dédié. Votre univers reste pur et soigné.
                </p>
              </div>

              {/* Theme Palette Dots */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border-2 border-amber-200 shadow-xs" title="Ivoire" />
                <div className="w-8 h-8 rounded-full bg-[#18181B] border-2 border-neutral-700 shadow-xs" title="Obsidienne" />
                <div className="w-8 h-8 rounded-full bg-[#0F172A] border-2 border-indigo-400 shadow-xs" title="Bleu Nuit" />
                <div className="w-8 h-8 rounded-full bg-[#064E3B] border-2 border-emerald-400 shadow-xs" title="Émeraude" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500 pt-3 border-t border-neutral-100">
              <span className="flex items-center gap-1.5 text-indigo-600">
                <BarChart3 className="w-4 h-4" />
                <span>Statistiques précises des clics & visites en temps réel</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table - Clean, Light & Objective */}
      <section className="py-20 sm:py-28 px-4 bg-slate-50/70 border-y border-neutral-200/70">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold mb-3">
              <span>COMPARATIF OBJECTIF</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 mb-3">
              Pourquoi choisir Lien-Bio ?
            </h2>
            <p className="text-sm text-neutral-500">
              Comparez les fonctionnalités concrètes face aux alternatives traditionnelles.
            </p>
          </div>

          {/* Clean Table Container */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-700">
                    <th className="p-4 sm:p-5 font-bold">Fonctionnalité</th>
                    <th className="p-4 sm:p-5 font-medium text-neutral-500 text-center">Carte papier</th>
                    <th className="p-4 sm:p-5 font-medium text-neutral-500 text-center">Linktree gratuit</th>
                    <th className="p-4 sm:p-5 font-black text-indigo-700 bg-indigo-50/60 text-center">
                      Lien-Bio PRO
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  <tr>
                    <td className="p-4 sm:p-5 font-medium">Fiche .vcf enregistrée dans le répertoire du téléphone</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-black bg-indigo-50/20">
                      ✓ En 1 clic
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium">Informations modifiables instantanément à tout moment</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold">✓</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-black bg-indigo-50/20">
                      ✓ Illimité
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium">QR Code HD permanent (ne change jamais)</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-black bg-indigo-50/20">
                      ✓ Vectoriel SVG
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium">Prise de RDV & synchronisation Calendly intégrée</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-black bg-indigo-50/20">
                      ✓ Inclus
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium">Boutique digitale & vente de fichiers PDF</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-black bg-indigo-50/20">
                      ✓ Inclus
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium">Design de luxe sans filigrane ni logo imposé</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-black bg-indigo-50/20">
                      ✓ 100% Marque blanche
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium">Nom de domaine personnalisé dédié (votre-nom.com)</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-neutral-300 font-bold">—</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-black bg-indigo-50/20">
                      ✓ Inclus PRO
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Témoignages */}
      <section className="py-24 sm:py-32 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold mb-3">
            <span>ILS EN PARLENT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 mb-3">
            Adopté par les créateurs & indépendants
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-7 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-6">
                « En rendez-vous, je fais simplement flasher mon QR Code. En 2 secondes, mon contact complet avec mon WhatsApp et ma photo est enregistré dans leur répertoire. C&apos;est 100 fois plus efficace qu&apos;une carte papier. »
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

          <div className="p-7 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-6">
                « J&apos;ai remplacé mon Linktree par Lien-Bio pour mon studio photo. Mes clients peuvent réserver directement leur séance et commander mes presets. Le design Linette est superbe. »
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

          <div className="p-7 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-6">
                « C&apos;est propre, rapide et sans fioritures. L&apos;enregistrement direct de la fiche contact dans le téléphone du prospect augmente radicalement le taux de rappel et de relance. »
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs">
                JB
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900">Julien B.</div>
                <div className="text-[11px] text-neutral-500">Directeur d&apos;Agence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 px-4 bg-slate-50/70 border-t border-neutral-200/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-200/80 text-neutral-700 text-xs font-semibold mb-3">
            <span>TARIFICATION CLAIRE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight mb-2">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold mb-3">
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

      {/* Final Call To Action Banner */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <div className="rounded-[36px] bg-neutral-950 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-neutral-800">
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Donnez une première impression inoubliable.
            </h2>

            <p className="text-sm sm:text-base text-neutral-400 mb-8 leading-relaxed">
              Créez votre carte de visite digitale et votre QR Code dès aujourd&apos;hui. Sans engagement, sans carte bancaire requise.
            </p>

            <Link
              href={user ? '/dashboard' : '/register'}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-sm sm:text-base transition-all shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
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
