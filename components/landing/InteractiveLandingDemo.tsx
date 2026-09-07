'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  Download,
  ArrowRight,
  Whatsapp,
  Mail,
  MapPin,
  ExternalLink,
  Calendar,
  Sparkles,
  Check,
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
  themeAccent: string;
  themeButtonBg: string;
  stats: { val: string; label: string }[];
  tags: string[];
  links: { label: string; sub: string; url: string }[];
  services: { title: string; price: string; desc: string }[];
  shop: { title: string; price: string; type: string }[];
}

const PERSONAS: Persona[] = [
  {
    id: 'coach',
    tabLabel: 'Sophie (Coach & Consultante)',
    name: 'Sophie Martin',
    badge: 'Pro vérifié',
    role: 'Accompagnement d’entrepreneurs & Dirigeants',
    location: 'Paris, France',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    coverGradient: 'from-amber-200/40 via-amber-100/20 to-stone-100',
    themeBg: '#FAF8F5',
    themeCard: '#FFFFFF',
    themeText: '#1C1917',
    themeAccent: '#B45309',
    themeButtonBg: '#F5F2EC',
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
    tabLabel: 'Thomas (Photographe & Vidéaste)',
    name: 'Thomas Laurent',
    badge: 'Artiste',
    role: 'Photographie éditoriale & Portraits pros',
    location: 'Lyon & Déplacements',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    coverGradient: 'from-zinc-200 via-stone-200 to-neutral-100',
    themeBg: '#F4F4F5',
    themeCard: '#FFFFFF',
    themeText: '#09090B',
    themeAccent: '#18181B',
    themeButtonBg: '#E4E4E7',
    stats: [
      { val: '350+', label: 'shootings' },
      { val: '12', label: 'publications presse' },
      { val: '48h', label: 'délai de livraison' },
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
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200/80">
        {PERSONAS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePersonaIndex(idx);
              setCurrentTab('profil');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activePersonaIndex === idx
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {p.tabLabel}
          </button>
        ))}
      </div>

      {/* Realistic Interactive Phone Shell */}
      <div className="relative w-full max-w-[360px] rounded-[48px] bg-neutral-900 p-3 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.18)] border-4 border-neutral-800 ring-1 ring-black/10">
        {/* Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2.5 gap-1.5 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-neutral-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-950 border border-indigo-500/40" />
        </div>

        {/* Smartphone Screen */}
        <div
          className="w-full rounded-[38px] overflow-hidden p-4 pt-7 flex flex-col items-center text-center transition-colors duration-300 min-h-[580px]"
          style={{ backgroundColor: persona.themeBg, color: persona.themeText }}
        >
          {/* Cover Header */}
          <div
            className={`w-full h-16 rounded-2xl bg-gradient-to-r ${persona.coverGradient} mb-[-28px] border border-black/5`}
          />

          {/* Avatar */}
          <div className="relative z-10 mb-2">
            <div className="w-18 h-18 rounded-full border-4 border-white overflow-hidden shadow-md bg-neutral-100">
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Name & Badge */}
          <div className="flex items-center gap-1.5 justify-center mb-0.5">
            <h4 className="font-extrabold text-sm text-neutral-900">{persona.name}</h4>
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-black">
              ✓
            </span>
          </div>

          <p className="text-[11px] text-neutral-600 font-medium max-w-[240px] leading-tight mb-1">
            {persona.role}
          </p>
          <p className="text-[10px] text-neutral-400 font-semibold mb-3">
            📍 {persona.location}
          </p>

          {/* Fast Contact Actions */}
          <div className="flex items-center gap-2 w-full mb-3.5">
            <button
              onClick={handleFakeVCard}
              className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              {copiedVCard ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span>Ajouter au contact</span>
                </>
              )}
            </button>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-xl border border-neutral-200 bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-xs"
              title="WhatsApp"
            >
              <Whatsapp className="w-4 h-4" />
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-9 h-9 rounded-xl border border-neutral-200 bg-white text-neutral-800 flex items-center justify-center shrink-0 shadow-xs"
              title="Appel"
            >
              <PhoneCall className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Interactive In-Screen Tabs */}
          <div className="flex p-1 rounded-xl bg-black/5 border border-black/5 w-full mb-3 text-[11px] font-bold">
            <button
              onClick={() => setCurrentTab('profil')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                currentTab === 'profil' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
              }`}
            >
              Liens
            </button>
            <button
              onClick={() => setCurrentTab('services')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                currentTab === 'services' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
              }`}
            >
              Services ({persona.services.length})
            </button>
            <button
              onClick={() => setCurrentTab('shop')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                currentTab === 'shop' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
              }`}
            >
              Boutique ({persona.shop.length})
            </button>
          </div>

          {/* Tab Content: Links */}
          {currentTab === 'profil' && (
            <div className="flex flex-col gap-2 w-full animate-in fade-in duration-200">
              {/* Mini Stats Bar */}
              <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-white/70 border border-neutral-200/60 mb-1">
                {persona.stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="font-extrabold text-[11px] text-neutral-900">{s.val}</div>
                    <div className="text-[8px] text-neutral-500 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>

              {persona.links.map((link, i) => (
                <div
                  key={i}
                  className="py-2.5 px-3.5 rounded-xl bg-white border border-neutral-200/80 text-left flex items-center justify-between shadow-2xs hover:border-neutral-300 transition"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-neutral-900 truncate">
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
                  className="p-3 rounded-xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-neutral-900">{svc.title}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
                      {svc.price}
                    </span>
                  </div>
                  <p className="text-[9px] text-neutral-600 leading-normal">{svc.desc}</p>
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
                  className="p-3 rounded-xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between"
                >
                  <div>
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider block">
                      {item.type}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-900">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-neutral-900 text-white shrink-0 ml-2">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-neutral-400 mt-4 font-medium">
        👆 Cliquez sur les onglets ci-dessus pour tester l'interaction en direct.
      </p>
    </div>
  );
}
