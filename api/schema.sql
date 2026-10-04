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
CREATE TABLE IF NOT EXISTS subs (       -- the monthly subscription (NICEPAY billing key). No card number is kept.
  user_id TEXT PRIMARY KEY,
  bid TEXT NOT NULL,                     -- NICEPAY billing key ('' once stopped)
  card TEXT,                             -- e.g. "신한 ··1234"
  status TEXT NOT NULL,                  -- 'active' | 'canceled' | 'failed'
  next INTEGER NOT NULL,                 -- ms; charged by the daily cron when this is within a day
  tries INTEGER NOT NULL DEFAULT 0,      -- failed charges in a row
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS subs_due ON subs (status, next);
CREATE TABLE IF NOT EXISTS signups (    -- a sign-up waiting for the code sent to its address; the account is made by the code
  email TEXT PRIMARY KEY,
  pass TEXT NOT NULL,                    -- already hashed
  student INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT '{}',
  code TEXT NOT NULL,                    -- sha-256
  expires INTEGER NOT NULL,
  tries INTEGER NOT NULL DEFAULT 0,
  sent INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sites (      -- 이름.kor.gallery: one site per account
  name TEXT PRIMARY KEY,                 -- the address (lower case letters, digits, -)
  user_id TEXT NOT NULL UNIQUE,
  n INTEGER,                             -- the template number of what is published
  data TEXT,                             -- the published snapshot (JSON): {n, site, s (the editor's changes), media}
  published INTEGER,                     -- ms; NULL until first published
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS media (      -- pictures and 3D files put up for a site (R2: m/<sha-256>.<ext>)
  key TEXT NOT NULL,
  user_id TEXT NOT NULL,
  size INTEGER NOT NULL,
  created INTEGER NOT NULL,
  PRIMARY KEY (key, user_id)
);
