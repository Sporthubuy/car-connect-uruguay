-- ============================================================
-- CarWow LATAM Uruguay - Supabase Database Schema
-- Ejecutar en Supabase SQL Editor (todo junto o por secciones)
-- ============================================================

-- ========================
-- 1. EXTENSIONES
-- ========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- 2. TIPOS ENUM
-- ========================
CREATE TYPE car_segment AS ENUM (
  'sedan', 'hatchback', 'suv', 'crossover', 'pickup',
  'coupe', 'convertible', 'wagon', 'van', 'sports'
);

CREATE TYPE fuel_type AS ENUM (
  'gasolina', 'diesel', 'hibrido', 'electrico', 'gnc'
);

CREATE TYPE lead_status AS ENUM (
  'new', 'contacted', 'qualified', 'converted', 'lost'
);

CREATE TYPE user_role AS ENUM (
  'visitor', 'user', 'verified_user', 'brand_admin', 'admin'
);

CREATE TYPE activation_status AS ENUM (
  'pending', 'verified', 'rejected'
);

-- ========================
-- 3. TABLAS
-- ========================

-- Marcas
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modelos
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  segment car_segment NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Versiones / Trims
CREATE TABLE trims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  year INTEGER NOT NULL,
  price_usd NUMERIC(12, 2) NOT NULL,
  engine TEXT NOT NULL,
  transmission TEXT NOT NULL,
  fuel_type fuel_type NOT NULL,
  horsepower INTEGER NOT NULL,
  torque INTEGER,
  acceleration_0_100 NUMERIC(4, 1),
  top_speed INTEGER,
  fuel_consumption NUMERIC(4, 1),
  doors INTEGER NOT NULL DEFAULT 4,
  seats INTEGER NOT NULL DEFAULT 5,
  trunk_capacity INTEGER,
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles de usuario (vinculado a auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  city TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads / Consultas
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES trims(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  city TEXT,
  message TEXT,
  status lead_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE review_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id UUID REFERENCES trims(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  views INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES review_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comunidades
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  model_id UUID REFERENCES models(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts de comunidad
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  requires_verification BOOLEAN DEFAULT FALSE,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activaciones de vehículos
CREATE TABLE vehicle_activations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  vin TEXT NOT NULL,
  status activation_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beneficios
CREATE TABLE benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  terms TEXT,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- 4. ÍNDICES
-- ========================
CREATE INDEX idx_models_brand_id ON models(brand_id);
CREATE INDEX idx_trims_model_id ON trims(model_id);
CREATE INDEX idx_trims_fuel_type ON trims(fuel_type);
CREATE INDEX idx_trims_is_featured ON trims(is_featured);
CREATE INDEX idx_trims_price ON trims(price_usd);
CREATE INDEX idx_leads_car_id ON leads(car_id);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_review_posts_slug ON review_posts(slug);
CREATE INDEX idx_review_posts_car_id ON review_posts(car_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_vehicle_activations_user_id ON vehicle_activations(user_id);
CREATE INDEX idx_vehicle_activations_status ON vehicle_activations(status);

-- ========================
-- 5. VISTA: cars (trim + model + brand)
-- ========================
CREATE OR REPLACE VIEW cars_view AS
SELECT
  t.id,
  t.model_id,
  t.name AS trim_name,
  t.slug AS trim_slug,
  t.year,
  t.price_usd,
  t.engine,
  t.transmission,
  t.fuel_type,
  t.horsepower,
  t.torque,
  t.acceleration_0_100,
  t.top_speed,
  t.fuel_consumption,
  t.doors,
  t.seats,
  t.trunk_capacity,
  t.features,
  t.images,
  t.is_featured,
  t.created_at,
  m.name AS model_name,
  m.slug AS model_slug,
  m.segment,
  m.year_start,
  m.year_end,
  b.id AS brand_id,
  b.name AS brand_name,
  b.slug AS brand_slug,
  b.logo_url AS brand_logo_url,
  b.country AS brand_country
FROM trims t
JOIN models m ON t.model_id = m.id
JOIN brands b ON m.brand_id = b.id;

-- ========================
-- 6. RLS (Row Level Security)
-- ========================

-- Habilitar RLS en todas las tablas
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE trims ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;

-- BRANDS: lectura pública
CREATE POLICY "brands_public_read" ON brands
  FOR SELECT USING (true);

-- MODELS: lectura pública
CREATE POLICY "models_public_read" ON models
  FOR SELECT USING (true);

-- TRIMS: lectura pública
CREATE POLICY "trims_public_read" ON trims
  FOR SELECT USING (true);

-- PROFILES: lectura pública, usuarios editan su propio perfil
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- LEADS: cualquiera puede crear, usuarios ven sus propios leads
CREATE POLICY "leads_insert_anyone" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_read_own" ON leads
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'brand_admin')
    )
  );

-- REVIEW_POSTS: lectura pública
CREATE POLICY "review_posts_public_read" ON review_posts
  FOR SELECT USING (true);

-- COMMENTS: lectura pública (aprobados), usuarios pueden crear
CREATE POLICY "comments_public_read" ON comments
  FOR SELECT USING (is_approved = true OR auth.uid() = author_id);

CREATE POLICY "comments_insert_auth" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- COMMUNITIES: lectura pública
CREATE POLICY "communities_public_read" ON communities
  FOR SELECT USING (true);

-- COMMUNITY_POSTS: lectura pública, usuarios autenticados crean
CREATE POLICY "community_posts_public_read" ON community_posts
  FOR SELECT USING (true);

CREATE POLICY "community_posts_insert_auth" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- EVENTS: lectura pública
CREATE POLICY "events_public_read" ON events
  FOR SELECT USING (true);

-- VEHICLE_ACTIVATIONS: usuario ve las suyas, admin ve todas
CREATE POLICY "activations_read_own" ON vehicle_activations
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "activations_insert_auth" ON vehicle_activations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- BENEFITS: lectura pública
CREATE POLICY "benefits_public_read" ON benefits
  FOR SELECT USING (is_active = true);

-- ========================
-- 7. FUNCIÓN: crear perfil automáticamente al registrarse
-- ========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: cuando se crea un usuario en auth.users → crear perfil
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- 8. SEED DATA (datos iniciales)
-- ========================

-- Marcas
INSERT INTO brands (id, name, slug, logo_url, country) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Toyota', 'toyota', 'https://www.carlogos.org/car-logos/toyota-logo-2019-3700x1200.png', 'Japón'),
  ('a1000000-0000-0000-0000-000000000002', 'Volkswagen', 'volkswagen', 'https://www.carlogos.org/car-logos/volkswagen-logo-2019-1500x1500.png', 'Alemania'),
  ('a1000000-0000-0000-0000-000000000003', 'Chevrolet', 'chevrolet', 'https://www.carlogos.org/car-logos/chevrolet-logo-2013-2560x1440.png', 'Estados Unidos'),
  ('a1000000-0000-0000-0000-000000000004', 'Ford', 'ford', 'https://www.carlogos.org/car-logos/ford-logo-2017-1500x1101.png', 'Estados Unidos'),
  ('a1000000-0000-0000-0000-000000000005', 'Honda', 'honda', 'https://www.carlogos.org/car-logos/honda-logo-1700x1150.png', 'Japón'),
  ('a1000000-0000-0000-0000-000000000006', 'Hyundai', 'hyundai', 'https://www.carlogos.org/car-logos/hyundai-logo-2011-1920x1080.png', 'Corea del Sur');

-- Modelos
INSERT INTO models (id, brand_id, name, slug, segment, year_start) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Corolla', 'corolla', 'sedan', 2020),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'RAV4', 'rav4', 'suv', 2020),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Hilux', 'hilux', 'pickup', 2020),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Golf', 'golf', 'hatchback', 2020),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Tiguan', 'tiguan', 'suv', 2020),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Amarok', 'amarok', 'pickup', 2020),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'Onix', 'onix', 'hatchback', 2020),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'Tracker', 'tracker', 'suv', 2020),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'Ranger', 'ranger', 'pickup', 2020),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000005', 'Civic', 'civic', 'sedan', 2020),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000005', 'HR-V', 'hr-v', 'suv', 2020),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000006', 'Tucson', 'tucson', 'suv', 2020);

-- Trims / Versiones
INSERT INTO trims (id, model_id, name, slug, year, price_usd, engine, transmission, fuel_type, horsepower, torque, acceleration_0_100, top_speed, fuel_consumption, doors, seats, trunk_capacity, features, images, is_featured) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'XEI CVT', 'xei-cvt', 2024, 32900, '2.0L 4 cilindros', 'CVT', 'gasolina', 170, 203, 9.5, 200, 7.2, 4, 5, 470,
    ARRAY['Apple CarPlay', 'Android Auto', 'Cámara trasera', 'Control crucero', 'Sensores de estacionamiento'],
    ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800'],
    true),

  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Limited AWD', 'limited-awd', 2024, 48500, '2.5L Híbrido', 'CVT', 'hibrido', 219, 221, 7.8, 180, 5.8, 5, 5, 580,
    ARRAY['Tracción integral', 'Techo panorámico', 'Asientos de cuero', 'Sistema JBL', 'Toyota Safety Sense'],
    ARRAY['https://images.unsplash.com/photo-1568844293986-8c2e38b6ab08?w=800', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'],
    true),

  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'SRX 4x4 AT', 'srx-4x4-at', 2024, 52900, '2.8L Turbo Diesel', 'Automática 6 velocidades', 'diesel', 204, 500, 10.2, 175, 8.5, 4, 5, 1000,
    ARRAY['Tracción 4x4', 'Diferencial trasero', 'Control de descenso', 'Cámara 360°', 'Bluetooth'],
    ARRAY['https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800', 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800'],
    false),

  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'GTI DSG', 'gti-dsg', 2024, 45900, '2.0L TSI Turbo', 'DSG 7 velocidades', 'gasolina', 245, 370, 6.2, 250, 7.8, 5, 5, 380,
    ARRAY['Modo Sport', 'Asientos deportivos', 'Digital Cockpit', 'Faros LED Matrix', 'Park Assist'],
    ARRAY['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800', 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800'],
    true),

  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 'Allspace Elegance', 'allspace-elegance', 2024, 55900, '2.0L TSI', 'DSG 7 velocidades', 'gasolina', 220, 350, 7.5, 210, 8.2, 5, 7, 700,
    ARRAY['7 plazas', 'Tracción 4Motion', 'Techo panorámico', 'Navegación', 'Asistente de carril'],
    ARRAY['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800'],
    false),

  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006', 'V6 Extreme', 'v6-extreme', 2024, 62900, '3.0L V6 TDI', 'Automática 8 velocidades', 'diesel', 258, 580, 7.3, 193, 9.0, 4, 5, 1100,
    ARRAY['Tracción 4Motion', 'Suspensión adaptativa', 'Cámara 360°', 'Asientos ventilados', 'Harman Kardon'],
    ARRAY['https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800'],
    true),

  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000007', 'Premier AT', 'premier-at', 2024, 24900, '1.0L Turbo', 'Automática 6 velocidades', 'gasolina', 116, 165, 10.5, 185, 6.5, 5, 5, 275,
    ARRAY['MyLink', 'Wi-Fi', 'Cámara trasera', 'Alerta de colisión', 'Sensores delanteros'],
    ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
    false),

  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000008', 'Premier Midnight', 'premier-midnight', 2024, 38900, '1.2L Turbo', 'Automática 6 velocidades', 'gasolina', 133, 210, 9.2, 190, 7.0, 5, 5, 393,
    ARRAY['Diseño Midnight', 'Techo solar', 'Apple CarPlay inalámbrico', 'Carga inalámbrica', 'OnStar'],
    ARRAY['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'],
    true),

  ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000009', 'Wildtrak V6', 'wildtrak-v6', 2024, 58900, '3.0L V6 Diesel', 'Automática 10 velocidades', 'diesel', 250, 600, 8.1, 180, 9.5, 4, 5, 1200,
    ARRAY['SYNC 4', 'Modo todoterreno', 'Bloqueo diferencial', 'Cámara 360°', 'B&O Sound'],
    ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
    true),

  ('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000010', 'Touring CVT', 'touring-cvt', 2024, 36900, '2.0L i-VTEC', 'CVT', 'gasolina', 158, 187, 9.8, 195, 6.8, 4, 5, 430,
    ARRAY['Honda Sensing', 'Pantalla 9"', 'Cámara multi-ángulo', 'Apple CarPlay', 'LaneWatch'],
    ARRAY['https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800'],
    false),

  ('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000011', 'EXL CVT', 'exl-cvt', 2024, 42900, '1.5L Turbo', 'CVT', 'gasolina', 177, 240, 8.5, 195, 7.5, 5, 5, 437,
    ARRAY['Honda Sensing', 'Techo panorámico', 'Asientos de cuero', 'Pantalla 9"', 'Carga inalámbrica'],
    ARRAY['https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800'],
    false),

  ('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000012', 'Limited 2.0T', 'limited-2-0t', 2024, 47900, '2.0L Turbo', 'Automática 8 velocidades', 'gasolina', 261, 422, 7.0, 210, 8.0, 5, 5, 620,
    ARRAY['SmartSense', 'Pantalla 10.25"', 'Bose Premium', 'Carga inalámbrica', 'Modo Sport'],
    ARRAY['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'],
    true);

-- Comunidades
INSERT INTO communities (id, name, slug, description, cover_image, brand_id, member_count) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Toyota Uruguay', 'toyota-uruguay', 'Comunidad oficial de propietarios Toyota en Uruguay', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', 'a1000000-0000-0000-0000-000000000001', 1250),
  ('d1000000-0000-0000-0000-000000000002', 'VW Enthusiasts UY', 'vw-enthusiasts-uy', 'Para los amantes de Volkswagen en Uruguay', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800', 'a1000000-0000-0000-0000-000000000002', 890),
  ('d1000000-0000-0000-0000-000000000003', 'Pickups Uruguay', 'pickups-uruguay', 'Todo sobre pickups: Hilux, Ranger, Amarok y más', NULL, NULL, 2100);

-- Eventos
INSERT INTO events (id, brand_id, title, slug, description, cover_image, location, event_date, event_time, is_public, requires_verification, max_attendees) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Test Drive Toyota RAV4 2024', 'test-drive-toyota-rav4-2024', 'Ven a probar la nueva RAV4 Hybrid en nuestro evento exclusivo.', 'https://images.unsplash.com/photo-1568844293986-8c2e38b6ab08?w=800', 'Toyota Uruguay - Montevideo', '2025-03-15', '10:00', true, false, 50),
  ('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Volkswagen Track Day', 'volkswagen-track-day', 'Evento exclusivo para propietarios VW verificados.', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800', 'Autódromo de El Pinar', '2025-04-20', '09:00', false, true, 30),
  ('e1000000-0000-0000-0000-000000000003', NULL, 'Expo Auto Uruguay 2025', 'expo-auto-uruguay-2025', 'La mayor exposición de autos nuevos en Uruguay.', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 'Antel Arena - Montevideo', '2025-05-10', '10:00', true, false, 5000);

-- ========================
-- FIN DEL SCHEMA
-- ========================
