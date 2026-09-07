'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Mail, Lock, Loader2, ArrowRight } from '@/components/ui/Icons';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (error) {
        if (error.message?.includes('fetch failed') || error.message?.includes('Failed to fetch')) {
          toast.error('Projet Supabase inaccessible ou en pause. Vérifiez le tableau de bord Supabase.');
        } else {
          toast.error(error.message || 'Erreur lors de l’inscription');
        }
        return;
      }

      // Check for already existing email
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.error('Cet email est déjà associé à un compte. Veuillez vous connecter.');
        return;
      }

      // If email confirmation is required by Supabase (no immediate session)
      if (data.user && !data.session) {
        setEmailSent(true);
        toast.success('Compte créé ! Un email de confirmation vous a été envoyé.');
        return;
      }

      toast.success('Compte créé ! Configuration de votre profil...');
      router.push('/onboarding');
      router.refresh();
    } catch (err: any) {
      if (err?.message?.includes('fetch failed')) {
        toast.error('Connexion impossible à Supabase : votre projet Supabase est probablement en pause.');
      } else {
        toast.error(err?.message || 'Erreur lors de la création de compte');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 via-white to-slate-50 text-neutral-900 relative overflow-hidden font-sans">
      {/* Soft Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 font-black text-2xl mb-8 group relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md ring-1 ring-black/5 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5" />
        </div>
        <span>Lien<span className="text-indigo-600">-Bio</span></span>
      </Link>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-neutral-200/80 rounded-3xl p-8 sm:p-9 shadow-2xl shadow-neutral-300/30 relative z-10">
        {emailSent ? (
          <div className="flex flex-col items-center text-center gap-4 py-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-sm">
              <Mail className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Vérifiez vos emails</h1>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-xs">
              Un lien de confirmation a été envoyé à <strong>{email}</strong>. Cliquez dessus pour finaliser votre inscription et accéder à votre dashboard.
            </p>
            <Link
              href="/login"
              className="mt-4 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-neutral-900 text-center tracking-tight mb-1">Créer ma carte</h1>
            <p className="text-xs text-neutral-500 text-center mb-7">
              Obtenez votre URL personnalisée en 60 secondes
            </p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="6 caractères minimum"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 mt-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-7 pt-6 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-500">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
