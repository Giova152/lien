'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { sanitizeUsername, DEFAULT_THEME } from '@/lib/utils';
import {
  Sparkles,
  User,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  ArrowRight,
  Briefcase,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function initUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // Check if profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && profile.username) {
        router.push('/dashboard');
      }
    }
    initUser();
  }, [router, supabase]);

  // Debounce username check
  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(null);
      setUsernameError(null);
      return;
    }

    const cleaned = sanitizeUsername(username);
    if (cleaned.length < 3) {
      setUsernameAvailable(false);
      setUsernameError('Le nom d’utilisateur doit comporter au moins 3 caractères');
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(cleaned)}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
        setUsernameError(data.error || null);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const cleanedUsername = sanitizeUsername(username);

    if (!cleanedUsername || usernameAvailable === false) {
      toast.error('Veuillez choisir un nom d’utilisateur valide et disponible');
      return;
    }

    if (!displayName.trim()) {
      toast.error('Veuillez préciser votre nom d’affichage');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Create Profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        username: cleanedUsername,
        display_name: displayName.trim(),
        title: title.trim() || null,
        theme: DEFAULT_THEME,
        is_published: true,
      });

      if (profileError) throw profileError;

      // 2. Create Contact Info row
      await supabase.from('contact_info').insert({
        profile_id: userId,
        show_save_contact_button: true,
      });

      toast.success('Votre carte digitale est prête !');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la création du profil');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-950 text-white relative overflow-hidden">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1">Bienvenue !</h1>
        <p className="text-sm text-neutral-400 text-center mb-6">
          Choisissez l'URL personnalisée de votre carte de visite
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username Input with Live Availability Check */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              URL Personnalisée *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm text-neutral-500 font-mono select-none">
                lien.me/
              </span>
              <input
                type="text"
                required
                placeholder="votre_pseudo"
                value={username}
                onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
                className="w-full pl-20 pr-10 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-sm font-mono"
              />
              <div className="absolute right-3">
                {checkingUsername && <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />}
                {!checkingUsername && usernameAvailable === true && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                )}
              </div>
            </div>

            {usernameError && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{usernameError}</p>
            )}
            {usernameAvailable === true && (
              <p className="text-xs text-emerald-400 mt-1 font-medium">
                https://lien.me/{sanitizeUsername(username)} est disponible !
              </p>
            )}
          </div>

          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Nom complet / Marque *
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ex: Jean Dupont"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Title / Profession Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Titre / Post (Optionnel)
            </label>
            <div className="relative">
              <Briefcase className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: Développeur Web, Consultant..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || usernameAvailable !== true}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg mt-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {submitting ? 'Création de votre page...' : 'Accéder à mon tableau de bord'}
          </button>
        </form>
      </div>
    </div>
  );
}
