import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbUser {
  id: string;
  wallet_address: string;
  username: string;
  profile_picture_url: string | null;
  name: string;
  country: string;
  country_code: string;
  native_languages: string[];
  learning_languages: string[];
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbContactData {
  username: string;
  name: string;
  country: string;
  countryCode: string;
  profilePictureUrl: string | null;
  nativeLanguages: string[];
  learningLanguages: string[];
}

export interface DbContact {
  id: string;
  user_wallet: string;
  contact_wallet: string;
  contact_data: DbContactData;
  created_at: string;
}
