-- Add RLS policy to allow service role to insert into verification_logs
-- This is needed for the verify-certificate edge function to log verification attempts
CREATE POLICY "Service role can insert verification logs"
ON public.verification_logs
FOR INSERT
TO service_role
WITH CHECK (true);