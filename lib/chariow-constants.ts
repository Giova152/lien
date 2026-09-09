/**
 * Constantes publiques et client-safe pour Chariow (Widget & Checkout)
 */
export const CHARIOW_STORE_DOMAIN = 'enfancience-academy.mychariow.shop';

export const CHARIOW_PRODUCTS = {
  YEARLY: 'prd_78x1xfjr',
  LIFETIME: 'prd_sndsd48e',
} as const;

export type ChariowProductKey = keyof typeof CHARIOW_PRODUCTS;

