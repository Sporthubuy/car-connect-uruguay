-- =============================================================
-- RLS Policies for Admin & Brand Admin CRUD
-- Covers: models, trims, leads, events, benefits, vehicle_activations
-- Run after supabase-brands-module.sql
-- =============================================================

-- Helper: check if current user is super-admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is brand_admin for a given brand
CREATE OR REPLACE FUNCTION public.is_brand_admin_of(brand_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.brand_admins
    WHERE user_id = auth.uid() AND brand_id = brand_uuid
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================
-- MODELS
-- =============================================================
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS models_public_read ON public.models;
CREATE POLICY models_public_read ON public.models
  FOR SELECT USING (true);

DROP POLICY IF EXISTS models_admin_all ON public.models;
CREATE POLICY models_admin_all ON public.models
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS models_brand_admin_manage ON public.models;
CREATE POLICY models_brand_admin_manage ON public.models
  FOR ALL USING (public.is_brand_admin_of(brand_id))
  WITH CHECK (public.is_brand_admin_of(brand_id));

-- =============================================================
-- TRIMS
-- =============================================================
ALTER TABLE public.trims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trims_public_read ON public.trims;
CREATE POLICY trims_public_read ON public.trims
  FOR SELECT USING (true);

DROP POLICY IF EXISTS trims_admin_all ON public.trims;
CREATE POLICY trims_admin_all ON public.trims
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS trims_brand_admin_manage ON public.trims;
CREATE POLICY trims_brand_admin_manage ON public.trims
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.models m
      JOIN public.brand_admins ba ON ba.brand_id = m.brand_id
      WHERE m.id = trims.model_id AND ba.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.models m
      JOIN public.brand_admins ba ON ba.brand_id = m.brand_id
      WHERE m.id = trims.model_id AND ba.user_id = auth.uid()
    )
  );

-- =============================================================
-- LEADS
-- =============================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS leads_insert_anyone ON public.leads;
CREATE POLICY leads_insert_anyone ON public.leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS leads_read_own ON public.leads;
CREATE POLICY leads_read_own ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS leads_admin_all ON public.leads;
CREATE POLICY leads_admin_all ON public.leads
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS leads_brand_admin_manage ON public.leads;
CREATE POLICY leads_brand_admin_manage ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trims t
      JOIN public.models m ON m.id = t.model_id
      JOIN public.brand_admins ba ON ba.brand_id = m.brand_id
      WHERE t.id = leads.car_id AND ba.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS leads_brand_admin_update ON public.leads;
CREATE POLICY leads_brand_admin_update ON public.leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trims t
      JOIN public.models m ON m.id = t.model_id
      JOIN public.brand_admins ba ON ba.brand_id = m.brand_id
      WHERE t.id = leads.car_id AND ba.user_id = auth.uid()
    )
  );

-- =============================================================
-- EVENTS
-- =============================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS events_public_read ON public.events;
CREATE POLICY events_public_read ON public.events
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS events_admin_all ON public.events;
CREATE POLICY events_admin_all ON public.events
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS events_brand_admin_manage ON public.events;
CREATE POLICY events_brand_admin_manage ON public.events
  FOR ALL USING (public.is_brand_admin_of(brand_id))
  WITH CHECK (public.is_brand_admin_of(brand_id));

-- =============================================================
-- BENEFITS
-- =============================================================
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS benefits_public_read ON public.benefits;
CREATE POLICY benefits_public_read ON public.benefits
  FOR SELECT USING (is_active = true AND valid_until >= CURRENT_DATE);

DROP POLICY IF EXISTS benefits_admin_all ON public.benefits;
CREATE POLICY benefits_admin_all ON public.benefits
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS benefits_brand_admin_manage ON public.benefits;
CREATE POLICY benefits_brand_admin_manage ON public.benefits
  FOR ALL USING (public.is_brand_admin_of(brand_id))
  WITH CHECK (public.is_brand_admin_of(brand_id));

-- =============================================================
-- VEHICLE ACTIVATIONS
-- =============================================================
ALTER TABLE public.vehicle_activations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activations_own_insert ON public.vehicle_activations;
CREATE POLICY activations_own_insert ON public.vehicle_activations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS activations_own_read ON public.vehicle_activations;
CREATE POLICY activations_own_read ON public.vehicle_activations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS activations_admin_all ON public.vehicle_activations;
CREATE POLICY activations_admin_all ON public.vehicle_activations
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS activations_brand_admin_read ON public.vehicle_activations;
CREATE POLICY activations_brand_admin_read ON public.vehicle_activations
  FOR SELECT USING (public.is_brand_admin_of(brand_id));

DROP POLICY IF EXISTS activations_brand_admin_update ON public.vehicle_activations;
CREATE POLICY activations_brand_admin_update ON public.vehicle_activations
  FOR UPDATE USING (public.is_brand_admin_of(brand_id));
