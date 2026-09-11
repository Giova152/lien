import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { TeamMember, TeamRole } from '@/types';
import { sendEmail } from '@/lib/email';

// Helper to get admin supabase client if configured
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET: Liste des membres d'équipe de la carte + cartes déléguées
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userEmail = user.email?.toLowerCase().trim() || '';

    // 1. Récupérer le profil du propriétaire connecté
    const { data: ownProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    let teamMembers: TeamMember[] = [];

    // Essayer de lire depuis la table SQL `team_members` si elle existe
    try {
      const { data: sqlMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('card_owner_id', user.id);
      if (sqlMembers && sqlMembers.length > 0) {
        teamMembers = sqlMembers;
      }
    } catch {
      // Table non existante, fallback sur theme JSONB
    }

    // Si vide ou table non existante, utiliser profile.theme.team_members
    if (teamMembers.length === 0 && ownProfile?.theme?.team_members) {
      teamMembers = (ownProfile.theme.team_members as TeamMember[]) || [];
    }

    // 2. Récupérer les cartes où l'utilisateur connecté est invité / collaborateur
    let delegatedCards: any[] = [];
    if (userEmail) {
      try {
        const { data: cardsWithMember } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, theme')
          .neq('id', user.id);

        if (cardsWithMember) {
          delegatedCards = cardsWithMember
            .filter((p: any) => {
              const members = (p.theme?.team_members as TeamMember[]) || [];
              return members.some(
                (m) => m.member_email.toLowerCase() === userEmail
              );
            })
            .map((p: any) => {
              const myMembership = (p.theme?.team_members as TeamMember[]).find(
                (m) => m.member_email.toLowerCase() === userEmail
              );
              return {
                id: p.id,
                username: p.username,
                display_name: p.display_name,
                avatar_url: p.avatar_url,
                role: myMembership?.role || 'assistant',
                status: myMembership?.status || 'accepted',
              };
            });
        }
      } catch (err) {
        console.warn('Error fetching delegated cards:', err);
      }
    }

    return NextResponse.json({
      success: true,
      members: teamMembers,
      delegatedCards,
    });
  } catch (error: any) {
    console.error('Error in GET /api/team:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du chargement de l’équipe' },
      { status: 500 }
    );
  }
}

// POST: Inviter un nouveau collaborateur (Assistant ou Administrateur)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role = 'assistant' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Adresse e-mail requise' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Format d’e-mail invalide' }, { status: 400 });
    }

    if (trimmedEmail === user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous inviter vous-même en tant que collaborateur' },
        { status: 400 }
      );
    }

    const validRole: TeamRole = role === 'admin' ? 'admin' : 'assistant';

    // 1. Récupérer le profil du propriétaire
    const { data: ownProfile, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profError || !ownProfile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    const currentTheme = ownProfile.theme || {};
    const existingMembers: TeamMember[] = currentTheme.team_members || [];

    // Vérifier si déjà présent dans l'équipe
    const existingIndex = existingMembers.findIndex(
      (m) => m.member_email.toLowerCase() === trimmedEmail
    );

    let newMember: TeamMember;
    let updatedMembers: TeamMember[];
    const isReinvite = existingIndex >= 0;

    if (isReinvite) {
      // Le membre existe déjà : on met à jour son rôle et on prépare le renvoi de l'invitation
      const existing = existingMembers[existingIndex];
      newMember = {
        ...existing,
        role: validRole,
        status: existing.status || 'pending',
      };
      updatedMembers = [...existingMembers];
      updatedMembers[existingIndex] = newMember;
    } else {
      newMember = {
        id: crypto.randomUUID(),
        card_owner_id: user.id,
        member_email: trimmedEmail,
        role: validRole,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      updatedMembers = [...existingMembers, newMember];
    }

    // Sauvegarde 1 : Dans le JSONB theme (résilient et immédiatement disponible)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        theme: {
          ...currentTheme,
          team_members: updatedMembers,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Sauvegarde 2 : Dans la table SQL `team_members` si elle existe
    try {
      await supabase.from('team_members').upsert({
        id: newMember.id,
        card_owner_id: user.id,
        member_email: trimmedEmail,
        role: validRole,
        status: 'pending',
        created_at: newMember.created_at,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Table non existante, ignorer
    }

    // Envoi de l'e-mail d'invitation de collaboration
    const inviterName = ownProfile.display_name || ownProfile.username || 'Un utilisateur';
    const cardTitle = ownProfile.title || ownProfile.username;
    const roleLabel = validRole === 'admin' ? 'Co-Administrateur' : 'Assistant(e)';
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.lien-bio.site';
    const acceptUrl = `${siteUrl}/login?collab=${encodeURIComponent(ownProfile.username)}`;

    const emailSubject = `${inviterName} vous a invité à gérer sa carte Lien-Bio en tant que ${roleLabel}`;
    const emailBodyHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Invitation Collaborateur Lien-Bio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="margin-bottom: 24px;">
      <span style="font-size: 22px; font-weight: 900; color: #09090b;">Lien<span style="color: #4f46e5;">-Bio</span></span>
    </div>

    <div style="display: inline-block; background-color: #e0e7ff; color: #3730a3; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      👥 Espace Collaboratif
    </div>

    <h1 style="font-size: 21px; color: #09090b; margin: 0 0 14px; font-weight: 800; line-height: 1.3;">
      Rejoignez l'équipe de ${inviterName}
    </h1>

    <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px;">
      Bonjour,
    </p>

    <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px;">
      <strong>${inviterName}</strong> vous a nommé <strong>${roleLabel}</strong> sur sa carte de visite digitale <em>« ${cardTitle} »</em>.
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 14px 18px; margin: 20px 0; color: #334155; font-size: 13px; line-height: 20px;">
      ${validRole === 'admin'
        ? '👑 <strong>Rôle Administrateur :</strong> Vous aurez accès à la gestion complète de la carte, des liens, du contenu et des services.'
        : '🛡️ <strong>Rôle Assistant(e) :</strong> Vous pourrez gérer et actualiser les liens, les coordonnées de contact et les contenus de la carte.'}
    </div>

    <div style="margin: 28px 0;">
      <a href="${acceptUrl}" style="display: inline-block; background: #09090b; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 30px; border-radius: 12px; text-decoration: none;">
        Accéder à l'espace collaborateur →
      </a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; line-height: 18px; margin: 0 0 20px;">
      Si vous n'avez pas encore de compte avec cette adresse e-mail, vous pourrez simplement vous connecter ou vous inscrire pour activer votre accès.
    </p>

    <div style="font-size: 12px; color: #94a3b8; line-height: 18px; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px;">
      Lien-Bio — La référence de la carte de visite digitale.<br>
      <a href="https://www.lien-bio.site" style="color: #94a3b8; text-decoration: none;">https://www.lien-bio.site</a>
    </div>
  </div>
</body>
</html>
    `;

    // Envoi de l'e-mail d'invitation de collaboration
    let emailSent = false;

    // 1. Envoi prioritaire via le service SMTP officiel (mail.lien-bio.site / info@lien-bio.site)
    try {
      const emailResult = await sendEmail({
        to: trimmedEmail,
        subject: emailSubject,
        html: emailBodyHtml,
        from: `Lien-Bio <${process.env.SMTP_USER || 'info@lien-bio.site'}>`,
        replyTo: user.email || 'info@lien-bio.site',
      });
      if (emailResult.success) {
        emailSent = true;
      } else {
        console.warn('sendEmail via SMTP error in /api/team:', emailResult.error);
      }
    } catch (err) {
      console.warn('sendEmail error in /api/team:', err);
    }

    // 2. Fallback via Resend si API key configurée et SMTP échoué
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!emailSent && resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Lien-Bio <contact@lien-bio.site>',
            to: [trimmedEmail],
            subject: emailSubject,
            html: emailBodyHtml,
          }),
        });
        if (res.ok) emailSent = true;
      } catch (err) {
        console.warn('Resend send failed:', err);
      }
    }

    // 3. Fallback via Supabase Auth Admin si SERVICE_ROLE_KEY est disponible
    const adminSupabase = getAdminSupabase();
    if (!emailSent && adminSupabase) {
      try {
        const { error: inviteErr } = await adminSupabase.auth.admin.inviteUserByEmail(
          trimmedEmail,
          {
            redirectTo: acceptUrl,
            data: {
              invited_by: inviterName,
              card_title: cardTitle,
              role: validRole,
            },
          }
        );
        if (!inviteErr) {
          emailSent = true;
        } else {
          console.warn('Supabase inviteUserByEmail note:', inviteErr.message);
        }
      } catch (sbErr) {
        console.warn('Supabase invite email error:', sbErr);
      }
    }

    const mailtoSubject = `${inviterName} vous invite à gérer sa carte Lien-Bio en tant que ${roleLabel}`;
    const mailtoBody = `Bonjour,\n\n${inviterName} vous a invité(e) en tant que ${roleLabel} sur sa carte de visite digitale Lien-Bio (${cardTitle}).\n\nCliquez sur ce lien pour accepter l'invitation et accéder à la gestion de la carte :\n${acceptUrl}\n\nÀ très vite !`;
    const mailtoUrl = `mailto:${encodeURIComponent(trimmedEmail)}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;

    const message = emailSent
      ? isReinvite
        ? `L'e-mail d'invitation a été réexpédié avec succès à ${trimmedEmail} ! ✉️`
        : `Collaborateur invité avec succès en tant que ${roleLabel} ! Un e-mail d'invitation a été envoyé à ${trimmedEmail}.`
      : isReinvite
        ? `Rôle mis à jour. Vous pouvez lui transmettre le lien direct ou ouvrir votre messagerie.`
        : `Collaborateur ajouté à l’équipe en tant que ${roleLabel} ! Vous pouvez lui transmettre le lien direct ou ouvrir votre messagerie.`;

    return NextResponse.json({
      success: true,
      emailSent,
      isReinvite,
      acceptUrl,
      mailtoUrl,
      message,
      member: newMember,
    });
  } catch (error: any) {
    console.error('Error in POST /api/team:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l’invitation du collaborateur' },
      { status: 500 }
    );
  }
}

// DELETE: Révoquer un collaborateur
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ error: 'Identifiant du membre requis' }, { status: 400 });
    }

    // 1. Mettre à jour profiles.theme.team_members
    const { data: ownProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!ownProfile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    const currentTheme = ownProfile.theme || {};
    const existingMembers: TeamMember[] = currentTheme.team_members || [];
    const updatedMembers = existingMembers.filter((m) => m.id !== memberId);

    await supabase
      .from('profiles')
      .update({
        theme: {
          ...currentTheme,
          team_members: updatedMembers,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // 2. Supprimer de team_members SQL si existant
    try {
      await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('card_owner_id', user.id);
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Accès du collaborateur révoqué avec succès.',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/team:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la révocation' },
      { status: 500 }
    );
  }
}

// PATCH: Accepter une invitation de collaboration (passe le statut de 'pending' à 'accepted')
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userEmail = user.email?.toLowerCase().trim() || '';
    if (!userEmail) {
      return NextResponse.json({ error: 'Adresse e-mail non définie' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { cardId, cardUsername } = body;

    const db = getAdminSupabase() || supabase;

    // Trouver le profil de la carte hôte
    let query = db.from('profiles').select('*');
    if (cardId) {
      query = query.eq('id', cardId);
    } else if (cardUsername) {
      query = query.eq('username', cardUsername);
    } else {
      return NextResponse.json(
        { error: 'Identifiant de carte ou nom d’utilisateur requis' },
        { status: 400 }
      );
    }

    const { data: hostProfile, error: hostErr } = await query.maybeSingle();
    if (hostErr || !hostProfile) {
      return NextResponse.json({ error: 'Carte hôte introuvable' }, { status: 404 });
    }

    const currentTheme = hostProfile.theme || {};
    const teamMembers: TeamMember[] = currentTheme.team_members || [];
    const myIndex = teamMembers.findIndex(
      (m) => m.member_email.toLowerCase() === userEmail
    );

    if (myIndex === -1) {
      return NextResponse.json(
        { error: 'Aucune invitation trouvée pour votre adresse e-mail sur cette carte' },
        { status: 403 }
      );
    }

    // Mettre à jour le membre avec status = 'accepted'
    const updatedMember: TeamMember = {
      ...teamMembers[myIndex],
      status: 'accepted',
    };
    teamMembers[myIndex] = updatedMember;

    // 1. Sauvegarder dans profiles.theme.team_members
    await db
      .from('profiles')
      .update({
        theme: {
          ...currentTheme,
          team_members: teamMembers,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', hostProfile.id);

    // 2. Mettre à jour dans la table SQL `team_members` si elle existe
    try {
      await db
        .from('team_members')
        .update({
          status: 'accepted',
          member_user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('card_owner_id', hostProfile.id)
        .eq('member_email', userEmail);
    } catch {}

    const roleLabel = updatedMember.role === 'admin' ? 'Co-Administrateur' : 'Assistant';
    return NextResponse.json({
      success: true,
      message: `Invitation acceptée ! Vous gérez désormais la carte de ${hostProfile.display_name || hostProfile.username} en tant que ${roleLabel}.`,
      card: {
        id: hostProfile.id,
        username: hostProfile.username,
        display_name: hostProfile.display_name,
        role: updatedMember.role,
        status: 'accepted',
      },
    });
  } catch (err: any) {
    console.error('Error in PATCH /api/team:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de l’acceptation de l’invitation' },
      { status: 500 }
    );
  }
}
