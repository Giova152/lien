'use client';

import React, { useEffect } from 'react';
import { Sparkles, Check, X, BookOpen, BarChart3, Palette, UserCheck, Zap } from '@/components/ui/Icons';

interface LifetimeUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LifetimeUpgradeModal({ isOpen, onClose }: LifetimeUpgradeModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Dynamically load Chariow Widget CSS
    const linkId = 'chariow-widget-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://js.chariowcdn.com/v1/widget.min.css';
      document.head.appendChild(link);
    }

    // Dynamically load Chariow Widget JS
    const scriptId = 'chariow-widget-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://js.chariowcdn.com/v1/widget.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-neutral-950/95 border border-amber-500/40 text-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-[0_0_80px_rgba(245,158,11,0.2)] relative overflow-hidden flex flex-col gap-5 my-auto max-h-[92vh]">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-96 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 right-0 w-64 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full bg-neutral-900/60 border border-neutral-800 hover:bg-neutral-800 transition duration-200 z-20"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2 relative z-10 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Offre Exclusive Créateurs</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
            Accès <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">PRO À VIE</span>
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 line-through">350 $</span>
            <span className="text-amber-400 font-extrabold text-sm">186 $ USD</span>
            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black uppercase">
              -47% REDUCTION
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3.5 flex flex-col gap-2 relative z-10 shadow-inner max-h-48 overflow-y-auto">
          {[
            { icon: Palette, title: 'Thèmes Luxe', desc: 'Obsidienne Or, Rose Poudré, Bleu Saphir' },
            { icon: BookOpen, title: 'Boutique E-books', desc: 'Produits illimités avec liens d\'achat' },
            { icon: Zap, title: 'Services & Prestations', desc: 'RDV Calendly & réservation WhatsApp' },
            { icon: BarChart3, title: 'Analytics Avancés', desc: 'Graphiques de clics & conversion' },
            { icon: UserCheck, title: 'Badge Créateur Vérifié', desc: 'Cocarde dorée officielle sur votre profil' },
            { icon: Check, title: 'Accès Illimité à Vie', desc: 'Toutes les futures mises à jour incluses' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80"
            >
              <div className="w-6 h-6 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <item.icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-neutral-100 truncate">{item.title}</span>
                <span className="text-[10px] text-neutral-400 truncate">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Official Embedded Chariow Widget (Clean & Exclusive Payment Container) */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          <div className="w-full bg-white rounded-2xl p-2 text-black shadow-2xl overflow-hidden flex justify-center border border-amber-500/30">
            <div
              id="chariow-widget"
              data-product-id="prd_qm4vxf3z"
              data-store-domain="infosweb.mychariow.store"
              data-style="frame"
              data-border-style="rounded"
              data-cta-width="xs"
              data-cta-animation="none"
              data-locale="en"
              data-primary-color="#008F51"
              data-background-color="#FFFFFF"
              className="w-full flex justify-center min-h-[140px]"
            />
          </div>
        </div>

        <p className="text-[10px] text-center text-neutral-400 font-medium relative z-10">
          🔒 Paiement 100% sécurisé via Chariow • Activation immédiate et automatique
        </p>
      </div>
    </div>
  );
}
