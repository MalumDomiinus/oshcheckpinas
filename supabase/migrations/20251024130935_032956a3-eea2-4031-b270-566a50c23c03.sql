-- Allow public verification of active certificates
CREATE POLICY "Public can verify certificates" 
ON public.certificates 
FOR SELECT 
TO anon, authenticated
USING (status = 'active'::certificate_status);