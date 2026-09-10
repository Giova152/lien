'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/lib/context/DashboardContext';
import { createClient } from '@/lib/supabase/client';
import { AppointmentBooking, BookingAvailability } from '@/types';
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

  const [activeTab, setActiveTab] = useState<'appointments' | 'availability'>('appointments');
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  // Disponibilités locales
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

  // Sauvegarder les disponibilités
  const handleSaveAvailability = async () => {
    if (!profile) return;
    setSaving(true);
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
      setSaving(false);
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
            Gérez vos disponibilités de prise de rendez-vous et consultez vos réservations clients.
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

      {/* PRO Notice if not PRO */}
      {profile && !profile.is_pro && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-neutral-900">
                Module Agenda Pro (PRO)
              </h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                La réservation automatique de créneaux en ligne est réservée aux membres PRO.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openUpgradeModal?.()}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shrink-0 cursor-pointer"
          >
            <span>Débloquer avec PRO</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
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
              disabled={saving}
              onClick={handleSaveAvailability}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer mes disponibilités'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
