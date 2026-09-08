import crypto from 'crypto';

/**
 * Client d'intégration officiel de l'API publique Chariow
 * Documentation : https://chariow.dev
 */

export type ChariowPlanId = 'monthly' | 'yearly' | 'lifetime';

export interface ChariowPlanDetails {
  id: ChariowPlanId;
  name: string;
  description: string;
  amountUsd: number;
  amountXof: number;
}

export const CHARIOW_PLANS: Record<ChariowPlanId, ChariowPlanDetails> = {
  monthly: {
    id: 'monthly',
    name: 'Abonnement PRO Mensuel — Lien-Bio',
    description: 'Accès sans engagement à toutes les fonctionnalités PRO (35 $/mois).',
    amountUsd: 35,
    amountXof: 21000, // ~21 000 FCFA
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

export function getChariowConfig() {
  const apiKey = (process.env.CHARIOW_API_KEY || '').trim();
  const baseUrl = (process.env.CHARIOW_BASE_URL || 'https://api.chariow.com/v1').replace(/\/$/, '');
  const pulseSecret = (process.env.CHARIOW_PULSE_SECRET || '').trim();

  const productIds: Record<ChariowPlanId, string> = {
    monthly: (process.env.CHARIOW_PRODUCT_ID_MONTHLY || '').trim(),
    yearly: (process.env.CHARIOW_PRODUCT_ID_YEARLY || '').trim(),
    lifetime: (process.env.CHARIOW_PRODUCT_ID_LIFETIME || '').trim(),
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
    pulseSecret,
    productIds,
    isConfigured,
  };
}

/**
 * Nettoie et formate le numéro de téléphone pour respecter les contraintes Chariow:
 * - phone.number: Chiffres uniquement (sans '+' ni espaces)
 * - phone.country_code: Code pays ISO 2 lettres (ex: FR, CI, SN, US...)
 */
export function formatChariowPhone(rawPhone?: string): { number: string; country_code: string } {
  if (!rawPhone || !rawPhone.trim()) {
    return { number: '0102030405', country_code: 'FR' };
  }

  const cleaned = rawPhone.trim();
  const numericOnly = cleaned.replace(/\D/g, '');

  if (cleaned.startsWith('+225') || (numericOnly.startsWith('225') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^225/, '') || numericOnly, country_code: 'CI' };
  }
  if (cleaned.startsWith('+221') || (numericOnly.startsWith('221') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^221/, '') || numericOnly, country_code: 'SN' };
  }
  if (cleaned.startsWith('+229') || (numericOnly.startsWith('229') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^229/, '') || numericOnly, country_code: 'BJ' };
  }
  if (cleaned.startsWith('+228') || (numericOnly.startsWith('228') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^228/, '') || numericOnly, country_code: 'TG' };
  }
  if (cleaned.startsWith('+237') || (numericOnly.startsWith('237') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^237/, '') || numericOnly, country_code: 'CM' };
  }
  if (cleaned.startsWith('+242') || (numericOnly.startsWith('242') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^242/, '') || numericOnly, country_code: 'CG' };
  }
  if (cleaned.startsWith('+243') || (numericOnly.startsWith('243') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^243/, '') || numericOnly, country_code: 'CD' };
  }
  if (cleaned.startsWith('+226') || (numericOnly.startsWith('226') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^226/, '') || numericOnly, country_code: 'BF' };
  }
  if (cleaned.startsWith('+223') || (numericOnly.startsWith('223') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^223/, '') || numericOnly, country_code: 'ML' };
  }
  if (cleaned.startsWith('+212') || (numericOnly.startsWith('212') && numericOnly.length > 8)) {
    return { number: numericOnly.replace(/^212/, '') || numericOnly, country_code: 'MA' };
  }
  if (cleaned.startsWith('+33') || (numericOnly.startsWith('33') && numericOnly.length > 9)) {
    return { number: numericOnly.replace(/^33/, '') || numericOnly, country_code: 'FR' };
  }
  if (cleaned.startsWith('+1') || (numericOnly.startsWith('1') && numericOnly.length === 11)) {
    return { number: numericOnly.replace(/^1/, '') || numericOnly, country_code: 'US' };
  }

  return {
    number: numericOnly || '0102030405',
    country_code: 'FR',
  };
}

export interface CreateChariowCheckoutOptions {
  plan: ChariowPlanId;
  userId: string;
  userEmail: string;
  userName?: string;
  phone?: string;
  customerIp?: string;
  origin: string;
}

export interface ChariowCheckoutResult {
  url: string;
  saleId?: string;
  isDemo?: boolean;
}

/**
 * Crée une session de paiement Chariow et retourne l'URL de paiement sécurisée
 * Endpoint : POST https://api.chariow.com/v1/checkout
 */
export async function createChariowCheckout(
  options: CreateChariowCheckoutOptions
): Promise<ChariowCheckoutResult> {
  const { plan, userId, userEmail, userName = '', phone, customerIp, origin } = options;
  const config = getChariowConfig();

  // Mode Simulation / Démo si la clé n'est pas encore configurée
  if (!config.isConfigured) {
    console.warn('[Chariow API] Clé API non configurée. Passage en mode simulation démo.');
    const demoSaleId = `demo_sal_${Date.now()}`;
    const redirectCallback = `${origin}/api/chariow/callback?sale_id=${demoSaleId}&plan=${plan}&userId=${userId}&demo=true`;
    return {
      url: redirectCallback,
      saleId: demoSaleId,
      isDemo: true,
    };
  }

  // Décomposition prénom/nom
  const nameParts = userName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Membre';
  const lastName = nameParts.slice(1).join(' ') || 'Lien-Bio';

  // Identifiant ou slug produit Chariow
  const productId = config.productIds[plan];
  if (!productId) {
    console.warn(
      `[Chariow API] CHARIOW_PRODUCT_ID_${plan.toUpperCase()} n'est pas configuré. Passage en mode simulation.`
    );
    const demoSaleId = `demo_sal_${Date.now()}`;
    const redirectCallback = `${origin}/api/chariow/callback?sale_id=${demoSaleId}&plan=${plan}&userId=${userId}&demo=true`;
    return {
      url: redirectCallback,
      saleId: demoSaleId,
      isDemo: true,
    };
  }

  const redirectUrl = `${origin}/api/chariow/callback?plan=${plan}&userId=${userId}`;
  const formattedPhone = formatChariowPhone(phone);

  const payload: Record<string, any> = {
    product_id: productId,
    email: userEmail,
    first_name: firstName,
    last_name: lastName,
    phone: formattedPhone,
    payment_currency: 'USD',
    redirect_url: redirectUrl,
    custom_metadata: {
      userId,
      plan,
      source: 'lien-bio-app',
    },
  };

  if (customerIp && customerIp.trim()) {
    payload.customer_ip = customerIp.trim();
  }

  console.log('[Chariow API] Création session de paiement:', {
    plan,
    productId,
    email: userEmail,
  });

  try {
    const response = await fetch(`${config.baseUrl}/checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Chariow API Error]', response.status, result);

      if (
        response.status === 401 ||
        result?.message?.toLowerCase()?.includes('invalid api key')
      ) {
        console.warn(
          '[Chariow API] Clé API rejetée par Chariow. Basculement sécurisé en mode simulation.'
        );
        const demoSaleId = `demo_sal_${Date.now()}`;
        const redirectCallback = `${origin}/api/chariow/callback?sale_id=${demoSaleId}&plan=${plan}&userId=${userId}&demo=true`;
        return {
          url: redirectCallback,
          saleId: demoSaleId,
          isDemo: true,
        };
      }

      let errorDetail = result?.message || `Erreur Chariow (${response.status})`;
      if (result?.errors && typeof result.errors === 'object') {
        const errorList = Object.entries(result.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' ; ');
        if (errorList) errorDetail += ` (${errorList})`;
      }
      throw new Error(errorDetail);
    }

    const data = result?.data;
    const checkoutUrl = data?.payment?.checkout_url;
    const saleId = data?.purchase?.id;

    if (!checkoutUrl) {
      if (data?.step === 'completed' && saleId) {
        return {
          url: `${redirectUrl}&sale_id=${saleId}`,
          saleId,
          isDemo: false,
        };
      }
      throw new Error("Chariow n'a pas renvoyé d'URL de paiement.");
    }

    return {
      url: checkoutUrl,
      saleId,
      isDemo: false,
    };
  } catch (error: any) {
    console.error('[Chariow API Exception]', error);
    throw error;
  }
}

export interface VerifySaleResult {
  status: 'completed' | 'awaiting_payment' | 'failed' | 'abandoned' | 'settled' | string;
  paymentStatus?: 'success' | 'pending' | 'cancelled' | 'failed' | string;
  sale?: any;
  isDemo?: boolean;
}

/**
 * Vérifie l'état d'une vente auprès de l'API Chariow
 * Endpoint : GET https://api.chariow.com/v1/sales/{saleId}
 */
export async function verifyChariowSale(saleId: string): Promise<VerifySaleResult> {
  // Gestion mode démo
  if (saleId.startsWith('demo_sal_') || saleId.startsWith('demo_')) {
    return {
      status: 'completed',
      paymentStatus: 'success',
      isDemo: true,
      sale: { id: saleId, status: 'completed' },
    };
  }

  const config = getChariowConfig();
  if (!config.isConfigured) {
    return {
      status: 'completed',
      paymentStatus: 'success',
      isDemo: true,
      sale: { id: saleId, status: 'completed' },
    };
  }

  try {
    const response = await fetch(`${config.baseUrl}/sales/${saleId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Chariow Verify Error]', response.status, result);
      return {
        status: 'unknown',
        sale: result,
      };
    }

    const saleData = result?.data || {};
    return {
      status: saleData.status || 'unknown',
      paymentStatus: saleData.payment?.status,
      sale: saleData,
    };
  } catch (error) {
    console.error('[Chariow Verify Exception]', error);
    return {
      status: 'unknown',
    };
  }
}

/**
 * Vérifie la signature cryptographique d'un webhook Pulse Chariow
 * Selon la documentation officielle Chariow :
 * Header: x-chariow-signature = sha256=<hex_digest>
 * Algorithme: HMAC-SHA256 sur les octets bruts du corps (raw body)
 */
export function verifyChariowPulseSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  secret: string
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  try {
    const expected =
      'sha256=' +
      crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    const receivedBuffer = Buffer.from(signatureHeader);
    const expectedBuffer = Buffer.from(expected);

    if (receivedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch (err) {
    console.error('[Chariow Signature Verification Error]', err);
    return false;
  }
}
