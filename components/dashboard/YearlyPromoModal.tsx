'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Calendar,
  Zap,
  ShoppingBag,
  BarChart3,
  Palette,
  Loader2,
} from '@/components/ui/Icons';
import { CHARIOW_STORE_DOMAIN, CHARIOW_PRODUCTS } from '@/lib/chariow-constants';
import { toast } from 'sonner';

interface YearlyPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

export function YearlyPromoModal({
  isOpen,
  onClose,
  userEmail,
}: YearlyPromoModalProps) {
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartCheckout = async () => {
    try {
      setLoadingCheckout(true);
      const res = await fetch('/api/chariow/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'yearly' }),
      });

      const data = await res.json().catch(() => ({}));

      if (data?.url) {
        let finalUrl = data.url;
        if (userEmail && !finalUrl.includes('email=') && !finalUrl.includes('chw_email=')) {
          const sep = finalUrl.includes('?') ? '&' : '?';
          finalUrl += `${sep}email=${encodeURIComponent(userEmail)}`;
        }
        window.location.href = finalUrl;
        return;
      }
    } catch (err) {
      console.warn('[YearlyPromoModal] Checkout API redirect fallback:', err);
    }

    // Redirection directe vers la page officielle du produit sur la boutique Chariow
    const storeDomain = CHARIOW_STORE_DOMAIN || 'enfancience-academy.mychariow.shop';
    const fallbackUrl = `https://${storeDomain}/${CHARIOW_PRODUCTS.YEARLY}${
      userEmail ? `?email=${encodeURIComponent(userEmail)}` : ''
    }`;
    window.location.href = fallbackUrl;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white border border-neutral-100 text-neutral-900 rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-[0_25px_60px_rgba(0,0,0,0.16)] relative flex flex-col gap-5 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Bar: Badge + Minimal Close Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/90 border border-indigo-100 text-indigo-700 text-[11px] font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>OFFRE ANNUELLE • REMISE -38%</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-[26px] font-black tracking-tight text-neutral-900 leading-tight">
            Passez à la vitesse supérieure avec{' '}
            <span className="text-indigo-600">Lien-Bio PRO</span>
          </h2>
          <p className="text-xs sm:text-[13px] text-neutral-500 leading-relaxed">
            Accédez à tous les outils professionnels pour valoriser votre profil, gérer vos réservations et développer votre activité pendant 1 an complet.
          </p>
        </div>

        {/* Clean Pricing Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/50 border border-neutral-200/70 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
                185 $
              </span>
              <span className="text-xs font-bold text-neutral-500">/ an</span>
              <span className="text-xs text-neutral-400 line-through">300 $</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold tracking-wide">
                -38%
              </span>
            </div>
            <p className="text-[11px] text-indigo-600 font-bold mt-1">
              Soit ~15 $/mois au lieu de 25 $
            </p>
          </div>
          <div className="text-right text-[11px] text-neutral-400 hidden sm:block">
            <span className="font-semibold text-neutral-700 block">Paiement unique</span>
            <span>365 jours d&apos;accès</span>
          </div>
        </div>

        {/* Features Grid with Refined Icon Tiles */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-left">
          <div className="flex items-start gap-2.5 p-2 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 leading-tight">
                Nom de domaine
              </p>
              <p className="text-[10.5px] text-neutral-500 leading-tight mt-0.5 truncate">
                Votre lien .com dédié
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 leading-tight">
                Prise de RDV
              </p>
              <p className="text-[10.5px] text-neutral-500 leading-tight mt-0.5 truncate">
                Agenda & calendrier en direct
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 leading-tight">
                Liens illimités
              </p>
              <p className="text-[10.5px] text-neutral-500 leading-tight mt-0.5 truncate">
                Aucun quota de contenu
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 leading-tight">
                Boutique digitale
              </p>
              <p className="text-[10.5px] text-neutral-500 leading-tight mt-0.5 truncate">
                Vente de PDF & fichiers
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 leading-tight">
                Statistiques
              </p>
              <p className="text-[10.5px] text-neutral-500 leading-tight mt-0.5 truncate">
                Visiteurs & provenance
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 leading-tight">
                Design de Luxe
              </p>
              <p className="text-[10.5px] text-neutral-500 leading-tight mt-0.5 truncate">
                100% sans filigrane
              </p>
            </div>
          </div>
        </div>

        {/* Trust Guarantee */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Paiement sécurisé par <strong>Carte bancaire</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            disabled={loadingCheckout}
            onClick={handleStartCheckout}
            className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-75 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingCheckout ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ouverture du paiement sécurisé...</span>
              </>
            ) : (
              <>
                <span>Profiter de l&apos;offre PRO 1 An</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1 text-xs font-medium text-neutral-400 hover:text-neutral-600 transition cursor-pointer text-center"
          >
            Plus tard, continuer vers mon espace
          </button>
        </div>
      </div>
    </div>
  );
}
