import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { confirmPaydunyaInvoice } from '@/lib/paydunya';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('PayDunya Webhook payload received:', body);

    // PayDunya transmet généralement le token de facture dans `data.invoice.token` ou directement `data.token`
    const invoiceToken =
      body?.data?.invoice?.token ||
      body?.data?.token ||
      body?.token ||
      body?.invoice_token;

    if (!invoiceToken) {
      console.warn('PayDunya Webhook: Aucun token de facture fourni');
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    // Confirmation auprès de l'API PayDunya
    const confirmation = await confirmPaydunyaInvoice(invoiceToken);

    if (confirmation.status !== 'completed') {
      console.log(`PayDunya Webhook: Paiement non complété (statut: ${confirmation.status})`);
      return NextResponse.json({ received: true, status: confirmation.status });
    }

    const userId = confirmation.customData?.user_id;
    const plan = confirmation.customData?.plan || 'yearly';

    if (!userId) {
      console.error('PayDunya Webhook: Aucun userId dans customData', confirmation.customData);
      return NextResponse.json({ error: 'userId manquant' }, { status: 400 });
    }

    // Utilisation du client Supabase Service Role pour mettre à jour le profil de l'utilisateur
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Récupération du thème actuel pour préserver les réglages et ajouter le statut PRO
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('theme')
      .eq('id', userId)
      .maybeSingle();

    const currentTheme = currentProfile?.theme || {};
    const updatedTheme = {
      ...currentTheme,
      is_pro: true,
      plan: plan === 'lifetime' ? 'pro_lifetime' : 'pro_subscription',
      pro_since: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        theme: updatedTheme,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('PayDunya Webhook Supabase update error:', updateError);
      return NextResponse.json({ error: 'Erreur mise à jour base de données' }, { status: 500 });
    }

    console.log(`PayDunya Webhook: Compte ${userId} passé en PRO (${plan}) avec succès !`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PayDunya Webhook Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne PayDunya Webhook' },
      { status: 500 }
    );
  }
}

