-- Add certificate_number column to user_trainings_attended table
ALTER TABLE public.user_trainings_attended
ADD COLUMN certificate_number text;