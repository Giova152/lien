'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from '@/components/ui/Icons';
import { ChariowCheckoutModal } from '@/components/chariow/ChariowCheckoutModal';
import { CHARIOW_PRODUCTS } from '@/lib/chariow-constants';
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white border border-neutral-200/90 text-neutral-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative flex flex-col gap-5 overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-2 rounded-full bg-neutral-100/80 hover:bg-neutral-200/80 border border-neutral-200/60 transition z-10 cursor-pointer"
            aria-label="Fermer la promotion"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[11px] font-bold tracking-wide w-fit">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>OFFRE SPÉCIALE • ÉCONOMISEZ 38%</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 leading-tight">
              Propulsez votre présence avec{' '}
              <span className="text-indigo-600">Lien-Bio PRO</span>
            </h2>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Passez à la vitesse supérieure : profitez de toutes les fonctionnalités avancées pendant 1 an complet pour convertir vos visiteurs en clients.
            </p>
          </div>

          {/* Pricing Highlight Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-neutral-900">
                  185 $
                </span>
                <span className="text-xs text-neutral-500 font-bold">/ an</span>
                <span className="text-[11px] text-neutral-400 font-normal line-through ml-1">
                  300 $
                </span>
              </div>
              <p className="text-[11px] text-indigo-600 font-bold mt-0.5">
                Soit ~15 $/mois au lieu de 25 $ • ~110 000 FCFA
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold whitespace-nowrap">
                -38% de remise
              </span>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-700 relative z-10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Domaine personnalisé (.com)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Agenda & Prise de RDV</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Liens & Réseaux illimités</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Boutique & Produits PDF</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Statistiques & Analyses</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Thèmes HD sans filigrane</span>
            </div>
          </div>

          {/* Payment Trust Note */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100 relative z-10">
            <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Paiement sécurisé : Wave, Orange, MTN, Moov, CB</span>
            </div>
            <span className="text-[10px] text-neutral-400">Déblocage direct</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 relative z-10 pt-1">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Profiter de l&apos;offre PRO 1 An</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 transition cursor-pointer text-center"
            >
              Continuer vers mon espace (Peut-être plus tard)
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Secure Chariow Checkout Modal */}
      {isCheckoutOpen && (
        <ChariowCheckoutModal
          isOpen={isCheckoutOpen}
          productId={CHARIOW_PRODUCTS.YEARLY}
          planTitle="Offre PRO 1 An (185 $)"
          userEmail={userEmail}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            onClose();
            toast.success('Paiement réussi ! Votre compte PRO 1 An est activé.');
            window.location.href =
              '/dashboard?payment=success&provider=chariow&plan=yearly';
          }}
        />
      )}
    </>
  );
}
