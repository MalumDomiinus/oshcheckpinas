# OSHCheckPinas - Feature Prompts Library

A comprehensive collection of prompts to recreate every feature and function in the OSHCheckPinas application.

---

## Table of Contents

1. [Pages](#pages)
2. [User Dashboard Components](#user-dashboard-components)
3. [Provider Components](#provider-components)
4. [Admin Components](#admin-components)
5. [Shared Components](#shared-components)
6. [Edge Functions](#edge-functions)
7. [Database Schema](#database-schema)
8. [Key Algorithms](#key-algorithms)

---

## Pages

### 1. Home Page (Index)

**Prompt:**
> Create a landing page for an OSH certificate verification system called "OSHCheckPinas". Include a header component, a hero section with a gradient background featuring a title "Verify OSH Certificates Instantly" and subtitle about trusted verification. Add a VerificationForm component in the center. Below, display 3 feature cards in a grid: "Secure Verification" (Shield icon), "Instant Results" (Clock icon), and "Always Accurate" (CheckCircle icon). Each card should have an icon, title, and description.

**Key Details:**
- Uses Header and VerificationForm components
- Hero section with gradient background using CSS variables
- 3-column responsive grid for feature cards
- Icons from lucide-react

**Files:** `src/pages/Index.tsx`

---

### 2. Authentication Page

**Prompt:**
> Create an authentication page with login/signup toggle functionality. The form should have email, password, and conditionally show full name field for signup. On successful login, check the user's role from user_roles table and redirect: admin→/admin, provider→/provider, user→/dashboard. Show toast notifications for success/error. Include a link back to home page.

**Key Details:**
- Toggle between login and signup modes
- Role-based redirect after authentication
- Supabase auth integration (signInWithPassword, signUp)
- Creates profile record on signup
- Toast notifications for feedback

**Files:** `src/pages/Auth.tsx`

---

### 3. User Dashboard

**Prompt:**
> Create a user dashboard that displays: (1) Welcome message with user's first name, (2) Edit Profile button that opens ProfileSettingsModal, (3) MetricsCards showing years of experience and training hours, (4) WorkExperienceList for managing employment history, (5) TrainingsAttendedTable for courses taken, (6) Conditionally show TrainingsConductedTable if user has "OSH Practitioner" or "OSH Consultant" accreditation, (7) Floating AI chat button that opens AIChatAssistant modal.

**Key Details:**
- Fetches user profile from profiles table
- Checks session and redirects to /auth if not authenticated
- Conditional rendering based on professional_accreditation field
- Floating action button for AI chat (fixed bottom-right)
- Responsive layout with proper spacing

**Files:** `src/pages/UserDashboard.tsx`

---

### 4. Provider Dashboard

**Prompt:**
> Create a provider dashboard with a tabbed interface containing: (1) Profile tab with ProviderProfileForm for managing provider details, (2) Certificates tab with CertificatesList showing all issued certificates, (3) Upload CSV tab with CertificateUpload for bulk certificate imports. Check that logged-in user has "provider" role, redirect to home if not.

**Key Details:**
- Role-based access control (provider role required)
- Tabs component for navigation
- Fetches provider data from providers table
- Pass provider data and callbacks to child components

**Files:** `src/pages/ProviderDashboard.tsx`

---

### 5. Admin Dashboard

**Prompt:**
> Create an admin dashboard with: (1) Statistics cards showing Total Certificates, Total Verifications, and Success Rate (calculated from verification_logs), (2) Tabbed interface with User Management as default tab containing InviteUserForm and UserManagementTable, (3) Placeholder tabs for Certificates, Verification Logs, and Settings. Check for admin role and redirect if unauthorized.

**Key Details:**
- Admin role verification on mount
- Real-time stats from certificates and verification_logs tables
- Success rate calculation: (successful/total) * 100
- Card-based statistics display with icons

**Files:** `src/pages/Admin.tsx`

---

### 6. About Page

**Prompt:**
> Create an About page for OSHCheckPinas with sections: (1) Header with title and tagline, (2) "Our Mission" card explaining the platform purpose, (3) "Our Vision" card about becoming the trusted platform, (4) "What We Do" section with 3 cards for Professionals, Training Providers, and Employers explaining benefits for each, (5) "About OSH" section explaining importance of occupational safety training.

**Key Details:**
- Uses Card components for content sections
- Grid layout for "What We Do" cards
- Semantic HTML with proper heading hierarchy
- Muted foreground colors for descriptions

**Files:** `src/pages/About.tsx`

---

### 7. Contact Page

**Prompt:**
> Create a Contact page with two-column layout: (1) Left column with contact form (name, email, subject, message fields) that shows success toast on submit, (2) Right column with contact information cards showing email (admin@oshcheckpinas.com), business hours (Mon-Fri 8AM-5PM PHT), and location (Manila, Philippines). Add an "Urgent Assistance" section with phone number.

**Key Details:**
- Form state management with useState
- Toast notification on form submit
- Icons for contact info (Mail, Clock, MapPin)
- Responsive two-column grid

**Files:** `src/pages/Contact.tsx`

---

### 8. 404 Not Found Page

**Prompt:**
> Create a simple 404 Not Found page that logs the attempted route to console for debugging, displays "404" prominently, shows "Oops! Page not found" message, and includes a link back to the home page.

**Key Details:**
- Uses useLocation hook to get attempted path
- useEffect to log 404 errors
- Centered layout with minimal styling
- Link component for navigation

**Files:** `src/pages/NotFound.tsx`

---

## User Dashboard Components

### 9. MetricsCards

**Prompt:**
> Create a MetricsCards component that displays 3 metric cards: (1) "Years of Experience" - fetch work_experience records, calculate total years by merging overlapping date periods, (2) "Training Hours Attended" - sum hours from user_trainings_attended table, (3) "Training Hours Conducted" - conditionally shown based on showResourceSpeaker prop, sum hours from user_trainings_conducted. Show skeleton loaders while loading.

**Key Details:**
- Props: userId, showResourceSpeaker
- Overlap merging algorithm for accurate experience calculation
- Skeleton components during loading
- Icons: Briefcase, GraduationCap, Users
- Format years to 1 decimal place

**Files:** `src/components/user/MetricsCards.tsx`

---

### 10. ProfileSettingsModal

**Prompt:**
> Create a ProfileSettingsModal dialog component for editing user profile. Include: (1) Profile picture with Avatar component and upload button that saves to Supabase storage bucket "profile-pictures", (2) Form fields for first_name, last_name, email (readonly), job_title, (3) Select dropdown for professional_accreditation with options: None, OSH Practitioner, OSH Consultant. Save changes to profiles table.

**Key Details:**
- Props: open, onOpenChange, profile, onUpdate
- File upload to Supabase storage with unique filename
- Updates profile_picture_url in profiles table
- Form pre-populated from profile prop
- Toast notifications for success/error

**Files:** `src/components/user/ProfileSettingsModal.tsx`

---

### 11. WorkExperienceList

**Prompt:**
> Create a WorkExperienceList component for managing employment history. Display existing records with position, organization, dates, and appointment type. Include Add button that shows inline form with: position, organization, from_date, to_date (optional with "I currently work here" checkbox), appointment_type select (Permanent, Contractual, Part-time, Consultant). Allow delete with confirmation. Fetch and save to work_experience table.

**Key Details:**
- Props: userId
- CRUD operations on work_experience table
- Date inputs with optional end date
- Appointment type enum matching database
- Inline form for adding new entries

**Files:** `src/components/user/WorkExperienceList.tsx`

---

### 12. TrainingsAttendedTable

**Prompt:**
> Create a TrainingsAttendedTable component displaying user's attended trainings in a table. Columns: Training Name, Conducted By, Venue, Date, Hours, Certificate #, Actions. Include Add/Edit functionality with form fields matching columns plus certificate file upload. Add a "Verify" button that calls verify-certificate edge function with training_name as firstName, conducted_by as lastName, and certificate_number - persist verification result to "verified" boolean column. Show checkmark badge for verified trainings.

**Key Details:**
- Props: userId
- File upload to Supabase storage bucket "training-certificates"
- Verification calls verify-certificate edge function
- Updates verified boolean in user_trainings_attended
- Visual indicator (CheckCircle icon) for verified status

**Files:** `src/components/user/TrainingsAttendedTable.tsx`

---

### 13. TrainingsConductedTable

**Prompt:**
> Create a TrainingsConductedTable component for resource speakers to track trainings they've conducted. Display table with columns: Training Name, Venue, Date, Hours, Actions. Include Add/Edit/Delete functionality. Store in user_trainings_conducted table.

**Key Details:**
- Props: userId
- Simpler than TrainingsAttendedTable (no verification needed)
- CRUD operations on user_trainings_conducted table
- Date picker for training date
- Number input for hours

**Files:** `src/components/user/TrainingsConductedTable.tsx`

---

### 14. AIChatAssistant

**Prompt:**
> Create an AIChatAssistant dialog component with chat interface. Fetch user context (profile, work experience, trainings) and send to ai-chat-assistant edge function along with conversation messages. Display message history with different styling for user (right-aligned, primary color) and assistant (left-aligned, muted). Include input field and send button. Auto-scroll to latest message.

**Key Details:**
- Props: open, onOpenChange, userId
- Message history in state: Array<{role: 'user'|'assistant', content: string}>
- Calls ai-chat-assistant edge function via supabase.functions.invoke
- ScrollArea for message history with auto-scroll ref
- Loading state while waiting for AI response

**Files:** `src/components/user/AIChatAssistant.tsx`

---

## Provider Components

### 15. ProviderProfileForm

**Prompt:**
> Create a ProviderProfileForm component for training providers to manage their organization profile. Include: (1) Logo display with Avatar component, (2) Logo upload button saving to "provider-logos" storage bucket, (3) Form fields: name, accreditation_number, accreditation_expiration (date picker). If no provider exists, create new record; otherwise update existing. Fetch current user session to get user_id.

**Key Details:**
- Props: provider (existing data or null), onUpdate callback
- Insert or update logic based on provider prop
- File upload with unique filename generation
- Updates logo_url in providers table

**Files:** `src/components/provider/ProviderProfileForm.tsx`

---

### 16. CertificatesList

**Prompt:**
> Create a CertificatesList component displaying all certificates issued by a provider in a table. Columns: Certificate #, Name (first + last), Course, Issue Date, Expiration Date, Status (with colored badge), Actions. Include Edit button opening EditCertificateDialog and Delete button with AlertDialog confirmation. Filter certificates by provider_id.

**Key Details:**
- Props: providerId
- Fetches from certificates table where provider_id matches
- Status badge colors: active=green, expired=yellow, revoked=red
- Delete with confirmation dialog
- Refresh list after edit/delete

**Files:** `src/components/provider/CertificatesList.tsx`

---

### 17. CertificateUpload (CSV)

**Prompt:**
> Create a CertificateUpload component for bulk importing certificates via CSV. Accept CSV file upload with validation (must be .csv, max 5MB). Parse CSV handling quoted fields with commas. Validate each row with Zod schema requiring: first_name, last_name, certificate_number, issue_date (YYYY-MM-DD), course_name, optional expiration_date. Check for duplicate certificate numbers. Show validation errors per row. Insert valid certificates to certificates table with provider_id and status='active'.

**Key Details:**
- Props: providerId, onUploadComplete callback
- Custom CSV parser handling quoted fields
- Zod schema for row validation
- Duplicate check against existing certificates
- Display row-by-row validation results
- Batch insert valid records

**Files:** `src/components/provider/CertificateUpload.tsx`

---

### 18. EditCertificateDialog

**Prompt:**
> Create an EditCertificateDialog component for editing certificate details. Form fields: first_name, last_name, certificate_number, course_name, issue_date, expiration_date (optional), status (Select: active, expired, revoked). Pre-populate form with existing certificate data. Update certificates table on save.

**Key Details:**
- Props: certificate, open, onOpenChange, onUpdate callback
- Form state initialized from certificate prop
- Status dropdown with enum values
- Date inputs for issue/expiration dates
- Toast notifications for success/error

**Files:** `src/components/provider/EditCertificateDialog.tsx`

---

## Admin Components

### 19. InviteUserForm

**Prompt:**
> Create an InviteUserForm component for administrators to invite new users. Form fields: email (validated with Zod), role (Select: user, moderator), optional full_name. On submit, call send-invitation edge function which sends email via Resend API. Show loading state and toast notifications. Clear form on success.

**Key Details:**
- Zod schema for email validation
- react-hook-form integration
- Calls send-invitation edge function
- Role options limited to user/moderator (not admin/provider)
- Loading state during submission

**Files:** `src/components/admin/InviteUserForm.tsx`

---

### 20. UserManagementTable

**Prompt:**
> Create a UserManagementTable component displaying all users with their roles. Fetch profiles joined with user_roles. Display columns: Email, Full Name, Role (colored badge), Created Date. Badge colors: admin=red, provider=blue, moderator=purple, user=default. Sort by created_at descending.

**Key Details:**
- Fetches from profiles and user_roles tables
- Joins user data with role data
- Color-coded role badges using Badge component variants
- Date formatting for created_at
- Skeleton loaders during fetch

**Files:** `src/components/admin/UserManagementTable.tsx`

---

## Shared Components

### 21. Header

**Prompt:**
> Create a Header component with: (1) Logo (Shield icon + "OSHCheckPinas" text) linking to home, (2) Navigation links: Home, About, Contact, (3) Auth-aware buttons: if logged in show role-based dashboard link and Sign Out button; if not show Login and Register buttons. Check user role from user_roles table to determine which dashboard link to show (admin→/admin, provider→/provider, user→/dashboard).

**Key Details:**
- Sticky header with backdrop blur
- Supabase auth state listener (onAuthStateChange)
- Role check on auth state change
- Conditional rendering based on auth state
- Sign out functionality

**Files:** `src/components/Header.tsx`

---

### 22. VerificationForm

**Prompt:**
> Create a VerificationForm component with 3 input fields: First Name, Last Name, Certificate Number. On submit, call verify-certificate edge function. Show loading spinner during verification. On response, display VerificationResult component with the result. Include input validation (all fields required).

**Key Details:**
- Form state for 3 fields
- Calls verify-certificate via supabase.functions.invoke
- Loading state with spinner
- Passes result to VerificationResult component
- Reset function to try again

**Files:** `src/components/VerificationForm.tsx`

---

### 23. VerificationResult

**Prompt:**
> Create a VerificationResult component that displays certificate verification results. If success=false, show red "Certificate Not Found" card with XCircle icon and "Try Again" button. If success=true, show green "Certificate Verified" card with CheckCircle icon and certificate details: full name, provider, course, issue date, expiration date (if exists), certificate number, status. Include "Verify Another Certificate" button.

**Key Details:**
- Props: result (success boolean + certificate object), onReset callback
- Conditional rendering based on result.success
- Certificate interface with all display fields
- Color-coded status badge
- Date formatting for display

**Files:** `src/components/VerificationResult.tsx`

---

## Edge Functions

### 24. verify-certificate

**Prompt:**
> Create a Supabase edge function "verify-certificate" that: (1) Accepts POST with JSON body {firstName, lastName, certificateNumber}, (2) Validates input with Zod schema (strings, min length), (3) Queries certificates table for matching record using case-insensitive ILIKE for names and exact match for certificate_number where status='active', (4) Logs attempt to verification_logs table with success boolean, certificate_id (if found), searched values, IP address, and user agent, (5) Returns JSON {success: boolean, certificate?: object}. Use service role key for logging.

**Key Details:**
- CORS headers for browser access
- Zod validation with trim and min length
- Case-insensitive name matching (ILIKE)
- Service role client for writing to verification_logs
- Captures request IP and user agent

**Files:** `supabase/functions/verify-certificate/index.ts`

---

### 25. send-invitation

**Prompt:**
> Create a Supabase edge function "send-invitation" that: (1) Verifies JWT token and checks user has admin role, (2) Accepts POST with {email, role, fullName?}, (3) Sends HTML email via Resend API with invitation to join platform, (4) Email includes: welcome message, assigned role, signup link (/auth?mode=signup), sender info. Requires RESEND_API_KEY secret.

**Key Details:**
- JWT verification for admin-only access
- Checks user_roles table for admin role
- Resend API integration (api.resend.com)
- HTML email template with styling
- Returns success/error JSON

**Files:** `supabase/functions/send-invitation/index.ts`

---

### 26. ai-chat-assistant

**Prompt:**
> Create a Supabase edge function "ai-chat-assistant" that: (1) Accepts POST with {messages: Array<{role, content}>, userId}, (2) Fetches user context from Supabase: profile, work_experience, user_trainings_attended, (3) Constructs system prompt including user's name, job title, experience, and training history, (4) Calls Lovable AI gateway (ai.gateway.lovable.dev) with model google/gemini-2.5-flash, (5) Returns assistant's response. Use LOVABLE_API_KEY secret.

**Key Details:**
- Fetches comprehensive user context
- System prompt with personalized info
- Lovable AI gateway integration
- Non-streaming response
- Error handling with appropriate status codes

**Files:** `supabase/functions/ai-chat-assistant/index.ts`

---

## Database Schema

### 27. Complete Database Schema

**Prompt:**
> Create the following Supabase database schema for OSHCheckPinas:

**Tables:**

1. **profiles** - Extended user information
   - id (uuid, PK, default gen_random_uuid())
   - user_id (uuid, references auth.users, unique)
   - first_name (text)
   - last_name (text)
   - email (text)
   - job_title (text, nullable)
   - professional_accreditation (text, nullable) - values: null, 'OSH Practitioner', 'OSH Consultant'
   - profile_picture_url (text, nullable)
   - created_at (timestamptz, default now())
   - updated_at (timestamptz, default now())
   - RLS: Users can read/update own profile

2. **user_roles** - Separate roles table for security
   - id (uuid, PK)
   - user_id (uuid, references auth.users)
   - role (app_role enum: 'admin', 'moderator', 'provider', 'user')
   - created_at (timestamptz)
   - RLS: Users can read own role, admins can manage all

3. **providers** - Training provider organizations
   - id (uuid, PK)
   - user_id (uuid, references auth.users)
   - name (text)
   - accreditation_number (text, nullable)
   - accreditation_expiration (date, nullable)
   - logo_url (text, nullable)
   - created_at (timestamptz)
   - updated_at (timestamptz)
   - RLS: Providers can manage own record

4. **certificates** - Issued OSH certificates
   - id (uuid, PK)
   - provider_id (uuid, references providers)
   - first_name (text)
   - last_name (text)
   - certificate_number (text, unique)
   - course_name (text)
   - issue_date (date)
   - expiration_date (date, nullable)
   - status (certificate_status enum: 'active', 'expired', 'revoked')
   - created_at (timestamptz)
   - RLS: Providers can manage own certificates, public can read

5. **verification_logs** - Audit trail for verifications
   - id (uuid, PK)
   - certificate_id (uuid, nullable, references certificates)
   - searched_first_name (text)
   - searched_last_name (text)
   - searched_certificate_number (text)
   - success (boolean)
   - ip_address (text, nullable)
   - user_agent (text, nullable)
   - created_at (timestamptz)
   - RLS: Insert allowed for service role, admins can read

6. **work_experience** - User employment history
   - id (uuid, PK)
   - user_id (uuid, references auth.users)
   - position (text)
   - organization (text)
   - from_date (date)
   - to_date (date, nullable)
   - appointment_type (text) - values: 'Permanent', 'Contractual', 'Part-time', 'Consultant'
   - created_at (timestamptz)
   - RLS: Users can manage own records

7. **user_trainings_attended** - Trainings user has taken
   - id (uuid, PK)
   - user_id (uuid, references auth.users)
   - training_name (text)
   - conducted_by (text)
   - venue (text, nullable)
   - training_date (date)
   - hours (numeric)
   - certificate_number (text, nullable)
   - certificate_file_url (text, nullable)
   - verified (boolean, default false)
   - created_at (timestamptz)
   - RLS: Users can manage own records

8. **user_trainings_conducted** - Trainings user has conducted (resource speaker)
   - id (uuid, PK)
   - user_id (uuid, references auth.users)
   - training_name (text)
   - venue (text, nullable)
   - training_date (date)
   - hours (numeric)
   - created_at (timestamptz)
   - RLS: Users can manage own records

**Enums:**
- app_role: 'admin', 'moderator', 'provider', 'user'
- certificate_status: 'active', 'expired', 'revoked'

**Functions:**
- has_role(role app_role) - Returns boolean if current user has specified role

**Key Details:**
- All tables have RLS enabled
- user_roles separated from profiles for security (prevents privilege escalation)
- verification_logs allows anonymous inserts via service role
- Certificates publicly readable for verification

---

## Key Algorithms

### 28. Years of Experience Calculation

**Prompt:**
> Implement a years of experience calculation algorithm that accurately handles overlapping employment periods. Steps: (1) Fetch all work_experience records for user, (2) Convert each to {start: Date, end: Date} where end defaults to today if null, (3) Sort periods by start date ascending, (4) Merge overlapping periods: if current period starts before or when previous ends, extend previous period's end if current ends later, (5) Sum total duration of merged periods in milliseconds, (6) Convert to years (divide by ms per year), (7) Return rounded to 1 decimal place.

**Code:**
```typescript
const calculateYearsOfExperience = (workExperience: WorkExperience[]): number => {
  if (!workExperience.length) return 0;

  // Convert to date ranges
  const periods = workExperience.map(exp => ({
    start: new Date(exp.from_date),
    end: exp.to_date ? new Date(exp.to_date) : new Date()
  }));

  // Sort by start date
  periods.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Merge overlapping periods
  const merged: typeof periods = [];
  for (const period of periods) {
    if (merged.length === 0) {
      merged.push({ ...period });
    } else {
      const last = merged[merged.length - 1];
      if (period.start <= last.end) {
        // Overlapping - extend end if needed
        last.end = new Date(Math.max(last.end.getTime(), period.end.getTime()));
      } else {
        // Non-overlapping - add new period
        merged.push({ ...period });
      }
    }
  }

  // Calculate total duration
  const totalMs = merged.reduce((sum, period) => {
    return sum + (period.end.getTime() - period.start.getTime());
  }, 0);

  // Convert to years
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  return Math.round((totalMs / msPerYear) * 10) / 10;
};
```

**Key Details:**
- Handles concurrent/overlapping jobs correctly
- Uses 365.25 days per year for accuracy
- Null to_date treated as "currently employed"
- Returns 0 for empty work history

**Files:** `src/components/user/MetricsCards.tsx`

---

## How to Use These Prompts

1. **Recreating a Feature**: Copy the prompt and paste it to your AI assistant along with any relevant context about your tech stack.

2. **Modifying a Feature**: Use the prompt as a baseline and add your modifications to the request.

3. **Understanding Architecture**: Read the Key Details section to understand dependencies and design decisions.

4. **Database Setup**: Use the Database Schema prompt first before implementing features that require data persistence.

5. **Order of Implementation**:
   - Start with Database Schema (#27)
   - Then Edge Functions (#24-26)
   - Then Shared Components (#21-23)
   - Then Page-specific components
   - Finally, Pages (#1-8)
