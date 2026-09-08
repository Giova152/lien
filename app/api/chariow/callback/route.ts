import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyChariowSale } from '@/lib/chariow';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const saleId =
      url.searchParams.get('sale_id') ||
      url.searchParams.get('saleId') ||
      url.searchParams.get('id') ||
      url.searchParams.get('cart_id') ||
      '';
    const userId = url.searchParams.get('userId') || '';
    const plan = url.searchParams.get('plan') || 'yearly';
    const isDemo = url.searchParams.get('demo') === 'true';

    const origin = url.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log('[Chariow Callback] Retour client après paiement:', {
      saleId,
      userId,
      plan,
      isDemo,
    });

    // Cas Démo / Simulation directe
    if (isDemo || saleId.startsWith('demo_sal_') || saleId.startsWith('demo_')) {
      if (userId) {
        await upgradeUserProfile(userId, plan, saleId || 'demo_chariow_sale');
      }
      return NextResponse.redirect(
        `${origin}/dashboard?payment=success&provider=chariow&plan=${plan}&demo=true`
      );
    }

    if (!saleId) {
      console.warn('[Chariow Callback] Aucun saleId retourné dans les paramètres URL');
      return NextResponse.redirect(`${origin}/dashboard?payment=pending&provider=chariow`);
    }

    // Vérification de l'état de la vente auprès de l'API Chariow
    let verification = await verifyChariowSale(saleId);
    console.log('[Chariow Callback] Statut vente vérifié:', verification.status, verification.paymentStatus);

    let targetUserId =
      userId ||
      verification.sale?.custom_metadata?.userId ||
      verification.sale?.meta?.userId;

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
        console.warn('[Chariow Callback] Erreur lecture session:', e);
      }
    }

    // Si le statut est awaiting_payment, attendre 3s pour laisser l'opérateur finaliser
    if (verification.status === 'awaiting_payment' || verification.paymentStatus === 'pending') {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const retryCheck = await verifyChariowSale(saleId);
      console.log('[Chariow Callback] Statut vente après délai 3s:', retryCheck.status, retryCheck.paymentStatus);
      if (retryCheck.status === 'completed' || retryCheck.paymentStatus === 'success') {
        verification = retryCheck;
      }
    }

    if (verification.status === 'completed' || verification.paymentStatus === 'success') {
      if (targetUserId) {
        await upgradeUserProfile(targetUserId, plan, saleId);
      }
      return NextResponse.redirect(
        `${origin}/dashboard?payment=success&provider=chariow&plan=${plan}`
      );
    }

    if (verification.status === 'awaiting_payment' || verification.paymentStatus === 'pending') {
      return NextResponse.redirect(
        `${origin}/dashboard?payment=pending&provider=chariow&sale_id=${saleId}&plan=${plan}`
      );
    }

    // Paiement échoué ou abandonné
    return NextResponse.redirect(
      `${origin}/dashboard?payment=failed&provider=chariow&reason=${verification.status}`
    );
  } catch (error: any) {
    console.error('Chariow Callback Error:', error);
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/dashboard?payment=error&provider=chariow`);
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
        console.log(`[Chariow] Utilisateur ${userId} passé en PRO avec succès via session utilisateur !`);
        return;
      }
    }
  } catch (sessionError) {
    console.warn('[Chariow] Session cookie non disponible, passage au client admin:', sessionError);
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
    console.error('[Chariow Upgrade Error] Échec de la mise à jour Supabase:', error);
    throw error;
  }

  console.log(`[Chariow] Utilisateur ${userId} passé en PRO avec succès ! (Plan: ${planType})`);
}
