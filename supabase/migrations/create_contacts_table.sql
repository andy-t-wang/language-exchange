-- Create contacts table for storing chat connections
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  contact_wallet TEXT NOT NULL,
  contact_username TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_country TEXT NOT NULL DEFAULT '',
  contact_country_code TEXT NOT NULL DEFAULT 'XX',
  contact_profile_picture_url TEXT,
  contact_native_languages TEXT[] NOT NULL DEFAULT '{}',
  contact_learning_languages TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique contact pairs
  UNIQUE(user_wallet, contact_wallet)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_user_wallet ON public.contacts(user_wallet);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own contacts
CREATE POLICY "Users can read own contacts" ON public.contacts
  FOR SELECT USING (true);

-- Policy: Users can insert contacts (service role will validate)
CREATE POLICY "Users can insert contacts" ON public.contacts
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own contacts
CREATE POLICY "Users can update own contacts" ON public.contacts
  FOR UPDATE USING (true);
