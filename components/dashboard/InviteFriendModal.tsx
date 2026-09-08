'use client';

import React, { useState } from 'react';
import { Profile } from '@/types';
import {
  X,
  Copy,
  Check,
  Mail,
  UserPlus,
  Send,
  Loader2,
  Share2,
  Sparkles,
  WhatsappIcon,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export function InviteFriendModal({ isOpen, onClose, profile }: InviteFriendModalProps) {
  const [copied, setCopied] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://lien-bio.site';

  const refCode = profile?.username || 'lien';
  const inviteUrl = `${origin}/register?ref=${encodeURIComponent(refCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Lien d’invitation copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins-moi sur Lien-Bio',
          text: `Salut ! Crée ta propre carte de visite digitale et centralise tous tes liens pro en 1 minute sur Lien-Bio :`,
          url: inviteUrl,
        });
        toast.success('Invitation partagée !');
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Salut ! Je te recommande Lien-Bio pour créer ta propre carte de visite digitale et regrouper tous tes liens pro en un seul endroit. Inscris-toi ici : ${inviteUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const emailSubject = encodeURIComponent('Rejoins-moi sur Lien-Bio (Carte de visite digitale)');
  const emailBody = encodeURIComponent(
    `Bonjour,\n\nJe t'invite à découvrir Lien-Bio pour créer ta propre carte de visite digitale professionnelle et regrouper tous tes liens, réseaux et coordonnées au même endroit :\n\n${inviteUrl}\n\nÀ très vite !`
  );
  const mailtoUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const handleSendInviteEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmail.trim()) {
      toast.error('Veuillez renseigner l’adresse e-mail de votre ami');
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: friendEmail.trim(),
          customMessage: customMessage.trim(),
          inviterName: profile?.display_name || profile?.username || 'Un ami',
          inviteUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’envoi');
      }

      toast.success(`Invitation envoyée avec succès à ${friendEmail} ! 🎉`);
      setFriendEmail('');
      setCustomMessage('');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Impossible d’envoyer l’invitation pour le moment');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200/80 overflow-hidden my-auto animate-scale-up">
        {/* Header with gradient accent */}
        <div className="relative bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white p-5 sm:p-6 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-xs"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Parrainage & Invitation</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Inviter un ami sur Lien-Bio
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 leading-relaxed max-w-sm">
            Partagez Lien-Bio avec vos contacts pour qu&apos;ils créent leur propre carte de visite digitale en 1 minute.
          </p>
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Share Link Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Votre lien personnel d&apos;invitation
            </label>
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-50 border border-neutral-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/10 transition">
              <span className="text-xs text-neutral-600 font-mono truncate flex-1 select-all">
                {inviteUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
          </div>

          {/* 2. One-click Quick Share channels */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Partager en 1 clic
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-xs font-bold transition active:scale-95"
              >
                <WhatsappIcon className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              {/* Email Client */}
              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200/80 text-sky-800 text-xs font-bold transition active:scale-95"
              >
                <Mail className="w-4 h-4 text-sky-600" />
                <span>Email</span>
              </a>

              {/* Native Mobile Share */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-bold transition active:scale-95"
              >
                <Share2 className="w-4 h-4 text-neutral-700" />
                <span>Plus d&apos;options</span>
              </button>
            </div>
          </div>

          {/* 3. Direct Email Invitation Form */}
          <div className="pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Ou envoyer une invitation par e-mail directement
              </h3>
            </div>

            <form onSubmit={handleSendInviteEmail} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  placeholder="Adresse e-mail de votre ami(e) (ex: ami@gmail.com)"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-neutral-200 text-neutral-900 text-xs placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  placeholder="Message personnel (facultatif) : Ex: Viens voir ma carte Lien-Bio !"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-200 text-neutral-900 text-xs placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !friendEmail}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50 active:scale-[0.99]"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer l&apos;invitation</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <div className="bg-slate-50 px-6 py-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Lien-Bio • Partage & Recommandation</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-neutral-600 hover:text-neutral-900 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

