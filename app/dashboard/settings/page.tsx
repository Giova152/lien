'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Settings,
  ShieldAlert,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Trash2,
  Check,
  Loader2,
  Copy,
  ExternalLink,
  LogOut,
  Crown,
  ShieldCheck,
  X,
  Globe,
  User,
  ArrowRight,
} from '@/components/ui/Icons';
import { toast } from 'sonner';
import { useDashboard } from '@/lib/context/DashboardContext';

export default function SettingsPage() {
  const { profile, setProfile, refreshDashboard, openUpgradeModal, userRole } = useDashboard();
  const router = useRouter();
  const supabase = createClient();

  // Auth User Data
  const [authUser, setAuthUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Email form
  const [newEmail, setNewEmail] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);

  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Publishing
  const [publishing, setPublishing] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Copied link state
  const [copiedLink, setCopiedLink] = useState(false);

  // Custom Domain State
  const [domainInput, setDomainInput] = useState(profile?.custom_domain || profile?.theme?.custom_domain || '');
  const [domainStatus, setDomainStatus] = useState<string | null>(profile?.custom_domain_status || profile?.theme?.custom_domain_status || null);
  const [domainRecords, setDomainRecords] = useState<{ type: string; name: string; value: string }[]>([]);
  const [checkingDns, setCheckingDns] = useState(false);
  const [savingDomain, setSavingDomain] = useState(false);
  const [isEditingDomain, setIsEditingDomain] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyValue = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success('Copié dans le presse-papier !');
  };

  // Load current Auth user and Custom Domain status
  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setAuthUser(user);
      } catch (err) {
        console.error('Erreur chargement utilisateur auth:', err);
      } finally {
        setLoadingAuth(false);
      }
    }
    loadUser();
  }, [supabase]);

  useEffect(() => {
    if (profile?.custom_domain || profile?.theme?.custom_domain) {
      const d = profile.custom_domain || profile.theme?.custom_domain || '';
      setDomainInput(d);
      setDomainStatus(profile.custom_domain_status || profile.theme?.custom_domain_status || 'pending');
      fetchDomainInfo();
    }
  }, [profile]);

  const fetchDomainInfo = async () => {
    try {
      const res = await fetch('/api/domain');
      const data = await res.json();
      if (data?.status) {
        setDomainStatus(data.status);
      }
      if (data?.records && Array.isArray(data.records)) {
        setDomainRecords(data.records);
      }
    } catch {}
  };

  const handleCheckDns = async () => {
    setCheckingDns(true);
    try {
      const res = await fetch('/api/domain');
      const data = await res.json();
      if (data?.status) {
        setDomainStatus(data.status);
      }
      if (data?.records && Array.isArray(data.records)) {
        setDomainRecords(data.records);
      }
      if (data?.dnsValid || data?.status === 'active') {
        toast.success('🟢 Configuration DNS vérifiée et active ! Votre carte répond sur votre nom de domaine.');
      } else {
        toast.info('🟡 DNS non encore propagé. Veuillez patienter ou vérifier vos enregistrements.');
      }
    } catch (err: any) {
      toast.error('Erreur lors de la vérification DNS');
    } finally {
      setCheckingDns(false);
    }
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setSavingDomain(true);
    try {
      const res = await fetch('/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’enregistrement');

      setDomainStatus(data.status);
      if (data?.records && Array.isArray(data.records)) {
        setDomainRecords(data.records);
      }
      setIsEditingDomain(false);
      toast.success(data.message || 'Domaine enregistré !');
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde du domaine');
    } finally {
      setSavingDomain(false);
    }
  };

  const handleDeleteDomain = async () => {
    setSavingDomain(true);
    try {
      const res = await fetch('/api/domain', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression');

      setDomainInput('');
      setDomainStatus(null);
      setIsEditingDomain(false);
      toast.success('Nom de domaine personnalisé supprimé.');
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de réinitialiser le domaine');
    } finally {
      setSavingDomain(false);
    }
  };

  // Toggle Publication
  const handleTogglePublish = async () => {
    if (!profile) return;
    try {
      setPublishing(true);
      const nextPublished = !profile.is_published;

      const { error } = await supabase
        .from('profiles')
        .update({ is_published: nextPublished, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      if (setProfile) {
        setProfile((prev) => (prev ? { ...prev, is_published: nextPublished } : prev));
      }

      toast.success(
        nextPublished
          ? '🎉 Votre carte est maintenant publique et accessible à tous !'
          : '🔒 Votre carte a été masquée. Le lien public n’affiche plus votre page.'
      );
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la modification de la visibilité');
    } finally {
      setPublishing(false);
    }
  };

  // Update Email
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error('Veuillez renseigner une nouvelle adresse email');
      return;
    }

    if (cleanEmail === authUser?.email?.toLowerCase()) {
      toast.error('Cette adresse est identique à votre adresse email actuelle');
      return;
    }

    // Basic email format check
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      setUpdatingEmail(true);
      setEmailSuccessMsg(null);

      const { data, error } = await supabase.auth.updateUser(
        { email: cleanEmail },
        { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/settings` : undefined }
      );

      if (error) {
        if (error.message.includes('rate limit')) {
          throw new Error('Trop de tentatives. Veuillez patienter quelques instants avant de réessayer.');
        }
        throw error;
      }

      const msg = `Un lien de confirmation a été envoyé à ${cleanEmail}. Cliquez sur ce lien pour finaliser le changement.`;
      setEmailSuccessMsg(msg);
      toast.success('Demande de changement enregistrée ! Vérifiez votre boîte mail.');
      setNewEmail('');

      // Refresh auth user state
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();
      if (updatedUser) setAuthUser(updatedUser);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la modification de l'email");
    } finally {
      setUpdatingEmail(false);
    }
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les deux mots de passe ne correspondent pas');
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast.success('Votre mot de passe a été mis à jour avec succès !');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Delete Account
  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'SUPPRIMER') {
      toast.error('Veuillez taper "SUPPRIMER" pour confirmer');
      return;
    }

    try {
      setIsDeleting(true);

      // 1. Essayer d'abord la RPC delete_user_account (supprime auth.users en cascade)
      const { error: rpcError } = await supabase.rpc('delete_user_account');

      if (rpcError) {
        console.warn('RPC delete_user_account non trouvée ou erreur, fallback sur profiles.delete:', rpcError);
        // Fallback manuel : supprimer le profil
        if (profile) {
          await supabase.from('profiles').delete().eq('id', profile.id);
        }
      }

      // 2. Déconnecter la session
      await supabase.auth.signOut();
      toast.success('Votre compte et vos données ont été supprimés avec succès.');
      setIsDeleteModalOpen(false);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la suppression du compte');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Déconnexion réussie');
      router.push('/login');
      router.refresh();
    } catch (err: any) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const publicUrl = profile
    ? typeof window !== 'undefined'
      ? `${window.location.origin}/${profile.username}`
      : `https://lien-bio.vercel.app/${profile.username}`
    : '';

  const copyPublicUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    toast.success('Lien de votre carte copié !');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!profile) return null;

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            Paramètres du compte
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Gérez votre identité, la visibilité de votre carte publique et la sécurité de votre compte.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl shadow-2xs transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5 text-neutral-400" />
          <span>Se déconnecter</span>
        </button>
      </div>

      {/* 1. Identité du compte & Lien public */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 text-white font-bold flex items-center justify-center text-base shadow-xs shrink-0 overflow-hidden ring-2 ring-neutral-100">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-neutral-900 text-base">
                  {profile.display_name || `@${profile.username}`}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Actif
                </span>
                {profile.is_pro ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Crown className="w-3 h-3 text-amber-600" />
                    {profile.plan === 'pro_lifetime' ? 'PRO À Vie' : 'PRO Abonnement'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                    Formule Gratuite
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5 truncate">
                {loadingAuth ? 'Chargement du compte...' : authUser?.email || `@${profile.username}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={copyPublicUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-700 transition shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
              <span>{copiedLink ? 'Copié !' : 'Copier le lien'}</span>
            </button>
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir ma carte</span>
            </a>
          </div>
        </div>

        {/* Snippet URL box */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs text-neutral-600">
          <Globe className="w-4 h-4 text-neutral-400 shrink-0" />
          <span className="text-neutral-400 font-medium">Lien public :</span>
          <span className="font-mono text-neutral-800 font-medium truncate select-all">{publicUrl}</span>
        </div>

        {/* Alerte si changement d'email en cours */}
        {authUser?.new_email && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Confirmation d'email requise</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Un email de validation a été envoyé à <strong>{authUser.new_email}</strong>. Cliquez sur le lien reçu pour confirmer le changement.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Formule & Facturation */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                Formule & Facturation
              </h3>
              {profile.is_pro ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  {profile.plan === 'pro_lifetime' ? 'Pack PRO À Vie' : 'Abonnement PRO Actif'}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Formule Gratuite
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 max-w-lg leading-relaxed">
              {profile.plan === 'pro_lifetime'
                ? 'Félicitations ! Vous bénéficiez de l’accès définitif à vie. Aucune reconduction ni paiement supplémentaire ne sera demandé.'
                : profile.is_pro
                ? 'Vous profitez de toutes les fonctionnalités PRO. Vous pouvez passer à l’offre annuelle (-28%) ou choisir l’accès définitif À VIE à tout moment.'
                : 'Passez à la formule PRO pour débloquer tous les thèmes de luxe, les liens illimités, la boutique PDF et les statistiques complètes.'}
            </p>
          </div>

          <div className="shrink-0">
            {profile.plan === 'pro_lifetime' ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Accès À Vie Garanti</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={openUpgradeModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs hover:scale-[1.01] active:scale-[0.99]"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>{profile.is_pro ? "Changer de formule / Passer à Vie" : "Passer à la formule PRO"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Statut de visibilité */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                Visibilité de votre carte
              </h3>
              {profile.is_published ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Publique (En ligne)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  Privée (Masquée)
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-2xl">
              {profile.is_published
                ? 'Votre carte est actuellement en ligne et accessible publiquement à tout visiteur disposant de votre lien.'
                : 'Votre carte est masquée. Le lien public n’affiche plus votre profil aux visiteurs (l’aperçu reste accessible dans votre tableau de bord).'}
            </p>
          </div>

          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs shrink-0 ${
              profile.is_published
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profile.is_published ? (
              <EyeOff className="w-4 h-4 text-neutral-500" />
            ) : (
              <Eye className="w-4 h-4 text-white" />
            )}
            <span>{profile.is_published ? 'Masquer la carte au public' : 'Mettre en ligne'}</span>
          </button>
        </div>
      </div>

      {/* 4. Nom de Domaine Personnalisé (Réservé PRO) - UI Conforme au Design */}
      {(() => {
        const activeDomain = profile?.custom_domain || profile?.theme?.custom_domain || '';
        const targetDomain = activeDomain || domainInput;

        // Diagnostic status flags
        const isDomainSaved = Boolean(activeDomain);
        const isVerified = domainStatus === 'active';

        // Compute DNS instructions
        const parts = targetDomain ? targetDomain.split('.') : [];
        const isRoot = parts.length <= 2;
        const recordType = isRoot ? 'A' : 'CNAME';
        const hostName = isRoot ? '@' : (parts.slice(0, parts.length - 2).join('.') || 'bio');
        const targetValue = isRoot ? '76.76.21.21' : 'cname.lien-bio.site';

        return (
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                    Nom de Domaine Personnalisé
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100/70 text-indigo-700 border border-indigo-200/60">
                    <Crown className="w-3 h-3 text-amber-500" />
                    Réservé PRO
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
                  Associez votre propre nom de domaine ou sous-domaine pour remplacer l’adresse par défaut de votre carte Lien-Bio.
                </p>
              </div>

              {activeDomain && (
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingDomain(!isEditingDomain)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {isEditingDomain ? 'Annuler' : 'Changer de domaine'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDomain}
                    disabled={savingDomain}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
                    title="Supprimer le domaine"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>

            {!profile.is_pro ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 border border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Crown className="w-4.5 h-4.5 text-amber-300" />
                  </div>
                  <div className="text-xs text-neutral-700">
                    <span className="font-bold text-neutral-900 block">Fonctionnalité PRO : Nom de domaine propre</span>
                    Connectez votre marque à 100% sans dépendre de lien-bio.site.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openUpgradeModal}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shrink-0 cursor-pointer shadow-2xs"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Passer PRO</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Domain Input Form */}
                {(!activeDomain || isEditingDomain) && (
                  <form onSubmit={handleSaveDomain} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ex: bio.mon-entreprise.com ou mon-nom.com"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50/80 border border-neutral-200 text-neutral-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingDomain || !domainInput.trim()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {savingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Enregistrer le domaine</span>
                    </button>
                  </form>
                )}

                {/* DNS Instructions Card (Violet/Purple Styled) */}
                <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-indigo-600" />
                      Instruction de configuration DNS chez votre registrar :
                    </h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Rendez-vous sur votre espace d'administration DNS (OVH, GoDaddy, Cloudflare, Namecheap...) et ajoutez l'enregistrement ci-dessous :
                    </p>
                  </div>

                  {/* DNS Record Table */}
                  <div className="bg-white border border-neutral-200/80 rounded-xl p-3.5 shadow-2xs space-y-3">
                    <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                      <div className="col-span-3">TYPE D'ENREGISTREMENT</div>
                      <div className="col-span-4 flex items-center justify-between">
                        <span>NOM / HÔTE</span>
                        <span className="text-[10px] lowercase text-neutral-400 font-normal">Copier</span>
                      </div>
                      <div className="col-span-5 flex items-center justify-between">
                        <span>CIBLE / VALEUR</span>
                        <span className="text-[10px] lowercase text-neutral-400 font-normal">Copier</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2.5 items-center">
                      <div className="w-full sm:col-span-3">
                        <span className="inline-block px-3 py-1.5 rounded-lg bg-indigo-100/70 text-indigo-700 font-extrabold text-xs tracking-wide">
                          {recordType}
                        </span>
                      </div>

                      <div className="w-full sm:col-span-4 flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono text-neutral-800">
                        <span className="truncate font-semibold">{hostName}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyValue(hostName, 'host')}
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px] font-sans font-medium transition cursor-pointer ml-2"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </button>
                      </div>

                      <div className="w-full sm:col-span-5 flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono text-neutral-800">
                        <span className="truncate font-semibold">{targetValue}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyValue(targetValue, 'target')}
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px] font-sans font-medium transition cursor-pointer ml-2"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DIAGNOSTIC DE VÉRIFICATION EN DIRECT */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider">
                      DIAGNOSTIC DE VÉRIFICATION EN DIRECT :
                    </h4>
                    {isDomainSaved && (
                      <button
                        type="button"
                        onClick={handleCheckDns}
                        disabled={checkingDns}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 text-xs font-bold transition shadow-2xs cursor-pointer"
                      >
                        {checkingDns ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>{checkingDns ? 'Vérification...' : 'Tester le DNS maintenant'}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Item 1 */}
                    <div className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                      isDomainSaved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}>
                      <Check className={`w-4 h-4 ${isDomainSaved ? 'text-emerald-600' : 'text-neutral-400'}`} />
                      <span>1. Domaine lié à votre compte Lien-Bio</span>
                    </div>

                    {/* Item 2 */}
                    <div className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                      isVerified || isDomainSaved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}>
                      <Check className={`w-4 h-4 ${isVerified || isDomainSaved ? 'text-emerald-600' : 'text-neutral-400'}`} />
                      <span>2. Certificat SSL/HTTPS Vercel provisionné</span>
                    </div>

                    {/* Item 3 */}
                    <div className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isDomainSaved
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}>
                      {isVerified ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : isDomainSaved ? (
                        <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-neutral-300 inline-block shrink-0" />
                      )}
                      <span>
                        {isVerified
                          ? '3. Propagation DNS validée'
                          : '3. Propagation DNS en cours chez votre registrar'}
                      </span>
                    </div>

                    {/* Item 4 */}
                    <div className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                    }`}>
                      <Globe className={`w-4 h-4 ${isVerified ? 'text-emerald-600' : 'text-neutral-400'}`} />
                      <span>
                        {isVerified
                          ? '4. Domaine actif & prêt !'
                          : '4. En attente de la propagation (1 à 24h)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 3. Adresse email de connexion */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-neutral-900">
            Adresse email du compte
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Email de connexion actuel : <strong className="text-neutral-800 font-semibold">{authUser?.email || 'Non renseignée'}</strong>
          </p>
        </div>

        {emailSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateEmail} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="Nouvelle adresse email (ex: alex@exemple.com)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/5 text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm transition outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updatingEmail || !newEmail.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs transition shadow-2xs shrink-0"
          >
            {updatingEmail ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Enregistrer l'email</span>
          </button>
        </form>

        <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-neutral-400 shrink-0" />
          <span>Un email de confirmation sera envoyé à votre nouvelle adresse pour finaliser la mise à jour.</span>
        </p>
      </div>

      {/* 4. Sécurité & Mot de passe */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-neutral-900">
            Sécurité du mot de passe
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Définissez un mot de passe sécurisé d'au moins 6 caractères.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nouveau mot de passe */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/5 text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm transition outline-none"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 rounded-md"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-50 border text-neutral-900 placeholder:text-neutral-400 text-xs sm:text-sm transition outline-none ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/5'
                }`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 rounded-md"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-rose-600 font-medium">
              Les deux mots de passe ne correspondent pas.
            </p>
          )}

          <button
            type="submit"
            disabled={
              updatingPassword ||
              !newPassword ||
              newPassword.length < 6 ||
              newPassword !== confirmPassword
            }
            className="self-start inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs transition shadow-2xs"
          >
            {updatingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Mettre à jour le mot de passe</span>
          </button>
        </form>
      </div>

      {/* 5. Zone de Danger : Supprimer le compte (réservé au propriétaire) */}
      {userRole === 'owner' ? (
        <div className="bg-white border border-red-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              Zone de danger : Supprimer mon compte
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl leading-relaxed">
              Supprime définitivement votre compte, votre profil public, vos produits et toutes vos données. Cette action est irréversible.
            </p>
          </div>

          <button
            onClick={() => {
              setDeleteConfirmationText('');
              setIsDeleteModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition shrink-0 shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Supprimer le compte</span>
          </button>
        </div>
      ) : (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-center">
          <p className="text-xs text-neutral-500">
            🛡️ Vous gérez cette carte en tant que <strong>{userRole === 'admin' ? 'Co-Administrateur' : 'Assistant(e)'}</strong>. Seul le propriétaire peut supprimer ce compte ou modifier la facturation.
          </p>
        </div>
      )}

      {/* Modal de Confirmation de Suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-lg font-bold text-neutral-900">
                Êtes-vous absolument sûr ?
              </h4>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
                Cette action supprimera définitivement votre compte <strong>@{profile.username}</strong> et toutes les données associées. Vous ne pourrez plus récupérer vos liens ni vos statistiques.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-semibold text-neutral-700">
                Pour confirmer, veuillez saisir le mot <span className="font-bold text-red-600">SUPPRIMER</span> ci-dessous :
              </label>
              <input
                type="text"
                placeholder="SUPPRIMER"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-bold tracking-wider uppercase focus:outline-none focus:border-red-600 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={
                  isDeleting ||
                  deleteConfirmationText.trim().toUpperCase() !== 'SUPPRIMER'
                }
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition shadow-sm"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

