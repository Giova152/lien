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
    <header className="w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-neutral-900 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span>Lien<span className="text-indigo-600">.me</span></span>
        </Link>

        {/* Auth Buttons / Profile Nav */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {profile?.username && (
                <Link
                  href={`/${profile.username}`}
                  target="_blank"
                  className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 transition"
                >
                  <span>Mon profil public</span>
                </Link>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-2 text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 rounded-xl transition"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold px-4 py-2 rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md hover:shadow-indigo-500/25"
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
