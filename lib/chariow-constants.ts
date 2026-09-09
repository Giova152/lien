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

