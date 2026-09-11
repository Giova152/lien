'use client';

import React, { useState, useEffect } from 'react';
import { Profile, TeamMember, TeamRole } from '@/types';
import {
  X,
  Copy,
  Mail,
  Users,
  Send,
  Loader2,
  Trash2,
  CheckCircle2,
  Shield,
  Crown,
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
  // Collaborator Invite Form state
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<TeamRole>('assistant');
  const [isInviting, setIsInviting] = useState(false);
  const [lastInviteInfo, setLastInviteInfo] = useState<{
    email: string;
    acceptUrl: string;
    mailtoUrl?: string;
    emailSent?: boolean;
  } | null>(null);

  // Team list state
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

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

  // Renvoyer l'invitation à un membre existant
  const handleResendInvite = async (member: TeamMember) => {
    try {
      setResendingId(member.id);
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: member.member_email,
          role: member.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du renvoi de l’e-mail');
      }

      setLastInviteInfo({
        email: member.member_email,
        acceptUrl: data.acceptUrl || `${origin}/login?collab=${encodeURIComponent(profile?.username || '')}`,
        mailtoUrl: data.mailtoUrl,
        emailSent: data.emailSent,
      });

      toast.success(data.message || `E-mail d’invitation réexpédié avec succès à ${member.member_email} !`);
      await fetchTeamMembers();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de renvoyer l’invitation');
    } finally {
      setResendingId(null);
    }
  };

  // Envoi de l'invitation collaborateur (Assistant / Admin)
  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = memberEmail.trim();
    if (!targetEmail) {
      toast.error('Veuillez renseigner l’adresse e-mail du collaborateur');
      return;
    }

    try {
      setIsInviting(true);
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          role: memberRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’invitation');
      }

      setLastInviteInfo({
        email: targetEmail,
        acceptUrl: data.acceptUrl || `${origin}/login?collab=${encodeURIComponent(profile?.username || '')}`,
        mailtoUrl: data.mailtoUrl,
        emailSent: data.emailSent,
      });

      toast.success(data.message || 'Collaborateur ajouté avec succès !');
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
        <div className="p-5 pb-4 border-b border-neutral-100 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-neutral-950 tracking-tight leading-snug">
                  Équipe & Collaborateurs
                </h2>
                {members.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200/60">
                    {members.length} {members.length === 1 ? 'membre' : 'membres'}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                Déléguez la gestion de votre carte à un assistant ou co-administrateur.
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

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
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
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Assistant */}
                      <button
                        type="button"
                        onClick={() => setMemberRole('assistant')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          memberRole === 'assistant'
                            ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-600/10 shadow-xs'
                            : 'bg-white border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Shield className={`w-3.5 h-3.5 ${memberRole === 'assistant' ? 'text-indigo-600' : 'text-neutral-500'}`} />
                            <span className="text-xs font-bold text-neutral-900">
                              Assistant(e)
                            </span>
                          </div>
                          {memberRole === 'assistant' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10.5px] text-neutral-500 leading-normal">
                          Gère les liens, contacts, bio et services de votre carte.
                        </p>
                      </button>

                      {/* Co-Administrateur */}
                      <button
                        type="button"
                        onClick={() => setMemberRole('admin')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          memberRole === 'admin'
                            ? 'bg-amber-50/50 border-amber-600 ring-2 ring-amber-600/10 shadow-xs'
                            : 'bg-white border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Crown className={`w-3.5 h-3.5 ${memberRole === 'admin' ? 'text-amber-600' : 'text-neutral-500'}`} />
                            <span className="text-xs font-bold text-neutral-900">
                              Co-Admin
                            </span>
                          </div>
                          {memberRole === 'admin' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10.5px] text-neutral-500 leading-normal">
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

              {/* Banner / Card for newly invited collaborator */}
              {lastInviteInfo && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-3 animate-fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Invitation enregistrée pour {lastInviteInfo.email}</span>
                      </span>
                      <p className="text-[11px] text-indigo-700 mt-0.5 leading-relaxed">
                        Transmettez-lui directement le lien ci-dessous pour qu&apos;il puisse accéder et gérer votre carte :
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLastInviteInfo(null)}
                      className="text-indigo-400 hover:text-indigo-700 text-xs font-bold p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(lastInviteInfo.acceptUrl);
                        toast.success('Lien d’accès copié ! Envoyer-le par WhatsApp ou message.');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le lien d&apos;accès</span>
                    </button>

                    {lastInviteInfo.mailtoUrl && (
                      <a
                        href={lastInviteInfo.mailtoUrl}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-100/60 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Ouvrir mon application E-mail</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

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
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                  member.role === 'admin'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200/60'
                                }`}
                              >
                                {member.role === 'admin' ? (
                                  <>
                                    <Crown className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span>Administrateur</span>
                                  </>
                                ) : (
                                  <>
                                    <Shield className="w-3 h-3 text-indigo-600 shrink-0" />
                                    <span>Assistant</span>
                                  </>
                                )}
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Renvoyer l'e-mail */}
                          <button
                            type="button"
                            onClick={() => handleResendInvite(member)}
                            disabled={resendingId === member.id}
                            className="px-2.5 py-1 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Renvoyer l'e-mail d'invitation officiel"
                          >
                            {resendingId === member.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                            ) : (
                              <Mail className="w-3 h-3 text-indigo-600" />
                            )}
                            <span className="hidden sm:inline">
                              {resendingId === member.id ? 'Envoi...' : 'Renvoyer e-mail'}
                            </span>
                          </button>

                          {/* Copier lien direct */}
                          <button
                            type="button"
                            onClick={() => {
                              const acceptUrl = `${origin}/login?collab=${encodeURIComponent(profile?.username || '')}`;
                              navigator.clipboard.writeText(acceptUrl);
                              toast.success('Lien d’accès copié ! Transmettez-le à votre collaborateur.');
                            }}
                            className="px-2.5 py-1 rounded-lg text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            title="Copier le lien d'accès direct"
                          >
                            <Copy className="w-3 h-3 text-neutral-500" />
                            <span className="hidden sm:inline">Lien d&apos;accès</span>
                          </button>

                          {/* Supprimer / Révoquer */}
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
        </div>
      </div>
    </div>
  );
}
