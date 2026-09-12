'use client';

import React from 'react';
import { Check, ArrowRight } from '@/components/ui/Icons';

export function LandingComparison() {
  const points = [
    {
      title: 'Enregistrement de votre contact',
      traditional: 'Votre prospect doit taper votre numéro à la main (ou perd la carte en papier)',
      lienbio: 'Fiche .vcf enregistrée directement dans son carnet d’adresses en un seul appui',
    },
    {
      title: 'Modification de vos coordonnées',
      traditional: 'Obligation de jeter et réimprimer des centaines de cartes papier',
      lienbio: 'Mise à jour immédiate et illimitée en ligne sans changer de QR Code',
    },
    {
      title: 'Réservations & Ventes',
      traditional: 'Échanges d’e-mails à rallonge pour trouver un créneau ou un devis',
      lienbio: 'Agenda synchronisé (Google / Calendly) et vente de fichiers intégrés',
    },
    {
      title: 'Image de marque',
      traditional: 'Logo tiers imposé ou liens d’arborescence impersonnels',
      lienbio: 'Design épuré en marque blanche et possibilité de nom de domaine dédié',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Traditional approach */}
        <div className="p-8 sm:p-10 rounded-3xl border border-neutral-200/90 bg-white/70 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Méthodes traditionnelles
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
              Cartes papier & listes de liens basiques
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mb-8 leading-relaxed">
              Des coûts récurrents d’impression, des contacts perdus et une expérience mobile impersonnelle.
            </p>

            <ul className="space-y-4">
              {points.map((p, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    —
                  </span>
                  <div>
                    <div className="text-xs font-bold text-neutral-800">{p.title}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{p.traditional}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Modern Lien-Bio approach */}
        <div className="p-8 sm:p-10 rounded-3xl border border-neutral-900 bg-neutral-950 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Avec Lien-Bio
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
              Votre identité pro complète & permanente
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mb-8 leading-relaxed">
              Un profil tactile taillé pour la rencontre, le partage fluide et la conversion de vos prospects.
            </p>

            <ul className="space-y-4">
              {points.map((p, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white text-neutral-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                    <Check className="w-3 h-3 text-neutral-950" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{p.title}</div>
                    <div className="text-xs text-neutral-300 mt-0.5">{p.lienbio}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 mt-8 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-medium">
            <span>Disponible sur iPhone, Android et Web</span>
            <span className="text-white font-semibold">100% sans application</span>
          </div>
        </div>
      </div>
    </div>
  );
}

