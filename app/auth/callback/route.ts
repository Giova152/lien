import { NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/onboarding';

  // 1. Resolve true public origin dynamically (compatible with proxies and custom domains)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let siteOrigin = origin;

  if (forwardedHost && !isLocalEnv) {
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    siteOrigin = `${proto}://${forwardedHost}`;
  }

  const supabase = await createClient();

  // 2. PKCE Flow (code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return await handleSuccessfulAuth(supabase, siteOrigin, next);
    }
  }

  // 3. Email OTP / Token Hash Flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return await handleSuccessfulAuth(supabase, siteOrigin, next);
    }
  }

  // 4. Fallback: check if session is already active (link clicked twice or user already signed in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return await handleSuccessfulAuth(supabase, siteOrigin, next);
  }

  // 5. If everything failed, redirect to login with notification
  return NextResponse.redirect(`${siteOrigin}/login?error=auth-link-expired`);
}

async function handleSuccessfulAuth(supabase: any, siteOrigin: string, requestedNext: string) {
  // If user requested a password reset, honor it directly
  if (requestedNext.startsWith('/reset-password')) {
    return NextResponse.redirect(`${siteOrigin}${requestedNext}`);
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if user already configured their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      // If user already has a valid username, send straight to /dashboard!
      if (profile?.username) {
        return NextResponse.redirect(`${siteOrigin}/dashboard`);
      }
    }
  } catch (err) {
    console.error('Callback profile check error:', err);
  }

  return NextResponse.redirect(`${siteOrigin}${requestedNext}`);
}

