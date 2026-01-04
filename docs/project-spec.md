# OSHCheckPinas - Project Specification

I'm creating a **Certificate Verification Platform for Occupational Safety and Health (OSH)** that does the following:

---

## CORE FEATURES:
- Public certificate verification portal - anyone can verify OSH certificates by entering control number, name, and training date
- Multi-role dashboard system - separate portals for Users (OSH practitioners), Providers (training organizations), and Admins
- Work experience and training tracking for OSH practitioners with automatic years-of-experience calculation
- Bulk certificate upload via CSV for training providers
- AI-powered chat assistant for users to get OSH-related guidance
- Email invitation system for admins to onboard new users

---

## USER ACTIONS:

### Public Users (No login required):
- Users can verify any OSH certificate using control number, name, and training date
- Users can view information about OSH and the platform

### Registered Users (OSH Practitioners):
- Users can view their profile with calculated years of experience and training hours
- Users can add/edit/delete work experience entries with date ranges
- Users can track trainings attended with certificate uploads
- Users can track trainings conducted (as resource speakers)
- Users can verify their attended training certificates
- Users can chat with an AI assistant about OSH topics
- Users can upload a profile picture and set accreditation number

### Training Providers:
- Providers can set up their organization profile with logo
- Providers can upload certificates individually or via CSV bulk upload
- Providers can view, edit, and delete certificates they've issued
- Providers can track accreditation details

### Administrators:
- Admins can view platform statistics (total users, providers, certificates)
- Admins can view and manage all users with their roles
- Admins can send email invitations to onboard new users/providers

---

## TECHNICAL SETUP:
- Use Lovable Cloud (Supabase) for database and authentication
- Use Supabase for user authentication with email/password
- Use Supabase Edge Functions for certificate verification, email sending, and AI chat
- Use Supabase Storage for file uploads (profile pictures, logos, certificates)
- Make it responsive (work on phones and computers)
- Use modern, clean design with Tailwind CSS and shadcn/ui components
- Use React 18 with TypeScript and Vite
- Use React Router v6 for client-side routing
- Use TanStack Query for server state management
- Use React Hook Form with Zod for form validation

---

## DATABASE REQUIREMENTS:

### Row Level Security:
- Set up RLS so users only see/edit their own data
- Use separate `user_roles` table (NOT in profiles) to prevent privilege escalation
- Use `has_role()` security definer function for role checks
- Allow providers to manage only their own certificates
- Allow admins to view all data

### Tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (name, avatar, accreditation) |
| `user_roles` | Role assignments (user, provider, admin) |
| `providers` | Training provider organization details |
| `certificates` | Issued OSH certificates |
| `verification_logs` | Audit log of all verification attempts |
| `work_experience` | User work history entries |
| `user_trainings_attended` | Trainings a user has attended |
| `user_trainings_conducted` | Trainings a user has conducted as speaker |

### Enums:
- `app_role`: 'user', 'provider', 'admin'
- `certificate_status`: 'valid', 'expired', 'revoked'

### Storage Buckets:
- `profile-pictures` - User avatars
- `provider-logos` - Organization logos  
- `training-certificates` - Certificate file uploads

---

## EDGE FUNCTIONS:

| Function | Purpose |
|----------|---------|
| `verify-certificate` | Validates certificates with case-insensitive search, logs all attempts |
| `send-invitation` | Sends HTML email invitations via Resend API |
| `ai-chat-assistant` | Provides AI responses using Lovable AI Gateway |

---

## IMPORTANT NOTES:
- Years of experience calculated using **overlap-merging algorithm** for accurate date range handling
- Certificate verification is **case-insensitive** for user-friendliness
- Training verification status **persists** in the database (not session-only)
- Verification logs created for **both success and failure** for audit trail
- Profile trigger auto-creates profile record on user signup
- CSV upload includes **duplicate detection** before insert
- AI chat receives user context (name, experience, trainings) for personalized responses
- Use `has_role()` function to check roles in RLS policies (avoids infinite recursion)

---

## DESIGN PREFERENCES:
- Clean, professional government/corporate aesthetic
- Primary color scheme with accessible contrast
- Card-based layouts for dashboard sections
- Responsive tables with mobile-friendly alternatives
- Toast notifications for user feedback
- Modal dialogs for forms and confirmations
- Floating action button for AI chat
