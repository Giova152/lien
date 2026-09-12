'use client';

import React, { useState } from 'react';
import { PublicProfileView } from '@/components/public/PublicProfileView';
import { Profile, LinkItem, ContactInfo } from '@/types';
import { Signal, Wifi, Battery, Smartphone } from '@/components/ui/Icons';

interface PersonaData {
  id: string;
  tabLabel: string;
  isDark?: boolean;
  profile: Profile;
  links: LinkItem[];
  contact: ContactInfo;
}

const PERSONAS: PersonaData[] = [
  {
    id: 'consulting',
    tabLabel: 'Sophie • Cabinet Conseil',
    isDark: false,
    profile: {
      id: 'demo-sophie',
      username: 'sophiemartin',
      display_name: 'Sophie Martin',
      title: 'Conseil en Gouvernance & Stratégie',
      company: 'Martin & Associés',
      bio: 'J’accompagne les dirigeants et fondateurs dans le cadrage de leur vision, la négociation stratégique et la gouvernance d’entreprise.',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      is_published: true,
      is_pro: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      theme: {
        background_type: 'color',
        background_value: '#FAF8F5',
        button_style: 'rounded-xl',
        button_color: '#F5F2EC',
        button_text_color: '#1C1917',
        button_border_color: '#E8E2D5',
        font_family: 'Inter',
        text_color: '#1C1917',
        accent_color: '#B45309',
        is_pro: true,
        location: 'Paris & Genève',
        stats: [
          { id: '1', value: '15 min', label: 'réponse moyenne' },
          { id: '2', value: 'Paris / Visio', label: 'disponibilité' },
          { id: '3', value: 'vCard .vcf', label: 'format universel' },
        ],
        expertise_tags: ['✦ Stratégie', '✦ Gouvernance', '✦ Conseil M&A', '✦ Financement'],
        services: [
          {
            id: 's1',
            title: 'Cadrage stratégique (1h30)',
            subtitle: 'Session intensive en visio ou présentiel pour valider votre feuille de route.',
            price: '250 €',
            url: 'https://calendly.com',
            button_text: 'Prendre RDV',
          },
          {
            id: 's2',
            title: 'Accompagnement trimestriel',
            subtitle: 'Comité de direction mensuel et assistance WhatsApp directe.',
            price: 'Sur devis',
            url: 'https://wa.me/33612345678',
            button_text: 'Demander un devis',
          },
        ],
        products: [
          {
            id: 'p1',
            title: 'Guide pratique : Négociation d’actionnaires',
            price: '29 €',
            type: 'paid',
            image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=80',
            url: '#',
          },
          {
            id: 'p2',
            title: 'Checklist d’audit de gouvernance 2026',
            price: 'Gratuit',
            type: 'free',
            url: '#',
          },
        ],
      },
    },
    contact: {
      profile_id: 'demo-sophie',
      phone: '+33 6 12 34 56 78',
      whatsapp: '+33 6 12 34 56 78',
      email: 'sophie@martin-associes.com',
      address: 'Paris 8e & Genève',
      website: 'https://martin-associes.com',
      show_save_contact_button: true,
    },
    links: [
      {
        id: 'l1',
        profile_id: 'demo-sophie',
        type: 'custom',
        label: 'Prendre rendez-vous en ligne (Agenda)',
        url: 'https://calendly.com',
        position: 1,
        is_active: true,
        click_count: 245,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'l2',
        profile_id: 'demo-sophie',
        type: 'social',
        platform: 'linkedin',
        label: 'Profil vérifié LinkedIn',
        url: 'https://linkedin.com',
        position: 2,
        is_active: true,
        click_count: 512,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'l3',
        profile_id: 'demo-sophie',
        type: 'custom',
        label: 'Consulter la brochure du cabinet 2026',
        url: '#',
        position: 3,
        is_active: true,
        click_count: 118,
        created_at: '',
        updated_at: '',
      },
    ],
  },
  {
    id: 'studio',
    tabLabel: 'Thomas • Photographe Studio',
    isDark: false,
    profile: {
      id: 'demo-thomas',
      username: 'thomaslaurent',
      display_name: 'Thomas Laurent',
      title: 'Photographe Éditorial & Corporate',
      company: 'Studio Laurent',
      bio: 'Création de portraits dirigeants, campagnes de marque et reportages d’entreprise en France et à l’international.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop&q=80',
      is_published: true,
      is_pro: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      theme: {
        background_type: 'color',
        background_value: '#F4F4F5',
        button_style: 'rounded-xl',
        button_color: '#FFFFFF',
        button_text_color: '#09090B',
        button_border_color: '#E4E4E7',
        font_family: 'Inter',
        text_color: '#09090B',
        accent_color: '#18181B',
        is_pro: true,
        location: 'Lyon & Déplacements',
        stats: [
          { id: '1', value: 'Studio Lyon', label: 'lieu de shooting' },
          { id: '2', value: '48h', label: 'livraison HD' },
          { id: '3', value: 'RAW / TIFF', label: 'qualité studio' },
        ],
        expertise_tags: ['✦ Portrait Corporate', '✦ Éditorial', '✦ Direction Artistique'],
        services: [
          {
            id: 'ts1',
            title: 'Pack Portrait Dirigeant (Studio)',
            subtitle: '1h de prise de vue, 5 photos retouchées en haute résolution.',
            price: '220 €',
            url: '#',
            button_text: 'Réserver un créneau',
          },
          {
            id: 'ts2',
            title: 'Reportage d’entreprise (Demi-journée)',
            subtitle: 'Immersion dans vos locaux, portraits d’équipe et ambiance.',
            price: '650 €',
            url: '#',
            button_text: 'Demande de devis',
          },
        ],
        products: [
          {
            id: 'tp1',
            title: 'Pack de 8 Presets Lightroom Studio',
            price: '19 €',
            type: 'paid',
            image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80',
            url: '#',
          },
        ],
      },
    },
    contact: {
      profile_id: 'demo-thomas',
      phone: '+33 4 72 00 00 00',
      whatsapp: '+33 6 00 00 00 00',
      email: 'contact@studio-laurent.fr',
      address: 'Lyon 6e',
      website: 'https://studio-laurent.fr',
      show_save_contact_button: true,
    },
    links: [
      {
        id: 'tl1',
        profile_id: 'demo-thomas',
        type: 'custom',
        label: 'Consulter mon portfolio 2026',
        url: '#',
        position: 1,
        is_active: true,
        click_count: 420,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'tl2',
        profile_id: 'demo-thomas',
        type: 'social',
        platform: 'instagram',
        label: 'Instagram @thomaslaurent_photo',
        url: 'https://instagram.com',
        position: 2,
        is_active: true,
        click_count: 890,
        created_at: '',
        updated_at: '',
      },
    ],
  },
  {
    id: 'craft',
    tabLabel: 'Karim • Design & Code (Dark)',
    isDark: true,
    profile: {
      id: 'demo-karim',
      username: 'karimbenali',
      display_name: 'Karim Benali',
      title: 'Product Designer & Architecte Front',
      company: 'Indépendant',
      bio: 'Design de plateformes web, design systems et architecture Next.js / Tailwind pour startups et scale-ups.',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      is_published: true,
      is_pro: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      theme: {
        background_type: 'color',
        background_value: '#09090B',
        button_style: 'rounded-xl',
        button_color: '#18181B',
        button_text_color: '#FAFAFA',
        button_border_color: '#27272A',
        font_family: 'Inter',
        text_color: '#FAFAFA',
        accent_color: '#E4E4E7',
        is_pro: true,
        location: 'Bruxelles & Remote',
        stats: [
          { id: '1', value: 'Next.js', label: 'stack principale' },
          { id: '2', value: 'CET', label: 'fuseau horaire' },
          { id: '3', value: '100%', label: 'disponibilité' },
        ],
        expertise_tags: ['✦ Design System', '✦ UI/UX', '✦ Next.js', '✦ Tailwind'],
        services: [
          {
            id: 'ks1',
            title: 'Audit Ergonomie & UI (1h visio)',
            subtitle: 'Revue complète de vos écrans et plan d’action priorisé.',
            price: '180 €',
            url: '#',
            button_text: 'Prendre un créneau',
          },
          {
            id: 'ks2',
            title: 'Sprint Design & Prototype (5 jours)',
            subtitle: 'Conception de flux complets Figma prêts pour la production.',
            price: 'Sur devis',
            url: '#',
            button_text: 'Contacter',
          },
        ],
        products: [
          {
            id: 'kp1',
            title: 'Kit UI Figma & Tokens Tailwind 2026',
            price: '39 €',
            type: 'paid',
            image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&auto=format&fit=crop&q=80',
            url: '#',
          },
          {
            id: 'kp2',
            title: 'Guide d’accessibilité pour SaaS',
            price: 'Gratuit',
            type: 'free',
            url: '#',
          },
        ],
      },
    },
    contact: {
      profile_id: 'demo-karim',
      phone: '+32 2 000 00 00',
      whatsapp: '+32 4 000 00 00',
      email: 'karim@benali-design.com',
      address: 'Bruxelles',
      website: 'https://benali-design.com',
      show_save_contact_button: true,
    },
    links: [
      {
        id: 'kl1',
        profile_id: 'demo-karim',
        type: 'custom',
        label: 'Études de cas & Démo interactive',
        url: '#',
        position: 1,
        is_active: true,
        click_count: 630,
        created_at: '',
        updated_at: '',
      },
      {
        id: 'kl2',
        profile_id: 'demo-karim',
        type: 'social',
        platform: 'github',
        label: 'Dépôts GitHub open-source',
        url: 'https://github.com',
        position: 2,
        is_active: true,
        click_count: 410,
        created_at: '',
        updated_at: '',
      },
    ],
  },
];

export function InteractiveLandingDemo() {
  const [activePersonaIndex, setActivePersonaIndex] = useState(0);

  const persona = PERSONAS[activePersonaIndex];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Persona Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200/80 shadow-xs">
        {PERSONAS.map((p, idx) => {
          const isActive = activePersonaIndex === idx;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePersonaIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200/80 scale-[1.02]'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  p.isDark ? 'bg-neutral-950 ring-1 ring-neutral-400' : idx === 0 ? 'bg-amber-600' : 'bg-neutral-600'
                }`}
              />
              <span>{p.tabLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Realistic Smartphone Frame rendering the REAL PublicProfileView engine */}
      <div className="w-[330px] sm:w-[360px] h-[720px] rounded-[52px] bg-neutral-900 border-[9px] border-neutral-900 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.22),0_4px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden relative flex flex-col ring-1 ring-black/20 text-left">
        {/* Dynamic Island */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2 gap-1.5 shadow-inner pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-neutral-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
        </div>

        {/* Status Bar */}
        <div className="w-full h-8 px-6 pt-1 flex items-center justify-between text-[10px] font-semibold text-neutral-800 z-20 select-none pointer-events-none">
          <span className="font-medium">09:41</span>
          <div className="flex items-center gap-1.5 opacity-80">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Scrollable Viewport rendering the REAL PublicProfileView */}
        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar">
          <PublicProfileView
            profile={persona.profile}
            links={persona.links}
            contact={persona.contact}
            initialLang="fr"
          />
        </div>

        {/* Home Bar Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/30 rounded-full z-30 pointer-events-none" />
      </div>

      <div className="flex items-center gap-2 mt-5 text-xs text-neutral-500 font-medium">
        <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
        <span>Rendu 100% réel et identique à votre future page publique (scrollable, onglets interactifs et QR Code fonctionnels).</span>
      </div>
    </div>
  );
}
