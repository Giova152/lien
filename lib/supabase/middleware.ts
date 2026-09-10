import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect /dashboard and /onboarding
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect logged in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Custom Domain Routing (Multi-Tenant Rewrite)
  const host = (request.headers.get('host') || '').toLowerCase().replace(/:\d+$/, '');

  // 1. Calendar Subdomain Routing (calendar.lien-bio.site or calendar.localhost)
  if (host.startsWith('calendar.') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const targetPath = pathname === '/' ? '/calendar' : `/calendar${pathname}`;
    const rewriteUrl = new URL(targetPath, request.url);
    rewriteUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  const isMainDomain =
    !host ||
    host.includes('lien-bio.site') ||
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('.vercel.app');

  if (!isMainDomain && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    try {
      const { data: matchedProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('custom_domain', host)
        .maybeSingle();

      if (matchedProfile?.username) {
        const username = matchedProfile.username;
        const targetPath = pathname === '/' ? `/${username}` : `/${username}${pathname}`;
        const rewriteUrl = new URL(targetPath, request.url);
        rewriteUrl.search = request.nextUrl.search;
        return NextResponse.rewrite(rewriteUrl);
      }
    } catch (e) {
      console.warn('Middleware custom domain rewrite error:', e);
    }
  }

  return supabaseResponse;
}
