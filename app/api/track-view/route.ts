import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const profileId = body?.profileId;

    if (!profileId) {
      return NextResponse.json({ error: 'profileId est requis' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const clientDevice = body?.device;

    // 1. Detect device type (mobile, desktop, tablet)
    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (/ipad|tablet|(android(?!.*mobile))/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (
      /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent) ||
      clientDevice === 'mobile'
    ) {
      deviceType = 'mobile';
    }

    // 2. Detect country (Vercel IP country, Cloudflare, or timezone fallback)
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    const cfCountry = request.headers.get('cf-ipcountry');
    const customCountry = request.headers.get('x-country-code');
    const clientCountry = body?.country;

    let country = (vercelCountry || cfCountry || customCountry || clientCountry || null)?.trim().toUpperCase() || null;

    // Fallback: Infer country from client timezone if country header is missing (e.g. local dev)
    if (!country && body?.timezone) {
      const tz = String(body.timezone).toLowerCase();
      if (tz.includes('paris')) country = 'FR';
      else if (tz.includes('abidjan')) country = 'CI';
      else if (tz.includes('dakar')) country = 'SN';
      else if (tz.includes('douala')) country = 'CM';
      else if (tz.includes('casablanca')) country = 'MA';
      else if (tz.includes('tunis')) country = 'TN';
      else if (tz.includes('algiers')) country = 'DZ';
      else if (tz.includes('kinshasa') || tz.includes('lubumbashi')) country = 'CD';
      else if (tz.includes('libreville')) country = 'GA';
      else if (tz.includes('lome')) country = 'TG';
      else if (tz.includes('porto-novo') || tz.includes('cotonou')) country = 'BJ';
      else if (tz.includes('antananarivo')) country = 'MG';
      else if (tz.includes('bamako')) country = 'ML';
      else if (tz.includes('conakry')) country = 'GN';
      else if (tz.includes('ouagadougou')) country = 'BF';
      else if (tz.includes('niamey')) country = 'NE';
      else if (tz.includes('montreal') || tz.includes('toronto') || tz.includes('vancouver')) country = 'CA';
      else if (tz.includes('brussels')) country = 'BE';
      else if (tz.includes('zurich') || tz.includes('geneva')) country = 'CH';
      else if (tz.includes('new_york') || tz.includes('los_angeles') || tz.includes('chicago')) country = 'US';
    }

    const cityName = (request.headers.get('x-vercel-ip-city') || body?.city || null)?.trim();

    // 3. Package into device column as structured JSON (100% compatible with existing DB table)
    const devicePayload = JSON.stringify({
      type: deviceType,
      country: country || null,
      city: cityName || null,
      ua: userAgent.slice(0, 160),
    });

    const supabase = await createClient();

    const { error } = await supabase.from('profile_views').insert({
      profile_id: profileId,
      referrer: body.referrer || request.headers.get('referer') || null,
      device: devicePayload,
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
