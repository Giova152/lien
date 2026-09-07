/**
 * Client d'intégration PayDunya
 * Documentation officielle : https://paydunya.com/developers/api
 */

export interface PaydunyaInvoiceOptions {
  plan: 'monthly' | 'yearly' | 'lifetime';
  userId: string;
  userEmail: string;
  origin: string;
}

export interface PaydunyaPlanDetails {
  plan: 'monthly' | 'yearly' | 'lifetime';
  name: string;
  description: string;
  amountUsd: number;
  amountXof: number;
}

export const PAYDUNYA_PLANS: Record<'monthly' | 'yearly' | 'lifetime', PaydunyaPlanDetails> = {
  monthly: {
    plan: 'monthly',
    name: 'Abonnement PRO Mensuel — Lien-Bio',
    description: 'Accès complet sans engagement à toutes les fonctionnalités PRO (35 $/mois).',
    amountUsd: 35,
    amountXof: 21000, // ~21 000 FCFA
  },
  yearly: {
    plan: 'yearly',
    name: 'Abonnement PRO Annuel — Lien-Bio',
    description: 'Accès PRO 1 an avec 28% d’économie (300 $/an soit 25 $/mois).',
    amountUsd: 300,
    amountXof: 180000, // ~180 000 FCFA
  },
  lifetime: {
    plan: 'lifetime',
    name: 'Pack PRO À VIE (Lifetime) — Lien-Bio',
    description: 'Accès définitif à vie à toutes les fonctionnalités PRO en paiement unique (500 $).',
    amountUsd: 500,
    amountXof: 300000, // ~300 000 FCFA
  },
};

export function getPaydunyaConfig() {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY || '';
  const publicKey = process.env.PAYDUNYA_PUBLIC_KEY || '';
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY || '';
  const token = process.env.PAYDUNYA_TOKEN || '';
  // Par défaut en mode LIVE (Production réelle) pour encaisser les paiements réels
  const rawMode = (process.env.PAYDUNYA_MODE || 'live').toLowerCase();
  const isTestMode = rawMode === 'test' || rawMode === 'sandbox';
  const mode: 'live' | 'test' = isTestMode ? 'test' : 'live';

  const isConfigured = Boolean(
    masterKey &&
      privateKey &&
      token &&
      !masterKey.includes('mock') &&
      !privateKey.includes('mock') &&
      !masterKey.includes('your_')
  );

  // URL API officielle PayDunya
  // Production (Live) : https://app.paydunya.com/api/v1
  // Sandbox (Test)    : https://app.paydunya.com/sandbox-api/v1
  const baseUrl =
    mode === 'live'
      ? 'https://app.paydunya.com/api/v1'
      : 'https://app.paydunya.com/sandbox-api/v1';

  return {
    masterKey,
    publicKey,
    privateKey,
    token,
    mode,
    isConfigured,
    baseUrl,
  };
}

/**
 * Crée une facture de checkout PayDunya
 */
export async function createPaydunyaInvoice(options: PaydunyaInvoiceOptions) {
  const { plan, userId, userEmail, origin } = options;
  const planDetails = PAYDUNYA_PLANS[plan];
  const config = getPaydunyaConfig();

  // Si les clés PayDunya ne sont pas encore configurées en local, simuler un mode démo sécurisé
  if (!config.isConfigured) {
    return {
      success: true,
      isDemo: true,
      url: `${origin}/dashboard?payment=success&provider=paydunya&plan=${plan}&demo=true`,
      token: `demo_token_${Date.now()}`,
    };
  }

  const endpoint = `${config.baseUrl}/checkout-invoice/create`;

  const payload = {
    invoice: {
      total_amount: planDetails.amountXof,
      description: planDetails.description,
    },
    store: {
      name: 'Lien-Bio',
      tagline: 'Carte de visite digitale & Link-in-bio pour professionnels',
      website_url: origin,
    },
    actions: {
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      return_url: `${origin}/dashboard?payment=success&provider=paydunya`,
      callback_url: `${origin}/api/paydunya/webhook`,
    },
    custom_data: {
      user_id: userId,
      user_email: userEmail,
      plan: plan,
      amount_usd: planDetails.amountUsd,
      amount_xof: planDetails.amountXof,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PAYDUNYA-MASTER-KEY': config.masterKey,
      'PAYDUNYA-PUBLIC-KEY': config.publicKey,
      'PAYDUNYA-PRIVATE-KEY': config.privateKey,
      'PAYDUNYA-TOKEN': config.token,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.response_code !== '00') {
    console.error('PayDunya API Error Details:', data);
    throw new Error(
      data.response_text ||
        `Erreur PayDunya (${response.status}): Impossible de créer la facture de paiement`
    );
  }

  // PayDunya renvoie l'URL de paiement soit dans response_text, soit via le token
  let checkoutUrl = '';
  if (typeof data.response_text === 'string' && data.response_text.startsWith('http')) {
    checkoutUrl = data.response_text;
  } else if (data.token) {
    checkoutUrl =
      config.mode === 'live'
        ? `https://app.paydunya.com/checkout-invoice/confirm/${data.token}`
        : `https://app.paydunya.com/sandbox-checkout-invoice/confirm/${data.token}`;
  }

  console.log(`[PayDunya ${config.mode.toUpperCase()}] Facture créée avec succès pour ${userEmail}. Redirection: ${checkoutUrl}`);

  return {
    success: true,
    isDemo: false,
    url: checkoutUrl,
    token: data.token,
    mode: config.mode,
  };
}

/**
 * Confirme le statut réel d'une facture PayDunya via l'API de confirmation (IPN)
 */
export async function confirmPaydunyaInvoice(invoiceToken: string) {
  const config = getPaydunyaConfig();

  if (!config.isConfigured) {
    return {
      status: 'completed',
      isDemo: true,
    };
  }

  const endpoint = `${config.baseUrl}/checkout-invoice/confirm/${invoiceToken}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'PAYDUNYA-MASTER-KEY': config.masterKey,
      'PAYDUNYA-PUBLIC-KEY': config.publicKey,
      'PAYDUNYA-PRIVATE-KEY': config.privateKey,
      'PAYDUNYA-TOKEN': config.token,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.response_text || 'Erreur lors de la confirmation PayDunya');
  }

  return {
    status: data.status, // 'completed', 'pending', 'cancelled'
    receiptUrl: data.receipt_url,
    customData: data.custom_data,
    customer: data.customer,
  };
}

