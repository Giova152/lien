import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyMaketouCart } from '@/lib/maketou';

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    console.log('[Maketou Webhook] Notification reçue:', payload);

    const cartId =
      payload?.cartId ||
      payload?.cart?.id ||
      payload?.id ||
      payload?.data?.id ||
      payload?.data?.cartId;

    if (!cartId) {
      console.warn('[Maketou Webhook] Aucun identifiant de panier fourni');
      return NextResponse.json({ error: 'cartId manquant' }, { status: 400 });
    }

    // Double vérification officielle auprès de l'API Maketou
    const verification = await verifyMaketouCart(cartId);

    if (verification.status !== 'completed') {
      console.log(`[Maketou Webhook] Statut actuel non complété : ${verification.status}`);
      return NextResponse.json({ received: true, status: verification.status });
    }

    const userId =
      verification.cart?.meta?.userId ||
      verification.cart?.metadata?.userId ||
      payload?.meta?.userId ||
      payload?.cart?.meta?.userId;

    const plan =
      verification.cart?.meta?.plan ||
      verification.cart?.metadata?.plan ||
      payload?.meta?.plan ||
      'yearly';

    if (!userId) {
      console.error('[Maketou Webhook] Aucun userId associé au panier', cartId);
      return NextResponse.json({ error: 'userId manquant dans les métadonnées' }, { status: 400 });
    }

    // Mise à jour du profil utilisateur via Supabase Admin
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
    const isLifetime = plan === 'lifetime';
    const planType = isLifetime ? 'pro_lifetime' : 'pro_subscription';

    const updatedTheme = {
      ...currentTheme,
      is_pro: true,
      plan: planType,
      pro_since: new Date().toISOString(),
      payment_ref: cartId,
    };

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_pro: true,
        plan: planType,
        theme: updatedTheme,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[Maketou Webhook] Erreur mise à jour profil:', updateError);
      return NextResponse.json({ error: 'Erreur mise à jour base de données' }, { status: 500 });
    }

    console.log(`[Maketou Webhook] Utilisateur ${userId} passé en PRO avec succès !`);
    return NextResponse.json({ success: true, upgraded: true });
  } catch (err: any) {
    console.error('Maketou Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

