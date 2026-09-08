import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyMaketouCart } from '@/lib/maketou';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cartId =
      url.searchParams.get('cart_id') ||
      url.searchParams.get('cartId') ||
      url.searchParams.get('id') ||
      '';
    const userId = url.searchParams.get('userId') || '';
    const plan = url.searchParams.get('plan') || 'yearly';
    const isDemo = url.searchParams.get('demo') === 'true';

    const origin = url.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log('[Maketou Callback] Retour client après paiement:', {
      cartId,
      userId,
      plan,
      isDemo,
    });

    // Cas Démo / Simulation directe
    if (isDemo || cartId.startsWith('demo_cart_')) {
      if (userId) {
        await upgradeUserProfile(userId, plan, cartId || 'demo_maketou_cart');
      }
      return NextResponse.redirect(
        `${origin}/dashboard?payment=success&provider=maketou&plan=${plan}&demo=true`
      );
    }

    if (!cartId) {
      console.warn('[Maketou Callback] Aucun cartId retourné dans les paramètres URL');
      return NextResponse.redirect(`${origin}/dashboard?payment=pending&provider=maketou`);
    }

    // Vérification de l'état du panier auprès de l'API Maketou
    let verification = await verifyMaketouCart(cartId);
    console.log('[Maketou Callback] Statut panier vérifié:', verification.status);

    let targetUserId =
      userId ||
      verification.cart?.meta?.userId ||
      verification.cart?.metadata?.userId;

    if (!targetUserId) {
      try {
        const { createClient: createServerClient } = await import('@/lib/supabase/server');
        const sessionClient = await createServerClient();
        const {
          data: { user },
        } = await sessionClient.auth.getUser();
        if (user) {
          targetUserId = user.id;
        }
      } catch (e) {
        console.warn('[Maketou Callback] Erreur lecture session:', e);
      }
    }

    // Si le statut est waiting_payment, attendre 3s pour laisser l'opérateur Mobile Money finaliser
    if (verification.status === 'waiting_payment') {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const retryCheck = await verifyMaketouCart(cartId);
      console.log('[Maketou Callback] Statut panier après délai 3s:', retryCheck.status);
      if (retryCheck.status === 'completed') {
        verification = retryCheck;
      }
    }

    if (verification.status === 'completed') {
      if (targetUserId) {
        await upgradeUserProfile(targetUserId, plan, cartId);
      }
      return NextResponse.redirect(
        `${origin}/dashboard?payment=success&provider=maketou&plan=${plan}`
      );
    }

    if (verification.status === 'waiting_payment') {
      return NextResponse.redirect(
        `${origin}/dashboard?payment=pending&provider=maketou&cart_id=${cartId}&plan=${plan}`
      );
    }

    // Paiement échoué ou annulé
    return NextResponse.redirect(
      `${origin}/dashboard?payment=failed&provider=maketou&reason=${verification.status}`
    );
  } catch (error: any) {
    console.error('Maketou Callback Error:', error);
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/dashboard?payment=error&provider=maketou`);
  }
}

/**
 * Met à jour le profil de l'utilisateur vers le statut PRO
 */
export async function upgradeUserProfile(userId: string, plan: string, paymentRef: string) {
  const isLifetime = plan === 'lifetime';
  const planType = isLifetime ? 'pro_lifetime' : 'pro_subscription';

  // 1. Priorité à la session connectée du client (utilise les cookies de session pour passer RLS)
  try {
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const sessionClient = await createServerClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (user && user.id === userId) {
      const { data: currentProf } = await sessionClient
        .from('profiles')
        .select('theme')
        .eq('id', userId)
        .maybeSingle();

      const currentTheme = currentProf?.theme || {};
      const updatedTheme = {
        ...currentTheme,
        is_pro: true,
        plan: planType,
        pro_since: new Date().toISOString(),
        payment_ref: paymentRef,
      };

      const { error: userErr } = await sessionClient
        .from('profiles')
        .update({
          is_pro: true,
          plan: planType,
          theme: updatedTheme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (!userErr) {
        console.log(`[Maketou] Utilisateur ${userId} passé en PRO avec succès via session utilisateur !`);
        return;
      }
    }
  } catch (sessionError) {
    console.warn('[Maketou] Session cookie non disponible, passage au client admin:', sessionError);
  }

  // 2. Fallback avec clé Admin / Service Role
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: currentProfile } = await supabaseAdmin
    .from('profiles')
    .select('theme')
    .eq('id', userId)
    .maybeSingle();

  const currentTheme = currentProfile?.theme || {};

  const updatedTheme = {
    ...currentTheme,
    is_pro: true,
    plan: planType,
    pro_since: new Date().toISOString(),
    payment_ref: paymentRef,
  };

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      is_pro: true,
      plan: planType,
      theme: updatedTheme,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('[Maketou Upgrade Error] Échec de la mise à jour Supabase:', error);
    throw error;
  }

  console.log(`[Maketou] Utilisateur ${userId} passé en PRO avec succès ! (Plan: ${planType})`);
}

