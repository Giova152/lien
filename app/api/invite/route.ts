import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, customMessage, inviterName, inviteUrl } = body;

    if (!recipientEmail || typeof recipientEmail !== 'string') {
      return NextResponse.json({ error: 'Adresse e-mail requise' }, { status: 400 });
    }

    const trimmedEmail = recipientEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Format d’adresse e-mail invalide' }, { status: 400 });
    }

    const senderName = inviterName?.trim() || 'Un utilisateur de Lien-Bio';
    const finalInviteUrl =
      inviteUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.lien-bio.site'}/register`;

    // Try to record in DB if possible
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from('invitations').insert({
        user_id: user?.id || null,
        recipient_email: trimmedEmail,
        message: customMessage || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    } catch {
      // Table might not exist or user unauthenticated, proceed gracefully
    }

    // Build the mailtoUrl as fallback
    const emailSubject = `${senderName} vous invite à créer votre carte digitale sur Lien-Bio`;
    const emailBody = `Bonjour,\n\n${senderName} vous invite à découvrir Lien-Bio pour concevoir votre propre carte de visite digitale interactive et centraliser vos réseaux et liens pro.\n\n${
      customMessage ? `Message de ${senderName} :\n« ${customMessage} »\n\n` : ''
    }Cliquez ici pour créer votre compte gratuitement :\n${finalInviteUrl}\n\nÀ très vite !`;

    const mailtoUrl = `mailto:${encodeURIComponent(trimmedEmail)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    // 1. Try sending via Supabase Auth Admin if SERVICE_ROLE_KEY is present (Primary method)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (serviceRoleKey && supabaseUrl) {
      try {
        const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const siteUrl =
          process.env.NEXT_PUBLIC_APP_URL || 'https://www.lien-bio.site';
        const inviteRedirectUrl = `${siteUrl}/auth/callback?next=/onboarding`;

        const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
          trimmedEmail,
          {
            redirectTo: inviteRedirectUrl,
            data: {
              invited_by: senderName,
              custom_message: customMessage || null,
            },
          }
        );

        if (!inviteError) {
          return NextResponse.json({
            success: true,
            emailSent: true,
            provider: 'supabase',
            message: 'Invitation officielle envoyée avec succès via Supabase !',
          });
        } else {
          console.warn('Supabase inviteUserByEmail error:', inviteError);
          const rawMsg = inviteError.message || '';
          let userMsg = "Impossible d'envoyer l'invitation";

          if (rawMsg.toLowerCase().includes('already been registered') || rawMsg.toLowerCase().includes('already exists')) {
            userMsg = 'Cette adresse e-mail possède déjà un compte sur Lien-Bio.';
          } else if (rawMsg.toLowerCase().includes('rate limit')) {
            userMsg = 'Limite d’envois atteinte pour l’instant. Veuillez réessayer dans quelques minutes.';
          } else {
            userMsg = rawMsg;
          }

          return NextResponse.json(
            { error: userMsg, rawError: rawMsg },
            { status: 400 }
          );
        }
      } catch (sbErr: any) {
        console.error('Failed to send invite via Supabase admin:', sbErr);
        return NextResponse.json(
          { error: 'Erreur lors de la communication avec le serveur' },
          { status: 500 }
        );
      }
    }

    // 2. Try sending via Resend if API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'Lien-Bio <contact@lien-bio.site>';
        const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation Lien-Bio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="margin-bottom: 24px;">
      <span style="font-size: 22px; font-weight: 900; color: #09090b; letter-spacing: -0.5px;">Lien<span style="color: #4f46e5;">-Bio</span></span>
    </div>
    
    <div style="display: inline-block; background-color: #f5f3ff; color: #6d28d9; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      ✨ Invitation exclusive
    </div>

    <h1 style="font-size: 21px; color: #09090b; margin: 0 0 14px; font-weight: 800; line-height: 1.3;">
      ${senderName} vous invite sur Lien-Bio
    </h1>

    <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px;">
      Bonjour,
    </p>

    <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px;">
      <strong>${senderName}</strong> vous invite à créer votre propre carte de visite digitale professionnelle sur <strong>Lien-Bio</strong> pour regrouper tous vos liens, coordonnées et réseaux en 1 clic.
    </p>

    ${
      customMessage
        ? `<div style="background: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-style: italic; color: #334155; font-size: 14px; line-height: 22px;">
            « ${customMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')} »
          </div>`
        : ''
    }

    <div style="margin: 28px 0;">
      <a href="${finalInviteUrl}" style="display: inline-block; background: #09090b; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 30px; border-radius: 12px; text-decoration: none;">
        Créer ma carte gratuitement →
      </a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; line-height: 18px; margin: 0 0 20px;">
      Ou copiez ce lien : <br>
      <a href="${finalInviteUrl}" style="color: #4f46e5; word-break: break-all;">${finalInviteUrl}</a>
    </p>

    <div style="font-size: 12px; color: #94a3b8; line-height: 18px; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px;">
      Lien-Bio — Votre identité professionnelle en un seul lien.<br>
      <a href="https://www.lien-bio.site" style="color: #94a3b8; text-decoration: none;">https://www.lien-bio.site</a>
    </div>
  </div>
</body>
</html>
        `;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [trimmedEmail],
            subject: emailSubject,
            html: htmlContent,
          }),
        });

        if (resendRes.ok) {
          return NextResponse.json({
            success: true,
            emailSent: true,
            provider: 'resend',
            message: 'E-mail d’invitation envoyé avec succès !',
          });
        } else {
          const resendError = await resendRes.json();
          console.warn('Resend API returned error:', resendError);
        }
      } catch (resendErr) {
        console.warn('Failed to send email via Resend:', resendErr);
      }
    }

    // 3. Fallback: Return mailto link so the client can dispatch the email directly
    return NextResponse.json({
      success: true,
      emailSent: false,
      provider: 'client_mailto',
      mailtoUrl,
      message: 'Messagerie pré-remplie prête pour l’envoi',
    });
  } catch (error: any) {
    console.error('Error in /api/invite:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement de l’invitation' },
      { status: 500 }
    );
  }
}

