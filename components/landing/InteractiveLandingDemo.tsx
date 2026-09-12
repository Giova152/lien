'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  Download,
  ArrowRight,
  Whatsapp,
  ExternalLink,
  Calendar,
  Check,
  Sparkles,
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
    id: 'coach',
    tabLabel: 'Sophie • Consultante',
    name: 'Sophie Martin',
    badge: 'Pro vérifié',
    role: 'Accompagnement d’entrepreneurs & Dirigeants',
    location: 'Paris, France',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    coverGradient: 'from-amber-200/50 via-amber-100/30 to-stone-100',
    themeBg: '#FAF8F5',
    themeCard: '#FFFFFF',
    themeText: '#1C1917',
    themeSubtext: '#78716C',
    themeAccent: '#B45309',
    themeButtonBg: '#F5F2EC',
    isDark: false,
    stats: [
      { val: '8 ans', label: 'd’expérience' },
      { val: '120+', label: 'clients suivis' },
      { val: '4.9/5', label: 'avis vérifiés' },
    ],
    tags: ['STRATÉGIE', 'LEADERSHIP', 'COACHING 1:1'],
    links: [
      { label: 'Réserver un appel découverte (20 min)', sub: 'Gratuit via Calendly', url: '#' },
      { label: 'Lire mon dernier article LinkedIn', sub: 'Publié cette semaine', url: '#' },
      { label: 'Écouter le podcast "Entreprendre au féminin"', sub: 'Disponible sur Spotify & Apple', url: '#' },
    ],
    services: [
      { title: 'Session de cadrage stratégique', price: '180 €', desc: 'Audit complet de votre positionnement en 1h30.' },
      { title: 'Accompagnement trimestriel intensif', price: 'Sur devis', desc: '6 sessions individuelles avec suivi WhatsApp hebdomadaire.' },
    ],
    shop: [
      { title: 'Template Notion : Organisation de consulting', price: 'Gratuit', type: 'Modèle' },
      { title: 'Guide PDF : Négocier ses premiers contrats à 5k€', price: '19 €', type: 'E-book' },
    ],
  },
  {
    id: 'photo',
    tabLabel: 'Thomas • Photographe',
    name: 'Thomas Laurent',
    badge: 'Artiste',
    role: 'Photographie éditoriale & Portraits pros',
    location: 'Lyon & Déplacements',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    coverGradient: 'from-zinc-300 via-stone-200 to-neutral-100',
    themeBg: '#F4F4F5',
    themeCard: '#FFFFFF',
    themeText: '#09090B',
    themeSubtext: '#71717A',
    themeAccent: '#18181B',
    themeButtonBg: '#E4E4E7',
    isDark: false,
    stats: [
      { val: '350+', label: 'shootings' },
      { val: '12', label: 'publications' },
      { val: '48h', label: 'livraison HD' },
    ],
    tags: ['PORTRAIT', 'CORPORATE', 'MARQUE'],
    links: [
      { label: 'Voir mon portfolio complet 2026', sub: 'thomaslaurent-studio.fr', url: '#' },
      { label: 'Demander un devis pour un shooting', sub: 'Réponse sous 24h ouvrées', url: '#' },
      { label: 'Galerie Instagram @thomaslaurent', sub: '24k abonnés', url: '#' },
    ],
    services: [
      { title: 'Pack Portrait Professionnel (LinkedIn / Presse)', price: '220 €', desc: '1h de prise de vue studio, 5 photos retouchées en haute définition.' },
      { title: 'Reportage d’équipe en entreprise (demi-journée)', price: '650 €', desc: 'Ambiance de travail, portraits individuels et photos de groupe.' },
    ],
    shop: [
      { title: 'Pack de 8 Presets Lightroom pour portraits', price: '29 €', type: 'Filtres' },
      { title: 'Checklist : Préparer son équipe pour un shooting', price: 'Gratuit', type: 'PDF' },
    ],
  },
  {
    id: 'tech',
    tabLabel: 'Karim • Designer & Dev (Dark)',
    name: 'Karim Benali',
    badge: 'Obsidienne Pro',
    role: 'Product Designer & Créateur Webflow',
    location: 'Bruxelles & Remote',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    coverGradient: 'from-indigo-950 via-slate-900 to-neutral-950',
    themeBg: '#09090B',
    themeCard: '#18181B',
    themeText: '#FAFAFA',
    themeSubtext: '#A1A1AA',
    themeAccent: '#6366F1',
    themeButtonBg: '#27272A',
    isDark: true,
    stats: [
      { val: '40+', label: 'projets SaaS' },
      { val: '3 Awards', label: 'Awwwards' },
      { val: '100%', label: 'satisfaction' },
    ],
    tags: ['UI/UX', 'DESIGN SYSTEM', 'WEBFLOW'],
    links: [
      { label: 'Consulter mon portfolio Dribbble & X', sub: 'Études de cas interactives', url: '#' },
      { label: 'Réserver un sprint design (1 semaine)', sub: 'Disponibilités ouvertes', url: '#' },
      { label: 'Télécharger mon Kit UI Figma gratuit', sub: '+10k téléchargements', url: '#' },
    ],
    services: [
      { title: 'Refonte UI Landing Page Conversion', price: '1 200 €', desc: 'Design complet Figma avec responsive mobile et prototypes interactifs.' },
      { title: 'Audit UX & Ergonomie (1h en visio)', price: '150 €', desc: 'Revue détaillée de votre application avec plan d’action immédiat.' },
    ],
    shop: [
      { title: 'Système Design Figma 2026 complet', price: '49 €', type: 'Figma' },
      { title: 'Guide : Vendre ses prestations design à l’international', price: 'Gratuit', type: 'PDF' },
    ],
  },
];

export function InteractiveLandingDemo() {
  const [activePersonaIndex, setActivePersonaIndex] = useState(0);
  const [currentTab, setCurrentTab] = useState<'profil' | 'services' | 'shop'>('profil');
  const [copiedVCard, setCopiedVCard] = useState(false);

  const persona = PERSONAS[activePersonaIndex];

  const handleFakeVCard = () => {
    setCopiedVCard(true);
    setTimeout(() => setCopiedVCard(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Persona Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1.5 rounded-2xl bg-neutral-100/90 border border-neutral-200/80 shadow-inner">
        {PERSONAS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePersonaIndex(idx);
              setCurrentTab('profil');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activePersonaIndex === idx
                ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/80 scale-[1.02]'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                p.isDark ? 'bg-indigo-500' : idx === 0 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span>{p.tabLabel}</span>
          </button>
        ))}
      </div>

      {/* Realistic Interactive Phone Shell with Ambient Glow */}
      <div className="relative group">
        {/* Soft Ambient Glow */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-amber-500/10 rounded-[56px] blur-2xl -z-10 group-hover:opacity-100 transition duration-500" />

        <div className="relative w-full max-w-[360px] rounded-[50px] bg-neutral-950 p-3 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.25)] border-[5px] border-neutral-800 ring-1 ring-black/40">
          {/* Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-30 flex items-center justify-end px-3 gap-1.5 pointer-events-none shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-950 border border-indigo-500/50" />
          </div>

          {/* Smartphone Screen */}
          <div
            className="w-full rounded-[40px] overflow-hidden p-4 pt-7 flex flex-col items-center text-center transition-all duration-300 min-h-[580px] select-none"
            style={{ backgroundColor: persona.themeBg, color: persona.themeText }}
          >
            {/* Cover Header */}
            <div
              className={`w-full h-18 rounded-2xl bg-gradient-to-r ${persona.coverGradient} mb-[-30px] border border-black/5 shadow-inner`}
            />

            {/* Avatar with Ring */}
            <div className="relative z-10 mb-2">
              <div
                className={`w-18 h-18 rounded-full overflow-hidden shadow-lg ${
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
                className={`font-black text-sm ${
                  persona.isDark ? 'text-white' : 'text-neutral-950'
                }`}
              >
                {persona.name}
              </h4>
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black">
                ✓
              </span>
            </div>

            <p
              className="text-[11px] font-medium max-w-[240px] leading-tight mb-1"
              style={{ color: persona.themeSubtext }}
            >
              {persona.role}
            </p>
            <p className="text-[10px] text-neutral-400 font-semibold mb-3">
              📍 {persona.location}
            </p>

            {/* Fast Contact Actions */}
            <div className="flex items-center gap-2 w-full mb-3.5">
              <button
                type="button"
                onClick={handleFakeVCard}
                className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer ${
                  persona.isDark
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-white'
                }`}
              >
                {copiedVCard ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enregistré dans le tél !</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Ajouter aux contacts</span>
                  </>
                )}
              </button>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition ${
                  persona.isDark
                    ? 'bg-neutral-900 border-neutral-800 text-emerald-400'
                    : 'bg-white border-neutral-200 text-emerald-600'
                }`}
                title="WhatsApp"
              >
                <Whatsapp className="w-4 h-4" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition ${
                  persona.isDark
                    ? 'bg-neutral-900 border-neutral-800 text-white'
                    : 'bg-white border-neutral-200 text-neutral-800'
                }`}
                title="Appel"
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Interactive In-Screen Tabs */}
            <div
              className={`flex p-1 rounded-xl border w-full mb-3 text-[11px] font-bold ${
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
                    : 'text-neutral-500'
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
                    : 'text-neutral-500'
                }`}
              >
                Services ({persona.services.length})
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('shop')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  currentTab === 'shop'
                    ? persona.isDark
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500'
                }`}
              >
                Boutique ({persona.shop.length})
              </button>
            </div>

            {/* Tab Content: Links */}
            {currentTab === 'profil' && (
              <div className="flex flex-col gap-2 w-full animate-in fade-in duration-200">
                {/* Mini Stats Bar */}
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
                        className={`font-black text-[11px] ${
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
                    className={`py-2.5 px-3.5 rounded-xl border text-left flex items-center justify-between shadow-2xs hover:border-indigo-400 transition cursor-pointer ${
                      persona.isDark
                        ? 'bg-neutral-900 border-neutral-800'
                        : 'bg-white border-neutral-200/80'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-[11px] font-bold truncate ${
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

            {/* Tab Content: Services */}
            {currentTab === 'services' && (
              <div className="flex flex-col gap-2 w-full text-left animate-in fade-in duration-200">
                {persona.services.map((svc, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border shadow-2xs flex flex-col gap-1 ${
                      persona.isDark
                        ? 'bg-neutral-900 border-neutral-800'
                        : 'bg-white border-neutral-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-extrabold ${
                          persona.isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        {svc.title}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          persona.isDark
                            ? 'bg-indigo-500/20 text-indigo-300'
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

            {/* Tab Content: Shop */}
            {currentTab === 'shop' && (
              <div className="flex flex-col gap-2 w-full text-left animate-in fade-in duration-200">
                {persona.shop.map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border shadow-2xs flex items-center justify-between ${
                      persona.isDark
                        ? 'bg-neutral-900 border-neutral-800'
                        : 'bg-white border-neutral-200/80'
                    }`}
                  >
                    <div>
                      <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider block">
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
                      className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 ml-2 ${
                        persona.isDark
                          ? 'bg-indigo-600 text-white'
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

      <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-neutral-500">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Cliquez sur les onglets et boutons ci-dessus pour tester en direct</span>
      </div>
    </div>
  );
}
