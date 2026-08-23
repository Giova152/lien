import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Extract user ID from Chariow Pulse webhook payload
    const userId = payload?.custom_metadata?.userId || payload?.data?.custom_metadata?.userId;
    const saleId = payload?.purchase?.id || payload?.data?.purchase?.id || payload?.id;

    if (userId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseServiceKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error } = await supabase
        .from('profiles')
        .update({
          is_pro: true,
          plan: 'pro_lifetime',
          stripe_payment_id: saleId || 'chariow_payment',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error upgrading profile via Chariow webhook:', error);
      } else {
        console.log(`User ${userId} upgraded to Lifetime PRO via Chariow!`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Chariow Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
