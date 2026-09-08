import { POST as chariowCheckoutPost } from '@/app/api/chariow/checkout/route';

/**
 * Route de compatibilité arrière : redirige vers le nouveau système Chariow
 */
export async function POST(req: Request) {
  return chariowCheckoutPost(req);
}
