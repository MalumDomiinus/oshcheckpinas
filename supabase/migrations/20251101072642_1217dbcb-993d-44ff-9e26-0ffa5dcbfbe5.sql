-- Extend profiles table with new fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS professional_accreditation TEXT CHECK (professional_accreditation IN ('None', 'OSH Practitioner', 'OSH Consultant'));

-- Create work experience table
CREATE TABLE IF NOT EXISTS public.work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  organization TEXT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE,
  is_present BOOLEAN DEFAULT FALSE,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('Permanent', 'Contractual', 'Part-time', 'Consultant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trainings attended table
CREATE TABLE IF NOT EXISTS public.user_trainings_attended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_name TEXT NOT NULL,
  conducted_by TEXT NOT NULL,
  venue TEXT NOT NULL,
  date_completed DATE NOT NULL,
  hours NUMERIC NOT NULL,
  certificate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trainings conducted table
CREATE TABLE IF NOT EXISTS public.user_trainings_conducted (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_name TEXT NOT NULL,
  venue TEXT NOT NULL,
  date_conducted DATE NOT NULL,
  hours NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trainings_attended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trainings_conducted ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_experience
CREATE POLICY "Users can view own work experience"
  ON public.work_experience FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work experience"
  ON public.work_experience FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work experience"
  ON public.work_experience FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own work experience"
  ON public.work_experience FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_trainings_attended
CREATE POLICY "Users can view own trainings attended"
  ON public.user_trainings_attended FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trainings attended"
  ON public.user_trainings_attended FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trainings attended"
  ON public.user_trainings_attended FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trainings attended"
  ON public.user_trainings_attended FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_trainings_conducted
CREATE POLICY "Users can view own trainings conducted"
  ON public.user_trainings_conducted FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trainings conducted"
  ON public.user_trainings_conducted FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trainings conducted"
  ON public.user_trainings_conducted FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trainings conducted"
  ON public.user_trainings_conducted FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage buckets for profile pictures and training certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('training-certificates', 'training-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile pictures
CREATE POLICY "Public can view profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload own profile picture"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own profile picture"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for training certificates
CREATE POLICY "Users can view own certificates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'training-certificates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'training-certificates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Triggers for updated_at
CREATE TRIGGER update_work_experience_updated_at
  BEFORE UPDATE ON public.work_experience
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_trainings_attended_updated_at
  BEFORE UPDATE ON public.user_trainings_attended
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_trainings_conducted_updated_at
  BEFORE UPDATE ON public.user_trainings_conducted
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();