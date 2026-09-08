'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile, LinkItem, ContactInfo } from '@/types';
import { DashboardContext } from '@/lib/context/DashboardContext';
import { MobilePreview } from '@/components/dashboard/MobilePreview';
import { PublicProfileView } from '@/components/public/PublicProfileView';
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
  Zap,
  BookOpen,
  Menu,
  X,
  MoreHorizontal,
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
  const [copied, setCopied] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Close mobile menus whenever the pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobilePreviewOpen(false);
  }, [pathname]);

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

      const normalizedTheme = {
        ...(prof.theme || {}),
        font_family:
          !prof.theme?.font_family || prof.theme?.font_family === 'Outfit'
            ? 'Arial'
            : prof.theme.font_family,
      };
      const isPro = Boolean(prof.is_pro || prof.theme?.is_pro);
      setProfile({
        ...prof,
        is_pro: isPro,
        theme: normalizedTheme,
      });

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

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);

      // 1. Détection ouverture modale d'upgrade depuis landing page ou navigation
      if (searchParams.get('upgrade') === 'true') {
        setIsUpgradeModalOpen(true);
        searchParams.delete('upgrade');
        const newSearch = searchParams.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, document.title, newPath);
      }

      // 2. Annulation de paiement PayDunya
      if (searchParams.get('payment') === 'cancelled') {
        toast.info('Paiement PayDunya annulé.');
        searchParams.delete('payment');
        const newSearch = searchParams.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, document.title, newPath);
      }

      // 3. Instant payment success handling
      if (searchParams.get('payment') === 'success') {
        const upgradeAccount = async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: currentProf } = await supabase
              .from('profiles')
              .select('theme')
              .eq('id', user.id)
              .maybeSingle();

            const currentTheme = currentProf?.theme || {};
            const updatedTheme = {
              ...currentTheme,
              is_pro: true,
              plan: 'pro_lifetime',
              pro_since: new Date().toISOString(),
            };

            await supabase
              .from('profiles')
              .update({
                theme: updatedTheme,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);

            fetchDashboardData();
            toast.success('Félicitations ! Votre paiement PayDunya est validé, votre compte PRO est actif 🎉', {
              duration: 6000,
            });
            // Clean URL parameter
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        };
        upgradeAccount();
      }
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
    toast.success('Lien public copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { href: '/dashboard/links', label: 'Liens', icon: LinkIcon },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
    { href: '/dashboard/services', label: 'Services', icon: Zap },
    { href: '/dashboard/shop', label: 'Boutique', icon: BookOpen },
    { href: '/dashboard/contact', label: 'Contact (vCard)', icon: PhoneCall },
    { href: '/dashboard/theme', label: 'Thème Visuel', icon: Palette },
    { href: '/dashboard/analytics', label: 'Statistiques', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  const isFullWidthPage = pathname === '/dashboard/analytics' || pathname === '/dashboard/settings';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-neutral-900 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-bold text-neutral-600">Chargement de votre espace admin...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-50 text-neutral-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200/80 flex items-center justify-center mb-4 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-extrabold text-neutral-900 mb-1.5">Erreur de Connexion Supabase</h1>
        <p className="text-xs text-neutral-500 max-w-md mb-6 leading-relaxed">
          {errorMessage}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetchDashboardData();
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md"
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
        openUpgradeModal: () => setIsUpgradeModalOpen(true),
      }}
    >
      <div className="min-h-screen bg-slate-50/70 text-neutral-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
        {/* Top Header */}
        <header className="w-full border-b border-neutral-200/70 bg-white/90 backdrop-blur-xl sticky top-0 z-40 supports-[backdrop-filter]:bg-white/80">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
            {/* Left: Brand Logo & Status */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link href="/" className="font-black text-lg sm:text-xl tracking-tight text-neutral-900 flex items-center gap-2 shrink-0 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-sans">Lien<span className="text-indigo-600">-Bio</span></span>
              </Link>

              {/* Status & PRO Badge Indicator (Desktop) */}
              {profile && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100/90 border border-neutral-200/80 text-[11px] font-medium">
                    <span className={`w-2 h-2 rounded-full ${profile.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className={profile.is_published ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {profile.is_published ? 'Carte Publique' : 'Carte Masquée'}
                    </span>
                  </div>

                  {profile.is_pro ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-black uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PRO ACTIF</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-xs hover:scale-105 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>Passer PRO</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile PRO Upgrade Button */}
              {profile && !profile.is_pro && (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 text-xs font-black shadow-xs active:scale-95 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                  <span className="hidden xs:inline">PRO</span>
                </button>
              )}

              {profile?.username && (
                <>
                  {/* Copy Link Button */}
                  <button
                    onClick={handleCopyPublicLink}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/80 text-xs font-bold text-neutral-700 transition shadow-2xs hover:shadow-xs flex items-center gap-1.5"
                    title="Copier le lien de votre page"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
                    <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
                  </button>

                  {/* View Public Page Button */}
                  <a
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:px-3.5 sm:py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 text-xs font-bold text-indigo-700 transition flex items-center gap-1.5"
                    title="Voir ma page en ligne"
                  >
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">Aperçu Web</span>
                    <ExternalLink className="w-3 h-3 opacity-60 hidden sm:inline" />
                  </a>
                </>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-xl transition border border-neutral-200/80"
                aria-label="Ouvrir le menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Desktop Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="hidden md:flex p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Navigation Sub-bar (Horizontal Tabs) */}
        <nav className="hidden md:block w-full border-b border-neutral-200/70 bg-white sticky top-16 z-30 shadow-2xs overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/dashboard/links' && pathname === '/dashboard');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 text-xs font-bold flex items-center gap-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {isFullWidthPage ? (
            <div className="w-full max-w-5xl mx-auto">
              {children}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Editors */}
              <div className="lg:col-span-7 flex flex-col w-full">
                {children}
              </div>

              {/* Right Column: Live Mobile Mockup Preview (Desktop only) */}
              <div className="hidden lg:flex lg:col-span-5 lg:sticky lg:top-24 justify-center">
                <MobilePreview profile={profile} links={links} contact={contact} />
              </div>
            </div>
          )}
        </main>

        {/* Mobile Floating Action Button: Aperçu direct (Shown on mobile for editor pages) */}
        {!isFullWidthPage && profile && (
          <button
            onClick={() => setIsMobilePreviewOpen(true)}
            className="fixed bottom-20 right-4 z-20 md:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Aperçu direct</span>
          </button>
        )}

        {/* Mobile Full-Screen Native Preview Modal */}
        {isMobilePreviewOpen && profile && (
          <div className="fixed inset-0 z-50 bg-neutral-900/95 backdrop-blur-md flex flex-col md:hidden animate-fade-in">
            {/* Modal Header */}
            <div className="h-14 px-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold">Aperçu en direct de votre page</span>
              </div>
              <button
                onClick={() => setIsMobilePreviewOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto bg-neutral-950">
              <div className="max-w-md mx-auto min-h-full">
                <PublicProfileView profile={profile} links={links} contact={contact} />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar (5 core shortcuts) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-2 py-1.5 flex items-center justify-around md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <Link
            href="/dashboard/links"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              pathname === '/dashboard/links' || pathname === '/dashboard'
                ? 'text-indigo-600 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-800 font-medium'
            }`}
          >
            <LinkIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Liens</span>
          </Link>

          <Link
            href="/dashboard/profile"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              pathname === '/dashboard/profile'
                ? 'text-indigo-600 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-800 font-medium'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Profil</span>
          </Link>

          <Link
            href="/dashboard/services"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              pathname === '/dashboard/services'
                ? 'text-indigo-600 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-800 font-medium'
            }`}
          >
            <Zap className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Services</span>
          </Link>

          <Link
            href="/dashboard/analytics"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              pathname === '/dashboard/analytics'
                ? 'text-indigo-600 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-800 font-medium'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Stats</span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              isMobileMenuOpen
                ? 'text-indigo-600 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-800 font-medium'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </nav>

        {/* Mobile Slide-Over Drawer Navigation */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col p-5 overflow-y-auto">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm">
                    {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-extrabold text-neutral-900 truncate">
                      {profile?.display_name || 'Mon Profil'}
                    </span>
                    <span className="text-[11px] text-neutral-400 truncate">
                      @{profile?.username || 'user'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              {profile && (
                <div className="my-3 flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${profile.is_published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="font-semibold text-neutral-700">
                      {profile.is_published ? 'Carte en ligne' : 'Carte masquée'}
                    </span>
                  </div>
                  {profile.is_pro ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      PRO
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsUpgradeModalOpen(true);
                      }}
                      className="px-2 py-0.5 rounded-md bg-amber-400 text-neutral-950 text-[10px] font-black uppercase hover:bg-amber-500 transition"
                    >
                      Passer PRO
                    </button>
                  )}
                </div>
              )}

              {/* Nav Items List */}
              <div className="flex-1 py-2 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-neutral-400 px-3 pt-2 pb-1 tracking-wider">
                  Menu Principal
                </span>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href === '/dashboard/links' && pathname === '/dashboard');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-3 py-2.5 text-xs font-bold flex items-center gap-3 rounded-xl transition ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-2xs'
                          : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-neutral-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
                {profile?.username && (
                  <a
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 text-xs font-bold text-indigo-700 flex items-center justify-center gap-2 transition"
                  >
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span>Voir ma page publique</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lifetime Upgrade Modal (150$) */}
        <LifetimeUpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
      </div>
    </DashboardContext.Provider>
  );
}
