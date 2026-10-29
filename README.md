# UPG Real Estate CRM — Production Nigerian Real Estate CRM

An enterprise multi-user customer relationship management system engineered specifically for the Nigerian real estate sector (Lagos, Abuja, Port Harcourt). Built with strict adherence to the UPG authoritative brand design system, normalized relational PostgreSQL schemas with Row-Level Security (RLS), algorithmic property matching, Client 360 profiling, and omnichannel enquiry workflows.

---

## 1. Brand Tokens & Design System

The application strictly implements the UPG visual specification:
- **Button Gold**: `#DBA80F` (Accent & interactive CTAs)
- **Application Background**: `#FFF1E0` (Rich warm cream canvas)
- **Strict Text & High Contrast**: `#000000` (All body, titles, and data text)
- **Muted Elements**: `#665d50`
- **Hairline Borders**: `#e8d8c4`
- **Surface Elevation**: `#fffaf4` (Panels and cards with `0 3px 12px rgba(60, 40, 9, 0.04)`)
- **Typography Pairing**: `Montserrat` display headlines paired with `Plus Jakarta Sans` and tabular numerals (`JetBrains Mono / tabular-nums`)

---

## 2. Core Functional Modules

1. **Omnichannel Enquiry Capture**:
   - Captures WhatsApp, Web Form, Phone, Email, and SMS inquiries.
   - Response SLA timer tracking (5-minute high intent, 15-minute standard) with automated breach escalations.
2. **Client 360 Profile Dossier**:
   - Unified relationship records connecting multiple active requirements, property matches, conversations, pipeline deals, follow-up tasks, and executed transactions.
3. **Structured Requirements & Adaptive Fields**:
   - Adaptive specification tracking based on property type (Commercial Office, Heavy Industrial Warehouse, Serviced Penthouse, High-Street Retail).
   - Deal-breakers, power backup requirements (24/7 dedicated generator vs. national grid), parking ratios, and zoning compliance.
4. **Algorithmic Property Matching Engine**:
   - Two-phase matching: Hard constraints first (type, location exclusion, budget tolerance $\le 15\%$, min size), followed by weighted scoring (Location fit 30%, Budget fit 20%, Size 10%, Amenities & power 40%).
   - Explicitly explains match reasons and highlights missing verification data.
5. **Interactive Opportunity Pipeline**:
   - Kanban Board and Table views with stage transition validation (New enquiry → Qualified → Inspection → Negotiation → Closing → Won / Lost).
   - Validates required metadata before advancing stages (mandatory lost reasons, contract value for won deals).
6. **Inspections Workflow**:
   - Physical viewing scheduler, attendee check-in logs, and recorded client objections.
   - Distinguishes scheduled inspections from verified completed inspections.
7. **Transactions & Closings Ledger**:
   - Distinguishes forecast pipeline revenue, earned agency commissions, and cash received.
   - Statutory documentation tracker (Governor's Consent, C of O, Deed of Assignment, Tenancy Agreement, Handover Certificate).
8. **Staff Performance & Scorecard**:
   - Measures authentic meaningful conversations (calls $\ge 2$ mins, meetings) and completed inspections.
   - 1-click CSV export of agent metrics.
9. **Role-Based Access Control (RBAC)**:
   - 7 distinct organizational roles: Administrator, Management, Sales Manager, Real Estate Agent, Marketing, Transaction Officer, Auditor & Compliance.
10. **Gemini AI Copilot**:
    - Unstructured message requirement extraction into structured parameters.
    - Tailored Nigerian business etiquette agent response drafting.

---

## 3. Normalized Database Schema (Supabase PostgreSQL)

The complete SQL migration is located at `/supabase/migrations/20261028_init.sql` and includes:
- `organizations`: Multi-tenant boundary
- `users`: Staff profiles with `user_role` enum
- `contacts`: Client 360 relationship records
- `properties`: Inventory with coordinates, specifications, and amenity arrays
- `requirements`: Structured demand with location and budget tolerances
- `enquiries`: Inbound channel queue with SLA timestamps
- `opportunities`: Pipeline deals with stage transitions and lead scores
- `activities`: Timestamped communication interactions
- `tasks`: Follow-ups with priority and escalation rules
- `inspections`: Physical viewing logs and objections
- `transactions`: Commission settlements and title documents
- `automation_rules`: Trigger and action engine
- `audit_logs`: Immutable compliance audit trail

### Row Level Security (RLS)
Every table has RLS enabled with granular policies based on `get_current_user_role()`, ensuring agents only modify assigned records while management and administrators retain cross-organization visibility.

---

## 4. Local Development & Testing

```bash
# Install dependencies
npm install

# Start Express + Vite development server (Port 3000)
npm run dev

# Run TypeScript build verification
npm run build
```

---

## 5. Deployment Guide

### GitHub Repository Setup
1. Initialize repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete UPG Real Estate CRM production implementation"
   git remote add origin https://github.com/your-org/upg-real-estate-crm.git
   git push -u origin main
   ```

### Supabase Database Provisioning
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and run `/supabase/migrations/20261028_init.sql`.
3. Optionally seed demo data by running `/supabase/seed.sql`.
4. Copy your project URL and `anon` key into your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Vercel Deployment
1. Import the repository in [vercel.com](https://vercel.com).
2. The included `vercel.json` automatically configures API proxying and client SPA rewrites.
3. Configure the following Environment Variables in the Vercel dashboard:
   - `GEMINI_API_KEY`: For AI copilot features
   - `VITE_SUPABASE_URL`: Your Supabase endpoint
   - `VITE_SUPABASE_ANON_KEY`: Supabase client key
   - `WHATSAPP_API_TOKEN`: Meta WhatsApp Cloud API token (optional)
   - `TERMII_API_KEY`: Nigerian SMS delivery key (optional)
4. Deploy!
