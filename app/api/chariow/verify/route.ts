import { NextResponse } from 'next/server';
import { verifyChariowSale } from '@/lib/chariow';
import { upgradeUserProfile } from '../callback/route';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const saleId =
      url.searchParams.get('sale_id') ||
      url.searchParams.get('saleId') ||
      url.searchParams.get('id') ||
      url.searchParams.get('cart_id') ||
      '';
    const plan = url.searchParams.get('plan') || 'yearly';

    if (!saleId) {
      return NextResponse.json({ error: 'sale_id manquant' }, { status: 400 });
    }

    // Récupération de l'utilisateur connecté via sa session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification de l'état de la vente auprès de l'API Chariow
    const verification = await verifyChariowSale(saleId);

    const targetUserId =
      user?.id ||
      verification.sale?.custom_metadata?.userId ||
      verification.sale?.meta?.userId;

    if (verification.status === 'completed' || verification.paymentStatus === 'success') {
      if (targetUserId) {
        await upgradeUserProfile(targetUserId, plan, saleId);
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
      paymentStatus: verification.paymentStatus,
      isPro: false,
    });
  } catch (error: any) {
    console.error('[Chariow Verify Route Error]', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la vérification' }, { status: 500 });
  }
}
