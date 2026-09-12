'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  Download,
  ArrowRight,
  Whatsapp,
  Calendar,
  Check,
  ExternalLink,
} from '@/components/ui/Icons';

interface Persona {
  id: string;
  tabLabel: string;
  name: string;
  badge: string;
  role: string;
  location: string;
  avatar: string;
  coverGradient: string;
  themeBg: string;
  themeCard: string;
  themeText: string;
  themeSubtext: string;
  themeAccent: string;
  themeButtonBg: string;
  isDark?: boolean;
  stats: { val: string; label: string }[];
  tags: string[];
  links: { label: string; sub: string; url: string }[];
  services: { title: string; price: string; desc: string }[];
  shop: { title: string; price: string; type: string }[];
}

const PERSONAS: Persona[] = [
  {
    id: 'consulting',
    tabLabel: 'Cabinet & Conseil',
    name: 'Sophie Martin',
    badge: 'Stratégie',
    role: 'Conseil en gouvernance d’entreprise & Financement',
    location: 'Paris & Genève',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    coverGradient: 'from-stone-200 via-amber-50 to-stone-100',
    themeBg: '#FAF8F5',
    themeCard: '#FFFFFF',
    themeText: '#1C1917',
    themeSubtext: '#78716C',
    themeAccent: '#292524',
    themeButtonBg: '#F5F2EC',
    isDark: false,
    stats: [
      { val: '15 min', label: 'réponse moyenne' },
      { val: 'Paris / Visio', label: 'disponibilité' },
      { val: 'vCard .vcf', label: 'format universel' },
    ],
    tags: ['STRATÉGIE', 'AUDIT', 'M&A'],
    links: [
      { label: 'Réserver un point d’échange (30 min)', sub: 'Synchronisé avec Google Calendar', url: '#' },
      { label: 'Profil vérifié LinkedIn', sub: 'Mises à jour professionnelles', url: '#' },
      { label: 'Présentation du cabinet 2026', sub: 'Brochure PDF téléchargeable', url: '#' },
    ],
    services: [
      { title: 'Session de cadrage stratégique', price: '250 €', desc: 'Revue approfondie de votre modèle et plan de déploiement.' },
      { title: 'Mission de conseil trimestrielle', price: 'Sur devis', desc: 'Accompagnement continu avec comité mensuel et support direct.' },
    ],
    shop: [
      { title: 'Matrice d’audit stratégique', price: 'Gratuit', type: 'Modèle' },
      { title: 'Guide pratique de levée de fonds', price: '29 €', type: 'E-book PDF' },
    ],
  },
  {
    id: 'studio',
    tabLabel: 'Studio Photo & Création',
    name: 'Thomas Laurent',
    badge: 'Direction Photo',
    role: 'Portraits corporate, mode & reportages d’équipe',
    location: 'Lyon & Déplacements',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    coverGradient: 'from-zinc-200 via-stone-200 to-neutral-200',
    themeBg: '#F4F4F5',
    themeCard: '#FFFFFF',
    themeText: '#09090B',
    themeSubtext: '#71717A',
    themeAccent: '#18181B',
    themeButtonBg: '#E4E4E7',
    isDark: false,
    stats: [
      { val: 'Studio Lyon', label: 'lieu de tournage' },
      { val: '48h', label: 'livraison HD' },
      { val: 'RAW & JPEG', label: 'qualité studio' },
    ],
    tags: ['PORTRAIT', 'CORPORATE', 'MARQUE'],
    links: [
      { label: 'Portfolio complet & séries récentes', sub: 'Accéder à la galerie haute résolution', url: '#' },
      { label: 'Demande de devis pour un shooting', sub: 'Réponse sous 24h ouvrées', url: '#' },
      { label: 'Instagram professionnel', sub: 'Aperçus coulisses et publications', url: '#' },
    ],
    services: [
      { title: 'Pack Portrait Dirigeant & Presse', price: '220 €', desc: 'Séance 1h, 5 visuels retouchés en haute résolution pour LinkedIn et presse.' },
      { title: 'Reportage d’entreprise (demi-journée)', price: '650 €', desc: 'Ambiance de travail, collaborateurs et locaux en situation.' },
    ],
    shop: [
      { title: 'Presets Lightroom « Tons Chauds »', price: '19 €', type: 'Presets' },
      { title: 'Checklist de préparation shooting', price: 'Gratuit', type: 'PDF' },
    ],
  },
  {
    id: 'craft',
    tabLabel: 'Architecture & Tech (Dark)',
    name: 'Karim Benali',
    badge: 'Design & Code',
    role: 'Architecture logicielle & Design de produits digitaux',
    location: 'Bruxelles & Remote',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    coverGradient: 'from-neutral-900 via-zinc-900 to-neutral-950',
    themeBg: '#09090B',
    themeCard: '#18181B',
    themeText: '#FAFAFA',
    themeSubtext: '#A1A1AA',
    themeAccent: '#E4E4E7',
    themeButtonBg: '#27272A',
    isDark: true,
    stats: [
      { val: 'Next.js', label: 'stack principale' },
      { val: 'Remote', label: 'zone horaire CET' },
      { val: '99.9%', label: 'uptime garanti' },
    ],
    tags: ['FULLSTACK', 'SYSTEM DESIGN', 'API'],
    links: [
      { label: 'Projets récents & études de cas', sub: 'Démos interactives en production', url: '#' },
      { label: 'Réserver un audit technique (45 min)', sub: 'Créneaux disponibles cette semaine', url: '#' },
      { label: 'Dépôts open-source GitHub', sub: 'Composants et packages réutilisables', url: '#' },
    ],
    services: [
      { title: 'Architecture & Audit de performance', price: '950 €', desc: 'Revue de code, optimisation Core Web Vitals et recommandations de scalabilité.' },
      { title: 'Sprint de développement sur mesure', price: 'Sur devis', desc: 'Développement d’une fonctionnalité critique en 5 jours.' },
    ],
    shop: [
      { title: 'Kit d’icônes vectorielles SVG', price: 'Gratuit', type: 'Ressource' },
      { title: 'Starter Template Next.js Fullstack', price: '39 €', type: 'Code source' },
    ],
  },
];

export function InteractiveLandingDemo() {
  const [activePersonaIndex, setActivePersonaIndex] = useState(0);
  const [currentTab, setCurrentTab] = useState<'profil' | 'services' | 'shop'>('profil');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const persona = PERSONAS[activePersonaIndex];

  const triggerFeedback = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Segmented Persona Switcher */}
      <div className="inline-flex p-1 rounded-2xl bg-neutral-100 border border-neutral-200/80 mb-8 shadow-xs">
        {PERSONAS.map((p, idx) => {
          const isActive = activePersonaIndex === idx;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setActivePersonaIndex(idx);
                setCurrentTab('profil');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/60'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  p.isDark ? 'bg-neutral-900 ring-1 ring-neutral-400' : 'bg-neutral-400'
                }`}
              />
              <span>{p.tabLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Realistic Interactive Phone Shell */}
      <div className="relative">
        <div className="relative w-full max-w-[370px] rounded-[48px] bg-neutral-950 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] border-[5px] border-neutral-800 ring-1 ring-black/40">
          {/* Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-30 flex items-center justify-end px-3 gap-1.5 pointer-events-none shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
          </div>

          {/* Interactive Phone Screen */}
          <div
            className="w-full rounded-[38px] overflow-hidden p-4 pt-8 flex flex-col items-center text-center transition-all duration-300 min-h-[570px] select-none relative"
            style={{ backgroundColor: persona.themeBg, color: persona.themeText }}
          >
            {/* Live Feedback Toast */}
            {toastMessage && (
              <div className="absolute top-4 left-4 right-4 z-40 bg-neutral-900/95 backdrop-blur text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-3 duration-200 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium text-[11px] text-left">{toastMessage}</span>
                </div>
              </div>
            )}

            {/* Cover Header */}
            <div
              className={`w-full h-18 rounded-2xl bg-gradient-to-r ${persona.coverGradient} mb-[-32px] border border-black/5 shadow-inner`}
            />

            {/* Avatar */}
            <div className="relative z-10 mb-2">
              <div
                className={`w-18 h-18 rounded-full overflow-hidden shadow-md ${
                  persona.isDark ? 'border-4 border-neutral-900' : 'border-4 border-white'
                } bg-neutral-100`}
              >
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Name & Badge */}
            <div className="flex items-center gap-1.5 justify-center mb-0.5">
              <h4
                className={`font-bold text-sm tracking-tight ${
                  persona.isDark ? 'text-white' : 'text-neutral-950'
                }`}
              >
                {persona.name}
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-200/70 text-neutral-800">
                {persona.badge}
              </span>
            </div>

            <p
              className="text-[11px] font-normal max-w-[240px] leading-tight mb-1"
              style={{ color: persona.themeSubtext }}
            >
              {persona.role}
            </p>
            <p className="text-[10px] text-neutral-400 font-medium mb-3">
              {persona.location}
            </p>

            {/* Main Contact Action Buttons */}
            <div className="flex items-center gap-2 w-full mb-3.5">
              <button
                type="button"
                onClick={() => triggerFeedback(`Fiche vCard prête : ${persona.name}.vcf`)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer ${
                  persona.isDark
                    ? 'bg-white hover:bg-neutral-100 text-neutral-900'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Enregistrer le contact</span>
              </button>

              <button
                type="button"
                onClick={() => triggerFeedback('Ouverture de WhatsApp avec message prêt')}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition ${
                  persona.isDark
                    ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800'
                    : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
                }`}
                title="WhatsApp"
              >
                <Whatsapp className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => triggerFeedback('Numéro de téléphone prêt à composer')}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition ${
                  persona.isDark
                    ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800'
                    : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
                }`}
                title="Téléphone"
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* In-Screen Navigation Tabs */}
            <div
              className={`flex p-1 rounded-xl border w-full mb-3 text-[11px] font-semibold ${
                persona.isDark
                  ? 'bg-neutral-900/90 border-neutral-800'
                  : 'bg-black/5 border-black/5'
              }`}
            >
              <button
                type="button"
                onClick={() => setCurrentTab('profil')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  currentTab === 'profil'
                    ? persona.isDark
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Liens
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('services')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  currentTab === 'services'
                    ? persona.isDark
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Prestations
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('shop')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  currentTab === 'shop'
                    ? persona.isDark
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Fichiers & PDF
              </button>
            </div>

            {/* Tab: Liens */}
            {currentTab === 'profil' && (
              <div className="flex flex-col gap-2 w-full animate-in fade-in duration-200">
                <div
                  className={`grid grid-cols-3 gap-1 p-2 rounded-xl border mb-1 ${
                    persona.isDark
                      ? 'bg-neutral-900/70 border-neutral-800'
                      : 'bg-white/70 border-neutral-200/60'
                  }`}
                >
                  {persona.stats.map((s, i) => (
                    <div key={i} className="text-center">
                      <div
                        className={`font-bold text-[11px] ${
                          persona.isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        {s.val}
                      </div>
                      <div className="text-[8px] text-neutral-500 leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>

                {persona.links.map((link, i) => (
                  <div
                    key={i}
                    onClick={() => triggerFeedback(`Lien sélectionné : ${link.label}`)}
                    className={`py-2.5 px-3.5 rounded-xl border text-left flex items-center justify-between shadow-2xs hover:border-neutral-400 transition cursor-pointer ${
                      persona.isDark
                        ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-850'
                        : 'bg-white border-neutral-200/80 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-[11px] font-semibold truncate ${
                          persona.isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        {link.label}
                      </span>
                      <span className="text-[9px] text-neutral-500">{link.sub}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Prestations */}
            {currentTab === 'services' && (
              <div className="flex flex-col gap-2 w-full text-left animate-in fade-in duration-200">
                {persona.services.map((svc, i) => (
                  <div
                    key={i}
                    onClick={() => triggerFeedback(`Option choisie : ${svc.title}`)}
                    className={`p-3 rounded-xl border shadow-2xs flex flex-col gap-1 cursor-pointer transition ${
                      persona.isDark
                        ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold ${
                          persona.isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        {svc.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          persona.isDark
                            ? 'bg-neutral-800 text-white'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {svc.price}
                      </span>
                    </div>
                    <p className="text-[9px] leading-normal" style={{ color: persona.themeSubtext }}>
                      {svc.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Boutique */}
            {currentTab === 'shop' && (
              <div className="flex flex-col gap-2 w-full text-left animate-in fade-in duration-200">
                {persona.shop.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => triggerFeedback(`Téléchargement de : ${item.title}`)}
                    className={`p-3 rounded-xl border shadow-2xs flex items-center justify-between cursor-pointer transition ${
                      persona.isDark
                        ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                        : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <span className="text-[8px] font-semibold text-neutral-500 uppercase tracking-wider block">
                        {item.type}
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          persona.isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ml-2 ${
                        persona.isDark
                          ? 'bg-white text-neutral-900'
                          : 'bg-neutral-900 text-white'
                      }`}
                    >
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-400 mt-4 text-center">
        Interface interactive : cliquez sur les onglets et boutons ci-dessus pour tester la réactivité.
      </p>
    </div>
  );
}
