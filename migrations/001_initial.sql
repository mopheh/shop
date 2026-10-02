-- Migration 001: initial schema
-- Run with: npx tsx scripts/migrate.ts

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,          -- from Google sub
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  image      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_kobo  INTEGER NOT NULL CHECK (price_kobo > 0),  -- minor units (kobo)
  image_url   TEXT NOT NULL DEFAULT '',
  stock       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL DEFAULT 'pending',          -- pending | confirmed | shipped | delivered
  total_kobo      INTEGER NOT NULL CHECK (total_kobo >= 0), -- computed server-side
  shipping_name   TEXT NOT NULL,
  shipping_email  TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city   TEXT NOT NULL,
  shipping_state  TEXT NOT NULL,
  shipping_zip    TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_kobo INTEGER NOT NULL CHECK (unit_price_kobo > 0), -- snapshot at order time
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
