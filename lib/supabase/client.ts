import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const isProductionLienBio =
    typeof window !== 'undefined' &&
    window.location.hostname.endsWith('lien-bio.site');

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookieOptions: {
        domain: isProductionLienBio ? '.lien-bio.site' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }
  );
}

