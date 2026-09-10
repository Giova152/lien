import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Service d'envoi d'e-mails universel
 * Priorité 1 : SMTP (LWS / cPanel / Hostinger avec info@lien-bio.site)
 * Priorité 2 : Resend API
 */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions): Promise<{ success: boolean; error?: any }> {
  const recipients = Array.isArray(to) ? to : [to];

  // 1. Essayer d'abord via SMTP (LWS / mail.lien-bio.site)
  const smtpHost = process.env.SMTP_HOST || 'mail.lien-bio.site';
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER || 'info@lien-bio.site';
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const fromAddress = process.env.SMTP_FROM || `Lien-Bio Calendar <${smtpUser}>`;

  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465 SSL, false for 587 TLS
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false, // évite les blocages de certificat auto-signé
        },
      });

      await transporter.sendMail({
        from: fromAddress,
        to: recipients.join(', '),
        subject,
        html,
        replyTo: replyTo || smtpUser,
      });

      return { success: true };
    } catch (smtpError) {
      console.warn('SMTP sending error:', smtpError);
    }
  }

  // 2. Fallback via Resend API si configuré
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || fromAddress || 'Lien-Bio <info@lien-bio.site>',
          to: recipients,
          subject,
          html,
          reply_to: replyTo,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn('Resend API error:', errorText);
        return { success: false, error: errorText };
      }

      return { success: true };
    } catch (resendError) {
      console.warn('Resend sending error:', resendError);
      return { success: false, error: resendError };
    }
  }

  console.warn('Aucun service d’e-mail configuré (SMTP_PASS ou RESEND_API_KEY manquant).');
  return { success: false, error: 'Email configuration missing' };
}
