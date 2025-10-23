-- Grant admin role to benjlugnasin@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('b9e3b695-b1b6-4a63-8b05-fa45255e1608', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;