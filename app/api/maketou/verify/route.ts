import { GET as chariowVerifyGet } from '@/app/api/chariow/verify/route';

/**
 * Route de compatibilité arrière pour la vérification
 */
export async function GET(req: Request) {
  return chariowVerifyGet(req);
}
