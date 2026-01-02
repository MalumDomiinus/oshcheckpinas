# OSHCheckPinas - Technical Architecture

## Overview

OSHCheckPinas is a full-stack web application for verifying Occupational Safety and Health (OSH) certificates in the Philippines. Built on modern web technologies with a serverless backend powered by Lovable Cloud.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI library with functional components and hooks |
| **TypeScript** | Type safety and developer experience |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Accessible component library (Radix UI primitives) |
| **React Router v6** | Client-side routing |
| **TanStack Query** | Server state management and caching |
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |
| **Lucide React** | Icon library |

### Backend (Lovable Cloud / Supabase)

| Technology | Purpose |
|------------|---------|
| **Supabase Database** | PostgreSQL database with RLS |
| **Supabase Auth** | Authentication and user management |
| **Supabase Storage** | File storage for images and certificates |
| **Edge Functions** | Serverless Deno functions |
| **Lovable AI Gateway** | AI chat integration |

---

## Project Structure

```
src/
├── components/
│   ├── admin/              # Admin dashboard components
│   │   ├── InviteUserForm.tsx
│   │   └── UserManagementTable.tsx
│   ├── provider/           # Provider dashboard components
│   │   ├── CertificatesList.tsx
│   │   ├── CertificateUpload.tsx
│   │   ├── EditCertificateDialog.tsx
│   │   └── ProviderProfileForm.tsx
│   ├── user/               # User dashboard components
│   │   ├── AIChatAssistant.tsx
│   │   ├── MetricsCards.tsx
│   │   ├── ProfileSettingsModal.tsx
│   │   ├── TrainingsAttendedTable.tsx
│   │   ├── TrainingsConductedTable.tsx
│   │   └── WorkExperienceList.tsx
│   ├── ui/                 # shadcn/ui components
│   ├── Header.tsx          # Shared header
│   ├── VerificationForm.tsx
│   └── VerificationResult.tsx
├── hooks/                  # Custom React hooks
├── integrations/
│   └── supabase/
│       ├── client.ts       # Supabase client (auto-generated)
│       └── types.ts        # Database types (auto-generated)
├── lib/
│   └── utils.ts            # Utility functions
├── pages/
│   ├── Index.tsx           # Landing page
│   ├── Auth.tsx            # Login/Signup
│   ├── UserDashboard.tsx   # User portal
│   ├── ProviderDashboard.tsx
│   ├── Admin.tsx           # Admin portal
│   ├── About.tsx
│   ├── Contact.tsx
│   └── NotFound.tsx
├── App.tsx                 # Router setup
├── main.tsx                # App entry point
└── index.css               # Global styles & design tokens

supabase/
├── config.toml             # Supabase configuration
├── functions/
│   ├── verify-certificate/ # Certificate verification
│   ├── send-invitation/    # Admin user invitation
│   └── ai-chat-assistant/  # AI chat integration
└── migrations/             # Database migrations (read-only)

docs/
├── prompts.md              # Feature prompt library
├── architecture.md         # This file
├── database-schema.md      # Database documentation
└── decisions.md            # Architectural decisions
```

---

## Application Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │     UI Library      │  │
│  │             │  │             │  │    (shadcn/ui)      │  │
│  │ - Index     │  │ - Header    │  │                     │  │
│  │ - Auth      │  │ - Forms     │  │ - Button, Card      │  │
│  │ - Dashboard │  │ - Tables    │  │ - Dialog, Table     │  │
│  │ - Admin     │  │ - Modals    │  │ - Form, Select      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   State Management                   │    │
│  │  - React useState/useEffect for local state         │    │
│  │  - TanStack Query for server state                  │    │
│  │  - React Hook Form for form state                   │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Supabase Client                     │    │
│  │  - Authentication                                    │    │
│  │  - Database queries                                  │    │
│  │  - Storage operations                                │    │
│  │  - Edge function invocations                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Lovable Cloud                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Edge Functions                      │    │
│  │                                                      │    │
│  │  verify-certificate     → Validates certificates    │    │
│  │  send-invitation        → Sends email invites       │    │
│  │  ai-chat-assistant      → AI chat responses         │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  PostgreSQL Database                 │    │
│  │                                                      │    │
│  │  - Row Level Security (RLS) enabled                 │    │
│  │  - Separate user_roles table for security           │    │
│  │  - Automatic timestamps via triggers                │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Storage Buckets                     │    │
│  │                                                      │    │
│  │  profile-pictures      → User avatars               │    │
│  │  provider-logos        → Provider organization logos│    │
│  │  training-certificates → Certificate file uploads   │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  External Services                   │    │
│  │                                                      │    │
│  │  Resend API            → Email delivery             │    │
│  │  Lovable AI Gateway    → AI chat (Gemini)           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  User    │────>│  Auth Page   │────>│  Supabase   │
│          │     │  (Login/     │     │  Auth       │
│          │     │   Signup)    │     │             │
└──────────┘     └──────────────┘     └─────────────┘
                        │                    │
                        │                    ▼
                        │           ┌─────────────┐
                        │           │ Create      │
                        │           │ Profile     │
                        │           │ Record      │
                        │           └─────────────┘
                        │                    │
                        ▼                    ▼
                 ┌──────────────┐     ┌─────────────┐
                 │ Check Role   │<────│ user_roles  │
                 │ from DB      │     │ Table       │
                 └──────────────┘     └─────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  Admin   │  │ Provider │  │   User   │
    │ /admin   │  │ /provider│  │/dashboard│
    └──────────┘  └──────────┘  └──────────┘
```

---

## Certificate Verification Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│  Public  │────>│ Verification │────>│ verify-cert     │
│  User    │     │ Form         │     │ Edge Function   │
└──────────┘     └──────────────┘     └─────────────────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                 ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
                 │ Validate    │       │ Query       │       │ Log to      │
                 │ Input (Zod) │       │ Certificates│       │ verification│
                 └─────────────┘       │ Table       │       │ _logs       │
                                       └─────────────┘       └─────────────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
                 ┌─────────────┐                             ┌─────────────┐
                 │  Found:     │                             │  Not Found: │
                 │  Return     │                             │  Return     │
                 │  Certificate│                             │  Failure    │
                 └─────────────┘                             └─────────────┘
```

---

## Security Architecture

### Row Level Security (RLS)

All tables have RLS enabled with policies based on:
- `auth.uid()` - Current authenticated user
- `has_role()` - Custom function for role checking

### Key Security Decisions

1. **Separate Roles Table**: Roles stored in `user_roles` table, not in profiles, to prevent privilege escalation via profile updates.

2. **Service Role for Logging**: Verification logs use service role key to allow anonymous users to trigger logging.

3. **Edge Functions for Sensitive Operations**: Certificate verification and email sending handled server-side.

4. **Input Validation**: Zod schemas validate all inputs at edge function level.

---

## Data Flow Patterns

### Read Pattern
```
Component → Supabase Client → PostgreSQL (with RLS) → Component State
```

### Write Pattern
```
Form → Validation → Supabase Client → PostgreSQL (with RLS) → Toast Notification
```

### Edge Function Pattern
```
Component → supabase.functions.invoke() → Edge Function → External API/DB → Response
```

---

## Environment Configuration

### Auto-Generated (Do Not Edit)
- `.env` - Environment variables
- `src/integrations/supabase/client.ts` - Supabase client
- `src/integrations/supabase/types.ts` - Database types

### Secrets (Stored in Supabase)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `LOVABLE_API_KEY`

---

## Scalability Considerations

1. **Serverless Edge Functions**: Auto-scale with traffic
2. **PostgreSQL**: Handles typical SaaS load
3. **CDN**: Static assets served via CDN
4. **Storage**: Supabase Storage for file uploads

---

## Development Workflow

1. **Local Development**: `npm run dev` starts Vite dev server
2. **Code Changes**: Hot module replacement for instant updates
3. **Database Changes**: Via migration tool (generates SQL migrations)
4. **Edge Functions**: Auto-deploy on push
5. **Production**: One-click deploy via Lovable
