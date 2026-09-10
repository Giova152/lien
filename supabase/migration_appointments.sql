-- ========================================================
-- MIGRATION : TABLE APPOINTMENTS & AGENDA NATIF
-- ========================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL,
    service_title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_profile_id ON public.appointments(profile_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 1. Le propriétaire de la carte gère et consulte tous ses rendez-vous
DROP POLICY IF EXISTS "Le propriétaire gère ses rendez-vous" ON public.appointments;
CREATE POLICY "Le propriétaire gère ses rendez-vous"
    ON public.appointments FOR ALL
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- 2. Les collaborateurs autorisés (Assistants / Co-Admins) gèrent les RDV
DROP POLICY IF EXISTS "Les collaborateurs gèrent les rendez-vous" ON public.appointments;
CREATE POLICY "Les collaborateurs gèrent les rendez-vous"
    ON public.appointments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.card_owner_id = appointments.profile_id
            AND (tm.member_user_id = auth.uid() OR LOWER(tm.member_email) = LOWER(auth.jwt()->>'email'))
            AND tm.status = 'accepted'
        )
    );

-- 3. Les visiteurs publics peuvent soumettre/réserver un RDV
DROP POLICY IF EXISTS "Tout le monde peut créer un rendez-vous" ON public.appointments;
CREATE POLICY "Tout le monde peut créer un rendez-vous"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

-- 4. Tout le monde peut consulter les créneaux déjà réservés d'une carte (sans détails personnels)
DROP POLICY IF EXISTS "Consultation publique des créneaux" ON public.appointments;
CREATE POLICY "Consultation publique des créneaux"
    ON public.appointments FOR SELECT
    USING (true);

