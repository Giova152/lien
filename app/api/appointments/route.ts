import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { AppointmentBooking, AppointmentStatus, LocationType } from '@/types';
import { sendEmail } from '@/lib/email';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function formatLocationText(type?: LocationType, details?: string): { label: string; actionUrl?: string; info: string } {
  switch (type) {
    case 'google_meet':
      return {
        label: 'Google Meet (Visioconférence)',
        actionUrl: details?.startsWith('http') ? details : undefined,
        info: details || 'Lien Google Meet transmis par le créateur.',
      };
    case 'zoom':
      return {
        label: 'Zoom (Visioconférence)',
        actionUrl: details?.startsWith('http') ? details : undefined,
        info: details || 'Lien Zoom transmis par le créateur.',
      };
    case 'phone':
      return {
        label: 'Appel Téléphonique',
        info: details ? `Consigne : ${details}` : 'Appel téléphonique direct.',
      };
    case 'physical':
      return {
        label: 'Rendez-vous en présentiel',
        info: details ? `Adresse : ${details}` : 'Lieu convenu avec le créateur.',
      };
    case 'custom_link':
      return {
        label: 'Visioconférence en ligne',
        actionUrl: details?.startsWith('http') ? details : undefined,
        info: details || 'Lien de visioconférence.',
      };
    default:
      return {
        label: 'Visioconférence',
        actionUrl: details?.startsWith('http') ? details : undefined,
        info: details || 'En ligne',
      };
  }
}

// GET: Récupère les rendez-vous d'une carte (Dashboard) ou la liste des créneaux réservés (Public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const date = searchParams.get('date');

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let targetProfileId = profileId || user?.id;
    if (!targetProfileId) {
      return NextResponse.json({ error: 'Identifiant de profil requis' }, { status: 400 });
    }

    const isOwnerOrMember = Boolean(user && user.id === targetProfileId);

    let appointments: AppointmentBooking[] = [];

    // 1. Essayer de lire depuis la table SQL `appointments`
    try {
      let query = supabase.from('appointments').select('*').eq('profile_id', targetProfileId);
      if (date) {
        query = query.eq('date', date);
      }
      const { data: sqlAppts, error: sqlErr } = await query;
      if (!sqlErr && sqlAppts && sqlAppts.length > 0) {
        appointments = sqlAppts as AppointmentBooking[];
      }
    } catch {}

    // 2. Si rien en SQL, récupérer depuis `profiles.theme.appointments` (Fallback JSONB)
    if (appointments.length === 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', targetProfileId)
        .maybeSingle();

      if (profile?.theme?.appointments) {
        let list = (profile.theme.appointments as AppointmentBooking[]) || [];
        if (date) {
          list = list.filter((a) => a.date === date);
        }
        appointments = list;
      }
    }

    // Filtre des données selon le rôle (masquer données perso si simple visiteur public)
    if (!isOwnerOrMember) {
      const publicTakenSlots = appointments
        .filter((a) => a.status !== 'cancelled')
        .map((a) => ({
          date: a.date,
          time_slot: a.time_slot,
          service_id: a.service_id,
        }));

      return NextResponse.json({
        success: true,
        takenSlots: publicTakenSlots,
      });
    }

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error: any) {
    console.error('Error in GET /api/appointments:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du chargement des rendez-vous' },
      { status: 500 }
    );
  }
}

// POST: Réserver un créneau de rendez-vous (Public & Clients)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      profileId,
      serviceId,
      serviceTitle,
      clientName,
      clientEmail,
      clientPhone,
      date,
      timeSlot,
      notes,
      location_type,
      location_details,
      is_paid,
    } = body;

    if (!profileId || !serviceId || !clientName || !clientEmail || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être renseignés.' },
        { status: 400 }
      );
    }

    const trimmedEmail = clientEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Adresse e-mail invalide' }, { status: 400 });
    }

    const supabaseAdmin = getAdminSupabase();
    const supabase = await createClient();
    const activeClient = supabaseAdmin || supabase;

    // 1. Récupérer le profil du propriétaire de la carte
    const { data: ownerProfile, error: ownerErr } = await activeClient
      .from('profiles')
      .select('id, username, display_name, title, theme')
      .eq('id', profileId)
      .maybeSingle();

    if (ownerErr || !ownerProfile) {
      return NextResponse.json({ error: 'Profil de destination introuvable.' }, { status: 404 });
    }

    // 2. Vérifier si le créneau est déjà réservé pour cette date
    let existingAppts: AppointmentBooking[] = [];
    try {
      const { data: sqlAppts } = await activeClient
        .from('appointments')
        .select('*')
        .eq('profile_id', profileId)
        .eq('date', date)
        .neq('status', 'cancelled');
      if (sqlAppts) existingAppts = sqlAppts as AppointmentBooking[];
    } catch {}

    if (existingAppts.length === 0 && ownerProfile.theme?.appointments) {
      existingAppts = (ownerProfile.theme.appointments as AppointmentBooking[]).filter(
        (a) => a.date === date && a.status !== 'cancelled'
      );
    }

    const isSlotTaken = existingAppts.some((a) => a.time_slot === timeSlot);
    if (isSlotTaken) {
      return NextResponse.json(
        { error: 'Ce créneau horaire est déjà réservé. Veuillez choisir un autre horaire.' },
        { status: 409 }
      );
    }

    const newAppointment: AppointmentBooking = {
      id: crypto.randomUUID(),
      profile_id: profileId,
      service_id: serviceId,
      service_title: serviceTitle || 'Consultation / Accompagnement',
      client_name: clientName.trim(),
      client_email: trimmedEmail,
      client_phone: clientPhone?.trim() || '',
      date,
      time_slot: timeSlot,
      status: 'confirmed',
      notes: notes?.trim() || '',
      location_type: location_type || 'google_meet',
      location_details: location_details || '',
      is_paid: Boolean(is_paid),
      payment_status: is_paid ? 'pending' : 'free',
      created_at: new Date().toISOString(),
    };

    // Sauvegarde 1 : Table SQL `appointments`
    try {
      await activeClient.from('appointments').insert({
        id: newAppointment.id,
        profile_id: newAppointment.profile_id,
        service_id: newAppointment.service_id,
        service_title: newAppointment.service_title,
        client_name: newAppointment.client_name,
        client_email: newAppointment.client_email,
        client_phone: newAppointment.client_phone,
        date: newAppointment.date,
        time_slot: newAppointment.time_slot,
        status: newAppointment.status,
        notes: newAppointment.notes,
        created_at: newAppointment.created_at,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Fallback appointments SQL insert failed:', e);
    }

    // Sauvegarde 2 : Reprise dans JSONB `theme.appointments` pour résilience
    try {
      const currentTheme = ownerProfile.theme || {};
      const currentAppointments: AppointmentBooking[] = currentTheme.appointments || [];
      const updatedAppointments = [newAppointment, ...currentAppointments];

      await activeClient
        .from('profiles')
        .update({
          theme: {
            ...currentTheme,
            appointments: updatedAppointments,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);
    } catch (e) {
      console.warn('Fallback appointments JSONB update failed:', e);
    }

    // 3. Récupérer l'email du créateur (Hôte) pour lui envoyer la notification
    let hostEmail: string | null = null;
    if (supabaseAdmin) {
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profileId);
        if (authUser?.user?.email) {
          hostEmail = authUser.user.email;
        }
      } catch (err) {
        console.warn('Could not fetch host email via admin API:', err);
      }
    }

    // Fallback: vérifier dans contacts du créateur
    if (!hostEmail) {
      try {
        const { data: contact } = await activeClient
          .from('contacts')
          .select('email')
          .eq('profile_id', profileId)
          .maybeSingle();
        if (contact?.email) {
          hostEmail = contact.email;
        }
      } catch {}
    }

    // 4. Envoi des e-mails (Client + Hôte)
    const providerName = ownerProfile.display_name || ownerProfile.username;
    const locInfo = formatLocationText(location_type, location_details);

    // A. E-mail au CLIENT
    try {
      const clientHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rendez-vous confirmé — Lien-Bio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <div style="display: inline-block; background-color: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px;">
      ✓ Rendez-vous confirmé
    </div>

    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
      Votre réservation avec ${providerName}
    </h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
      Bonjour <strong>${clientName}</strong>, votre créneau pour la prestation <strong>${serviceTitle}</strong> a bien été réservé.
    </p>

    <div style="background-color: #f1f5f9; border-radius: 14px; padding: 18px; margin-bottom: 24px; font-size: 14px; color: #1e293b;">
      <p style="margin: 0 0 10px 0;"><strong>📅 Date :</strong> ${date}</p>
      <p style="margin: 0 0 10px 0;"><strong>⏰ Heure :</strong> ${timeSlot}</p>
      <p style="margin: 0 0 10px 0;"><strong>👤 Intervenant :</strong> ${providerName}</p>
      <p style="margin: 0 0 0 0;"><strong>📍 Modalité :</strong> ${locInfo.label}</p>
      ${locInfo.info ? `<p style="margin: 6px 0 0 0; color: #475569; font-size: 13px;">${locInfo.info}</p>` : ''}
    </div>

    ${
      locInfo.actionUrl
        ? `
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${locInfo.actionUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
        👉 Rejoindre la réunion en visio
      </a>
    </div>
    `
        : ''
    }

    ${
      notes
        ? `
    <div style="border-left: 3px solid #cbd5e1; padding-left: 12px; margin-bottom: 24px;">
      <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0; font-weight: 600;">Vos notes transmises :</p>
      <p style="font-size: 13px; color: #334155; margin: 0;">« ${notes} »</p>
    </div>
    `
        : ''
    }

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
      Propulsé par <a href="https://www.lien-bio.site" style="color: #6366f1; text-decoration: none;">Lien-Bio Calendar</a>
    </p>
  </div>
</body>
</html>
      `;

      await sendEmail({
        to: trimmedEmail,
        subject: `Confirmation de votre rendez-vous : ${serviceTitle} avec ${providerName}`,
        html: clientHtml,
        replyTo: hostEmail || undefined,
      });
    } catch (err) {
      console.warn('Client appointment email failed:', err);
    }

    // B. E-mail à l'ADMIN / CRÉATEUR DE LA CARTE
    if (hostEmail) {
      try {
        const hostHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Nouveau rendez-vous réservé — Lien-Bio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <div style="display: inline-block; background-color: #eef2ff; color: #4f46e5; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px;">
      🔔 Nouvelle réservation reçue
    </div>

    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
      ${clientName} a réservé un créneau
    </h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
      Un nouveau rendez-vous a été planifié pour <strong>${serviceTitle}</strong>.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 20px; font-size: 14px; color: #1e293b;">
      <p style="margin: 0 0 10px 0;"><strong>📅 Date :</strong> ${date}</p>
      <p style="margin: 0 0 10px 0;"><strong>⏰ Heure :</strong> ${timeSlot}</p>
      <p style="margin: 0 0 10px 0;"><strong>👤 Client :</strong> ${clientName}</p>
      <p style="margin: 0 0 10px 0;"><strong>✉️ Email :</strong> <a href="mailto:${trimmedEmail}" style="color: #4f46e5;">${trimmedEmail}</a></p>
      ${clientPhone ? `<p style="margin: 0 0 10px 0;"><strong>📞 Téléphone :</strong> <a href="tel:${clientPhone}" style="color: #4f46e5;">${clientPhone}</a></p>` : ''}
      <p style="margin: 0 0 0 0;"><strong>📍 Lieu configuré :</strong> ${locInfo.label} (${locInfo.info})</p>
    </div>

    ${
      notes
        ? `
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
      <p style="font-size: 12px; color: #b45309; margin: 0 0 4px 0; font-weight: 700;">Message / Objet du client :</p>
      <p style="font-size: 13px; color: #78350f; margin: 0;">« ${notes} »</p>
    </div>
    `
        : ''
    }

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://calendar.lien-bio.site" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
        Ouvrir mon Agenda Calendar Pro →
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
      Lien-Bio Calendar — Notification automatique
    </p>
  </div>
</body>
</html>
        `;

        await sendEmail({
          to: hostEmail,
          subject: `🔔 Nouveau rendez-vous : ${clientName} (${serviceTitle})`,
          html: hostHtml,
          replyTo: trimmedEmail,
        });
      } catch (err) {
        console.warn('Host appointment email failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Votre rendez-vous a été confirmé avec succès ! 🎉',
      appointment: newAppointment,
    });
  } catch (error: any) {
    console.error('Error in POST /api/appointments:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la réservation du rendez-vous' },
      { status: 500 }
    );
  }
}

// PATCH: Mettre à jour le statut d'un rendez-vous (Dashboard)
export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = getAdminSupabase();
    const supabase = await createClient();
    const activeClient = supabaseAdmin || supabase;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId, status, reason } = body;

    if (!appointmentId || !status) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const validStatus: AppointmentStatus = status;

    // 1. Récupérer le rendez-vous actuel
    let targetAppt: AppointmentBooking | null = null;
    try {
      const { data: apptData } = await activeClient
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .maybeSingle();
      if (apptData) targetAppt = apptData as AppointmentBooking;
    } catch {}

    // Récupérer le profil du créateur
    const { data: ownProfile } = await activeClient
      .from('profiles')
      .select('id, username, display_name, title, theme')
      .eq('id', user.id)
      .maybeSingle();

    if (!targetAppt && ownProfile?.theme?.appointments) {
      targetAppt = (ownProfile.theme.appointments as AppointmentBooking[]).find(
        (a) => a.id === appointmentId
      ) || null;
    }

    // 2. Mise à jour Table SQL
    try {
      await activeClient
        .from('appointments')
        .update({ status: validStatus, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);
    } catch {}

    // 3. Mise à jour Theme JSONB
    if (ownProfile) {
      const currentTheme = ownProfile.theme || {};
      const currentAppts: AppointmentBooking[] = currentTheme.appointments || [];
      const updatedAppts = currentAppts.map((a) =>
        a.id === appointmentId ? { ...a, status: validStatus } : a
      );

      await activeClient
        .from('profiles')
        .update({
          theme: { ...currentTheme, appointments: updatedAppts },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    // 4. Envoi d'e-mail de notification de changement de statut (notamment Annulation)
    if (targetAppt) {
      const providerName = ownProfile?.display_name || ownProfile?.username || 'Votre intervenant';
      const clientEmail = targetAppt.client_email;
      const hostEmail = user.email;

      if (validStatus === 'cancelled') {
        // A. E-mail au Client (Annulation)
        if (clientEmail) {
          try {
            const clientCancelHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rendez-vous annulé — Lien-Bio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <div style="display: inline-block; background-color: #fef2f2; color: #dc2626; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px;">
      ✕ Rendez-vous annulé
    </div>

    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
      Annulation de votre rendez-vous
    </h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
      Bonjour <strong>${targetAppt.client_name}</strong>, votre rendez-vous pour <strong>${targetAppt.service_title}</strong> prévu avec <strong>${providerName}</strong> a été annulé.
    </p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 14px; padding: 18px; margin-bottom: 24px; font-size: 14px; color: #991b1b;">
      <p style="margin: 0 0 8px 0;"><strong>📅 Date initiale :</strong> ${targetAppt.date}</p>
      <p style="margin: 0 0 8px 0;"><strong>⏰ Heure :</strong> ${targetAppt.time_slot}</p>
      <p style="margin: 0 0 0 0;"><strong>👤 Avec :</strong> ${providerName}</p>
      ${reason ? `<p style="margin: 8px 0 0 0; font-size: 13px;"><strong>Motif :</strong> ${reason}</p>` : ''}
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://calendar.lien-bio.site/${ownProfile?.username || ''}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
        Choisir un nouveau créneau →
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
      Lien-Bio Calendar — Notification automatique
    </p>
  </div>
</body>
</html>
            `;

            await sendEmail({
              to: clientEmail,
              subject: `✕ Rendez-vous annulé : ${targetAppt.service_title} avec ${providerName}`,
              html: clientCancelHtml,
              replyTo: hostEmail || undefined,
            });
          } catch (err) {
            console.warn('Client cancellation email failed:', err);
          }
        }

        // B. E-mail au Créateur (Confirmation d'annulation)
        if (hostEmail) {
          try {
            const hostCancelHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rendez-vous annulé — Lien-Bio</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;">
    <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0;">
      Rendez-vous annulé avec succès
    </h2>
    <p style="font-size: 14px; color: #475569;">
      Le rendez-vous avec <strong>${targetAppt.client_name}</strong> (${targetAppt.service_title}) prévu le <strong>${targetAppt.date} à ${targetAppt.time_slot}</strong> a bien été marqué comme annulé.
    </p>
    <p style="font-size: 13px; color: #64748b;">
      Le créneau horaire a été libéré sur votre agenda public.
    </p>
    <div style="margin-top: 20px;">
      <a href="https://calendar.lien-bio.site" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 700; font-size: 12px; padding: 10px 20px; border-radius: 10px; text-decoration: none;">
        Voir mon agenda →
      </a>
    </div>
  </div>
</body>
</html>
            `;

            await sendEmail({
              to: hostEmail,
              subject: `✕ Annulation confirmée : ${targetAppt.client_name} (${targetAppt.date})`,
              html: hostCancelHtml,
              replyTo: clientEmail,
            });
          } catch (err) {
            console.warn('Host cancellation email failed:', err);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Statut du rendez-vous mis à jour et notifications envoyées.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE: Annuler/Supprimer un rendez-vous (Dashboard)
export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getAdminSupabase();
    const supabase = await createClient();
    const activeClient = supabaseAdmin || supabase;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json({ error: 'Identifiant requis' }, { status: 400 });
    }

    try {
      await activeClient.from('appointments').delete().eq('id', appointmentId);
    } catch {}

    const { data: ownProfile } = await activeClient
      .from('profiles')
      .select('theme')
      .eq('id', user.id)
      .maybeSingle();

    if (ownProfile) {
      const currentTheme = ownProfile.theme || {};
      const currentAppts: AppointmentBooking[] = currentTheme.appointments || [];
      const updatedAppts = currentAppts.filter((a) => a.id !== appointmentId);

      await activeClient
        .from('profiles')
        .update({
          theme: { ...currentTheme, appointments: updatedAppts },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous supprimé.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
