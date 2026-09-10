-- Migration SQL: Nom de Domaine Personnalisé pour la formule PRO
-- Lien-Bio Custom Domains

-- 1. Ajout de la colonne custom_domain (domaine unique saisi par l'utilisateur)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) UNIQUE;

-- 2. Ajout de la colonne custom_domain_status (statut DNS: 'pending', 'active', 'error')
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_domain_status VARCHAR(50) DEFAULT 'pending';

-- 3. Création d'un index pour accélérer le routage par le middleware Next.js
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain 
ON public.profiles(custom_domain);

-- 4. Politique de sécurité RLS: tout le monde peut lire custom_domain pour permettre le routage public
DROP POLICY IF EXISTS "Public can view custom domains" ON public.profiles;
CREATE POLICY "Public can view custom domains"
ON public.profiles FOR SELECT
USING (true);
