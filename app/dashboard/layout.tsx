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

  type NavItem = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    external?: boolean;
    isAction?: 'team';
  };

  type NavSection = {
    title: string;
    items: NavItem[];
  };

  const navSections: NavSection[] = [
    {
      title: 'Ma Page',
      items: [
        { href: '/dashboard/links', label: 'Liens', icon: LinkIcon },
        { href: '/dashboard/profile', label: 'Profil & Bio', icon: User },
        { href: '/dashboard/services', label: 'Services & RDV', icon: Calendar },
        { href: '/dashboard/shop', label: 'Boutique', icon: BookOpen },
        { href: '/dashboard/contact', label: 'Contact (vCard)', icon: PhoneCall },
        { href: '/dashboard/theme', label: 'Thème Visuel', icon: Palette },
      ],
    },
    {
      title: 'Outils',
      items: [
        {
          href: 'https://calendar.lien-bio.site',
          label: 'Agenda Pro (calendar)',
          icon: Calendar,
          external: true,
        },
      ],
    },
    {
      title: 'Pilotage',
      items: [
        { href: '/dashboard/analytics', label: 'Statistiques', icon: BarChart3 },
        { href: '#team', label: 'Équipe & Accès', icon: Users, isAction: 'team' },
        { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
      ],
    },
  ];

  const allNavItems = navSections.flatMap((s) => s.items);

  const getPageTitle = () => {
    if (pathname === '/dashboard/links' || pathname === '/dashboard') return 'Mes Liens';
    if (pathname === '/dashboard/profile') return 'Profil & Identité';
    if (pathname === '/dashboard/services') return 'Services & RDV';
    if (pathname === '/dashboard/shop') return 'Boutique & Produits';
    if (pathname === '/dashboard/contact') return 'Fiche Contact (vCard)';
    if (pathname === '/dashboard/theme') return 'Thème & Apparence';
    if (pathname === '/dashboard/analytics') return 'Statistiques & Performance';
    if (pathname === '/dashboard/settings') return 'Paramètres du Compte';
    return 'Tableau de bord';
  };

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
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
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
      <div className="min-h-screen bg-slate-50/70 text-neutral-900 flex font-sans selection:bg-indigo-600 selection:text-white w-full max-w-full overflow-x-hidden relative">
        {/* ========================================================= */}
        {/* DESKTOP VERTICAL SIDEBAR (Fixed Left Slide)               */}
        {/* ========================================================= */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 bg-white border-r border-neutral-200/80 shadow-xs">
          {/* Top Sidebar: Brand Logo */}
          <div className="h-16 px-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
            <Logo href="/" size="sm" showBadge={false} />
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase text-indigo-700 tracking-wider">
              {profile?.is_pro ? 'PRO' : 'FREE'}
            </span>
          </div>

          {/* Scrollable Middle Area */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 no-scrollbar">
            {/* Card Switcher (if user has team or delegated cards) */}
            {delegatedCards.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCardSwitcherOpen(!isCardSwitcherOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-neutral-900 truncate">
                        {activeCardId ? (profile?.display_name || profile?.username) : 'Ma Carte'}
                      </span>
                      <span className="block text-[10px] text-neutral-500 truncate">
                        {userRole === 'owner' ? 'Propriétaire' : userRole === 'admin' ? 'Co-Admin' : 'Assistant'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                </button>

                {isCardSwitcherOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                      Espaces de travail
                    </div>

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

            {/* Navigation Sections */}
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1">
                  {sec.title}
                </span>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    !item.external &&
                    !item.isAction &&
                    (pathname === item.href || (item.href === '/dashboard/links' && pathname === '/dashboard'));

                  if (item.isAction === 'team') {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setIsInviteModalOpen(true)}
                        className="w-full px-3 py-2.5 text-xs font-bold flex items-center justify-between rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0 text-neutral-400" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {profile?.theme?.team_members && profile.theme.team_members.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold">
                            {profile.theme.team_members.length}
                          </span>
                        )}
                      </button>
                    );
                  }

                  if (item.external) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 text-xs font-bold flex items-center justify-between rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0 text-indigo-600" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0" />
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2.5 text-xs font-bold flex items-center justify-between rounded-xl transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-black shadow-2xs'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-neutral-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* PRO Upgrade Callout if not PRO */}
            {profile && !profile.is_pro && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-amber-950">Formule PRO</span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-snug">
                  Domaine personnalisé, liens illimités et fonctionnalités avancées.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                >
                  Passer PRO
                </button>
              </div>
            )}
          </div>

          {/* Footer Sidebar: Profile & Status & Sign Out */}
          <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 shrink-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-neutral-900 truncate leading-tight">
                    {profile?.display_name || profile?.username || 'Mon Profil'}
                  </span>
                  <span className="block text-[10px] text-neutral-500 truncate leading-tight mt-0.5">
                    @{profile?.username || 'user'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Quick status switch */}
            {profile && (
              <button
                type="button"
                onClick={handleTogglePublish}
                title={profile.is_published ? 'Cliquer pour masquer la carte' : 'Cliquer pour remettre la carte en ligne'}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200/80 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      profile.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span>{profile.is_published ? 'Carte Publique' : 'Carte Masquée'}</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-normal">
                  {profile.is_published ? 'En ligne' : 'Brouillon'}
                </span>
              </button>
            )}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN CONTENT AREA (Offset by md:pl-64)                    */}
        {/* ========================================================= */}
        <div className="md:pl-64 flex flex-col flex-1 min-w-0">
          {/* Top Sticky Header */}
          <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-xl border-b border-neutral-200/70 px-4 sm:px-6 flex items-center justify-between gap-3 supports-[backdrop-filter]:bg-white/80">
            {/* Left Header: Mobile Toggle & Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-xl transition border border-neutral-200/80 cursor-pointer"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <h1 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight">
                  {getPageTitle()}
                </h1>
                {profile && (
                  <button
                    type="button"
                    onClick={handleTogglePublish}
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/80 transition cursor-pointer"
                    title={profile.is_published ? "Votre carte est publique. Cliquer pour la masquer." : "Votre carte est masquée. Cliquer pour la remettre en ligne."}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${profile.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className={profile.is_published ? 'text-emerald-700' : 'text-amber-700'}>
                      {profile.is_published ? 'En ligne' : 'Masquée'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Header: Public Link + Pro Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {profile?.username && (
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100/90 border border-neutral-200/80">
                  <div className="hidden sm:flex items-center gap-1 px-2 text-xs font-mono text-neutral-600">
                    <span className="text-neutral-400">lien-bio.site/</span>
                    <span className="font-bold text-neutral-900">{profile.username}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPublicLink}
                    className="p-1.5 rounded-lg bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 border border-neutral-200/60 transition shadow-2xs hover:shadow-xs flex items-center gap-1 cursor-pointer"
                    title="Copier le lien public"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
                    <span className="text-[11px] hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
                  </button>

                  <a
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white hover:bg-neutral-50 text-xs font-bold text-indigo-700 border border-neutral-200/60 transition shadow-2xs hover:shadow-xs flex items-center gap-1 cursor-pointer"
                    title="Ouvrir la page publique"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[11px] hidden sm:inline">Aperçu Web</span>
                  </a>
                </div>
              )}

              {/* PRO Button / Badge */}
              {profile && (
                <>
                  {profile.plan === 'pro_lifetime' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
                      <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span className="hidden sm:inline">PRO À Vie</span>
                    </div>
                  ) : profile.is_pro ? (
                    <button
                      type="button"
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition shadow-2xs cursor-pointer"
                      title="Changer de formule ou passer à l'accès À Vie"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span className="hidden sm:inline">À Vie</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-xs hover:scale-105 transition-all cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>Passer PRO</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </header>

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
        </div>

        {/* ========================================================= */}
        {/* MOBILE SLIDE-OVER DRAWER (Slide Vertical)                 */}
        {/* ========================================================= */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-over Drawer (Left slide) */}
            <div className="fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col p-5 overflow-y-auto animate-in slide-in-from-left duration-200">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <Logo href="/" size="sm" showBadge={false} />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User summary in drawer */}
              <div className="py-4 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-neutral-900 truncate">
                      {profile?.display_name || profile?.username}
                    </span>
                    <span className="block text-[10px] text-neutral-500 truncate">
                      @{profile?.username}
                    </span>
                  </div>
                </div>

                {!profile?.is_pro && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsUpgradeModalOpen(true);
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-400 text-neutral-950 text-[10px] font-black uppercase shadow-2xs"
                  >
                    PRO
                  </button>
                )}
              </div>

              {/* Navigation Items */}
              <div className="flex-1 py-4 space-y-4">
                {navSections.map((sec) => (
                  <div key={sec.title} className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 px-3 block mb-1">
                      {sec.title}
                    </span>
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        !item.external &&
                        !item.isAction &&
                        (pathname === item.href || (item.href === '/dashboard/links' && pathname === '/dashboard'));

                      if (item.isAction === 'team') {
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsInviteModalOpen(true);
                            }}
                            className="w-full px-3 py-2.5 text-xs font-bold flex items-center justify-between rounded-xl text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className="w-4 h-4 text-neutral-400 shrink-0" />
                              <span>{item.label}</span>
                            </div>
                            {profile?.theme?.team_members && profile.theme.team_members.length > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold">
                                {profile.theme.team_members.length}
                              </span>
                            )}
                          </button>
                        );
                      }

                      if (item.external) {
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="px-3 py-2.5 text-xs font-bold flex items-center justify-between rounded-xl text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>{item.label}</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          </a>
                        );
                      }

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
                ))}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
                {profile?.username && (
                  <>

                    <a
                      href={`/${profile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-xs font-bold text-neutral-800 flex items-center justify-center gap-2 transition"
                    >
                      <Eye className="w-4 h-4 text-neutral-600" />
                      <span>Voir ma page publique</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MOBILE BOTTOM NAVIGATION BAR                              */}
        {/* ========================================================= */}
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
              type="button"
              onClick={() => setIsMobilePreviewOpen(true)}
              className="flex flex-col items-center justify-center -mt-3.5 py-1.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/35 active:scale-95 transition cursor-pointer"
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
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Services</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
              isMobileMenuOpen
                ? 'text-indigo-600 font-extrabold'
                : 'text-neutral-500 hover:text-neutral-800 font-medium'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </nav>

        {/* Mobile Full-Screen Native Preview Modal */}
        {isMobilePreviewOpen && profile && (
          <div className="fixed inset-0 z-50 bg-neutral-900/95 backdrop-blur-md flex flex-col md:hidden animate-fade-in">
            <div className="h-14 px-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold truncate">Aperçu en direct de votre page</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobilePreviewOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-neutral-950 p-2">
              <div className="max-w-md mx-auto min-h-full">
                <PublicProfileView profile={profile} links={links} contact={contact} />
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
