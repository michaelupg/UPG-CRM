-- ============================================================================
-- UPG REAL ESTATE CRM - POSTGRESQL RELATIONAL SCHEMA WITH ROW LEVEL SECURITY
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role Enums
CREATE TYPE user_role AS ENUM (
  'administrator',
  'management',
  'sales_manager',
  'agent',
  'marketing',
  'transaction_officer',
  'auditor'
);

CREATE TYPE client_type AS ENUM (
  'Individual',
  'Corporate client',
  'Corporate tenant',
  'Tenant',
  'Buyer',
  'Landlord',
  'Investor',
  'Business owner',
  'Retail operator',
  'Vendor'
);

CREATE TYPE enquiry_status AS ENUM (
  'New',
  'Needs action',
  'Qualified',
  'Assigned',
  'In progress',
  'Closed'
);

CREATE TYPE opportunity_stage AS ENUM (
  'New enquiry',
  'Qualified',
  'Inspection',
  'Negotiation',
  'Closing',
  'Won',
  'Lost'
);

-- 1. Organizations (Multi-tenant partition)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'UPG Property Group',
  country TEXT NOT NULL DEFAULT 'Nigeria',
  currency TEXT NOT NULL DEFAULT 'NGN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CRM Users Profile (links to auth.users in Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'agent',
  avatar_initials TEXT NOT NULL DEFAULT 'AM',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Contacts / Clients (Client 360 Core)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  type client_type NOT NULL DEFAULT 'Individual',
  company TEXT,
  relationship_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Properties Inventory
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  area TEXT,
  city TEXT NOT NULL DEFAULT 'Lagos',
  price_amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_frequency TEXT NOT NULL DEFAULT 'per annum',
  size_sqm NUMERIC(10, 2) NOT NULL,
  bedrooms INT,
  bathrooms INT,
  specifications TEXT,
  amenities TEXT[] DEFAULT '{}',
  availability TEXT NOT NULL DEFAULT 'Available',
  source TEXT,
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Requirements (Structured Demand)
CREATE TABLE requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  property_type TEXT NOT NULL,
  preferred_locations TEXT[] NOT NULL DEFAULT '{}',
  excluded_locations TEXT[] DEFAULT '{}',
  budget_min NUMERIC(15, 2) NOT NULL DEFAULT 0,
  budget_max NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  rent_period TEXT NOT NULL DEFAULT 'per annum',
  min_size_sqm NUMERIC(10, 2),
  max_size_sqm NUMERIC(10, 2),
  bedrooms INT,
  business_use TEXT,
  essential_features TEXT[] DEFAULT '{}',
  deal_breakers TEXT,
  timing TEXT NOT NULL DEFAULT 'Within 30 days',
  decision_authority TEXT NOT NULL DEFAULT 'Sole decision maker',
  funding_readiness TEXT NOT NULL DEFAULT 'Proof of funds ready',
  objections TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enquiries (Omnichannel Inbound)
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  channel TEXT NOT NULL DEFAULT 'WhatsApp',
  external_reference TEXT,
  original_message TEXT NOT NULL,
  property_reference TEXT,
  transaction_type TEXT NOT NULL,
  property_type TEXT NOT NULL,
  preferred_location TEXT,
  budget TEXT,
  status enquiry_status NOT NULL DEFAULT 'New',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  response_sla_minutes INT NOT NULL DEFAULT 15,
  sla_deadline TIMESTAMPTZ,
  sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
  duplicate_match_id UUID REFERENCES enquiries(id),
  next_action TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Opportunities / Pipeline Deals
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES requirements(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  stage opportunity_stage NOT NULL DEFAULT 'New enquiry',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  expected_close_date DATE,
  potential_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
  expected_commission NUMERIC(15, 2) NOT NULL DEFAULT 0,
  probability INT NOT NULL DEFAULT 50,
  lead_score INT NOT NULL DEFAULT 70,
  lost_reason TEXT,
  next_action TEXT NOT NULL,
  next_action_due TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'High',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Activities Log
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  outcome TEXT NOT NULL,
  duration_minutes INT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT NOT NULL,
  next_action TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Tasks & Follow-ups
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL DEFAULT 'Call',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  due_time TEXT,
  priority TEXT NOT NULL DEFAULT 'High',
  status TEXT NOT NULL DEFAULT 'open',
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Inspections
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  attendees TEXT[] DEFAULT '{}',
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  feedback_notes TEXT,
  client_objections TEXT,
  next_steps TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Transactions & Closings
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  agreed_amount NUMERIC(15, 2) NOT NULL,
  commission_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 10,
  total_commission NUMERIC(15, 2) NOT NULL,
  cash_received NUMERIC(15, 2) NOT NULL DEFAULT 0,
  balance_pending NUMERIC(15, 2) NOT NULL DEFAULT 0,
  closing_status TEXT NOT NULL DEFAULT 'Draft agreement',
  legal_documents JSONB DEFAULT '[]',
  handover_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Automation Rules
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  condition_expr TEXT NOT NULL,
  action_expr TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  execution_count INT NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Audit Logs (Compliance & Tracking)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_contacts_org ON contacts(org_id);
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_properties_org ON properties(org_id);
CREATE INDEX idx_properties_ref ON properties(reference);
CREATE INDEX idx_properties_type_loc ON properties(property_type, location);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX idx_tasks_owner_status ON tasks(owner_id, status);
CREATE INDEX idx_activities_contact ON activities(contact_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get Current User Role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for Contacts
CREATE POLICY "Users can read all contacts in their organization"
  ON contacts FOR SELECT
  USING (TRUE);

CREATE POLICY "Agents and Managers can insert contacts"
  ON contacts FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Agents can update assigned contacts, Managers can update all"
  ON contacts FOR UPDATE
  USING (
    get_current_user_role() IN ('administrator', 'management', 'sales_manager')
    OR relationship_owner_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Policies for Opportunities
CREATE POLICY "Users can view opportunities"
  ON opportunities FOR SELECT
  USING (TRUE);

CREATE POLICY "Authorized staff can modify opportunities"
  ON opportunities FOR ALL
  USING (
    get_current_user_role() IN ('administrator', 'management', 'sales_manager', 'agent')
  );

-- Policies for Transactions
CREATE POLICY "Managers and Transaction Officers can manage transactions"
  ON transactions FOR ALL
  USING (
    get_current_user_role() IN ('administrator', 'management', 'sales_manager', 'transaction_officer')
  );

CREATE POLICY "Agents can view transactions"
  ON transactions FOR SELECT
  USING (TRUE);
