'use client';

import React, { useState, useEffect } from 'react';
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
  Crown,
  Layers,
  Award,
  ArrowRight,
  Copy,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

export default function ServicesPage() {
  const { profile, setProfile, refreshDashboard, openUpgradeModal } = useDashboard();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);

  // Services State
  const [services, setServices] = useState<ServiceItem[]>(profile?.theme?.services || []);
  const [enableCategories, setEnableCategories] = useState<boolean>(
    profile?.theme?.enable_service_categories ?? true
  );

  useEffect(() => {
    if (profile?.theme?.services) setServices(profile.theme.services);
  }, [profile]);

  const handleAddService = (template?: Partial<ServiceItem>) => {
    if (!profile?.is_pro) {
      toast.info('⚡ Les Services & Prises de RDV sont réservés aux membres PRO.');
      openUpgradeModal?.();
      return;
    }
    const newService: ServiceItem = {
      id: Date.now().toString(),
      title: template?.title || 'Prestation / Consultation',
      category: template?.category || '',
      subtitle: template?.subtitle || 'Description courte de votre prestation ou accompagnement.',
      price: template?.price || 'Sur devis',
      url: template?.url || '',
      button_text: template?.button_text || 'En savoir plus',
      is_native_booking: template?.is_native_booking ?? false,
      duration_minutes: template?.duration_minutes ?? 30,
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

  const handleUpdateService = (id: string, field: keyof ServiceItem, value: any) => {
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
        toast.success('Services & Prestations enregistrés avec succès !');
      } else {
        toast.success('Sauvegardé ! Passez en PRO pour les activer sur votre profil public.', {
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
            Services & Prestations
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Gérez vos prestations, vos tarifs et insérez les liens vers votre calendrier professionnel (ex: calendar.lien-bio.site).
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleAddService()}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une prestation</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* PRO Upgrade Callout if not PRO */}
      {!profile?.is_pro && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-neutral-900">
                Combo Suite PRO : Calendrier & RDV inclus
              </h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                Passez à la formule PRO pour débloquer votre accès complet à calendar.lien-bio.site et afficher vos prestations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openUpgradeModal?.()}
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shrink-0 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Passer à la formule PRO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* BANNIÈRE GÉANTE : COMBO SUITE CALENDAR.LIEN-BIO.SITE */}
      {(() => {
        const username = profile?.username || 'mon-profil';
        const calendarUserUrl = `https://calendar.lien-bio.site/${username}`;

        return (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-neutral-900 to-zinc-950 p-6 sm:p-7 text-white shadow-xl border border-indigo-500/30">
            {/* Background Glow Accents */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-5">
              {/* Top Tag & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[11px] font-black uppercase tracking-wider mb-2">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Suite Pro Tout-en-Un • 100% Inclus</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <span>Votre Agenda & Réservation Pro</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                    Fini les abonnements Calendly à 15$/mois. Votre compte intègre automatiquement votre outil de prise de rendez-vous sur <strong className="text-white">calendar.lien-bio.site</strong>.
                  </p>
                </div>

                <a
                  href="https://calendar.lien-bio.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer shrink-0"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Ouvrir calendar.lien-bio.site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* URL Box & 1-Click Copy */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Votre lien d'agenda public direct
                    </span>
                    <span className="font-mono text-xs text-indigo-200 font-semibold truncate block select-all">
                      {calendarUserUrl}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(calendarUserUrl);
                      toast.success('Lien de votre calendrier copié !');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier mon lien global</span>
                  </button>
                </div>
              </div>

              {/* 3-Step Visual Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/30 text-indigo-300 font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <h5 className="font-bold text-white text-xs">Configurez vos créneaux</h5>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Sur calendar.lien-bio.site, fixez vos jours de dispo et vos types de RDV.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/30 text-indigo-300 font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <h5 className="font-bold text-white text-xs">Copiez le lien du RDV</h5>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Récupérez l'URL du créneau spécifique ou votre lien d'agenda global.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/30 text-indigo-300 font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <h5 className="font-bold text-white text-xs">Liez-le à votre carte</h5>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Collez le lien dans vos prestations ci-dessous. Vos visiteurs réserveront en 1 clic !
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SERVICES LIST SECTION */}
      <div className="flex flex-col gap-5">
        {/* Quick Templates Bar */}
        <div className="bg-slate-50 border border-neutral-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Modèles rapides en 1 clic :</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const username = profile?.username || 'mon-profil';
                handleAddService({
                  title: 'Séance Découverte (30 min)',
                  category: 'Rendez-vous',
                  subtitle: 'Échange de 30 minutes en visio pour étudier votre projet.',
                  price: 'Gratuit',
                  url: `https://calendar.lien-bio.site/${username}`,
                  button_text: 'Réserver mon créneau',
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>+ RDV calendar.lien-bio.site</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleAddService({
                  title: 'Consultation Stratégique (1h)',
                  category: 'Coaching',
                  subtitle: 'Session intensive d’accompagnement sur mesure.',
                  price: '90 €',
                  url: `https://calendar.lien-bio.site/${profile?.username || 'mon-profil'}`,
                  button_text: 'Prendre rendez-vous',
                })
              }
              className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-indigo-400 hover:text-indigo-600 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>+ Consultation Payante</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleAddService({
                  title: 'Échange WhatsApp Direct',
                  category: 'Conseil',
                  subtitle: 'Discutez directement avec moi par message ou vocal.',
                  price: 'Gratuit',
                  url: 'https://wa.me/',
                  button_text: 'Discuter sur WhatsApp',
                })
              }
              className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-emerald-400 hover:text-emerald-700 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>+ WhatsApp</span>
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
              Ajoutez votre première prestation ou votre lien de calendrier. Vos visiteurs pourront réserver directement sur votre carte Lien-Bio.
            </p>
            <button
              type="button"
              onClick={() => handleAddService()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter ma première prestation</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {services.map((srv, index) => {
              const formattedTestUrl = srv.url ? formatExternalUrl(srv.url) : '';
              const username = profile?.username || 'mon-profil';
              const userCalendarUrl = `https://calendar.lien-bio.site/${username}`;

              return (
                <div
                  key={srv.id}
                  className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs transition-all duration-200 hover:border-neutral-300 group"
                >
                  {/* Header card */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700 shadow-2xs">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900 block leading-tight">
                            {srv.title?.trim() || `Prestation #${index + 1}`}
                          </span>
                          {srv.url?.includes('calendar.lien-bio.site') && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700">
                              Lien Agenda Pro
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400 block mt-0.5">
                          Configuration de la prestation
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Ligne 2 : Description & Catégorie */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="sm:col-span-8">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Description courte
                      </label>
                      <input
                        type="text"
                        value={srv.subtitle || ''}
                        onChange={(e) => handleUpdateService(srv.id, 'subtitle', e.target.value)}
                        placeholder="Ex: Échange de 30 min en visio pour analyser vos besoins..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-800 text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Catégorie (facultatif)
                      </label>
                      <input
                        type="text"
                        value={srv.category || ''}
                        onChange={(e) => handleUpdateService(srv.id, 'category', e.target.value)}
                        placeholder="Ex: RDV, Coaching, Prestation..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-800 text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Ligne 3 : Lien de réservation & Bouton */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-0.5">
                    <div className="sm:col-span-8">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-neutral-700">
                          Lien de réservation (calendar.lien-bio.site, Calendly...) <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateService(srv.id, 'url', userCalendarUrl)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                            title="Utiliser mon adresse calendar.lien-bio.site"
                          >
                            + Mon Calendar Pro
                          </button>
                          {formattedTestUrl && (
                            <a
                              href={formattedTestUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-neutral-500 hover:text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Tester</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="relative flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={srv.url || ''}
                          onChange={(e) => handleUpdateService(srv.id, 'url', e.target.value)}
                          placeholder="Ex: https://calendar.lien-bio.site/votre-nom ou https://wa.me/..."
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                        Texte du bouton sur la carte
                      </label>
                      <input
                        type="text"
                        value={srv.button_text || ''}
                        onChange={(e) => handleUpdateService(srv.id, 'button_text', e.target.value)}
                        placeholder="Ex: Réserver mon créneau"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer mes prestations'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
