'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, BookOpen, BarChart3, Palette, UserCheck, Zap, Loader2, ArrowRight } from '@/components/ui/Icons';
import { LogoIcon } from '@/components/ui/Logo';
import { toast } from 'sonner';

interface LifetimeUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LifetimeUpgradeModal({ isOpen, onClose }: LifetimeUpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (plan: 'monthly' | 'yearly' | 'lifetime') => {
    try {
      setLoadingPlan(plan);
      toast.loading('Connexion sécurisée au paiement...', { id: 'checkout-action' });
      
      const res = await fetch('/api/maketou/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        toast.error('Session expirée ou non connectée. Veuillez vous reconnecter.', { id: 'checkout-action' });
        window.location.href = `/login?redirect=/dashboard?upgrade=true`;
        return;
      }

      const data = await res.json();

      if (data.url) {
        toast.success('Paiement initié ! Redirection en cours...', { id: 'checkout-action' });
        // Redirection directe vers la page de paiement sécurisée
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erreur lors de l’initialisation du paiement', { id: 'checkout-action' });
        setLoadingPlan(null);
      }
    } catch (err: any) {
      toast.error('Erreur de connexion au service de paiement', { id: 'checkout-action' });
      setLoadingPlan(null);
    }
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
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Formules Créateurs & Professionnels</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            Choisissez votre formule <span className="text-indigo-600">PRO</span>
          </h2>
          <p className="text-xs text-neutral-500 max-w-md">
            Débloquez toutes les fonctionnalités avancées pour booster votre image, vos ventes et vos réservations.
          </p>
        </div>

        {/* The 2 PRO Offers Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {/* OFFRE 1 : ABONNEMENT PRO */}
          <div className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl p-5 flex flex-col justify-between transition relative shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Offre 1 : Abonnement
                </span>
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-600 border border-neutral-200">
                  Flexible
                </span>
              </div>

              {/* Toggle Mensuel / Annuel */}
              <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200 mb-4">
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
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded font-black">-28%</span>
                </button>
              </div>

              {/* Price */}
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

              {/* Features */}
              <ul className="flex flex-col gap-2 text-xs text-neutral-700 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Liens personnalisés illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Thèmes de luxe débloqués</span>
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
                <li className="flex items-center gap-2 text-neutral-400">
                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Annulation libre en 1 clic</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handleCheckout(billingCycle)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
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
                  ≈ 300 000 FCFA • Paiement unique définitif
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
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Obtenir l&apos;accès à vie (300 000 FCFA)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payment Methods Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="font-bold text-neutral-700">Moyens acceptés :</span>
            <span className="px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium">
              Wave
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium">
              Orange Money
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium">
              MTN MoMo
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium">
              Moov
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium">
              Carte Visa / Mastercard
            </span>
          </div>
          <span className="text-neutral-500 font-medium">
            🔒 Paiement 100% sécurisé et chiffré
          </span>
        </div>
      </div>
    </div>
  );
}

