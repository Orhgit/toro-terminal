-- Toro Platform — Core DDL
-- Requires: pgvector extension (Supabase enables this via the dashboard)

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- Properties
-- ============================================================
CREATE TABLE properties (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_phone   VARCHAR(20)    NOT NULL,
  price_asked   NUMERIC(12,2)  NOT NULL,
  status        VARCHAR(20)    NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft','active','under_contract','sold','archived')),
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_status ON properties (status);

-- ============================================================
-- Geo-location (one-to-one with properties)
-- ============================================================
CREATE TABLE geo_location (
  id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID              NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  full_address  TEXT              NOT NULL,
  lat           DOUBLE PRECISION  NOT NULL,
  lng           DOUBLE PRECISION  NOT NULL,
  poi_data      JSONB
);

CREATE INDEX idx_geo_location_coords ON geo_location (lat, lng);

-- ============================================================
-- AI Metadata (one-to-one with properties)
-- ============================================================
CREATE TABLE ai_metadata (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       UUID        NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  marketing_copy    TEXT,
  embedding_vector  vector(1536)
);

-- ============================================================
-- Leads (potential buyers / renters)
-- ============================================================
CREATE TABLE leads (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100)  NOT NULL,
  phone            VARCHAR(20)   NOT NULL,
  budget_max       NUMERIC(12,2) NOT NULL,
  city_preferred   VARCHAR(100)  NOT NULL,
  min_rooms        INTEGER       NOT NULL DEFAULT 1,
  specific_needs   TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_city ON leads (city_preferred);
CREATE INDEX idx_leads_budget ON leads (budget_max);

-- ============================================================
-- Multi-Tenant: Organizations (Agencies / Brokers)
-- ============================================================
CREATE TABLE organizations (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200)   NOT NULL,
  slug          VARCHAR(100)   NOT NULL UNIQUE,
  logo_url      TEXT,
  phone         VARCHAR(20),
  email         VARCHAR(200),
  plan          VARCHAR(30)    NOT NULL DEFAULT 'free'
                               CHECK (plan IN ('free','starter','pro','enterprise')),
  max_listings  INTEGER        NOT NULL DEFAULT 5,
  is_active     BOOLEAN        NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_organizations_slug ON organizations (slug);

-- ============================================================
-- Multi-Tenant: Users
-- ============================================================
CREATE TABLE users (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID           REFERENCES organizations(id) ON DELETE SET NULL,
  email             VARCHAR(200)   NOT NULL UNIQUE,
  full_name         VARCHAR(200)   NOT NULL,
  phone             VARCHAR(20),
  role              VARCHAR(30)    NOT NULL DEFAULT 'agent'
                                   CHECK (role IN ('super_admin','org_owner','agent','viewer')),
  avatar_url        TEXT,
  -- bcrypt hash. Nullable to support invited-but-not-yet-onboarded accounts.
  password_hash     VARCHAR(255),
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_org ON users (organization_id);
CREATE INDEX idx_users_role ON users (role);

-- ============================================================
-- Multi-Tenant: Subscription Plans
-- ============================================================
CREATE TABLE subscription_plans (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(50)    NOT NULL UNIQUE,
  slug            VARCHAR(30)    NOT NULL UNIQUE,
  max_listings    INTEGER        NOT NULL,
  max_agents      INTEGER        NOT NULL DEFAULT 1,
  price_monthly   NUMERIC(10,2)  NOT NULL DEFAULT 0,
  features        JSONB          NOT NULL DEFAULT '[]'::jsonb,
  is_active       BOOLEAN        NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Seed default plans
INSERT INTO subscription_plans (name, slug, max_listings, max_agents, price_monthly, features) VALUES
  ('חינמי', 'free', 5, 1, 0, '["basic_listing","manual_publish"]'),
  ('סטארטר', 'starter', 20, 3, 199, '["basic_listing","manual_publish","ai_copywriter","analytics_basic"]'),
  ('פרו', 'pro', 100, 10, 499, '["basic_listing","manual_publish","ai_copywriter","analytics_advanced","vip_promotion","lead_crm"]'),
  ('אנטרפרייז', 'enterprise', -1, -1, 0, '["unlimited","white_label","api_access","dedicated_support"]');

-- ============================================================
-- Multi-Tenant: Link properties to organizations
--
-- organization_id is NOT NULL: every property belongs to exactly one org.
-- ON DELETE CASCADE because deleting the org should delete its data
-- (compliance / cleanup), not leave orphaned rows that fail the NOT NULL.
-- created_by is nullable + SET NULL because users can be deactivated /
-- deleted but their listings persist under the org.
-- ============================================================
ALTER TABLE properties
  ADD COLUMN organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE properties
  ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_properties_org ON properties (organization_id);
CREATE INDEX idx_properties_org_status ON properties (organization_id, status);
CREATE INDEX idx_properties_org_created ON properties (organization_id, created_at DESC);

-- ============================================================
-- Multi-Tenant: Link leads to organizations
--
-- Public lead-form submissions can arrive without an explicit org context
-- (the platform may surface a generic "contact us" form). To keep app-layer
-- enforcement simple we still allow NULL here, BUT every authenticated
-- read MUST filter by the caller's organization_id (or super_admin sees all).
-- See app/api/leads/store.ts for the enforcement.
-- TODO(RIN-416): once Supabase Auth is wired, switch RLS on (template below)
-- and tighten this to NOT NULL with a "platform" pseudo-org.
-- ============================================================
ALTER TABLE leads
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE leads
  ADD COLUMN assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_leads_org ON leads (organization_id);
CREATE INDEX idx_leads_org_created ON leads (organization_id, created_at DESC);

-- ============================================================
-- Audit Log (for super admin oversight)
-- ============================================================
CREATE TABLE audit_log (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID           REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID           REFERENCES organizations(id) ON DELETE SET NULL,
  action          VARCHAR(100)   NOT NULL,
  entity_type     VARCHAR(50),
  entity_id       UUID,
  metadata        JSONB,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_org ON audit_log (organization_id);
CREATE INDEX idx_audit_log_user ON audit_log (user_id);
CREATE INDEX idx_audit_log_action ON audit_log (action);

-- ============================================================
-- Row-Level Security (template — disabled until RIN-416 wires Supabase Auth)
--
-- Once auth.users is the source of truth and our app's `users.id` matches
-- `auth.uid()`, uncomment to enforce tenant isolation at the DB layer.
-- Until then, app-layer enforcement (session cookie + filter in queries)
-- is the primary line of defence and is covered by contract tests.
-- ============================================================
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log  ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY tenant_isolation_properties ON properties
--   USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
-- CREATE POLICY tenant_isolation_leads ON leads
--   USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
--          OR organization_id IS NULL); -- platform-level leads visible to all (super_admin filter app-side)
-- CREATE POLICY users_self_or_org ON users
--   USING (id = auth.uid() OR organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));
-- CREATE POLICY audit_log_immutable_insert ON audit_log
--   FOR INSERT WITH CHECK (true);
-- CREATE POLICY audit_log_no_update ON audit_log
--   FOR UPDATE USING (false);
-- CREATE POLICY audit_log_no_delete ON audit_log
--   FOR DELETE USING (false);
