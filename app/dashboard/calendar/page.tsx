'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/lib/context/DashboardContext';
import { createClient } from '@/lib/supabase/client';
import { AppointmentBooking, BookingAvailability, ServiceItem } from '@/types';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Check,
  Copy,
  ExternalLink,
  Crown,
  Layers,
  Trash2,
  User,
  Mail,
  Phone,
  ArrowRight,
  Plus,
  Sparkles,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

const DAYS_CONFIG: Array<{ id: string; label: string }> = [
  { id: 'mon', label: 'Lundi' },
  { id: 'tue', label: 'Mardi' },
  { id: 'wed', label: 'Mercredi' },
  { id: 'thu', label: 'Jeudi' },
  { id: 'fri', label: 'Vendredi' },
  { id: 'sat', label: 'Samedi' },
  { id: 'sun', label: 'Dimanche' },
];

export default function CalendarDashboardPage() {
  const { profile, setProfile, openUpgradeModal } = useDashboard();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'types' | 'appointments' | 'availability'>('types');
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [savingTypes, setSavingTypes] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  // Types de rendez-vous (Event Types)
  const initialServices: ServiceItem[] =
    profile?.theme?.services && profile.theme.services.length > 0
      ? profile.theme.services
      : [
          {
            id: 'default-call',
            title: 'Appel découverte',
            subtitle: 'Échange de cadrage en visio pour discuter de vos besoins.',
            price: 'Gratuit',
            duration_minutes: 30,
            is_native_booking: true,
          },
        ];

  const [appointmentTypes, setAppointmentTypes] = useState<ServiceItem[]>(initialServices);

  useEffect(() => {
    if (profile?.theme?.services && profile.theme.services.length > 0) {
      setAppointmentTypes(profile.theme.services);
    }
  }, [profile?.theme?.services]);

  // Disponibilités globales locales
  const currentAvailability: BookingAvailability = profile?.theme?.booking_availability || {
    enabled_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_time: '09:00',
    end_time: '18:00',
    slot_duration: 30,
  };

  const [availability, setAvailability] = useState<BookingAvailability>(currentAvailability);

  // Lien public de réservation
  const username = profile?.username || 'mon-profil';
  const calendarPublicUrl = `https://calendar.lien-bio.site/${username}`;

  // Charger les rendez-vous
  useEffect(() => {
    if (!profile?.id) return;

    let isMounted = true;
    setLoadingAppts(true);

    fetch(`/api/appointments?profileId=${profile.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
        } else {
          setAppointments([]);
        }
      })
      .catch(() => {
        if (isMounted) setAppointments([]);
      })
      .finally(() => {
        if (isMounted) setLoadingAppts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  // Gestion des types de rendez-vous (Quota selon offre)
  const isPro = Boolean(profile?.is_pro);

  const handleAddAppointmentType = () => {
    if (!isPro && appointmentTypes.length >= 1) {
      toast.info('⚡ Le plan Gratuit permet 1 type de rendez-vous. Passez à PRO pour en créer en illimité !');
      openUpgradeModal?.();
      return;
    }

    const newType: ServiceItem = {
      id: Date.now().toString(),
      title: 'Consultation & Accompagnement',
      subtitle: 'Séance sur-mesure pour vous aider à franchir un cap.',
      price: '50 €',
      duration_minutes: 45,
      is_native_booking: true,
    };

    setAppointmentTypes([...appointmentTypes, newType]);
  };

  const handleUpdateAppointmentType = (id: string, field: keyof ServiceItem, value: any) => {
    setAppointmentTypes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteAppointmentType = (id: string) => {
    if (appointmentTypes.length <= 1) {
      toast.error('Vous devez conserver au minimum un type de rendez-vous.');
      return;
    }
    setAppointmentTypes((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveAppointmentTypes = async () => {
    if (!profile) return;
    setSavingTypes(true);
    try {
      const updatedTheme = {
        ...profile.theme,
        services: appointmentTypes,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ theme: updatedTheme })
        .eq('id', profile.id);

      if (error) throw error;

      if (setProfile) {
        setProfile({ ...profile, theme: updatedTheme });
      }

      toast.success('Vos types de rendez-vous ont été enregistrés !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSavingTypes(false);
    }
  };

  // Sauvegarder les disponibilités
  const handleSaveAvailability = async () => {
    if (!profile) return;
    setSavingAvailability(true);
    try {
      const updatedTheme = {
        ...profile.theme,
        booking_availability: availability,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ theme: updatedTheme })
        .eq('id', profile.id);

      if (error) throw error;

      if (setProfile) {
        setProfile({ ...profile, theme: updatedTheme });
      }

      toast.success('Vos disponibilités ont été enregistrées.');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSavingAvailability(false);
    }
  };

  // Annuler un rendez-vous
  const handleCancelAppointment = async (apptId: string) => {
    if (!confirm('Confirmez-vous l’annulation de ce rendez-vous ?')) return;

    const updated = appointments.map((a) =>
      a.id === apptId ? { ...a, status: 'cancelled' as const } : a
    );
    setAppointments(updated);

    try {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', apptId);
      toast.success('Rendez-vous annulé.');
    } catch {
      toast.error('Erreur lors de l’annulation');
    }
  };

  const toggleDay = (dayId: string) => {
    const exists = availability.enabled_days.includes(dayId);
    const updatedDays = exists
      ? availability.enabled_days.filter((d) => d !== dayId)
      : [...availability.enabled_days, dayId];
    setAvailability({ ...availability, enabled_days: updatedDays });
  };

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2.5 text-neutral-900 tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
            Agenda Pro & Rendez-vous
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Gérez vos types d'événements, configurez vos plages horaires et suivez vos réservations.
          </p>
        </div>

        {/* Public calendar link box */}
        <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/90 rounded-2xl p-1.5 pl-3">
          <span className="text-xs font-mono text-neutral-600 truncate max-w-[200px]">
            {calendarPublicUrl}
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(calendarPublicUrl);
              toast.success('Lien public de réservation copié !');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 flex items-center gap-1 transition shadow-2xs cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-neutral-500" />
            <span>Copier</span>
          </button>
          <a
            href={calendarPublicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl hover:bg-neutral-200/60 text-neutral-500 transition"
            title="Tester mon lien de réservation"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'types'
              ? 'bg-neutral-900 text-white shadow-2xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Types de rendez-vous</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'types' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            {appointmentTypes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'bg-neutral-900 text-white shadow-2xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Rendez-vous reçus</span>
          {appointments.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px]">
              {appointments.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'availability'
              ? 'bg-neutral-900 text-white shadow-2xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Disponibilités & Horaires</span>
        </button>
      </div>

      {/* Tab 1: Types de Rendez-vous */}
      {activeTab === 'types' && (
        <div className="flex flex-col gap-5">
          {/* Header Quota */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 border border-neutral-200/90 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-neutral-900">Types d'événements proposés</h4>
                  {isPro ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                      Illimité (PRO)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
                      {appointmentTypes.length} / 1 (Offre Gratuite)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Chaque type possède sa propre durée et tarif affiché.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddAppointmentType}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un type de RDV</span>
              </button>
            </div>
          </div>

          {!isPro && appointmentTypes.length >= 1 && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Vous avez atteint la limite de l'offre gratuite (1 type de RDV). Passez à PRO pour en créer en illimité.</span>
              </div>
              <button
                type="button"
                onClick={() => openUpgradeModal?.()}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shrink-0 transition"
              >
                Débloquer
              </button>
            </div>
          )}

          {/* Liste des cartes d'événements */}
          <div className="grid grid-cols-1 gap-4">
            {appointmentTypes.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col gap-4 relative group"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-600 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-neutral-800">
                      Prestation / Créneau {idx + 1}
                    </span>
                  </div>
                  {appointmentTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAppointmentType(item.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Supprimer ce type de RDV"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Intitulé du rendez-vous
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateAppointmentType(item.id, 'title', e.target.value)}
                      placeholder="Ex: Appel découverte, Session de coaching..."
                      className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Durée du créneau
                      </label>
                      <select
                        value={item.duration_minutes || 30}
                        onChange={(e) =>
                          handleUpdateAppointmentType(item.id, 'duration_minutes', Number(e.target.value))
                        }
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold bg-white focus:outline-none focus:border-indigo-600"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 min (1h)</option>
                        <option value={90}>90 min (1h30)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Tarif affiché
                      </label>
                      <input
                        type="text"
                        value={item.price || ''}
                        onChange={(e) => handleUpdateAppointmentType(item.id, 'price', e.target.value)}
                        placeholder="Ex: Gratuit, 50 €, Sur devis"
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Description courte (visible par vos clients lors du choix)
                  </label>
                  <input
                    type="text"
                    value={item.subtitle || ''}
                    onChange={(e) => handleUpdateAppointmentType(item.id, 'subtitle', e.target.value)}
                    placeholder="Ex: Échange de cadrage en visio pour évaluer vos objectifs."
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-600 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={savingTypes}
              onClick={handleSaveAppointmentTypes}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{savingTypes ? 'Enregistrement...' : 'Enregistrer mes types de rendez-vous'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: Liste des Rendez-vous */}
      {activeTab === 'appointments' && (
        <div className="flex flex-col gap-4">
          {loadingAppts ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              Chargement des rendez-vous...
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Aucun rendez-vous pour le moment</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Partagez votre lien public de réservation pour permettre à vos prospects de réserver un créneau.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {appointments.map((appt) => {
                const isCancelled = appt.status === 'cancelled';
                return (
                  <div
                    key={appt.id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-2xs ${
                      isCancelled ? 'opacity-60 border-neutral-200 bg-neutral-50/50' : 'border-neutral-200/90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 shrink-0">
                        <span className="text-[10px] font-bold uppercase">
                          {appt.date.split('-')[1]}/{appt.date.split('-')[2]}
                        </span>
                        <span className="text-xs font-black">{appt.time_slot}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-neutral-900">{appt.client_name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isCancelled
                                ? 'bg-neutral-100 text-neutral-500'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            {isCancelled ? 'Annulé' : 'Confirmé'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{appt.client_email}</span>
                          </span>
                          {appt.client_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{appt.client_phone}</span>
                            </span>
                          )}
                          <span className="text-neutral-400">• {appt.service_title}</span>
                        </div>

                        {appt.notes && (
                          <p className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded-lg mt-2 border border-neutral-100">
                            « {appt.notes} »
                          </p>
                        )}
                      </div>
                    </div>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-neutral-600 transition cursor-pointer self-end sm:self-center"
                      >
                        Annuler le RDV
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Réglage des Disponibilités */}
      {activeTab === 'availability' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-6 shadow-2xs">
          {/* Jours actifs */}
          <div>
            <label className="block text-xs font-bold text-neutral-900 mb-2">
              Jours d'ouverture aux réservations
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
              {DAYS_CONFIG.map((day) => {
                const isActive = availability.enabled_days.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horaires et Durée */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-100 pt-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Heure de début
              </label>
              <input
                type="time"
                value={availability.start_time || '09:00'}
                onChange={(e) => setAvailability({ ...availability, start_time: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                value={availability.end_time || '18:00'}
                onChange={(e) => setAvailability({ ...availability, end_time: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Durée d'un créneau
              </label>
              <select
                value={availability.slot_duration || 30}
                onChange={(e) =>
                  setAvailability({ ...availability, slot_duration: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-indigo-600 bg-white"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1h)</option>
              </select>
            </div>
          </div>

          {/* Pause Déjeuner optionnelle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-100 pt-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Pause déjeuner - Début (optionnel)
              </label>
              <input
                type="time"
                value={availability.break_start || ''}
                onChange={(e) => setAvailability({ ...availability, break_start: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Pause déjeuner - Fin (optionnel)
              </label>
              <input
                type="time"
                value={availability.break_end || ''}
                onChange={(e) => setAvailability({ ...availability, break_end: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Bouton Enregistrer */}
          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              type="button"
              disabled={savingAvailability}
              onClick={handleSaveAvailability}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{savingAvailability ? 'Enregistrement...' : 'Enregistrer mes disponibilités'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
