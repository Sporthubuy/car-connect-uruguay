-- ============================================
-- CarConnect Uruguay — Schema Fixes
-- Run this in Supabase Dashboard SQL Editor
-- ============================================

-- 1. Columnas faltantes en profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- 2. FK fix para brand_admins → profiles join
-- (Idempotent: only adds if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'brand_admins_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE brand_admins
      ADD CONSTRAINT brand_admins_user_id_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Tabla event_rsvps
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY rsvps_read_own ON event_rsvps FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY rsvps_insert_own ON event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY rsvps_delete_own ON event_rsvps FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY rsvps_admin_all ON event_rsvps FOR ALL USING (is_admin()) WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Tabla community_members
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY cm_read_own ON community_members FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY cm_insert_own ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY cm_delete_own ON community_members FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY cm_admin_all ON community_members FOR ALL USING (is_admin()) WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Tabla saved_cars
CREATE TABLE IF NOT EXISTS saved_cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trim_id UUID NOT NULL REFERENCES trims(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trim_id)
);
ALTER TABLE saved_cars ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY saved_read_own ON saved_cars FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY saved_insert_own ON saved_cars FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY saved_delete_own ON saved_cars FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Seed paginas estaticas
INSERT INTO site_settings (key, value) VALUES
  ('page_terminos', '{"title":"Terminos y Condiciones","content":"Los presentes terminos regulan el uso de la plataforma CarConnect Uruguay. Al acceder y utilizar nuestros servicios, aceptas cumplir con estas condiciones.\n\n1. Uso de la plataforma: CarConnect Uruguay es una plataforma de comparacion y contacto con concesionarias de vehiculos 0km en Uruguay.\n\n2. Registro: Al crear una cuenta, te comprometes a proporcionar informacion veridica y mantener la confidencialidad de tus credenciales.\n\n3. Leads y contactos: Las solicitudes de informacion enviadas a traves de la plataforma seran compartidas con las concesionarias correspondientes.\n\n4. Propiedad intelectual: Todo el contenido de la plataforma es propiedad de CarConnect Uruguay o de sus respectivos titulares.\n\n5. Limitacion de responsabilidad: CarConnect Uruguay actua como intermediario y no se responsabiliza por las transacciones entre usuarios y concesionarias."}'),
  ('page_privacidad', '{"title":"Politica de Privacidad","content":"En CarConnect Uruguay protegemos tus datos personales conforme a la Ley N 18.331 de Proteccion de Datos Personales.\n\nDatos que recopilamos:\n- Informacion de registro (nombre, email, telefono)\n- Datos de vehiculos activados\n- Historial de consultas y leads\n- Datos de navegacion y uso\n\nUso de los datos:\n- Facilitar la conexion con concesionarias\n- Personalizar tu experiencia\n- Enviar comunicaciones relevantes\n- Mejorar nuestros servicios\n\nTus derechos:\n- Acceso a tus datos personales\n- Rectificacion de informacion incorrecta\n- Eliminacion de tu cuenta y datos\n- Oposicion al tratamiento\n\nContacto: Para ejercer tus derechos, escribinos a hola@carconnect.uy"}'),
  ('page_contacto', '{"title":"Contacto","content":"Estamos para ayudarte.\n\nEmail: hola@carconnect.uy\nTelefono: +598 99 123 456\nWhatsApp: +598 99 123 456\n\nDireccion:\nMontevideo, Uruguay\n\nHorario de atencion:\nLunes a Viernes: 9:00 - 18:00\nSabados: 10:00 - 14:00\n\nTambien podes encontrarnos en redes sociales:\n- Instagram: @carconnectuy\n- Twitter: @carconnectuy\n- Facebook: CarConnect Uruguay"}'),
  ('page_sobre-nosotros', '{"title":"Sobre Nosotros","content":"CarConnect Uruguay es la plataforma lider para encontrar tu proximo auto 0km en Uruguay.\n\nNuestra mision es simplificar el proceso de compra de vehiculos nuevos, conectando a compradores con las mejores concesionarias del pais.\n\nQue ofrecemos:\n- Catalogo completo de vehiculos 0km disponibles en Uruguay\n- Comparativas y reviews de expertos\n- Conexion directa con concesionarias oficiales\n- Comunidad activa de entusiastas automotrices\n- Eventos exclusivos y beneficios para miembros\n\nNuestro equipo esta compuesto por apasionados del mundo automotor que trabajan cada dia para brindarte la mejor experiencia."}'),
  ('page_noticias', '{"title":"Noticias","content":"Proximamente publicaremos novedades del mundo automotor uruguayo.\n\nMantente atento a:\n- Lanzamientos de nuevos modelos\n- Tendencias del mercado automotor\n- Eventos y exposiciones\n- Tips de mantenimiento y cuidado vehicular"}')
ON CONFLICT (key) DO NOTHING;
