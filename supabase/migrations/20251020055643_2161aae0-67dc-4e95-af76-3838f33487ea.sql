-- Add provider role to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'provider';

-- Create providers table
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  accreditation_number TEXT NOT NULL UNIQUE,
  accreditation_expiration DATE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Create policies for providers
CREATE POLICY "Providers can view own profile"
  ON public.providers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can update own profile"
  ON public.providers
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can insert own profile"
  ON public.providers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all providers"
  ON public.providers
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add provider_id to certificates table
ALTER TABLE public.certificates
  ADD COLUMN provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE;

-- Update certificates RLS to allow providers to manage their certificates
CREATE POLICY "Providers can view own certificates"
  ON public.certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.providers
      WHERE providers.id = certificates.provider_id
      AND providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can insert own certificates"
  ON public.certificates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.providers
      WHERE providers.id = certificates.provider_id
      AND providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update own certificates"
  ON public.certificates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.providers
      WHERE providers.id = certificates.provider_id
      AND providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete own certificates"
  ON public.certificates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.providers
      WHERE providers.id = certificates.provider_id
      AND providers.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create storage bucket for provider logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-logos', 'provider-logos', true);

-- Storage policies for provider logos
CREATE POLICY "Provider logos are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'provider-logos');

CREATE POLICY "Providers can upload own logo"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Providers can update own logo"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'provider-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Providers can delete own logo"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'provider-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );