'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Profile, LinkItem, ContactInfo, StatItem, ServiceItem, ShopProduct } from '@/types';
import { ProfileHeader } from '@/components/public/ProfileHeader';
import { LinkButton } from '@/components/public/LinkButton';
import { VCardButton } from '@/components/public/VCardButton';
import { QrCodeModal } from '@/components/public/QrCodeModal';
import { ThemeWrapper } from '@/components/public/ThemeWrapper';
import { Sparkles, Calendar, UserCheck, BookOpen, ChevronDown, ChevronUp, ArrowRight } from '@/components/ui/Icons';

interface PublicProfileViewProps {
  profile: Profile;
  links: LinkItem[];
  contact: ContactInfo | null;
  isOwner?: boolean;
}

export function PublicProfileView({ profile, links, contact, isOwner }: PublicProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'profil' | 'services' | 'shop'>('profil');
  const [openServiceAccordion, setOpenServiceAccordion] = useState<string | null>(null);
  const [shopFilter, setShopFilter] = useState<'all' | 'free' | 'paid'>('all');

  const theme = profile.theme;
  const isLuxuryTheme = theme.font_family === 'Playfair Display' || theme.background_value === '#FBF9F4';

  // Dynamic user data or luxury fallbacks
  const stats: StatItem[] = theme.stats?.length
    ? theme.stats
    : [
        { id: '1', value: '12+', label: "Ans d'expérience" },
        { id: '2', value: '2k+', label: 'Clients satisfaits' },
        { id: '3', value: '9', label: 'Programmes' },
      ];

  const tags: string[] = theme.expertise_tags?.length
    ? theme.expertise_tags
    : [
        '✦ SOINS NATURELS',
        '✦ BIEN-ÊTRE FÉMININ',
        '✦ COACHING',
        '✦ FORMATION & EBOOKS',
        '✦ ENTREPRENEURIAT',
      ];

  const services: ServiceItem[] = theme.services?.length
    ? theme.services
    : [
        { id: '1', title: 'RÉSERVER UN RDV GRATUIT', category: 'RDV', subtitle: 'Appel découverte (30 min) · Gratuit · Confidentiel', price: 'Gratuit' },
        { id: '2', title: 'COACHING INDIVIDUEL', category: 'Coaching', subtitle: 'Accompagnement personnalisé & Sessions privées (1h)', price: 'Sur devis' },
        { id: '3', title: 'PROGRAMMES COMPLETS', category: 'Programmes', subtitle: 'Transformations pas-à-pas avec suivi hebdomadaire', price: 'Sur mesure' },
        { id: '4', title: 'FORMATIONS & GUIDES', category: 'Formation', subtitle: 'E-books et supports téléchargeables en PDF', price: 'Immédiat' },
      ];

  const products: ShopProduct[] = theme.products?.length
    ? theme.products
    : [
        {
          id: '1',
          title: 'Soins de pieds',
          type: 'free',
          price: 'Gratuit',
          image_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=500&auto=format&fit=crop&q=60',
        },
        {
          id: '2',
          title: '5 étapes pour ouvrir une garderie rentable',
          type: 'paid',
          price: '10 $',
          image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60',
        },
        {
          id: '3',
          title: 'Conte pour enfant',
          type: 'free',
          price: 'Gratuit',
          image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60',
        },
      ];

  const filteredProducts = products.filter((p) => {
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
            {/* KPI Stat Cards Grid */}
            <div className={`grid grid-cols-${Math.min(stats.length, 3)} gap-2`}>
              {stats.map((st) => (
                <div
                  key={st.id}
                  className="bg-white/80 dark:bg-black/30 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-3 text-center shadow-sm"
                >
                  <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                    {st.value}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {st.label}
                  </div>
                </div>
              ))}
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
            {tags.length > 0 && (
              <div className="bg-white/90 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm text-left">
                <h3 className={`text-base font-extrabold mb-3 flex items-center gap-1.5 ${isLuxuryTheme ? 'font-serif' : ''}`}>
                  <span className="text-amber-500 font-bold">|</span> Domaines d'expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider"
                    >
                      {tag.startsWith('✦') ? tag : `✦ ${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
            {services.map((service) => {
              const isOpen = openServiceAccordion === service.id;
              return (
                <div
                  key={service.id}
                  className="bg-white/90 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm transition-all text-left"
                >
                  <button
                    onClick={() => setOpenServiceAccordion(isOpen ? null : service.id)}
                    className="w-full p-4 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">{service.title}</span>
                        {service.category && (
                          <span className="text-[10px] opacity-60 font-mono">{service.category}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {service.price && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                          {service.price}
                        </span>
                      )}
                      {isOpen ? <ChevronUp className="w-4 h-4 opacity-60" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t border-black/5 dark:border-white/5">
                      <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-left">
                        <div>
                          <div className="text-xs font-bold">{service.title}</div>
                          <div className="text-[10px] opacity-70">{service.subtitle || 'Service personnalisé'}</div>
                        </div>
                        {service.url ? (
                          <a
                            href={service.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold"
                          >
                            Réserver
                          </a>
                        ) : (
                          <span className="px-3 py-1 rounded-lg bg-neutral-800 text-white text-[10px] font-bold">
                            Disponible
                          </span>
                        )}
                      </div>
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
                    {prod.image_url ? (
                      <Image src={prod.image_url} alt={prod.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold opacity-40">
                        E-Book
                      </div>
                    )}
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{prod.price}</span>
                      {prod.url && (
                        <a
                          href={prod.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-indigo-500 hover:underline"
                        >
                          Voir ➔
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
