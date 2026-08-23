import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { profileId, referrer, device } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: 'profileId est requis' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.from('profile_views').insert({
      profile_id: profileId,
      referrer: referrer || request.headers.get('referer') || null,
      device: device || request.headers.get('user-agent') || null,
    });

    if (error) {
      console.error('Erreur lors du suivi de la vue:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}
