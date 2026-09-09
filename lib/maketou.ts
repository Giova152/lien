/**
 * Client d'intégration officiel de l'API publique Maketou
 * Documentation : https://docs-api.maketou.com/guides/authentication
 */

export type MaketouPlanId = 'monthly' | 'yearly' | 'lifetime';

export interface MaketouPlanDetails {
  id: MaketouPlanId;
  name: string;
  description: string;
  amountUsd: number;
  amountXof: number;
}

export const MAKETOU_PLANS: Record<MaketouPlanId, MaketouPlanDetails> = {
  monthly: {
    id: 'monthly',
    name: 'Abonnement PRO Mensuel — Lien-Bio',
    description: 'Accès sans engagement à toutes les fonctionnalités PRO (25 $/mois).',
    amountUsd: 25,
    amountXof: 15000, // ~15 000 FCFA
  },
  yearly: {
    id: 'yearly',
    name: 'Abonnement PRO Annuel — Lien-Bio',
    description: 'Accès PRO 1 an avec 28% d’économie (300 $/an soit 25 $/mois).',
    amountUsd: 300,
    amountXof: 180000, // ~180 000 FCFA
  },
  lifetime: {
    id: 'lifetime',
    name: 'Pack PRO À VIE (Lifetime) — Lien-Bio',
    description: 'Accès définitif à vie à toutes les fonctionnalités PRO en paiement unique (500 $).',
    amountUsd: 500,
    amountXof: 300000, // ~300 000 FCFA
  },
};

export function getMaketouConfig() {
  const apiKey = process.env.MAKETOU_API_KEY || '';
  const baseUrl =
    process.env.MAKETOU_BASE_URL || process.env.MAKETOU_API_URL || 'https://api.maketou.net';

  const productIds: Record<MaketouPlanId, string> = {
    monthly: process.env.MAKETOU_PRODUCT_ID_MONTHLY || '',
    yearly: process.env.MAKETOU_PRODUCT_ID_YEARLY || '',
    lifetime: process.env.MAKETOU_PRODUCT_ID_LIFETIME || '',
  };

  const isConfigured = Boolean(
    apiKey &&
      !apiKey.includes('mock') &&
      !apiKey.includes('votre_') &&
      !apiKey.includes('YOUR_')
  );

  return {
    apiKey,
    baseUrl,
    productIds,
    isConfigured,
  };
}

export interface CreateMaketouCheckoutOptions {
  plan: MaketouPlanId;
  userId: string;
  userEmail: string;
  userName?: string;
  phone?: string;
  origin: string;
}

export interface MaketouCheckoutResult {
  url: string;
  cartId?: string;
  isDemo?: boolean;
}

/**
 * Crée un panier de paiement Maketou et retourne l'URL de redirection sécurisée
 * Endpoint : POST https://api.maketou.net/api/v1/stores/cart/checkout
 */
export async function createMaketouCheckout(
  options: CreateMaketouCheckoutOptions
): Promise<MaketouCheckoutResult> {
  const { plan, userId, userEmail, userName = '', phone, origin } = options;
  const config = getMaketouConfig();

  // Mode Simulation / Démo sécurisé en dev ou si les clés ne sont pas encore saisies
  if (!config.isConfigured) {
    console.warn(
      '[Maketou API] Clé API non configurée. Passage en mode simulation démo.'
    );
    const demoCartId = `demo_cart_${Date.now()}`;
    const redirectCallback = `${origin}/api/maketou/callback?cart_id=${demoCartId}&plan=${plan}&userId=${userId}&demo=true`;
    return {
      url: redirectCallback,
      cartId: demoCartId,
      isDemo: true,
    };
  }

  // Décomposition du nom du client
  const nameParts = userName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Membre';
  const lastName = nameParts.slice(1).join(' ') || 'Lien-Bio';

  // Identifiant produit Maketou
  const productDocumentId = config.productIds[plan];
  if (!productDocumentId || !productDocumentId.trim()) {
    console.warn(
      `[Maketou API] MAKETOU_PRODUCT_ID_${plan.toUpperCase()} n'est pas encore défini. Passage en mode simulation pour le test.`
    );
    const demoCartId = `demo_cart_${Date.now()}`;
    const redirectCallback = `${origin}/api/maketou/callback?cart_id=${demoCartId}&plan=${plan}&userId=${userId}&demo=true`;
    return {
      url: redirectCallback,
      cartId: demoCartId,
      isDemo: true,
    };
  }

  const returnUrl = `${origin}/api/maketou/callback?plan=${plan}&userId=${userId}`;

  const payload: Record<string, any> = {
    productDocumentId,
    email: userEmail,
    firstName,
    lastName,
    redirectURL: returnUrl,
    meta: {
      userId,
      plan,
      source: 'lien-bio-app',
    },
  };

  if (phone && phone.trim()) {
    payload.phone = phone.trim();
  }

  console.log('[Maketou API] Creating cart checkout:', {
    plan,
    productDocumentId,
    email: userEmail,
  });

  const response = await fetch(`${config.baseUrl}/api/v1/stores/cart/checkout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('[Maketou API Error]', response.status, result);
    let errorMessage = `Erreur Maketou (${response.status})`;
    if (Array.isArray(result?.message)) {
      errorMessage = result.message
        .map((m: any) =>
          typeof m === 'string'
            ? m
            : m?.constraints
            ? Object.values(m.constraints).join(', ')
            : m?.message || JSON.stringify(m)
        )
        .join(' ; ');
    } else if (typeof result?.message === 'string') {
      errorMessage = result.message;
    } else if (result?.error) {
      errorMessage = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
    }
    throw new Error(errorMessage);
  }

  const redirectUrl = result?.redirectUrl;
  const cartId = result?.cart?.id;

  if (!redirectUrl) {
    throw new Error("Maketou n'a pas retourné d'URL de redirection valide.");
  }

  return {
    url: redirectUrl,
    cartId,
    isDemo: false,
  };
}

export interface VerifyCartResult {
  status: 'waiting_payment' | 'completed' | 'abandoned' | 'payment_failed' | string;
  cart?: any;
  isDemo?: boolean;
}

/**
 * Vérifie l'état d'un panier Maketou
 * Endpoint : GET https://api.maketou.net/api/v1/stores/cart/{cartId}
 */
export async function verifyMaketouCart(cartId: string): Promise<VerifyCartResult> {
  // Gestion du mode démo
  if (cartId.startsWith('demo_cart_')) {
    return {
      status: 'completed',
      isDemo: true,
      cart: { id: cartId, status: 'completed' },
    };
  }

  const config = getMaketouConfig();
  if (!config.isConfigured) {
    return {
      status: 'completed',
      isDemo: true,
      cart: { id: cartId, status: 'completed' },
    };
  }

  const response = await fetch(`${config.baseUrl}/api/v1/stores/cart/${cartId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('[Maketou Verify Error]', response.status, data);
    return {
      status: 'unknown',
      cart: data,
    };
  }

  return {
    status: data.status || 'unknown',
    cart: data,
  };
}

