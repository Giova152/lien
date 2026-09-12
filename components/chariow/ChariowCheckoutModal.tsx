'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from '@/components/ui/Icons';
import {
  CHARIOW_STORE_DOMAIN,
  getChariowProductDetails,
} from '@/lib/chariow-constants';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ChariowCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  userEmail?: string | null;
  onSuccess?: () => void;
  planTitle?: string;
}

export function ChariowCheckoutModal({
  isOpen,
  onClose,
  productId,
  userEmail: initialUserEmail,
  onSuccess,
  planTitle,
}: ChariowCheckoutModalProps) {
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail || null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const productDetails = React.useMemo(() => {
    return getChariowProductDetails(productId);
  }, [productId]);

  // URL directe de la boutique Chariow (SANS le préfixe /widget/ qui provoquait l'erreur interne de Chariow)
  const checkoutUrl = React.useMemo(() => {
    if (!productId) return '';
    const params = new URLSearchParams({
      primary_color: '#4f39f6',
      locale: 'fr',
    });

    if (userEmail && userEmail.trim()) {
      params.set('chw_email', userEmail.trim());
    }

    return `https://${CHARIOW_STORE_DOMAIN}/${productId}?${params.toString()}`;
  }, [productId, userEmail]);

  // Récupérer l'email connecté si non fourni
  useEffect(() => {
    if (initialUserEmail) {
      setUserEmail(initialUserEmail);
      return;
    }
    if (!isOpen) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    }).catch(() => {});
  }, [initialUserEmail, isOpen]);

  // Vérification automatique en arrière-plan du statut PRO dès que l'utilisateur paie
  const checkProStatus = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro, plan')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.is_pro) {
        setSuccess(true);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        toast.success('🎉 Paiement validé avec succès ! Votre formule PRO est désormais active.');
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          onClose();
          window.location.href = `/dashboard?payment=success&provider=chariow&plan=${productDetails.key}`;
        }, 2000);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur vérification statut PRO:', err);
      return false;
    }
  }, [onClose, onSuccess, productDetails.key]);

  // Écouteur postMessage et démarrage du polling
  useEffect(() => {
    if (!isOpen) return;

    // Timeout de sécurité pour retirer le spinner après chargement
    const loadTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    // Polling toutes les 3s pour détecter l'activation automatique en temps réel
    pollIntervalRef.current = setInterval(() => {
      checkProStatus();
    }, 3000);

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      // Détection fin de chargement
      if (
        event.data.type === 'chariow-iframe-height' ||
        event.data.type === 'chariow-checkout-loaded' ||
        event.data.type === 'chariow-ready'
      ) {
        setLoading(false);
      }

      // Détection de paiement réussi
      if (
        event.data.eventType === 'PAYMENT_SUCCESSFUL' ||
        event.data.type === 'chariow-purchase-completed'
      ) {
        checkProStatus();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      clearTimeout(loadTimer);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, checkProStatus]);

  // Bloquer le défilement d'arrière-plan quand la fenêtre est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setLoading(true);
      setSuccess(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !productId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[92vh] max-h-[820px] shadow-2xl border border-neutral-200 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header de la fenêtre modale */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-neutral-900 block leading-tight truncate">
                {planTitle || productDetails.title} ({productDetails.price})
              </span>
              <span className="text-[10.5px] text-neutral-500 font-medium truncate block">
                Paiement Sécurisé Chariow • Carte & Mobile Money
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Bouton pour ouvrir en grand si l'utilisateur le souhaite */}
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70 border border-neutral-200 text-[11px] font-semibold flex items-center gap-1 transition"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-3 h-3 text-neutral-500" />
              <span className="hidden sm:inline">Plein écran</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corps de la fenêtre avec l'iframe Chariow intégrée */}
        <div className="relative flex-1 w-full bg-slate-50 overflow-y-auto overscroll-contain">
          {loading && !success && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-neutral-500">
                Chargement sécurisé du terminal Chariow...
              </p>
            </div>
          )}

          {success && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-white animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-1">
                Paiement validé avec succès !
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                Votre compte a été activé avec la formule PRO. Actualisation en cours...
              </p>
            </div>
          )}

          <iframe
            src={checkoutUrl}
            title="Paiement Sécurisé Chariow"
            className="w-full h-full min-h-[520px] border-0 block"
            loading="eager"
            allow="payment; camera; microphone; geolocation; clipboard-write"
            onLoad={() => setLoading(false)}
          />
        </div>

        {/* Footer info de sécurité */}
        <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-center shrink-0 flex items-center justify-between text-[10px] text-neutral-400">
          <span>🔒 Transaction chiffrée SSL 256-bit</span>
          <span className="hidden sm:inline">Paiement certifié Chariow</span>
        </div>
      </div>
    </div>
  );
}
