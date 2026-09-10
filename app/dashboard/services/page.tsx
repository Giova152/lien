'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/lib/context/DashboardContext';
import { createClient } from '@/lib/supabase/client';
import { ServiceItem, BookingAvailability, AppointmentBooking, AppointmentStatus } from '@/types';
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
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Settings,
  ListOrdered,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

const DAYS_LIST = [
  { id: 'mon', label: 'Lundi' },
  { id: 'tue', label: 'Mardi' },
  { id: 'wed', label: 'Mercredi' },
  { id: 'thu', label: 'Jeudi' },
  { id: 'fri', label: 'Vendredi' },
  { id: 'sat', label: 'Samedi' },
  { id: 'sun', label: 'Dimanche' },
];

export default function ServicesPage() {
  const { profile, setProfile, refreshDashboard, openUpgradeModal } = useDashboard();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'services' | 'availability' | 'appointments'>('services');
  const [saving, setSaving] = useState(false);

  // Services State
  const [services, setServices] = useState<ServiceItem[]>(profile?.theme?.services || []);
  const [enableCategories, setEnableCategories] = useState<boolean>(
    profile?.theme?.enable_service_categories ?? true
  );

  // Availability State
  const [availability, setAvailability] = useState<BookingAvailability>(
    profile?.theme?.booking_availability || {
      enabled_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      start_time: '09:00',
      end_time: '18:00',
      slot_duration: 30,
      break_start: '12:00',
      break_end: '14:00',
    }
  );

  // Appointments State
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [loadingAppts, setLoadingAppts] = useState<boolean>(false);
  const [apptFilter, setApptFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  useEffect(() => {
    if (profile?.theme?.services) setServices(profile.theme.services);
    if (profile?.theme?.booking_availability) setAvailability(profile.theme.booking_availability);
  }, [profile]);

  // Fetch received appointments when switching to appointments tab
  const fetchAppointments = async () => {
    if (!profile?.id) return;
    setLoadingAppts(true);
    try {
      const res = await fetch(`/api/appointments?profileId=${profile.id}`);
      const data = await res.json();
      if (data?.appointments) {
        setAppointments(data.appointments);
      } else {
        setAppointments(profile.theme?.appointments || []);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      setAppointments(profile.theme?.appointments || []);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab, profile?.id]);

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

  const handleToggleDay = (dayId: string) => {
    const current = availability.enabled_days || [];
    const updated = current.includes(dayId)
      ? current.filter((d) => d !== dayId)
      : [...current, dayId];
    setAvailability({ ...availability, enabled_days: updated });
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
        booking_availability: availability,
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
        toast.success('Services & Agenda enregistrés avec succès !');
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

  const handleUpdateApptStatus = async (apptId: string, status: AppointmentStatus) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: apptId, status }),
      });
      if (!res.ok) throw new Error('Erreur lors du changement de statut.');

      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, status } : a))
      );
      toast.success(`Statut mis à jour : ${status === 'confirmed' ? 'Confirmé' : 'Annulé'}`);
    } catch (err: any) {
      toast.error(err.message || 'Impossible de mettre à jour le statut');
    }
  };

  const handleDeleteAppt = async (apptId: string) => {
    try {
      const res = await fetch(`/api/appointments?id=${apptId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression.');

      setAppointments((prev) => prev.filter((a) => a.id !== apptId));
      toast.success('Rendez-vous supprimé.');
    } catch (err: any) {
      toast.error(err.message || 'Impossible de supprimer le rendez-vous');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (apptFilter === 'all') return true;
    return a.status === apptFilter;
  });

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2.5 text-neutral-900 tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            Services & Agenda Natif
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Gérez vos prestations, votre agenda natif sans outil tiers ou vos redirections vers Calendly / WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          {activeTab === 'services' && (
            <button
              type="button"
              onClick={() => handleAddService()}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une prestation</span>
            </button>
          )}

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

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'services'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Mes Prestations ({services.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'availability'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Agenda & Disponibilités</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition relative ${
            activeTab === 'appointments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Rendez-vous reçus</span>
          {appointments.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-zinc-950 font-black">
              {appointments.length}
            </span>
          )}
        </button>
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
                Fonctionnalité PRO : Agenda Natif & Prises de RDV
              </h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                Passez à la formule PRO pour activer la réservation en ligne et l’agenda natif sur votre profil.
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

      {/* TAB 1: SERVICES LIST */}
      {activeTab === 'services' && (
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
                onClick={() =>
                  handleAddService({
                    title: 'Séance Découverte (100% Natif)',
                    category: 'RDV Natif',
                    subtitle: 'Séance de 30 min réservable directement sur mon profil Lien-Bio.',
                    price: 'Gratuit',
                    button_text: 'Réserver un créneau',
                    is_native_booking: true,
                    duration_minutes: 30,
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span>+ RDV Natif (Sans Calendly)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddService({
                    title: 'RDV Calendly / Cal.com',
                    category: 'RDV',
                    subtitle: 'Lien vers votre calendrier externe d’origine.',
                    price: 'Gratuit',
                    url: 'https://calendly.com',
                    button_text: 'Prendre RDV',
                    is_native_booking: false,
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-indigo-400 hover:text-indigo-600 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                <span>+ Lien Calendly Externe</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddService({
                    title: 'Consultation WhatsApp',
                    category: 'Conseil',
                    subtitle: 'Échange rapide par messages ou vocal.',
                    price: 'Gratuit',
                    url: 'https://wa.me/',
                    button_text: 'Discuter sur WhatsApp',
                    is_native_booking: false,
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-emerald-400 hover:text-emerald-700 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition shadow-2xs"
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
                Ajoutez un créneau de rendez-vous natif ou un service en ligne. Vos visiteurs pourront réserver directement sur votre profil.
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
                    className={`bg-white border rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs transition-all duration-200 group ${
                      srv.is_native_booking ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-neutral-200/80'
                    }`}
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
                            {srv.is_native_booking && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700">
                                Agenda Natif Lien-Bio
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
                        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Supprimer cette prestation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mode de Réservation Switch */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <label className="text-xs font-bold text-neutral-900 block cursor-pointer">
                            Réservation Native Lien-Bio (100% Natif)
                          </label>
                          <span className="text-[11px] text-neutral-500 block">
                            {srv.is_native_booking
                              ? 'Les visiteurs choisissent un créneau directement dans votre calendrier sur Lien-Bio.'
                              : 'Les visiteurs seront redirigés vers un lien externe (Calendly, WhatsApp, etc.).'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateService(srv.id, 'is_native_booking', !srv.is_native_booking)
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex items-center shrink-0 ${
                          srv.is_native_booking ? 'bg-indigo-600' : 'bg-neutral-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                            srv.is_native_booking ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
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

                    {/* Ligne 3 : Natif Duration OR External Link */}
                    {srv.is_native_booking ? (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-0.5">
                        <div className="sm:col-span-6">
                          <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            Durée du rendez-vous (en minutes)
                          </label>
                          <select
                            value={srv.duration_minutes || 30}
                            onChange={(e) =>
                              handleUpdateService(srv.id, 'duration_minutes', Number(e.target.value))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>60 minutes (1 heure)</option>
                            <option value={90}>90 minutes (1h30)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-6">
                          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                            Texte du bouton sur la carte
                          </label>
                          <input
                            type="text"
                            value={srv.button_text || ''}
                            onChange={(e) => handleUpdateService(srv.id, 'button_text', e.target.value)}
                            placeholder="Ex: Réserver un créneau"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
                          />
                        </div>
                      </div>
                    ) : (
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
                              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                            Texte du bouton
                          </label>
                          <input
                            type="text"
                            value={srv.button_text || ''}
                            onChange={(e) => handleUpdateService(srv.id, 'button_text', e.target.value)}
                            placeholder="Ex: Prendre RDV"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition shadow-2xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer mes prestations et agenda'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AGENDA & AVAILABILITY SETTINGS */}
      {activeTab === 'availability' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              Configuration des créneaux & Horaires de travail
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Définissez vos jours ouvrables et plages horaires d’ouverture pour vos réservations natives Lien-Bio.
            </p>
          </div>

          {/* Jours travaillés */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2.5">
              1. Jours de disponibilité :
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_LIST.map((day) => {
                const isChecked = availability.enabled_days?.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleDay(day.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      isChecked
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    {isChecked ? `✓ ${day.label}` : day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plage Horaires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Heure de début de journée :
              </label>
              <input
                type="time"
                value={availability.start_time || '09:00'}
                onChange={(e) => setAvailability({ ...availability, start_time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Heure de fin de journée :
              </label>
              <input
                type="time"
                value={availability.end_time || '18:00'}
                onChange={(e) => setAvailability({ ...availability, end_time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Pause Déjeuner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Pause midi (Début) :
              </label>
              <input
                type="time"
                value={availability.break_start || '12:00'}
                onChange={(e) => setAvailability({ ...availability, break_start: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Pause midi (Fin) :
              </label>
              <input
                type="time"
                value={availability.break_end || '14:00'}
                onChange={(e) => setAvailability({ ...availability, break_end: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer la configuration de l’agenda'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: APPOINTMENTS LIST */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setApptFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  apptFilter === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Tous ({appointments.length})
              </button>

              <button
                type="button"
                onClick={() => setApptFilter('confirmed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  apptFilter === 'confirmed'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Confirmés ({appointments.filter((a) => a.status === 'confirmed').length})
              </button>

              <button
                type="button"
                onClick={() => setApptFilter('cancelled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  apptFilter === 'cancelled'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                Annulés ({appointments.filter((a) => a.status === 'cancelled').length})
              </button>
            </div>

            <button
              type="button"
              onClick={fetchAppointments}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Actualiser
            </button>
          </div>

          {loadingAppts ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-500 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              Chargement des rendez-vous...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center text-neutral-500 text-xs">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
              Aucun rendez-vous trouvé.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appt) => {
                const isCancelled = appt.status === 'cancelled';

                return (
                  <div
                    key={appt.id}
                    className={`bg-white border rounded-2xl p-5 shadow-2xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCancelled ? 'opacity-60 border-neutral-200' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-md">
                          {appt.service_title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCancelled
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isCancelled ? 'Annulé' : 'Confirmé'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-700 pt-1">
                        <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {appt.date} à {appt.time_slot}
                        </div>

                        <div className="flex items-center gap-1.5 font-semibold">
                          <User className="w-3.5 h-3.5 text-neutral-400" />
                          {appt.client_name}
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-neutral-600">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          {appt.client_email}
                        </div>

                        {appt.client_phone && (
                          <div className="flex items-center gap-1.5 font-mono text-neutral-600">
                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                            {appt.client_phone}
                          </div>
                        )}
                      </div>

                      {appt.notes && (
                        <p className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded-lg border border-neutral-200/60 mt-1 italic">
                          "{appt.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {!isCancelled ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateApptStatus(appt.id, 'cancelled')}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Annuler
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateApptStatus(appt.id, 'confirmed')}
                          className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Rétablir
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteAppt(appt.id)}
                        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Supprimer la réservation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
