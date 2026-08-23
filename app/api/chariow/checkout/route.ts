import { NextResponse } from 'next/server';
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

    const chariowApiKey = process.env.CHARIOW_API_KEY || '';
    const chariowProductId = process.env.CHARIOW_PRODUCT_ID || 'prd_pro_lifetime';
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // If Chariow API key is not configured, simulate demo success for testing
    if (!chariowApiKey || chariowApiKey.includes('mock')) {
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

    // Call Chariow Checkout API (https://chariow.dev/en/guides/checkout)
    const chariowResponse = await fetch('https://api.chariow.com/v1/checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${chariowApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: chariowProductId,
        email: user.email || '',
        redirect_url: `${origin}/dashboard?payment=success`,
        custom_metadata: {
          userId: user.id,
        },
      }),
    });

    const result = await chariowResponse.json();

    if (!chariowResponse.ok) {
      throw new Error(result.message || 'Erreur lors de la création du paiement Chariow');
    }

    const checkoutUrl = result?.data?.payment?.checkout_url;

    if (checkoutUrl) {
      return NextResponse.json({ url: checkoutUrl });
    } else if (result?.data?.step === 'completed') {
      // Direct completion
      await supabase
        .from('profiles')
        .update({
          is_pro: true,
          plan: 'pro_lifetime',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return NextResponse.json({ url: `${origin}/dashboard?payment=success` });
    }

    throw new Error('URL de paiement non reçue de Chariow');
  } catch (error: any) {
    console.error('Chariow Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur Chariow Checkout' }, { status: 500 });
  }
}
