'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Profile, LinkItem, ContactInfo, ThemeConfig } from '@/types';
import { ProfileHeader } from '@/components/public/ProfileHeader';
import { LinkButton } from '@/components/public/LinkButton';
import { VCardButton } from '@/components/public/VCardButton';
import { QrCodeModal } from '@/components/public/QrCodeModal';
import { ThemeWrapper } from '@/components/public/ThemeWrapper';
import { Sparkles, Calendar, UserCheck, BookOpen, ChevronDown, ChevronUp, ArrowRight, ExternalLink } from '@/components/ui/Icons';

interface PublicProfileViewProps {
  profile: Profile;
  links: LinkItem[];
  contact: ContactInfo | null;
  isOwner?: boolean;
}

export function PublicProfileView({ profile, links, contact, isOwner }: PublicProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'profil' | 'services' | 'shop'>('profil');
  const [openServiceAccordion, setOpenServiceAccordion] = useState<number | null>(0);
  const [shopFilter, setShopFilter] = useState<'all' | 'free' | 'paid'>('all');

  const theme = profile.theme;
  const isLuxuryTheme = theme.font_family === 'Playfair Display' || theme.background_value === '#FBF9F4';

  const servicesList = [
    {
      id: 0,
      title: 'RÉSERVER UN RDV GRATUIT',
      icon: Calendar,
      badge: '1',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      items: [{ title: 'Appel découverte (30 min)', subtitle: 'Gratuit · Confidentiel · Sans engagement' }],
    },
    {
      id: 1,
      title: 'COACHING',
      icon: UserCheck,
      badge: '2',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      items: [
        { title: 'Coaching individuel personnalisé (1h)', subtitle: 'Suivi sur-mesure & Plan d’action' },
        { title: 'Programme d’accompagnement 3 mois', subtitle: 'Mentorat hebdomadaire complet' },
      ],
    },
    {
      id: 2,
      title: 'PROGRAMMES',
      icon: Sparkles,
      badge: '4',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      items: [
        { title: 'Programme Bien-être au quotidien', subtitle: 'Méthodes pas-à-pas' },
        { title: 'Masterclass Transformation personnelle', subtitle: 'Vidéos & Supports inclus' },
      ],
    },
    {
      id: 3,
      title: 'FORMATION & E-BOOKS',
      icon: BookOpen,
      badge: '1',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      items: [{ title: 'Guide pratique E-book', subtitle: 'Téléchargement immédiat en PDF' }],
    },
  ];

  const shopProducts = [
    {
      id: 1,
      title: 'Soins de pieds',
      type: 'free',
      price: 'Gratuit',
      image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 2,
      title: '5 étapes pour ouvrir une garderie rentable',
      type: 'paid',
      price: '10 $',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 3,
      title: 'Conte pour enfant',
      type: 'free',
      price: 'Gratuit',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60',
    },
  ];

  const filteredProducts = shopProducts.filter((p) => {
    if (shopFilter === 'free') return p.type === 'free';
    if (shopFilter === 'paid') return p.type === 'paid';
    return true;
  });

  return (
    <ThemeWrapper theme={theme}>
      <div className="min-h-screen w-full flex flex-col items-center px-4 pb-20 pt-4">
        {/* Profile Header & Navigation Pills */}
        <ProfileHeader
          profile={profile}
          theme={theme}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab 1: PROFIL */}
        {activeTab === 'profil' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-in fade-in duration-300">
            {/* KPI Stat Cards Grid (3 columns) */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-3 text-center shadow-sm">
                <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">12+</div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  Ans d'expérience
                </div>
              </div>

              <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-3 text-center shadow-sm">
                <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">2k+</div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  Clients satisfaits
                </div>
              </div>

              <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-3 text-center shadow-sm">
                <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">9</div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  Programmes
                </div>
              </div>
            </div>

            {/* Section À propos */}
            {profile.bio && (
              <div className="bg-white/90 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm text-left">
                <h3 className={`text-base font-extrabold mb-2 flex items-center gap-1.5 ${isLuxuryTheme ? 'font-serif' : ''}`}>
                  <span className="text-amber-500 font-bold">|</span> À propos
                </h3>
                <p className="text-xs opacity-85 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Section Domaines d'expertise */}
            <div className="bg-white/90 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm text-left">
              <h3 className={`text-base font-extrabold mb-3 flex items-center gap-1.5 ${isLuxuryTheme ? 'font-serif' : ''}`}>
                <span className="text-amber-500 font-bold">|</span> Domaines d'expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  '✦ SOINS NATURELS',
                  '✦ BIEN-ÊTRE FÉMININ',
                  '✦ COACHING',
                  '✦ FORMATION & EBOOKS',
                  '✦ ENTREPRENEURIAT',
                  '✦ PROGRAMMES',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Links List */}
            {links.length > 0 && (
              <div className="w-full flex flex-col items-center gap-2 mt-2">
                {links.map((link) => (
                  <LinkButton key={link.id} link={link} theme={theme} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: SERVICES */}
        {activeTab === 'services' && (
          <div className="w-full max-w-md flex flex-col gap-3 animate-in fade-in duration-300">
            {servicesList.map((service) => {
              const Icon = service.icon;
              const isOpen = openServiceAccordion === service.id;
              return (
                <div
                  key={service.id}
                  className="bg-white/90 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenServiceAccordion(isOpen ? null : service.id)}
                    className="w-full p-4 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${service.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{service.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black flex items-center justify-center">
                        {service.badge}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 opacity-60" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t border-black/5 dark:border-white/5">
                      {service.items.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-left">
                          <div>
                            <div className="text-xs font-bold">{item.title}</div>
                            <div className="text-[10px] opacity-70">{item.subtitle}</div>
                          </div>
                          <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold">
                            Réserver
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: SHOP */}
        {activeTab === 'shop' && (
          <div className="w-full max-w-md flex flex-col gap-4 animate-in fade-in duration-300">
            {/* Header Badge */}
            <div className="bg-white/90 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-sm text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Produits digitaux</h3>
                <p className="text-[10px] opacity-70">E-books gratuits & payants · Téléchargement immédiat</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShopFilter('all')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  shopFilter === 'all' ? 'bg-neutral-900 text-white' : 'bg-black/5 dark:bg-white/10 opacity-70'
                }`}
              >
                TOUS
              </button>
              <button
                onClick={() => setShopFilter('free')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  shopFilter === 'free' ? 'bg-emerald-600 text-white' : 'bg-black/5 dark:bg-white/10 opacity-70'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                GRATUITS
              </button>
              <button
                onClick={() => setShopFilter('paid')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  shopFilter === 'paid' ? 'bg-amber-600 text-white' : 'bg-black/5 dark:bg-white/10 opacity-70'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                PAYANTS
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((prod) => (
                <div key={prod.id} className="bg-white/90 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col text-left group">
                  <div className="w-full h-32 relative bg-neutral-800">
                    <Image src={prod.image} alt={prod.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        prod.type === 'free' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'
                      }`}
                    >
                      {prod.price}
                    </span>
                  </div>

                  <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                    <h4 className="text-xs font-bold line-clamp-2">{prod.title}</h4>
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{prod.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3 rounded-2xl bg-neutral-900 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg">
              <span>VOIR TOUS LES E-BOOKS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* VCard Download Button */}
        {contact && contact.show_save_contact_button && (
          <div className="w-full flex justify-center mt-6">
            <VCardButton profile={profile} contact={contact} theme={theme} />
          </div>
        )}

        {/* QR Code Trigger */}
        <QrCodeModal profile={profile} />

        {/* Customized Branding Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs opacity-75 font-medium">
            Réalisé par <span className="font-bold text-amber-600 dark:text-amber-400">Giovanny Gandonou</span>
          </p>
        </div>
      </div>
    </ThemeWrapper>
  );
}
