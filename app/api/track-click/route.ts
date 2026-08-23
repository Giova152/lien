import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { linkId } = await request.json();

    if (!linkId) {
      return NextResponse.json({ error: 'linkId est requis' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Try RPC call first (handles anonymous visitors securely via SECURITY DEFINER)
    const { error: rpcError } = await supabase.rpc('increment_link_click', {
      target_link_id: linkId,
    });

    if (rpcError) {
      // 2. Fallback to direct update if RPC is not present
      const { data: link } = await supabase
        .from('links')
        .select('click_count')
        .eq('id', linkId)
        .maybeSingle();

      if (link) {
        await supabase
          .from('links')
          .update({ click_count: (link.click_count || 0) + 1 })
          .eq('id', linkId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}

