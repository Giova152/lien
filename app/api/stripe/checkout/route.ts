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

    // If Stripe secret key is not set yet in .env, simulate instant demo success in dev mode
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
      // Dev simulation mode: Upgrade user directly for testing
      await supabase
        .from('profiles')
        .update({
          is_pro: true,
          plan: 'pro_lifetime',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return NextResponse.json({
        url: `${origin}/dashboard?payment=success&demo=true`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 18600, // $186.00 USD
            product_data: {
              name: 'Plan PRO À VIE – Offre Créateur',
              description:
                'Accès illimité à vie à toutes les fonctionnalités Pro (Thèmes Luxe, E-books, Services, Analytics, Badge Vérifié)',
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
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur Checkout' }, { status: 500 });
  }
}
