-- ============================================================
-- Admin RLS v2: site_settings + policies for reviews/comments/communities
-- Run this in the Supabase SQL editor
-- ============================================================

-- ========================
-- 1. SITE SETTINGS TABLE
-- ========================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
CREATE POLICY site_settings_public_read ON public.site_settings
  FOR SELECT USING (true);

-- Admin write (insert/update/delete)
DROP POLICY IF EXISTS site_settings_admin_all ON public.site_settings;
CREATE POLICY site_settings_admin_all ON public.site_settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Seed default hero values
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_badge', '"La plataforma #1 de autos en Uruguay"'),
  ('hero_title', '"Encontrá tu próximo auto 0km"'),
  ('hero_subtitle', '"Compará precios, leé reviews de expertos y conectá directamente con concesionarios. Todo en un solo lugar."'),
  ('hero_cta_primary_text', '"Explorar autos"'),
  ('hero_cta_primary_link', '"/autos"'),
  ('hero_cta_secondary_text', '"Ver reviews"'),
  ('hero_cta_secondary_link', '"/reviews"')
ON CONFLICT (key) DO NOTHING;

-- ========================
-- 2. REVIEW POSTS — Admin CRUD
-- ========================

DROP POLICY IF EXISTS review_posts_admin_all ON public.review_posts;
CREATE POLICY review_posts_admin_all ON public.review_posts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ========================
-- 3. COMMENTS — Admin CRUD
-- ========================

DROP POLICY IF EXISTS comments_admin_all ON public.comments;
CREATE POLICY comments_admin_all ON public.comments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ========================
-- 4. COMMUNITIES — Admin CRUD
-- ========================

DROP POLICY IF EXISTS communities_admin_all ON public.communities;
CREATE POLICY communities_admin_all ON public.communities
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ========================
-- 5. COMMUNITY POSTS — Admin CRUD
-- ========================

DROP POLICY IF EXISTS community_posts_admin_all ON public.community_posts;
CREATE POLICY community_posts_admin_all ON public.community_posts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
