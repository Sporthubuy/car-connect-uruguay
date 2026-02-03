-- ============================================================
-- CarWow LATAM - Módulo Marcas (MVP)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ========================
-- 1. ALTER brands: agregar is_active
-- ========================
ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Hacer logo_url nullable (algunas marcas pueden no tener logo al inicio)
ALTER TABLE brands ALTER COLUMN logo_url DROP NOT NULL;

-- ========================
-- 2. NUEVA TABLA: brand_contacts
-- ========================
CREATE TABLE IF NOT EXISTS brand_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  department TEXT,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, email)
);

CREATE INDEX IF NOT EXISTS idx_brand_contacts_brand ON brand_contacts(brand_id);

-- ========================
-- 3. NUEVA TABLA: brand_admins
-- ========================
CREATE TABLE IF NOT EXISTS brand_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_admins_brand ON brand_admins(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_admins_user ON brand_admins(user_id);

-- ========================
-- 4. RLS: brand_contacts
-- ========================
ALTER TABLE brand_contacts ENABLE ROW LEVEL SECURITY;

-- Admin: CRUD completo
DROP POLICY IF EXISTS "brand_contacts_admin_all" ON brand_contacts;
CREATE POLICY "brand_contacts_admin_all" ON brand_contacts
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Brand admin: CRUD completo de contactos de su marca
DROP POLICY IF EXISTS "brand_contacts_brand_admin_read" ON brand_contacts;
DROP POLICY IF EXISTS "brand_contacts_brand_admin_manage" ON brand_contacts;
CREATE POLICY "brand_contacts_brand_admin_manage" ON brand_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brand_admins
      WHERE brand_admins.brand_id = brand_contacts.brand_id
        AND brand_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brand_admins
      WHERE brand_admins.brand_id = brand_contacts.brand_id
        AND brand_admins.user_id = auth.uid()
    )
  );

-- ========================
-- 5. RLS: brand_admins
-- ========================
ALTER TABLE brand_admins ENABLE ROW LEVEL SECURITY;

-- Admin: CRUD completo
DROP POLICY IF EXISTS "brand_admins_admin_all" ON brand_admins;
CREATE POLICY "brand_admins_admin_all" ON brand_admins
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Brand admin: lectura de admins de su propia marca
DROP POLICY IF EXISTS "brand_admins_brand_admin_read" ON brand_admins;
CREATE POLICY "brand_admins_brand_admin_read" ON brand_admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_admins ba
      WHERE ba.brand_id = brand_admins.brand_id
        AND ba.user_id = auth.uid()
    )
  );

-- ========================
-- 6. RLS: brands (actualizar políticas)
-- ========================
-- Nota: la tabla brands ya tiene RLS habilitado y policy de lectura pública.
-- Agregamos policies para admin CRUD y restringimos lectura pública a is_active.

-- Admin: CRUD completo en brands
DROP POLICY IF EXISTS "brands_admin_all" ON brands;
CREATE POLICY "brands_admin_all" ON brands
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Brand admin: lectura de su marca (incluso inactiva)
DROP POLICY IF EXISTS "brands_brand_admin_read" ON brands;
CREATE POLICY "brands_brand_admin_read" ON brands
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_admins
      WHERE brand_admins.brand_id = brands.id
        AND brand_admins.user_id = auth.uid()
    )
  );

-- Actualizar la política pública existente para filtrar solo activas
-- Primero eliminamos la vieja si existe, luego creamos la nueva
DROP POLICY IF EXISTS "brands_public_read" ON brands;
CREATE POLICY "brands_public_read" ON brands
  FOR SELECT
  USING (is_active = TRUE);

-- ========================
-- 7. RLS: profiles (permitir que admin lea todos los perfiles)
-- ========================
-- Policy para que admin pueda buscar usuarios por email
DROP POLICY IF EXISTS "profiles_admin_read_all" ON profiles;
CREATE POLICY "profiles_admin_read_all" ON profiles
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Policy para que admin pueda actualizar role de cualquier perfil
DROP POLICY IF EXISTS "profiles_admin_update_all" ON profiles;
CREATE POLICY "profiles_admin_update_all" ON profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
