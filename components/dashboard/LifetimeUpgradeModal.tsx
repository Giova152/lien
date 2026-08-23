'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, ShieldAlert, Loader2, BookOpen, BarChart3, Palette, UserCheck, Zap } from '@/components/ui/Icons';
import { toast } from 'sonner';

interface LifetimeUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LifetimeUpgradeModal({ isOpen, onClose }: LifetimeUpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion à Stripe');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || 'Impossible d\'ouvrir la page de paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-amber-500/30 text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col gap-6">
        {/* Top Glowing Ambient Light */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offre Exclusive Créateurs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Accès <span className="text-amber-400">PRO À VIE</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm">
            Paiement unique de <strong className="text-white">150 $</strong>. Aucun abonnement mensuel, zéro frais cachés.
          </p>
        </div>

        {/* Features Checklist */}
        <div className="bg-neutral-950/60 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 relative z-10">
          {[
            { icon: Palette, text: 'Thèmes Haute Couture & Luxe (Obsidienne Or, Rose Poudré, Bleu Saphir)' },
            { icon: BookOpen, text: 'Boutique E-books & Produits Digitaux illimités (Couvertures + Liens d\'achat)' },
            { icon: Zap, text: 'Onglet Services & Prestations (RDV Calendly & WhatsApp)' },
            { icon: BarChart3, text: 'Analytics Avancés (Graphiques de clics, conversion, pays)' },
            { icon: UserCheck, text: 'Badge Créateur Vérifié sur votre profil public' },
            { icon: Check, text: 'Accès illimité à vie à toutes les futures mises à jour' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs text-neutral-200">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                <Check className="w-3 h-3" />
              </span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Pricing Badge & Call to Action */}
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-800/80 border border-neutral-700/80">
            <div className="flex flex-col">
              <span className="text-xs text-neutral-400">Paiement unique</span>
              <span className="text-xl font-black text-amber-400">150 $ USD</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
              Accès À Vie
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-extrabold text-sm uppercase tracking-wider shadow-xl hover:scale-[1.02] active:scale-[0.98] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redirection sécurisée...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-neutral-950" />
                <span>Débloquer le Plan PRO à Vie (150 $)</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-neutral-400">
            🔒 Paiement 100% sécurisé par Stripe • Activation immédiate de votre compte
          </p>
        </div>
      </div>
    </div>
  );
}
