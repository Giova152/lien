import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const rawHost = (request.headers.get('host') || '').toLowerCase().replace(/:\d+$/, '');
  const host = rawHost.replace(/^www\./, '');
  const isCalendarSubdomain = host.startsWith('calendar.');
  const isLienBioSite = host.endsWith('lien-bio.site');

  const supabase = createServerClient(
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
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            const mergedOptions = {
              ...options,
              domain: isLienBioSite ? '.lien-bio.site' : options?.domain,
            };
            supabaseResponse.cookies.set(name, value, mergedOptions);
          });
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

  // Redirection immédiate de l'ancienne URL /dashboard/calendar vers la suite dédiée calendar.lien-bio.site
  if (!isCalendarSubdomain && (pathname === '/dashboard/calendar' || pathname.startsWith('/dashboard/calendar/'))) {
    return NextResponse.redirect(new URL('https://calendar.lien-bio.site'));
  }

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

  // 1. Calendar Subdomain Routing (calendar.lien-bio.site or calendar.localhost)
  if (isCalendarSubdomain) {
    // If accessing auth or dashboard routes while on calendar subdomain, redirect to main domain
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/onboarding')
    ) {
      const mainHost = host.replace(/^calendar\./, '');
      const proto =
        request.headers.get('x-forwarded-proto') ||
        (rawHost.includes('localhost') ? 'http' : 'https');
      const targetUrl = new URL(`${proto}://${mainHost}${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(targetUrl);
    }

    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      const targetPath = pathname === '/' ? '/calendar' : `/calendar${pathname}`;
      const rewriteUrl = new URL(targetPath, request.url);
      rewriteUrl.search = request.nextUrl.search;
      const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
        request,
      });
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie);
      });
      return rewriteResponse;
    }
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
        const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
          request,
        });
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          rewriteResponse.cookies.set(cookie);
        });
        return rewriteResponse;
      }
    } catch (e) {
      console.warn('Middleware custom domain rewrite error:', e);
    }
  }

  return supabaseResponse;
}
