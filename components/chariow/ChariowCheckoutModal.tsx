'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2, ShieldCheck, CheckCircle2 } from '@/components/ui/Icons';
import { CHARIOW_STORE_DOMAIN, CHARIOW_PRODUCTS } from '@/lib/chariow-constants';
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
  userEmail,
  onSuccess,
  planTitle,
}: ChariowCheckoutModalProps) {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Construction de l'URL sécurisée du widget Chariow
  const checkoutUrl = React.useMemo(() => {
    if (!productId) return '';
    const params = new URLSearchParams({
      primary_color: '#4f39f6',
      background_color: '#ffffff',
      cta_animation: 'pulse_glow',
      locale: 'fr',
      border_style: 'rounded',
    });

    if (userEmail) {
      params.set('chw_email', userEmail);
    }

    return `https://${CHARIOW_STORE_DOMAIN}/widget/${productId}/checkout?${params.toString()}`;
  }, [productId, userEmail]);

  // Écouteur d'événements postMessage de Chariow
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      // 1. Déclenchement de la redirection vers la passerelle de paiement (Wave, Orange Money, 3D Secure...)
      if (
        event.data.type === 'chariow-checkout-redirect' &&
        typeof event.data.url === 'string'
      ) {
        try {
          const targetUrl = new URL(event.data.url);
          if (targetUrl.protocol === 'https:') {
            toast.loading('Connexion sécurisée au prestataire de paiement...');
            window.location.href = event.data.url;
            return;
          }
        } catch {
          // URL invalide, fallback gracieux
        }
      }

      // 2. Détection de paiement réussi Chariow
      if (
        event.data.eventType === 'PAYMENT_SUCCESSFUL' ||
        event.data.type === 'chariow-purchase-completed'
      ) {
        setSuccess(true);
        toast.success('🎉 Paiement validé avec succès ! Votre formule PRO est désormais active.');

        if (onSuccess) {
          onSuccess();
        }

        if (event.data.eventData?.return_url) {
          setTimeout(() => {
            window.location.href = event.data.eventData.return_url;
          }, 2000);
          return;
        }

        // Fermer la modale après un court délai pour laisser l'utilisateur voir le succès
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2200);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onClose, onSuccess]);

  // Bloquer le scroll d'arrière-plan quand la modale est ouverte
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[92vh] max-h-[820px] shadow-2xl border border-neutral-200 flex flex-col relative overflow-hidden">
        {/* Header de la modale */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-neutral-900 block leading-tight">
                {planTitle || 'Paiement Sécurisé Chariow'}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">
                Carte bancaire
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps : Iframe du Widget Chariow */}
        <div className="relative flex-1 w-full bg-slate-50 overflow-hidden">
          {loading && !success && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-neutral-500">
                Chargement sécurisé du terminal de paiement...
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
                Votre compte a été mis à jour avec la formule PRO. Actualisation en cours...
              </p>
            </div>
          )}

          <iframe
            src={checkoutUrl}
            title="Paiement Sécurisé Chariow"
            className="w-full h-full border-0 block"
            loading="eager"
            allow="payment; camera; microphone; geolocation"
            onLoad={() => setLoading(false)}
          />
        </div>

        {/* Footer info de sécurité */}
        <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-center shrink-0">
          <p className="text-[10px] text-neutral-400">
            🔒 Transaction chiffrée SSL 256-bit assurée par Chariow
          </p>
        </div>
      </div>
    </div>
  );
}

