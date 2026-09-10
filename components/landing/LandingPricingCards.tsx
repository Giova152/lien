'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Crown, Loader2, ArrowRight, ShieldCheck, X } from '@/components/ui/Icons';
import { ChariowCheckoutModal } from '@/components/chariow/ChariowCheckoutModal';
import { CHARIOW_PRODUCTS } from '@/lib/chariow-constants';
import { toast } from 'sonner';

interface LandingPricingCardsProps {
  user: any;
}

export function LandingPricingCards({ user }: LandingPricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [authPromptPlan, setAuthPromptPlan] = useState<'monthly' | 'yearly' | 'lifetime' | null>(null);
  const [checkoutModalConfig, setCheckoutModalConfig] = useState<{
    isOpen: boolean;
    productId: string;
    planTitle: string;
  } | null>(null);

  const handlePlanClick = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    // Si l'utilisateur n'est pas connecté, afficher la modale d'inscription rapide
    if (!user) {
      setAuthPromptPlan(plan);
      return;
    }

    // Si l'utilisateur est connecté, ouvrir directement le terminal Chariow sans redirection
    let productId: string = CHARIOW_PRODUCTS.YEARLY;
    let planTitle = 'Formule PRO 1 An (185 $)';

    if (plan === 'lifetime') {
      productId = CHARIOW_PRODUCTS.LIFETIME;
      planTitle = 'Pack PRO À Vie (500 $)';
    } else if (plan === 'monthly') {
      productId = CHARIOW_PRODUCTS.MONTHLY;
      planTitle = 'Formule PRO Mensuel (25 $)';
    }

    setCheckoutModalConfig({
      isOpen: true,
      productId,
      planTitle,
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto w-full text-left">
        {/* 1. Plan Gratuit */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
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
                <span className="line-through">Coachings, Formations & RDV</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-400">
                <span className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center text-[10px] shrink-0">✕</span>
                <span className="line-through">Liens dédiés & Domaine personnalisé</span>
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

        {/* 2. Plan PRO Mensuel */}
        <div className="bg-white border border-neutral-300/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">PRO Mensuel</span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-[10px] font-bold">
                Sans engagement
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-neutral-900">25 $</span>
                <span className="text-xs text-neutral-500">/ mois</span>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium block mt-0.5">
                Renouvelable chaque mois • Annulable à tout moment
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-5">Idéal pour tester tout le combo professionnel sans engagement.</p>

            <ul className="flex flex-col gap-2.5 text-xs text-neutral-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>Coachings, Accompagnements & RDV</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>Formations en ligne & Boutique PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>Agenda Pro intégré (calendar)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>Liens dédiés (/coaching, /formations)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>Domaine personnalisé & Marque blanche</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={loadingPlan !== null}
            onClick={() => handlePlanClick('monthly')}
            className="w-full mt-7 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold text-center transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loadingPlan === 'monthly' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Choisir Mensuel (25 $)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* 3. Plan PRO Abonnement 1 An (Recommandé) */}
        <div className="bg-white border-2 border-indigo-600 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md relative ring-2 ring-indigo-600/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap">
            ⭐ Plus Populaire • -38%
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">PRO 1 An</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                Économisez 38%
              </span>
            </div>

            {/* Prix */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-neutral-900">185 $</span>
                <span className="text-xs text-neutral-500 font-bold">/ an</span>
              </div>
              <span className="text-[11px] text-indigo-700 font-bold block mt-0.5">
                Soit ~15 $/mois au lieu de 25 $
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-5">La formule préférée des créateurs, coachs et consultants.</p>

            <ul className="flex flex-col gap-2.5 text-xs text-neutral-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-neutral-900">Combo Tout-en-Un complet</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Coachings, Accompagnements & Formations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Agenda Pro de réservation synchronisé</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Liens directs (/coaching, /formations, /rdv)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Nom de domaine personnalisé inclus</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={loadingPlan !== null}
            onClick={() => handlePlanClick('yearly')}
            className="w-full mt-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold text-center transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingPlan === 'yearly' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Passer à PRO 1 An (185 $)</span>
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
                Paiement unique définitif (0 $ ensuite • Tout inclus)
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
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Obtenir l&apos;accès à vie (500 $)</span>
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
                <Crown className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {authPromptPlan === 'lifetime'
                    ? 'Pack PRO À Vie'
                    : authPromptPlan === 'monthly'
                    ? 'Formule PRO Mensuel'
                    : 'Formule PRO 1 An'}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  {authPromptPlan === 'lifetime'
                    ? '500 $ à vie (Paiement unique)'
                    : authPromptPlan === 'monthly'
                    ? '25 $ / mois (Sans engagement)'
                    : '185 $ / an'}
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

      {/* Modale de Paiement In-Page Chariow (Sans redirection) */}
      <ChariowCheckoutModal
        isOpen={Boolean(checkoutModalConfig?.isOpen)}
        onClose={() => setCheckoutModalConfig(null)}
        productId={checkoutModalConfig?.productId || ''}
        planTitle={checkoutModalConfig?.planTitle}
        userEmail={user?.email}
        onSuccess={() => {
          const selectedPlan =
            checkoutModalConfig?.productId === CHARIOW_PRODUCTS.LIFETIME
              ? 'lifetime'
              : checkoutModalConfig?.productId === CHARIOW_PRODUCTS.MONTHLY
              ? 'monthly'
              : 'yearly';
          setCheckoutModalConfig(null);
          window.location.href = `/dashboard?payment=success&provider=chariow&plan=${selectedPlan}`;
        }}
      />
    </>
  );
}
