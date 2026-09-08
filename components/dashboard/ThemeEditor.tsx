'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { ThemeConfig, ButtonStyle, BackgroundType, StatItem, ServiceItem, ShopProduct } from '@/types';
import { THEME_PRESETS } from '@/lib/utils';
import { Palette, Check, Sparkles, Plus, Trash2, BookOpen, Layers, Zap, Upload, Loader2, Camera, Lock } from '@/components/ui/Icons';
import { DashboardContext } from '@/lib/context/DashboardContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

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
  'Arial',
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
  const { profile, openUpgradeModal } = useContext(DashboardContext);
  const supabase = createClient();
  const [uploadingBg, setUploadingBg] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'style' | 'content'>('style');

  const updateField = <K extends keyof ThemeConfig>(field: K, value: ThemeConfig[K]) => {
    onChange({ ...theme, [field]: value });
  };

  const handleUploadBg = async (file: File) => {
    if (!profile) return;
    if (!profile.is_pro) {
      toast.info("L'arrière-plan en image personnalisée est réservé aux membres PRO.");
      openUpgradeModal?.();
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez choisir un fichier image (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    try {
      setUploadingBg(true);
      const fileExt = file.name.split('.').pop() || 'webp';
      const fileName = `${profile.id}-bg-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

      updateField('background_value', publicUrlData.publicUrl);
      toast.success('Image de fond importée avec succès !');
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'importation de l'image");
    } finally {
      setUploadingBg(false);
    }
  };

  const applyPreset = (presetName: string, presetTheme: ThemeConfig) => {
    const isProPreset = presetName !== 'Ivoire & Or Luxe (Linette - Default)';
    if (isProPreset && !profile?.is_pro) {
      toast.info(`Le thème "${presetName}" est réservé aux membres PRO.`);
      openUpgradeModal?.();
      return;
    }
    onChange(presetTheme);
  };

  // Helper getters & setters for custom sections (starts empty for new users)
  const stats: StatItem[] = theme.stats || [];
  const tags: string[] = theme.expertise_tags || [];
  const services: ServiceItem[] = theme.services || [];
  const products: ShopProduct[] = theme.products || [];

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

      {/* Two Clean PRO Offers Banner */}
      {!profile?.is_pro && (
        <div className="bg-neutral-950 text-white border border-neutral-800 rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start sm:items-center gap-3.5 z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 fill-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Passez en PRO</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-semibold">2 formules au choix</span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5 font-medium leading-relaxed">
                Débloquez tous les thèmes de luxe, les onglets Services & E-books, et vos statistiques détaillées.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 z-10">
            {/* Offre 1 : Abonnement */}
            <button
              type="button"
              onClick={() => openUpgradeModal?.()}
              className="flex-1 md:flex-initial px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Abonnement</span>
              <span className="text-amber-400 font-black">35 $/m</span>
            </button>

            {/* Offre 2 : À Vie */}
            <button
              type="button"
              onClick={() => openUpgradeModal?.()}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 text-neutral-950 text-xs font-black uppercase tracking-wider transition hover:scale-[1.02] shadow-sm flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
              <span>À Vie (500 $)</span>
            </button>
          </div>
        </div>
      )}

      {/* Switcher Tab between Style & Custom Content */}
      <div className="flex bg-slate-100 border border-neutral-200 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTabSection('style')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-center ${
            activeTabSection === 'style' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 hover:text-neutral-900 font-semibold'
          }`}
        >
          <Palette className="w-4 h-4 shrink-0" />
          <span>Style Visuel</span>
          <span className="hidden sm:inline">(Couleurs & Font)</span>
        </button>
        <button
          onClick={() => setActiveTabSection('content')}
          className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-center ${
            activeTabSection === 'content' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 hover:text-neutral-900 font-semibold'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Contenus</span>
          <span className="hidden sm:inline">(Services & Shop)</span>
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
                const isPro = preset.name !== 'Ivoire & Or Luxe (Linette - Default)';
                const isLocked = isPro && !profile?.is_pro;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset.name, preset.theme)}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 relative overflow-hidden group shadow-xs ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                        : isLocked
                        ? 'border-neutral-200 hover:border-amber-400 bg-white hover:bg-amber-50/20'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Header: Title & Active Indicator / PRO Lock */}
                    <div className="flex items-center justify-between z-10 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-neutral-900 truncate">{preset.name}</span>
                        {isPro && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 shrink-0">
                            {isLocked ? <Lock className="w-2.5 h-2.5 text-amber-800" /> : <Sparkles className="w-2.5 h-2.5 text-amber-800" />}
                            PRO
                          </span>
                        )}
                      </div>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : isLocked ? (
                        <span className="text-[10px] font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition shrink-0">
                          Débloquer ➔
                        </span>
                      ) : null}
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
              {(['color', 'gradient', 'image'] as BackgroundType[]).map((type) => {
                const isImageLock = type === 'image' && !profile?.is_pro;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      if (isImageLock) {
                        toast.info("L'arrière-plan image personnalisée est réservé aux membres PRO.");
                        openUpgradeModal?.();
                        return;
                      }
                      updateField('background_type', type);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition flex items-center justify-center gap-1.5 ${
                      theme.background_type === type
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-50 border-neutral-200 text-neutral-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{type === 'color' ? 'Couleur unie' : type === 'gradient' ? 'Dégradé' : 'Image URL'}</span>
                    {isImageLock && <Lock className="w-3 h-3 text-amber-500" />}
                  </button>
                );
              })}
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
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Image de fond d'écran
                </label>

                {theme.background_value && theme.background_value.startsWith('http') ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-neutral-200 rounded-xl">
                    <img
                      src={theme.background_value}
                      alt="Fond d'écran"
                      className="w-16 h-12 object-cover rounded-lg border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-800 truncate">Image de fond active</p>
                      <p className="text-[10px] text-neutral-400 truncate">{theme.background_value}</p>
                    </div>
                    <label className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 cursor-pointer flex items-center gap-1 transition">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Changer</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingBg}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadBg(file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/20 text-neutral-600 hover:text-indigo-600 cursor-pointer transition">
                    {uploadingBg ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span className="text-xs font-semibold text-indigo-600">Importation de l'image en cours...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-neutral-400" />
                        <span className="text-xs font-bold">Cliquer pour importer une image de fond</span>
                        <span className="text-[10px] text-neutral-400">(JPG, PNG, WebP)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingBg}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadBg(file);
                      }}
                    />
                  </label>
                )}

                {/* Optionnel : Saisie URL manuelle */}
                <input
                  type="url"
                  placeholder="Ou coller une URL d'image (ex: https://images.unsplash.com/...)"
                  value={theme.background_value}
                  onChange={(e) => updateField('background_value', e.target.value)}
                  className="w-full px-3.5 py-1.5 rounded-lg bg-slate-50 border border-neutral-200 text-neutral-700 font-mono text-[11px]"
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
              {stats.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-1">Aucun indicateur clé configuré (optionnel).</p>
              ) : (
                stats.map((s) => (
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
                ))
              )}
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
              {tags.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-1">Aucun domaine d'expertise configuré (optionnel).</p>
              ) : (
                tags.map((t, idx) => (
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
                ))
              )}
            </div>
          </div>

          {/* Raccourcis clairs vers Services & Boutique */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/dashboard/services"
              className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-100/70 flex items-center justify-between transition group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-neutral-900">Services & Prestations</span>
                  <span className="text-[11px] text-indigo-700 font-medium">Gérer mes offres et RDV →</span>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/shop"
              className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 hover:bg-amber-100/70 flex items-center justify-between transition group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-neutral-900">Boutique & E-books</span>
                  <span className="text-[11px] text-amber-800 font-medium">Gérer mes produits digitaux →</span>
                </div>
              </div>
            </Link>
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
