'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Profile, ServiceItem, BookingAvailability } from '@/types';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  ExternalLink,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

interface PublicBookingClientProps {
  profile: Profile;
}

const DAYS_MAP: Record<number, string> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function PublicBookingClient({ profile }: PublicBookingClientProps) {
  const theme = profile.theme || {};
  const services: ServiceItem[] = theme.services || [];
  
  // Disponibilités configurées ou par défaut (Lun-Ven, 09h-18h, 30 min)
  const availability: BookingAvailability = theme.booking_availability || {
    enabled_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_time: '09:00',
    end_time: '18:00',
    slot_duration: 30,
  };

  // Sélection du service
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    services.length > 0 ? services[0] : null
  );

  // Mois affiché pour le calendrier
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Date sélectionnée (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Créneau sélectionné (ex: "14:00")
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Créneaux déjà pris pour la date sélectionnée
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Formulaire client
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Charger les créneaux déjà réservés quand la date change
  useEffect(() => {
    if (!selectedDate) return;

    let isMounted = true;
    setLoadingSlots(true);

    fetch(`/api/appointments?profileId=${profile.id}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.takenSlots)) {
          setTakenSlots(data.takenSlots.map((s: any) => s.time_slot));
        } else {
          setTakenSlots([]);
        }
      })
      .catch(() => {
        if (isMounted) setTakenSlots([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, profile.id]);

  // Génération des jours du mois affiché
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Dimanche
    // Ajuster pour commencer le lundi (0 = Lundi ... 6 = Dimanche)
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ dateString: string; dayNum: number; isEnabled: boolean; isPast: boolean }> = [];

    // Jours vides au début
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ dateString: '', dayNum: 0, isEnabled: false, isPast: true });
    }

    const todayStr = today.toISOString().split('T')[0];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayOfWeekKey = DAYS_MAP[dateObj.getDay()];
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateString < todayStr;
      const isDayEnabled = availability.enabled_days.includes(dayOfWeekKey);

      days.push({
        dateString,
        dayNum: d,
        isEnabled: isDayEnabled && !isPast,
        isPast,
      });
    }

    return days;
  }, [currentMonth, availability.enabled_days, today]);

  // Génération des créneaux horaires possibles pour la journée
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots: string[] = [];
    const [startH, startM] = (availability.start_time || '09:00').split(':').map(Number);
    const [endH, endM] = (availability.end_time || '18:00').split(':').map(Number);
    const duration = availability.slot_duration || 30;

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let breakStartMin = -1;
    let breakEndMin = -1;
    if (availability.break_start && availability.break_end) {
      const [bsh, bsm] = availability.break_start.split(':').map(Number);
      const [beh, bem] = availability.break_end.split(':').map(Number);
      breakStartMin = bsh * 60 + bsm;
      breakEndMin = beh * 60 + bem;
    }

    while (currentMinutes + duration <= endMinutes) {
      // Vérifier si dans la pause déjeuner
      const isInBreak =
        breakStartMin !== -1 &&
        breakEndMin !== -1 &&
        currentMinutes >= breakStartMin &&
        currentMinutes < breakEndMin;

      if (!isInBreak) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        slots.push(timeString);
      }

      currentMinutes += duration;
    }

    return slots;
  }, [selectedDate, availability]);

  // Soumission de la réservation
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedSlot) {
      toast.error('Veuillez sélectionner une date et un créneau horaire.');
      return;
    }

    if (!clientName.trim() || !clientEmail.trim()) {
      toast.error('Veuillez renseigner votre nom et adresse e-mail.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          serviceId: selectedService?.id || 'default-meeting',
          serviceTitle: selectedService?.title || 'Séance / Rendez-vous',
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          date: selectedDate,
          timeSlot: selectedSlot,
          notes: clientNotes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la réservation');
      }

      setBookingSuccess(true);
      toast.success('Votre rendez-vous a été confirmé avec succès !');
    } catch (err: any) {
      toast.error(err.message || 'Impossible de réserver ce créneau');
    } finally {
      setSubmitting(false);
    }
  };

  // Écran de succès
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 text-center shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-neutral-900">Rendez-vous confirmé !</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Un e-mail récapitulatif a été transmis à <span className="font-semibold text-neutral-800">{clientEmail}</span>.
          </p>

          <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 my-6 text-left text-xs flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500">Avec</span>
              <span className="font-bold text-neutral-900">{profile.display_name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500">Prestation</span>
              <span className="font-semibold text-neutral-900">{selectedService?.title || 'Rendez-vous'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-200/60 pb-2">
              <span className="text-neutral-500">Date</span>
              <span className="font-semibold text-neutral-900">{selectedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Heure</span>
              <span className="font-bold text-indigo-600">{selectedSlot}</span>
            </div>
          </div>

          <a
            href={`https://lien-bio.site/${profile.username}`}
            className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition"
          >
            <span>Retourner sur la page de {profile.display_name}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white py-8 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white border border-neutral-200/90 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Colonne Gauche : Profil & Choix de Prestation */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-200/80 p-6 sm:p-7 flex flex-col justify-between bg-neutral-50/40">
          <div>
            <div className="flex items-center gap-3.5 mb-5">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base">
                  {profile.display_name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-base font-bold text-neutral-900 truncate">
                  {profile.display_name}
                </h1>
                {profile.title && (
                  <p className="text-xs text-neutral-500 truncate">{profile.title}</p>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200/70 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
                Prestations disponibles
              </span>

              {services.length === 0 ? (
                <div className="p-3 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-700">
                  <span className="font-semibold block">Séance Découverte (30 min)</span>
                  <span className="text-neutral-500 text-[11px]">Échange de cadrage en visio</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {services.map((srv) => {
                    const isSelected = selectedService?.id === srv.id;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-200 shadow-2xs'
                            : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900">{srv.title}</span>
                          {srv.price && (
                            <span className="text-[11px] font-bold text-indigo-700 px-2 py-0.5 rounded-md bg-white border border-indigo-100">
                              {srv.price}
                            </span>
                          )}
                        </div>
                        {srv.subtitle && (
                          <span className="text-[11px] text-neutral-500 line-clamp-2">
                            {srv.subtitle}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200/70 mt-6 text-xs text-neutral-400 flex items-center justify-between">
            <span>Propulsé par Calendar Pro</span>
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Colonne Droite : Calendrier & Créneaux & Formulaire */}
        <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">
          {!selectedSlot ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Calendrier Mensuel */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-neutral-900">
                    {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                        )
                      }
                      disabled={
                        currentMonth.getFullYear() === today.getFullYear() &&
                        currentMonth.getMonth() <= today.getMonth()
                      }
                      className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-neutral-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                        )
                      }
                      className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 text-neutral-600" />
                    </button>
                  </div>
                </div>

                {/* En-tête des jours de la semaine */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                    <span key={d} className="text-[10px] font-semibold text-neutral-400 py-1">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Grille des jours */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((item, idx) => {
                    if (!item.dateString) {
                      return <div key={`empty-${idx}`} className="h-9" />;
                    }

                    const isSelected = selectedDate === item.dateString;

                    return (
                      <button
                        key={item.dateString}
                        type="button"
                        disabled={!item.isEnabled}
                        onClick={() => setSelectedDate(item.dateString)}
                        className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 text-white shadow-2xs font-bold'
                            : item.isEnabled
                            ? 'bg-neutral-50 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-800'
                            : 'text-neutral-300 cursor-not-allowed'
                        }`}
                      >
                        {item.dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Créneaux Horaires pour la date */}
              <div className="w-full md:w-48 border-t md:border-t-0 md:border-l border-neutral-200/80 pt-4 md:pt-0 md:pl-6">
                <span className="text-xs font-bold text-neutral-900 block mb-3">
                  {selectedDate ? `Créneaux : ${selectedDate}` : 'Sélectionnez une date'}
                </span>

                {!selectedDate ? (
                  <p className="text-xs text-neutral-400">
                    Choisissez une date sur le calendrier pour afficher les horaires disponibles.
                  </p>
                ) : loadingSlots ? (
                  <div className="py-8 flex flex-col items-center justify-center text-xs text-neutral-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Recherche des créneaux...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-neutral-400">Aucun créneau disponible pour ce jour.</p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isTaken = takenSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isTaken}
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold text-center transition cursor-pointer ${
                            isTaken
                              ? 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through cursor-not-allowed'
                              : 'bg-white border-neutral-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-800'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Étape 2 : Formulaire de contact pour valider le créneau */
            <form onSubmit={handleSubmitBooking} className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Vos coordonnées</h3>
                  <span className="text-xs text-indigo-600 font-semibold">
                    Créneau réservé : {selectedDate} à {selectedSlot}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                >
                  Changer l'horaire
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom complet <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Adresse e-mail <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="jean@exemple.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Numéro de téléphone (optionnel)
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Objet ou message pour préparer la séance (optionnel)
                </label>
                <textarea
                  rows={3}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Expliquez brièvement votre besoin ou les sujets à aborder..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Confirmation...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmer le rendez-vous</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

