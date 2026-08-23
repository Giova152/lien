'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Profile, LinkItem, ContactInfo, StatItem, ServiceItem, ShopProduct } from '@/types';
import { ProfileHeader } from '@/components/public/ProfileHeader';
import { LinkButton } from '@/components/public/LinkButton';
import { VCardButton } from '@/components/public/VCardButton';
import { QrCodeModal } from '@/components/public/QrCodeModal';
import { ThemeWrapper } from '@/components/public/ThemeWrapper';
import { Sparkles, BookOpen, ChevronDown, ChevronUp, ArrowRight, PhoneCall, Whatsapp, Mail } from '@/components/ui/Icons';

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
  const accentColor = theme.accent_color || '#C5A059';

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
      <div className="min-h-screen w-full flex flex-col items-center justify-start px-3 sm:px-6 py-6 sm:py-12">
        {/* Floating Card Container (Exact 2-Tone Contrast & Subtle Golden Rim Shadow) */}
        <div
          className={`w-full max-w-md rounded-[36px] sm:rounded-[44px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.15)] border transition-all overflow-hidden flex flex-col items-center px-4 sm:px-6 pb-8 pt-2 relative ${
            isLuxuryTheme
              ? 'bg-[#FFFFFF] text-[#1C1917] border-[#E8E2D5]'
              : 'bg-neutral-900/90 text-white border-white/10 backdrop-blur-xl'
          }`}
        >
          {/* Top Gold Rim Accent Line */}
          <div
            className="w-full h-1.5 mb-2 rounded-full opacity-80"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
            }}
          />

          {/* Profile Header & Navigation Pills */}
          <ProfileHeader
            profile={profile}
            theme={theme}
            contact={contact}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab 1: PROFIL */}
          {activeTab === 'profil' && (
            <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
              {/* KPI Stat Cards Grid */}
              <div className={`grid grid-cols-${Math.min(stats.length, 3)} gap-2`}>
                {stats.map((st) => (
                  <div
                    key={st.id}
                    className="bg-neutral-50 dark:bg-black/40 backdrop-blur-md border rounded-2xl p-3 text-center shadow-sm"
                    style={{ borderColor: `${accentColor}33` }}
                  >
                    <div
                      className="text-lg sm:text-xl font-black"
                      style={{ color: accentColor }}
                    >
                      {st.value}
                    </div>
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider opacity-75"
                      style={{ color: theme.text_color }}
                    >
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Section À propos */}
              {profile.bio && (
                <div
                  className="bg-neutral-50 dark:bg-black/40 backdrop-blur-md border rounded-2xl p-4 sm:p-5 shadow-sm text-left"
                  style={{ borderColor: `${accentColor}33` }}
                >
                  <h3 className={`text-base font-extrabold mb-2 flex items-center gap-2 ${isLuxuryTheme ? 'font-serif' : ''}`} style={{ color: theme.text_color }}>
                    <span className="font-bold text-lg" style={{ color: accentColor }}>|</span> À propos
                  </h3>
                  <p className="text-xs opacity-85 leading-relaxed whitespace-pre-line" style={{ color: theme.text_color }}>
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Section Domaines d'expertise */}
              {tags.length > 0 && (
                <div
                  className="bg-neutral-50 dark:bg-black/40 backdrop-blur-md border rounded-2xl p-4 sm:p-5 shadow-sm text-left"
                  style={{ borderColor: `${accentColor}33` }}
                >
                  <h3 className={`text-base font-extrabold mb-3 flex items-center gap-2 ${isLuxuryTheme ? 'font-serif' : ''}`} style={{ color: theme.text_color }}>
                    <span className="font-bold text-lg" style={{ color: accentColor }}>|</span> Domaines d'expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          borderColor: `${accentColor}44`,
                          color: accentColor,
                        }}
                      >
                        {tag.startsWith('✦') ? tag : `✦ ${tag}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Coordonnées & Contact */}
              {contact && (contact.phone || contact.whatsapp || contact.email || contact.address || contact.website) && (
                <div
                  className="bg-neutral-50 dark:bg-black/40 backdrop-blur-md border rounded-2xl p-4 sm:p-5 shadow-sm text-left flex flex-col gap-2.5"
                  style={{ borderColor: `${accentColor}33` }}
                >
                  <h3 className={`text-sm font-extrabold mb-1 flex items-center gap-2 ${isLuxuryTheme ? 'font-serif' : ''}`} style={{ color: theme.text_color }}>
                    <span className="font-bold text-base" style={{ color: accentColor }}>|</span> Coordonnées & Contact
                  </h3>
                  
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2.5 text-xs font-semibold hover:opacity-80 transition" style={{ color: theme.text_color }}>
                      <PhoneCall className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{contact.phone}</span>
                    </a>
                  )}

                  {contact.whatsapp && (
                    <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs font-semibold hover:opacity-80 transition" style={{ color: theme.text_color }}>
                      <Whatsapp className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>WhatsApp : {contact.whatsapp}</span>
                    </a>
                  )}

                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 text-xs font-semibold hover:opacity-80 transition" style={{ color: theme.text_color }}>
                      <Mail className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>{contact.email}</span>
                    </a>
                  )}

                  {contact.address && (
                    <div className="flex items-center gap-2.5 text-xs font-semibold opacity-90" style={{ color: theme.text_color }}>
                      <span className="shrink-0">📍</span>
                      <span>{contact.address}</span>
                    </div>
                  )}

                  {contact.website && (
                    <a href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs font-semibold text-indigo-600 hover:underline transition">
                      <span className="shrink-0">🌐</span>
                      <span>{contact.website}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Links List */}
              {links.length > 0 && (
                <div className="w-full flex flex-col items-center gap-2.5 mt-2">
                  {links.map((link) => (
                    <LinkButton key={link.id} link={link} theme={theme} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: SERVICES */}
          {activeTab === 'services' && (
            <div className="w-full flex flex-col gap-3 animate-in fade-in duration-300">
              {services.map((service) => {
                const isOpen = openServiceAccordion === service.id;
                return (
                  <div
                    key={service.id}
                    className="bg-neutral-50 dark:bg-black/40 backdrop-blur-md border rounded-2xl overflow-hidden shadow-sm transition-all text-left"
                    style={{ borderColor: `${accentColor}33` }}
                  >
                    <button
                      onClick={() => setOpenServiceAccordion(isOpen ? null : service.id)}
                      className="w-full p-4 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider"
                      style={{ color: theme.text_color }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                        >
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
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-black border"
                            style={{
                              backgroundColor: `${accentColor}20`,
                              borderColor: `${accentColor}44`,
                              color: accentColor,
                            }}
                          >
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
                            <div className="text-xs font-bold" style={{ color: theme.text_color }}>{service.title}</div>
                            <div className="text-[10px] opacity-70" style={{ color: theme.text_color }}>{service.subtitle || 'Service personnalisé'}</div>
                          </div>
                          {service.url ? (
                            <a
                              href={service.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-white text-[10px] font-bold shadow"
                              style={{ backgroundColor: accentColor }}
                            >
                              Réserver
                            </a>
                          ) : (
                            <span
                              className="px-3 py-1 rounded-lg text-white text-[10px] font-bold"
                              style={{ backgroundColor: accentColor }}
                            >
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
            <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
              {/* Header Badge */}
              <div
                className="bg-neutral-50 dark:bg-black/40 backdrop-blur-md border rounded-2xl p-4 flex items-center gap-3 shadow-sm text-left"
                style={{ borderColor: `${accentColor}33` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div style={{ color: theme.text_color }}>
                  <h3 className="text-sm font-extrabold">Produits digitaux</h3>
                  <p className="text-[10px] opacity-70">E-books gratuits & payants · Téléchargement immédiat</p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShopFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                    shopFilter === 'all' ? 'text-white shadow' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: shopFilter === 'all' ? accentColor : 'rgba(0,0,0,0.1)',
                    color: shopFilter === 'all' ? '#ffffff' : theme.text_color,
                  }}
                >
                  TOUS
                </button>
                <button
                  onClick={() => setShopFilter('free')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                    shopFilter === 'free' ? 'text-white shadow' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: shopFilter === 'free' ? accentColor : 'rgba(0,0,0,0.1)',
                    color: shopFilter === 'free' ? '#ffffff' : theme.text_color,
                  }}
                >
                  GRATUITS
                </button>
                <button
                  onClick={() => setShopFilter('paid')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                    shopFilter === 'paid' ? 'text-white shadow' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: shopFilter === 'paid' ? accentColor : 'rgba(0,0,0,0.1)',
                    color: shopFilter === 'paid' ? '#ffffff' : theme.text_color,
                  }}
                >
                  PAYANTS
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((prod) => {
                  const CardWrapper = prod.url ? 'a' : 'div';
                  return (
                    <CardWrapper
                      key={prod.id}
                      {...(prod.url ? { href: prod.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="bg-neutral-50 dark:bg-black/40 backdrop-blur-md border rounded-2xl overflow-hidden shadow-sm flex flex-col text-left group hover:scale-[1.03] hover:shadow-lg transition-all duration-300 cursor-pointer"
                      style={{ borderColor: `${accentColor}33` }}
                    >
                      <div className="w-full h-32 relative bg-neutral-800 overflow-hidden">
                        {prod.image_url ? (
                          <Image src={prod.image_url} alt={prod.title} fill className="object-cover group-hover:scale-110 transition duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold opacity-40" style={{ color: theme.text_color }}>
                            E-Book
                          </div>
                        )}
                        <span
                          className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow"
                          style={{ backgroundColor: accentColor, color: '#ffffff' }}
                        >
                          {prod.price}
                        </span>
                      </div>

                      <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                        <h4 className="text-xs font-bold line-clamp-2" style={{ color: theme.text_color }}>{prod.title}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black" style={{ color: accentColor }}>{prod.price}</span>
                          <span className="text-[10px] font-bold opacity-80 group-hover:translate-x-0.5 transition-transform" style={{ color: accentColor }}>
                            Accéder ➔
                          </span>
                        </div>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>
            </div>
          )}



          {/* QR Code Trigger */}
          <QrCodeModal profile={profile} />


        </div>
      </div>
    </ThemeWrapper>
  );
}
