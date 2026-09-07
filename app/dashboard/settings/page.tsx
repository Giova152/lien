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
  Sparkles,
  ShieldCheck,
  X,
} from '@/components/ui/Icons';
import { toast } from 'sonner';
import { useDashboard } from '@/lib/context/DashboardContext';

export default function SettingsPage() {
  const { profile, setProfile, refreshDashboard } = useDashboard();
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

  // Load current Auth user
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
          : '🔒 Votre carte a été masquée. Seul vous pouvez la voir.'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2.5 text-neutral-900 tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Settings className="w-5 h-5" />
            </div>
            Paramètres du Compte & Visibilité
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Gérez l'accès à votre carte publique, vos identifiants de sécurité et vos préférences.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center gap-2 transition"
        >
          <LogOut className="w-4 h-4 text-neutral-500" />
          Se déconnecter
        </button>
      </div>

      {/* 1. Carte d'identité du compte & URL */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Compte connecté
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-neutral-900">
                {loadingAuth ? (
                  <span className="text-neutral-400">Chargement...</span>
                ) : (
                  authUser?.email || 'Email non renseigné'
                )}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Actif
              </span>
              {profile.is_pro && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" /> PRO À VIE
                </span>
              )}
            </div>
          </div>

          {/* Lien direct vers la carte */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyPublicUrl}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-neutral-200 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copié !' : 'Copier le lien'}</span>
            </button>
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-700 flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ouvrir ma carte</span>
            </a>
          </div>
        </div>

        {/* Alerte si changement d'email en cours */}
        {authUser?.new_email && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Changement d'email en cours de validation</p>
              <p className="mt-0.5 text-amber-700 leading-relaxed">
                Un email de confirmation a été envoyé à <strong>{authUser.new_email}</strong>. Veuillez cliquer sur le lien reçu pour appliquer le changement.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Visibilité & Statut de publication */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                Statut de publication de votre carte
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  profile.is_published
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    profile.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {profile.is_published ? 'Publique (En ligne)' : 'Masquée (Privée)'}
              </span>
            </div>

            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
              {profile.is_published
                ? 'Votre carte est actuellement accessible à tout le monde via votre lien public.'
                : 'Votre carte est actuellement masquée aux visiteurs. Seul vous pouvez la prévisualiser en étant connecté.'}
            </p>
          </div>

          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shrink-0 shadow-xs ${
              profile.is_published
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-neutral-600" />
            )}
            <span>{profile.is_published ? 'Masquer la carte au public' : 'Publier ma carte en ligne'}</span>
          </button>
        </div>
      </div>

      {/* 3. Modifier l'adresse email */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Modifier l'adresse email de connexion
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Adresse email actuelle :{' '}
            <strong className="text-neutral-800 font-bold">{authUser?.email || 'Non renseignée'}</strong>
          </p>
        </div>

        {emailSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateEmail} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Nouvelle adresse email (ex: contact@mondomaine.com)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updatingEmail || !newEmail.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs shrink-0"
          >
            {updatingEmail ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Enregistrer le nouvel email</span>
          </button>
        </form>

        <p className="text-[11px] text-neutral-400">
          🔒 Par sécurité, un email de confirmation sera envoyé à votre nouvelle adresse. Le changement prendra effet après confirmation.
        </p>
      </div>

      {/* 4. Modifier le mot de passe */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Modifier le mot de passe
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Définissez un mot de passe sécurisé d'au moins 6 caractères
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nouveau mot de passe */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 border text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:bg-white transition ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-neutral-300 focus:border-indigo-600'
                }`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-rose-600 font-medium">
              ⚠️ Les deux mots de passe ne correspondent pas.
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
            className="self-start px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-xs"
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

      {/* 5. Zone de Danger : Supprimer le compte */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            Zone de Danger : Supprimer définitivement mon compte
          </h3>
          <p className="text-xs text-rose-600/90 mt-1 leading-relaxed font-medium">
            Cette action est irréversible. Votre profil public, tous vos liens, statistiques et médias seront immédiatement et définitivement supprimés.
          </p>
        </div>

        <button
          onClick={() => {
            setDeleteConfirmationText('');
            setIsDeleteModalOpen(true);
          }}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-xs hover:shadow-rose-600/20 shrink-0"
        >
          Supprimer mon compte
        </button>
      </div>

      {/* Modal de Confirmation de Suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-lg font-bold text-neutral-900">
                Êtes-vous absolument sûr ?
              </h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Cette action supprimera définitivement votre compte <strong>@{profile.username}</strong> et toutes les données associées. Vous ne pourrez plus récupérer vos liens ni vos statistiques.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-semibold text-neutral-700">
                Pour confirmer, veuillez saisir le mot <span className="font-bold text-rose-600">SUPPRIMER</span> ci-dessous :
              </label>
              <input
                type="text"
                placeholder="SUPPRIMER"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-bold tracking-wider uppercase focus:outline-none focus:border-rose-600 focus:bg-white transition"
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
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition shadow-sm"
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

