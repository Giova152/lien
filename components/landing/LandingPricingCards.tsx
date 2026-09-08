'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Sparkles, Loader2, ArrowRight, ShieldCheck, X } from '@/components/ui/Icons';
import { toast } from 'sonner';

interface LandingPricingCardsProps {
  user: any;
}

export function LandingPricingCards({ user }: LandingPricingCardsProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [authPromptPlan, setAuthPromptPlan] = useState<'monthly' | 'yearly' | 'lifetime' | null>(null);

  const handlePlanClick = async (plan: 'monthly' | 'yearly' | 'lifetime') => {
    // Si l'utilisateur n'est pas connecté, afficher la modale d'inscription rapide
    if (!user) {
      setAuthPromptPlan(plan);
      return;
    }

    // Si l'utilisateur est connecté, initier directement le paiement sécurisé
    try {
      setLoadingPlan(plan);
      toast.loading('Connexion sécurisée au paiement...', { id: 'landing-checkout' });

      const res = await fetch('/api/maketou/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.', { id: 'landing-checkout' });
        setAuthPromptPlan(plan);
        setLoadingPlan(null);
        return;
      }

      const data = await res.json();

      if (data.url) {
        toast.success('Paiement initié ! Redirection en cours...', { id: 'landing-checkout' });
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erreur lors de l’initialisation du paiement', { id: 'landing-checkout' });
        setLoadingPlan(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur de connexion au service de paiement', { id: 'landing-checkout' });
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full text-left">
        {/* Plan Gratuit */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Gratuit</span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold">
                Pour débuter
              </span>
            </div>
            <div className="mt-2 mb-1">
              <span className="text-3xl font-black text-neutral-900">0 $</span>
              <span className="text-xs text-neutral-400 ml-1">pour toujours</span>
            </div>
            <p className="text-xs text-neutral-500 mb-5">Idéal pour créer une carte simple avec vos liens essentiels.</p>

            <ul className="flex flex-col gap-2.5 text-xs text-neutral-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1 lien personnalisé</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thème Linette Ivoire & Or</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Export vCard & QR Code</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <span className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center text-[10px] shrink-0">✕</span>
                <span className="line-through">Services & Rendez-vous</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <span className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center text-[10px] shrink-0">✕</span>
                <span className="line-through">Boutique & Produits PDF</span>
              </li>
            </ul>
          </div>

          <Link
            href={user ? '/dashboard' : '/register'}
            className="w-full mt-7 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold text-center transition border border-neutral-200"
          >
            {user ? 'Accéder à mon espace' : 'Commencer gratuitement'}
          </Link>
        </div>

        {/* Plan PRO Abonnement */}
        <div className="bg-white border-2 border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">PRO Abonnement</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                Sans engagement
              </span>
            </div>

            {/* Toggle Mensuel / Annuel */}
            <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 mb-3">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                  billingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>Annuel</span>
                <span className={`text-[9px] px-1 rounded font-black ${billingCycle === 'yearly' ? 'bg-emerald-400 text-neutral-950' : 'bg-emerald-100 text-emerald-700'}`}>-28%</span>
              </button>
            </div>

            {/* Prix */}
            <div className="mb-4">
              {billingCycle === 'monthly' ? (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-neutral-900">35 $</span>
                    <span className="text-xs text-neutral-500">/ mois</span>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-bold block mt-0.5">
                    ≈ 21 000 FCFA / mois
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-neutral-900">300 $</span>
                    <span className="text-xs text-neutral-500">/ an</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                    ≈ 180 000 FCFA / an (Soit 25 $/m • -28%)
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-neutral-600 mb-5">Idéal pour les créateurs et indépendants avec flexibilité totale.</p>

            <ul className="flex flex-col gap-2.5 text-xs text-neutral-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Tous les thèmes de luxe</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Liens personnalisés illimités</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Services & Prise de RDV Calendly</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Boutique & Produits Digitaux PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Statistiques & Analytics de clics</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={loadingPlan !== null}
            onClick={() => handlePlanClick(billingCycle)}
            className="w-full mt-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold text-center transition shadow-xs flex items-center justify-center gap-2"
          >
            {loadingPlan === billingCycle ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Passer à PRO ({billingCycle === 'monthly' ? '21 000 FCFA' : '180 000 FCFA'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Plan PRO À VIE */}
        <div className="bg-white border-2 border-amber-500/70 rounded-2xl p-6 flex flex-col justify-between shadow-md relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">PRO À Vie</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                Paiement unique
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-neutral-900">500 $</span>
                <span className="text-xs text-neutral-500">/ accès à vie</span>
              </div>
              <span className="text-[11px] text-amber-700 font-bold block mt-0.5">
                ≈ 300 000 FCFA (0 $ ensuite • Tout inclus)
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-5">
              Payez une seule fois, profitez de toutes les fonctionnalités pour toujours.
            </p>

            <ul className="flex flex-col gap-2.5 text-xs text-neutral-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-neutral-900">Tout le plan PRO inclus</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-bold text-amber-900">Accès illimité À VIE (0 $ ensuite)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Badge officiel Créateur Vérifié</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Toutes les futures fonctionnalités incluses</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Support prioritaire VIP</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={loadingPlan !== null}
            onClick={() => handlePlanClick('lifetime')}
            className="w-full mt-7 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold text-center transition shadow-xs flex items-center justify-center gap-2"
          >
            {loadingPlan === 'lifetime' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Obtenir l&apos;accès à vie (300 000 FCFA)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>


      {/* Modal d'Authentification / Inscription avant paiement si l'utilisateur n'est pas encore connecté */}
      {authPromptPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 flex flex-col gap-5 relative text-left">
            <button
              onClick={() => setAuthPromptPlan(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {authPromptPlan === 'lifetime' ? 'Pack PRO À Vie' : 'Abonnement PRO'}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  {authPromptPlan === 'lifetime' ? '300 000 FCFA (500 $) à vie' : authPromptPlan === 'yearly' ? '180 000 FCFA / an' : '21 000 FCFA / mois'}
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs text-neutral-600 leading-relaxed">
              Pour associer votre formule PRO à votre lien public et bénéficier de l'activation automatique dès validation de votre paiement, veuillez vous inscrire ou vous connecter :
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={`/register?plan=${authPromptPlan}&redirect=${encodeURIComponent(`/dashboard?upgrade=true&plan=${authPromptPlan}`)}`}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>Créer un compte et continuer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/login?redirect=${encodeURIComponent(`/dashboard?upgrade=true&plan=${authPromptPlan}`)}`}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs text-center transition border border-neutral-200"
              >
                J'ai déjà un compte : Se connecter
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
