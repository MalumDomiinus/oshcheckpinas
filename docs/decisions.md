# OSHCheckPinas - Architectural Decision Records (ADR)

This document captures key architectural decisions made during the development of OSHCheckPinas, including context, rationale, and consequences.

---

## ADR-001: Separate User Roles Table

### Status
Accepted

### Context
We need to implement role-based access control (RBAC) to differentiate between admins, providers, moderators, and regular users.

### Decision
Store roles in a separate `user_roles` table rather than as a column in the `profiles` table.

### Rationale
- **Security**: Prevents privilege escalation attacks where users could update their profile to change their role
- **RLS Isolation**: Role table can have stricter RLS policies than profiles
- **Flexibility**: Users could potentially have multiple roles in the future
- **Audit Trail**: Easier to track role changes separately

### Consequences
- **Positive**: Much stronger security posture
- **Positive**: Clear separation of concerns
- **Negative**: Additional JOIN required when fetching user data with role
- **Negative**: Slightly more complex queries

### Implementation
```sql
-- Roles in separate table with strict RLS
CREATE TABLE user_roles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Only service role can modify roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
```

---

## ADR-002: Edge Functions for Certificate Verification

### Status
Accepted

### Context
Certificate verification is a core feature that needs to work for anonymous users while maintaining security and audit trails.

### Decision
Use a Supabase Edge Function (`verify-certificate`) for all verification requests instead of direct database queries.

### Rationale
- **Logging**: Can log verification attempts including IP and user agent
- **Validation**: Server-side input validation with Zod
- **Security**: Can use service role key to write logs regardless of user auth status
- **Rate Limiting**: Future ability to add rate limiting at edge
- **Audit Trail**: Every verification attempt is logged for compliance

### Consequences
- **Positive**: Complete audit trail of all verification attempts
- **Positive**: Can capture anonymous user metadata (IP, user agent)
- **Positive**: Centralized validation logic
- **Negative**: Slightly higher latency than direct queries
- **Negative**: Edge function cold starts

### Implementation
```typescript
// Edge function with service role for logging
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Log every attempt regardless of result
await supabaseAdmin.from('verification_logs').insert({
  searched_first_name,
  searched_last_name,
  searched_certificate_number,
  success: !!certificate,
  certificate_id: certificate?.id,
  ip_address,
  user_agent
});
```

---

## ADR-003: Years of Experience Overlap Merging

### Status
Accepted

### Context
Users may have concurrent jobs (e.g., part-time positions, consulting while employed). Simply summing all work periods would double-count overlapping time.

### Decision
Implement an overlap-merging algorithm that consolidates overlapping employment periods before calculating total years.

### Rationale
- **Accuracy**: Provides truthful representation of actual career duration
- **Professional**: Matches how HR professionals calculate experience
- **Edge Cases**: Handles concurrent employment correctly

### Algorithm
```typescript
// 1. Convert work records to date periods
// 2. Sort by start date
// 3. Merge overlapping periods
// 4. Sum non-overlapping durations

const periods = workExperience.map(exp => ({
  start: new Date(exp.from_date),
  end: exp.to_date ? new Date(exp.to_date) : new Date()
}));

periods.sort((a, b) => a.start.getTime() - b.start.getTime());

const merged = [];
for (const period of periods) {
  if (merged.length === 0 || period.start > merged[merged.length - 1].end) {
    merged.push({ ...period });
  } else {
    // Overlapping - extend end if needed
    merged[merged.length - 1].end = new Date(
      Math.max(merged[merged.length - 1].end.getTime(), period.end.getTime())
    );
  }
}
```

### Consequences
- **Positive**: Accurate experience calculation
- **Positive**: Handles edge cases (concurrent jobs, gaps)
- **Negative**: More complex than simple sum
- **Negative**: Slightly higher computation

---

## ADR-004: Lovable Cloud over External Backend

### Status
Accepted

### Context
We need a backend for authentication, database, file storage, and serverless functions.

### Decision
Use Lovable Cloud (Supabase-based) as the integrated backend rather than a separate external service.

### Rationale
- **Integration**: Seamless integration with Lovable editor
- **Speed**: No setup or configuration required
- **Cost**: Included in Lovable pricing
- **Features**: Full PostgreSQL, Auth, Storage, Edge Functions
- **Security**: Auto-generated types, managed infrastructure

### Consequences
- **Positive**: Zero backend setup time
- **Positive**: Auto-generated TypeScript types
- **Positive**: Built-in RLS and auth
- **Negative**: Vendor lock-in to Supabase patterns
- **Negative**: Limited to Supabase feature set

---

## ADR-005: Training Verification Persistence

### Status
Accepted

### Context
When users verify their training certificates, we need to remember the verification status.

### Decision
Add a `verified` boolean column to `user_trainings_attended` that persists verification status.

### Rationale
- **User Experience**: Users don't need to re-verify every session
- **Trust Indicator**: Verified trainings can be displayed differently
- **Performance**: No need to re-query verification API for display
- **Simplicity**: Simple boolean is easy to query and display

### Implementation
```sql
ALTER TABLE user_trainings_attended
ADD COLUMN verified boolean NOT NULL DEFAULT false;
```

```typescript
// Update after successful verification
await supabase
  .from('user_trainings_attended')
  .update({ verified: true })
  .eq('id', trainingId);
```

### Consequences
- **Positive**: One-time verification persists
- **Positive**: Can filter/sort by verified status
- **Negative**: Verification status could become stale if certificate revoked
- **Negative**: No automatic re-verification

---

## ADR-006: CSV Bulk Upload for Certificates

### Status
Accepted

### Context
Training providers issue many certificates and need an efficient way to add them to the system.

### Decision
Implement a CSV upload feature with client-side parsing and validation, followed by batch insert.

### Rationale
- **Efficiency**: Providers can upload hundreds of certificates at once
- **Validation**: Client-side validation with Zod provides immediate feedback
- **Duplicate Check**: Pre-checks for existing certificate numbers
- **User Control**: Shows row-by-row validation results before insert

### Implementation
- Custom CSV parser handles quoted fields with commas
- Zod schema validates each row
- Duplicate check against existing certificates
- Batch insert of valid rows
- Display validation errors per row

### Consequences
- **Positive**: Massive time savings for providers
- **Positive**: Immediate validation feedback
- **Positive**: Handles edge cases (quoted fields, special chars)
- **Negative**: Large files could be slow (client-side processing)
- **Negative**: Complex error handling for partial failures

---

## ADR-007: Lovable AI for Chat Assistant

### Status
Accepted

### Context
We want to provide an AI-powered assistant to help users understand their OSH career data.

### Decision
Use Lovable AI Gateway with Google Gemini model instead of direct API integration.

### Rationale
- **No API Key**: LOVABLE_API_KEY is auto-provisioned
- **Cost**: Included in Lovable usage
- **Simplicity**: Standard OpenAI-compatible API
- **Security**: No user API keys to manage

### Implementation
```typescript
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt },
      ...userMessages
    ]
  })
});
```

### Consequences
- **Positive**: No API key management
- **Positive**: User context enrichment
- **Negative**: Limited to Lovable AI supported models
- **Negative**: Rate limits apply

---

## ADR-008: Professional Accreditation Conditional UI

### Status
Accepted

### Context
Only OSH Practitioners and OSH Consultants can conduct trainings as resource speakers. Regular users shouldn't see the "Trainings Conducted" section.

### Decision
Conditionally render TrainingsConductedTable based on `professional_accreditation` field value.

### Rationale
- **Clarity**: Non-relevant UI is hidden from regular users
- **Simplicity**: Single field check, no complex role logic
- **Flexibility**: User can enable by updating their profile

### Implementation
```typescript
{profile?.professional_accreditation && 
 ['OSH Practitioner', 'OSH Consultant'].includes(profile.professional_accreditation) && (
  <TrainingsConductedTable userId={session.user.id} />
)}
```

### Consequences
- **Positive**: Clean UI for regular users
- **Positive**: Self-service opt-in via profile
- **Negative**: Could be gamed by setting accreditation
- **Mitigation**: Future verification of accreditation claims

---

## ADR-009: Case-Insensitive Certificate Search

### Status
Accepted

### Context
Users may not remember exact capitalization of names on certificates.

### Decision
Use PostgreSQL ILIKE for case-insensitive name matching in verification.

### Rationale
- **User Experience**: Reduces failed verifications due to case mismatch
- **Reality**: Names on certificates may vary in capitalization
- **Simplicity**: Built-in PostgreSQL feature

### Implementation
```typescript
const { data: certificate } = await supabase
  .from('certificates')
  .select('*')
  .ilike('first_name', firstName.trim())
  .ilike('last_name', lastName.trim())
  .eq('certificate_number', certificateNumber.trim())
  .eq('status', 'active')
  .maybeSingle();
```

### Consequences
- **Positive**: More forgiving search
- **Positive**: Higher verification success rate
- **Negative**: Slightly less precise matching
- **Negative**: Could match similar names (edge case)

---

## ADR-010: Email Invitations via Resend

### Status
Accepted

### Context
Admins need to invite new users (especially providers) to the platform.

### Decision
Use Resend API for sending invitation emails from edge function.

### Rationale
- **Reliability**: Dedicated email service
- **Simplicity**: Simple REST API
- **Deliverability**: Better than self-hosted email
- **Features**: HTML email support

### Implementation
```typescript
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'OSHCheckPinas <noreply@oshcheckpinas.com>',
    to: [email],
    subject: 'Invitation to Join OSHCheckPinas',
    html: htmlTemplate
  })
});
```

### Consequences
- **Positive**: Professional email delivery
- **Positive**: HTML template support
- **Negative**: Requires RESEND_API_KEY secret
- **Negative**: External dependency

---

## Decision Log Summary

| ADR | Decision | Status |
|-----|----------|--------|
| 001 | Separate roles table | Accepted |
| 002 | Edge functions for verification | Accepted |
| 003 | Overlap-merging for experience | Accepted |
| 004 | Lovable Cloud backend | Accepted |
| 005 | Verification persistence | Accepted |
| 006 | CSV bulk upload | Accepted |
| 007 | Lovable AI for chat | Accepted |
| 008 | Conditional UI for accreditation | Accepted |
| 009 | Case-insensitive search | Accepted |
| 010 | Resend for emails | Accepted |
