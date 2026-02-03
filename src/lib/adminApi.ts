import { supabase } from './supabase';
import type {
  Brand, BrandContact, BrandAdmin, UserRole,
  Model, Trim, Lead, Event, Benefit, VehicleActivation,
  CarSegment, FuelType, LeadStatus, ActivationStatus,
  ReviewPost, Comment, Community, CommunityPost,
} from '@/types';

// ========================
// BRANDS
// ========================

export async function listBrandsAdmin(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function getBrand(id: string): Promise<Brand> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBrand(brand: {
  name: string;
  slug: string;
  logo_url?: string | null;
  country?: string;
  is_active?: boolean;
}): Promise<Brand> {
  const { data, error } = await supabase
    .from('brands')
    .insert({
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logo_url ?? null,
      country: brand.country ?? 'UY',
      is_active: brand.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBrand(
  id: string,
  updates: {
    name?: string;
    slug?: string;
    logo_url?: string | null;
    country?: string;
    is_active?: boolean;
  },
): Promise<Brand> {
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========================
// BRAND CONTACTS
// ========================

export async function listBrandContacts(brandId: string): Promise<BrandContact[]> {
  const { data, error } = await supabase
    .from('brand_contacts')
    .select('*')
    .eq('brand_id', brandId)
    .order('is_default', { ascending: false })
    .order('created_at');

  if (error) throw error;
  return data ?? [];
}

export async function addBrandContact(contact: {
  brand_id: string;
  email: string;
  department?: string | null;
  is_default?: boolean;
}): Promise<BrandContact> {
  const { data, error } = await supabase
    .from('brand_contacts')
    .insert({
      brand_id: contact.brand_id,
      email: contact.email,
      department: contact.department ?? null,
      is_default: contact.is_default ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeBrandContact(id: string): Promise<void> {
  const { error } = await supabase
    .from('brand_contacts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setDefaultContact(brandId: string, contactId: string): Promise<void> {
  // Quitar default de todos los contactos de la marca
  const { error: resetError } = await supabase
    .from('brand_contacts')
    .update({ is_default: false })
    .eq('brand_id', brandId);

  if (resetError) throw resetError;

  // Marcar el seleccionado como default
  const { error } = await supabase
    .from('brand_contacts')
    .update({ is_default: true })
    .eq('id', contactId);

  if (error) throw error;
}

// ========================
// BRAND ADMINS
// ========================

export async function listBrandAdmins(brandId: string): Promise<BrandAdmin[]> {
  const { data, error } = await supabase
    .from('brand_admins')
    .select(`
      *,
      profile:profiles!brand_admins_user_id_fkey(email, full_name)
    `)
    .eq('brand_id', brandId)
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    brand_id: row.brand_id,
    user_id: row.user_id,
    created_at: row.created_at,
    profile: row.profile
      ? { email: row.profile.email, full_name: row.profile.full_name }
      : undefined,
  }));
}

export async function addBrandAdmin(brandId: string, userId: string): Promise<BrandAdmin> {
  const { data, error } = await supabase
    .from('brand_admins')
    .insert({ brand_id: brandId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeBrandAdmin(id: string): Promise<void> {
  const { error } = await supabase
    .from('brand_admins')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// USER SEARCH (para asignar brand admins)
// ========================

export async function searchUserByEmail(email: string): Promise<{ id: string; email: string; full_name: string } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .ilike('email', `%${email}%`)
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function searchUsersByEmail(email: string): Promise<{ id: string; email: string; full_name: string }[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .ilike('email', `%${email}%`)
    .limit(10);

  if (error) return [];
  return data ?? [];
}

// ========================
// USERS (admin)
// ========================

export async function listUsers(): Promise<
  { id: string; email: string; full_name: string; role: UserRole; created_at: string }[]
> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createUserAccount({
  email,
  password,
  fullName,
  role,
  brandId,
}: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  brandId?: string;
}): Promise<void> {
  // 1. Create auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUpError) throw signUpError;
  if (!authData.user) throw new Error('No se pudo crear el usuario');

  const userId = authData.user.id;

  // 2. Update profile role
  const { error: roleError } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (roleError) throw roleError;

  // 3. If brand_admin, insert into brand_admins
  if (role === 'brand_admin' && brandId) {
    const { error: baError } = await supabase
      .from('brand_admins')
      .insert({ brand_id: brandId, user_id: userId });

    if (baError) throw baError;
  }
}

// ========================
// BRAND ADMIN (self)
// ========================

export async function getMyBrandAdmin(
  userId: string,
): Promise<{ brand_id: string; brand_name: string; brand_slug: string; brand_logo_url: string | null } | null> {
  const { data, error } = await supabase
    .from('brand_admins')
    .select('brand_id, brand:brands!brand_admins_brand_id_fkey(name, slug, logo_url)')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error) return null;

  const row = data as any;
  return {
    brand_id: row.brand_id,
    brand_name: row.brand?.name ?? '',
    brand_slug: row.brand?.slug ?? '',
    brand_logo_url: row.brand?.logo_url ?? null,
  };
}

// ========================
// MODELS
// ========================

export async function listModelsAdmin(brandId?: string): Promise<(Model & { brand?: Brand })[]> {
  let query = supabase
    .from('models')
    .select('*, brand:brands!models_brand_id_fkey(*)')
    .order('name');

  if (brandId) query = query.eq('brand_id', brandId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    brand: row.brand ?? undefined,
  }));
}

export async function getModel(id: string): Promise<Model> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createModel(model: {
  brand_id: string;
  name: string;
  slug: string;
  segment: CarSegment;
  year_start: number;
  year_end?: number | null;
}): Promise<Model> {
  const { data, error } = await supabase
    .from('models')
    .insert({
      brand_id: model.brand_id,
      name: model.name,
      slug: model.slug,
      segment: model.segment,
      year_start: model.year_start,
      year_end: model.year_end ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateModel(
  id: string,
  updates: Partial<{
    brand_id: string;
    name: string;
    slug: string;
    segment: CarSegment;
    year_start: number;
    year_end: number | null;
  }>,
): Promise<Model> {
  const { data, error } = await supabase
    .from('models')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteModel(id: string): Promise<void> {
  const { error } = await supabase
    .from('models')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// TRIMS
// ========================

export async function listTrimsAdmin(modelId: string): Promise<Trim[]> {
  const { data, error } = await supabase
    .from('trims')
    .select('*')
    .eq('model_id', modelId)
    .order('year', { ascending: false })
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function getTrim(id: string): Promise<Trim> {
  const { data, error } = await supabase
    .from('trims')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTrim(trim: {
  model_id: string;
  name: string;
  slug: string;
  year: number;
  price_usd: number;
  engine: string;
  transmission: string;
  fuel_type: FuelType;
  horsepower: number;
  torque?: number | null;
  acceleration_0_100?: number | null;
  top_speed?: number | null;
  fuel_consumption?: number | null;
  doors: number;
  seats: number;
  trunk_capacity?: number | null;
  features?: string[];
  images?: string[];
  is_featured?: boolean;
}): Promise<Trim> {
  const { data, error } = await supabase
    .from('trims')
    .insert({
      model_id: trim.model_id,
      name: trim.name,
      slug: trim.slug,
      year: trim.year,
      price_usd: trim.price_usd,
      engine: trim.engine,
      transmission: trim.transmission,
      fuel_type: trim.fuel_type,
      horsepower: trim.horsepower,
      torque: trim.torque ?? null,
      acceleration_0_100: trim.acceleration_0_100 ?? null,
      top_speed: trim.top_speed ?? null,
      fuel_consumption: trim.fuel_consumption ?? null,
      doors: trim.doors ?? 4,
      seats: trim.seats ?? 5,
      trunk_capacity: trim.trunk_capacity ?? null,
      features: trim.features ?? [],
      images: trim.images ?? [],
      is_featured: trim.is_featured ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrim(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    year: number;
    price_usd: number;
    engine: string;
    transmission: string;
    fuel_type: FuelType;
    horsepower: number;
    torque: number | null;
    acceleration_0_100: number | null;
    top_speed: number | null;
    fuel_consumption: number | null;
    doors: number;
    seats: number;
    trunk_capacity: number | null;
    features: string[];
    images: string[];
    is_featured: boolean;
  }>,
): Promise<Trim> {
  const { data, error } = await supabase
    .from('trims')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTrim(id: string): Promise<void> {
  const { error } = await supabase
    .from('trims')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// LEADS
// ========================

export async function listLeadsAdmin(): Promise<(Lead & { trim_name?: string; model_name?: string; brand_name?: string })[]> {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      trim:trims!leads_car_id_fkey(
        name,
        model:models!trims_model_id_fkey(
          name,
          brand:brands!models_brand_id_fkey(name)
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    trim_name: row.trim?.name,
    model_name: row.trim?.model?.name,
    brand_name: row.trim?.model?.brand?.name,
    trim: undefined,
  }));
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

// ========================
// EVENTS
// ========================

export async function listEventsAdmin(brandId?: string): Promise<(Event & { brand?: Brand })[]> {
  let query = supabase
    .from('events')
    .select('*, brand:brands!events_brand_id_fkey(*)')
    .order('event_date', { ascending: false });

  if (brandId) query = query.eq('brand_id', brandId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    brand: row.brand ?? undefined,
  }));
}

export async function getEvent(id: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEvent(event: {
  brand_id?: string | null;
  title: string;
  slug: string;
  description: string;
  cover_image?: string;
  location: string;
  event_date: string;
  event_time: string;
  is_public?: boolean;
  requires_verification?: boolean;
  max_attendees?: number | null;
}): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      brand_id: event.brand_id ?? null,
      title: event.title,
      slug: event.slug,
      description: event.description,
      cover_image: event.cover_image ?? '',
      location: event.location,
      event_date: event.event_date,
      event_time: event.event_time,
      is_public: event.is_public ?? true,
      requires_verification: event.requires_verification ?? false,
      max_attendees: event.max_attendees ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(
  id: string,
  updates: Partial<{
    brand_id: string | null;
    title: string;
    slug: string;
    description: string;
    cover_image: string;
    location: string;
    event_date: string;
    event_time: string;
    is_public: boolean;
    requires_verification: boolean;
    max_attendees: number | null;
  }>,
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// BENEFITS
// ========================

export async function listBenefitsAdmin(brandId?: string): Promise<(Benefit & { brand?: Brand })[]> {
  let query = supabase
    .from('benefits')
    .select('*, brand:brands!benefits_brand_id_fkey(*)')
    .order('valid_until', { ascending: false });

  if (brandId) query = query.eq('brand_id', brandId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    brand: row.brand ?? undefined,
  }));
}

export async function getBenefit(id: string): Promise<Benefit> {
  const { data, error } = await supabase
    .from('benefits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBenefit(benefit: {
  brand_id: string;
  title: string;
  description: string;
  terms?: string | null;
  valid_from: string;
  valid_until: string;
  is_active?: boolean;
}): Promise<Benefit> {
  const { data, error } = await supabase
    .from('benefits')
    .insert({
      brand_id: benefit.brand_id,
      title: benefit.title,
      description: benefit.description,
      terms: benefit.terms ?? null,
      valid_from: benefit.valid_from,
      valid_until: benefit.valid_until,
      is_active: benefit.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBenefit(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    terms: string | null;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
  }>,
): Promise<Benefit> {
  const { data, error } = await supabase
    .from('benefits')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBenefit(id: string): Promise<void> {
  const { error } = await supabase
    .from('benefits')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// VEHICLE ACTIVATIONS
// ========================

export async function listActivationsAdmin(brandId?: string): Promise<(VehicleActivation & { profile_name?: string; profile_email?: string; brand_name?: string; model_name?: string })[]> {
  let query = supabase
    .from('vehicle_activations')
    .select(`
      *,
      profile:profiles!vehicle_activations_user_id_fkey(full_name, email),
      brand:brands!vehicle_activations_brand_id_fkey(name),
      model:models!vehicle_activations_model_id_fkey(name)
    `)
    .order('created_at', { ascending: false });

  if (brandId) query = query.eq('brand_id', brandId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    profile_name: row.profile?.full_name,
    profile_email: row.profile?.email,
    brand_name: row.brand?.name,
    model_name: row.model?.name,
    profile: undefined,
    brand: undefined,
    model: undefined,
  }));
}

export async function updateActivationStatus(
  id: string,
  status: ActivationStatus,
  verifiedBy: string,
): Promise<void> {
  const updates: Record<string, any> = { status };
  if (status === 'verified' || status === 'rejected') {
    updates.verified_at = new Date().toISOString();
    updates.verified_by = verifiedBy;
  }
  const { error } = await supabase
    .from('vehicle_activations')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// ========================
// DASHBOARD STATS
// ========================

interface AdminStats {
  brands: number;
  models: number;
  trims: number;
  leads: number;
  newLeads: number;
  events: number;
  activations: number;
  pendingActivations: number;
  users: number;
  benefits: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [brands, models, trims, leads, newLeads, events, activations, pendingActivations, users, benefits] =
    await Promise.all([
      supabase.from('brands').select('*', { count: 'exact', head: true }),
      supabase.from('models').select('*', { count: 'exact', head: true }),
      supabase.from('trims').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('vehicle_activations').select('*', { count: 'exact', head: true }),
      supabase.from('vehicle_activations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('benefits').select('*', { count: 'exact', head: true }),
    ]);

  return {
    brands: brands.count ?? 0,
    models: models.count ?? 0,
    trims: trims.count ?? 0,
    leads: leads.count ?? 0,
    newLeads: newLeads.count ?? 0,
    events: events.count ?? 0,
    activations: activations.count ?? 0,
    pendingActivations: pendingActivations.count ?? 0,
    users: users.count ?? 0,
    benefits: benefits.count ?? 0,
  };
}

interface BrandAdminStats {
  models: number;
  trims: number;
  contacts: number;
  leads: number;
  newLeads: number;
  events: number;
  benefits: number;
  activations: number;
  pendingActivations: number;
}

export async function getBrandAdminStats(brandId: string): Promise<BrandAdminStats> {
  const [models, contacts, events, benefits, activations, pendingActivations] =
    await Promise.all([
      supabase.from('models').select('*', { count: 'exact', head: true }).eq('brand_id', brandId),
      supabase.from('brand_contacts').select('*', { count: 'exact', head: true }).eq('brand_id', brandId),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('brand_id', brandId),
      supabase.from('benefits').select('*', { count: 'exact', head: true }).eq('brand_id', brandId),
      supabase.from('vehicle_activations').select('*', { count: 'exact', head: true }).eq('brand_id', brandId),
      supabase.from('vehicle_activations').select('*', { count: 'exact', head: true }).eq('brand_id', brandId).eq('status', 'pending'),
    ]);

  // For trims and leads we need model IDs first
  const { data: brandModels } = await supabase
    .from('models')
    .select('id')
    .eq('brand_id', brandId);

  const modelIds = (brandModels ?? []).map((m: any) => m.id);

  let trimsCount = 0;
  let leadsCount = 0;
  let newLeadsCount = 0;

  if (modelIds.length > 0) {
    const [trimsResult] = await Promise.all([
      supabase.from('trims').select('*', { count: 'exact', head: true }).in('model_id', modelIds),
    ]);
    trimsCount = trimsResult.count ?? 0;

    // Get trim IDs for leads
    const { data: brandTrims } = await supabase
      .from('trims')
      .select('id')
      .in('model_id', modelIds);

    const trimIds = (brandTrims ?? []).map((t: any) => t.id);
    if (trimIds.length > 0) {
      const [leadsResult, newLeadsResult] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).in('car_id', trimIds),
        supabase.from('leads').select('*', { count: 'exact', head: true }).in('car_id', trimIds).eq('status', 'new'),
      ]);
      leadsCount = leadsResult.count ?? 0;
      newLeadsCount = newLeadsResult.count ?? 0;
    }
  }

  return {
    models: models.count ?? 0,
    trims: trimsCount,
    contacts: contacts.count ?? 0,
    leads: leadsCount,
    newLeads: newLeadsCount,
    events: events.count ?? 0,
    benefits: benefits.count ?? 0,
    activations: activations.count ?? 0,
    pendingActivations: pendingActivations.count ?? 0,
  };
}

// ========================
// SITE SETTINGS
// ========================

export async function getSiteSettings(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) throw error;

  const settings: Record<string, any> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateSiteSetting(key: string, value: any): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw error;
}

// ========================
// ADMIN TRENDS (KPIs)
// ========================

interface TrendPoint {
  label: string;
  count: number;
}

export interface AdminTrends {
  leadsPerWeek: TrendPoint[];
  usersPerWeek: TrendPoint[];
  activationsPerMonth: TrendPoint[];
}

export interface BrandAdminTrends {
  leadsPerWeek: TrendPoint[];
  activationsPerMonth: TrendPoint[];
}

function getWeekRanges(numWeeks: number): { start: string; end: string; label: string }[] {
  const ranges: { start: string; end: string; label: string }[] = [];
  const now = new Date();
  for (let i = numWeeks - 1; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    const label = `${start.getDate()}/${start.getMonth() + 1}`;
    ranges.push({
      start: start.toISOString(),
      end: end.toISOString(),
      label,
    });
  }
  return ranges;
}

function getMonthRanges(numMonths: number): { start: string; end: string; label: string }[] {
  const ranges: { start: string; end: string; label: string }[] = [];
  const now = new Date();
  for (let i = numMonths - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = start.toLocaleString('es-UY', { month: 'short' });
    ranges.push({
      start: start.toISOString(),
      end: end.toISOString(),
      label,
    });
  }
  return ranges;
}

async function countByRanges(
  table: string,
  dateColumn: string,
  ranges: { start: string; end: string; label: string }[],
  filters?: Record<string, any>,
): Promise<TrendPoint[]> {
  const results: TrendPoint[] = [];
  for (const range of ranges) {
    let query = supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .gte(dateColumn, range.start)
      .lt(dateColumn, range.end);

    if (filters) {
      for (const [key, val] of Object.entries(filters)) {
        query = query.eq(key, val);
      }
    }

    const { count } = await query;
    results.push({ label: range.label, count: count ?? 0 });
  }
  return results;
}

export async function getAdminTrends(): Promise<AdminTrends> {
  const weekRanges = getWeekRanges(8);
  const monthRanges = getMonthRanges(6);

  const [leadsPerWeek, usersPerWeek, activationsPerMonth] = await Promise.all([
    countByRanges('leads', 'created_at', weekRanges),
    countByRanges('profiles', 'created_at', weekRanges),
    countByRanges('vehicle_activations', 'created_at', monthRanges),
  ]);

  return { leadsPerWeek, usersPerWeek, activationsPerMonth };
}

export async function getBrandAdminTrends(brandId: string): Promise<BrandAdminTrends> {
  const weekRanges = getWeekRanges(8);
  const monthRanges = getMonthRanges(6);

  // For leads we need trim IDs of the brand
  const { data: brandModels } = await supabase
    .from('models')
    .select('id')
    .eq('brand_id', brandId);
  const modelIds = (brandModels ?? []).map((m: any) => m.id);

  let leadsPerWeek: TrendPoint[] = weekRanges.map((r) => ({ label: r.label, count: 0 }));

  if (modelIds.length > 0) {
    const { data: brandTrims } = await supabase
      .from('trims')
      .select('id')
      .in('model_id', modelIds);
    const trimIds = (brandTrims ?? []).map((t: any) => t.id);

    if (trimIds.length > 0) {
      const results: TrendPoint[] = [];
      for (const range of weekRanges) {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .in('car_id', trimIds)
          .gte('created_at', range.start)
          .lt('created_at', range.end);
        results.push({ label: range.label, count: count ?? 0 });
      }
      leadsPerWeek = results;
    }
  }

  const activationsPerMonth = await countByRanges(
    'vehicle_activations',
    'created_at',
    monthRanges,
    { brand_id: brandId },
  );

  return { leadsPerWeek, activationsPerMonth };
}

// ========================
// REVIEWS (Admin)
// ========================

export async function listReviewsAdmin(): Promise<(ReviewPost & { author_name?: string; author_email?: string })[]> {
  const { data, error } = await supabase
    .from('review_posts')
    .select(`
      *,
      author:profiles!review_posts_author_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    author_name: row.author?.full_name,
    author_email: row.author?.email,
    author: undefined,
  }));
}

export async function updateReviewPublish(id: string, publishedAt: string | null): Promise<void> {
  const { error } = await supabase
    .from('review_posts')
    .update({ published_at: publishedAt })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase
    .from('review_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// COMMENTS (Admin)
// ========================

export async function listCommentsAdmin(postId?: string): Promise<(Comment & { author_name?: string; post_title?: string })[]> {
  let query = supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(full_name),
      post:review_posts!comments_post_id_fkey(title)
    `)
    .order('created_at', { ascending: false });

  if (postId) query = query.eq('post_id', postId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    author_name: row.author?.full_name,
    post_title: row.post?.title,
    author: undefined,
    post: undefined,
  }));
}

export async function approveComment(id: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .update({ is_approved: true })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// COMMUNITIES (Admin)
// ========================

export async function listCommunitiesAdmin(): Promise<(Community & { brand_name?: string; model_name?: string })[]> {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      brand:brands!communities_brand_id_fkey(name),
      model:models!communities_model_id_fkey(name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    brand_name: row.brand?.name,
    model_name: row.model?.name,
    brand: undefined,
    model: undefined,
  }));
}

export async function getCommunity(id: string): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCommunity(community: {
  name: string;
  slug: string;
  description: string;
  cover_image?: string | null;
  brand_id?: string | null;
  model_id?: string | null;
}): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: community.name,
      slug: community.slug,
      description: community.description,
      cover_image: community.cover_image ?? null,
      brand_id: community.brand_id ?? null,
      model_id: community.model_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCommunity(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    description: string;
    cover_image: string | null;
    brand_id: string | null;
    model_id: string | null;
  }>,
): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCommunity(id: string): Promise<void> {
  const { error } = await supabase
    .from('communities')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========================
// COMMUNITY POSTS (Admin)
// ========================

export async function listCommunityPostsAdmin(communityId?: string): Promise<(CommunityPost & { author_name?: string })[]> {
  let query = supabase
    .from('community_posts')
    .select(`
      *,
      author:profiles!community_posts_author_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false });

  if (communityId) query = query.eq('community_id', communityId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    author_name: row.author?.full_name,
    author: undefined,
  }));
}

export async function deleteCommunityPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
