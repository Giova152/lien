'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/lib/context/DashboardContext';
import { createClient } from '@/lib/supabase/client';
import { ServiceItem } from '@/types';
import { formatExternalUrl } from '@/lib/utils';
import {
  Zap,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Calendar,
  Sparkles,
  ArrowRight,
  Lock,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

export default function ServicesPage() {
  const { profile, setProfile, refreshDashboard, openUpgradeModal } = useDashboard();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(profile?.theme?.services || []);
  const [enableCategories, setEnableCategories] = useState<boolean>(
    profile?.theme?.enable_service_categories ?? true
  );

  const handleAddService = (template?: Partial<ServiceItem>) => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      title: template?.title || 'Prestation / Consultation',
      category: template?.category || '',
      subtitle: template?.subtitle || 'Description courte de votre prestation ou accompagnement.',
      price: template?.price || 'Sur devis',
      url: template?.url || '',
      button_text: template?.button_text || 'En savoir plus',
    };
    const updated = [newService, ...services];
    setServices(updated);
    if (setProfile && profile) {
      setProfile({
        ...profile,
        theme: { ...profile.theme, services: updated },
      });
    }
  };

  const handleUpdateService = (id: string, field: keyof ServiceItem, value: string) => {
    const updated = services.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    setServices(updated);
    if (setProfile && profile) {
      setProfile({
        ...profile,
        theme: { ...profile.theme, services: updated },
      });
    }
  };

  const handleDeleteService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    if (setProfile && profile) {
      setProfile({
        ...profile,
        theme: { ...profile.theme, services: updated },
      });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      // Ensure all URLs are normalized with https://
      const cleanedServices = services.map((s) => ({
        ...s,
        url: s.url ? formatExternalUrl(s.url) : '',
      }));

      const updatedTheme = {
        ...(profile.theme || {}),
        services: cleanedServices,
        enable_service_categories: enableCategories,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ theme: updatedTheme, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      if (setProfile) {
        setProfile({ ...profile, theme: updatedTheme });
      }
      setServices(cleanedServices);

      if (profile?.is_pro) {
        toast.success('Prestations et redirections enregistrées avec succès !');
      } else {
        toast.success('Prestations sauvegardées ! Passez en PRO pour les activer sur votre profil public.', {
          action: {
            label: 'Passer PRO',
            onClick: () => openUpgradeModal?.(),
          },
        });
      }
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans max-w-4xl pb-16">


      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2.5 text-neutral-900 tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            Services & Prise de RDV
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Proposez vos rendez-vous (Calendly, Cal.com), consultations, forfaits ou prestations avec redirection directe en 1 clic.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleAddService()}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une prestation</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* Category Organisation Banner (Facultatif - Choix de l'utilisateur) */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">
                Organisation par catégories
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-600 rounded-full">
                Facultatif
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed max-w-xl">
              Vous êtes libre de catégoriser vos services pour faire apparaître des filtres par onglets sur votre profil, ou de les laisser en liste simple continue.
            </p>
            {services.some((s) => Boolean(s.category?.trim())) && enableCategories && (
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                <span className="text-[11px] text-neutral-400 font-medium">Catégories actives :</span>
                {Array.from(new Set(services.map((s) => s.category?.trim()).filter(Boolean) as string[])).map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md uppercase tracking-wider"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <span className="text-xs font-semibold text-neutral-700">
            {enableCategories ? 'Filtres activés' : 'Liste simple'}
          </span>
          <button
            type="button"
            onClick={() => setEnableCategories(!enableCategories)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex items-center ${
              enableCategories ? 'bg-indigo-600' : 'bg-neutral-300'
            }`}
            title="Activer ou désactiver les onglets de filtre par catégorie sur votre profil public"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                enableCategories ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Quick Templates Bar */}
      <div className="bg-slate-50 border border-neutral-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Modèles rapides en 1 clic :</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleAddService({
                title: 'RDV sur Calendrier (30 min)',
                category: 'RDV',
                subtitle: 'Séance découverte de 30 min en visio pour échanger sur vos projets.',
                price: 'Gratuit',
                url: 'https://calendly.com',
                button_text: 'Prendre RDV',
              })
            }
            className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-indigo-400 hover:text-indigo-600 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>+ RDV Calendrier</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAddService({
                title: 'Consultation WhatsApp',
                category: 'Conseil',
                subtitle: 'Échange rapide par messages ou vocal pour répondre à vos questions.',
                price: 'Gratuit',
                url: 'https://wa.me/',
                button_text: 'Discuter sur WhatsApp',
              })
            }
            className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-emerald-400 hover:text-emerald-700 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>+ Consultation WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAddService({
                title: 'Audit & Accompagnement sur-mesure',
                category: 'Prestation',
                subtitle: 'Analyse complète de votre besoin avec plan d’action et accompagnement.',
                price: 'Sur devis',
                url: '',
                button_text: 'Demander un devis',
              })
            }
            className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-purple-400 hover:text-purple-700 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>+ Prestation sur-mesure</span>
          </button>
        </div>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3.5">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 mb-1">Aucune prestation pour le moment</h3>
          <p className="text-xs text-neutral-500 max-w-md mb-5 leading-relaxed">
            Ajoutez un créneau de rendez-vous (Calendly, Cal.com) ou une prestation. Vos visiteurs pourront cliquer directement dessus pour réserver en ligne.
          </p>
          <button
            type="button"
            onClick={() => handleAddService()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter ma première prestation</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {services.map((srv, index) => {
            const formattedTestUrl = srv.url ? formatExternalUrl(srv.url) : '';

            return (
              <div
                key={srv.id}
                className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs hover:border-neutral-300/90 transition-all duration-200 group"
              >
                {/* Header card : épuré et moderne */}
                <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700 shadow-2xs">
                      {index + 1}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block leading-tight">
                        {srv.title?.trim() || `Prestation #${index + 1}`}
                      </span>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        Configuration de la prestation et redirection
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteService(srv.id)}
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Supprimer cette prestation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Ligne 1 : Titre & Tarif */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Titre de la prestation ou du RDV <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={srv.title}
                      onChange={(e) => handleUpdateService(srv.id, 'title', e.target.value)}
                      placeholder="Ex: Séance découverte (30 min), Audit, Consultation..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-medium placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Tarif affiché
                    </label>
                    <input
                      type="text"
                      value={srv.price || ''}
                      onChange={(e) => handleUpdateService(srv.id, 'price', e.target.value)}
                      placeholder="Ex: Gratuit, 50 €, Sur devis"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-medium placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Ligne 2 : Description & Catégorie */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Description courte <span className="text-[11px] font-normal text-neutral-400">(affichée sous le titre)</span>
                    </label>
                    <input
                      type="text"
                      value={srv.subtitle || ''}
                      onChange={(e) => handleUpdateService(srv.id, 'subtitle', e.target.value)}
                      placeholder="Ex: Échange de 30 min en visio pour analyser vos besoins et vous orienter."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-800 text-xs placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Catégorie <span className="text-[11px] font-normal text-neutral-400">(facultatif)</span>
                      </label>
                      {srv.category && (
                        <button
                          type="button"
                          onClick={() => handleUpdateService(srv.id, 'category', '')}
                          className="text-[10px] font-semibold text-neutral-400 hover:text-rose-600 transition"
                          title="Effacer la catégorie pour laisser ce service sans catégorie"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={srv.category || ''}
                      onChange={(e) => handleUpdateService(srv.id, 'category', e.target.value)}
                      placeholder="Ex: RDV, Coaching, Prestation..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-800 text-xs placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-2xs"
                    />
                    {/* Quick Category Chips */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {['RDV', 'Coaching', 'Audit', 'Conseil', 'Formation'].map((chip) => {
                        const isSelected = srv.category?.trim().toLowerCase() === chip.toLowerCase();
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleUpdateService(srv.id, 'category', isSelected ? '' : chip)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                            }`}
                          >
                            {isSelected ? `✓ ${chip}` : `+ ${chip}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Ligne 3 : Lien de Redirection & Libellé du bouton */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-0.5">
                  <div className="sm:col-span-8">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Lien de redirection (Calendly, WhatsApp, etc.) <span className="text-rose-500">*</span>
                      </label>
                      {formattedTestUrl && (
                        <a
                          href={formattedTestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Tester le lien</span>
                        </a>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={srv.url || ''}
                        onChange={(e) => handleUpdateService(srv.id, 'url', e.target.value)}
                        placeholder="https://calendly.com/... ou https://wa.me/..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-mono placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-2xs"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Vos visiteurs seront redirigés vers cette page lors du clic sur le service.
                    </p>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Texte du bouton <span className="text-[11px] font-normal text-neutral-400">(facultatif)</span>
                    </label>
                    <input
                      type="text"
                      value={srv.button_text || ''}
                      onChange={(e) => handleUpdateService(srv.id, 'button_text', e.target.value)}
                      placeholder="Ex: Prendre RDV"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-medium placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer mes prestations et redirections'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

