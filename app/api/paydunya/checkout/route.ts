import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaydunyaInvoice, PAYDUNYA_PLANS } from '@/lib/paydunya';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const selectedPlan: 'monthly' | 'yearly' | 'lifetime' = body.plan || 'yearly';

    if (!PAYDUNYA_PLANS[selectedPlan]) {
      return NextResponse.json({ error: 'Offre invalide' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    console.log('[PayDunya Checkout] Initiating for user:', user.id, user.email, 'Plan:', selectedPlan);

    const invoiceResult = await createPaydunyaInvoice({
      plan: selectedPlan,
      userId: user.id,
      userEmail: user.email || '',
      origin,
    });

    console.log('[PayDunya Checkout] Invoice created:', invoiceResult.url);

    return NextResponse.json({
      url: invoiceResult.url,
      token: invoiceResult.token,
      isDemo: invoiceResult.isDemo,
    });
  } catch (error: any) {
    console.error('PayDunya Checkout Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l’initialisation du paiement PayDunya' },
      { status: 500 }
    );
  }
}

