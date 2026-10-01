-- 1440 accounts (Cloudflare D1). Apply with:  npx wrangler d1 execute kor-gallery-accounts --remote --file api/schema.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,            -- lower case
  nick TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass TEXT NOT NULL,                    -- pbkdf2$iterations$salt$hash (base64url)
  role TEXT NOT NULL DEFAULT 'user',     -- 'user' | 'admin'
  uni_email TEXT UNIQUE,                 -- a university address can give one free month, once
  student TEXT NOT NULL DEFAULT 'none',  -- 'none' | 'pending' | 'verified'
  trial_until INTEGER,                   -- ms; free use until then
  paid_until INTEGER,                    -- ms; a paid pass runs until then
  state TEXT NOT NULL DEFAULT '{}',      -- the hub: last form, forms in 홈 (JSON, small)
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,                -- sha-256 of the cookie value
  user_id TEXT NOT NULL,
  expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS codes (       -- university e-mail codes
  user_id TEXT PRIMARY KEY,
  uni_email TEXT NOT NULL,
  code TEXT NOT NULL,                    -- sha-256
  expires INTEGER NOT NULL,
  tries INTEGER NOT NULL DEFAULT 0,
  sent INTEGER NOT NULL                  -- last time a code was sent
);
CREATE TABLE IF NOT EXISTS requests (    -- addresses the site does not know as a university: the admin decides
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  uni_email TEXT NOT NULL,
  school TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'denied'
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS attempts (    -- failed log-ins, for slowing down guessing
  key TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS attempts_key ON attempts (key, at);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);
CREATE TABLE IF NOT EXISTS payments (    -- NICEPAY orders: the amount is fixed by the server when the order is made
  order_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,                    -- 'month' | 'year'
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,                  -- 'ready' | 'paid' | 'failed'
  tid TEXT,
  message TEXT,
  created INTEGER NOT NULL,
  paid_at INTEGER
);
CREATE INDEX IF NOT EXISTS payments_user ON payments (user_id, created);
