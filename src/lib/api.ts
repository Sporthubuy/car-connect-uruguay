import { supabase } from './supabase';
import { Brand, Model, Car, ReviewPost, Community, Event } from '@/types';

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

export async function fetchReviews(): Promise<ReviewPost[]> {
  const { data, error } = await supabase
    .from('review_posts')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .order('member_count', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function submitLead(lead: {
  car_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  city?: string;
  message?: string;
}) {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();
  if (error) throw error;
  return data;
}
