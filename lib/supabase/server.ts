import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  let isLienBioSite = false;
  try {
    const headerList = await headers();
    const host = (headerList.get('host') || '').toLowerCase();
    isLienBioSite = host.endsWith('lien-bio.site');
  } catch {
    // Outside request context
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookieOptions: {
        domain: isLienBioSite ? '.lien-bio.site' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const mergedOptions = {
                ...options,
                domain: isLienBioSite ? '.lien-bio.site' : options?.domain,
              };
              cookieStore.set(name, value, mergedOptions);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

