# OSHCheckPinas - Database Schema Reference

## Overview

The database is PostgreSQL hosted on Lovable Cloud (Supabase). All tables have Row Level Security (RLS) enabled for secure data access.

---

## Enums

### app_role
User role types for access control.
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'provider', 'user');
```

| Value | Description |
|-------|-------------|
| `admin` | Full system access, can manage users and view all data |
| `moderator` | Limited admin capabilities |
| `provider` | Training provider, can manage certificates |
| `user` | Standard user, can manage own profile and trainings |

### certificate_status
Certificate validity states.
```sql
CREATE TYPE public.certificate_status AS ENUM ('active', 'expired', 'revoked');
```

| Value | Description |
|-------|-------------|
| `active` | Valid certificate |
| `expired` | Past expiration date |
| `revoked` | Manually invalidated |

---

## Tables

### 1. profiles

Extended user information linked to Supabase Auth.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | References auth.users, UNIQUE |
| `first_name` | text | YES | - | User's first name |
| `last_name` | text | YES | - | User's last name |
| `email` | text | YES | - | User's email address |
| `job_title` | text | YES | - | Current job title |
| `professional_accreditation` | text | YES | - | 'OSH Practitioner' or 'OSH Consultant' |
| `profile_picture_url` | text | YES | - | URL to profile image in storage |
| `created_at` | timestamptz | NO | now() | Record creation time |
| `updated_at` | timestamptz | NO | now() | Last update time |

**RLS Policies:**
- Users can SELECT/UPDATE their own profile (`auth.uid() = user_id`)
- Users can INSERT their own profile (`auth.uid() = user_id`)

**Trigger:**
- Auto-create profile on user signup via `handle_new_user()` function

---

### 2. user_roles

Separate roles table for security (prevents privilege escalation).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | References auth.users |
| `role` | app_role | NO | - | User's assigned role |
| `created_at` | timestamptz | NO | now() | Record creation time |

**Constraints:**
- UNIQUE(user_id, role) - User can have only one of each role

**RLS Policies:**
- Users can SELECT their own role
- Only service role can INSERT/UPDATE/DELETE

**Why Separate Table?**
- Prevents users from escalating privileges by updating their profile
- Role changes require admin action or service role access

---

### 3. providers

Training provider organizations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | References auth.users |
| `name` | text | NO | - | Organization name |
| `accreditation_number` | text | YES | - | DOLE accreditation number |
| `accreditation_expiration` | date | YES | - | Accreditation validity date |
| `logo_url` | text | YES | - | URL to logo in storage |
| `created_at` | timestamptz | NO | now() | Record creation time |
| `updated_at` | timestamptz | NO | now() | Last update time |

**RLS Policies:**
- Providers can SELECT/UPDATE/INSERT their own record
- Public can SELECT (for certificate verification display)

---

### 4. certificates

OSH certificates issued by providers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `provider_id` | uuid | NO | - | References providers |
| `first_name` | text | NO | - | Certificate holder first name |
| `last_name` | text | NO | - | Certificate holder last name |
| `certificate_number` | text | NO | - | Unique certificate identifier |
| `course_name` | text | NO | - | Training course name |
| `issue_date` | date | NO | - | Certificate issue date |
| `expiration_date` | date | YES | - | Certificate expiry (if applicable) |
| `status` | certificate_status | NO | 'active' | Current status |
| `created_at` | timestamptz | NO | now() | Record creation time |

**Constraints:**
- UNIQUE(certificate_number) - No duplicate certificate numbers

**RLS Policies:**
- Providers can SELECT/INSERT/UPDATE/DELETE their own certificates
- Public can SELECT (for verification)

---

### 5. verification_logs

Audit trail for certificate verification attempts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `certificate_id` | uuid | YES | - | References certificates (if found) |
| `searched_first_name` | text | NO | - | Name searched |
| `searched_last_name` | text | NO | - | Name searched |
| `searched_certificate_number` | text | NO | - | Certificate # searched |
| `success` | boolean | NO | - | Whether certificate was found |
| `ip_address` | text | YES | - | Requester IP address |
| `user_agent` | text | YES | - | Requester browser/client info |
| `created_at` | timestamptz | NO | now() | Verification timestamp |

**RLS Policies:**
- Service role can INSERT (via edge function)
- Admins can SELECT all logs
- No public access

---

### 6. work_experience

User employment history.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | References auth.users |
| `position` | text | NO | - | Job title/position |
| `organization` | text | NO | - | Employer name |
| `from_date` | date | NO | - | Start date |
| `to_date` | date | YES | - | End date (null = current) |
| `appointment_type` | text | NO | - | Employment type |
| `created_at` | timestamptz | NO | now() | Record creation time |

**Appointment Types:**
- 'Permanent'
- 'Contractual'
- 'Part-time'
- 'Consultant'

**RLS Policies:**
- Users can SELECT/INSERT/UPDATE/DELETE their own records

---

### 7. user_trainings_attended

Trainings/courses the user has completed.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | References auth.users |
| `training_name` | text | NO | - | Course/training name |
| `conducted_by` | text | NO | - | Training provider |
| `venue` | text | YES | - | Training location |
| `training_date` | date | NO | - | Date of training |
| `hours` | numeric | NO | - | Duration in hours |
| `certificate_number` | text | YES | - | Certificate # if issued |
| `certificate_file_url` | text | YES | - | URL to uploaded certificate |
| `verified` | boolean | NO | false | Whether certificate was verified |
| `created_at` | timestamptz | NO | now() | Record creation time |

**RLS Policies:**
- Users can SELECT/INSERT/UPDATE/DELETE their own records

**Verification:**
- `verified` boolean updated when user clicks "Verify" and edge function confirms certificate exists

---

### 8. user_trainings_conducted

Trainings where user was a resource speaker.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | References auth.users |
| `training_name` | text | NO | - | Course/training name |
| `venue` | text | YES | - | Training location |
| `training_date` | date | NO | - | Date of training |
| `hours` | numeric | NO | - | Duration in hours |
| `created_at` | timestamptz | NO | now() | Record creation time |

**RLS Policies:**
- Users can SELECT/INSERT/UPDATE/DELETE their own records

**Usage:**
- Only shown for users with `professional_accreditation` of 'OSH Practitioner' or 'OSH Consultant'

---

## Database Functions

### has_role(user_id, role)

Checks if a user has a specific role. Uses SECURITY DEFINER to bypass RLS.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

**Usage in RLS:**
```sql
CREATE POLICY "Admins can view all"
ON some_table
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### handle_new_user()

Trigger function to create profile record on signup.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;
```

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │
│   (Supabase)    │
└────────┬────────┘
         │
         │ user_id
         ▼
┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │   user_roles    │
│                 │       │                 │
│ - first_name    │       │ - role          │
│ - last_name     │       │                 │
│ - job_title     │       └─────────────────┘
│ - accreditation │
└─────────────────┘
         │
         │ user_id
         ▼
┌─────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ work_experience │  │ user_trainings_      │  │ user_trainings_      │
│                 │  │ attended             │  │ conducted            │
│ - position      │  │                      │  │                      │
│ - organization  │  │ - training_name      │  │ - training_name      │
│ - dates         │  │ - hours              │  │ - hours              │
│                 │  │ - verified           │  │                      │
└─────────────────┘  └──────────────────────┘  └──────────────────────┘


┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    providers    │──────>│  certificates   │<──────│verification_logs│
│                 │       │                 │       │                 │
│ - name          │       │ - first_name    │       │ - success       │
│ - accreditation │       │ - last_name     │       │ - ip_address    │
│                 │       │ - course_name   │       │                 │
└─────────────────┘       │ - status        │       └─────────────────┘
                          └─────────────────┘
```

---

## Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `profile-pictures` | No | User profile avatars |
| `provider-logos` | Yes | Provider organization logos |
| `training-certificates` | No | Uploaded certificate files |

---

## Indexes

Recommended indexes for query performance:

```sql
-- Certificate lookups
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_provider ON certificates(provider_id);
CREATE INDEX idx_certificates_names ON certificates(LOWER(first_name), LOWER(last_name));

-- User data lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_work_experience_user_id ON work_experience(user_id);

-- Verification logs
CREATE INDEX idx_verification_logs_created ON verification_logs(created_at DESC);
```
