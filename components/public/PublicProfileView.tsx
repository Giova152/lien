'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Profile, LinkItem, ContactInfo, StatItem, ServiceItem, ShopProduct } from '@/types';
import { ProfileHeader } from '@/components/public/ProfileHeader';
import { LinkButton } from '@/components/public/LinkButton';
import { VCardButton } from '@/components/public/VCardButton';
import { QrCodeModal } from '@/components/public/QrCodeModal';
import { ThemeWrapper } from '@/components/public/ThemeWrapper';
import {
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Calendar,
  Zap,
  ExternalLink,
  User,
} from '@/components/ui/Icons';
import { LogoIcon } from '@/components/ui/Logo';
import { formatExternalUrl } from '@/lib/utils';

interface PublicProfileViewProps {
  profile: Profile;
  links: LinkItem[];
  contact: ContactInfo | null;
  isOwner?: boolean;
  initialLang?: 'fr' | 'en';
}

const TRANSLATIONS = {
  fr: {
    about: 'À propos',
    expertise: "Domaines d'expertise",
    all: 'TOUS',
    noServices: 'Aucune prestation ajoutée pour le moment.',
    noCategoryServices: 'Aucune prestation dans cette catégorie.',
    bookCall: 'Prendre RDV',
    bookService: 'Réserver',
    contactWhatsapp: 'Contacter via WhatsApp',
    learnMore: 'En savoir plus',
    serviceOnDemand: 'Prestation disponible sur demande',
    ourProducts: 'Nos produits',
    free: 'GRATUITS',
    paid: 'PAYANTS',
    noProducts: 'Aucun produit disponible en boutique pour le moment.',
    access: 'Accéder ➔',
    saveContact: 'Enregistrer le contact',
    createdWith: 'Créé avec Lien-Bio',
  },
  en: {
    about: 'About',
    expertise: 'Areas of Expertise',
    all: 'ALL',
    noServices: 'No services added yet.',
    noCategoryServices: 'No services in this category.',
    bookCall: 'Book a Call',
    bookService: 'Book Now',
    contactWhatsapp: 'Contact on WhatsApp',
    learnMore: 'Learn More',
    serviceOnDemand: 'Service available upon request',
    ourProducts: 'Our Products',
    free: 'FREE',
    paid: 'PREMIUM',
    noProducts: 'No products available in store right now.',
    access: 'Access ➔',
    saveContact: 'Save Contact',
    createdWith: 'Created with Lien-Bio',
  },
};

function translateKpiLabel(label: string, lang: 'fr' | 'en'): string {
  if (lang === 'fr') return label;
  const l = label.trim().toLowerCase();
  if (l.includes('expérience') || l.includes('experience')) return 'Years Experience';
  if (l.includes('client')) return 'Happy Clients';
  if (l.includes('avis')) return 'Verified Reviews';
  if (l.includes('sur-mesure') || l.includes('sur mesure')) return 'Tailor-made';
  return label;
}

function isDarkColor(colorHex?: string): boolean {
  if (!colorHex) return false;
  if (colorHex.startsWith('rgba') || colorHex.startsWith('linear-gradient')) return false;
  const hex = colorHex.replace('#', '').trim();
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  return false;
}

export function PublicProfileView({
  profile,
  links,
  contact,
  isOwner,
  initialLang = 'fr',
}: PublicProfileViewProps) {
  const [lang, setLang] = useState<'fr' | 'en'>(initialLang || 'fr');

  React.useEffect(() => {
    if (initialLang) {
      setLang(initialLang);
    }
  }, [initialLang]);

  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<'profil' | 'services' | 'shop'>('profil');
  const [openServiceAccordion, setOpenServiceAccordion] = useState<string | null>(null);
  // Tab 3 Filter: Boutique / Shop
  const [shopFilter, setShopFilter] = useState<'all' | 'free' | 'paid'>('all');

  // Tab 2 Filter: Services Categories (Facultatif - au choix de l'utilisateur)
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');

  const theme = profile.theme;
  const isDarkText = isDarkColor(theme.text_color);
  const isDarkBg = isDarkColor(theme.background_value);
  const isDarkCard = isDarkBg || !isDarkText;
  const isLuxuryTheme = theme.font_family === 'Playfair Display';
  const accentColor = theme.accent_color || '#C5A059';
  const isPro = Boolean(profile.is_pro || theme.is_pro);

  const cardBoxBg = isDarkCard
    ? 'bg-neutral-900/90 text-white border-white/10 backdrop-blur-xl'
    : 'bg-[#FAF8F4] text-[#1C1A17] border-[#E8E2D5] shadow-xl';

  const sectionBoxBg = isDarkCard
    ? 'bg-white/5 border-white/10'
    : 'bg-white/80 border-[#E8E2D5]';

  // Dynamic user data (only if explicitly configured by the user, excluding hidden KPIs)
  const rawStats: StatItem[] = theme.stats || [];
  const stats: StatItem[] = rawStats.filter((st) => !st.hidden);
  const tags: string[] = theme.expertise_tags || [];
  const services: ServiceItem[] = theme.services || [];
  const products: ShopProduct[] = theme.products || [];

  // Extract unique non-empty trimmed categories from services
  const availableServiceCategories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach((s) => {
      const c = s.category?.trim();
      if (c) cats.add(c);
    });
    return Array.from(cats);
  }, [services]);

  // Check if categories are enabled in theme AND at least 1 category exists
  const showServiceCategories =
    theme.enable_service_categories !== false && availableServiceCategories.length > 0;

  // Filtered services list according to selected category
  const filteredServices = useMemo(() => {
    if (!showServiceCategories || serviceCategoryFilter === 'all') {
      return services;
    }
    return services.filter(
      (s) => s.category?.trim().toLowerCase() === serviceCategoryFilter.toLowerCase()
    );
  }, [services, showServiceCategories, serviceCategoryFilter]);

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
          className={`w-full max-w-md rounded-[36px] sm:rounded-[44px] border transition-all overflow-hidden flex flex-col items-center px-4 sm:px-6 pb-8 pt-2 relative ${cardBoxBg}`}
        >
          {/* Top Bar with Accent Line & Bilingual Switcher */}
          <div className="w-full flex items-center justify-between pt-1 pb-1 px-1">
            <div className="w-12" />
            <div
              className="h-1 flex-1 mx-2 rounded-full opacity-70"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
              }}
            />
            {/* Language Pill Switcher */}
            <div
              className="inline-flex items-center p-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shrink-0 shadow-2xs z-10"
              style={{
                backgroundColor: isDarkCard ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                borderColor: `${accentColor}33`,
              }}
            >
              <button
                type="button"
                onClick={() => setLang('fr')}
                className={`px-1.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                  lang === 'fr'
                    ? 'font-black text-white shadow-xs'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: lang === 'fr' ? accentColor : 'transparent',
                  color: lang === 'fr' ? '#ffffff' : theme.text_color,
                }}
                title="Français"
              >
                <span>🇫🇷</span>
                <span className="text-[9px]">FR</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                  lang === 'en'
                    ? 'font-black text-white shadow-xs'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: lang === 'en' ? accentColor : 'transparent',
                  color: lang === 'en' ? '#ffffff' : theme.text_color,
                }}
                title="English"
              >
                <span>🇬🇧</span>
                <span className="text-[9px]">EN</span>
              </button>
            </div>
          </div>

          {/* Profile Header & Navigation Pills */}
          <ProfileHeader
            profile={profile}
            theme={theme}
            contact={contact}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            lang={lang}
          />

          {/* Tab 1: PROFIL */}
          {activeTab === 'profil' && (
            <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
              {/* KPI Stat Cards Grid */}
              {stats.length > 0 && (
                <div
                  className={`grid ${
                    stats.length === 1
                      ? 'grid-cols-1'
                      : stats.length === 2
                      ? 'grid-cols-2'
                      : stats.length === 3
                      ? 'grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-4'
                  } gap-2`}
                >
                  {stats.map((st) => (
                    <div
                      key={st.id}
                      className={`${sectionBoxBg} backdrop-blur-md border rounded-2xl p-3 text-center shadow-sm`}
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
                        {translateKpiLabel(st.label, lang)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Section À propos */}
              {profile.bio && (
                <div
                  className={`${sectionBoxBg} backdrop-blur-md border rounded-2xl p-4 sm:p-5 shadow-xs text-left transition-all`}
                  style={{ borderColor: `${accentColor}25` }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <h3
                      className={`text-sm font-bold tracking-tight ${isLuxuryTheme ? 'font-serif' : ''}`}
                      style={{ color: theme.text_color }}
                    >
                      {t.about}
                    </h3>
                  </div>
                  <p
                    className="text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-line opacity-90 pl-0.5"
                    style={{ color: theme.text_color }}
                  >
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Section Domaines d'expertise */}
              {tags.length > 0 && (
                <div
                  className={`${sectionBoxBg} backdrop-blur-md border rounded-2xl p-4 sm:p-5 shadow-xs text-left transition-all`}
                  style={{ borderColor: `${accentColor}25` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h3
                      className={`text-sm font-bold tracking-tight ${isLuxuryTheme ? 'font-serif' : ''}`}
                      style={{ color: theme.text_color }}
                    >
                      {t.expertise}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => {
                      const cleanTag = tag.replace(/^[✦•\-\*\s]+/, '').trim();
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold tracking-wide transition-all shadow-2xs"
                          style={{
                            backgroundColor: isDarkCard ? 'rgba(255,255,255,0.06)' : `${accentColor}10`,
                            borderColor: `${accentColor}30`,
                            color: isDarkCard ? '#FFFFFF' : theme.text_color,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: accentColor }}
                          />
                          {cleanTag}
                        </span>
                      );
                    })}
                  </div>
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
            <div className="w-full flex flex-col gap-3.5 animate-in fade-in duration-300">
              {/* Category Filter Pills (Facultatif : affiché uniquement si configuré et activé) */}
              {showServiceCategories && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mt-1">
                  <button
                    type="button"
                    onClick={() => setServiceCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition whitespace-nowrap ${
                      serviceCategoryFilter === 'all' ? 'text-white shadow-xs' : 'opacity-65 hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: serviceCategoryFilter === 'all' ? accentColor : 'rgba(0,0,0,0.08)',
                      color: serviceCategoryFilter === 'all' ? '#ffffff' : theme.text_color,
                    }}
                  >
                    {t.all} ({services.length})
                  </button>
                  {availableServiceCategories.map((cat) => {
                    const count = services.filter((s) => s.category?.trim().toLowerCase() === cat.toLowerCase()).length;
                    const isActive = serviceCategoryFilter.toLowerCase() === cat.toLowerCase();
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setServiceCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition whitespace-nowrap ${
                          isActive ? 'text-white shadow-xs' : 'opacity-65 hover:opacity-90'
                        }`}
                        style={{
                          backgroundColor: isActive ? accentColor : 'rgba(0,0,0,0.08)',
                          color: isActive ? '#ffffff' : theme.text_color,
                        }}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {services.length === 0 ? (
                <div className={`${sectionBoxBg} backdrop-blur-md border rounded-2xl p-8 text-center shadow-sm`} style={{ borderColor: `${accentColor}33` }}>
                  <Sparkles className="w-7 h-7 mx-auto mb-2 opacity-40" style={{ color: accentColor }} />
                  <p className="text-xs font-semibold opacity-70" style={{ color: theme.text_color }}>
                    {t.noServices}
                  </p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className={`${sectionBoxBg} backdrop-blur-md border rounded-2xl p-8 text-center shadow-sm`} style={{ borderColor: `${accentColor}33` }}>
                  <Sparkles className="w-7 h-7 mx-auto mb-2 opacity-40" style={{ color: accentColor }} />
                  <p className="text-xs font-semibold opacity-70" style={{ color: theme.text_color }}>
                    {t.noCategoryServices}
                  </p>
                </div>
              ) : (
                filteredServices.map((service) => {
                  const targetUrl = service.url
                    ? formatExternalUrl(service.url)
                    : contact?.whatsapp
                    ? `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`
                    : contact?.email
                    ? `mailto:${contact.email}`
                    : null;

                  const isCalendarService =
                    service.title?.toLowerCase().includes('calend') ||
                    service.title?.toLowerCase().includes('rdv') ||
                    service.title?.toLowerCase().includes('booking') ||
                    service.title?.toLowerCase().includes('agenda') ||
                    service.title?.toLowerCase().includes('meet') ||
                    service.category?.toLowerCase().includes('rdv') ||
                    service.category?.toLowerCase().includes('calend');

                  const defaultActionText = isCalendarService
                    ? t.bookCall
                    : service.url
                    ? t.bookService
                    : contact?.whatsapp
                    ? t.contactWhatsapp
                    : t.learnMore;

                  const buttonLabel = service.button_text?.trim() || defaultActionText;

                  return (
                    <div
                      key={service.id}
                      className={`${sectionBoxBg} backdrop-blur-md border rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md text-left relative flex flex-col gap-3 group`}
                      style={{ borderColor: `${accentColor}44` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                          >
                            {isCalendarService ? (
                              <Calendar className="w-5 h-5" />
                            ) : (
                              <Zap className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm leading-tight" style={{ color: theme.text_color }}>
                              {service.title}
                            </h4>
                            {service.category && (
                              <span
                                className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                              >
                                {service.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {service.price && (
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-black shrink-0 border"
                            style={{
                              backgroundColor: `${accentColor}20`,
                              borderColor: `${accentColor}44`,
                              color: accentColor,
                            }}
                          >
                            {service.price}
                          </span>
                        )}
                      </div>

                      {service.subtitle && (
                        <p className="text-xs leading-relaxed opacity-85" style={{ color: theme.text_color }}>
                          {service.subtitle}
                        </p>
                      )}

                      {/* Action Redirection Button */}
                      {targetUrl ? (
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-sm transition-all active:scale-[0.98] hover:opacity-95"
                          style={{ backgroundColor: accentColor }}
                        >
                          {isCalendarService ? (
                            <Calendar className="w-4 h-4" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                          <span>{buttonLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                        </a>
                      ) : (
                        <div
                          className="w-full mt-1 py-2 px-3 rounded-xl font-semibold text-xs text-center border opacity-80"
                          style={{ borderColor: `${accentColor}33`, color: theme.text_color }}
                        >
                          {t.serviceOnDemand}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 3: BOUTIQUE / SHOP */}
          {activeTab === 'shop' && (
            <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
              {/* Title */}
              <div className="flex items-center justify-between px-1 pt-1 text-left">
                <h3 className="text-base font-black tracking-tight" style={{ color: theme.text_color }}>
                  {t.ourProducts}
                </h3>
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
                  {t.all}
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
                  {t.free}
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
                  {t.paid}
                </button>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className={`${sectionBoxBg} backdrop-blur-md border rounded-2xl p-8 text-center shadow-sm`} style={{ borderColor: `${accentColor}33` }}>
                  <BookOpen className="w-7 h-7 mx-auto mb-2 opacity-40" style={{ color: accentColor }} />
                  <p className="text-xs font-semibold opacity-70" style={{ color: theme.text_color }}>
                    {t.noProducts}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.map((prod) => {
                    const CardWrapper = prod.url ? 'a' : 'div';
                    return (
                      <CardWrapper
                        key={prod.id}
                        {...(prod.url ? { href: prod.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className={`${sectionBoxBg} backdrop-blur-md border rounded-2xl overflow-hidden shadow-sm flex flex-col text-left group hover:scale-[1.03] hover:shadow-lg transition-all duration-300 cursor-pointer`}
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
                              {t.access}
                            </span>
                          </div>
                        </div>
                      </CardWrapper>
                    );
                  })}
                </div>
              )}
            </div>
          )}



          {/* QR Code Trigger */}
          <QrCodeModal profile={profile} lang={lang} />

          {/* Branding Watermark (Only visible for free accounts; removed for PRO) */}
          {!isPro && (
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 text-[11px] tracking-wide font-bold opacity-60 hover:opacity-100 transition-all flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: theme.text_color }}
            >
              <LogoIcon size="xs" />
              <span>{t.createdWith}</span>
            </Link>
          )}


        </div>
      </div>
    </ThemeWrapper>
  );
}
