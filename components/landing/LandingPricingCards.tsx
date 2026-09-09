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
  const [authPromptPlan, setAuthPromptPlan] = useState<'yearly' | 'lifetime' | null>(null);
  const [checkoutModalConfig, setCheckoutModalConfig] = useState<{
    isOpen: boolean;
    productId: string;
    planTitle: string;
  } | null>(null);

  const handlePlanClick = (plan: 'yearly' | 'lifetime') => {
    // Si l'utilisateur n'est pas connecté, afficher la modale d'inscription rapide
    if (!user) {
      setAuthPromptPlan(plan);
      return;
    }

    // Si l'utilisateur est connecté, ouvrir directement le terminal Chariow sans redirection
    const productId = plan === 'lifetime' ? CHARIOW_PRODUCTS.LIFETIME : CHARIOW_PRODUCTS.YEARLY;
    const planTitle = plan === 'lifetime' ? 'Pack PRO À Vie (500 $)' : 'Formule PRO 1 An (185 $)';
    setCheckoutModalConfig({
      isOpen: true,
      productId,
      planTitle,
    });
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

        {/* Plan PRO Abonnement 1 An */}
        <div className="bg-white border-2 border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">PRO 1 An</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                Accès 12 mois
              </span>
            </div>

            {/* Prix */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-neutral-900">185 $</span>
                <span className="text-xs text-neutral-500">/ an</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-bold block mt-0.5">
                Soit ~15 $/mois • Facturé annuellement
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-5">Idéal pour les créateurs et indépendants avec flexibilité totale pendant 1 an.</p>

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
            onClick={() => handlePlanClick('yearly')}
            className="w-full mt-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold text-center transition shadow-xs flex items-center justify-center gap-2"
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
                  {authPromptPlan === 'lifetime' ? 'Pack PRO À Vie' : 'Formule PRO 1 An'}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  {authPromptPlan === 'lifetime' ? '500 $ à vie (Paiement unique)' : '185 $ / an'}
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
          setCheckoutModalConfig(null);
          window.location.href = '/dashboard?upgrade_success=true';
        }}
      />
    </>
  );
}
