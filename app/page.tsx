import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { Sparkles, Download, QrCode, ArrowRight, Palette } from '@/components/ui/Icons';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    profile = data;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans">
      <Navbar user={user} profile={profile} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden flex flex-col items-center text-center bg-gradient-to-b from-slate-50 via-white to-white">
        {/* Soft Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Votre Carte de Visite Digitale Nouvelle Génération</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6 text-neutral-900">
            Un seul lien pour <span className="text-indigo-600">tous vos contacts</span> et réseaux.
          </h1>

          <p className="text-base sm:text-xl text-neutral-600 max-w-2xl mb-8 leading-relaxed font-normal">
            Créez votre page bio professionnelle personnalisée en 1 minute. Téléchargement vCard, QR Code auto-généré, thèmes sur mesure et prévisualisation live.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition shadow-xl shadow-indigo-600/20 text-base"
              >
                <span>Accéder à mon Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition shadow-xl shadow-indigo-600/20 text-base"
              >
                <span>Créer ma page gratuitement</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-900 mb-3">
            Conçu pour les créateurs, indépendants & professionnels
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            Tout ce dont vous avez besoin pour faire une excellente première impression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 border border-neutral-200/80 rounded-3xl p-6 flex flex-col gap-3 hover:border-indigo-300 transition shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Fichier Contact vCard (.vcf)</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Vos contacts enregistrent directement votre numéro, email, adresse et réseaux dans leur répertoire en 1 clic.
            </p>
          </div>

          <div className="bg-slate-50 border border-neutral-200/80 rounded-3xl p-6 flex flex-col gap-3 hover:border-indigo-300 transition shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">QR Code Téléchargeable</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Générez et téléchargez votre QR code haute résolution pour l'imprimer sur vos cartes de visite physiques ou flyers.
            </p>
          </div>

          <div className="bg-slate-50 border border-neutral-200/80 rounded-3xl p-6 flex flex-col gap-3 hover:border-indigo-300 transition shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Éditeur de Thème Visuel</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Personnalisez les couleurs, boutons, typographies et sections (Profil, Services, Shop E-books) en temps réel.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-neutral-200 bg-slate-50 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Lien.me. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-neutral-600 font-medium">
            <Link href="/login" className="hover:text-neutral-900">Connexion</Link>
            <Link href="/register" className="hover:text-neutral-900">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
