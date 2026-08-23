import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeUsername } from '@/lib/utils';

const RESERVED_USERNAMES = [
  'admin',
  'api',
  'dashboard',
  'login',
  'register',
  'onboarding',
  'settings',
  'profile',
  'links',
  'contact',
  'theme',
  'analytics',
  'terms',
  'privacy',
  'help',
  'support',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username');

  if (!rawUsername) {
    return NextResponse.json({ available: false, error: 'Username requis' }, { status: 400 });
  }

  const username = sanitizeUsername(rawUsername);

  if (username.length < 3) {
    return NextResponse.json({ available: false, error: 'Au moins 3 caractères requis' });
  }

  if (RESERVED_USERNAMES.includes(username)) {
    return NextResponse.json({ available: false, error: 'Ce pseudo est réservé au système' });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ available: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ available: !data, username });
}
