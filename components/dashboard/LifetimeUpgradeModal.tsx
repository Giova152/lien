'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, BookOpen, BarChart3, Palette, UserCheck, Zap, Loader2, ArrowRight } from '@/components/ui/Icons';
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
      toast.loading('Connexion sécurisée à la passerelle PayDunya...', { id: 'paydunya-checkout' });
      
      const res = await fetch('/api/paydunya/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        toast.error('Session expirée ou non connectée. Veuillez vous reconnecter.', { id: 'paydunya-checkout' });
        window.location.href = `/login?redirect=/dashboard?upgrade=true`;
        return;
      }

      const data = await res.json();

      if (data.url) {
        toast.success('Facture sécurisée PayDunya générée ! Redirection en cours...', { id: 'paydunya-checkout' });
        // Redirection directe vers la passerelle sécurisée PayDunya Live
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erreur lors de l’initialisation du paiement PayDunya', { id: 'paydunya-checkout' });
        setLoadingPlan(null);
      }
    } catch (err: any) {
      toast.error('Erreur de connexion au service de paiement PayDunya', { id: 'paydunya-checkout' });
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-neutral-950 border border-neutral-800 text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col gap-6 my-auto max-h-[94vh]">
        {/* Glow Effects */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-0 w-80 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition z-20"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Formules Créateurs & Professionnels</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Choisissez votre formule <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">PRO</span>
          </h2>
          <p className="text-xs text-neutral-400 max-w-md">
            Débloquez toutes les fonctionnalités avancées pour booster votre image, vos ventes et vos réservations.
          </p>
        </div>

        {/* The 2 PRO Offers Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {/* OFFRE 1 : ABONNEMENT PRO */}
          <div className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 flex flex-col justify-between transition relative shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Offre 1 : Abonnement
                </span>
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] font-semibold text-neutral-300">
                  Flexible
                </span>
              </div>

              {/* Toggle Mensuel / Annuel */}
              <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 mb-4">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
                    billingCycle === 'monthly'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
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
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Annuel</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-black">-28%</span>
                </button>
              </div>

              {/* Price */}
              <div className="mb-4">
                {billingCycle === 'monthly' ? (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white">35 $</span>
                      <span className="text-xs text-neutral-400">/ mois</span>
                    </div>
                    <span className="text-[11px] text-indigo-300 font-semibold block mt-0.5">
                      ≈ 21 000 FCFA / mois
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white">300 $</span>
                      <span className="text-xs text-neutral-400">/ an</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                      ≈ 180 000 FCFA / an (Soit 25 $/m • -28%)
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2 text-xs text-neutral-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Liens personnalisés illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Thèmes de luxe débloqués</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Services & Prise de RDV Calendly</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Boutique E-books & guides PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Statistiques & Analytics de clics</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-400">
                  <Check className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span>Annulation libre en 1 clic</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handleCheckout(billingCycle)}
              className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition border border-neutral-700"
            >
              {loadingPlan === billingCycle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Payer via PayDunya ({billingCycle === 'monthly' ? '21 000 FCFA' : '180 000 FCFA'})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* OFFRE 2 : PRO À VIE (LIFETIME) */}
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl p-5 flex flex-col justify-between transition relative shadow-lg">
            {/* Top Badge */}
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider shadow-md">
              Recommandé • À Vie
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Offre 2 : Accès Définitif
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-extrabold text-amber-300">
                  Sans abonnement
                </span>
              </div>

              <div className="h-[34px] flex items-center mb-4">
                <span className="text-[11px] text-amber-300/80 font-medium">
                  Payez une seule fois, profitez-en pour toujours
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                    500 $
                  </span>
                  <span className="text-xs text-amber-400 font-bold">à vie</span>
                </div>
                <span className="text-[11px] text-amber-300 font-semibold block mt-0.5">
                  ≈ 300 000 FCFA • Paiement unique définitif
                </span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2 text-xs text-neutral-200 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white">Tout ce qui est inclus dans le PRO</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-amber-300">Accès garanti À VIE (0 $ ensuite)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Badge officiel Créateur Vérifié (Doré)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Toutes les futures fonctionnalités incluses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Support VIP & Assistance prioritaire</span>
                </li>
                <li className="flex items-center gap-2 text-amber-200/80 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Rentabilisé dès la 1ère année</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={loadingPlan !== null}
              onClick={() => handleCheckout('lifetime')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 text-neutral-950 font-black text-xs flex items-center justify-center gap-2 transition shadow-md hover:scale-[1.01]"
            >
              {loadingPlan === 'lifetime' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-neutral-950" />
                  <span>Obtenir à Vie via PayDunya (300 000 FCFA)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PayDunya Payment Methods Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-800/80 relative z-10 text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="font-bold text-neutral-300">PayDunya :</span>
            <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 font-bold">
              Wave
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20 font-bold">
              Orange Money
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
              Free Money
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              Carte Visa / Mastercard
            </span>
          </div>
          <span className="text-neutral-400 font-medium">
            🔒 100% sécurisé • Activation instantanée
          </span>
        </div>
      </div>
    </div>
  );
}

