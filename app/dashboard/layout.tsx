'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile, LinkItem, ContactInfo } from '@/types';
import { MobilePreview } from '@/components/dashboard/MobilePreview';
import {
  Sparkles,
  LinkIcon,
  User,
  PhoneCall,
  Palette,
  BarChart3,
  Settings,
  Eye,
  LogOut,
  ExternalLink,
  Smartphone,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const fetchDashboardData = async () => {
    try {
      setErrorMessage(null);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError && authError.message.includes('FetchError')) {
        setErrorMessage('Impossible de se connecter au serveur Supabase. Vérifiez vos variables d’environnement dans .env.local.');
        return;
      }

      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Fetch Profile
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profError) {
        setErrorMessage(`Erreur Supabase : ${profError.message}`);
        return;
      }

      if (!prof) {
        router.push('/onboarding');
        return;
      }

      setProfile(prof);

      // 2. Fetch Links
      const { data: lnks } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', user.id)
        .order('position', { ascending: true });

      setLinks(lnks || []);

      // 3. Fetch Contact Info
      const { data: cnt } = await supabase
        .from('contact_info')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      setContact(cnt || null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard/links', label: 'Liens', icon: LinkIcon },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
    { href: '/dashboard/contact', label: 'Contact (vCard)', icon: PhoneCall },
    { href: '/dashboard/theme', label: 'Thème Visuel', icon: Palette },
    { href: '/dashboard/analytics', label: 'Statistiques', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
        <Sparkles className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-neutral-400">Chargement de votre espace admin...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-2">Erreur de Connexion Supabase</h1>
        <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
          {errorMessage}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetchDashboardData();
          }}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition shadow-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="w-full border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-black text-xl tracking-tight text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Lien<span className="text-indigo-400">.me</span></span>
            </Link>

            {profile?.username && (
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>lien.me/{profile.username}</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Switcher */}
            <div className="flex lg:hidden bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setMobileTab('editor')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  mobileTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-neutral-400'
                }`}
              >
                Éditeur
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  mobileTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-neutral-400'
                }`}
              >
                Aperçu Live
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-xl transition"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <nav className="w-full border-b border-neutral-800 bg-neutral-900/50 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard/links' && pathname === '/dashboard');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area (Split view on Desktop) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Editors */}
          <div className={`lg:col-span-7 flex flex-col ${mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
            {React.cloneElement(children as React.ReactElement<any>, {
              profile,
              links,
              contact,
              refreshDashboard: fetchDashboardData,
              setProfile,
              setLinks,
              setContact,
            })}
          </div>

          {/* Right Column: Live Mobile Mockup Preview */}
          <div className={`lg:col-span-5 lg:sticky lg:top-24 flex justify-center ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
            <MobilePreview profile={profile} links={links} contact={contact} />
          </div>
        </div>
      </main>
    </div>
  );
}
