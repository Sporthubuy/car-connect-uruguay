import { supabase } from './supabase';
import { Brand, Model, Car, ReviewPost, Community, CommunityPost, Event, Comment, VehicleActivation } from '@/types';

// Transform Supabase nested join response to the flat Car type
function mapToCar(row: any): Car {
  const { model: modelData, ...trim } = row;
  const { brand: brandData, ...model } = modelData;
  return {
    ...trim,
    price_usd: Number(trim.price_usd),
    model,
    brand: brandData,
  };
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchModels(): Promise<Model[]> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchModelsByBrand(brandId: string): Promise<Model[]> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('brand_id', brandId)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from('trims')
    .select(`
      *,
      model:models(
        *,
        brand:brands(*)
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapToCar);
}

export async function fetchCarById(id: string): Promise<Car | null> {
  const { data, error } = await supabase
    .from('trims')
    .select(`
      *,
      model:models(
        *,
        brand:brands(*)
      )
    `)
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return mapToCar(data);
}

// ========================
// REVIEWS
// ========================

export async function fetchReviews(): Promise<ReviewPost[]> {
  const { data, error } = await supabase
    .from('review_posts')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchReviewBySlug(slug: string): Promise<(ReviewPost & { author?: { full_name: string; email: string } }) | null> {
  const { data, error } = await supabase
    .from('review_posts')
    .select(`
      *,
      author:profiles!review_posts_author_id_fkey(full_name, email)
    `)
    .eq('slug', slug)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function fetchCommentsByPost(postId: string): Promise<(Comment & { author_name?: string })[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(full_name)
    `)
    .eq('post_id', postId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    ...row,
    author_name: row.author?.full_name,
    author: undefined,
  }));
}

export async function submitComment(postId: string, content: string): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión para comentar');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content,
      is_approved: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ========================
// COMMUNITIES
// ========================

export async function fetchCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('member_count', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchCommunityPosts(communityId?: string): Promise<(CommunityPost & { author_name?: string; community_name?: string })[]> {
  let query = supabase
    .from('community_posts')
    .select(`
      *,
      author:profiles!community_posts_author_id_fkey(full_name),
      community:communities!community_posts_community_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (communityId) query = query.eq('community_id', communityId);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row: any) => ({
    ...row,
    author_name: row.author?.full_name,
    community_name: row.community?.name,
    author: undefined,
    community: undefined,
  }));
}

export async function createCommunityPost(communityId: string, title: string, content: string): Promise<CommunityPost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      community_id: communityId,
      author_id: user.id,
      title,
      content,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function joinCommunity(communityId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, user_id: user.id });
  if (error) throw error;
}

export async function leaveCommunity(communityId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function fetchUserMemberships(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('user_id', user.id);
  if (error) return [];
  return (data || []).map((r: any) => r.community_id);
}

// ========================
// EVENTS
// ========================

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ========================
// EVENT RSVP
// ========================

export async function rsvpToEvent(eventId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('event_rsvps')
    .insert({ event_id: eventId, user_id: user.id });
  if (error) throw error;
}

export async function cancelRsvp(eventId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function fetchMyRsvps(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('event_rsvps')
    .select('event_id')
    .eq('user_id', user.id);
  if (error) return [];
  return (data || []).map((r: any) => r.event_id);
}

export async function fetchRsvpCount(eventId: string): Promise<number> {
  const { count, error } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);
  if (error) return 0;
  return count ?? 0;
}

export async function fetchAllRsvpCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('event_id');
  if (error) return {};
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.event_id] = (counts[row.event_id] || 0) + 1;
  }
  return counts;
}

// ========================
// LEADS
// ========================

export async function submitLead(lead: {
  car_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  city?: string;
  message?: string;
  user_id?: string;
}) {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMyLeads(): Promise<{ id: string; car_id: string; name: string; email: string; status: string; created_at: string; trim_name?: string; model_name?: string; brand_name?: string }[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('leads')
    .select(`
      id, car_id, name, email, status, created_at,
      trim:trims!leads_car_id_fkey(
        name,
        model:models!trims_model_id_fkey(
          name,
          brand:brands!models_brand_id_fkey(name)
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id,
    car_id: row.car_id,
    name: row.name,
    email: row.email,
    status: row.status,
    created_at: row.created_at,
    trim_name: row.trim?.name,
    model_name: row.trim?.model?.name,
    brand_name: row.trim?.model?.brand?.name,
  }));
}

// ========================
// VEHICLE ACTIVATIONS
// ========================

export async function submitVehicleActivation(activation: {
  brand_id: string;
  model_id: string;
  year: number;
  vin: string;
}): Promise<VehicleActivation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const { data, error } = await supabase
    .from('vehicle_activations')
    .insert({
      user_id: user.id,
      brand_id: activation.brand_id,
      model_id: activation.model_id,
      year: activation.year,
      vin: activation.vin,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMyActivations(): Promise<(VehicleActivation & { brand_name?: string; model_name?: string })[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('vehicle_activations')
    .select(`
      *,
      brand:brands!vehicle_activations_brand_id_fkey(name),
      model:models!vehicle_activations_model_id_fkey(name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    ...row,
    brand_name: row.brand?.name,
    model_name: row.model?.name,
    brand: undefined,
    model: undefined,
  }));
}

// ========================
// SAVED CARS (Favorites)
// ========================

export async function fetchSavedCars(): Promise<Car[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('saved_cars')
    .select(`
      trim_id,
      trim:trims!saved_cars_trim_id_fkey(
        *,
        model:models(
          *,
          brand:brands(*)
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || [])
    .filter((row: any) => row.trim)
    .map((row: any) => mapToCar(row.trim));
}

export async function saveCar(trimId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('saved_cars')
    .insert({ user_id: user.id, trim_id: trimId });
  if (error) throw error;
}

export async function unsaveCar(trimId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('saved_cars')
    .delete()
    .eq('user_id', user.id)
    .eq('trim_id', trimId);
  if (error) throw error;
}

export async function fetchSavedCarIds(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('saved_cars')
    .select('trim_id')
    .eq('user_id', user.id);
  if (error) return [];
  return (data || []).map((r: any) => r.trim_id);
}

// ========================
// STATIC PAGES
// ========================

export async function fetchStaticPage(pageKey: string): Promise<{ title: string; content: string } | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', `page_${pageKey}`)
    .single();
  if (error) return null;
  return data?.value as { title: string; content: string } | null;
}
