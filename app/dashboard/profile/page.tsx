'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { sanitizeUsername } from '@/lib/utils';
import { ImageCropperModal } from '@/components/dashboard/ImageCropperModal';
import {
  User,
  Upload,
  Check,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Camera,
  MapPin,
  Plus,
  Trash2,
  X,
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
  const [location, setLocation] = useState(profile?.theme?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [expertiseTags, setExpertiseTags] = useState<string[]>(profile?.theme?.expertise_tags || []);
  const [newTagInput, setNewTagInput] = useState('');
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
      setLocation(profile.theme?.location || '');
      setBio(profile.bio || '');
      setExpertiseTags(profile.theme?.expertise_tags || []);
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
      toast.error(err?.message || 'Erreur lors de l’envoi de l’image');
    }
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (expertiseTags.includes(trimmed)) {
      toast.error('Ce domaine a déjà été ajouté');
      return;
    }
    const next = [...expertiseTags, trimmed];
    setExpertiseTags(next);
    setNewTagInput('');
    if (setProfile) {
      setProfile((prev) => (prev ? { ...prev, theme: { ...(prev.theme || {}), expertise_tags: next } } : prev));
    }
  };

  const handleRemoveTag = (index: number) => {
    const next = expertiseTags.filter((_, i) => i !== index);
    setExpertiseTags(next);
    if (setProfile) {
      setProfile((prev) => (prev ? { ...prev, theme: { ...(prev.theme || {}), expertise_tags: next } } : prev));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const cleanedUsername = sanitizeUsername(username);
    if (!cleanedUsername) {
      toast.error('Le nom d’utilisateur ne peut pas être vide');
      return;
    }

    if (usernameAvailable === false) {
      toast.error('Veuillez spécifier un nom d’utilisateur valide et disponible');
      return;
    }

    try {
      setSaving(true);
      const updatedTheme = {
        ...(profile.theme || {}),
        location: location.trim() || null,
        expertise_tags: expertiseTags,
      };

      const updatedData = {
        display_name: displayName.trim(),
        username: cleanedUsername,
        title: title.trim() || null,
        company: company.trim() || null,
        bio: bio.trim() || null,
        theme: updatedTheme,
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
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
          <User className="w-5 h-5 text-indigo-600" />
          Éditer le Profil
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Modifiez vos informations personnelles, photos et biographie
        </p>
      </div>

      {/* Image Upload Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Avatar Upload */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">
            Photo de profil (1:1)
          </label>
          <div className="relative mb-3 group">
            {profile.avatar_url ? (
              <div className="w-24 h-24 rounded-full overflow-hidden relative border-2 border-indigo-500/50 shadow-md">
                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-2xl font-bold text-indigo-600 border-2 border-dashed border-indigo-200">
                {profile.display_name?.slice(0, 2).toUpperCase() || 'P'}
              </div>
            )}
            <button
              onClick={() => setIsAvatarCropOpen(true)}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsAvatarCropOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-neutral-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-neutral-200 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Changer la photo
          </button>
        </div>

        {/* Cover Upload */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">
            Bannière de couverture (3:1)
          </label>
          <div className="relative w-full h-24 rounded-xl overflow-hidden mb-3 group border border-neutral-200 bg-slate-100 flex items-center justify-center">
            {profile.cover_url ? (
              <Image src={profile.cover_url} alt="Cover" fill className="object-cover" />
            ) : (
              <span className="text-xs text-neutral-400 font-medium">Aucune bannière définie</span>
            )}
            <button
              onClick={() => setIsCoverCropOpen(true)}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsCoverCropOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-neutral-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-neutral-200 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Changer la bannière
          </button>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/80 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
        {/* Username */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Nom d'utilisateur (URL Slug) *
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-xs text-neutral-500 font-mono font-bold">lien-bio/</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                const cleaned = sanitizeUsername(e.target.value);
                setUsername(cleaned);
                if (setProfile) setProfile((prev) => (prev ? { ...prev, username: cleaned } : prev));
              }}
              className="w-full pl-20 pr-10 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
            <div className="absolute right-3">
              {checkingUsername && <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />}
              {!checkingUsername && usernameAvailable === true && username !== profile.username && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              {!checkingUsername && usernameAvailable === false && (
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              )}
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
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
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        {/* Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Location / City */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Localisation / Ville <span className="text-neutral-400 font-normal lowercase">(facultatif)</span>
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ex: Paris, France ou Abidjan, Côte d'Ivoire"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (setProfile) {
                  setProfile((prev) => (prev ? { ...prev, theme: { ...(prev.theme || {}), location: e.target.value } } : prev));
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Biographie / Description courte <span className="text-neutral-400 font-normal lowercase">(facultatif)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Présentez votre activité en quelques mots..."
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (setProfile) setProfile((prev) => (prev ? { ...prev, bio: e.target.value } : prev));
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white resize-none transition"
          />
        </div>

        {/* Domaines d'expertise (Tags) */}
        <div className="pt-2 border-t border-neutral-200/70 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Domaines d'expertise / Spécialités <span className="text-neutral-400 font-normal lowercase">(facultatif)</span>
              </label>
              <p className="text-[11px] text-neutral-400">
                Ajoutez des mots-clés qui s'afficheront sur votre carte publique sous forme de badges.
              </p>
            </div>
          </div>

          {/* Tag Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ex: Marketing digital, Photographie, Coaching..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>

          {/* Tags list */}
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {expertiseTags.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-1">
                Aucun domaine ajouté. (La section n'apparaîtra pas sur votre carte si vide).
              </p>
            ) : (
              expertiseTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-2xs animate-in fade-in"
                >
                  <span>✦ {tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="w-4 h-4 rounded-full hover:bg-indigo-200/70 text-indigo-600 flex items-center justify-center transition"
                    title="Supprimer ce tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || usernameAvailable === false}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md mt-2 disabled:opacity-50"
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
