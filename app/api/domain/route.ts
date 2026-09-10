import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import dns from 'dns';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function cleanDomainName(rawDomain: string): string {
  let domain = rawDomain.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, '');
  domain = domain.replace(/\/.*$/, '');
  return domain;
}

const RESERVED_DOMAINS = [
  'lien-bio.site',
  'www.lien-bio.site',
  'localhost',
  'vercel.app',
  'mychariow.shop',
];

// DNS Lookup Helper using Node dns.promises
async function checkDnsConfiguration(domain: string): Promise<boolean> {
  try {
    // 1. Try CNAME resolution
    try {
      const cnames = await dns.promises.resolveCname(domain);
      const isValidCname = cnames.some(
        (cname) =>
          cname.toLowerCase().includes('lien-bio.site') ||
          cname.toLowerCase().includes('vercel-dns.com') ||
          cname.toLowerCase().includes('cname.vercel-dns.com')
      );
      if (isValidCname) return true;
    } catch {}

    // 2. Try A Record resolution
    try {
      const addresses = await dns.promises.resolve4(domain);
      // Vercel standard IP or custom server IP
      const isValidIp = addresses.some(
        (ip) => ip === '76.76.21.21' || ip === '76.76.21.98' || ip.startsWith('76.76.')
      );
      if (isValidIp) return true;
    } catch {}

    return false;
  } catch (err) {
    return false;
  }
}

// GET: Vérifier le statut DNS d'un nom de domaine personnalisé
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, custom_domain, custom_domain_status, is_pro, theme')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    const domain = profile.custom_domain || profile.theme?.custom_domain;
    if (!domain) {
      return NextResponse.json({
        hasDomain: false,
        domain: null,
        status: null,
      });
    }

    const dnsValid = await checkDnsConfiguration(domain);
    const newStatus = dnsValid ? 'active' : 'pending';

    // Update status in DB if changed
    if (newStatus !== profile.custom_domain_status) {
      const supabaseAdmin = getAdminSupabase();
      const client = supabaseAdmin || supabase;
      await client
        .from('profiles')
        .update({
          custom_domain_status: newStatus,
          theme: {
            ...(profile.theme || {}),
            custom_domain_status: newStatus,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      hasDomain: true,
      domain,
      status: newStatus,
      dnsValid,
      targetCname: 'cname.lien-bio.site',
      targetIp: '76.76.21.21',
    });
  } catch (error: any) {
    console.error('Error GET /api/domain:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification du domaine' },
      { status: 500 }
    );
  }
}

// POST: Ajouter ou modifier un nom de domaine personnalisé (PRO)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, is_pro, theme')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    const isPro = Boolean(profile.is_pro || profile.theme?.is_pro);
    if (!isPro) {
      return NextResponse.json(
        { error: 'La configuration d’un nom de domaine personnalisé est réservée aux abonnés PRO.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const rawDomain = body.domain;
    if (!rawDomain || typeof rawDomain !== 'string') {
      return NextResponse.json({ error: 'Nom de domaine invalide.' }, { status: 400 });
    }

    const cleanDomain = cleanDomainName(rawDomain);

    // Domain validation regex
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json(
        { error: 'Format de domaine invalide. Exemple valide : bio.mon-entreprise.com ou mon-nom.com' },
        { status: 400 }
      );
    }

    // Check reserved domains
    if (RESERVED_DOMAINS.some((rd) => cleanDomain.includes(rd))) {
      return NextResponse.json(
        { error: 'Ce nom de domaine est réservé par le système.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminSupabase();
    const activeClient = supabaseAdmin || supabase;

    // Check if domain is already used by another user
    const { data: existingDomainProfile } = await activeClient
      .from('profiles')
      .select('id, username')
      .eq('custom_domain', cleanDomain)
      .neq('id', user.id)
      .maybeSingle();

    if (existingDomainProfile) {
      return NextResponse.json(
        { error: 'Ce nom de domaine est déjà associé à un autre compte Lien-Bio.' },
        { status: 409 }
      );
    }

    // Perform initial DNS check
    const dnsValid = await checkDnsConfiguration(cleanDomain);
    const initialStatus = dnsValid ? 'active' : 'pending';

    // 1. Save to SQL Table `profiles`
    try {
      await activeClient
        .from('profiles')
        .update({
          custom_domain: cleanDomain,
          custom_domain_status: initialStatus,
          theme: {
            ...(profile.theme || {}),
            custom_domain: cleanDomain,
            custom_domain_status: initialStatus,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    } catch (e) {
      console.warn('SQL update for custom_domain failed, using JSONB theme fallback:', e);
    }

    // 2. Register domain with Vercel API if VERCEL_AUTH_TOKEN is provided in environment
    const vercelToken = process.env.VERCEL_AUTH_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;

    if (vercelToken && vercelProjectId) {
      try {
        await fetch(`https://api.vercel.com/v9/projects/${vercelProjectId}/domains`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: cleanDomain }),
        });
      } catch (e) {
        console.warn('Vercel domain registration API error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      status: initialStatus,
      dnsValid,
      message: dnsValid
        ? 'Nom de domaine associé et DNS vérifié avec succès !'
        : 'Nom de domaine enregistré. Veuillez configurer l’enregistrement CNAME dans vos DNS.',
    });
  } catch (error: any) {
    console.error('Error POST /api/domain:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l’enregistrement du domaine' },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer le nom de domaine personnalisé
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, custom_domain, theme')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    const currentDomain = profile.custom_domain || profile.theme?.custom_domain;

    const supabaseAdmin = getAdminSupabase();
    const activeClient = supabaseAdmin || supabase;

    // Reset domain fields in SQL & JSONB
    const updatedTheme = { ...(profile.theme || {}) };
    delete updatedTheme.custom_domain;
    delete updatedTheme.custom_domain_status;

    await activeClient
      .from('profiles')
      .update({
        custom_domain: null,
        custom_domain_status: null,
        theme: updatedTheme,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Remove from Vercel API if configured
    const vercelToken = process.env.VERCEL_AUTH_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;

    if (currentDomain && vercelToken && vercelProjectId) {
      try {
        await fetch(`https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${currentDomain}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        });
      } catch (e) {
        console.warn('Vercel domain deletion API error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Nom de domaine personnalisé réinitialisé.',
    });
  } catch (error: any) {
    console.error('Error DELETE /api/domain:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression du domaine' },
      { status: 500 }
    );
  }
}

