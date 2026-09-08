'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from '@/components/ui/Icons';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      setLoading(true);
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || 'https://www.lien-bio.site';

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        toast.error(error.message || 'Erreur lors de l’envoi de l’email');
        return;
      }

      setSubmitted(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (err: any) {
      toast.error(err?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 via-white to-slate-50 text-neutral-900 relative overflow-hidden font-sans">
      {/* Soft Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Logo */}
      <div className="mb-8 relative z-10">
        <Logo href="/" size="lg" />
      </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-neutral-200/80 rounded-3xl p-8 sm:p-9 shadow-2xl shadow-neutral-300/30 relative z-10">
        {submitted ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">Vérifiez vos emails</h1>
            <p className="text-xs text-neutral-600 leading-relaxed mb-6">
              Nous avons envoyé un lien de réinitialisation à <strong className="text-neutral-900">{email}</strong>. Cliquez sur le lien reçu pour définir votre nouveau mot de passe.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
              >
                Renvoyer à une autre adresse email
              </button>

              <Link
                href="/login"
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à la connexion</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-neutral-900 text-center tracking-tight mb-1">
              Mot de passe oublié ?
            </h1>
            <p className="text-xs text-neutral-500 text-center mb-7">
              Entrez votre adresse email pour recevoir un lien de réinitialisation sécurisé.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Adresse email de votre compte
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 mt-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-neutral-100 text-center">
              <Link
                href="/login"
                className="text-xs font-bold text-neutral-600 hover:text-indigo-600 inline-flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour à la page de connexion</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
