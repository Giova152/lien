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
} from '@/components/ui/Icons';
import { toast } from 'sonner';

export default function ServicesPage() {
  const { profile, setProfile, refreshDashboard } = useDashboard();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(profile?.theme?.services || []);

  const handleAddService = (template?: Partial<ServiceItem>) => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      title: template?.title || 'RDV sur Calendrier',
      category: template?.category || 'RDV',
      subtitle: template?.subtitle || 'Séance de 30 min en visioconférence pour faire le point.',
      price: template?.price || 'Gratuit',
      url: template?.url || '',
      button_text: template?.button_text || 'Prendre RDV',
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

      toast.success('Prestations et redirections enregistrées avec succès !');
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddService()}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une prestation</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
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
                className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs hover:border-neutral-300 transition"
              >
                {/* Header card */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-neutral-700">Prestation & Redirection</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(srv.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Supprimer cette prestation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Titre & Prix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Titre de la prestation ou RDV *
                    </label>
                    <input
                      type="text"
                      required
                      value={srv.title}
                      onChange={(e) => handleUpdateService(srv.id, 'title', e.target.value)}
                      placeholder="Ex: RDV sur Calendrier (30 min)"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Tarif / Prix affiché
                    </label>
                    <input
                      type="text"
                      value={srv.price || ''}
                      onChange={(e) => handleUpdateService(srv.id, 'price', e.target.value)}
                      placeholder="Ex: Gratuit, 80 €, Sur devis"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Description & Catégorie */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Description courte / Détails
                    </label>
                    <input
                      type="text"
                      value={srv.subtitle || ''}
                      onChange={(e) => handleUpdateService(srv.id, 'subtitle', e.target.value)}
                      placeholder="Ex: Échange de 30 min en visio pour analyser vos besoins."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-700 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Badge Catégorie
                    </label>
                    <input
                      type="text"
                      value={srv.category || ''}
                      onChange={(e) => handleUpdateService(srv.id, 'category', e.target.value)}
                      placeholder="Ex: RDV, Consultation, Coaching"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-700 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Lien de Redirection & Bouton */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                        🔗 Lien de redirection (Calendly, Cal.com, WhatsApp, etc.) *
                      </label>
                      {formattedTestUrl && (
                        <a
                          href={formattedTestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
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
                        placeholder="https://calendly.com/votre-compte ou https://wa.me/..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-indigo-50/40 border border-indigo-200 text-indigo-800 font-mono text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Dès qu'un visiteur clique sur votre service, il sera immédiatement redirigé vers ce lien.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Libellé du bouton (facultatif)
                    </label>
                    <input
                      type="text"
                      value={srv.button_text || ''}
                      onChange={(e) => handleUpdateService(srv.id, 'button_text', e.target.value)}
                      placeholder="Ex: Prendre RDV"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-700 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
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

