'use client';

import React, { useState, useContext } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { LinkItem } from '@/types';
import { detectPlatformFromUrl, PLATFORMS } from '@/lib/platform-detector';
import {
  GripVertical,
  Plus,
  Trash2,
  Edit,
  PlatformIcon,
  ExternalLink,
  X,
  Check,
  Sparkles,
} from '@/components/ui/Icons';
import { toast } from 'sonner';
import { DashboardContext } from '@/lib/context/DashboardContext';

interface LinkEditorProps {
  links: LinkItem[];
  onLinksChange: (updatedLinks: LinkItem[]) => void;
  onSaveLink: (link: Partial<LinkItem>) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
  onReorderLinks: (links: LinkItem[]) => Promise<void>;
}

export function LinkEditor({
  links,
  onLinksChange,
  onSaveLink,
  onDeleteLink,
  onReorderLinks,
}: LinkEditorProps) {
  const { profile, openUpgradeModal } = useContext(DashboardContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Partial<LinkItem> | null>(null);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    // Freemium Limit Check: 1 Link max for free tier
    if (!profile?.is_pro && links.length >= 1) {
      toast.error('⚡ Limite de 1 lien atteinte en version Gratuite. Passez à la formule PRO pour débloquer des liens illimités !');
      openUpgradeModal?.();
      return;
    }

    setEditingLink(null);
    setLabel('');
    setUrl('');
    setPlatform(null);
    setIsModalOpen(true);
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setLabel(link.label);
    setUrl(link.url);
    setPlatform(link.platform || null);
    setIsModalOpen(true);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);

    // Auto-detect platform if not manually locked
    const detected = detectPlatformFromUrl(inputUrl);
    setPlatform(detected.platform);
    if (!label || label === 'Lien' || label === 'Instagram' || label === 'LinkedIn') {
      setLabel(detected.label);
    }
  };

  const handleToggleActive = async (link: LinkItem) => {
    const updated = links.map((l) => (l.id === link.id ? { ...l, is_active: !l.is_active } : l));
    onLinksChange(updated);
    try {
      await onSaveLink({ id: link.id, is_active: !link.is_active });
      toast.success(link.is_active ? 'Lien masqué' : 'Lien activé');
    } catch {
      toast.error('Erreur de mise à jour');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(links);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const reorderedWithPosition = reordered.map((item, index) => ({
      ...item,
      position: index,
    }));

    onLinksChange(reorderedWithPosition);
    try {
      await onReorderLinks(reorderedWithPosition);
      toast.success('Ordre mis à jour');
    } catch {
      toast.error('Erreur lors de la réorganisation');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !label.trim()) {
      toast.error('Veuillez remplir l’URL et l’intitulé du lien');
      return;
    }

    try {
      setSaving(true);
      const linkPayload: Partial<LinkItem> = {
        ...(editingLink?.id ? { id: editingLink.id } : {}),
        label: label.trim(),
        url: url.trim(),
        platform: platform || 'website',
        type: platform && platform !== 'website' ? 'social' : 'custom',
        is_active: editingLink?.is_active ?? true,
        position: editingLink?.position ?? links.length,
      };

      await onSaveLink(linkPayload);
      toast.success(editingLink ? 'Lien modifié' : 'Lien ajouté avec succès !');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce lien ?')) return;
    try {
      const filtered = links.filter((l) => l.id !== linkId);
      onLinksChange(filtered);
      await onDeleteLink(linkId);
      toast.success('Lien supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 text-neutral-900 font-sans">
      {/* Top Header & Add Link Button */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            Gestion des Liens
          </h2>
          <p className="text-xs text-neutral-500">
            Glissez-déposez pour réorganiser vos liens publics
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un lien</span>
        </button>
      </div>

      {/* Freemium Links Usage Banner */}
      {!profile?.is_pro && (
        <div
          onClick={() => {
            const upgradeBtn = document.querySelector('button:has-text("PRO")') as HTMLButtonElement;
            if (upgradeBtn) upgradeBtn.click();
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-800 cursor-pointer hover:border-amber-400/50 transition shadow-xs"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Offre Gratuite : <strong>{links.length} / 1 lien</strong> utilisé</span>
          </div>
          <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider underline">
            Passer aux Liens Illimités (PRO) →
          </span>
        </div>
      )}

      {/* Links List with Drag & Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="links-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-3 min-h-[100px]"
            >
              {links.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-2xl text-neutral-500 bg-white shadow-xs">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-500 opacity-60" />
                  <p className="text-sm font-bold text-neutral-800 mb-1">Aucun lien enregistré</p>
                  <p className="text-xs text-neutral-500">
                    Cliquez sur "Ajouter un lien" pour créer votre premier bouton.
                  </p>
                </div>
              ) : (
                links.map((link, index) => (
                  <Draggable key={link.id} draggableId={link.id} index={index}>
                    {(providedDraggable, snapshot) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        className={`bg-white border border-neutral-200/80 rounded-2xl p-4 flex items-center justify-between transition-all shadow-xs ${
                          snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500/40 scale-[1.02]' : 'hover:border-neutral-300'
                        } ${!link.is_active ? 'opacity-50 bg-slate-50' : ''}`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Drag Handle */}
                          <div
                            {...providedDraggable.dragHandleProps}
                            className="text-neutral-400 hover:text-neutral-600 p-1 cursor-grab active:cursor-grabbing shrink-0"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>

                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                            <PlatformIcon name={link.platform || 'website'} className="w-5 h-5" />
                          </div>

                          {/* Details */}
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-neutral-900 text-sm truncate">
                              {link.label}
                            </span>
                            <span className="text-xs text-neutral-500 truncate flex items-center gap-1">
                              {link.url}
                              <ExternalLink className="w-3 h-3 opacity-40 shrink-0" />
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Clicks Badge */}
                          <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full bg-slate-100 text-neutral-600 font-mono font-bold border border-neutral-200">
                            {link.click_count || 0} clics
                          </span>

                          {/* Active Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(link)}
                            className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                              link.is_active ? 'bg-indigo-600' : 'bg-neutral-300'
                            }`}
                            title={link.is_active ? 'Désactiver le lien' : 'Activer le lien'}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                link.is_active ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(link)}
                            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add / Edit Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 text-neutral-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
              <h3 className="text-lg font-bold text-neutral-900">
                {editingLink ? 'Modifier le lien' : 'Ajouter un nouveau lien'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-800 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  URL du lien *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://instagram.com/votre_profil"
                  value={url}
                  onChange={handleUrlChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Intitulé du bouton *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mon Instagram, Mon Portfolio..."
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-sm transition font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Plateforme / Icône
                </label>
                <select
                  value={platform || 'website'}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 focus:outline-none focus:border-indigo-600 text-sm capitalize font-bold"
                >
                  {Object.values(PLATFORMS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-neutral-700 font-bold rounded-xl text-sm transition border border-neutral-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
