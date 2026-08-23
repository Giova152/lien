'use client';

import React, { useState, useEffect } from 'react';
import { ContactInfo, Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import {
  PhoneCall,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Globe,
  Download,
  Check,
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
  const [showVCard, setShowVCard] = useState(contact?.show_save_contact_button ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setPhone(contact.phone || '');
      setWhatsapp(contact.whatsapp || '');
      setEmail(contact.email || '');
      setAddress(contact.address || '');
      setWebsite(contact.website || '');
      setShowVCard(contact.show_save_contact_button ?? true);
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      const contactPayload = {
        profile_id: profile.id,
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        website: website.trim() || null,
        show_save_contact_button: showVCard,
      };

      const { data, error } = await supabase
        .from('contact_info')
        .upsert(contactPayload, { onConflict: 'profile_id' })
        .select('*')
        .single();

      if (error) throw error;

      if (setContact && data) {
        setContact(data);
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
    <div className="w-full flex flex-col gap-6 text-white">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-indigo-400" />
          Coordonnées de Contact & vCard
        </h2>
        <p className="text-xs text-neutral-400">
          Ces informations permettront de générer le fichier vCard téléchargeable
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-5">
        {/* Toggle vCard button */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-800 border border-neutral-700">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-sm font-semibold text-white block">
                Bouton "Enregistrer le contact"
              </span>
              <span className="text-xs text-neutral-400 block">
                Affiche le bouton de téléchargement du fichier vCard (.vcf)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextVal = !showVCard;
              setShowVCard(nextVal);
              if (setContact) setContact((prev) => (prev ? { ...prev, show_save_contact_button: nextVal } : prev));
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              showVCard ? 'bg-indigo-600' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                showVCard ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Numéro de Téléphone Pro
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="+33 6 12 34 56 78"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, phone: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Numéro WhatsApp
          </label>
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="+33 6 12 34 56 78"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, whatsapp: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Email de Contact
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="contact@entreprise.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, email: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Adresse physique / Bureau
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="12 Champs-Élysées, 75008 Paris"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, address: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Site Web Officiel
          </label>
          <div className="relative">
            <Globe className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="https://votre-site.com"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                if (setContact) setContact((prev) => (prev ? { ...prev, website: e.target.value } : prev));
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg mt-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder les coordonnées'}
        </button>
      </form>
    </div>
  );
}
