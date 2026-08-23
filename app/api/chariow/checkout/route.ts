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
    const chariowProductId = process.env.CHARIOW_PRODUCT_ID || 'prd_qm4vxf3z';
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const chariowDirectUrl = 'https://infosweb.mychariow.store/prd_qm4vxf3z/checkout';

    // If Chariow API key is not configured or in dev, use direct Chariow store link
    if (!chariowApiKey || chariowApiKey.includes('mock')) {
      return NextResponse.json({
        url: chariowDirectUrl,
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
      console.warn('Chariow API fallback to direct store URL:', result.message);
      return NextResponse.json({ url: chariowDirectUrl });
    }

    const checkoutUrl = result?.data?.payment?.checkout_url || chariowDirectUrl;
    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Chariow Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur Chariow Checkout' }, { status: 500 });
  }
}
