'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, Loader2, BookOpen, BarChart3, Palette, UserCheck, Zap, ShieldAlert } from '@/components/ui/Icons';
import { toast } from 'sonner';

interface LifetimeUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LifetimeUpgradeModal({ isOpen, onClose }: LifetimeUpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async (provider: 'chariow' | 'stripe' = 'chariow') => {
    try {
      setLoading(true);
      const endpoint = provider === 'chariow' ? '/api/chariow/checkout' : '/api/stripe/checkout';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion au système de paiement');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-neutral-950/95 border border-amber-500/40 text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_80px_rgba(245,158,11,0.2)] relative overflow-hidden flex flex-col gap-6">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-96 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 right-0 w-64 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-full bg-neutral-900/60 border border-neutral-800 hover:bg-neutral-800 transition duration-200 z-20"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2.5 relative z-10 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Offre Exclusive Créateurs</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md">
            Accès <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">PRO À VIE</span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-sm font-medium">
            Paiement unique de <strong className="text-white font-bold underline decoration-amber-500/60">186 $</strong>. Aucun abonnement mensuel, aucun frais récurrent.
          </p>
        </div>

        {/* Features Grid */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 relative z-10 shadow-inner">
          {[
            {
              icon: Palette,
              title: 'Thèmes Haute Couture & Luxe',
              desc: 'Obsidienne Or, Rose Poudré, Bleu Saphir & Presets Pro',
            },
            {
              icon: BookOpen,
              title: 'Boutique E-books & Produits Digitaux',
              desc: 'Nombre illimité avec visuels & liens de redirection d\'achat',
            },
            {
              icon: Zap,
              title: 'Onglet Services & Prestations',
              desc: 'Prise de RDV Calendly & réservation directe WhatsApp',
            },
            {
              icon: BarChart3,
              title: 'Analytics Avancés & Suivi',
              desc: 'Graphiques de clics, taux de conversion et pays',
            },
            {
              icon: UserCheck,
              title: 'Badge Créateur Vérifié',
              desc: 'Cocarde dorée officielle sur votre profil public',
            },
            {
              icon: Check,
              title: 'Accès Illimité à Vie',
              desc: 'Inclus toutes les futures fonctionnalités sans surcoût',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-amber-500/30 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition">
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-neutral-100 truncate">{item.title}</span>
                <span className="text-[11px] text-neutral-400 truncate">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Offer & Call to Action */}
        <div className="flex flex-col gap-3.5 relative z-10">
          <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 shadow-md">
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 line-through font-medium">350 $</span>
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                  -47% REDUCTION
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">186 $</span>
                <span className="text-xs font-bold text-neutral-300">USD</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider shadow-sm">
                ACCÈS À VIE ⚡
              </span>
              <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Valable aujourd'hui
              </span>
            </div>
          </div>

          {/* CTA Main Button */}
          <button
            onClick={() => handleCheckout('chariow')}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.55)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-neutral-950" />
                <span>Redirection sécurisée vers Chariow...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                <span>PROFITER DE L'OFFRE PROMO (186 $)</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-neutral-400 font-medium">
            🔒 Paiement 100% sécurisé via Chariow & Stripe • Activation immédiate et automatique
          </p>
        </div>
      </div>
    </div>
  );
}
