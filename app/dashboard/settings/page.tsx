'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Settings,
  ShieldAlert,
  Eye,
  Lock,
  Mail,
  Trash2,
  Check,
  Loader2,
} from '@/components/ui/Icons';
import { toast } from 'sonner';
import { useDashboard } from '@/lib/context/DashboardContext';

export default function SettingsPage() {
  const { profile, setProfile, refreshDashboard } = useDashboard();
  const router = useRouter();
  const supabase = createClient();

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleTogglePublish = async () => {
    if (!profile) return;
    try {
      setPublishing(true);
      const nextPublished = !profile.is_published;

      const { error } = await supabase
        .from('profiles')
        .update({ is_published: nextPublished })
        .eq('id', profile.id);

      if (error) throw error;

      if (setProfile) {
        setProfile((prev) => (prev ? { ...prev, is_published: nextPublished } : prev));
      }

      toast.success(
        nextPublished
          ? 'Votre page est maintenant publique et accessible à tous !'
          : 'Votre page a été dépubliée et masquée au public.'
      );
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la modification de la visibilité');
    } finally {
      setPublishing(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setUpdatingEmail(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;

      toast.success('Email mis à jour ! Un email de confirmation a été envoyé.');
      setNewEmail('');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la modification de email');
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success('Mot de passe mis à jour avec succès !');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la modification du mot de passe');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('ATTENTION : Voulez-vous vraiment supprimer définitivement votre compte et toutes vos données ?')) {
      return;
    }

    try {
      if (profile) {
        await supabase.from('profiles').delete().eq('id', profile.id);
      }
      await supabase.auth.signOut();
      toast.success('Compte supprimé avec succès.');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la suppression du compte');
    }
  };

  if (!profile) return null;

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
          <Settings className="w-5 h-5 text-indigo-600" />
          Paramètres du Compte & Visibilité
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Gérez la publication de votre page et la sécurité de votre compte
        </p>
      </div>

      {/* Publier / Dépublier le profil */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2 text-neutral-900">
            <Eye className="w-5 h-5 text-indigo-600" />
            Statut de publication de la carte
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            {profile.is_published
              ? 'Votre carte est actuellement Publique et accessible via votre lien.'
              : 'Votre carte est Privée (dépubliée). Personne ne peut y accéder.'}
          </p>
        </div>

        <button
          onClick={handleTogglePublish}
          disabled={publishing}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shrink-0 shadow-sm ${
            profile.is_published
              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
          }`}
        >
          {publishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}
          <span>{profile.is_published ? 'Dépublier le profil' : 'Publier le profil'}</span>
        </button>
      </div>

      {/* Changer Email */}
      <form onSubmit={handleUpdateEmail} className="bg-white border border-neutral-200/80 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-600" />
          Modifier l'adresse email
        </h3>

        <div>
          <input
            type="email"
            placeholder="Nouvelle adresse email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        <button
          type="submit"
          disabled={updatingEmail || !newEmail}
          className="self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          Mettre à jour l'email
        </button>
      </form>

      {/* Changer Mot de passe */}
      <form onSubmit={handleUpdatePassword} className="bg-white border border-neutral-200/80 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600" />
          Modifier le mot de passe
        </h3>

        <div>
          <input
            type="password"
            placeholder="Nouveau mot de passe (min 6 caractères)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        <button
          type="submit"
          disabled={updatingPassword || !newPassword}
          className="self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          Mettre à jour le mot de passe
        </button>
      </form>

      {/* Zone de Danger : Supprimer le compte (Épuré & Ultra-Clair) */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 shadow-sm">
        <div>
          <h3 className="text-base font-black text-rose-700 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            Zone de Danger : Supprimer le compte
          </h3>
          <p className="text-xs text-rose-600/90 mt-1 font-medium leading-relaxed">
            Cette action est irréversible. Toutes vos données, liens et statistiques seront définitivement effacés.
          </p>
        </div>

        <button
          onClick={handleDeleteAccount}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-md hover:shadow-rose-600/25 shrink-0"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
