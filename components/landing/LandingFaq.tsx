'use client';

import React, { useState } from 'react';
import { ChevronDown } from '@/components/ui/Icons';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Comment mes interlocuteurs enregistrent-ils mon contact sur leur téléphone ?',
    answer:
      'En scannant votre QR code ou en cliquant sur votre lien, vos interlocuteurs appuient sur le bouton « Enregistrer le contact ». Un fichier universel vCard (.vcf) est généré instantanément et s’ouvre directement dans le carnet d’adresses de leur smartphone (iPhone Contacts ou Google Contacts) avec votre nom, prénom, photo, téléphone, WhatsApp, email et réseaux pré-remplis sans aucune faute de frappe.',
  },
  {
    question: 'Mes clients ont-ils besoin d’installer une application ?',
    answer:
      'Non, absolument aucune application n’est nécessaire. Votre page Lien-Bio est un site web ultra-rapide optimisé pour smartphone qui s’ouvre instantanément dans n’importe quel navigateur (Safari, Google Chrome, Samsung Internet) sur iPhone, Android et ordinateur.',
  },
  {
    question: 'Puis-je modifier mes informations après avoir imprimé mon QR Code ?',
    answer:
      'Oui, à tout moment. Votre QR Code pointe vers votre adresse permanente. Vous pouvez changer de numéro de téléphone, ajouter une offre, modifier vos tarifs ou changer de photo de profil autant de fois que vous le souhaitez depuis votre tableau de bord, sans jamais avoir besoin de réimprimer vos supports physiques.',
  },
  {
    question: 'Puis-je lier mon propre nom de domaine personnalisé ?',
    answer:
      'Oui. Avec les formules PRO, vous pouvez connecter votre propre nom de domaine (par exemple votrenom.com ou carte.monentreprise.fr) pour une identité 100% personnalisée et professionnelle.',
  },
  {
    question: 'Dois-je obligatoirement payer un abonnement récurrent ?',
    answer:
      'Non. Lien-Bio propose une formule 100% Gratuite pour démarrer. Pour les professionnels, nous proposons également un accès annuel avantageux ainsi qu’un Pack PRO À Vie à paiement unique définitif (vous ne payez qu’une seule fois et bénéficiez de toutes les fonctionnalités pour toujours, sans aucun prélèvement futur).',
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 text-left">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'bg-white border-neutral-300 shadow-sm'
                : 'bg-white/80 border-neutral-200/80 hover:border-neutral-300 shadow-xs'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleItem(idx)}
              className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-semibold text-neutral-900 leading-snug">
                {item.question}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isOpen ? 'bg-neutral-900 text-white rotate-180' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100/80 mt-1">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
