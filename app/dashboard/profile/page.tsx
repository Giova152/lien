'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { sanitizeUsername } from '@/lib/utils';
import { ImageCropperModal } from '@/components/dashboard/ImageCropperModal';
import {
  User,
  Building2,
  Briefcase,
  Upload,
  Check,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Camera,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

import { useDashboard } from '@/lib/context/DashboardContext';

export default function ProfilePage() {
  const { profile, setProfile, refreshDashboard } = useDashboard();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [title, setTitle] = useState(profile?.title || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  // Avatar / Cover Cropper Modals
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);
  const [isCoverCropOpen, setIsCoverCropOpen] = useState(false);

  // Username validation
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(true);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setTitle(profile.title || '');
      setCompany(profile.company || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  // Username change check
  useEffect(() => {
    if (!username || username === profile?.username) {
      setUsernameAvailable(true);
      return;
    }

    const cleaned = sanitizeUsername(username);
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(cleaned)}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, profile?.username]);

  const handleUploadImage = async (file: File, bucket: 'avatars' | 'covers') => {
    if (!profile) return;

    try {
      const fileExt = 'webp';
      const fileName = `${profile.id}-${bucket}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      const fieldToUpdate = bucket === 'avatars' ? 'avatar_url' : 'cover_url';

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [fieldToUpdate]: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      if (setProfile) {
        setProfile((prev) => (prev ? { ...prev, [fieldToUpdate]: publicUrl } : prev));
      }

      toast.success(bucket === 'avatars' ? 'Photo de profil mise à jour !' : 'Bannière mise à jour !');
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'envoi de l'image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const cleanedUsername = sanitizeUsername(username);
    if (!cleanedUsername || usernameAvailable === false) {
      toast.error('Veuillez spécifier un nom d’utilisateur valide et disponible');
      return;
    }

    try {
      setSaving(true);
      const updatedData = {
        display_name: displayName.trim(),
        username: cleanedUsername,
        title: title.trim() || null,
        company: company.trim() || null,
        bio: bio.trim() || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', profile.id);

      if (error) throw error;

      if (setProfile) {
        setProfile((prev) => (prev ? { ...prev, ...updatedData } : prev));
      }

      toast.success('Profil mis à jour avec succès !');
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="w-full flex flex-col gap-6 text-white">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          Éditer le Profil
        </h2>
        <p className="text-xs text-neutral-400">
          Modifiez vos informations personnelles, photos et biographie
        </p>
      </div>

      {/* Image Upload Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Avatar Upload */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col items-center text-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Photo de profil (1:1)
          </label>
          <div className="relative mb-3 group">
            {profile.avatar_url ? (
              <div className="w-24 h-24 rounded-full overflow-hidden relative border-2 border-indigo-500/50 shadow-lg">
                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center text-2xl font-bold text-indigo-400 border-2 border-dashed border-neutral-700">
                {profile.display_name?.slice(0, 2).toUpperCase() || 'P'}
              </div>
            )}
            <button
              onClick={() => setIsAvatarCropOpen(true)}
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsAvatarCropOpen(true)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded-xl transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Changer la photo
          </button>
        </div>

        {/* Cover Upload */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col items-center text-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Bannière de couverture (3:1)
          </label>
          <div className="relative w-full h-24 rounded-xl overflow-hidden mb-3 group border border-neutral-800 bg-neutral-950 flex items-center justify-center">
            {profile.cover_url ? (
              <Image src={profile.cover_url} alt="Cover" fill className="object-cover" />
            ) : (
              <span className="text-xs text-neutral-500">Aucune bannière définie</span>
            )}
            <button
              onClick={() => setIsCoverCropOpen(true)}
              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsCoverCropOpen(true)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium rounded-xl transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Changer la bannière
          </button>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Nom d'utilisateur (URL Slug) *
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-xs text-neutral-500 font-mono">lien.me/</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                const cleaned = sanitizeUsername(e.target.value);
                setUsername(cleaned);
                if (setProfile) setProfile((prev) => (prev ? { ...prev, username: cleaned } : prev));
              }}
              className="w-full pl-20 pr-10 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <div className="absolute right-3">
              {checkingUsername && <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />}
              {!checkingUsername && usernameAvailable === true && username !== profile.username && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              {!checkingUsername && usernameAvailable === false && (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              )}
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Nom d'affichage *
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (setProfile) setProfile((prev) => (prev ? { ...prev, display_name: e.target.value } : prev));
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Poste / Titre
            </label>
            <input
              type="text"
              placeholder="Ex: Développeur Senior"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (setProfile) setProfile((prev) => (prev ? { ...prev, title: e.target.value } : prev));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Entreprise / Organisation
            </label>
            <input
              type="text"
              placeholder="Ex: Google Inc."
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (setProfile) setProfile((prev) => (prev ? { ...prev, company: e.target.value } : prev));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Biographie / Description courte
          </label>
          <textarea
            rows={3}
            placeholder="Présentez votre activité en quelques mots..."
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (setProfile) setProfile((prev) => (prev ? { ...prev, bio: e.target.value } : prev));
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || usernameAvailable === false}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg mt-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {saving ? 'Enregistrement...' : 'Sauvegarder le profil'}
        </button>
      </form>

      {/* Avatar Cropper Modal */}
      <ImageCropperModal
        isOpen={isAvatarCropOpen}
        onClose={() => setIsAvatarCropOpen(false)}
        aspectRatio={1}
        title="Recadrer la photo de profil"
        onCropComplete={(file) => handleUploadImage(file, 'avatars')}
      />

      {/* Cover Cropper Modal */}
      <ImageCropperModal
        isOpen={isCoverCropOpen}
        onClose={() => setIsCoverCropOpen(false)}
        aspectRatio={3}
        title="Recadrer la bannière de couverture"
        onCropComplete={(file) => handleUploadImage(file, 'covers')}
      />
    </div>
  );
}
