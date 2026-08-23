import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { Sparkles, Smartphone, Download, QrCode, ArrowRight, ShieldAlert, CheckCircle2, Palette, Layers, BarChart3 } from '@/components/ui/Icons';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    profile = data;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
      <Navbar user={user} profile={profile} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden flex flex-col items-center text-center">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xl">
            <Sparkles className="w-4 h-4" />
            <span>Votre Carte de Visite Digitale Nouvelle Génération</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
            Un seul lien pour <span className="text-indigo-500">tous vos contacts</span> et réseaux.
          </h1>

          <p className="text-base sm:text-xl text-neutral-400 max-w-2xl mb-8 leading-relaxed">
            Créez votre page bio professionnelle personnalisée en 1 minute. Téléchargement vCard, QR Code auto-généré, thèmes sur mesure et prévisualisation live.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition shadow-xl shadow-indigo-600/30 text-base"
              >
                <span>Accéder à mon Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition shadow-xl shadow-indigo-600/30 text-base"
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
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">
            Conçu pour les créateurs, indépendants & professionnels
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Tout ce dont vous avez besoin pour faire une excellente première impression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col gap-3 hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Fichier Contact vCard (.vcf)</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Vos contacts enregistrent directement votre numéro, email, adresse et réseaux dans leur répertoire en 1 clic.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col gap-3 hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">QR Code Téléchargeable</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Générez et téléchargez votre QR code haute résolution pour l'imprimer sur vos cartes de visite physiques ou flyers.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col gap-3 hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Éditeur de Thème Visuel</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Personnalisez les couleurs, dégradés, polices et formes des boutons avec un aperçu smartphone en direct.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-800 py-8 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Lien.me — Carte de visite digitale & Link in bio.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white transition">Connexion</Link>
            <Link href="/register" className="hover:text-white transition">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
