import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const body = await req.json().catch(() => ({}));
    const selectedPlan = body.plan || 'lifetime'; // 'monthly', 'yearly', 'lifetime'

    // If Stripe secret key is not set yet in .env, simulate instant demo success in dev mode
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
      // Dev simulation mode: Upgrade user directly for testing
      await supabase
        .from('profiles')
        .update({
          is_pro: true,
          plan: selectedPlan === 'lifetime' ? 'pro_lifetime' : 'pro_subscription',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return NextResponse.json({
        url: `${origin}/dashboard?payment=success&demo=true`,
      });
    }

    let unitAmount = 50000; // $500.00
    let planName = 'Pack PRO À VIE – Accès Définitif';
    let planDesc = 'Paiement unique de 500 $. Accès illimité à vie à toutes les fonctionnalités Pro.';

    if (selectedPlan === 'monthly') {
      unitAmount = 3500; // $35.00
      planName = 'Abonnement PRO Mensuel';
      planDesc = '35 $ / mois. Accès complet sans engagement, annulable à tout moment.';
    } else if (selectedPlan === 'yearly') {
      unitAmount = 30000; // $300.00
      planName = 'Abonnement PRO Annuel';
      planDesc = '300 $ / an (soit 25 $/mois). Économisez 120 $ par an !';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmount,
            product_data: {
              name: planName,
              description: planDesc,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan: selectedPlan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur Checkout' }, { status: 500 });
  }
}
