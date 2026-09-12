'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Download,
  PhoneCall,
  Calendar,
  ArrowRight,
  Check,
} from '@/components/ui/Icons';

interface UseCase {
  id: string;
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  mockupContent: React.ReactNode;
}

export function LandingUseCases() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const cases: UseCase[] = [
    {
      id: 'networking',
      badge: 'En salon & networking',
      title: 'Ne perdez plus jamais un contact en rendez-vous',
      description:
        'Distribuer des cartes en carton conduit presque toujours au même résultat : 88% sont jetées dans la semaine. Avec votre QR Code Lien-Bio, votre interlocuteur scanne et votre fiche vCard (.vcf) avec photo, portable et WhatsApp s’enregistre directement dans son répertoire téléphonique.',
      bullets: [
        'Enregistrement direct dans le carnet d’adresses iOS ou Android',
        'Zéro nom mal épelé ou numéro mal recopié',
        'Votre photo et vos liens restent accessibles dans son téléphone',
      ],
      mockupContent: (
        <div className="p-5 rounded-2xl bg-neutral-900 text-white flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Scanné en salon pro</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              ✓ Succès instantané
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-xs text-white">
              VP
            </div>
            <div>
              <div className="text-xs font-bold text-white">Contact enregistré</div>
              <div className="text-[10px] text-neutral-400">+33 6 12 34 56 78 • WhatsApp</div>
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 text-center">
            Ajouté automatiquement aux contacts iPhone & Google
          </div>
        </div>
      ),
    },
    {
      id: 'social',
      badge: 'Bio Instagram & LinkedIn',
      title: 'Un seul lien qui convertit vos abonnés en clients',
      description:
        'Remplacez les pages de liens lentes et impersonnelles par une expérience fluide. Vos visiteurs découvrent votre univers, vos tarifs, vos réalisations et peuvent réserver un créneau de rendez-vous sans quitter leur écran.',
      bullets: [
        'Temps de chargement inférieur à 300 ms sur mobile',
        'Boutons d’appel direct et WhatsApp sans friction',
        'Présentation claire de vos services avec prix transparents',
      ],
      mockupContent: (
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 text-neutral-900 flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Visiteur depuis Instagram</span>
            <span className="text-[10px] font-bold text-indigo-600">300ms de chargement</span>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between text-xs font-semibold">
              <span>📅 Réserver une séance de conseil</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between text-xs font-semibold">
              <span>💬 Message direct sur WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'print',
      badge: 'Devis, factures & vitrines',
      title: 'Un QR Code permanent qui ne périme jamais',
      description:
        'Vous imprimez votre QR Code sur vos devis, cartes de visite de prestige ou sur votre vitrine. Si vos numéros, horaires ou offres changent le mois prochain, vous modifiez tout en ligne : votre QR Code continue de fonctionner parfaitement sans réimpression.',
      bullets: [
        'Fichier vectoriel SVG haute résolution adapté aux imprimeurs',
        'Modifications illimitées en temps réel depuis le dashboard',
        'Économies durables sur les réimpressions papier',
      ],
      mockupContent: (
        <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-neutral-900 flex flex-col items-center text-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900">QR Code Permanent</div>
            <div className="text-[10px] text-neutral-500">SVG Haute Définition (300 DPI)</div>
          </div>
          <div className="py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            Toujours à jour • Zéro réimpression
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {cases.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === i
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
            }`}
          >
            {c.badge}
          </button>
        ))}
      </div>

      {/* Active Use Case Card */}
      <div className="p-8 sm:p-12 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col lg:flex-row items-center justify-between gap-10 text-left">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 block">
            {cases[activeTab].badge}
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 mb-4 tracking-tight">
            {cases[activeTab].title}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            {cases[activeTab].description}
          </p>

          <div className="space-y-2.5">
            {cases[activeTab].bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-neutral-700">
                <div className="w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          {cases[activeTab].mockupContent}
        </div>
      </div>
    </div>
  );
}

