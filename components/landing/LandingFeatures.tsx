'use client';

import React, { useState } from 'react';
import {
  Download,
  QrCode,
  ArrowRight,
  Palette,
  PhoneCall,
  Calendar,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
} from '@/components/ui/Icons';

export function LandingFeatures() {
  // Card 1: vCard interactive preview state
  const [vcardSaved, setVcardSaved] = useState(false);

  // Card 2: QR Code format state
  const [qrFormat, setQrFormat] = useState<'light' | 'dark'>('light');

  // Card 3: WhatsApp message preset
  const [whatsappPreset, setWhatsappPreset] = useState<'devis' | 'rdv' | 'contact'>('devis');

  // Card 4: Calendar slot selection
  const [selectedSlot, setSelectedSlot] = useState<string>('Jeu 14:00');

  // Card 6: Theme palette preview
  const [selectedTheme, setSelectedTheme] = useState<'ivoire' | 'sombre' | 'nuit' | 'sauge'>('ivoire');

  const themes = {
    ivoire: { bg: 'bg-[#FAF8F5]', text: 'text-[#1C1917]', sub: 'text-[#78716C]', border: 'border-stone-300', dot: 'bg-[#FAF8F5]' },
    sombre: { bg: 'bg-[#18181B]', text: 'text-[#FAFAFA]', sub: 'text-[#A1A1AA]', border: 'border-neutral-700', dot: 'bg-[#18181B]' },
    nuit: { bg: 'bg-[#0F172A]', text: 'text-[#F8FAFC]', sub: 'text-[#94A3B8]', border: 'border-slate-700', dot: 'bg-[#0F172A]' },
    sauge: { bg: 'bg-[#F0FDF4]', text: 'text-[#064E3B]', sub: 'text-[#047857]', border: 'border-emerald-300', dot: 'bg-[#064E3B]' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
      {/* CARD 1: Fiche .vcf (Large 2 Cols) */}
      <div className="md:col-span-2 p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-6">
          <div className="max-w-md">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5 shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 mb-2.5 tracking-tight">
              Enregistrement direct dans le carnet d&apos;adresses (.vcf)
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              En un seul appui, vos interlocuteurs enregistrent votre fiche complète dans leur iPhone ou Android (nom, téléphone, WhatsApp, adresse, photo et notes). Fini les cartes égarées ou les numéros mal saisis.
            </p>
          </div>

          {/* Interactive Mini vCard Card */}
          <div className="w-full lg:w-64 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 shadow-xs flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                SM
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-neutral-950 truncate">Sophie Martin</div>
                <div className="text-[10px] text-neutral-500 truncate">Fiche contact universelle</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setVcardSaved(true);
                setTimeout(() => setVcardSaved(false), 2000);
              }}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                vcardSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white active:scale-98'
              }`}
            >
              {vcardSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Enregistré dans le répertoire !</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Tester l&apos;enregistrement .vcf</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 pt-4 border-t border-neutral-100">
          <span className="flex items-center gap-1.5 text-neutral-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>iPhone & Android natifs</span>
          </span>
          <span>•</span>
          <span>Zéro application à télécharger</span>
        </div>
      </div>

      {/* CARD 2: QR Code Permanent */}
      <div className="p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
        <div>
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5 shadow-xs">
            <QrCode className="w-4 h-4" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-neutral-950 mb-2 tracking-tight">
            QR Code permanent & vectoriel
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
            Téléchargeable en SVG vectoriel ou PNG haute définition pour imprimer sur vos cartes, stands, vitrines et devis.
          </p>

          {/* Interactive QR Preview */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col items-center gap-3">
            <div
              className={`p-3 rounded-xl border transition-all duration-200 ${
                qrFormat === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
              }`}
            >
              <QrCode
                className={`w-16 h-16 ${qrFormat === 'dark' ? 'text-white' : 'text-neutral-900'}`}
              />
            </div>

            <div className="flex items-center gap-1 bg-neutral-200/70 p-1 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setQrFormat('light')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  qrFormat === 'light' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Clair
              </button>
              <button
                type="button"
                onClick={() => setQrFormat('dark')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  qrFormat === 'dark' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600'
                }`}
              >
                Sombre
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-100 text-xs font-semibold text-neutral-600 flex items-center justify-between">
          <span>Ne change jamais si vous éditez</span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
        </div>
      </div>

      {/* CARD 3: WhatsApp & Appel Direct */}
      <div className="p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
        <div>
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5 shadow-xs">
            <PhoneCall className="w-4 h-4" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-neutral-950 mb-2 tracking-tight">
            WhatsApp & Appel en un clic
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
            Démarrez une discussion WhatsApp avec message pré-rempli sans obliger le prospect à enregistrer le numéro d&apos;abord.
          </p>

          {/* Interactive WhatsApp message preview */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-500 text-[10px]">
              <span>Message pré-rédigé :</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-800 text-[11px] leading-relaxed shadow-2xs">
              {whatsappPreset === 'devis' && '« Bonjour, j’aimerais recevoir une estimation pour votre accompagnement. »'}
              {whatsappPreset === 'rdv' && '« Bonjour, je souhaiterais convenir d’un créneau d’échange avec vous. »'}
              {whatsappPreset === 'contact' && '« Bonjour, j’ai découvert votre profil Lien-Bio et souhaite entrer en contact. »'}
            </div>
            <div className="flex gap-1 mt-1">
              {(['devis', 'rdv', 'contact'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWhatsappPreset(mode)}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-semibold capitalize transition cursor-pointer ${
                    whatsappPreset === mode
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-200/70 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-100 text-xs text-neutral-500 font-medium">
          Taux de conversion immédiat
        </div>
      </div>

      {/* CARD 4: Prise de RDV Calendrier */}
      <div className="p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
        <div>
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5 shadow-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-neutral-950 mb-2 tracking-tight">
            Prise de RDV intégrée
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
            Connectez votre agenda Google, Outlook ou Calendly pour permettre la réservation directe en quelques secondes.
          </p>

          {/* Interactive slot picker preview */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col gap-2">
            <div className="text-[10px] font-semibold text-neutral-500">Prochains créneaux libres :</div>
            <div className="grid grid-cols-3 gap-1.5">
              {['Mer 10:30', 'Jeu 14:00', 'Ven 16:30'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                    selectedSlot === slot
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold text-center mt-1">
              ✓ Synchronisé en temps réel
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-100 text-xs text-neutral-500 font-medium">
          Google Meet & Zoom automatiques
        </div>
      </div>

      {/* CARD 5: Boutique Digitale */}
      <div className="p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
        <div>
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5 shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-neutral-950 mb-2 tracking-tight">
            Vente de fichiers & formations
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
            Vendez vos e-books, modèles de contrats, templates Notion ou fichiers audio avec encaissement direct et envoi immédiat par e-mail.
          </p>

          {/* Mini digital product preview */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">PDF Téléchargeable</span>
              <span className="text-xs font-bold text-neutral-900">Guide Négociation 2026</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-neutral-900 text-white">
              29 €
            </span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-100 text-xs text-neutral-500 font-medium">
          Carte bancaire & Mobile Money
        </div>
      </div>

      {/* CARD 6: Thèmes & Marque Blanche (Large 2 Cols) */}
      <div className="md:col-span-2 p-7 sm:p-9 rounded-3xl border border-neutral-200/80 bg-white shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-6">
          <div className="max-w-md">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5 shadow-xs">
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 mb-2.5 tracking-tight">
              Thèmes raffinés & Zéro logo imposé
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Choisissez parmi nos palettes sobres (Linette Ivoire, Noir Obsidienne, Bleu Nuit, Sauge) ou connectez votre propre nom de domaine personnalisé. Votre page reflète votre univers, sans aucun filigrane.
            </p>
          </div>

          {/* Interactive Palette & Preview */}
          <div className="w-full lg:w-64 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase">Choisir une palette :</span>
            </div>

            <div className="flex items-center gap-2">
              {(['ivoire', 'sombre', 'nuit', 'sauge'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTheme(t)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    themes[t].dot
                  } ${
                    selectedTheme === t
                      ? 'scale-110 ring-2 ring-neutral-900 ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                  title={t}
                />
              ))}
            </div>

            {/* Live miniature preview according to chosen theme */}
            <div
              className={`p-3 rounded-xl border transition-all duration-200 ${themes[selectedTheme].bg} ${themes[selectedTheme].border}`}
            >
              <div className={`text-xs font-bold ${themes[selectedTheme].text}`}>Votre Nom Pro</div>
              <div className={`text-[10px] ${themes[selectedTheme].sub}`}>Aperçu en direct du thème</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 pt-4 border-t border-neutral-100">
          <span className="text-neutral-800 font-semibold">100% Marque Blanche</span>
          <span>•</span>
          <span>Nom de domaine dédié (votrenom.com)</span>
          <span>•</span>
          <span>Typographies studio haut de gamme</span>
        </div>
      </div>
    </div>
  );
}

