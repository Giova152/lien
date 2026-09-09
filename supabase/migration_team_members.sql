-- ========================================================
-- MIGRATION : TABLE TEAM_MEMBERS & RLS COLLABORATEURS
-- ========================================================

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    member_email TEXT NOT NULL,
    member_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'assistant' CHECK (role IN ('admin', 'assistant')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (card_owner_id, member_email)
);

CREATE INDEX IF NOT EXISTS idx_team_members_card_owner ON public.team_members(card_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(member_email);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(member_user_id);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 1. Le propriétaire de la carte gère son équipe
DROP POLICY IF EXISTS "Le propriétaire gère son équipe" ON public.team_members;
CREATE POLICY "Le propriétaire gère son équipe"
    ON public.team_members FOR ALL
    USING (auth.uid() = card_owner_id)
    WITH CHECK (auth.uid() = card_owner_id);

-- 2. Les collaborateurs voient leurs invitations
DROP POLICY IF EXISTS "Les membres voient leurs invitations" ON public.team_members;
CREATE POLICY "Les membres voient leurs invitations"
    ON public.team_members FOR SELECT
    USING (
        auth.uid() = member_user_id 
        OR LOWER(auth.jwt()->>'email') = LOWER(member_email)
    );

-- 3. Les collaborateurs acceptés peuvent modifier les liens
DROP POLICY IF EXISTS "Collaborateurs autorisés sur links" ON public.links;
CREATE POLICY "Collaborateurs autorisés sur links"
    ON public.links FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.card_owner_id = links.profile_id
            AND (tm.member_user_id = auth.uid() OR LOWER(tm.member_email) = LOWER(auth.jwt()->>'email'))
            AND tm.status = 'accepted'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.card_owner_id = links.profile_id
            AND (tm.member_user_id = auth.uid() OR LOWER(tm.member_email) = LOWER(auth.jwt()->>'email'))
            AND tm.status = 'accepted'
        )
    );

-- 4. Les collaborateurs acceptés peuvent modifier contact_info
DROP POLICY IF EXISTS "Collaborateurs autorisés sur contact_info" ON public.contact_info;
CREATE POLICY "Collaborateurs autorisés sur contact_info"
    ON public.contact_info FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.card_owner_id = contact_info.profile_id
            AND (tm.member_user_id = auth.uid() OR LOWER(tm.member_email) = LOWER(auth.jwt()->>'email'))
            AND tm.status = 'accepted'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.card_owner_id = contact_info.profile_id
            AND (tm.member_user_id = auth.uid() OR LOWER(tm.member_email) = LOWER(auth.jwt()->>'email'))
            AND tm.status = 'accepted'
        )
    );
