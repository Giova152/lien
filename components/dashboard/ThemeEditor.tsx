'use client';

import React, { useState, useContext } from 'react';
import { ThemeConfig, ButtonStyle, BackgroundType, StatItem, ServiceItem, ShopProduct } from '@/types';
import { THEME_PRESETS } from '@/lib/utils';
import { Palette, Check, Sparkles, Plus, Trash2, BookOpen, Layers } from '@/components/ui/Icons';
import { DashboardContext } from '@/lib/context/DashboardContext';

interface ThemeEditorProps {
  theme: ThemeConfig;
  onChange: (updatedTheme: ThemeConfig) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const BUTTON_STYLES: { id: ButtonStyle; label: string }[] = [
  { id: 'rounded-xl', label: 'Arrondi (Moderne)' },
  { id: 'rounded-full', label: 'Pilule (Rond)' },
  { id: 'rounded-md', label: 'Carré doux' },
  { id: 'rounded-none', label: 'Carré droit' },
  { id: 'glass', label: 'Effet Verre (Glass)' },
  { id: 'outline', label: 'Contours (Outline)' },
];

const FONTS = [
  'Inter',
  'Outfit',
  'Roboto',
  'Playfair Display',
  'Space Grotesk',
  'Plus Jakarta Sans',
];

const GRADIENT_PRESETS = [
  { name: 'Cosmic Dark', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)' },
  { name: 'Ocean Sunset', value: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 50%, #db2777 100%)' },
  { name: 'Emerald Deep', value: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' },
  { name: 'Midnight Purple', value: 'linear-gradient(135deg, #2e1065 0%, #09090b 100%)' },
  { name: 'Warm Amber', value: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)' },
];

export function ThemeEditor({ theme, onChange, onSave, saving }: ThemeEditorProps) {
  const { profile } = useContext(DashboardContext);
  const [activeTabSection, setActiveTabSection] = useState<'style' | 'content'>('style');

  const updateField = <K extends keyof ThemeConfig>(field: K, value: ThemeConfig[K]) => {
    onChange({ ...theme, [field]: value });
  };

  const applyPreset = (presetTheme: ThemeConfig) => {
    onChange(presetTheme);
  };

  // Helper getters & setters for custom luxury sections
  const stats: StatItem[] = theme.stats || [
    { id: '1', value: '12+', label: "Ans d'expérience" },
    { id: '2', value: '2k+', label: 'Clients satisfaits' },
    { id: '3', value: '9', label: 'Programmes' },
  ];

  const tags: string[] = theme.expertise_tags || [
    'SOINS NATURELS',
    'BIEN-ÊTRE FÉMININ',
    'COACHING',
    'FORMATION & EBOOKS',
    'ENTREPRENEURIAT',
  ];

  const services: ServiceItem[] = theme.services || [
    { id: '1', title: 'RÉSERVER UN RDV GRATUIT', category: 'RDV', subtitle: 'Appel découverte (30 min) · Gratuit · Confidentiel', price: 'Gratuit' },
    { id: '2', title: 'COACHING INDIVIDUEL', category: 'Coaching', subtitle: 'Accompagnement personnalisé & Sessions privées (1h)', price: 'Sur devis' },
  ];

  const products: ShopProduct[] = theme.products || [
    { id: '1', title: 'Soins de pieds', type: 'free', price: 'Gratuit', image_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=500&auto=format&fit=crop&q=60' },
    { id: '2', title: '5 étapes pour ouvrir une garderie rentable', type: 'paid', price: '10 $', image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60' },
  ];

  // Stat Handlers
  const handleUpdateStat = (id: string, field: 'value' | 'label', val: string) => {
    const updated = stats.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    updateField('stats', updated);
  };
  const handleAddStat = () => {
    const newStat: StatItem = { id: Date.now().toString(), value: '100+', label: 'Nouveau KPI' };
    updateField('stats', [...stats, newStat]);
  };
  const handleDeleteStat = (id: string) => {
    updateField('stats', stats.filter((s) => s.id !== id));
  };

  // Tag Handlers
  const handleUpdateTag = (index: number, val: string) => {
    const updated = [...tags];
    updated[index] = val;
    updateField('expertise_tags', updated);
  };
  const handleAddTag = () => {
    updateField('expertise_tags', [...tags, 'NOUVELLE EXPERTISE']);
  };
  const handleDeleteTag = (index: number) => {
    updateField('expertise_tags', tags.filter((_, idx) => idx !== index));
  };

  // Service Handlers
  const handleUpdateService = (id: string, field: keyof ServiceItem, val: string) => {
    const updated = services.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    updateField('services', updated);
  };
  const handleAddService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      title: 'NOUVEAU SERVICE',
      category: 'SERVICE',
      subtitle: 'Description de la prestation',
      price: 'Sur devis',
    };
    updateField('services', [...services, newService]);
  };
  const handleDeleteService = (id: string) => {
    updateField('services', services.filter((s) => s.id !== id));
  };

  // Product Handlers
  const handleUpdateProduct = (id: string, field: keyof ShopProduct, val: any) => {
    const updated = products.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    updateField('products', updated);
  };
  const handleAddProduct = () => {
    const newProd: ShopProduct = {
      id: Date.now().toString(),
      title: 'NOUVEAU E-BOOK',
      price: 'Gratuit',
      type: 'free',
    };
    updateField('products', [...products, newProd]);
  };
  const handleDeleteProduct = (id: string) => {
    updateField('products', products.filter((p) => p.id !== id));
  };

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Palette className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>Thème & Contenu de la Carte</span>
        </h2>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
          Personnalisez les couleurs, la typographie et les contenus de vos 3 onglets (Profil, Services, Shop)
        </p>
      </div>

      {/* Lifetime PRO Promotion Banner */}
      {!profile?.is_pro && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 fill-neutral-950" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-amber-700 uppercase tracking-wider">OFFRE PROMO À VIE – 186 $</h4>
                <span className="text-[10px] text-neutral-400 line-through font-semibold">350 $</span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 text-[9px] font-black uppercase">PROMO</span>
              </div>
              <p className="text-[11px] text-neutral-700 font-medium">
                Économisez dès aujourd'hui ! Débloquez tous les thèmes de luxe, l'onglet E-books, Services & Analytics pour toujours.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const upgradeBtn = document.querySelector('button:has-text("PRO")') as HTMLButtonElement;
              if (upgradeBtn) upgradeBtn.click();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider shrink-0 transition hover:scale-105 shadow-md"
          >
            Offre Promo (186$)
          </button>
        </div>
      )}

      {/* Switcher Tab between Style & Custom Content */}
      <div className="flex bg-slate-100 border border-neutral-200 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTabSection('style')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTabSection === 'style' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 hover:text-neutral-900 font-semibold'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Style Visuel (Couleurs & Font)</span>
        </button>
        <button
          onClick={() => setActiveTabSection('content')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTabSection === 'content' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 hover:text-neutral-900 font-semibold'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Éditeur de Contenu (Stats, Services, Shop)</span>
        </button>
      </div>

      {activeTabSection === 'style' ? (
        <>
          {/* Presets Grid (Ultra-Curated Designer Palettes) */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Thèmes & Palettes de Couleur Pro (1-Clic)
              </h3>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Harmonie Garantie</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_PRESETS.map((preset) => {
                const isSelected = theme.background_value === preset.theme.background_value && theme.accent_color === preset.theme.accent_color;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.theme)}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 relative overflow-hidden group shadow-xs ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Header: Title & Active Indicator */}
                    <div className="flex items-center justify-between z-10">
                      <span className="text-xs font-bold text-neutral-900 truncate">{preset.name}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Color Swatch Preview Bar */}
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100/80 border border-neutral-200 z-10">
                      <div className="w-6 h-6 rounded-lg border border-neutral-300 shadow-inner flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: preset.theme.background_value, color: preset.theme.text_color }} title="Fond">
                        B
                      </div>
                      <div className="w-6 h-6 rounded-lg border border-neutral-300 shadow-inner flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: preset.theme.button_color, color: preset.theme.button_text_color }} title="Bouton">
                        C
                      </div>
                      <div className="w-6 h-6 rounded-lg border border-neutral-300 shadow-inner flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: preset.theme.accent_color, color: '#ffffff' }} title="Accent">
                        A
                      </div>
                      <div className="flex-1 text-right text-[10px] font-mono font-semibold text-neutral-500">
                        {preset.theme.font_family}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arrière-plan */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900">Style d'Arrière-plan</h3>

            <div className="grid grid-cols-3 gap-2">
              {(['color', 'gradient', 'image'] as BackgroundType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => updateField('background_type', type)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                    theme.background_type === type
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-50 border-neutral-200 text-neutral-700 hover:bg-slate-100'
                  }`}
                >
                  {type === 'color' ? 'Couleur unie' : type === 'gradient' ? 'Dégradé' : 'Image URL'}
                </button>
              ))}
            </div>

            {theme.background_type === 'color' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Couleur de fond
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.background_value || '#ffffff'}
                    onChange={(e) => updateField('background_value', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={theme.background_value || '#ffffff'}
                    onChange={(e) => updateField('background_value', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {theme.background_type === 'gradient' && (
              <div className="flex flex-col gap-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Dégradés recommandés
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map((g) => (
                    <button
                      key={g.name}
                      onClick={() => updateField('background_value', g.value)}
                      className="h-10 rounded-xl border border-neutral-300 text-white flex items-center justify-center text-xs font-bold shadow-xs"
                      style={{ background: g.value }}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="linear-gradient(...)"
                  value={theme.background_value}
                  onChange={(e) => updateField('background_value', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-xs font-mono mt-1"
                />
              </div>
            )}

            {theme.background_type === 'image' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  URL de l'image de fond
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={theme.background_value}
                  onChange={(e) => updateField('background_value', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm"
                />
              </div>
            )}
          </div>

          {/* Typographie & Style de Boutons */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900">Typographie & Accentuation</h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Police de caractères (Font)
              </label>
              <select
                value={theme.font_family}
                onChange={(e) => updateField('font_family', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm focus:outline-none focus:border-indigo-600"
              >
                {FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Couleur du texte principal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.text_color || '#09090b'}
                    onChange={(e) => updateField('text_color', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={theme.text_color || '#09090b'}
                    onChange={(e) => updateField('text_color', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Couleur d'accentuation (Boutons VCard & QR)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.accent_color || '#6366f1'}
                    onChange={(e) => updateField('accent_color', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={theme.accent_color || '#6366f1'}
                    onChange={(e) => updateField('accent_color', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* CONTENT EDITORS (STATS, TAGS, SERVICES, SHOP) */
        <div className="flex flex-col gap-6">
          {/* 1. Éditeur des Stats KPI */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Statistiques KPI (Onglet PROFIL)
              </h3>
              <button
                onClick={handleAddStat}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un KPI</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {stats.map((s) => (
                <div key={s.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-neutral-200">
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleUpdateStat(s.id, 'value', e.target.value)}
                    placeholder="Ex: 12+"
                    className="w-24 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-amber-700 font-black"
                  />
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) => handleUpdateStat(s.id, 'label', e.target.value)}
                    placeholder="Ex: Ans d'expérience"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-900 font-bold"
                  />
                  <button
                    onClick={() => handleDeleteStat(s.id)}
                    className="p-2 text-neutral-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Éditeur des Domaines d'Expertise */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">
                Domaines d'expertise / Puces (Onglet PROFIL)
              </h3>
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((t, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-slate-50 border border-neutral-300 rounded-xl px-2 py-1">
                  <input
                    type="text"
                    value={t}
                    onChange={(e) => handleUpdateTag(idx, e.target.value)}
                    className="bg-transparent text-xs text-amber-800 font-bold focus:outline-none w-36"
                  />
                  <button onClick={() => handleDeleteTag(idx)} className="text-neutral-400 hover:text-rose-600 p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Éditeur des Services */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">
                Services & Prestations (Onglet SERVICES)
              </h3>
              <button
                onClick={handleAddService}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un service</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {services.map((srv) => (
                <div key={srv.id} className="p-3.5 rounded-xl bg-slate-50 border border-neutral-200 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={srv.title}
                      onChange={(e) => handleUpdateService(srv.id, 'title', e.target.value)}
                      placeholder="Titre du service (ex: RÉSERVER UN RDV)"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-900 font-bold"
                    />
                    <input
                      type="text"
                      value={srv.price || ''}
                      onChange={(e) => handleUpdateService(srv.id, 'price', e.target.value)}
                      placeholder="Prix (ex: Gratuit)"
                      className="w-28 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-amber-700 font-extrabold"
                    />
                    <button onClick={() => handleDeleteService(srv.id)} className="p-1.5 text-neutral-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={srv.subtitle || ''}
                    onChange={(e) => handleUpdateService(srv.id, 'subtitle', e.target.value)}
                    placeholder="Description / Sous-titre"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-700"
                  />
                  <input
                    type="url"
                    value={srv.url || ''}
                    onChange={(e) => handleUpdateService(srv.id, 'url', e.target.value)}
                    placeholder="Lien de réservation / Calendly / WhatsApp (ex: https://...)"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-indigo-700 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Éditeur du Shop / E-books */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Produits Digitaux / E-books (Onglet SHOP)
              </h3>
              <button
                onClick={handleAddProduct}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un produit</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {products.map((prod) => (
                <div key={prod.id} className="p-3.5 rounded-xl bg-slate-50 border border-neutral-200 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={prod.title}
                      onChange={(e) => handleUpdateProduct(prod.id, 'title', e.target.value)}
                      placeholder="Nom du produit / E-book"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-900 font-bold"
                    />
                    <select
                      value={prod.type}
                      onChange={(e) => handleUpdateProduct(prod.id, 'type', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-800 font-bold"
                    >
                      <option value="free">Gratuit</option>
                      <option value="paid">Payant</option>
                    </select>
                    <input
                      type="text"
                      value={prod.price}
                      onChange={(e) => handleUpdateProduct(prod.id, 'price', e.target.value)}
                      placeholder="Prix (ex: 10 $)"
                      className="w-24 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-emerald-700 font-extrabold"
                    />
                    <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 text-neutral-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="url"
                    value={prod.image_url || ''}
                    onChange={(e) => handleUpdateProduct(prod.id, 'image_url', e.target.value)}
                    placeholder="📷 URL de l'image de couverture (ex: https://images.unsplash.com/...)"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-700 font-mono"
                  />
                  <input
                    type="url"
                    value={prod.url || ''}
                    onChange={(e) => handleUpdateProduct(prod.id, 'url', e.target.value)}
                    placeholder="🔗 Lien de redirection au clic / Achat / Téléchargement (ex: https://...)"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-indigo-700 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 mt-2 text-sm"
      >
        <Check className="w-5 h-5" />
        {saving ? 'Enregistrement en cours...' : 'Sauvegarder toutes les modifications'}
      </button>
    </div>
  );
}
