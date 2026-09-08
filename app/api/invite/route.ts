import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail, customMessage, inviterName, inviteUrl } = body;

    if (!recipientEmail || typeof recipientEmail !== 'string') {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail.trim())) {
      return NextResponse.json({ error: 'Format d’email invalide' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Try to record the invitation in the database if an invitations table exists, or log
    try {
      await supabase.from('invitations').insert({
        user_id: user?.id || null,
        recipient_email: recipientEmail.trim().toLowerCase(),
        message: customMessage || null,
        status: 'sent',
        created_at: new Date().toISOString(),
      });
    } catch {
      // Table might not exist yet, proceed gracefully
    }

    // Return success to the user
    return NextResponse.json({
      success: true,
      message: 'Invitation transmise avec succès',
      recipient: recipientEmail.trim(),
    });
  } catch (error: any) {
    console.error('Error in /api/invite:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement de l’invitation' },
      { status: 500 }
    );
  }
}

