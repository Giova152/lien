import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ received: true, note: 'Stripe keys missing' });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;

    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_pro: true,
          plan: 'pro_lifetime',
          stripe_payment_id: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile to pro_lifetime:', error);
      } else {
        console.log(`User ${userId} successfully upgraded to Lifetime PRO!`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
