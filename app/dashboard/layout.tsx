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
import { TeamManagementModal } from '@/components/dashboard/TeamManagementModal';
import { Logo, LogoIcon } from '@/components/ui/Logo';
import {
  Crown,
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
  UserPlus,
  Users,
  ChevronDown,
  ShieldCheck,
  Calendar,
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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Espace collaboratif et gestion d'équipe
  const [delegatedCards, setDelegatedCards] = useState<any[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'assistant'>('owner');
  const [isCardSwitcherOpen, setIsCardSwitcherOpen] = useState(false);

  // Close mobile menus whenever the pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCardSwitcherOpen(false);
    setIsMobilePreviewOpen(false);
  }, [pathname]);

  const fetchDashboardData = async (targetCardId?: string | null) => {
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

      // 1. Récupérer les cartes où l'utilisateur est collaborateur
      let userDelegatedCards: any[] = [];
      try {
        const teamRes = await fetch('/api/team');
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          userDelegatedCards = teamData.delegatedCards || [];
          setDelegatedCards(userDelegatedCards);
        }
      } catch {}

      // 2. Déterminer la carte active (propre carte vs carte déléguée)
      const selectedId = targetCardId !== undefined ? targetCardId : activeCardId;
      const effectiveCardId = selectedId && selectedId !== user.id ? selectedId : user.id;

      let currentRole: 'owner' | 'admin' | 'assistant' = 'owner';
      if (effectiveCardId !== user.id) {
        const membership = userDelegatedCards.find((c) => c.id === effectiveCardId);
        currentRole = membership?.role === 'admin' ? 'admin' : 'assistant';
      }
      setUserRole(currentRole);
      setActiveCardId(effectiveCardId === user.id ? null : effectiveCardId);

      // 3. Charger le profil de la carte active
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', effectiveCardId)
        .maybeSingle();

      if (profError) {
        setErrorMessage(`Erreur Supabase : ${profError.message}`);
        return;
      }

      if (!prof) {
        if (effectiveCardId === user.id) {
          router.push('/onboarding');
          return;
        } else {
          toast.error('Carte déléguée introuvable');
          return;
        }
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

      // 4. Charger les liens de la carte active
      const { data: lnks } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', effectiveCardId)
        .order('position', { ascending: true });

      setLinks(lnks || []);

      // 5. Charger les infos de contact de la carte active
      const { data: cnt } = await supabase
        .from('contact_info')
        .select('*')
        .eq('profile_id', effectiveCardId)
        .maybeSingle();

      setContact(cnt || null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchCard = (cardId: string | null) => {
    setIsCardSwitcherOpen(false);
    setLoading(true);
    fetchDashboardData(cardId);
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

      // 2. Annulation ou échec de paiement
      if (searchParams.get('payment') === 'cancelled' || searchParams.get('payment') === 'failed') {
        toast.info('Paiement non abouti ou annulé.');
        searchParams.delete('payment');
        searchParams.delete('provider');
        searchParams.delete('reason');
        const newSearch = searchParams.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, document.title, newPath);
      }

      // En attente de paiement (opérateur mobile money)
      if (searchParams.get('payment') === 'pending') {
        const pendingRefId =
          searchParams.get('sale_id') ||
          searchParams.get('saleId') ||
          searchParams.get('cart_id') ||
          searchParams.get('cartId');
        const pendingPlan = searchParams.get('plan') || 'yearly';

        searchParams.delete('payment');
        searchParams.delete('provider');
        searchParams.delete('sale_id');
        searchParams.delete('saleId');
        searchParams.delete('cart_id');
        searchParams.delete('cartId');
        searchParams.delete('plan');
        const newSearch = searchParams.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, document.title, newPath);

        if (pendingRefId) {
          toast.loading('Validation de votre paiement par votre opérateur...', { id: 'pending-payment-check', duration: 30000 });

          let attempts = 0;
          const maxAttempts = 10;
          const interval = setInterval(async () => {
            attempts++;
            try {
              const res = await fetch(`/api/chariow/verify?sale_id=${pendingRefId}&plan=${pendingPlan}`);
              const data = await res.json();
              if (data.completed || data.status === 'completed') {
                clearInterval(interval);
                toast.success('Félicitations ! Votre paiement est validé, votre compte PRO est actif 🎉', {
                  id: 'pending-payment-check',
                  duration: 6000,
                });
                fetchDashboardData();
                return;
              }
            } catch (e) {
              console.error('Erreur vérification paiement:', e);
            }

            if (attempts >= maxAttempts) {
              clearInterval(interval);
              toast.info('Votre opérateur traite toujours la confirmation. Votre accès sera actualisé dès validation.', {
                id: 'pending-payment-check',
                duration: 8000,
              });
            }
          }, 2500);
        } else {
          toast.loading('Paiement en cours de validation par votre opérateur...', { duration: 6000 });
        }
      }

      // 3. Instant payment success handling
      if (searchParams.get('payment') === 'success' || searchParams.get('upgrade_success') === 'true') {
        const planParam = searchParams.get('plan') || 'yearly';
        const planType = planParam === 'monthly' || planParam === 'yearly' ? 'pro_subscription' : 'pro_lifetime';

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
              plan: planType,
              pro_since: new Date().toISOString(),
            };

            await supabase
              .from('profiles')
              .update({
                theme: updatedTheme,
                is_pro: true,
                plan: planType,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);

            fetchDashboardData();
            toast.success('Félicitations ! Votre paiement est validé, votre compte PRO est actif 🎉', {
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
    } catch (err: any) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleTogglePublish = async () => {
    if (!profile) return;
    try {
      const nextPublished = !profile.is_published;
      const { error } = await supabase
        .from('profiles')
        .update({ is_published: nextPublished, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, is_published: nextPublished } : prev));
      if (nextPublished) {
        toast.success('🎉 Votre carte est de nouveau en ligne et publique !');
      } else {
        toast.info('Votre carte est maintenant masquée au public.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors du changement de statut de la carte.');
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
    { href: '/dashboard/services', label: 'Services & RDV', icon: Calendar },
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
        <LogoIcon size="lg" className="animate-pulse mb-4 shadow-md" />
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
        openInviteModal: () => setIsInviteModalOpen(true),
        userRole,
        delegatedCards,
        activeCardId,
        switchCard: handleSwitchCard,
      }}
    >
      <div className="min-h-screen bg-slate-50/70 text-neutral-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white w-full max-w-full overflow-x-hidden relative">
        {/* Top Header */}
        <header className="w-full border-b border-neutral-200/70 bg-white/90 backdrop-blur-xl sticky top-0 z-40 supports-[backdrop-filter]:bg-white/80">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
            {/* Left: Brand Logo & Status & Workspace Switcher */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Logo href="/" size="sm" showBadge={false} />

              {/* Card / Workspace Switcher (if user is collaborator on other cards) */}
              {delegatedCards.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCardSwitcherOpen(!isCardSwitcherOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/80 text-xs font-bold text-neutral-800 transition cursor-pointer"
                  >
                    <span className="truncate max-w-[110px] sm:max-w-[160px]">
                      {activeCardId ? (profile?.display_name || profile?.username) : 'Ma Carte'}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        userRole === 'owner'
                          ? 'bg-neutral-900 text-white'
                          : userRole === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200/70'
                          : 'bg-indigo-100 text-indigo-900 border border-indigo-200/70'
                      }`}
                    >
                      {userRole === 'owner' ? 'Propriétaire' : userRole === 'admin' ? 'Admin' : 'Assistant'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {isCardSwitcherOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                        Espaces de travail
                      </div>

                      {/* Ma propre carte */}
                      <button
                        type="button"
                        onClick={() => handleSwitchCard(null)}
                        className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-neutral-50 transition cursor-pointer ${
                          !activeCardId ? 'bg-indigo-50/60 text-indigo-900' : 'text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="truncate">Ma carte personnelle</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-normal">Propriétaire</span>
                      </button>

                      {/* Cartes déléguées */}
                      {delegatedCards.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSwitchCard(c.id)}
                          className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-neutral-50 transition cursor-pointer ${
                            activeCardId === c.id ? 'bg-indigo-50/60 text-indigo-900' : 'text-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full ${c.role === 'admin' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                            <span className="truncate">{c.display_name || c.username}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {c.role === 'admin' ? 'Co-Admin' : 'Assistant'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Status & PRO Badge Indicator (Desktop) */}
              {profile && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePublish}
                    title={profile.is_published ? "Cliquer pour masquer la carte" : "Cliquer pour remettre la carte en ligne"}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100/90 hover:bg-neutral-200/80 border border-neutral-200/80 text-[11px] font-medium transition cursor-pointer"
                  >
                    <span className={`w-2 h-2 rounded-full ${profile.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className={profile.is_published ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {profile.is_published ? 'Carte Publique' : 'Carte Masquée (Remettre en ligne)'}
                    </span>
                  </button>

                  {profile.plan === 'pro_lifetime' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      <span>PRO À Vie</span>
                    </div>
                  ) : profile.is_pro ? (
                    <button
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition shadow-2xs cursor-pointer"
                      title="Changer de formule ou passer à l'accès À Vie"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      <span>Changer / Passer À Vie</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-xs hover:scale-105 transition-all cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 fill-neutral-950" />
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
                  <Crown className="w-3.5 h-3.5 fill-neutral-950" />
                  <span>PRO</span>
                </button>
              )}
              {profile && profile.is_pro && profile.plan !== 'pro_lifetime' && (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs active:scale-95 transition"
                  title="Changer d'offre ou passer à l'offre À Vie"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>À Vie</span>
                </button>
              )}

              {profile?.username && (
                <>
                  {/* Team & Collaborators Button */}
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-xs font-bold text-indigo-700 transition shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
                    title="Gestion de l'équipe et collaborateurs"
                  >
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">Équipe</span>
                    {profile.theme?.team_members && profile.theme.team_members.length > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                        {profile.theme.team_members.length}
                      </span>
                    )}
                  </button>

                  {/* Copy Link Button */}
                  <button
                    onClick={handleCopyPublicLink}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/80 text-xs font-bold text-neutral-700 transition shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer"
                    title="Copier le lien public"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
                    <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
                  </button>

                  {/* View Public Page in New Tab Button */}
                  <a
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:px-3.5 sm:py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 text-xs font-bold text-indigo-700 transition flex items-center gap-1.5"
                    title="Voir la page publique en ligne"
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">Aperçu Web</span>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 py-1.5">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
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

            {/* Direct 1-Click Access to calendar.lien-bio.site */}
            <a
              href="https://calendar.lien-bio.site"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 text-xs font-extrabold flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xs hover:shadow transition-all shrink-0 group"
              title="Ouvrir mon agenda pro sur calendar.lien-bio.site"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>Agenda Pro</span>
              <ExternalLink className="w-3 h-3 opacity-80 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-32 md:pb-8 min-w-0">
          {isFullWidthPage ? (
            <div className="w-full max-w-5xl mx-auto min-w-0">
              {children}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full min-w-0">
              {/* Left Column: Form Editors */}
              <div className="lg:col-span-7 flex flex-col w-full min-w-0">
                {children}
              </div>

              {/* Right Column: Live Mobile Mockup Preview (Desktop only) */}
              <div className="hidden lg:flex lg:col-span-5 lg:sticky lg:top-24 justify-center">
                <MobilePreview profile={profile} links={links} contact={contact} />
              </div>
            </div>
          )}
        </main>

        {/* Mobile Full-Screen Native Preview Modal */}
        {isMobilePreviewOpen && profile && (
          <div className="fixed inset-0 z-50 bg-neutral-900/95 backdrop-blur-md flex flex-col md:hidden animate-fade-in">
            {/* Modal Header */}
            <div className="h-14 px-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold truncate">Aperçu en direct de votre page</span>
              </div>
              <button
                onClick={() => setIsMobilePreviewOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto bg-neutral-950 p-2">
              <div className="max-w-md mx-auto min-h-full">
                <PublicProfileView profile={profile} links={links} contact={contact} />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar (Fixed with Safe Area Insets & Central Preview Button) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/80 px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <Link
            href="/dashboard/links"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
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
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
              pathname === '/dashboard/profile'
                ? 'text-indigo-600 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-800 font-medium'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Profil</span>
          </Link>

          {/* Central Aperçu Button */}
          {profile && (
            <button
              onClick={() => setIsMobilePreviewOpen(true)}
              className="flex flex-col items-center justify-center -mt-3.5 py-1.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/35 active:scale-95 transition"
              title="Aperçu direct de votre profil"
            >
              <Eye className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-black tracking-tight">Aperçu</span>
            </button>
          )}

          <Link
            href="/dashboard/services"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
              pathname === '/dashboard/services'
                ? 'text-indigo-600 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-800 font-medium'
            }`}
          >
            <Zap className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Services</span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
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

                {/* Direct 1-Click to calendar.lien-bio.site */}
                <a
                  href="https://calendar.lien-bio.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-2 px-3 py-2.5 text-xs font-bold flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-amber-300" />
                    <span>Mon Agenda Pro</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
                {profile?.username && (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsInviteModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-xs font-bold text-indigo-700 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Équipe & Collaborateurs</span>
                    </button>

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
                  </>
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
        <LifetimeUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          currentPlan={profile?.plan}
        />

        {/* Team Management Modal (Collaborators & Referral) */}
        <TeamManagementModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          profile={profile}
          onTeamUpdated={fetchDashboardData}
        />
      </div>
    </DashboardContext.Provider>
  );
}
