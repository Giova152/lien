'use client';

import React, { useState, useEffect } from 'react';
import { Crown, Award, Check, X, BookOpen, BarChart3, Palette, UserCheck, Zap, Loader2, ArrowRight } from '@/components/ui/Icons';
import { LogoIcon } from '@/components/ui/Logo';
import { ChariowCheckoutModal } from '@/components/chariow/ChariowCheckoutModal';
import { CHARIOW_PRODUCTS } from '@/lib/chariow-constants';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface LifetimeUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string | null;
}

export function LifetimeUpgradeModal({ isOpen, onClose, currentPlan }: LifetimeUpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkoutModalConfig, setCheckoutModalConfig] = useState<{
    isOpen: boolean;
    productId: string;
    planTitle: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (err) {
        // Ignorer si échec
      }
    };
    fetchUser();
  }, []);

  if (!isOpen) return null;

  const handleCheckout = (plan: 'yearly' | 'lifetime') => {
    const productId = plan === 'lifetime' ? CHARIOW_PRODUCTS.LIFETIME : CHARIOW_PRODUCTS.YEARLY;
    const planTitle = plan === 'lifetime' ? 'Pack PRO À Vie (500 $)' : 'Formule PRO 1 An (185 $)';

    setCheckoutModalConfig({
      isOpen: true,
      productId,
      planTitle,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-6 my-auto max-h-[94vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition z-20"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2 relative z-10">
          <LogoIcon size="md" className="mb-1" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Formules Créateurs & Professionnels</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            {currentPlan === 'pro_subscription' ? (
              <>Faites évoluer votre formule <span className="text-indigo-600">PRO</span></>
            ) : (
              <>Choisissez votre formule <span className="text-indigo-600">PRO</span></>
            )}
          </h2>
          <p className="text-xs text-neutral-500 max-w-md">
            {currentPlan === 'pro_subscription'
              ? 'Optez pour l’accès définitif À VIE pour ne plus jamais payer d’abonnement futur.'
              : 'Choisissez entre l’accès annuel ou l’accès définitif à vie pour débloquer toutes les fonctionnalités.'}
          </p>
        </div>

        {/* The 2 PRO Offers Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {/* OFFRE 1 : ABONNEMENT PRO 1 AN */}
          <div className="bg-white border-2 border-indigo-500/50 hover:border-indigo-600 rounded-2xl p-5 flex flex-col justify-between transition relative shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Offre 1 : Abonnement 1 An
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                  Accès 12 mois
                </span>
              </div>

              <div className="h-[28px] flex items-center mb-3">
                <span className="text-xs text-neutral-500 font-medium">
                  Renouvelable chaque année, sans engagement
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-neutral-900">185 $</span>
                  <span className="text-xs text-neutral-500 font-bold">/ an</span>
                </div>
                <span className="inline-block mt-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[11px]">
                  Soit ~15 $/mois • Facturé annuellement
                </span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-700 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Liens personnalisés illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Tous les thèmes de luxe débloqués</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Services & Prise de RDV Calendly</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Boutique E-books & guides PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Statistiques & Analytics de clics</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-500">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Support prioritaire par email</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handleCheckout('yearly')}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              {loadingPlan === 'yearly' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {currentPlan === 'pro_subscription'
                      ? "Renouveler 1 An (185 $)"
                      : "Passer à PRO 1 An (185 $)"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* OFFRE 2 : PRO À VIE (LIFETIME) */}
          <div className="bg-white border-2 border-amber-500/70 rounded-2xl p-5 flex flex-col justify-between transition relative shadow-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Offre 2 : Accès Définitif
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                  Paiement unique
                </span>
              </div>

              <div className="h-[28px] flex items-center mb-3">
                <span className="text-xs text-neutral-500 font-medium">
                  Payez une seule fois, profitez-en pour toujours
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                    500 $
                  </span>
                  <span className="text-xs text-neutral-500 font-bold">/ à vie</span>
                </div>
                <span className="inline-block mt-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px]">
                  Paiement unique définitif • 0 $ ensuite
                </span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 text-xs text-neutral-700 mb-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-neutral-900">Tout ce qui est inclus dans le PRO</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-bold text-amber-900">Accès garanti À VIE (0 $ ensuite)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Badge officiel Créateur Vérifié</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Toutes les futures fonctionnalités incluses</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Support VIP & Assistance prioritaire</span>
                </li>
                <li className="flex items-center gap-2.5 text-amber-800 font-medium">
                  <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Rentabilisé dès la 1ère année</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handleCheckout('lifetime')}
              className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              {loadingPlan === 'lifetime' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>
                    {currentPlan === 'pro_subscription'
                      ? "Passer à l'accès à vie (500 $)"
                      : "Obtenir l'accès à vie (500 $)"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modale de Paiement In-Page Chariow (Sans redirection) */}
      <ChariowCheckoutModal
        isOpen={Boolean(checkoutModalConfig?.isOpen)}
        onClose={() => setCheckoutModalConfig(null)}
        productId={checkoutModalConfig?.productId || ''}
        planTitle={checkoutModalConfig?.planTitle}
        userEmail={userEmail}
        onSuccess={() => {
          setCheckoutModalConfig(null);
          onClose();
        }}
      />
    </div>
  );
}

