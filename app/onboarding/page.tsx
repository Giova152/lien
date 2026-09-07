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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 via-white to-slate-50 text-neutral-900 relative overflow-hidden font-sans">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-3xl p-8 sm:p-9 shadow-2xl shadow-neutral-300/30 relative z-10">
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-neutral-900 text-center tracking-tight mb-1">Bienvenue sur Lien-Bio</h1>
        <p className="text-xs text-neutral-500 text-center mb-7">
          Configurez votre lien unique et votre profil en quelques instants
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username Input with Live Availability Check */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Votre lien personnalisé *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs text-neutral-400 font-mono select-none">
                lien-bio/
              </span>
              <input
                type="text"
                required
                placeholder="votre_pseudo"
                value={username}
                onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
                className="w-full pl-[76px] pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-xs font-mono font-medium focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all"
              />
              <div className="absolute right-3">
                {checkingUsername && <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />}
                {!checkingUsername && usernameAvailable === true && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                )}
              </div>
            </div>

            {usernameError && (
              <p className="text-[11px] text-rose-500 mt-1.5 font-medium">{usernameError}</p>
            )}
            {usernameAvailable === true && (
              <p className="text-[11px] text-emerald-600 mt-1.5 font-semibold flex items-center gap-1">
                <span>✓</span>
                <span>lien-bio/{sanitizeUsername(username)} est disponible !</span>
              </p>
            )}
          </div>

          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Nom complet / Marque *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ex: Sophie Martin"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all"
              />
            </div>
          </div>

          {/* Title / Profession Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Titre / Profession (Optionnel)
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: Fondatrice, Designer, Consultante..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || usernameAvailable !== true}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 mt-3 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {submitting ? 'Création en cours...' : 'Accéder à mon tableau de bord'}
          </button>
        </form>
      </div>
    </div>
  );
}
