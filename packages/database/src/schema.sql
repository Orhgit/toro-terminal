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
