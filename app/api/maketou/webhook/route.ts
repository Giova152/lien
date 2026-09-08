import { POST as chariowWebhookPost } from '@/app/api/chariow/webhook/route';

/**
 * Route de compatibilité arrière pour le webhook
 */
export async function POST(req: Request) {
  return chariowWebhookPost(req);
}
