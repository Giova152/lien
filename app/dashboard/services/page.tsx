'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/lib/context/DashboardContext';
import { createClient } from '@/lib/supabase/client';
import { ServiceItem } from '@/types';
import {
  Zap,
  Plus,
  Trash2,
  Check,
  ExternalLink,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

export default function ServicesPage() {
  const { profile, setProfile, refreshDashboard } = useDashboard();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(profile?.theme?.services || []);

  const handleAddService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      title: 'Nouvelle Prestation',
      category: 'Conseil',
      subtitle: 'Description de la prestation ou séance (1h)',
      price: 'Sur devis',
      url: '',
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
      const updatedTheme = {
        ...(profile.theme || {}),
        services,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ theme: updatedTheme })
        .eq('id', profile.id);

      if (error) throw error;

      if (setProfile) {
        setProfile({ ...profile, theme: updatedTheme });
      }

      toast.success('Prestations et services enregistrés avec succès !');
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
            <Zap className="w-5 h-5 text-indigo-600" />
            Services & Prestations
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Proposez vos consultations, rendez-vous Calendly, forfaits ou prestations sur votre carte
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddService}
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

      {/* Services List */}
      {services.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 mb-1">Aucune prestation pour le moment</h3>
          <p className="text-xs text-neutral-500 max-w-sm mb-4 leading-relaxed">
            Ajoutez vos services, coachings ou appels découverte. Vos visiteurs pourront réserver directement en ligne.
          </p>
          <button
            type="button"
            onClick={handleAddService}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter ma première prestation</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {services.map((srv, index) => (
            <div
              key={srv.id}
              className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:border-neutral-300 transition"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-700">
                    {index + 1}
                  </span>
                  <span>Prestation</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Titre du service *
                  </label>
                  <input
                    type="text"
                    required
                    value={srv.title}
                    onChange={(e) => handleUpdateService(srv.id, 'title', e.target.value)}
                    placeholder="Ex: Coaching individuel (1h)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Prix ou Tarif
                  </label>
                  <input
                    type="text"
                    value={srv.price || ''}
                    onChange={(e) => handleUpdateService(srv.id, 'price', e.target.value)}
                    placeholder="Ex: Gratuit, 80 € / h, Sur devis"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Description courte / Bénéfices
                  </label>
                  <input
                    type="text"
                    value={srv.subtitle || ''}
                    onChange={(e) => handleUpdateService(srv.id, 'subtitle', e.target.value)}
                    placeholder="Ex: Analyse de votre situation, plan d'action personnalisé et support 7j/7."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-700 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={srv.category || ''}
                    onChange={(e) => handleUpdateService(srv.id, 'category', e.target.value)}
                    placeholder="Ex: Coaching, Audit, RDV"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-700 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Lien de réservation / Calendly / WhatsApp (facultatif)
                </label>
                <div className="relative flex items-center">
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="url"
                    value={srv.url || ''}
                    onChange={(e) => handleUpdateService(srv.id, 'url', e.target.value)}
                    placeholder="https://calendly.com/... ou https://wa.me/..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-indigo-700 font-mono text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Bottom Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer mes prestations'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
