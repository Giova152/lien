import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createChariowCheckout, CHARIOW_PLANS, ChariowPlanId } from '@/lib/chariow';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const selectedPlan: ChariowPlanId = body.plan || 'yearly';

    if (!CHARIOW_PLANS[selectedPlan]) {
      return NextResponse.json({ error: 'Offre sélectionnée invalide.' }, { status: 400 });
    }

    // Récupération des informations du profil pour préremplir le prénom/nom/téléphone
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username, phone')
      .eq('id', user.id)
      .maybeSingle();

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const userName = profile?.display_name || user.user_metadata?.full_name || profile?.username || '';
    const phone = body.phone || profile?.phone || '';

    // Détection de l'adresse IP de l'utilisateur pour adapter les méthodes de paiement Chariow
    const forwardedFor = req.headers.get('x-forwarded-for');
    const customerIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('cf-connecting-ip') || undefined;

    console.log('[Chariow Checkout] Initialisation commande pour:', {
      userId: user.id,
      email: user.email,
      plan: selectedPlan,
    });

    const checkoutResult = await createChariowCheckout({
      plan: selectedPlan,
      userId: user.id,
      userEmail: user.email || '',
      userName,
      phone,
      customerIp,
      origin,
    });

    return NextResponse.json({
      url: checkoutResult.url,
      saleId: checkoutResult.saleId,
      isDemo: checkoutResult.isDemo,
    });
  } catch (error: any) {
    console.error('Chariow Checkout Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session Chariow.' },
      { status: 500 }
    );
  }
}
