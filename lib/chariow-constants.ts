/**
 * Constantes publiques et client-safe pour Chariow (Widget & Checkout)
 */
export const CHARIOW_STORE_DOMAIN = 'enfancience-academy.mychariow.shop';

export const CHARIOW_PRODUCTS = {
  MONTHLY: process.env.NEXT_PUBLIC_CHARIOW_PRODUCT_ID_MONTHLY || 'prd_s5bag6eh',
  YEARLY: 'prd_78x1xfjr',
  LIFETIME: 'prd_sndsd48e',
} as const;

export type ChariowProductKey = keyof typeof CHARIOW_PRODUCTS;

export interface ChariowProductMeta {
  key: 'monthly' | 'yearly' | 'lifetime';
  title: string;
  price: string;
  period: string;
  description: string;
  badge: string;
  amount: number;
}

export function getChariowProductDetails(productId: string): ChariowProductMeta {
  if (productId === CHARIOW_PRODUCTS.MONTHLY || productId === 'prd_s5bag6eh') {
    return {
      key: 'monthly',
      title: 'Formule PRO Mensuel',
      price: '25 $',
      period: '/ mois',
      description: 'Sans engagement • Annulable à tout moment en un clic',
      badge: 'Sans engagement',
      amount: 25,
    };
  }

  if (productId === CHARIOW_PRODUCTS.LIFETIME || productId === 'prd_sndsd48e') {
    return {
      key: 'lifetime',
      title: 'Pack PRO À Vie (Lifetime)',
      price: '500 $',
      period: 'accès définitif',
      description: 'Paiement unique définitif • 0 $ ensuite pour toujours',
      badge: 'Accès Définitif',
      amount: 500,
    };
  }

  // Par défaut : Formule Annuelle
  return {
    key: 'yearly',
    title: 'Formule PRO 1 An',
    price: '185 $',
    period: '/ an',
    description: 'Soit ~15 $/mois au lieu de 25 $ • Remise exceptionnelle de -38%',
    badge: '⭐ Plus Populaire • -38%',
    amount: 185,
  };
}

export function getChariowCheckoutUrl(productId: string, userEmail?: string | null): string {
  const base = `https://${CHARIOW_STORE_DOMAIN}/${productId}`;
  if (userEmail && userEmail.trim()) {
    return `${base}?chw_email=${encodeURIComponent(userEmail.trim())}`;
  }
  return base;
}
