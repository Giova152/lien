import { NextResponse } from 'next/server';
import { verifyChariowPulseSignature } from '@/lib/chariow';
import { upgradeUserProfile } from '../callback/route';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-chariow-signature');
    const pulseEvent = req.headers.get('x-pulse-event');
    const pulseDeliveryId = req.headers.get('x-pulse-delivery-id');

    console.log('[Chariow Webhook] Pulse reçu:', {
      pulseEvent,
      pulseDeliveryId,
      hasSignature: Boolean(signature),
    });

    const secret = process.env.CHARIOW_PULSE_SECRET;

    // Vérification cryptographique de la signature si le secret est configuré
    if (secret) {
      const isValid = verifyChariowPulseSignature(rawBody, signature, secret);
      if (!isValid) {
        console.error('[Chariow Webhook] Signature invalide rejetée');
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Payload JSON invalide' }, { status: 400 });
    }

    const event = pulseEvent || payload?.event || payload?.type;
    const sale = payload?.sale || payload?.data || payload?.purchase;
    const saleStatus = sale?.status || payload?.status;
    const paymentStatus = sale?.payment?.status || payload?.payment?.status;

    // Traitement de l'événement d'achat réussi ou de renouvellement d'abonnement
    const isSuccessEvent =
      event === 'successful.sale' ||
      event === 'sale.completed' ||
      event === 'sale.successful' ||
      event === 'order.completed' ||
      event === 'payment.succeeded' ||
      event === 'payment.success' ||
      event === 'subscription.renewed' ||
      event === 'subscription.payment_succeeded' ||
      saleStatus === 'completed' ||
      paymentStatus === 'success';

    if (isSuccessEvent) {
      const saleId = sale?.id || 'chariow_sale';
      const metadata =
        sale?.custom_metadata ||
        payload?.custom_metadata ||
        sale?.meta ||
        payload?.meta ||
        sale?.metadata ||
        payload?.metadata ||
        {};
      let userId = metadata?.userId || metadata?.user_id;
      const customerEmail =
        sale?.customer?.email ||
        payload?.customer?.email ||
        sale?.email ||
        payload?.email;

      // Déduction du forfait par produit Chariow si non précisé dans metadata
      const productId = sale?.product?.id || sale?.product_id || '';
      let plan = metadata?.plan;
      if (!plan) {
        if (
          productId === (process.env.CHARIOW_PRODUCT_ID_LIFETIME || 'prd_sndsd48e') ||
          productId === 'prd_sndsd48e'
        ) {
          plan = 'lifetime';
        } else if (
          productId === (process.env.CHARIOW_PRODUCT_ID_MONTHLY || 'prd_s5bag6eh') ||
          productId === 'prd_s5bag6eh'
        ) {
          plan = 'monthly';
        } else {
          plan = 'yearly';
        }
      }

      console.log('[Chariow Webhook] Vente/Renouvellement validé pour:', {
        event,
        saleId,
        userId,
        customerEmail,
        plan,
        productId,
      });

      // Si userId n'est pas dans metadata (achat direct sur la boutique), chercher par email
      if (!userId && customerEmail) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          );

          // 1. Recherche dans contact_info
          const { data: contactMatch } = await supabaseAdmin
            .from('contact_info')
            .select('profile_id')
            .eq('email', customerEmail)
            .maybeSingle();

          if (contactMatch?.profile_id) {
            userId = contactMatch.profile_id;
          }

          // 2. Recherche dans Supabase Auth
          if (!userId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
            const matchedUser = authData?.users?.find(
              (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
            );
            if (matchedUser) {
              userId = matchedUser.id;
            }
          }
        } catch (e) {
          console.warn('[Chariow Webhook] Recherche utilisateur par email échouée:', e);
        }
      }

      if (userId) {
        await upgradeUserProfile(userId, plan, saleId);
        console.log(`[Chariow Webhook] Utilisateur ${userId} renouvelé en PRO avec succès !`);
      } else {
        console.warn('[Chariow Webhook] Aucun userId trouvé pour cet événement', event, saleId, 'email:', customerEmail);
      }
    } else if (
      event === 'subscription.cancelled' ||
      event === 'subscription.expired' ||
      event === 'subscription.payment_failed'
    ) {
      const sale = payload?.sale || payload?.data;
      const metadata = sale?.custom_metadata || payload?.custom_metadata || {};
      let userId = metadata?.userId;
      const customerEmail = sale?.customer?.email || payload?.customer?.email;

      if (!userId && customerEmail) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          );
          const { data: contactMatch } = await supabaseAdmin
            .from('contact_info')
            .select('profile_id')
            .eq('email', customerEmail)
            .maybeSingle();

          if (contactMatch?.profile_id) {
            userId = contactMatch.profile_id;
          }
        } catch (e) {
          console.warn('[Chariow Webhook] Recherche utilisateur pour annulation échouée:', e);
        }
      }

      if (userId) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );
        await supabaseAdmin
          .from('profiles')
          .update({
            is_pro: false,
            plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log(`[Chariow Webhook] Abonnement résilié/expiré pour l'utilisateur ${userId}.`);
      }
    } else {
      console.log(`[Chariow Webhook] Événement ignoré : ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Chariow Webhook Exception]', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
