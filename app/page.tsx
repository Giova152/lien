import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { InteractiveLandingDemo } from '@/components/landing/InteractiveLandingDemo';
import { LandingPricingCards } from '@/components/landing/LandingPricingCards';
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
      <section className="relative pt-14 sm:pt-20 pb-16 px-4 flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold mb-6 border border-neutral-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Alternative simple et propre à Linktree</span>
          </div>

          {/* Headline - Direct and Natural */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 mb-5 max-w-3xl leading-[1.12]">
            Tous vos liens, vos contacts et vos offres. Sur une seule page.
          </h1>

          {/* Subheading - Realistic Value Proposition */}
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mb-8 leading-relaxed font-normal">
            Partagez facilement votre univers professionnel. Vos interlocuteurs enregistrent votre fiche contact (.vcf) dans leur téléphone en un clic, consultent vos prestations et découvrent vos projets.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-10">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-sm"
              >
                <span>Accéder à mon tableau de bord</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-sm"
              >
                <span>Créer ma page gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <a
              href="#demo"
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold rounded-xl text-sm transition border border-neutral-200/80"
            >
              Voir la démo interactive
            </a>
          </div>

          {/* Reassurance points */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-neutral-800" />
              <span>Prêt en 2 minutes</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-neutral-800" />
              <span>Compatible iPhone & Android</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-neutral-800" />
              <span>Sans abonnement obligatoire</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Section */}
      <section id="demo" className="py-12 px-4 bg-slate-50/60 border-y border-neutral-200/70">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-2">
              À quoi ressemble le résultat ?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md">
              Testez la navigation ci-dessous comme si vous étiez sur le smartphone de votre client.
            </p>
          </div>

          {/* Real Interactive Widget */}
          <InteractiveLandingDemo />
        </div>
      </section>

      {/* Features Grid - Clean & Human */}
      <section className="py-20 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mb-3">
            Tout ce qu'il vous faut pour être contacté rapidement
          </h2>
          <p className="text-sm text-neutral-500">
            Conçu pour remplacer les cartes papier et les listes de liens impersonnelles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Item 1 */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-5">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Boutons de contact direct
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Appel en un clic, message WhatsApp pré-rempli ou email. Vos clients n'ont pas à recopier votre numéro.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-5">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Enregistrement de contact (.vcf)
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Un bouton télécharge directement votre fiche complète dans le carnet d'adresses du téléphone avec nom, numéro et réseaux.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-5">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                QR Code haute définition
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Téléchargez votre QR code en haute résolution pour l'imprimer sur vos cartes de visite, vitrines, devis ou stands.
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Services & E-books intégrés
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Présentez vos tarifs de coaching, vos forfaits ou proposez vos guides PDF en téléchargement libre ou payant.
              </p>
            </div>
          </div>

          {/* Item 5 */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-5">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Thèmes soignés & Typographies
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Choisissez vos couleurs, vos arrondis et des polices élégantes (Playfair Display, Outfit, Inter) pour refléter votre univers.
              </p>
            </div>
          </div>

          {/* Item 6 */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 mb-5">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Statistiques simples
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Suivez le nombre de visites quotidiennes et identifiez les liens sur lesquels vos visiteurs cliquent le plus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Grounded & Clear */}
      <section id="pricing" className="py-20 px-4 bg-slate-50/70 border-t border-neutral-200/80">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">
            Des tarifs simples. Zéro frais cachés.
          </h2>
          <p className="text-sm text-neutral-500 mb-10">
            Démarrez sans carte bancaire ou passez au niveau supérieur avec nos 2 offres PRO.
          </p>

          <LandingPricingCards user={user} />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-neutral-200 bg-white text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" showBadge={true} />
            <span className="text-neutral-400 hidden sm:inline">|</span>
            <span className="text-neutral-500 hidden sm:inline">Carte de visite digitale & profil pro</span>
          </div>

          <p>© {new Date().getFullYear()} Lien-Bio. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

