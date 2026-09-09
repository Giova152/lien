'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { ThemeConfig, ButtonStyle, BackgroundType, StatItem, ServiceItem, ShopProduct } from '@/types';
import { THEME_PRESETS } from '@/lib/utils';
import {
  Palette,
  Check,
  Crown,
  Award,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  Zap,
  Upload,
  Loader2,
  Camera,
  Lock,
  BarChart3,
  ChevronRight,
  X,
  ArrowRight,
  Eye,
  EyeOff,
} from '@/components/ui/Icons';
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

const POPULAR_TAG_SUGGESTIONS = [
  'Direction Artistique',
  'Stratégie & Conseil',
  'Développement Web',
  'Design & Branding',
  'E-commerce',
  'Création de Contenu',
  'Marketing Digital',
  'Coaching & Mentorat',
];

export const DEFAULT_KPIS: StatItem[] = [
  { id: 'kpi-1', value: '10+', label: "Ans d'expérience", hidden: false },
  { id: 'kpi-2', value: '500+', label: 'Clients satisfaits', hidden: false },
  { id: 'kpi-3', value: '4.9/5', label: 'Avis certifiés', hidden: false },
  { id: 'kpi-4', value: '100%', label: 'Sur-mesure', hidden: false },
];

const KPI_STARTER_TEMPLATES = [
  { value: '10+', label: "Ans d'expérience" },
  { value: '500+', label: 'Clients satisfaits' },
  { value: '4.9/5', label: 'Avis certifiés' },
  { value: '100%', label: 'Sur-mesure' },
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

  // Helper getters & setters for custom sections (starts with the 4 default KPIs if empty)
  const stats: StatItem[] =
    theme.stats && theme.stats.length > 0 ? theme.stats : DEFAULT_KPIS;
  const tags: string[] = theme.expertise_tags || [];
  const services: ServiceItem[] = theme.services || [];
  const products: ShopProduct[] = theme.products || [];

  const [newTagInput, setNewTagInput] = useState('');

  // Stat Handlers
  const handleUpdateStat = (id: string, field: 'value' | 'label', val: string) => {
    const updated = stats.map((s) => (s.id === id ? { ...s, [field]: val } : s));
    updateField('stats', updated);
  };
  const handleToggleStatVisibility = (id: string) => {
    const updated = stats.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s));
    updateField('stats', updated);
    const target = updated.find((s) => s.id === id);
    if (target?.hidden) {
      toast.info(`Indicateur "${target.label}" masqué du profil.`);
    } else if (target) {
      toast.success(`Indicateur "${target.label}" visible sur le profil.`);
    }
  };
  const handleAddStat = (customValue = '100%', customLabel = 'Nouvel indicateur') => {
    const newStat: StatItem = { id: Date.now().toString(), value: customValue, label: customLabel, hidden: false };
    updateField('stats', [...stats, newStat]);
  };
  const handleDeleteStat = (id: string) => {
    updateField('stats', stats.filter((s) => s.id !== id));
  };
  const handleResetDefaultStats = () => {
    updateField('stats', DEFAULT_KPIS);
    toast.success('Les 4 indicateurs par défaut ont été restaurés !');
  };

  // Tag Handlers
  const handleUpdateTag = (index: number, val: string) => {
    const updated = [...tags];
    updated[index] = val;
    updateField('expertise_tags', updated);
  };
  const handleAddNewTag = (tagToAdd?: string) => {
    const raw = tagToAdd !== undefined ? tagToAdd : newTagInput;
    const clean = raw.replace(/^[✦•\-\*\s]+/, '').trim();
    if (!clean) return;
    if (tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      toast.info('Cette compétence est déjà présente.');
      return;
    }
    updateField('expertise_tags', [...tags, clean]);
    if (tagToAdd === undefined) setNewTagInput('');
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



      {/* Switcher Tab between Style & Custom Content */}
      <div className="flex bg-neutral-100/90 p-1.5 rounded-2xl border border-neutral-200/80 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTabSection('style')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTabSection === 'style'
              ? 'bg-white text-neutral-950 shadow-2xs font-black border border-neutral-200/60'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
          }`}
        >
          <Palette className="w-4 h-4 text-indigo-600" />
          <span>Style Visuel & Thèmes</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTabSection('content')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTabSection === 'content'
              ? 'bg-white text-neutral-950 shadow-2xs font-black border border-neutral-200/60'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Contenus du Profil</span>
          {(stats.length > 0 || tags.length > 0) && (
            <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[9px] font-bold flex items-center justify-center">
              {stats.length + tags.length}
            </span>
          )}
        </button>
      </div>

      {activeTabSection === 'style' ? (
        <>
          {/* Presets Grid (Ultra-Curated Designer Palettes) */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-neutral-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Thèmes & Styles de Marque (1-Clic)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Des ambiances visuelles harmonieuses créées sur-mesure par nos designers.
                </p>
              </div>
              <span className="hidden sm:inline-block text-[10px] text-indigo-600 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
                Harmonie Garantie
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = theme.background_value === preset.theme.background_value && theme.accent_color === preset.theme.accent_color;
                const isPro = preset.name !== 'Ivoire & Or Luxe (Linette - Default)';
                const isLocked = isPro && !profile?.is_pro;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset.name, preset.theme)}
                    className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 relative overflow-hidden group ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/25 shadow-xs'
                        : isLocked
                        ? 'border-neutral-200 hover:border-amber-400 bg-white hover:bg-amber-50/15'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-slate-50/70 shadow-2xs'
                    }`}
                  >
                    {/* Header: Title & Status */}
                    <div className="flex items-center justify-between z-10 gap-2 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-black text-neutral-900 truncate">{preset.name}</span>
                        {isPro && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/80 shrink-0">
                            {isLocked ? <Lock className="w-2.5 h-2.5 text-amber-800" /> : <Crown className="w-2.5 h-2.5 text-amber-800" />}
                            PRO
                          </span>
                        )}
                      </div>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : isLocked ? (
                        <span className="text-[10px] font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition shrink-0">
                          Débloquer ➔
                        </span>
                      ) : null}
                    </div>

                    {/* Realistic Mini-Card Phone Mockup Preview */}
                    <div
                      className="w-full h-20 rounded-xl p-2.5 flex flex-col justify-between border border-black/5 shadow-inner transition-transform group-hover:scale-[1.01]"
                      style={{ background: preset.theme.background_value }}
                    >
                      {/* Mini Avatar & Header */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shadow-xs shrink-0"
                          style={{ background: preset.theme.accent_color, color: '#ffffff' }}
                        >
                          LB
                        </div>
                        <div
                          className="h-2 w-16 rounded-full opacity-60"
                          style={{ background: preset.theme.text_color }}
                        />
                      </div>

                      {/* Mini Buttons Preview */}
                      <div className="flex flex-col gap-1 w-full">
                        <div
                          className="h-4 w-full flex items-center px-2 shadow-2xs"
                          style={{
                            background: preset.theme.button_color,
                            color: preset.theme.button_text_color,
                            borderRadius: preset.theme.button_style === 'rounded-full' ? '9999px' : preset.theme.button_style === 'rounded-none' ? '0px' : '6px',
                            border: `1px solid ${preset.theme.button_border_color || 'transparent'}`,
                          }}
                        >
                          <div className="h-1.5 w-12 rounded-full opacity-60" style={{ background: preset.theme.button_text_color }} />
                        </div>
                        <div
                          className="h-4 w-full flex items-center px-2 opacity-85 shadow-2xs"
                          style={{
                            background: preset.theme.button_color,
                            color: preset.theme.button_text_color,
                            borderRadius: preset.theme.button_style === 'rounded-full' ? '9999px' : preset.theme.button_style === 'rounded-none' ? '0px' : '6px',
                            border: `1px solid ${preset.theme.button_border_color || 'transparent'}`,
                          }}
                        >
                          <div className="h-1.5 w-8 rounded-full opacity-60" style={{ background: preset.theme.button_text_color }} />
                        </div>
                      </div>
                    </div>

                    {/* Footer: Color Swatches & Authentic Font */}
                    <div className="flex items-center justify-between w-full pt-1">
                      <div className="flex items-center gap-1.5">
                        {/* Overlapping Color Dots */}
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-4 h-4 rounded-full ring-2 ring-white shadow-2xs"
                            style={{ backgroundColor: preset.theme.background_value }}
                            title="Couleur de Fond"
                          />
                          <span
                            className="w-4 h-4 rounded-full ring-2 ring-white shadow-2xs"
                            style={{ backgroundColor: preset.theme.button_color }}
                            title="Couleur des Boutons"
                          />
                          <span
                            className="w-4 h-4 rounded-full ring-2 ring-white shadow-2xs"
                            style={{ backgroundColor: preset.theme.accent_color }}
                            title="Accent d'Or / Marque"
                          />
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium ml-1">Palette</span>
                      </div>

                      <span className="text-[11px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {preset.theme.font_family}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arrière-plan */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900">Style d&apos;Arrière-plan</h3>

            <div className="grid grid-cols-3 gap-2">
              {(['color', 'gradient', 'image'] as BackgroundType[]).map((type) => {
                const isImageLock = type === 'image' && !profile?.is_pro;
                const isActive = theme.background_type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      if (isImageLock) {
                        toast.info("L'arrière-plan image personnalisée est réservé aux membres PRO.");
                        openUpgradeModal?.();
                        return;
                      }
                      updateField('background_type', type);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-2xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <span>{type === 'color' ? 'Couleur unie' : type === 'gradient' ? 'Dégradé' : 'Image URL'}</span>
                    {isImageLock && <Lock className="w-3 h-3 text-amber-500" />}
                  </button>
                );
              })}
            </div>

            {theme.background_type === 'color' && (
              <div className="flex flex-col gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Couleur de fond active
                  </label>
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-neutral-300 shadow-2xs">
                      <input
                        type="color"
                        value={theme.background_value || '#FAF8F5'}
                        onChange={(e) => updateField('background_value', e.target.value)}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                      />
                    </div>
                    <input
                      type="text"
                      value={theme.background_value || '#FAF8F5'}
                      onChange={(e) => updateField('background_value', e.target.value)}
                      className="flex-1 bg-transparent text-neutral-900 text-xs font-mono font-bold focus:outline-none uppercase"
                    />
                    <span className="text-[11px] text-neutral-400">Cliquez sur le carré pour changer</span>
                  </div>
                </div>

                {/* Quick curated palettes */}
                <div>
                  <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-2">
                    Teintes recommandées
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { name: 'Ivoire Luxe', value: '#FAF8F5' },
                      { name: 'Blanc Pur', value: '#FFFFFF' },
                      { name: 'Sauge Douce', value: '#EAEFE9' },
                      { name: 'Bleu Nuit', value: '#0F172A' },
                      { name: 'Noir Ébène', value: '#09090B' },
                    ].map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => updateField('background_value', c.value)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                          theme.background_value?.toUpperCase() === c.value.toUpperCase()
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-1 ring-indigo-600/30'
                            : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-neutral-300 shrink-0" style={{ backgroundColor: c.value }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {theme.background_type === 'gradient' && (
              <div className="flex flex-col gap-3 pt-2">
                <label className="block text-xs font-bold text-neutral-700">
                  Dégradés recommandés
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {GRADIENT_PRESETS.map((g) => {
                    const isSelected = theme.background_value === g.value;
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => updateField('background_value', g.value)}
                        className={`h-12 rounded-xl border transition flex items-center justify-center text-xs font-bold relative overflow-hidden group shadow-2xs ${
                          isSelected
                            ? 'ring-2 ring-neutral-900 ring-offset-2 border-transparent scale-[1.02]'
                            : 'border-neutral-200 hover:scale-[1.01]'
                        }`}
                        style={{ background: g.value }}
                      >
                        <span className="relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center px-2">
                          {g.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1">
                  <label className="block text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-1">
                    CSS Gradient personnalisé
                  </label>
                  <input
                    type="text"
                    placeholder="linear-gradient(...)"
                    value={theme.background_value}
                    onChange={(e) => updateField('background_value', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-mono focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            {theme.background_type === 'image' && (
              <div className="flex flex-col gap-3 pt-2">
                <label className="block text-xs font-bold text-neutral-700">
                  Image d'arrière-plan
                </label>

                {theme.background_value && theme.background_value.startsWith('http') ? (
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <img
                      src={theme.background_value}
                      alt="Fond d'écran"
                      className="w-16 h-12 object-cover rounded-lg border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-800 truncate">Image de fond active</p>
                      <p className="text-[10px] text-neutral-400 truncate">{theme.background_value}</p>
                    </div>
                    <label className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 cursor-pointer flex items-center gap-1 transition shadow-2xs">
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
                  <label className="flex flex-col items-center justify-center gap-1.5 w-full px-4 py-6 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-neutral-900 bg-neutral-50/60 hover:bg-neutral-50 text-neutral-600 cursor-pointer transition">
                    {uploadingBg ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
                        <span className="text-xs font-semibold text-neutral-900">Téléversement de l'image...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-2xs">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-neutral-900">Cliquez pour téléverser une image de fond</span>
                        <span className="text-[11px] text-neutral-400">JPG, PNG, WebP (optimisé pour mobile & bureau)</span>
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

                {/* Saisie URL */}
                <div>
                  <label className="block text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-1">
                    Ou renseigner l'URL directe d'une image
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={theme.background_value}
                    onChange={(e) => updateField('background_value', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-800 font-mono text-xs focus:outline-none focus:border-neutral-900 focus:bg-white transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Forme & Style des Boutons */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Forme & Style des Boutons</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Personnalisez la géométrie des boutons de liens de votre page</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BUTTON_STYLES.map((style) => {
                const isSelected = (theme.button_style || 'rounded-xl') === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => updateField('button_style', style.id)}
                    className={`p-3 rounded-xl border transition flex flex-col items-center gap-2.5 text-left relative ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-950 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/60 text-neutral-800'
                    }`}
                  >
                    {/* Mini pill preview */}
                    <div
                      className={`w-full h-7 flex items-center justify-center px-2 text-[10px] font-bold border transition ${
                        isSelected
                          ? 'border-neutral-700 bg-white/10 text-white'
                          : 'border-neutral-300 bg-white text-neutral-700 shadow-2xs'
                      }`}
                      style={{
                        borderRadius:
                          style.id === 'rounded-full'
                            ? '9999px'
                            : style.id === 'rounded-none'
                            ? '0px'
                            : style.id === 'rounded-md'
                            ? '6px'
                            : style.id === 'rounded-xl'
                            ? '12px'
                            : '10px',
                        backdropFilter: style.id === 'glass' ? 'blur(8px)' : undefined,
                        borderStyle: style.id === 'outline' ? 'dashed' : 'solid',
                      }}
                    >
                      Bouton
                    </div>
                    <span className="text-[11px] font-semibold text-center leading-tight">
                      {style.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Couleurs personnalisées des boutons */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="block text-xs font-bold text-neutral-700 mb-2.5">
                Couleurs personnalisées des boutons
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Couleur de fond du bouton */}
                <div>
                  <label className="block text-[11px] text-neutral-500 font-medium mb-1">
                    Fond du bouton
                  </label>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-neutral-300 shadow-2xs">
                      <input
                        type="color"
                        value={theme.button_color || '#EDE8DE'}
                        onChange={(e) => updateField('button_color', e.target.value)}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                      />
                    </div>
                    <input
                      type="text"
                      value={theme.button_color || '#EDE8DE'}
                      onChange={(e) => updateField('button_color', e.target.value)}
                      className="flex-1 bg-transparent text-neutral-900 text-xs font-mono font-bold focus:outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Couleur du texte du bouton */}
                <div>
                  <label className="block text-[11px] text-neutral-500 font-medium mb-1">
                    Texte du bouton
                  </label>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-neutral-300 shadow-2xs">
                      <input
                        type="color"
                        value={theme.button_text_color || '#1C1A17'}
                        onChange={(e) => updateField('button_text_color', e.target.value)}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                      />
                    </div>
                    <input
                      type="text"
                      value={theme.button_text_color || '#1C1A17'}
                      onChange={(e) => updateField('button_text_color', e.target.value)}
                      className="flex-1 bg-transparent text-neutral-900 text-xs font-mono font-bold focus:outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Bordure du bouton */}
                <div>
                  <label className="block text-[11px] text-neutral-500 font-medium mb-1">
                    Bordure du bouton
                  </label>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-neutral-300 shadow-2xs">
                      <input
                        type="color"
                        value={theme.button_border_color?.startsWith('#') ? theme.button_border_color : '#E5E7EB'}
                        onChange={(e) => updateField('button_border_color', e.target.value)}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                      />
                    </div>
                    <input
                      type="text"
                      value={theme.button_border_color || 'rgba(0,0,0,0.1)'}
                      onChange={(e) => updateField('button_border_color', e.target.value)}
                      className="flex-1 bg-transparent text-neutral-900 text-xs font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typographie & Couleurs de Texte */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Typographie & Teintes de Texte</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Police de caractères et harmonisation des contrastes</p>
            </div>

            {/* Quick font chips */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">
                Style typographique (Google Fonts)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { id: 'Playfair Display', label: 'Playfair Display', mood: 'Élégant & Haute Couture' },
                  { id: 'Space Grotesk', label: 'Space Grotesk', mood: 'Moderne & Tech' },
                  { id: 'Outfit', label: 'Outfit', mood: 'Chic & Épuré' },
                  { id: 'Inter', label: 'Inter', mood: 'Minimal & Neutre' },
                ].map((f) => {
                  const isSelected = theme.font_family === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => updateField('font_family', f.id)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-950 text-white shadow-xs'
                          : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <span className="text-sm font-bold truncate block mb-1" style={{ fontFamily: f.id }}>
                        Aa {f.label.split(' ')[0]}
                      </span>
                      <span className={`text-[10px] font-medium leading-tight ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {f.mood}
                      </span>
                    </button>
                  );
                })}
              </div>

              <select
                value={theme.font_family}
                onChange={(e) => updateField('font_family', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-medium focus:outline-none focus:border-neutral-900 focus:bg-white transition"
              >
                {FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Text & Accent colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Couleur du texte principal
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-neutral-300 shadow-2xs">
                    <input
                      type="color"
                      value={theme.text_color || '#09090b'}
                      onChange={(e) => updateField('text_color', e.target.value)}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={theme.text_color || '#09090b'}
                    onChange={(e) => updateField('text_color', e.target.value)}
                    className="flex-1 bg-transparent text-neutral-900 text-xs font-mono font-bold focus:outline-none uppercase"
                  />
                  <span className="text-[11px] text-neutral-400">Titres & bio</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Couleur d'accentuation
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-neutral-300 shadow-2xs">
                    <input
                      type="color"
                      value={theme.accent_color || '#6366f1'}
                      onChange={(e) => updateField('accent_color', e.target.value)}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                    />
                  </div>
                  <input
                    type="text"
                    value={theme.accent_color || '#6366f1'}
                    onChange={(e) => updateField('accent_color', e.target.value)}
                    className="flex-1 bg-transparent text-neutral-900 text-xs font-mono font-bold focus:outline-none uppercase"
                  />
                  <span className="text-[11px] text-neutral-400">vCard, QR & icônes</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* CONTENT EDITORS (STATS, TAGS, SERVICES, SHOP) */
        <div className="flex flex-col gap-5">
          {/* 1. Éditeur des Stats KPI */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-2xs">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Statistiques Clés (KPI)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                    Onglet Profil
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Modifiez vos chiffres d'impact et masquez ceux que vous ne souhaitez pas faire apparaître sur votre profil.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetDefaultStats}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-medium transition cursor-pointer"
                  title="Restaurer les 4 indicateurs par défaut"
                >
                  Restaurer les 4
                </button>
                <button
                  type="button"
                  onClick={() => handleAddStat()}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un KPI</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {stats.map((s, idx) => {
                const isHidden = Boolean(s.hidden);
                return (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center gap-3 ${
                      isHidden
                        ? 'bg-neutral-100/50 border-neutral-200 opacity-60'
                        : 'bg-neutral-50/80 border-neutral-200/90 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white border border-neutral-200 text-neutral-600 text-[11px] font-bold flex items-center justify-center shadow-2xs shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="sm:hidden text-xs font-semibold text-neutral-400">KPI #{idx + 1}</span>

                      {/* Mobile visibility toggle button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatVisibility(s.id)}
                        className={`sm:hidden px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                          isHidden
                            ? 'bg-neutral-200 border-neutral-300 text-neutral-600'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {isHidden ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Masqué</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Visible</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 flex-1">
                      {/* Chiffre */}
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
                          Valeur / Chiffre
                        </label>
                        <input
                          type="text"
                          value={s.value}
                          onChange={(e) => handleUpdateStat(s.id, 'value', e.target.value)}
                          placeholder="Ex: 10+, 500+, 98%"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-black text-neutral-900 focus:outline-none focus:border-neutral-900 shadow-2xs"
                        />
                      </div>

                      {/* Intitulé */}
                      <div className="sm:col-span-8">
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">
                          Intitulé de l'indicateur
                        </label>
                        <input
                          type="text"
                          value={s.label}
                          onChange={(e) => handleUpdateStat(s.id, 'label', e.target.value)}
                          placeholder="Ex: Ans d'expérience, Clients satisfaits"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Desktop visibility toggle button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatVisibility(s.id)}
                        className={`hidden sm:flex px-3 py-2 rounded-xl border text-xs font-bold items-center gap-1.5 transition cursor-pointer ${
                          isHidden
                            ? 'bg-neutral-200/70 hover:bg-neutral-200 border-neutral-300 text-neutral-600'
                            : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                        }`}
                        title={isHidden ? "Cliquer pour afficher sur votre profil public" : "Cliquer pour masquer de votre profil public"}
                      >
                        {isHidden ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Masqué</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Visible</span>
                          </>
                        )}
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteStat(s.id)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 cursor-pointer"
                        title="Supprimer cet indicateur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Éditeur des Domaines d'Expertise */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shadow-2xs">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Domaines d'expertise & Puces
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                    Onglet Profil
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Mots-clés qui caractérisent vos savoir-faire (affichés sous forme de badges raffinés).
                </p>
              </div>

              {tags.length > 0 && (
                <span className="text-xs text-neutral-400 font-medium">
                  {tags.length} compétence{tags.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Tags Container */}
            <div className="flex flex-wrap gap-2 min-h-[42px] items-center">
              {tags.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-1">
                  Aucun domaine d'expertise configuré. Choisissez parmi nos suggestions ci-dessous ou ajoutez le vôtre :
                </p>
              ) : (
                tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs group hover:border-neutral-300 transition"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: theme.accent_color || '#4F46E5' }}
                    />
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(idx)}
                      className="text-neutral-400 hover:text-rose-600 transition p-0.5"
                      title="Supprimer ce tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add tag input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewTag();
                  }
                }}
                placeholder="Ajouter une compétence... (ex: Direction Artistique)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white shadow-2xs transition"
              />
              <button
                type="button"
                onClick={() => handleAddNewTag()}
                disabled={!newTagInput.trim()}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-xs font-semibold transition flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            {/* Popular suggestions */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="block text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-2">
                Suggestions en 1-clic
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).slice(0, 6).map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddNewTag(suggested)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-600 hover:text-neutral-900 transition"
                  >
                    <Plus className="w-3 h-3 text-neutral-400" />
                    <span>{suggested}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Raccourcis clairs vers Services & Boutique */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <Link
              href="/dashboard/services"
              className="p-5 rounded-2xl sm:rounded-3xl bg-white hover:bg-neutral-50/70 border border-neutral-200/80 hover:border-neutral-900 transition-all group shadow-2xs flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-105 transition">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                  {services.length > 0 ? `${services.length} actif${services.length > 1 ? 's' : ''}` : 'Onglet Services'}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900 group-hover:text-indigo-600 transition">
                    Services & Prestations
                  </h4>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition" />
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Gérez vos offres payantes, vos consultations et liens de réservation Calendly ou Cal.com.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/shop"
              className="p-5 rounded-2xl sm:rounded-3xl bg-white hover:bg-neutral-50/70 border border-neutral-200/80 hover:border-neutral-900 transition-all group shadow-2xs flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs group-hover:scale-105 transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                  {products.length > 0 ? `${products.length} produit${products.length > 1 ? 's' : ''}` : 'Onglet Boutique'}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900 group-hover:text-amber-600 transition">
                    Boutique & Produits Digitaux
                  </h4>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-amber-600 transition" />
                </div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Vendez vos e-books, templates, guides PDF et ressources en téléchargement direct.
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full py-3.5 px-6 bg-neutral-950 hover:bg-neutral-900 active:scale-[0.99] text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition disabled:opacity-50 text-sm"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Enregistrement en cours...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Sauvegarder toutes les modifications</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
