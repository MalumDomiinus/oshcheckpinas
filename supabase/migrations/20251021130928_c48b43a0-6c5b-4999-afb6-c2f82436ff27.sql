-- Remove public read access to certificates table
-- Verification will continue to work through the secure edge function
DROP POLICY IF EXISTS "Anyone can view active certificates" ON public.certificates;