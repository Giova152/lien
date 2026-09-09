'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EyeOff, Eye, ArrowRight, LayoutDashboard, Loader2 } from '@/components/ui/Icons';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UnpublishedProfileViewProps {
  isOwner: boolean;
  profileId?: string;
  username: string;
}

export function UnpublishedProfileView({ isOwner, profileId, username }: UnpublishedProfileViewProps) {
  const [republishing, setRepublishing] = useState(false);
  const supabase = createClient();

  const handleRepublish = async () => {
    if (!profileId) return;
    try {
      setRepublishing(true);
      const { error } = await supabase
        .from('profiles')
        .update({ is_published: true, updated_at: new Date().toISOString() })
        .eq('id', profileId);

      if (error) throw error;

      toast.success('🎉 Votre carte est de nouveau en ligne et accessible au public !');
      // Recharger pour afficher la carte en ligne
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la republication de la carte.');
      setRepublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center font-sans relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Logo */}
      <div className="mb-6 sm:mb-8 relative z-10">
        <Logo href="/" size="md" />
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-7 sm:p-9 shadow-2xl relative z-10 flex flex-col items-center">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 shadow-xs">
          <EyeOff className="w-8 h-8" />
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Carte Masquée
        </span>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-white mb-2.5 tracking-tight">
          {isOwner ? 'Votre carte est masquée au public' : 'Cette carte est actuellement masquée'}
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed max-w-sm">
          {isOwner
            ? "Vous avez choisi de masquer votre carte. Le lien public n'affiche aucun contenu tant que vous ne la remettez pas en ligne."
            : "Le propriétaire a temporairement désactivé la visibilité publique de sa carte de visite."}
        </p>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          {isOwner ? (
            <>
              <button
                type="button"
                onClick={handleRepublish}
                disabled={republishing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {republishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Remettre ma carte en ligne</span>
                  </>
                )}
              </button>

              <Link
                href="/dashboard"
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/70 text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                <span>Aller au tableau de bord</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>Retour à l&apos;accueil</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/70 text-neutral-300 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <span>Créer ma propre carte</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <p className="text-[11px] text-neutral-600 mt-6 relative z-10">
        Propulsé par <span className="text-neutral-400 font-semibold">Lien-Bio</span>
      </p>
    </div>
  );
}

