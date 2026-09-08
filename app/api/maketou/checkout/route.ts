import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createMaketouCheckout, MAKETOU_PLANS, MaketouPlanId } from '@/lib/maketou';

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
    const selectedPlan: MaketouPlanId = body.plan || 'yearly';

    if (!MAKETOU_PLANS[selectedPlan]) {
      return NextResponse.json({ error: 'Offre sélectionnée invalide.' }, { status: 400 });
    }

    // Récupération des informations du profil pour préremplir le prénom/nom
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username, phone')
      .eq('id', user.id)
      .maybeSingle();

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const userName = profile?.display_name || user.user_metadata?.full_name || profile?.username || '';
    const phone = body.phone || profile?.phone || '';

    console.log('[Maketou Checkout] Initialisation panier pour:', {
      userId: user.id,
      email: user.email,
      plan: selectedPlan,
    });

    const checkoutResult = await createMaketouCheckout({
      plan: selectedPlan,
      userId: user.id,
      userEmail: user.email || '',
      userName,
      phone,
      origin,
    });

    return NextResponse.json({
      url: checkoutResult.url,
      cartId: checkoutResult.cartId,
      isDemo: checkoutResult.isDemo,
    });
  } catch (error: any) {
    console.error('Maketou Checkout Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du panier Maketou.' },
      { status: 500 }
    );
  }
}
