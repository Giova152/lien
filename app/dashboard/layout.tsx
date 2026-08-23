'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile, LinkItem, ContactInfo } from '@/types';
import { DashboardContext } from '@/lib/context/DashboardContext';
import { MobilePreview } from '@/components/dashboard/MobilePreview';
import { LifetimeUpgradeModal } from '@/components/dashboard/LifetimeUpgradeModal';
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
  ShieldAlert,
  Copy,
  Check,
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
  const [copied, setCopied] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setErrorMessage(null);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError && authError.message.includes('FetchError')) {
        setErrorMessage('Impossible de se connecter au serveur Supabase. Vérifiez vos variables d’environnement.');
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

    // Instant payment success handling
    if (typeof window !== 'undefined' && window.location.search.includes('payment=success')) {
      const upgradeAccount = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ is_pro: true, plan: 'pro_lifetime', updated_at: new Date().toISOString() })
            .eq('id', user.id);

          fetchDashboardData();
          toast.success('Félicitations ! Votre compte est désormais PRO À VIE 🎉', {
            duration: 6000,
          });
          // Clean URL parameter
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      upgradeAccount();
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Déconnexion réussie !');
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const handleCopyPublicLink = () => {
    if (!profile?.username) return;
    const fullUrl = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Lien public copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
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
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-neutral-300">Chargement de votre espace admin...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/10">
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
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition shadow-lg shadow-indigo-600/25"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <DashboardContext.Provider
      value={{
        profile,
        links,
        contact,
        loading,
        refreshDashboard: fetchDashboardData,
        setProfile,
        setLinks,
        setContact,
      }}
    >
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        {/* Top Header */}
        <header className="w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Left: Brand Logo & Status */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/" className="font-black text-xl tracking-tight text-white flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Lien<span className="text-indigo-400">.me</span></span>
              </Link>

              {/* Status & PRO Badge Indicator */}
              {profile && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-medium">
                    <span className={`w-2 h-2 rounded-full ${profile.is_published ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className={profile.is_published ? 'text-emerald-400' : 'text-amber-400'}>
                      {profile.is_published ? 'Carte Publique' : 'Carte Masquée'}
                    </span>
                  </div>

                  {profile.is_pro ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>PRO À VIE</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>Passer PRO (186 $)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile PRO Upgrade Button */}
              {profile && !profile.is_pro && (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 text-[11px] font-black uppercase"
                >
                  <Sparkles className="w-3 h-3 fill-neutral-950" />
                  <span>PRO 186$</span>
                </button>
              )}

              {profile?.username && (
                <>
                  {/* Copy Link Button */}
                  <button
                    onClick={handleCopyPublicLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 transition"
                    title="Copier le lien public"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                    <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier le lien'}</span>
                  </button>

                  {/* View Public Page Button */}
                  <a
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Aperçu Web</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </>
              )}

              {/* Mobile View Switcher */}
              <div className="flex lg:hidden bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setMobileTab('editor')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    mobileTab === 'editor' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400'
                  }`}
                >
                  Éditeur
                </button>
                <button
                  onClick={() => setMobileTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    mobileTab === 'preview' ? 'bg-indigo-600 text-white shadow' : 'text-neutral-400'
                  }`}
                >
                  Aperçu
                </button>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 rounded-xl transition"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Sub-bar */}
        <nav className="w-full border-b border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/dashboard/links' && pathname === '/dashboard');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                      : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/40'
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
              {children}
            </div>

            {/* Right Column: Live Mobile Mockup Preview */}
            <div className={`lg:col-span-5 lg:sticky lg:top-24 flex justify-center ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
              <MobilePreview profile={profile} links={links} contact={contact} />
            </div>
          </div>
        </main>

        {/* Lifetime Upgrade Modal (150$) */}
        <LifetimeUpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
      </div>
    </DashboardContext.Provider>
  );
}
