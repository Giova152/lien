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

    const event = pulseEvent || payload?.event;

    // Traitement de l'événement d'achat réussi
    if (event === 'successful.sale') {
      const sale = payload?.sale || payload?.data;
      const saleId = sale?.id || 'chariow_sale';
      const metadata = sale?.custom_metadata || payload?.custom_metadata || {};
      const userId = metadata?.userId;
      const plan = metadata?.plan || 'yearly';

      console.log('[Chariow Webhook] Achat validé pour:', {
        saleId,
        userId,
        plan,
      });

      if (userId) {
        await upgradeUserProfile(userId, plan, saleId);
        console.log(`[Chariow Webhook] Utilisateur ${userId} passé en PRO avec succès !`);
      } else {
        console.warn('[Chariow Webhook] Aucun userId trouvé dans custom_metadata de la vente', saleId);
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
