'use client';

import React, { useState, useEffect } from 'react';
import { Profile, ServiceItem, BookingAvailability } from '@/types';
import { Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, X, ChevronRight, ChevronLeft, Loader2 } from '@/components/ui/Icons';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  service: ServiceItem;
  accentColor?: string;
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

const DAY_NAMES_FR: Record<string, string> = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mer',
  thu: 'Jeu',
  fri: 'Ven',
  sat: 'Sam',
  sun: 'Dim',
};

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayName = d.toLocaleDateString('fr-FR', { weekday: 'long' });
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  return `${capitalizedDay} ${day} ${MONTH_NAMES_FR[month - 1]} ${year}`;
}

export function BookingModal({
  isOpen,
  onClose,
  profile,
  service,
  accentColor = '#4F46E5',
}: BookingModalProps) {
  const [step, setStep] = useState<'datetime' | 'form' | 'success'>('datetime');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // Client Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Taken slots & Loading
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Default availability settings
  const availability: BookingAvailability = profile.theme?.booking_availability || {
    enabled_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_time: '09:00',
    end_time: '18:00',
    slot_duration: service.duration_minutes || 30,
    break_start: '12:00',
    break_end: '14:00',
  };

  // Generate next 14 available calendar days starting from today
  const availableDaysList = React.useMemo(() => {
    const list: { dateStr: string; dayNum: number; dayNameFr: string; isEnabled: boolean }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayCode = DAYS_MAP[d.getDay()];
      const isEnabled = availability.enabled_days.includes(dayCode);
      
      list.push({
        dateStr,
        dayNum: d.getDate(),
        dayNameFr: DAY_NAMES_FR[dayCode] || 'Jour',
        isEnabled,
      });
    }
    return list;
  }, [availability.enabled_days]);

  // Set default selected date on open
  useEffect(() => {
    if (isOpen) {
      const firstEnabled = availableDaysList.find((d) => d.isEnabled);
      if (firstEnabled) {
        setSelectedDate(firstEnabled.dateStr);
      }
      setSelectedSlot('');
      setStep('datetime');
      setErrorMessage('');
    }
  }, [isOpen, availableDaysList]);

  // Fetch taken slots when date changes
  useEffect(() => {
    if (!isOpen || !selectedDate || !profile.id) return;

    let isMounted = true;
    setLoadingSlots(true);
    fetch(`/api/appointments?profileId=${profile.id}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data?.takenSlots) {
            const slots = data.takenSlots.map((ts: any) => ts.time_slot);
            setTakenSlots(slots);
          } else {
            setTakenSlots([]);
          }
          setLoadingSlots(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching taken slots:', err);
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedDate, profile.id]);

  // Generate available time slots based on availability settings & service duration
  const generatedSlots = React.useMemo(() => {
    if (!selectedDate) return [];

    const slots: string[] = [];
    const duration = service.duration_minutes || availability.slot_duration || 30;

    const [startH, startM] = availability.start_time.split(':').map(Number);
    const [endH, endM] = availability.end_time.split(':').map(Number);

    let startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let breakStartM = -1;
    let breakEndM = -1;
    if (availability.break_start && availability.break_end) {
      const [bsH, bsM] = availability.break_start.split(':').map(Number);
      const [beH, beM] = availability.break_end.split(':').map(Number);
      breakStartM = bsH * 60 + bsM;
      breakEndM = beH * 60 + beM;
    }

    while (startMinutes + duration <= endMinutes) {
      // Check if slot falls in lunch break
      const slotEndMinutes = startMinutes + duration;
      const overlapsBreak =
        breakStartM >= 0 &&
        breakEndM >= 0 &&
        startMinutes < breakEndM &&
        slotEndMinutes > breakStartM;

      if (!overlapsBreak) {
        const hh = String(Math.floor(startMinutes / 60)).padStart(2, '0');
        const mm = String(startMinutes % 60).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }

      startMinutes += duration;
    }

    return slots;
  }, [selectedDate, availability, service.duration_minutes]);

  if (!isOpen) return null;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      setErrorMessage('Veuillez sélectionner une date et un créneau horaire.');
      return;
    }
    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorMessage('Veuillez remplir votre nom et votre adresse email.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          serviceId: service.id,
          serviceTitle: service.title,
          clientName,
          clientEmail,
          clientPhone,
          date: selectedDate,
          timeSlot: selectedSlot,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la réservation.');
      }

      setStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d’effectuer la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-900 text-white border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-start justify-between bg-zinc-950/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: accentColor }}
              >
                Réservation Natif
              </span>
              {(service.duration_minutes || availability.slot_duration) && (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {service.duration_minutes || availability.slot_duration} min
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-white leading-snug">{service.title}</h3>
            {service.price && (
              <p className="text-xs font-bold text-emerald-400 mt-0.5">{service.price}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-full transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: DATE & SLOT SELECTION */}
          {step === 'datetime' && (
            <div className="space-y-5">
              {/* 1. Date Strip */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  1. Choisissez une date :
                </label>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {availableDaysList.map((item) => {
                    const isSelected = selectedDate === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        type="button"
                        disabled={!item.isEnabled}
                        onClick={() => {
                          setSelectedDate(item.dateStr);
                          setSelectedSlot('');
                        }}
                        className={`flex flex-col items-center justify-center min-w-[58px] py-2.5 px-2 rounded-2xl border transition-all ${
                          !item.isEnabled
                            ? 'opacity-30 border-zinc-800 bg-zinc-900/40 cursor-not-allowed'
                            : isSelected
                            ? 'border-transparent text-white shadow-lg scale-[1.03]'
                            : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 text-zinc-300'
                        }`}
                        style={{
                          backgroundColor: isSelected ? accentColor : undefined,
                        }}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                          {item.dayNameFr}
                        </span>
                        <span className="text-base font-black mt-0.5">{item.dayNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Slot Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  2. Choisissez un créneau horaire ({formatDisplayDate(selectedDate)}) :
                </label>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8 text-zinc-400 text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    Chargement des créneaux disponibles...
                  </div>
                ) : generatedSlots.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center text-xs text-zinc-400">
                    Aucun créneau disponible pour cette date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {generatedSlots.map((slot) => {
                      const isTaken = takenSlots.includes(slot);
                      const isSelected = selectedSlot === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isTaken}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                            isTaken
                              ? 'line-through opacity-30 border-zinc-800 bg-zinc-950/40 text-zinc-500 cursor-not-allowed'
                              : isSelected
                              ? 'border-transparent text-white shadow-md'
                              : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 text-zinc-200'
                          }`}
                          style={{
                            backgroundColor: isSelected ? accentColor : undefined,
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedDate || !selectedSlot}
                  onClick={() => setStep('form')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition"
                  style={{ backgroundColor: accentColor }}
                >
                  <span>Continuer et saisir mes coordonnées</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CLIENT INFORMATION FORM */}
          {step === 'form' && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-xs space-y-1">
                <div className="text-zinc-400 font-medium">Récapitulatif :</div>
                <div className="text-white font-bold flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {formatDisplayDate(selectedDate)} à {selectedSlot}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean Dupont"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  Adresse e-mail *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: jean.dupont@gmail.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  Téléphone (Facultatif)
                </label>
                <input
                  type="tel"
                  placeholder="Ex: +33 6 12 34 56 78"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  Notes ou sujet de la rencontre (Facultatif)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Discussion concernant l'offre coaching 3 mois..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('datetime')}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </button>

                <button
                  type="submit"
                  disabled={submitting || !clientName.trim() || !clientEmail.trim()}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition"
                  style={{ backgroundColor: accentColor }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirmation en cours...</span>
                    </>
                  ) : (
                    <span>Confirmer le rendez-vous</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-white">Réservation confirmée !</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Votre rendez-vous a bien été enregistré. Un email de confirmation vous a été envoyé à <strong className="text-white">{clientEmail}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between text-zinc-400">
                  <span>Service :</span>
                  <span className="font-bold text-white">{service.title}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Date :</span>
                  <span className="font-bold text-white">{formatDisplayDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Heure :</span>
                  <span className="font-bold text-white">{selectedSlot}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Avec :</span>
                  <span className="font-bold text-white">{profile.display_name || profile.username}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl font-bold text-xs text-white shadow-md transition"
                  style={{ backgroundColor: accentColor }}
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

