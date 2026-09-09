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
  WhatsappIcon,
  LinkIcon,
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
    toast.success('Lien d’invitation copié dans le presse-papier !');
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
    `Salut ! Je te recommande Lien-Bio pour créer ta propre carte de visite digitale professionnelle et regrouper tous tes liens au même endroit. Découvre la plateforme ici : ${inviteUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const emailSubject = encodeURIComponent('Invitation à créer ta carte de visite digitale sur Lien-Bio');
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200/80 overflow-hidden my-auto animate-scale-up"
      >
        {/* Top bar with refined header */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center shadow-xs shrink-0">
              <UserPlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/70">
                  Parrainage
                </span>
                <span className="text-[10px] font-medium text-neutral-400">1-Clic</span>
              </div>
              <h2 className="text-lg font-black text-neutral-950 tracking-tight leading-snug">
                Inviter un ami sur Lien-Bio
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                Partagez votre lien de recommandation ou envoyez une invitation directe par e-mail.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* 1. Share Link Box */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Votre lien personnel d&apos;invitation
            </label>
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-neutral-50 border border-neutral-200 focus-within:border-neutral-900 focus-within:bg-white transition shadow-2xs">
              <LinkIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="text-xs text-neutral-700 font-mono truncate flex-1 select-all">
                {inviteUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-950 hover:bg-neutral-900 text-white active:scale-95'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
          </div>

          {/* 2. One-click Quick Share channels (Cohesive Modern Cards) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Partager directement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200/90 text-neutral-800 text-xs font-semibold transition hover:border-neutral-300 shadow-2xs group active:scale-95"
              >
                <WhatsappIcon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition shrink-0" />
                <span className="truncate">WhatsApp</span>
              </a>

              {/* Email Client */}
              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200/90 text-neutral-800 text-xs font-semibold transition hover:border-neutral-300 shadow-2xs group active:scale-95"
              >
                <Mail className="w-4 h-4 text-neutral-700 group-hover:scale-110 transition shrink-0" />
                <span className="truncate">Email</span>
              </a>

              {/* Native Mobile Share */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200/90 text-neutral-800 text-xs font-semibold transition hover:border-neutral-300 shadow-2xs group active:scale-95"
              >
                <Share2 className="w-4 h-4 text-neutral-700 group-hover:scale-110 transition shrink-0" />
                <span className="truncate">Partager</span>
              </button>
            </div>
          </div>

          {/* 3. Direct Email Invitation Form */}
          <div className="pt-2">
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-neutral-100 w-full" />
              <span className="bg-white px-3 text-[10px] text-neutral-400 font-bold uppercase tracking-wider whitespace-nowrap">
                Ou envoyer par e-mail
              </span>
              <div className="border-t border-neutral-100 w-full" />
            </div>

            <form onSubmit={handleSendInviteEmail} className="space-y-3">
              <div>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="Adresse e-mail de votre ami(e)"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 shadow-2xs transition"
                  />
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  placeholder="Message personnalisé (optionnel) : Ex: Viens découvrir ma carte digitale !"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 shadow-2xs transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !friendEmail.trim()}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-2xs active:scale-[0.99] ${
                  friendEmail.trim()
                    ? 'bg-neutral-950 hover:bg-neutral-900 text-white cursor-pointer'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200/60'
                }`}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Envoi de l&apos;invitation en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{friendEmail.trim() ? "Envoyer l'invitation" : "Renseigner un e-mail pour inviter"}</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-center text-neutral-400 mt-3">
              Un e-mail élégant aux couleurs de Lien-Bio sera envoyé avec votre lien.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

