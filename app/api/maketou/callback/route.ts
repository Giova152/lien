import { GET as chariowCallbackGet, upgradeUserProfile } from '@/app/api/chariow/callback/route';

/**
 * Route de compatibilité arrière pour le callback
 */
export async function GET(req: Request) {
  return chariowCallbackGet(req);
}

export { upgradeUserProfile };
