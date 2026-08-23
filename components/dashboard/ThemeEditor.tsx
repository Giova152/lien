'use client';

import React from 'react';
import { ThemeConfig, ButtonStyle, BackgroundType } from '@/types';
import { THEME_PRESETS } from '@/lib/utils';
import { Palette, Check, Sparkles } from '@/components/ui/Icons';

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
  const updateField = <K extends keyof ThemeConfig>(field: K, value: ThemeConfig[K]) => {
    onChange({ ...theme, [field]: value });
  };

  const applyPreset = (presetTheme: ThemeConfig) => {
    onChange(presetTheme);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-white">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-400" />
          Personnalisation du Thème
        </h2>
        <p className="text-xs text-neutral-400">
          Choisissez l'apparence visuelle de votre page publique
        </p>
      </div>

      {/* Presets Grid */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Thèmes Prédéfinis
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.theme)}
              className="p-3 rounded-xl border border-neutral-800 hover:border-indigo-500 transition text-left flex flex-col gap-2 relative overflow-hidden group"
              style={{
                background:
                  preset.theme.background_type === 'gradient'
                    ? preset.theme.background_value
                    : preset.theme.background_value,
              }}
            >
              <div
                className="h-8 rounded-lg w-full border border-white/20"
                style={{ backgroundColor: preset.theme.button_color }}
              />
              <span
                className="text-xs font-semibold truncate"
                style={{ color: preset.theme.text_color }}
              >
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Arrière-plan */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-neutral-300">Style d'Arrière-plan</h3>

        <div className="grid grid-cols-3 gap-2">
          {(['color', 'gradient', 'image'] as BackgroundType[]).map((type) => (
            <button
              key={type}
              onClick={() => updateField('background_type', type)}
              className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition ${
                theme.background_type === type
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              {type === 'color' ? 'Couleur unie' : type === 'gradient' ? 'Dégradé' : 'Image URL'}
            </button>
          ))}
        </div>

        {theme.background_type === 'color' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Couleur de fond
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.background_value || '#0f172a'}
                onChange={(e) => updateField('background_value', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={theme.background_value || '#0f172a'}
                onChange={(e) => updateField('background_value', e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm font-mono"
              />
            </div>
          </div>
        )}

        {theme.background_type === 'gradient' && (
          <div className="flex flex-col gap-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Dégradés recommandés
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GRADIENT_PRESETS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => updateField('background_value', g.value)}
                  className="h-10 rounded-xl border border-white/20 flex items-center justify-center text-xs font-medium shadow"
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
              className="w-full px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-mono mt-1"
            />
          </div>
        )}

        {theme.background_type === 'image' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              URL de l'image de fond
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={theme.background_value}
              onChange={(e) => updateField('background_value', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm"
            />
          </div>
        )}
      </div>

      {/* Style des Boutons */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-neutral-300">Style des Boutons</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUTTON_STYLES.map((st) => (
            <button
              key={st.id}
              onClick={() => updateField('button_style', st.id)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition ${
                theme.button_style === st.id
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Couleur du bouton
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.button_color.startsWith('#') ? theme.button_color : '#ffffff'}
                onChange={(e) => updateField('button_color', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={theme.button_color}
                onChange={(e) => updateField('button_color', e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Couleur du texte des boutons
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.button_text_color.startsWith('#') ? theme.button_text_color : '#ffffff'}
                onChange={(e) => updateField('button_text_color', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={theme.button_text_color}
                onChange={(e) => updateField('button_text_color', e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typographie & Couleurs */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-neutral-300">Typographie & Accentuation</h3>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Police de caractères (Font)
          </label>
          <select
            value={theme.font_family}
            onChange={(e) => updateField('font_family', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Couleur du texte principal
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.text_color || '#ffffff'}
                onChange={(e) => updateField('text_color', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={theme.text_color || '#ffffff'}
                onChange={(e) => updateField('text_color', e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
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
                className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
      >
        <Check className="w-5 h-5" />
        {saving ? 'Enregistrement du thème...' : 'Sauvegarder les modifications du thème'}
      </button>
    </div>
  );
}
