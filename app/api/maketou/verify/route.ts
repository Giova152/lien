import { NextResponse } from 'next/server';
import { verifyMaketouCart } from '@/lib/maketou';
import { upgradeUserProfile } from '../callback/route';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cartId =
      url.searchParams.get('cart_id') ||
      url.searchParams.get('cartId') ||
      url.searchParams.get('id') ||
      '';
    const plan = url.searchParams.get('plan') || 'yearly';

    if (!cartId) {
      return NextResponse.json({ error: 'cart_id manquant' }, { status: 400 });
    }

    // Récupération de l'utilisateur connecté via sa session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification de l'état du panier auprès de l'API Maketou
    const verification = await verifyMaketouCart(cartId);

    const targetUserId =
      user?.id ||
      verification.cart?.meta?.userId ||
      verification.cart?.metadata?.userId;

    if (verification.status === 'completed') {
      if (targetUserId) {
        await upgradeUserProfile(targetUserId, plan, cartId);
      }
      return NextResponse.json({
        completed: true,
        status: 'completed',
        isPro: true,
      });
    }

    return NextResponse.json({
      completed: false,
      status: verification.status,
      isPro: false,
    });
  } catch (error: any) {
    console.error('[Maketou Verify Route Error]', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la vérification' }, { status: 500 });
  }
}
