'use client';

import React, { useState, useEffect } from 'react';
import { Profile, TeamMember, TeamRole } from '@/types';
import {
  X,
  Copy,
  Check,
  Mail,
  UserPlus,
  Users,
  Send,
  Loader2,
  Share2,
  WhatsappIcon,
  LinkIcon,
  ShieldCheck,
  Trash2,
  Crown,
  Clock,
  CheckCircle2,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onTeamUpdated?: () => void;
}

export function TeamManagementModal({
  isOpen,
  onClose,
  profile,
  onTeamUpdated,
}: TeamManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'referral'>('team');
  const [copied, setCopied] = useState(false);

  // Collaborator Invite Form state
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<TeamRole>('assistant');
  const [isInviting, setIsInviting] = useState(false);

  // Team list state
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchTeamMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      // Ignorer silencieusement
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://www.lien-bio.site';

  const refCode = profile?.username || 'lien';
  const inviteUrl = `${origin}/register?ref=${encodeURIComponent(refCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Lien copié dans le presse-papier !');
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
        toast.success('Lien partagé !');
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Salut ! Je te recommande Lien-Bio pour créer ta propre carte de visite digitale professionnelle et regrouper tous tes liens au même endroit : ${inviteUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const emailSubject = encodeURIComponent('Invitation à créer ta carte digitale sur Lien-Bio');
  const emailBody = encodeURIComponent(
    `Bonjour,\n\nJe t'invite à découvrir Lien-Bio pour créer ta propre carte de visite digitale professionnelle et regrouper tous tes liens au même endroit :\n\n${inviteUrl}\n\nÀ très vite !`
  );
  const mailtoUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  // Envoi de l'invitation collaborateur (Assistant / Admin)
  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      toast.error('Veuillez renseigner l’adresse e-mail du collaborateur');
      return;
    }

    try {
      setIsInviting(true);
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: memberEmail.trim(),
          role: memberRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’invitation');
      }

      toast.success(data.message || 'Collaborateur invité avec succès ! 🎉');
      setMemberEmail('');
      setMemberRole('assistant');
      await fetchTeamMembers();
      if (onTeamUpdated) onTeamUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Impossible d’inviter le collaborateur pour le moment');
    } finally {
      setIsInviting(false);
    }
  };

  // Révocation d'un membre
  const handleRevokeMember = async (memberId: string, email: string) => {
    if (!confirm(`Voulez-vous vraiment retirer les accès de ${email} ?`)) {
      return;
    }

    try {
      setRevokingId(memberId);
      const res = await fetch(`/api/team?id=${encodeURIComponent(memberId)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la révocation');
      }

      toast.success('Accès révoqué avec succès.');
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      if (onTeamUpdated) onTeamUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression du membre');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200/80 overflow-hidden my-auto animate-scale-up flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="p-5 pb-3 border-b border-neutral-100 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-neutral-950 tracking-tight leading-snug">
                Équipe & Collaborateurs
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                Déléguez la gestion de votre carte à un assistant ou partagez votre lien.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition shrink-0 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-neutral-100 flex items-center gap-2 shrink-0 bg-neutral-50/60">
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'team'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Membres & Assistants</span>
            {members.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200/60">
                {members.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('referral')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'referral'
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Parrainage d&apos;amis</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === 'team' ? (
            <>
              {/* Formulaire d'invitation d'un collaborateur */}
              <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    +
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Inviter un nouveau collaborateur
                  </h3>
                </div>

                <form onSubmit={handleInviteCollaborator} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      Adresse e-mail du collaborateur
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="assistant@mon-entreprise.com"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:border-neutral-950 shadow-2xs transition"
                      />
                    </div>
                  </div>

                  {/* Choix du Rôle */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">
                      Rôle et niveau d&apos;accès
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Assistant */}
                      <button
                        type="button"
                        onClick={() => setMemberRole('assistant')}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          memberRole === 'assistant'
                            ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/10 shadow-xs'
                            : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            🛡️ Assistant(e)
                          </span>
                          {memberRole === 'assistant' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 leading-tight">
                          Gère les liens, contacts, bio et services de votre carte.
                        </p>
                      </button>

                      {/* Co-Administrateur */}
                      <button
                        type="button"
                        onClick={() => setMemberRole('admin')}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          memberRole === 'admin'
                            ? 'bg-white border-amber-600 ring-2 ring-amber-600/10 shadow-xs'
                            : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            👑 Co-Admin
                          </span>
                          {memberRole === 'admin' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 leading-tight">
                          Gestion complète de la carte (sauf facturation et compte).
                        </p>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isInviting || !memberEmail.trim()}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs active:scale-[0.99] ${
                      memberEmail.trim()
                        ? 'bg-neutral-950 hover:bg-neutral-900 text-white cursor-pointer'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Envoi de l&apos;invitation d&apos;équipe...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Inviter le collaborateur</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Liste des membres actuels */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Membres actuels de votre carte ({members.length})
                  </h3>
                  {loadingMembers && (
                    <Loader2 className="w-3 h-3 text-neutral-400 animate-spin" />
                  )}
                </div>

                {members.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-neutral-200 text-center bg-neutral-50/50">
                    <p className="text-xs font-semibold text-neutral-700 mb-0.5">
                      Aucun collaborateur pour le moment
                    </p>
                    <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                      Invitez votre premier assistant ci-dessus pour qu&apos;il puisse vous aider à gérer votre présence digitale.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50/60 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center shrink-0 border border-neutral-200">
                            {member.member_email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 truncate">
                              {member.member_email}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {/* Rôle */}
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  member.role === 'admin'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200/60'
                                }`}
                              >
                                {member.role === 'admin' ? '👑 Administrateur' : '🛡️ Assistant'}
                              </span>

                              {/* Statut */}
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                                  member.status === 'accepted'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    member.status === 'accepted'
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500 animate-pulse'
                                  }`}
                                />
                                {member.status === 'accepted' ? 'Actif' : 'En attente'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const acceptUrl = `${origin}/login?collab=${encodeURIComponent(profile?.username || '')}`;
                              navigator.clipboard.writeText(acceptUrl);
                              toast.success('Lien d’accès copié ! Transmettez-le à votre collaborateur.');
                            }}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="Copier le lien d'accès collaborateur"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRevokeMember(member.id, member.member_email)}
                            disabled={revokingId === member.id}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Révoquer les accès de ce collaborateur"
                          >
                            {revokingId === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Onglet Parrainage */
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Votre lien personnel de recommandation
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
                        : 'bg-neutral-950 hover:bg-neutral-900 text-white active:scale-95 cursor-pointer'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
                  Partager directement avec des proches
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200/90 text-neutral-800 text-xs font-semibold transition hover:border-neutral-300 shadow-2xs group active:scale-95"
                  >
                    <WhatsappIcon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition shrink-0" />
                    <span className="truncate">WhatsApp</span>
                  </a>

                  <a
                    href={mailtoUrl}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200/90 text-neutral-800 text-xs font-semibold transition hover:border-neutral-300 shadow-2xs group active:scale-95"
                  >
                    <Mail className="w-4 h-4 text-neutral-700 group-hover:scale-110 transition shrink-0" />
                    <span className="truncate">Email</span>
                  </a>

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

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                <p className="text-xs font-bold text-amber-900 mb-0.5">
                  💡 Différence entre Collaborateur et Parrainage
                </p>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  • Utilisez l&apos;onglet <strong>Membres & Assistants</strong> pour autoriser quelqu&apos;un à gérer votre propre carte.<br />
                  • Utilisez ce lien de <strong>Parrainage</strong> pour qu&apos;un ami crée sa propre carte indépendante.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
