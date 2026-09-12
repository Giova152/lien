'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Smartphone,
  Lock,
  Zap,
  ArrowRight,
  RefreshCw,
} from '@/components/ui/Icons';
import {
  getChariowProductDetails,
  getChariowCheckoutUrl,
  CHARIOW_STORE_DOMAIN,
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
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [success, setSuccess] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const productDetails = React.useMemo(() => {
    return getChariowProductDetails(productId);
  }, [productId]);

  const checkoutUrl = React.useMemo(() => {
    return getChariowCheckoutUrl(productId, userEmail);
  }, [productId, userEmail]);

  // Récupérer l'email connecté si absent
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

  // Fonction de vérification du statut PRO de l'utilisateur
  const checkProStatus = useCallback(async (showToast = false) => {
    try {
      setIsCheckingStatus(true);
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
          window.location.href = `/dashboard?payment=success&provider=chariow&plan=${productDetails.key}`;
        }, 2200);
        return true;
      } else if (showToast) {
        toast.info('Paiement en cours de traitement par Chariow. Veuillez patienter quelques instants...');
      }
      return false;
    } catch (err) {
      console.error('Erreur vérification statut PRO:', err);
      return false;
    } finally {
      setIsCheckingStatus(false);
    }
  }, [onSuccess, productDetails.key]);

  // Gestion de l'ouverture du lien Chariow
  const handleLaunchCheckout = () => {
    if (!checkoutUrl) return;
    setIsWaitingPayment(true);

    // Ouvrir la page officielle sécurisée Chariow dans un nouvel onglet
    const win = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      // Si le bloqueur de popup bloque, redirection directe
      window.location.href = checkoutUrl;
      return;
    }

    toast.info('Session de paiement sécurisée ouverte. Finalisez votre commande sur la page Chariow.');

    // Démarrage du polling toutes les 3 secondes pour détecter l'activation en arrière-plan
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(() => {
      checkProStatus(false);
    }, 3000);
  };

  // Écouteur d'événements postMessage si Chariow renvoie un message
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (
        event.data.eventType === 'PAYMENT_SUCCESSFUL' ||
        event.data.type === 'chariow-purchase-completed'
      ) {
        checkProStatus(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, checkProStatus]);

  // Nettoyage au démontage / fermeture
  useEffect(() => {
    if (!isOpen) {
      setIsWaitingPayment(false);
      setSuccess(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !productId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-100 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh]">
        {/* Header de la modale */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-neutral-900 block leading-tight truncate">
                Paiement Sécurisé Chariow
              </span>
              <span className="text-[11px] text-neutral-500 font-medium truncate block">
                Chiffrement bancaire SSL 256-bit
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps principal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* ÉCRAN DE SUCCÈS */}
          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-neutral-900 mb-2">
                Paiement validé avec succès !
              </h3>
              <p className="text-xs text-neutral-600 max-w-sm leading-relaxed mb-4">
                Votre abonnement PRO a été activé automatiquement. Vous disposez de toutes les fonctionnalités sans limite.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Actualisation de votre espace...</span>
              </div>
            </div>
          ) : isWaitingPayment ? (
            /* ÉCRAN D'ATTENTE DE CONFIRMATION APRÈS CLIC */
            <div className="py-4 space-y-5 animate-in fade-in duration-200 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-neutral-900">
                  Validation de votre paiement en cours
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Finalisez la transaction sur la page Chariow via votre compte <strong>Mobile Money</strong> (Wave, Orange Money) ou <strong>Carte bancaire</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left text-xs space-y-1.5">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Activation instantanée</span>
                </p>
                <p className="text-amber-800 text-[11.5px] leading-relaxed">
                  Dès que vous confirmez le paiement sur votre téléphone ou via votre banque, notre serveur synchronise immédiatement votre compte en PRO.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => checkProStatus(true)}
                  disabled={isCheckingStatus}
                  className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Vérification auprès de Chariow...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Vérifier l&apos;activation de mon compte</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLaunchCheckout}
                  className="w-full py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Rouvrir la page de paiement sécurisée</span>
                </button>
              </div>
            </div>
          ) : (
            /* ÉCRAN PRINCIPAL DE PRÉSENTATION DE LA COMMANDE */
            <>
              {/* Carte Récapitulative du Plan */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-neutral-50 border border-indigo-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-wider">
                    {productDetails.badge}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Compte : <strong className="text-neutral-900">{userEmail || 'Votre compte'}</strong>
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-neutral-900 leading-tight">
                      {planTitle || productDetails.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {productDetails.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-neutral-950">
                      {productDetails.price}
                    </span>
                    <span className="text-xs text-neutral-500 block font-medium">
                      {productDetails.period}
                    </span>
                  </div>
                </div>
              </div>

              {/* Moyens de Paiement Disponibles */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Moyens de paiement acceptés
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Mobile Money */}
                  <div className="p-3 rounded-xl border border-neutral-200/90 bg-neutral-50/60 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 leading-tight">
                        Mobile Money
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                        Wave, Orange Money, MTN, Moov
                      </p>
                    </div>
                  </div>

                  {/* Carte Bancaire */}
                  <div className="p-3 rounded-xl border border-neutral-200/90 bg-neutral-50/60 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 leading-tight">
                        Carte Bancaire
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                        Visa, Mastercard (3D Secure)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garanties et Sécurité Forte */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-2 text-neutral-600 text-[11px]">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Chiffrement SSL 256-bit :</strong> Vos transactions sont certifiées par Chariow.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Sécurité absolue :</strong> Aucun numéro de carte ni code secret n&apos;est stocké sur Lien-Bio.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Activation immédiate :</strong> Votre formule PRO est validée dès la confirmation.
                  </span>
                </div>
              </div>

              {/* Bouton d'Action Principal */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLaunchCheckout}
                  className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Payer en toute sécurité ({productDetails.price})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="text-[10.5px] text-neutral-400 text-center mt-2">
                  Vous allez être redirigé vers le terminal officiel Chariow
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer info de sécurité */}
        <div className="px-5 py-2.5 border-t border-neutral-100 bg-neutral-50/80 text-center shrink-0 flex items-center justify-between text-[10.5px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Paiement 100% Sécurisé</span>
          </span>
          <span>Plateforme certifiée Chariow</span>
        </div>
      </div>
    </div>
  );
}
