// Core Types for CarWow LATAM

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string;
  is_active: boolean;
  created_at: string;
}

export interface BrandContact {
  id: string;
  brand_id: string;
  email: string;
  department: string | null;
  is_default: boolean;
  created_at: string;
}

export interface BrandAdmin {
  id: string;
  brand_id: string;
  user_id: string;
  created_at: string;
  profile?: {
    email: string;
    full_name: string;
  };
}

export interface Model {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  segment: CarSegment;
  year_start: number;
  year_end?: number;
  created_at: string;
}

export interface Trim {
  id: string;
  model_id: string;
  name: string;
  slug: string;
  year: number;
  price_usd: number;
  engine: string;
  transmission: string;
  fuel_type: FuelType;
  horsepower: number;
  torque?: number;
  acceleration_0_100?: number;
  top_speed?: number;
  fuel_consumption?: number;
  doors: number;
  seats: number;
  trunk_capacity?: number;
  features: string[];
  images: string[];
  is_featured: boolean;
  created_at: string;
}

export interface Car extends Trim {
  brand: Brand;
  model: Model;
}

export type CarSegment = 
  | 'sedan'
  | 'hatchback'
  | 'suv'
  | 'crossover'
  | 'pickup'
  | 'coupe'
  | 'convertible'
  | 'wagon'
  | 'van'
  | 'sports';

export type FuelType = 
  | 'gasolina'
  | 'diesel'
  | 'hibrido'
  | 'electrico'
  | 'gnc';

export interface Lead {
  id: string;
  car_id: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  city?: string;
  message?: string;
  status: LeadStatus;
  created_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  department?: string;
  city?: string;
  address?: string;
  birth_date?: string;
  gender?: string;
  created_at: string;
}

export type UserRole = 'visitor' | 'user' | 'verified_user' | 'brand_admin' | 'admin';

export interface ReviewPost {
  id: string;
  author_id: string;
  car_id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  pros: string[];
  cons: string[];
  rating: number;
  views: number;
  published_at?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id?: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image?: string;
  brand_id?: string;
  model_id?: string;
  member_count: number;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  content: string;
  images?: string[];
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
}

export interface Event {
  id: string;
  brand_id?: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  location: string;
  event_date: string;
  event_time: string;
  is_public: boolean;
  requires_verification: boolean;
  max_attendees?: number;
  created_at: string;
}

export interface VehicleActivation {
  id: string;
  user_id: string;
  brand_id: string;
  model_id: string;
  year: number;
  vin: string;
  status: ActivationStatus;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
}

export type ActivationStatus = 'pending' | 'verified' | 'rejected';

export interface Benefit {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  terms?: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

// Filter Types
export interface CarFilters {
  brand?: string;
  model?: string;
  segment?: CarSegment;
  priceMin?: number;
  priceMax?: number;
  fuelType?: FuelType;
  year?: number;
}

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'popular';

// Uruguay departments
export const URUGUAY_DEPARTMENTS = [
  'Artigas',
  'Canelones',
  'Cerro Largo',
  'Colonia',
  'Durazno',
  'Flores',
  'Florida',
  'Lavalleja',
  'Maldonado',
  'Montevideo',
  'Paysandú',
  'Río Negro',
  'Rivera',
  'Rocha',
  'Salto',
  'San José',
  'Soriano',
  'Tacuarembó',
  'Treinta y Tres',
] as const;

export type UruguayDepartment = typeof URUGUAY_DEPARTMENTS[number];
