'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Profile, ServiceItem, BookingAvailability, LocationType, AppointmentBooking } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  Copy,
  ExternalLink,
  Crown,
  Layers,
  Trash2,
  Mail,
  Phone,
  Plus,
  Sparkles,
  Video,
  MapPin,
  Globe,
  DollarSign,
  ArrowRight,
  User,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from '@/components/ui/Icons';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'sonner';

interface CalendarWorkspaceClientProps {
  initialProfile: Profile;
  userEmail: string;
}

const DAYS_CONFIG: Array<{ id: string; label: string }> = [
  { id: 'mon', label: 'Lundi' },
  { id: 'tue', label: 'Mardi' },
  { id: 'wed', label: 'Mercredi' },
  { id: 'thu', label: 'Jeudi' },
  { id: 'fri', label: 'Vendredi' },
  { id: 'sat', label: 'Samedi' },
  { id: 'sun', label: 'Dimanche' },
];

const LOCATION_OPTIONS: Array<{
  id: LocationType;
  label: string;
  desc: string;
  icon: any;
  placeholder: string;
}> = [
  {
    id: 'google_meet',
    label: 'Google Meet',
    desc: 'Lien de visioconférence Google Meet',
    icon: Video,
    placeholder: 'https://meet.google.com/xxx-xxxx-xxx',
  },
  {
    id: 'zoom',
    label: 'Zoom',
    desc: 'Lien de réunion Zoom permanente',
    icon: Video,
    placeholder: 'https://zoom.us/j/1234567890',
  },
  {
    id: 'phone',
    label: 'Téléphone',
    desc: 'Vous appellerez le client ou vice-versa',
    icon: Phone,
    placeholder: "Numéro ou consigne d'appel",
  },
  {
    id: 'physical',
    label: 'En présentiel',
    desc: 'Adresse physique ou lieu du rendez-vous',
    icon: MapPin,
    placeholder: 'Ex: 12 Rue de la Paix, 75002 Paris',
  },
  {
    id: 'custom_link',
    label: 'Lien personnalisé',
    desc: 'Teams, Whereby, Discord ou autre lien',
    icon: Globe,
    placeholder: 'https://...',
  },
];

export function CalendarWorkspaceClient({ initialProfile, userEmail }: CalendarWorkspaceClientProps) {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'types' | 'appointments' | 'availability' | 'integrations'>('types');
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  const [savingTypes, setSavingTypes] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  // Types de RDV
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
            location_type: 'google_meet',
            location_details: 'https://meet.google.com/',
            is_paid: false,
          },
        ];

  const [appointmentTypes, setAppointmentTypes] = useState<ServiceItem[]>(initialServices);

  // Disponibilités générales
  const currentAvailability: BookingAvailability = profile?.theme?.booking_availability || {
    enabled_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_time: '09:00',
    end_time: '18:00',
    slot_duration: 30,
  };

  const [availability, setAvailability] = useState<BookingAvailability>(currentAvailability);

  // Modal d'annulation personnalisée
  const [cancellingAppt, setCancellingAppt] = useState<AppointmentBooking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const username = profile?.username || 'mon-profil';
  const calendarPublicUrl = `https://calendar.lien-bio.site/${username}`;
  const isPro = Boolean(profile?.is_pro);

  // Charger les rendez-vous
  React.useEffect(() => {
    if (!profile?.id) return;
    let isMounted = true;
    setLoadingAppts(true);

    fetch(`/api/appointments?profileId=${profile.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingAppts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  const handleAddAppointmentType = () => {
    if (!isPro && appointmentTypes.length >= 1) {
      toast.info('⚡ Le plan Gratuit permet 1 type de rendez-vous. Passez à PRO pour en créer en illimité !');
      return;
    }

    const newType: ServiceItem = {
      id: Date.now().toString(),
      title: 'Consultation & Accompagnement',
      subtitle: 'Séance sur-mesure pour vous aider à franchir un cap.',
      price: '50 €',
      duration_minutes: 45,
      is_native_booking: true,
      location_type: 'google_meet',
      location_details: '',
      is_paid: false,
    };

    setAppointmentTypes([...appointmentTypes, newType]);
  };

  const handleUpdateAppointmentType = (id: string, field: keyof ServiceItem, value: any) => {
    setAppointmentTypes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleToggleCustomScheduleDay = (serviceId: string, dayId: string) => {
    setAppointmentTypes((prev) =>
      prev.map((item) => {
        if (item.id !== serviceId) return item;
        const currentCustom = item.custom_availability || { ...availability };
        const exists = (currentCustom.enabled_days || []).includes(dayId);
        const updatedDays = exists
          ? currentCustom.enabled_days.filter((d) => d !== dayId)
          : [...(currentCustom.enabled_days || []), dayId];
        return {
          ...item,
          custom_availability: {
            ...currentCustom,
            enabled_days: updatedDays,
          },
        };
      })
    );
  };

  const handleUpdateCustomScheduleHours = (
    serviceId: string,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setAppointmentTypes((prev) =>
      prev.map((item) => {
        if (item.id !== serviceId) return item;
        const currentCustom = item.custom_availability || { ...availability };
        return {
          ...item,
          custom_availability: {
            ...currentCustom,
            [field]: value,
          },
        };
      })
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
      setProfile({ ...profile, theme: updatedTheme });
      toast.success('Types de rendez-vous enregistrés avec succès !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSavingTypes(false);
    }
  };

  const handleSaveAvailability = async () => {
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
      setProfile({ ...profile, theme: updatedTheme });
      toast.success('Disponibilités générales enregistrées.');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSavingAvailability(false);
    }
  };

  const confirmCancelAppointment = async () => {
    if (!cancellingAppt) return;
    setIsCancelling(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: cancellingAppt.id,
          status: 'cancelled',
          reason: cancellationReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’annulation');

      const updated = appointments.map((a) =>
        a.id === cancellingAppt.id ? { ...a, status: 'cancelled' as const } : a
      );
      setAppointments(updated);
      toast.success('Rendez-vous annulé. Les e-mails de notification ont été envoyés.');
      setCancellingAppt(null);
      setCancellationReason('');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’annulation');
    } finally {
      setIsCancelling(false);
    }
  };

  const toggleGlobalDay = (dayId: string) => {
    const exists = availability.enabled_days.includes(dayId);
    const updatedDays = exists
      ? availability.enabled_days.filter((d) => d !== dayId)
      : [...availability.enabled_days, dayId];
    setAvailability({ ...availability, enabled_days: updatedDays });
  };

  // Filtrage des rendez-vous
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredAppointments = appointments.filter((appt) => {
    if (appointmentFilter === 'cancelled') return appt.status === 'cancelled';
    if (appt.status === 'cancelled') return false;
    if (appointmentFilter === 'upcoming') return appt.date >= todayStr;
    if (appointmentFilter === 'past') return appt.date < todayStr;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 font-sans flex flex-col selection:bg-neutral-900 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-neutral-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Subdomain Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-neutral-900">
                  Calendar <span className="text-indigo-600">Pro</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-medium">
                  by Lien-Bio
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Workspace Dédié</span>
            </span>
          </div>

          {/* Right Actions: Back to Bio Dashboard + User Info */}
          <div className="flex items-center gap-3">
            {/* Quick Public Link */}
            <div className="hidden md:flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl p-1 pl-3">
              <span className="text-xs font-mono text-neutral-600 truncate max-w-[180px]">
                {calendarPublicUrl}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(calendarPublicUrl);
                  toast.success('Lien public de votre agenda copié !');
                }}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-700 rounded-lg flex items-center gap-1 transition"
                title="Copier le lien"
              >
                <Copy className="w-3 h-3 text-neutral-500" />
                <span>Copier</span>
              </button>
              <a
                href={calendarPublicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-neutral-400 hover:text-neutral-700 transition"
                title="Voir ma page publique"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Switch to Main Lien-Bio Dashboard */}
            <a
              href="https://lien-bio.site/dashboard"
              className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mon Profil Lien-Bio</span>
            </a>

            {/* Profile Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-9 h-9 rounded-xl object-cover border border-neutral-200 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                {profile.display_name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2.5 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => setActiveTab('types')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'availability'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Disponibilités Générales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Visio & Intégrations</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        
        {/* TAB 1: TYPES DE RDV */}
        {activeTab === 'types' && (
          <div className="flex flex-col gap-6">
            {/* Header Quota */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-neutral-900">Vos types de rendez-vous</h2>
                    {isPro ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                        Illimité (PRO)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
                        {appointmentTypes.length} / 1 (Gratuit)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Chaque rendez-vous dispose de son propre lien, lieu de visio, durée et tarif.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddAppointmentType}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau type de RDV</span>
                </button>
              </div>
            </div>

            {/* Event Types Cards */}
            <div className="grid grid-cols-1 gap-5">
              {appointmentTypes.map((item, idx) => {
                const itemSlug = slugify(item.title || `rdv-${idx + 1}`);
                const directLink = `https://calendar.lien-bio.site/${username}/${itemSlug}`;
                const hasCustom = Boolean(item.has_custom_availability);
                const customSched = item.custom_availability || { ...availability };

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-5 relative group transition hover:border-neutral-300"
                  >
                    {/* Card Top */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-neutral-900">
                            {item.title || `Rendez-vous #${idx + 1}`}
                          </h3>
                          <span className="text-xs text-neutral-400 font-mono">
                            /{itemSlug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(directLink);
                            toast.success(`Lien direct copié : /${itemSlug}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Copier le lien direct</span>
                        </button>

                        <a
                          href={directLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition"
                          title="Tester la page de réservation"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {appointmentTypes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAppointmentType(item.id)}
                            className="text-neutral-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                            title="Supprimer ce type de RDV"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Form Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Intitulé du rendez-vous <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateAppointmentType(item.id, 'title', e.target.value)}
                          placeholder="Ex: Appel découverte, Coaching 1-on-1..."
                          className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
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
                          <option value={60}>60 min (1 heure)</option>
                          <option value={90}>90 min (1h30)</option>
                          <option value={120}>120 min (2h)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Description / Consignes pour le client
                      </label>
                      <input
                        type="text"
                        value={item.subtitle || ''}
                        onChange={(e) => handleUpdateAppointmentType(item.id, 'subtitle', e.target.value)}
                        placeholder="Ex: Séance de cadrage par visioconférence pour analyser vos objectifs."
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-600 focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Lieu / Visio */}
                    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-indigo-600" />
                          Lieu / Modalité du rendez-vous
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          Inclus automatiquement dans les e-mails
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {LOCATION_OPTIONS.map((loc) => {
                          const Icon = loc.icon;
                          const isSelected = (item.location_type || 'google_meet') === loc.id;
                          return (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => handleUpdateAppointmentType(item.id, 'location_type', loc.id)}
                              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold ring-1 ring-indigo-200'
                                  : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Icon className="w-3.5 h-3.5" />
                                <span className="text-xs">{loc.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <input
                        type="text"
                        value={item.location_details || ''}
                        onChange={(e) =>
                          handleUpdateAppointmentType(item.id, 'location_details', e.target.value)
                        }
                        placeholder={
                          LOCATION_OPTIONS.find(
                            (l) => l.id === (item.location_type || 'google_meet')
                          )?.placeholder || 'Lien ou adresse...'
                        }
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-white focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Tarifs & Paiements */}
                    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          Tarification
                        </span>
                        <label className="text-xs font-semibold text-neutral-600 cursor-pointer flex items-center gap-2">
                          <span>Rendez-vous Payant</span>
                          <input
                            type="checkbox"
                            checked={Boolean(item.is_paid)}
                            onChange={(e) =>
                              handleUpdateAppointmentType(item.id, 'is_paid', e.target.checked)
                            }
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </label>
                      </div>

                      {item.is_paid ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                              Montant
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.price_amount || ''}
                              onChange={(e) =>
                                handleUpdateAppointmentType(
                                  item.id,
                                  'price_amount',
                                  Number(e.target.value)
                                )
                              }
                              placeholder="50"
                              className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-white font-semibold focus:outline-none focus:border-indigo-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                              Devise
                            </label>
                            <select
                              value={item.currency || 'EUR'}
                              onChange={(e) =>
                                handleUpdateAppointmentType(item.id, 'currency', e.target.value)
                              }
                              className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-white font-semibold"
                            >
                              <option value="EUR">EUR (€)</option>
                              <option value="XOF">XOF (FCFA)</option>
                              <option value="USD">USD ($)</option>
                              <option value="CAD">CAD ($)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                              Texte affiché
                            </label>
                            <input
                              type="text"
                              value={item.price || ''}
                              onChange={(e) =>
                                handleUpdateAppointmentType(item.id, 'price', e.target.value)
                              }
                              placeholder="Ex: 50 € / séance"
                              className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-white focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            value={item.price || 'Gratuit'}
                            onChange={(e) =>
                              handleUpdateAppointmentType(item.id, 'price', e.target.value)
                            }
                            placeholder="Gratuit, Offert..."
                            className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs bg-white focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      )}
                    </div>

                    {/* Horaires Spécifiques */}
                    <div className="border border-neutral-200/90 rounded-2xl p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-600" />
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">
                              Horaires spécifiques à ce rendez-vous
                            </span>
                            <span className="text-[11px] text-neutral-500">
                              {hasCustom
                                ? 'Ce créneau possède ses propres jours et horaires.'
                                : 'Suit les horaires généraux par défaut.'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !hasCustom;
                            handleUpdateAppointmentType(
                              item.id,
                              'has_custom_availability',
                              nextState
                            );
                            if (nextState && !item.custom_availability) {
                              handleUpdateAppointmentType(item.id, 'custom_availability', {
                                ...availability,
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            hasCustom
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {hasCustom ? 'Horaires spécifiques activés' : 'Personnaliser'}
                        </button>
                      </div>

                      {hasCustom && (
                        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col gap-4 animate-in fade-in duration-150">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-700 mb-2">
                              Jours autorisés
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5">
                              {DAYS_CONFIG.map((day) => {
                                const isActive = (customSched.enabled_days || []).includes(
                                  day.id
                                );
                                return (
                                  <button
                                    key={day.id}
                                    type="button"
                                    onClick={() =>
                                      handleToggleCustomScheduleDay(item.id, day.id)
                                    }
                                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                                      isActive
                                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                                        : 'bg-neutral-50 text-neutral-400 border-neutral-200 hover:border-neutral-300'
                                    }`}
                                  >
                                    {day.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                Début
                              </label>
                              <input
                                type="time"
                                value={customSched.start_time || '09:00'}
                                onChange={(e) =>
                                  handleUpdateCustomScheduleHours(
                                    item.id,
                                    'start_time',
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 rounded-xl border border-neutral-200 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                Fin
                              </label>
                              <input
                                type="time"
                                value={customSched.end_time || '18:00'}
                                onChange={(e) =>
                                  handleUpdateCustomScheduleHours(
                                    item.id,
                                    'end_time',
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 rounded-xl border border-neutral-200 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={savingTypes}
                onClick={handleSaveAppointmentTypes}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{savingTypes ? 'Enregistrement...' : 'Enregistrer mes types de rendez-vous'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: RENDEZ-VOUS REÇUS */}
        {activeTab === 'appointments' && (
          <div className="flex flex-col gap-5">
            {/* Filter bar */}
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
              <button
                type="button"
                onClick={() => setAppointmentFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  appointmentFilter === 'all'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Tous ({appointments.length})
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('upcoming')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  appointmentFilter === 'upcoming'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                À venir
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('past')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  appointmentFilter === 'past'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Passés
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('cancelled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  appointmentFilter === 'cancelled'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Annulés
              </button>
            </div>

            {loadingAppts ? (
              <div className="p-12 text-center text-xs text-neutral-400">
                Chargement des rendez-vous...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Aucun rendez-vous dans cette section</h3>
                <p className="text-xs text-neutral-500 max-w-sm mt-1">
                  Vos réservations apparaîtront ici automatiquement dès qu'un prospect choisira un créneau.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredAppointments.map((appt) => {
                  const isCancelled = appt.status === 'cancelled';
                  return (
                    <div
                      key={appt.id}
                      className={`bg-white border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-2xs ${
                        isCancelled ? 'opacity-60 border-neutral-200 bg-neutral-50/50' : 'border-neutral-200/90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 shrink-0">
                          <span className="text-[11px] font-bold uppercase">
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
                            {appt.is_paid && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Payant
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              <a href={`mailto:${appt.client_email}`} className="hover:underline">
                                {appt.client_email}
                              </a>
                            </span>
                            {appt.client_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                <a href={`tel:${appt.client_phone}`} className="hover:underline">
                                  {appt.client_phone}
                                </a>
                              </span>
                            )}
                            <span className="text-neutral-400 font-semibold">• {appt.service_title}</span>
                            {appt.location_details && (
                              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px] font-medium truncate max-w-[200px]">
                                📍 {appt.location_details}
                              </span>
                            )}
                          </div>

                          {appt.notes && (
                            <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl mt-2 border border-neutral-100">
                              « {appt.notes} »
                            </p>
                          )}
                        </div>
                      </div>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingAppt(appt);
                            setCancellationReason('');
                          }}
                          className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-neutral-600 transition cursor-pointer self-end sm:self-center"
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

        {/* TAB 3: DISPONIBILITÉS GÉNÉRALES */}
        {activeTab === 'availability' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Disponibilités générales par défaut</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Ces horaires s'appliquent automatiquement à tous vos rendez-vous qui n'ont pas d'horaires spécifiques activés.
              </p>
            </div>

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
                      onClick={() => toggleGlobalDay(day.id)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
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
                  Heure de début générale
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
                  Heure de fin générale
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
                  Durée standard par créneau
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
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{savingAvailability ? 'Enregistrement...' : 'Enregistrer mes disponibilités'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: VISIO & INTÉGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Google Meet */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-2xs">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Google Meet</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Créez une salle Google Meet permanente sur <a href="https://meet.google.com" target="_blank" className="text-indigo-600 font-semibold underline">meet.google.com</a> et collez votre lien dans vos types de rendez-vous. Vos clients recevront directement le lien pour rejoindre la réunion.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full">Prêt à l'emploi</span>
                <a href="https://meet.google.com/new" target="_blank" className="font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                  <span>Créer une salle</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Zoom */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-2xs">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Zoom Visioconférence</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Utilisez votre numéro de réunion personnel (PMI) Zoom. Renseignez votre lien permanent (ex: <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">https://zoom.us/j/votre-id</code>) dans vos prestations.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-sky-700 bg-sky-50 font-bold px-2 py-0.5 rounded-full">Prêt à l'emploi</span>
                <a href="https://zoom.us" target="_blank" className="font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                  <span>Ouvrir Zoom</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PERSONNALISÉE D'ANNULATION DU RDV */}
        {cancellingAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-neutral-200 flex flex-col gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-neutral-900">Annuler ce rendez-vous ?</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Un e-mail de confirmation d'annulation sera automatiquement envoyé à <strong>{cancellingAppt.client_name}</strong> ({cancellingAppt.client_email}).
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3.5 text-xs text-neutral-700 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Prestation :</span>
                  <span className="font-semibold text-neutral-900">{cancellingAppt.service_title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Date & heure :</span>
                  <span className="font-semibold text-neutral-900">{cancellingAppt.date} à {cancellingAppt.time_slot}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Motif de l'annulation <span className="text-neutral-400 font-normal">(facultatif, figurera dans l'e-mail)</span> :
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Ex: Imprévu, créneau indisponible..."
                  rows={2}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => {
                    setCancellingAppt(null);
                    setCancellationReason('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={confirmCancelAppointment}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? 'Annulation en cours...' : 'Confirmer l\'annulation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
