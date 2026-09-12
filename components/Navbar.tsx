'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard } from '@/components/ui/Icons';
import { createClient } from '@/lib/supabase/client';

import { Logo } from '@/components/ui/Logo';

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

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${id}`);
      }
    }
  };

  return (
    <header className="w-full border-b border-neutral-200/70 bg-white/75 backdrop-blur-xl sticky top-0 z-40 supports-[backdrop-filter]:bg-white/60 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo href="/" size="md" />

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-600">
          <Link
            href="/#features"
            onClick={(e) => scrollTo(e, 'features')}
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Fonctionnalités
          </Link>
          <Link
            href="/#preview"
            onClick={(e) => scrollTo(e, 'preview')}
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Aperçu Live
          </Link>
          <Link
            href="/#pricing"
            onClick={(e) => scrollTo(e, 'pricing')}
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Tarifs
          </Link>
          <Link
            href="/#faq"
            onClick={(e) => scrollTo(e, 'faq')}
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            FAQ
          </Link>
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
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/90 rounded-xl transition-all cursor-pointer border border-transparent hover:border-neutral-200/80"
                title="Se déconnecter"
              >
                <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Déconnexion</span>
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
