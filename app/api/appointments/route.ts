import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { AppointmentBooking, AppointmentStatus } from '@/types';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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

    const isOwnerOrMember = Boolean(user && (user.id === targetProfileId));

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

    // 2. Fallback depuis profiles.theme.appointments si table vide
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
    } = body;

    if (!profileId || !serviceId || !clientName || !clientEmail || !date || !timeSlot) {
      return NextResponse.json({ error: 'Tous les champs obligatoires doivent être renseignés.' }, { status: 400 });
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

    // 3. Envoi d'e-mail de confirmation via Resend si configuré
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const providerName = ownerProfile.display_name || ownerProfile.username;
        const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Rendez-vous confirmé — Lien-Bio</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 30px 15px;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 30px; border: 1px solid #e2e8f0;">
    <h2 style="font-size: 20px; font-weight: 800; color: #09090b; margin-top: 0;">📅 Rendez-vous confirmé !</h2>
    <p style="font-size: 14px; color: #475569;">Bonjour <strong>${clientName}</strong>,</p>
    <p style="font-size: 14px; color: #475569;">Votre réservation pour <strong>${serviceTitle}</strong> auprès de <strong>${providerName}</strong> est validée.</p>
    <div style="background: #f1f5f9; border-radius: 12px; padding: 15px; margin: 20px 0; font-size: 14px; color: #0f172a;">
      <p style="margin: 0 0 8px;"><strong>Date :</strong> ${date}</p>
      <p style="margin: 0 0 8px;"><strong>Heure :</strong> ${timeSlot}</p>
      <p style="margin: 0;"><strong>Intervenant :</strong> ${providerName}</p>
    </div>
    <p style="font-size: 12px; color: #94a3b8;">Propulsé par Lien-Bio — https://www.lien-bio.site</p>
  </div>
</body>
</html>
        `;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Lien-Bio <contact@lien-bio.site>',
            to: [trimmedEmail],
            subject: `Confirmation de votre rendez-vous : ${serviceTitle}`,
            html: htmlContent,
          }),
        });
      } catch (err) {
        console.warn('Resend appointment email failed:', err);
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const validStatus: AppointmentStatus = status;

    // 1. Table SQL
    try {
      await supabase
        .from('appointments')
        .update({ status: validStatus, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);
    } catch {}

    // 2. Theme JSONB
    const { data: ownProfile } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', user.id)
      .maybeSingle();

    if (ownProfile) {
      const currentTheme = ownProfile.theme || {};
      const currentAppts: AppointmentBooking[] = currentTheme.appointments || [];
      const updatedAppts = currentAppts.map((a) =>
        a.id === appointmentId ? { ...a, status: validStatus } : a
      );

      await supabase
        .from('profiles')
        .update({
          theme: { ...currentTheme, appointments: updatedAppts },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Statut du rendez-vous mis à jour.',
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
    const supabase = await createClient();
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
      await supabase.from('appointments').delete().eq('id', appointmentId);
    } catch {}

    const { data: ownProfile } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', user.id)
      .maybeSingle();

    if (ownProfile) {
      const currentTheme = ownProfile.theme || {};
      const currentAppts: AppointmentBooking[] = currentTheme.appointments || [];
      const updatedAppts = currentAppts.filter((a) => a.id !== appointmentId);

      await supabase
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

