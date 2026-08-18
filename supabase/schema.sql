-- Schema SQL complet pour l'application Link in Bio / Carte de visite digitale

-- 1. Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table `profiles`
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    title TEXT,
    company TEXT,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    theme JSONB DEFAULT '{
        "background_type": "gradient",
        "background_value": "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
        "button_style": "rounded-xl",
        "button_color": "rgba(255, 255, 255, 0.08)",
        "button_text_color": "#ffffff",
        "button_border_color": "rgba(255, 255, 255, 0.15)",
        "font_family": "Inter",
        "text_color": "#ffffff",
        "accent_color": "#6366f1",
        "card_glass": true
    }'::jsonb,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour accélérer la recherche par username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 3. Table `links`
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'custom' CHECK (type IN ('social', 'custom')),
    platform TEXT, -- ex: instagram, whatsapp, linkedin, tiktok, x, youtube, facebook, snapchat, email, tel
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    position INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    click_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_links_profile_id ON public.links(profile_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON public.links(profile_id, position);

-- 4. Table `contact_info`
CREATE TABLE IF NOT EXISTS public.contact_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    show_save_contact_button BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Table `profile_views` (analytics)
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    referrer TEXT,
    device TEXT
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON public.profile_views(viewed_at);

-- 6. Trigger pour mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_links_updated_at ON public.links;
CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON public.links
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_info_updated_at ON public.contact_info;
CREATE TRIGGER update_contact_info_updated_at
    BEFORE UPDATE ON public.contact_info
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ========================================================
-- SÉCURITÉ : ROW LEVEL SECURITY (RLS)
-- ========================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Policies pour `profiles`
DROP POLICY IF EXISTS "Lecture publique des profils publiés" ON public.profiles;
CREATE POLICY "Lecture publique des profils publiés"
    ON public.profiles FOR SELECT
    USING (is_published = true OR auth.uid() = id);

DROP POLICY IF EXISTS "Le propriétaire peut créer son profil" ON public.profiles;
CREATE POLICY "Le propriétaire peut créer son profil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Le propriétaire peut modifier son profil" ON public.profiles;
CREATE POLICY "Le propriétaire peut modifier son profil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Le propriétaire peut supprimer son profil" ON public.profiles;
CREATE POLICY "Le propriétaire peut supprimer son profil"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- Policies pour `links`
DROP POLICY IF EXISTS "Lecture publique des liens si le profil est accessible" ON public.links;
CREATE POLICY "Lecture publique des liens si le profil est accessible"
    ON public.links FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = links.profile_id
            AND (profiles.is_published = true OR profiles.id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Gestion des liens par le propriétaire" ON public.links;
CREATE POLICY "Gestion des liens par le propriétaire"
    ON public.links FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = links.profile_id
            AND profiles.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = links.profile_id
            AND profiles.id = auth.uid()
        )
    );

-- Policies pour `contact_info`
DROP POLICY IF EXISTS "Lecture publique des infos de contact si le profil est accessible" ON public.contact_info;
CREATE POLICY "Lecture publique des infos de contact si le profil est accessible"
    ON public.contact_info FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = contact_info.profile_id
            AND (profiles.is_published = true OR profiles.id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Gestion des infos de contact par le propriétaire" ON public.contact_info;
CREATE POLICY "Gestion des infos de contact par le propriétaire"
    ON public.contact_info FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = contact_info.profile_id
            AND profiles.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = contact_info.profile_id
            AND profiles.id = auth.uid()
        )
    );

-- Policies pour `profile_views`
DROP POLICY IF EXISTS "Insertion publique des vues de profil" ON public.profile_views;
CREATE POLICY "Insertion publique des vues de profil"
    ON public.profile_views FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Lecture des vues par le propriétaire du profil" ON public.profile_views;
CREATE POLICY "Lecture des vues par le propriétaire du profil"
    ON public.profile_views FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = profile_views.profile_id
            AND profiles.id = auth.uid()
        )
    );


-- ========================================================
-- STORAGE BUCKETS (avatars & covers)
-- ========================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('covers', 'covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies
DROP POLICY IF EXISTS "Lecture publique avatars" ON storage.objects;
CREATE POLICY "Lecture publique avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('avatars', 'covers'));

DROP POLICY IF EXISTS "Upload utilisateur authentifié avatars" ON storage.objects;
CREATE POLICY "Upload utilisateur authentifié avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('avatars', 'covers') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Mise à jour utilisateur authentifié avatars" ON storage.objects;
CREATE POLICY "Mise à jour utilisateur authentifié avatars"
    ON storage.objects FOR UPDATE
    USING (bucket_id IN ('avatars', 'covers') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Suppression utilisateur authentifié avatars" ON storage.objects;
CREATE POLICY "Suppression utilisateur authentifié avatars"
    ON storage.objects FOR DELETE
    USING (bucket_id IN ('avatars', 'covers') AND auth.role() = 'authenticated');
