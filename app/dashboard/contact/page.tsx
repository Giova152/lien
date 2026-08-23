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
  MessageCircle,
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

      toast.success('Informations de contact sauvegardées !');
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
          <PhoneCall className="w-5 h-5 text-indigo-600" />
          Coordonnées de Contact & Affichage
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Ces informations s'afficheront sous forme de boutons d'action rapide sur votre page publique
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/80 rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
        {/* Phone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Numéro de Téléphone Pro
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="+33 6 12 34 56 78"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, phone: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Numéro WhatsApp
          </label>
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="+229 90 65 26 47"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, whatsapp: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Email de Contact
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="contact@entreprise.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, email: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Adresse Physique / Bureau
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="123 Rue du Commerce, Cotonou"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, address: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
            Site Web Officiel
          </label>
          <div className="relative">
            <Globe className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="https://votre-site.com"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, website: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>Sauvegarder les coordonnées</span>
        </button>
      </form>
    </div>
  );
}
