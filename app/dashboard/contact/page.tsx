'use client';

import React, { useState, useEffect } from 'react';
import { ContactInfo } from '@/types';
import { createClient } from '@/lib/supabase/client';
import {
  PhoneCall,
  Mail,
  MapPin,
  Globe,
  Phone,
  WhatsappIcon,
  Check,
  Loader2,
  Download,
} from '@/components/ui/Icons';
import { toast } from 'sonner';
import { useDashboard } from '@/lib/context/DashboardContext';

export default function ContactPage() {
  const { profile, contact, setContact, refreshDashboard } = useDashboard();
  const supabase = createClient();

  const [phone, setPhone] = useState(contact?.phone || '');
  const [whatsapp, setWhatsapp] = useState(contact?.whatsapp || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [address, setAddress] = useState(contact?.address || '');
  const [website, setWebsite] = useState(contact?.website || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setPhone(contact.phone || '');
      setWhatsapp(contact.whatsapp || '');
      setEmail(contact.email || '');
      setAddress(contact.address || '');
      setWebsite(contact.website || '');
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      const contactPayload: Partial<ContactInfo> = {
        profile_id: profile.id,
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        address: address.trim(),
        website: website.trim(),
        show_save_contact_button: true,
      };

      if (contact?.id) {
        const { error } = await supabase
          .from('contact_info')
          .update(contactPayload)
          .eq('id', contact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_info')
          .insert(contactPayload);

        if (error) throw error;
      }

      toast.success('Coordonnées enregistrées avec succès !');
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-neutral-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 text-neutral-900">
            <span className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <PhoneCall className="w-4 h-4" />
            </span>
            <span>Coordonnées & Contact</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl">
            Ces boutons d&apos;action directe permettent à vos visiteurs de vous appeler, vous écrire ou enregistrer votre fiche contact (vCard) en 1 clic.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold shrink-0 self-start">
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fiche vCard active</span>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col gap-6">
        
        {/* Section 1: Téléphonie & Messagerie Directe */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Communication directe
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <span>Téléphone Professionnel</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 pointer-events-none">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  placeholder="Ex: +229 97 00 00 00"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (setContact) setContact((prev) => (prev ? { ...prev, phone: e.target.value } : prev));
                  }}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200/90 text-neutral-900 placeholder:text-neutral-400 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <span>Numéro WhatsApp</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 pointer-events-none">
                  <WhatsappIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  placeholder="Ex: +229 90 00 00 00"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (setContact) setContact((prev) => (prev ? { ...prev, whatsapp: e.target.value } : prev));
                  }}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200/90 text-neutral-900 placeholder:text-neutral-400 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Email & Web */}
        <div className="pt-5 border-t border-neutral-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Présence numérique & Web
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <span>Email de Contact</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-7 h-7 rounded-lg bg-sky-50 border border-sky-100/80 flex items-center justify-center text-sky-600 pointer-events-none">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  placeholder="contact@exemple.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (setContact) setContact((prev) => (prev ? { ...prev, email: e.target.value } : prev));
                  }}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200/90 text-neutral-900 placeholder:text-neutral-400 text-xs font-medium focus:outline-none focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-600/10 transition-all"
                />
              </div>
            </div>

            {/* Website */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <span>Site Web Officiel</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-7 h-7 rounded-lg bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 pointer-events-none">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <input
                  type="url"
                  placeholder="https://votre-site.com"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    if (setContact) setContact((prev) => (prev ? { ...prev, website: e.target.value } : prev));
                  }}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200/90 text-neutral-900 placeholder:text-neutral-400 text-xs font-medium focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Adresse physique */}
        <div className="pt-5 border-t border-neutral-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Localisation & Bureau
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <span>Adresse Physique / Ville</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-7 h-7 rounded-lg bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-600 pointer-events-none">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Ex: 123 Boulevard Saint-Michel, Paris / Cotonou"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (setContact) setContact((prev) => (prev ? { ...prev, address: e.target.value } : prev));
                }}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-50 border border-neutral-200/90 text-neutral-900 placeholder:text-neutral-400 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action bar at the bottom */}
        <div className="pt-5 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Mise à jour synchronisée en direct sur votre page</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Enregistrer les coordonnées</span>
          </button>
        </div>
      </form>
    </div>
  );
}
