'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, LayoutDashboard } from '@/components/ui/Icons';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  user?: any;
  profile?: any;
}

export function Navbar({ user, profile }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="w-full border-b border-neutral-200/70 bg-white/75 backdrop-blur-xl sticky top-0 z-40 supports-[backdrop-filter]:bg-white/60 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-neutral-900 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5 group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-sans">Lien<span className="text-indigo-600 font-black">-Bio</span></span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-600">
          <a href="#features" className="hover:text-neutral-900 transition-colors">Fonctionnalités</a>
          <a href="#preview" className="hover:text-neutral-900 transition-colors">Aperçu Live</a>
          <a href="#pricing" className="hover:text-neutral-900 transition-colors">Tarif Unique</a>
        </nav>

        {/* Auth Buttons / Profile Nav */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              {profile?.username && (
                <Link
                  href={`/${profile.username}`}
                  target="_blank"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 px-3.5 py-2 rounded-xl bg-neutral-100/80 hover:bg-neutral-100 border border-neutral-200/80 transition"
                >
                  <span>Mon profil public</span>
                </Link>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-all shadow-sm hover:shadow-md"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold px-3.5 py-2 rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/70 transition"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm hover:shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                Créer ma carte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
