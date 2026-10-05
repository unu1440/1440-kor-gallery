/* 1440 accounts: a Cloudflare Worker on 1440.kor.gallery/api/* (see api/wrangler.jsonc and CLAUDE.md → 계정).
   Sign-up, log-in, the hub (the form last edited, the forms in 홈), and the student month: a university address is
   checked with a code sent by e-mail (Resend), which gives the first month free once per address. Addresses the site
   does not know as a university go to the admin, who can approve them, or give or take back a free month by hand.
   Storage is D1 (api/schema.sql). Passwords: PBKDF2-SHA-256. Sessions: a random token in an HttpOnly cookie, kept
   hashed. Every change must come from this site (Origin) as JSON. */

const DAY = 86400000, MONTH = 30 * DAY, SESSION = 60 * DAY, CODE_LIFE = 10 * 60000;
const ITER = 100000; /* the most Workers allow for PBKDF2 */
const enc = new TextEncoder();
/* what can be bought: the amount is decided here, never by the page */
const PLANS = { month: { amount: 4900, days: 30, goods: "1440 이용권 30일" }, year: { amount: 46000, days: 365, goods: "1440 이용권 365일" } };

/* the monthly subscription (NICEPAY billing): charged when the pass runs out, renewed by the daily cron */
const SUB = { amount: 4900, days: 30, goods: "1440 월 구독", tries: 3 };

export const UNI = /(^|\.)(ac\.[a-z]{2}|edu(\.[a-z]{2})?)$/i; /* snu.ac.kr, mit.edu, unimelb.edu.au, ox.ac.uk */
export function uniDomain(email) { const d = String(email).split("@")[1] || ""; return UNI.test(d); }
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;
const NICK = /^[\p{L}\p{N}_.-]{2,20}$/u;

function b64(buf) { let s = ""; new Uint8Array(buf).forEach((c) => (s += String.fromCharCode(c))); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function unb64(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); const b = atob(s + "===".slice((s.length + 3) % 4)); return Uint8Array.from(b, (c) => c.charCodeAt(0)); }
function rand(n) { return crypto.getRandomValues(new Uint8Array(n)); }
async function hex(s) { return [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)))].map((c) => c.toString(16).padStart(2, "0")).join(""); }
async function sha(s) { return b64(await crypto.subtle.digest("SHA-256", enc.encode(s))); }
async function pbkdf2(pass, salt, iter) {
  const k = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, k, 256));
}
export async function hashPass(pass) { const salt = rand(16); return "pbkdf2$" + ITER + "$" + b64(salt) + "$" + (await pbkdf2(pass, salt, ITER)); }
export async function checkPass(pass, stored) {
  const [, it, salt, h] = String(stored).split("$"); if (!h) return false;
  const got = await pbkdf2(pass, unb64(salt), +it);
  let d = got.length ^ h.length; for (let i = 0; i < Math.min(got.length, h.length); i++) d |= got.charCodeAt(i) ^ h.charCodeAt(i);
  return d === 0;
}

function json(data, status = 200, headers = {}) { return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } }); }
function fail(msg, status = 400) { return json({ error: msg }, status); }
function cookie(name, val, maxAge) { return name + "=" + val + "; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge; }
function readCookie(req, name) { const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")); return m ? m[1] : ""; }

function publicUser(u) {
  let state = {}; try { state = JSON.parse(u.state || "{}"); } catch (e) {}
  return { id: u.id, nick: u.nick, email: u.email, role: u.role, student: u.student, uniEmail: u.uni_email || "", trialUntil: u.trial_until || 0, paidUntil: u.paid_until || 0, state };
}
async function userOf(env, req) {
  const t = readCookie(req, "sid"); if (!t) return null;
  const row = await env.DB.prepare("SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires > ?").bind(await sha(t), Date.now()).first();
  return row || null;
}
async function startSession(env, userId) {
  const t = b64(rand(32));
  await env.DB.prepare("INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)").bind(await sha(t), userId, Date.now() + SESSION).run();
  return cookie("sid", t, SESSION / 1000);
}
function isAdmin(env, u) { return u && (u.role === "admin" || (env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).includes(u.email)); }
async function tooMany(env, key, max, win) {
  const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM attempts WHERE key = ? AND at > ?").bind(key, Date.now() - win).first();
  return (r ? r.n : 0) >= max;
}
async function note(env, key) { await env.DB.prepare("INSERT INTO attempts (key, at) VALUES (?, ?)").bind(key, Date.now()).run(); }

/* every mail 1440 sends is one quiet page like the site: the 1440 seal (assets/logo-pay.png), a short title, one large line between thin
   rules (a code, an amount, a date), a few lines of what to know, an optional "→" link, and the small print. Tables
   and inline styles, so every mail program draws it; the plain text goes along for the ones that do not show HTML. */
function escH(v) { return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
export function mailPage(o) {
  const site = "https://1440.kor.gallery", ink = "#111111", dim = "#8a8a86", line = "#e4e4e0", font = "-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','Pretendard',Helvetica,Arial,sans-serif";
  const lines = o.lines || [];
  const text = "1440 " + o.title + (o.big ? "\n\n" + o.big : "") + "\n\n" + lines.join("\n") + (o.link ? "\n\n" + o.link.label + ": " + o.link.href : "") + "\n\n1440.kor.gallery";
  const big = o.big ? '<tr><td style="border-top:1px solid ' + line + ';border-bottom:1px solid ' + line + ';padding:26px 0;' + (o.mono ? "font-family:'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:38px;letter-spacing:12px;font-weight:500;" : "font-size:30px;letter-spacing:-0.01em;font-weight:500;") + 'line-height:1;">' + escH(o.big) + '</td></tr>' : '<tr><td style="border-top:1px solid ' + line + ';font-size:0;line-height:0;">&nbsp;</td></tr>';
  const html = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>1440 ' + escH(o.title) + '</title></head>' +
    '<body style="margin:0;padding:0;background:#f8f8f6;">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' + escH(o.pre || lines[0] || o.title) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f8f6;"><tr><td align="center" style="padding:48px 16px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:440px;font-family:' + font + ';color:' + ink + ';">' +
    '<tr><td style="padding:0 0 40px;"><a href="' + site + '" style="text-decoration:none;color:' + ink + ';"><img src="' + site + '/assets/logo-pay.png" width="44" height="44" alt="1440" style="display:inline-block;vertical-align:middle;border:0;"><span style="display:inline-block;vertical-align:middle;margin-left:10px;font-size:15px;font-weight:600;letter-spacing:-0.01em;">1440</span></a></td></tr>' +
    '<tr><td style="font-size:15px;line-height:1.5;padding:0 0 18px;">' + escH(o.title) + '</td></tr>' + big +
    '<tr><td style="font-size:14px;line-height:1.7;color:' + dim + ';padding:18px 0 0;">' + lines.map(escH).join("<br>") + '</td></tr>' +
    (o.link ? '<tr><td style="font-size:14px;line-height:1.5;padding:22px 0 0;"><a href="' + escH(o.link.href) + '" style="color:' + ink + ';text-decoration:underline;text-underline-offset:3px;">' + escH(o.link.label) + ' →</a></td></tr>' : "") +
    '<tr><td style="font-size:12px;line-height:1.7;color:' + dim + ';padding:56px 0 0;">1440컴퍼니 · <a href="' + site + '" style="color:' + dim + ';text-decoration:underline;">1440.kor.gallery</a><br>이 메일은 보내기 전용입니다. 문의 1440unu@kor.gallery</td></tr>' +
    '</table></td></tr></table></body></html>';
  return { text, html };
}
export function codeMail(code, title, why) { return mailPage({ title, big: code, mono: true, lines: ["10분 안에 입력해 주세요.", why], pre: code + " · 10분 안에 입력해 주세요" }); }

async function sendMail(env, to, subject, text, html) {
  if (!env.RESEND_API_KEY) { console.log("resend: no RESEND_API_KEY"); throw new Error("no mail key"); }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM || "1440 <no-reply@kor.gallery>", to: [to], subject, text, ...(html ? { html } : {}) })
  });
  if (!r.ok) { const why = (await r.text().catch(() => "")).slice(0, 300); console.log("resend " + r.status + " " + why); throw new Error("mail " + r.status); } /* seen with: npx wrangler tail -c api/wrangler.jsonc */
  try { await env.DB.prepare("INSERT INTO mail_log (at) VALUES (?)").bind(Date.now()).run(); } catch (e) {} /* counted for the admin's usage page (Resend: 100 a day, 3,000 a month) */
}

/* ---------- NICEPAY ---------- */
function toHex(buf) { return [...new Uint8Array(buf)].map((c) => c.toString(16).padStart(2, "0")).join(""); }
function niceApi(env) { return env.NICEPAY_API || "https://sandbox-api.nicepay.co.kr"; }
async function nice(env, path, data) {
  const r = await fetch(niceApi(env) + path, { method: "POST", headers: { "content-type": "application/json;charset=utf-8", authorization: "Basic " + btoa(env.NICEPAY_CLIENT_KEY + ":" + env.NICEPAY_SECRET_KEY) }, body: JSON.stringify(data) });
  return r.json().catch(() => ({ resultMsg: "NICEPAY " + r.status }));
}
function newOrder(tag) { return "1440-" + tag + Date.now().toString(36) + "-" + b64(rand(6)).replace(/[^a-zA-Z0-9]/g, ""); }
/* card details for the billing key: AES-256-CBC (encMode A2: the secret key, IV = its first 16 characters), or, for a
   16-character key, AES-128-ECB (each block alone = one-block CBC with a zero IV). Hex out, PKCS#7 padding. */
export async function encCard(plain, secret) {
  const data = enc.encode(plain);
  if (secret.length >= 32) {
    const key = await crypto.subtle.importKey("raw", enc.encode(secret.slice(0, 32)), "AES-CBC", false, ["encrypt"]);
    return { encData: toHex(await crypto.subtle.encrypt({ name: "AES-CBC", iv: enc.encode(secret.slice(0, 16)) }, key, data)), encMode: "A2" };
  }
  const key = await crypto.subtle.importKey("raw", enc.encode(secret.slice(0, 16)), "AES-CBC", false, ["encrypt"]);
  const n = 16 - (data.length % 16), padded = new Uint8Array(data.length + n); padded.set(data); padded.fill(n, data.length);
  let out = "";
  for (let i = 0; i < padded.length; i += 16) out += toHex((await crypto.subtle.encrypt({ name: "AES-CBC", iv: new Uint8Array(16) }, key, padded.slice(i, i + 16))).slice(0, 16));
  return { encData: out };
}
/* one month on the billing key: the order is kept first, the pass grows only on a real "paid" */
async function chargeSub(env, user, bid) {
  const orderId = newOrder("s"), ediDate = new Date().toISOString();
  await env.DB.prepare("INSERT INTO payments (order_id, user_id, plan, amount, status, created) VALUES (?, ?, 'sub', ?, 'ready', ?)").bind(orderId, user.id, SUB.amount, Date.now()).run();
  const a = await nice(env, "/v1/subscribe/" + encodeURIComponent(bid) + "/payments", { orderId, amount: SUB.amount, goodsName: SUB.goods, cardQuota: "0", useShopInterest: false, buyerEmail: user.email, ediDate, signData: await hex(orderId + bid + ediDate + env.NICEPAY_SECRET_KEY) });
  if (a.resultCode !== "0000" || a.status !== "paid" || +a.amount !== SUB.amount) {
    await env.DB.prepare("UPDATE payments SET status = 'failed', tid = ?, message = ? WHERE order_id = ?").bind(a.tid || null, String(a.resultMsg || "").slice(0, 200), orderId).run();
    return { ok: false, msg: a.resultMsg || "카드 결제가 되지 않았어요." };
  }
  const u = await env.DB.prepare("SELECT paid_until FROM users WHERE id = ?").bind(user.id).first(), until = Math.max((u && u.paid_until) || 0, Date.now()) + SUB.days * DAY;
  await env.DB.prepare("UPDATE payments SET status = 'paid', tid = ?, paid_at = ? WHERE order_id = ?").bind(a.tid || null, Date.now(), orderId).run();
  await env.DB.prepare("UPDATE users SET paid_until = ? WHERE id = ?").bind(until, user.id).run();
  return { ok: true, until };
}
/* a payment taken back (all or part): the days it bought come off the pass (never below now), and a subscription
   charge also stops the subscription so it is not charged again */
const DAYS_OF = { month: PLANS.month.days, year: PLANS.year.days, sub: SUB.days };
async function undoPayment(env, o, cancelled) {
  const full = cancelled >= o.amount, days = Math.round((DAYS_OF[o.plan] || 0) * Math.min(1, cancelled / o.amount));
  await env.DB.prepare("UPDATE payments SET status = ?, message = ? WHERE order_id = ?").bind(full ? "cancelled" : "partial", "취소 " + cancelled + "원", o.order_id).run();
  const u = await env.DB.prepare("SELECT paid_until FROM users WHERE id = ?").bind(o.user_id).first(), now = Date.now();
  if (u && u.paid_until) { const left = u.paid_until - days * DAY; await env.DB.prepare("UPDATE users SET paid_until = ? WHERE id = ?").bind(left > now ? left : null, o.user_id).run(); }
  if (o.plan === "sub") {
    const s = await env.DB.prepare("SELECT * FROM subs WHERE user_id = ? AND status = 'active'").bind(o.user_id).first();
    if (s) { await env.DB.prepare("UPDATE subs SET status = 'canceled', bid = '' WHERE user_id = ?").bind(o.user_id).run(); await expireBid(env, s.bid); }
  }
}
/* ---------- refunds the person asks for (the rules of 1440):
   1. on the day of buying (KST): the whole amount back, and the days it bought go
   2. a 30-day or 1-year pass after that day: the unused days back (a day already begun counts as used)
   3. the subscription after that day: like a pass, the unused days back, and the subscription stops
   Only the latest payment can be taken back: its days are the last part of the pass. ---------- */
function kstDay(ms) { return new Date(ms + 9 * 3600000).toISOString().slice(0, 10); }
async function refundQuote(env, u, now = Date.now()) {
  const o = await env.DB.prepare("SELECT * FROM payments WHERE user_id = ? AND status = 'paid' ORDER BY paid_at DESC LIMIT 1").bind(u.id).first();
  if (!o) return null;
  const days = DAYS_OF[o.plan] || 0, me = await env.DB.prepare("SELECT paid_until FROM users WHERE id = ?").bind(u.id).first();
  const left = Math.max(0, Math.floor((((me && me.paid_until) || 0) - now) / DAY)); /* whole unused days on the pass */
  const q = { orderId: o.order_id, plan: o.plan, amount: o.amount, paidAt: o.paid_at, days };
  if (kstDay(o.paid_at) === kstDay(now)) return { ...q, rule: "today", refund: o.amount, daysBack: days };
  const unused = Math.min(days, left);
  return { ...q, rule: "prorate", refund: Math.floor(o.amount * unused / days), daysBack: unused };
}
async function expireBid(env, bid) {
  const orderId = newOrder("x"), ediDate = new Date().toISOString();
  try { await nice(env, "/v1/subscribe/" + encodeURIComponent(bid) + "/expire", { orderId, ediDate, signData: await hex(orderId + bid + ediDate + env.NICEPAY_SECRET_KEY) }); } catch (e) {}
}
async function fullUser(env, u) {
  const s = await env.DB.prepare("SELECT status, card, next FROM subs WHERE user_id = ?").bind(u.id).first();
  return { ...publicUser(u), admin: isAdmin(env, u), sub: s ? { status: s.status, card: s.card || "", next: s.status === "active" ? s.next : 0, amount: SUB.amount } : null };
}
function ymd(ms) { const d = new Date(ms + 9 * 3600000); return String(d.getUTCFullYear()).slice(2) + "." + String(d.getUTCMonth() + 1).padStart(2, "0") + "." + String(d.getUTCDate()).padStart(2, "0"); }
/* the daily cron: every active subscription whose pass ends within a day is charged; a card that fails is tried again
   on the next runs, and after SUB.tries failures the subscription stops (the billing key is deleted) */
export async function renewSubs(env, now = Date.now()) {
  const due = await env.DB.prepare("SELECT s.*, u.email FROM subs s JOIN users u ON u.id = s.user_id WHERE s.status = 'active' AND s.next <= ?").bind(now + DAY).all();
  let paid = 0, failed = 0;
  for (const s of due.results || []) {
    const r = await chargeSub(env, { id: s.user_id, email: s.email }, s.bid);
    if (r.ok) {
      paid++; await env.DB.prepare("UPDATE subs SET next = ?, tries = 0 WHERE user_id = ?").bind(r.until, s.user_id).run();
      const m = mailPage({ title: "월 구독이 결제됐어요", big: "4,900₩", lines: [(s.card || "카드") + " · 이용 기간 ~" + ymd(r.until), "해지는 계정 → 구독에서 언제든 할 수 있어요."], link: { href: "https://1440.kor.gallery/", label: "1440 열기" } });
      try { await sendMail(env, s.email, "1440 구독 결제 4,900₩", m.text, m.html); } catch (e) {}
    } else {
      failed++; const tries = (s.tries || 0) + 1;
      if (tries >= SUB.tries) {
        await env.DB.prepare("UPDATE subs SET status = 'failed', bid = '', tries = ? WHERE user_id = ?").bind(tries, s.user_id).run(); await expireBid(env, s.bid);
        const m = mailPage({ title: "구독이 멈췄어요", lines: ["등록한 카드로 결제가 되지 않아 월 구독을 멈췄어요.", "사유: " + r.msg, "계정 → 구독에서 카드를 다시 등록하면 이어서 쓸 수 있어요."], link: { href: "https://1440.kor.gallery/", label: "카드 다시 등록하기" } });
        try { await sendMail(env, s.email, "1440 구독이 멈췄어요", m.text, m.html); } catch (e) {}
      } else await env.DB.prepare("UPDATE subs SET tries = ?, next = ? WHERE user_id = ?").bind(tries, now + DAY / 2, s.user_id).run();
    }
  }
  return { paid, failed };
}

/* the sign-up code: one a minute, six a day per address, twenty a day per network; ten minutes to use it */
async function sendSignupCode(env, email, p, ip) {
  const old = await env.DB.prepare("SELECT sent FROM signups WHERE email = ?").bind(email).first();
  if (old && Date.now() - old.sent < 60000) return fail("1분 뒤에 다시 보낼 수 있어요.", 429);
  if (await tooMany(env, "signup:" + email, 6, DAY) || (ip && await tooMany(env, "sip:" + ip, 20, DAY))) return fail("오늘은 더 보낼 수 없어요.", 429);
  const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
  await env.DB.prepare("INSERT OR REPLACE INTO signups (email, pass, student, state, code, expires, tries, sent) VALUES (?, ?, ?, ?, ?, ?, 0, ?)")
    .bind(email, p.pass, p.student ? 1 : 0, p.state || "{}", await sha(code), Date.now() + CODE_LIFE, Date.now()).run();
  await note(env, "signup:" + email); if (ip) await note(env, "sip:" + ip);
  const cm = codeMail(code, "가입 확인 코드", "가입하지 않았다면 이 메일은 지워도 됩니다.");
  try { await sendMail(env, email, "1440 가입 확인 코드 " + code, cm.text, cm.html); }
  catch (e) { return fail("메일을 보내지 못했어요. 잠시 후 다시 해 주세요.", 502); }
  return json({ pending: true, email });
}

/* a page of this site to come back to after paying: the first page or the editor, nothing else (no other host) */
export function safeBack(b) { b = String(b || ""); return /^\/(templates\.html)?(\?[A-Za-z0-9=&%._~-]*)?$/.test(b) ? b : "/"; }

/* a university address gives its free month once: also after the account that used it is deleted (kept as a hash for a year) */
async function uniTaken(env, uni, exceptId = "") {
  if (await env.DB.prepare("SELECT 1 FROM users WHERE uni_email = ? AND id != ?").bind(uni, exceptId).first()) return true;
  return !!(await env.DB.prepare("SELECT 1 FROM uni_used WHERE hash = ? AND at > ?").bind(await sha("uni:" + uni), Date.now() - 365 * DAY).first());
}

/* ---------- the admin's usage page: every free limit 1440 lives under, with how much is used ----------
   Our own counts (mail sent, pictures kept, database size, accounts) are always there. The Cloudflare numbers
   (Workers requests, D1 rows, R2 operations and storage) come from the GraphQL Analytics API and need a token with
   "Account Analytics: Read", put in by the owner:  npx wrangler secret put CF_API_TOKEN -c api/wrangler.jsonc */
const FREE = {
  workers: 100000,          /* requests a day, the whole account (static files are free and not counted) */
  d1Read: 5000000,          /* rows read a day */
  d1Write: 100000,          /* rows written a day */
  d1Size: 5 * 1073741824,   /* bytes */
  r2Size: 10 * 1073741824,  /* bytes */
  r2A: 1000000,             /* class A operations a month */
  r2B: 10000000,            /* class B operations a month */
  mailDay: 100, mailMonth: 3000 /* Resend free plan */
};
const R2_B = new Set(["HeadBucket", "HeadObject", "GetObject", "UsageSummary", "GetBucketEncryption", "GetBucketLocation", "GetBucketCors", "GetBucketLifecycleConfiguration"]);
const R2_FREE = new Set(["DeleteObject", "DeleteBucket", "AbortMultipartUpload"]);
function utcDay(ms) { return new Date(ms).toISOString().slice(0, 10); }
async function cfq(env, query, vars) {
  if (!env.CF_API_TOKEN) return { error: "token" };
  try {
    const r = await fetch("https://api.cloudflare.com/client/v4/graphql", { method: "POST", headers: { authorization: "Bearer " + env.CF_API_TOKEN, "content-type": "application/json" }, body: JSON.stringify({ query, variables: { acc: env.CF_ACCOUNT_ID, ...vars } }) });
    const j = await r.json().catch(() => ({}));
    if (j.errors && j.errors.length) return { error: String(j.errors[0].message || "error").slice(0, 160) };
    const a = j.data && j.data.viewer && j.data.viewer.accounts && j.data.viewer.accounts[0];
    return a ? { data: a } : { error: "no data (" + r.status + ")" };
  } catch (e) { return { error: "network" }; }
}
export async function usage(env, now = Date.now()) {
  const days = []; for (let i = 13; i >= 0; i--) days.push(utcDay(now - i * DAY));
  const today = days[13], from = days[0], month0 = today.slice(0, 8) + "01";
  const series = (rows, pick) => { const m = {}; (rows || []).forEach((g) => { const d = g.dimensions.date; m[d] = (m[d] || 0) + pick(g); }); return days.map((d) => ({ d, v: m[d] || 0 })); };
  const out = { at: now, token: !!env.CF_API_TOKEN, free: FREE, series: {}, now: {}, errors: {} };

  /* ours: mail, pictures, the database, accounts */
  const mails = await env.DB.prepare("SELECT at FROM mail_log WHERE at >= ?").bind(Date.parse(from + "T00:00:00Z")).all();
  const mm = {}; (mails.results || []).forEach((r) => { const d = utcDay(r.at); mm[d] = (mm[d] || 0) + 1; });
  out.series.mail = days.map((d) => ({ d, v: mm[d] || 0 }));
  out.now.mailDay = mm[today] || 0;
  const mon = await env.DB.prepare("SELECT COUNT(*) AS n FROM mail_log WHERE at >= ?").bind(Date.parse(month0 + "T00:00:00Z")).first();
  out.now.mailMonth = (mon && mon.n) || 0;
  const media = await env.DB.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(size), 0) AS b FROM (SELECT key, MAX(size) AS size FROM media GROUP BY key)").first();
  out.now.mediaFiles = (media && media.n) || 0; out.now.mediaBytes = (media && media.b) || 0;
  const sizeQ = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").all();
  out.now.users = (sizeQ.results && sizeQ.results[0] && sizeQ.results[0].n) || 0;
  out.now.d1Size = (sizeQ.meta && (sizeQ.meta.size_after || sizeQ.meta.sizeAfter)) || 0;
  const st = await env.DB.prepare("SELECT COUNT(*) AS n, SUM(published IS NOT NULL) AS p FROM sites").first();
  out.now.sites = (st && st.n) || 0; out.now.published = (st && st.p) || 0;

  /* Cloudflare: Workers requests and D1 rows by day, R2 operations this month and storage */
  const w = await cfq(env, "query($acc:string!,$from:Date,$to:Date){viewer{accounts(filter:{accountTag:$acc}){workersInvocationsAdaptive(limit:2000,filter:{date_geq:$from,date_leq:$to}){sum{requests}dimensions{date}}}}}", { from, to: today });
  if (w.data) { out.series.workers = series(w.data.workersInvocationsAdaptive, (g) => g.sum.requests); out.now.workers = out.series.workers[13].v; } else out.errors.workers = w.error;
  const d = await cfq(env, "query($acc:string!,$from:Date,$to:Date,$db:string){viewer{accounts(filter:{accountTag:$acc}){d1AnalyticsAdaptiveGroups(limit:2000,filter:{date_geq:$from,date_leq:$to,databaseId:$db}){sum{rowsRead rowsWritten}dimensions{date}}}}}", { from, to: today, db: env.D1_ID });
  if (d.data) {
    out.series.d1Read = series(d.data.d1AnalyticsAdaptiveGroups, (g) => g.sum.rowsRead); out.series.d1Write = series(d.data.d1AnalyticsAdaptiveGroups, (g) => g.sum.rowsWritten);
    out.now.d1Read = out.series.d1Read[13].v; out.now.d1Write = out.series.d1Write[13].v;
  } else out.errors.d1 = d.error;
  const ro = await cfq(env, "query($acc:string!,$from:Time,$to:Time){viewer{accounts(filter:{accountTag:$acc}){r2OperationsAdaptiveGroups(limit:2000,filter:{datetime_geq:$from,datetime_leq:$to}){sum{requests}dimensions{actionType}}}}}", { from: month0 + "T00:00:00Z", to: new Date(now).toISOString() });
  if (ro.data) {
    let a = 0, b = 0; (ro.data.r2OperationsAdaptiveGroups || []).forEach((g) => { const t = g.dimensions.actionType, n = g.sum.requests; if (R2_FREE.has(t)) return; if (R2_B.has(t)) b += n; else a += n; });
    out.now.r2A = a; out.now.r2B = b;
  } else out.errors.r2ops = ro.error;
  const rs = await cfq(env, "query($acc:string!,$from:Time,$to:Time){viewer{accounts(filter:{accountTag:$acc}){r2StorageAdaptiveGroups(limit:200,filter:{datetime_geq:$from,datetime_leq:$to}){max{payloadSize metadataSize objectCount}dimensions{bucketName}}}}}", { from: new Date(now - 2 * DAY).toISOString(), to: new Date(now).toISOString() });
  if (rs.data) { let s = 0, n = 0; (rs.data.r2StorageAdaptiveGroups || []).forEach((g) => { s += (g.max.payloadSize || 0) + (g.max.metadataSize || 0); n += g.max.objectCount || 0; }); out.now.r2Size = s; out.now.r2Objects = n; }
  else out.errors.r2size = rs.error;
  return out;
}

async function body(req) { try { return await req.json(); } catch (e) { return {}; } }

/* ---------- sites: 이름.kor.gallery ----------
   One site per account. The editor claims the address, puts the person's pictures up (R2, named by their content),
   then sends the published snapshot: the template number and the editor's changes, with every picture as /m/<hash>.
   The same Worker answers *.kor.gallery: it draws the site with the editor's own drawing code (templates.html, in
   "site view": no tools, the page as visitors use it). A site stays up while its owner has a pass, and for GRACE
   after it ends; then the daily cron takes it down and deletes its pictures. */
const GRACE = 7 * DAY;
const SITE_NAME = /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/;
const RESERVED = new Set(["1440", "www", "api", "admin", "mail", "email", "send", "rsend", "img", "static", "assets", "cdn", "app", "help", "support", "blog", "shop", "status", "docs", "dev", "test", "preview", "kor", "gallery", "root", "ftp", "smtp", "imap", "pop", "ns1", "ns2", "1440joljeon", "loremipsum"]);
export function siteNameError(v) {
  if (v.length < 2) return "두 글자 이상 적어 주세요.";
  if (!SITE_NAME.test(v) || v.indexOf("--") >= 0) return "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요.";
  if (RESERVED.has(v)) return "쓸 수 없는 주소예요.";
  return "";
}
const MEDIA_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "model/gltf-binary": "glb", "video/mp4": "mp4", "video/webm": "webm" };
const MEDIA_MAX = { glb: 40 * 1048576, mp4: 40 * 1048576, webm: 40 * 1048576 }, MEDIA_MAX_IMG = 10 * 1048576, MEDIA_TOTAL = 500 * 1048576;
const FILLING = new Set(); /* videos being copied into the edge cache right now (per instance), so a burst of piece requests starts one copy */
const MEDIA_URL = /^\/m\/[a-f0-9]{64}\.(jpg|png|webp|gif|glb|mp4|webm)$/;
/* what a pass gives: paid days, the free student month, or an active subscription */
async function passNow(env, userId, now = Date.now()) {
  const u = await env.DB.prepare("SELECT paid_until, trial_until FROM users WHERE id = ?").bind(userId).first();
  const s = await env.DB.prepare("SELECT status FROM subs WHERE user_id = ?").bind(userId).first();
  return { until: u ? Math.max(u.paid_until || 0, u.trial_until || 0) : 0, sub: !!(s && s.status === "active") };
}
async function canPublish(env, userId, now = Date.now()) { const p = await passNow(env, userId, now); return p.sub || p.until > now; }
async function siteUp(env, userId, now = Date.now()) { const p = await passNow(env, userId, now); return p.sub || p.until + GRACE > now; }
/* fid: which of the editor's folder entries was published (its form number, name and copy), so the folder can mark it 공개 중 */
function siteOf(row) {
  if (!row) return null;
  let fid = ""; try { fid = String(JSON.parse(row.data || "{}").fid || ""); } catch (e) {}
  return { name: row.name, n: row.n || 0, fid, published: row.published || 0, url: "https://" + row.name + ".kor.gallery" };
}

/* the daily cron: a site whose pass ended more than GRACE ago is taken down, with its pictures */
export async function sweepSites(env, now = Date.now()) {
  /* records the privacy policy keeps only for a while: failed log-ins and code requests 30 days, unfinished sign-ups 1 day, old sessions and codes */
  await env.DB.prepare("DELETE FROM attempts WHERE at < ?").bind(now - 30 * DAY).run();
  await env.DB.prepare("DELETE FROM signups WHERE sent < ?").bind(now - DAY).run();
  await env.DB.prepare("DELETE FROM sessions WHERE expires < ?").bind(now).run();
  await env.DB.prepare("DELETE FROM codes WHERE expires < ?").bind(now - DAY).run();
  await env.DB.prepare("DELETE FROM uni_used WHERE at < ?").bind(now - 365 * DAY).run();
  await env.DB.prepare("DELETE FROM mail_log WHERE at < ?").bind(now - 62 * DAY).run();
  await env.DB.prepare("DELETE FROM admin_log WHERE at < ?").bind(now - 730 * DAY).run();
  await env.DB.prepare("DELETE FROM hits WHERE day < ?").bind(kstDay(now - 400 * DAY)).run();
  const rows = await env.DB.prepare("SELECT s.name, s.user_id, s.data, u.email FROM sites s JOIN users u ON u.id = s.user_id").all();
  let gone = 0, warned = 0;
  for (const r of rows.results || []) {
    if (!(await siteUp(env, r.user_id, now))) { await removeSite(env, r.user_id); gone++; continue; }
    if (r.data && await warnPass(env, r, now)) warned++;
  }
  return { gone, warned };
}
/* a published site whose pass is ending: a mail 3 days before, and one on the day it ends (the site goes 7 days later).
   Each is sent once for that end date (table notices). A subscription renews itself, so it gets none. */
async function warnPass(env, r, now) {
  const p = await passNow(env, r.user_id, now); if (p.sub || !p.until) return false;
  const kind = p.until > now ? (p.until - now <= 3 * DAY ? "soon" : "") : "ended"; if (!kind) return false;
  if (await env.DB.prepare("SELECT 1 FROM notices WHERE user_id = ? AND kind = ? AND until = ?").bind(r.user_id, kind, p.until).first()) return false;
  await env.DB.prepare("INSERT INTO notices (user_id, kind, until, sent) VALUES (?, ?, ?, ?)").bind(r.user_id, kind, p.until, now).run();
  const site = r.name + ".kor.gallery", del = ymd(p.until + GRACE);
  const m = kind === "soon"
    ? mailPage({ title: "이용권이 곧 끝나요", big: ymd(p.until) + " 끝", lines: ["이용권이 끝나도 " + site + "는 7일 동안 그대로 보이고,", del + "에 사이트와 올린 사진이 지워져요.", "이어서 쓰려면 계정에서 이용권을 결제해 주세요."], link: { href: "https://1440.kor.gallery/", label: "이용권 결제하기" } })
    : mailPage({ title: "이용권이 끝났어요", big: del + " 삭제", lines: [site + "는 " + del + "까지 보이고, 그 뒤 사이트와 올린 사진이 지워지며 되살릴 수 없어요.", "그 전에 계정에서 이용권을 결제하면 그대로 이어져요."], link: { href: "https://1440.kor.gallery/", label: "이용권 결제하기" } });
  try { await sendMail(env, r.email, kind === "soon" ? "1440 이용권이 곧 끝나요" : "1440 이용권이 끝났어요 · " + del + " 사이트 삭제", m.text, m.html); } catch (e) {}
  return true;
}
async function removeSite(env, userId) {
  const ms = await env.DB.prepare("SELECT key FROM media WHERE user_id = ?").bind(userId).all();
  for (const m of ms.results || []) {
    const other = await env.DB.prepare("SELECT 1 FROM media WHERE key = ? AND user_id != ?").bind(m.key, userId).first();
    if (!other && env.MEDIA) { try { await env.MEDIA.delete("m/" + m.key); } catch (e) {} }
  }
  await env.DB.prepare("DELETE FROM media WHERE user_id = ?").bind(userId).run();
  await env.DB.prepare("DELETE FROM sites WHERE user_id = ?").bind(userId).run();
}

const siteRoutes = {
  "GET /api/site": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    return json({ site: siteOf(await env.DB.prepare("SELECT * FROM sites WHERE user_id = ?").bind(u.id).first()) });
  },
  /* the address: taken for this account (one site each; a second name moves the site there) */
  "POST /api/site/name": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    const d = await body(req), name = String(d.name || "").trim().toLowerCase(), why = siteNameError(name);
    if (why) return fail(why);
    const other = await env.DB.prepare("SELECT user_id FROM sites WHERE name = ?").bind(name).first();
    if (other && other.user_id !== u.id) return fail("이미 누가 쓰는 주소예요.", 409);
    const mine = await env.DB.prepare("SELECT * FROM sites WHERE user_id = ?").bind(u.id).first();
    if (mine) { if (mine.name !== name) await env.DB.prepare("UPDATE sites SET name = ? WHERE user_id = ?").bind(name, u.id).run(); }
    else await env.DB.prepare("INSERT INTO sites (name, user_id, created) VALUES (?, ?, ?)").bind(name, u.id, Date.now()).run();
    return json({ site: siteOf(await env.DB.prepare("SELECT * FROM sites WHERE user_id = ?").bind(u.id).first()) });
  },
  /* a picture (or a .glb) for the site: the body is the file itself; it is named by its content, so the same picture is kept once */
  "PUT /api/media": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    if (!env.MEDIA) return fail("사진을 둘 곳이 아직 없어요.", 503);
    const type = String(req.headers.get("content-type") || "").split(";")[0].trim().toLowerCase(), ext = MEDIA_TYPES[type];
    if (!ext) return fail("사진(jpg·png·webp·gif), .glb, 영상(mp4·webm)만 올릴 수 있어요.", 415);
    const buf = await req.arrayBuffer(), max = MEDIA_MAX[ext] || MEDIA_MAX_IMG;
    if (!buf.byteLength) return fail("빈 파일이에요.");
    if (buf.byteLength > max) return fail("파일이 너무 커요 (" + Math.round(max / 1048576) + "MB까지).", 413);
    const used = await env.DB.prepare("SELECT COALESCE(SUM(size), 0) AS n FROM media WHERE user_id = ?").bind(u.id).first();
    if (((used && used.n) || 0) + buf.byteLength > MEDIA_TOTAL) return fail("올린 파일이 너무 많아요 (500MB까지).", 413);
    const key = toHex(await crypto.subtle.digest("SHA-256", buf)) + "." + ext;
    if (!(await env.MEDIA.head("m/" + key))) await env.MEDIA.put("m/" + key, buf, { httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" } });
    await env.DB.prepare("INSERT OR IGNORE INTO media (key, user_id, size, created) VALUES (?, ?, ?, ?)").bind(key, u.id, buf.byteLength, Date.now()).run();
    return json({ url: "/m/" + key });
  },
  /* publishing: what the editor shows becomes the site */
  "POST /api/site/publish": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    const site = await env.DB.prepare("SELECT * FROM sites WHERE user_id = ?").bind(u.id).first();
    if (!site) return fail("먼저 주소를 정해 주세요.", 409);
    if (!(await canPublish(env, u.id))) return fail("이용권이 있어야 공개할 수 있어요.", 402);
    const d = await body(req), n = Math.round(+d.n || 0);
    if (!(n >= 1 && n <= 1440)) return fail("폼 번호가 맞지 않아요.");
    if (!d.s || typeof d.s !== "object" || Array.isArray(d.s)) return fail("공개할 내용이 없어요.");
    const media = d.media && typeof d.media === "object" ? d.media : {}, keys = [];
    for (const k of Object.keys(media)) {
      if (!/^[\w:.-]{1,80}$/.test(k) || !MEDIA_URL.test(String(media[k]))) return fail("사진 주소가 맞지 않아요.");
      keys.push(String(media[k]).slice(3));
    }
    for (const key of new Set(keys)) if (!(await env.DB.prepare("SELECT 1 FROM media WHERE key = ? AND user_id = ?").bind(key, u.id).first())) return fail("올리지 않은 사진이 있어요.");
    const data = JSON.stringify({ n, site: String(d.site || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30), fid: String(d.fid || "").slice(0, 120), s: d.s, media });
    if (data.length > 400000) return fail("내용이 너무 커요.", 413);
    const now = Date.now();
    await env.DB.prepare("UPDATE sites SET n = ?, data = ?, published = ? WHERE user_id = ?").bind(n, data, now, u.id).run();
    return json({ site: siteOf({ ...site, n, published: now, data }) });
  }
};

/* ---------- *.kor.gallery: the published sites ---------- */
function attr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function page(status, title, text) {
  return new Response('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>' + attr(title) + '</title><style>html,body{height:100%;margin:0}body{display:grid;place-items:center;background:#f8f8f6;color:rgba(0,0,0,.55);font:clamp(14px,1.1vw,17px)/1.6 system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;padding:0 16px;text-align:center}a{color:inherit}</style></head><body><p>' + attr(text) + '</p></body></html>', { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
/* the published snapshot into templates.html: the title, description, icon and link preview are set here, and the page script reads window.SITE_VIEW */
export function siteShell(html, name, snap) {
  const s = snap.s || {}, url = "https://" + name + ".kor.gallery/", title = String(s.title || "").trim() || name, desc = String(s.desc || "").trim();
  const sv = JSON.stringify({ name, n: snap.n, site: snap.site || "", s, media: snap.media || {} }).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  let h = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + attr(title) + "</title>")
    .replace(/<meta name="description"[^>]*>/, desc ? '<meta name="description" content="' + attr(desc) + '">' : "");
  if (typeof s.fav === "string" && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(s.fav)) h = h.replace(/<link rel="icon"[^>]*>/, '<link rel="icon" href="' + attr(s.fav) + '">');
  const head = '<link rel="canonical" href="' + url + '"><meta property="og:type" content="website"><meta property="og:url" content="' + url + '"><meta property="og:title" content="' + attr(title) + '">' +
    (desc ? '<meta property="og:description" content="' + attr(desc) + '">' : "") + "<script>window.SITE_VIEW=" + sv + "</script>";
  return h.replace("</head>", head + "</head>");
}
async function serveSite(req, env, url, ctx) {
  const m = /^([a-z0-9-]+)\.kor\.gallery$/.exec(url.hostname.toLowerCase()), name = m ? m[1] : "", p = url.pathname;
  if (!m || name === "www") return Response.redirect(env.SITE_ORIGIN || "https://1440.kor.gallery", 301);
  if (req.method !== "GET" && req.method !== "HEAD") return page(405, "1440", "읽기만 할 수 있어요.");
  if (p.startsWith("/m/")) {
    const key = p.slice(3); if (!/^[a-f0-9]{64}\.(jpg|png|webp|gif|glb|mp4|webm)$/.test(key) || !env.MEDIA) return new Response("", { status: 404 });
    /* the edge keeps a copy for a day (the cache of the data centre that served it), so a picture or video seen again is not read from R2 again.
       The copy is short-lived on purpose: a file taken down (site or account deleted) stops being served within a day. */
    const cache = typeof caches !== "undefined" && caches.default ? caches.default : null, ck = new Request("https://1440.kor.gallery/m/" + key), rg = req.headers.get("range");
    if (cache) {
      const hit = await cache.match(rg ? new Request(ck, { headers: { range: rg } }) : ck);
      if (hit) { const h2 = new Headers(hit.headers); h2.set("cache-control", "public, max-age=31536000, immutable"); return new Response(hit.body, { status: hit.status, headers: h2 }); }
    }
    const o = await env.MEDIA.get("m/" + key, rg ? { range: req.headers } : undefined); if (!o) return new Response("", { status: 404 });
    const h = new Headers(); o.writeHttpMetadata(h); h.set("etag", o.httpEtag); h.set("cache-control", "public, max-age=31536000, immutable"); h.set("accept-ranges", "bytes");
    const keep = function (body) { const sh = new Headers(h); sh.set("cache-control", "public, max-age=86400"); return cache.put(ck, new Response(body, { headers: sh })).catch(function () {}); };
    if (cache && ctx && rg && o.range && !FILLING.has(key)) { /* a video asks in pieces: keep the whole file once so the next pieces come from the edge */
      FILLING.add(key); ctx.waitUntil(env.MEDIA.get("m/" + key).then(function (f) { return f ? keep(f.body) : null; }).catch(function () {}).finally(function () { FILLING.delete(key); }));
    }
    if (rg && o.range) { /* a video asks for a piece at a time so it can start fast and be skipped through */
      const r = o.range, off = r.offset != null ? r.offset : o.size - r.suffix, len = r.length != null ? r.length : o.size - off;
      h.set("content-range", "bytes " + off + "-" + (off + len - 1) + "/" + o.size); h.set("content-length", String(len));
      return new Response(o.body, { status: 206, headers: h });
    }
    if (cache && ctx && !rg) { const two = o.body.tee(); ctx.waitUntil(keep(two[1])); return new Response(two[0], { headers: h }); }
    return new Response(o.body, { headers: h });
  }
  if (p.startsWith("/assets/")) { /* the same cache rules as 1440.kor.gallery's own _headers: versioned scripts a year, pictures a month */
    const r = await env.STATIC.fetch(new Request((env.SITE_ORIGIN || "https://1440.kor.gallery") + p + url.search, { headers: req.headers }));
    if (r.status !== 200) return r;
    const h = new Headers(r.headers);
    h.set("cache-control", (/\.(js|css)$/.test(p) && url.searchParams.has("v")) || p.startsWith("/assets/fonts/") ? "public, max-age=31536000, immutable" : /^\/assets\/(img|3d)\//.test(p) ? "public, max-age=2592000, stale-while-revalidate=604800" : "public, max-age=86400");
    return new Response(r.body, { status: 200, headers: h });
  }
  if (p.startsWith("/api/")) return fail("not found", 404);
  if (p === "/robots.txt") return new Response("User-agent: *\nAllow: /\n", { headers: { "content-type": "text/plain" } });
  const row = await env.DB.prepare("SELECT * FROM sites WHERE name = ?").bind(name).first();
  if (!row || !row.data || !(await siteUp(env, row.user_id))) return page(404, name + ".kor.gallery", "이 주소에는 아직 사이트가 없어요.");
  let snap; try { snap = JSON.parse(row.data); } catch (e) { return page(500, name, "사이트를 그리지 못했어요."); }
  const shell = await env.STATIC.fetch(new Request((env.SITE_ORIGIN || "https://1440.kor.gallery") + "/templates", { headers: { accept: "text/html" } }));
  if (!shell.ok) return page(502, name, "잠시 문제가 생겼어요.");
  return new Response(siteShell(await shell.text(), name, snap), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
}


const routes = {
  "GET /api/health": async () => json({ ok: true }),

  /* ---------- paying: a pass of 30 or 365 days, through NICEPAY's payment window: card and easy pay in one window (server approval) ----------
     1. the page asks for an order: the server fixes the amount and keeps the order
     2. the page opens NICEPAY's window (AUTHNICE.requestPay) with that order
     3. NICEPAY posts the card authentication to /api/pay/return; the server checks the signature and the amount,
        approves the payment with NICEPAY, extends the pass, and sends the person back to the first page. */
  "GET /api/pay/plans": async () => json({ plans: PLANS }),

  "POST /api/pay/order": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    if (!env.NICEPAY_CLIENT_KEY || !env.NICEPAY_SECRET_KEY) return fail("결제는 준비 중이에요.", 503);
    const d = await body(req), plan = PLANS[d.plan]; if (!plan) return fail("요금제를 골라 주세요.");
    const orderId = "1440-" + Date.now().toString(36) + "-" + b64(rand(6)).replace(/[^a-zA-Z0-9]/g, "");
    await env.DB.prepare("INSERT INTO payments (order_id, user_id, plan, amount, status, created) VALUES (?, ?, ?, ?, 'ready', ?)").bind(orderId, u.id, d.plan, plan.amount, Date.now()).run();
    return json({ orderId, back: safeBack(d.back), method: "cardAndEasyPay", amount: plan.amount, goodsName: plan.goods, clientId: env.NICEPAY_CLIENT_KEY, returnUrl: new URL(req.url).origin + "/api/pay/return", buyerEmail: u.email, buyerName: u.nick });
  },

  "POST /api/pay/return": async (env, req) => {
    let f = null; try { f = await req.formData(); } catch (e) {}
    /* where the person came from (the first page, or the editor they were publishing from), carried by NICEPAY in mallReserved */
    const to = safeBack(f && f.get("mallReserved")), back = (q) => new Response(null, { status: 303, headers: { location: to + (to.indexOf("?") >= 0 ? "&" : "?") + "pay=" + q, "cache-control": "no-store" } });
    if (!f) return back("fail&m=" + encodeURIComponent("결제 정보를 읽지 못했어요."));
    const g = (k) => String(f.get(k) || ""), orderId = g("orderId"), tid = g("tid"), amount = g("amount");
    const o = await env.DB.prepare("SELECT * FROM payments WHERE order_id = ?").bind(orderId).first();
    if (!o || o.status !== "ready") return back("fail&m=" + encodeURIComponent("주문을 찾을 수 없어요."));
    if (g("authResultCode") !== "0000") { await env.DB.prepare("UPDATE payments SET status = 'failed', message = ? WHERE order_id = ?").bind(g("authResultMsg").slice(0, 200), orderId).run(); return back("fail&m=" + encodeURIComponent(g("authResultMsg") || "결제를 하지 않았어요.")); }
    if (+amount !== o.amount || g("clientId") !== env.NICEPAY_CLIENT_KEY) return back("fail&m=" + encodeURIComponent("결제 금액이 맞지 않아요."));
    if ((await hex(g("authToken") + g("clientId") + amount + env.NICEPAY_SECRET_KEY)) !== g("signature")) return back("fail&m=" + encodeURIComponent("결제 확인에 실패했어요."));
    const ediDate = new Date().toISOString(), r = await fetch((env.NICEPAY_API || "https://sandbox-api.nicepay.co.kr") + "/v1/payments/" + encodeURIComponent(tid), {
      method: "POST", headers: { "content-type": "application/json;charset=utf-8", authorization: "Basic " + btoa(env.NICEPAY_CLIENT_KEY + ":" + env.NICEPAY_SECRET_KEY) },
      body: JSON.stringify({ amount: o.amount, ediDate, signData: await hex(tid + o.amount + ediDate + env.NICEPAY_SECRET_KEY) })
    });
    const a = await r.json().catch(() => ({}));
    if (a.resultCode !== "0000" || a.status !== "paid" || +a.amount !== o.amount) {
      await env.DB.prepare("UPDATE payments SET status = 'failed', tid = ?, message = ? WHERE order_id = ?").bind(tid, String(a.resultMsg || r.status).slice(0, 200), orderId).run();
      return back("fail&m=" + encodeURIComponent(a.resultMsg || "결제 승인에 실패했어요."));
    }
    const u = await env.DB.prepare("SELECT paid_until FROM users WHERE id = ?").bind(o.user_id).first(), until = Math.max((u && u.paid_until) || 0, Date.now()) + PLANS[o.plan].days * DAY;
    await env.DB.prepare("UPDATE payments SET status = 'paid', tid = ?, paid_at = ? WHERE order_id = ?").bind(tid, Date.now(), orderId).run();
    await env.DB.prepare("UPDATE users SET paid_until = ? WHERE id = ?").bind(until, o.user_id).run();
    return back("ok");
  },

  /* NICEPAY's webhook (register https://1440.kor.gallery/api/pay/hook in the NICEPAY admin → 웹훅): whenever a payment
     is cancelled (from the NICEPAY admin or the API), the days it bought come off the pass; a cancelled subscription
     charge also stops the subscription. The signature is checked and a payment is undone only once. NICEPAY wants
     the text "OK" back (text/html), or it sends again. */
  "POST /api/pay/hook": async (env, req) => {
    const ok = () => new Response("OK", { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    let h; try { h = await req.json(); } catch (e) { return ok(); }
    if (!h || !h.tid || !/^(cancelled|partialCancelled)$/.test(h.status || "")) return ok();
    if (!env.NICEPAY_SECRET_KEY || (await hex(String(h.tid) + h.amount + h.ediDate + env.NICEPAY_SECRET_KEY)) !== String(h.signature || "")) { console.log("hook: bad signature"); return ok(); }
    const o = await env.DB.prepare("SELECT * FROM payments WHERE tid = ?").bind(String(h.tid)).first();
    if (!o || o.status !== "paid") return ok();
    await undoPayment(env, o, Math.max(0, o.amount - Math.max(0, +h.balanceAmt || 0)));
    return ok();
  },

  /* what a refund of the latest payment would give back, by the rules above */
  "GET /api/pay/refund": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    return json({ quote: await refundQuote(env, u) });
  },
  "POST /api/pay/refund": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    const d = await body(req), q = await refundQuote(env, u);
    if (!q || q.orderId !== String(d.orderId || "")) return fail("환불할 결제가 없어요. 화면을 새로 고쳐 주세요.", 409);
    const o = await env.DB.prepare("SELECT * FROM payments WHERE order_id = ?").bind(q.orderId).first();
    const stopSub = async () => { const s = await env.DB.prepare("SELECT * FROM subs WHERE user_id = ? AND status = 'active'").bind(u.id).first(); if (s) { await env.DB.prepare("UPDATE subs SET status = 'canceled', bid = '' WHERE user_id = ?").bind(u.id).run(); await expireBid(env, s.bid); } };
    if (q.refund > 0) {
      /* the payment is marked first, so NICEPAY's webhook for this same cancel finds nothing left to undo */
      const full = q.refund >= o.amount;
      await env.DB.prepare("UPDATE payments SET status = ?, message = ? WHERE order_id = ? AND status = 'paid'").bind(full ? "cancelled" : "partial", "환불 " + q.refund + "원", o.order_id).run();
      const ediDate = new Date().toISOString();
      const r = await nice(env, "/v1/payments/" + encodeURIComponent(o.tid) + "/cancel", { reason: q.rule === "today" ? "구매 당일 환불" : "남은 기간 환불", orderId: o.order_id, ...(full ? {} : { cancelAmt: q.refund }), ediDate, signData: await hex(o.tid + ediDate + env.NICEPAY_SECRET_KEY) });
      if (r.resultCode !== "0000") {
        await env.DB.prepare("UPDATE payments SET status = 'paid', message = ? WHERE order_id = ?").bind(String(r.resultMsg || "").slice(0, 200), o.order_id).run();
        return fail(r.resultMsg || "환불하지 못했어요. 잠시 후 다시 해 주세요.", 502);
      }
      const me = await env.DB.prepare("SELECT paid_until FROM users WHERE id = ?").bind(u.id).first(), back = (me && me.paid_until || 0) - q.daysBack * DAY;
      await env.DB.prepare("UPDATE users SET paid_until = ? WHERE id = ?").bind(back > Date.now() ? back : null, u.id).run();
    } else if (q.rule === "sub") await env.DB.prepare("UPDATE payments SET message = '환불 요청: 구독 멈춤' WHERE order_id = ?").bind(o.order_id).run();
    if (o.plan === "sub") await stopSub();
    return json({ refunded: q.refund, rule: q.rule, user: await fullUser(env, await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(u.id).first()) });
  },

  "GET /api/pay/history": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    const r = await env.DB.prepare("SELECT order_id, plan, amount, status, created, paid_at FROM payments WHERE user_id = ? AND status != 'ready' ORDER BY created DESC LIMIT 30").bind(u.id).all();
    return json({ payments: r.results || [] });
  },

  /* ---------- the monthly subscription: the card becomes a billing key (BID) once, the first month is charged at once,
     then the cron charges it when the pass runs out. Card details only pass through (encrypted for NICEPAY at once,
     never stored or logged): what is kept is the key, the card company and the last four digits. ---------- */
  "POST /api/sub/start": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    if (!env.NICEPAY_CLIENT_KEY || !env.NICEPAY_SECRET_KEY) return fail("결제는 준비 중이에요.", 503);
    const d = await body(req), num = (v) => String(v == null ? "" : v).replace(/\D/g, "");
    const c = { cardNo: num(d.cardNo), expYear: num(d.expYear).slice(-2), expMonth: num(d.expMonth).padStart(2, "0"), idNo: num(d.idNo), cardPw: num(d.cardPw) };
    if (!d.agree) return fail("자동 결제에 동의해 주세요.");
    if (!/^\d{14,16}$/.test(c.cardNo)) return fail("카드 번호를 확인해 주세요.");
    if (!/^\d{2}$/.test(c.expYear) || !/^(0[1-9]|1[0-2])$/.test(c.expMonth)) return fail("유효기간을 확인해 주세요.");
    if (!/^(\d{6}|\d{10})$/.test(c.idNo)) return fail("생년월일 6자리(법인은 사업자번호 10자리)를 적어 주세요.");
    if (!/^\d{2}$/.test(c.cardPw)) return fail("비밀번호 앞 2자리를 적어 주세요.");
    const cur = await env.DB.prepare("SELECT status FROM subs WHERE user_id = ?").bind(u.id).first();
    if (cur && cur.status === "active") return fail("이미 구독 중이에요.", 409);
    const orderId = newOrder("b"), ediDate = new Date().toISOString();
    const e = await encCard("cardNo=" + c.cardNo + "&expYear=" + c.expYear + "&expMonth=" + c.expMonth + "&idNo=" + c.idNo + "&cardPw=" + c.cardPw, env.NICEPAY_SECRET_KEY);
    const r = await nice(env, "/v1/subscribe/regist", { ...e, orderId, buyerEmail: u.email, ediDate, signData: await hex(orderId + ediDate + env.NICEPAY_SECRET_KEY) });
    if (r.resultCode !== "0000" || !r.bid) return fail(r.resultMsg || "카드를 등록하지 못했어요.", 402);
    const p = await chargeSub(env, u, r.bid);
    if (!p.ok) { await expireBid(env, r.bid); return fail(p.msg, 402); }
    const card = String(r.cardName || "카드").replace(/[\[\]]/g, "").slice(0, 12) + " ··" + c.cardNo.slice(-4);
    await env.DB.prepare("INSERT INTO subs (user_id, bid, card, status, next, tries, created) VALUES (?, ?, ?, 'active', ?, 0, ?) ON CONFLICT(user_id) DO UPDATE SET bid = excluded.bid, card = excluded.card, status = 'active', next = excluded.next, tries = 0")
      .bind(u.id, r.bid, card, p.until, Date.now()).run();
    return json({ user: await fullUser(env, await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(u.id).first()) });
  },
  /* stopping: no more charges; the days already paid stay */
  "POST /api/sub/cancel": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    const s = await env.DB.prepare("SELECT * FROM subs WHERE user_id = ?").bind(u.id).first();
    if (!s || s.status !== "active") return fail("구독 중이 아니에요.", 404);
    await env.DB.prepare("UPDATE subs SET status = 'canceled', bid = '' WHERE user_id = ?").bind(u.id).run();
    await expireBid(env, s.bid);
    return json({ user: await fullUser(env, u) });
  },

  "GET /api/me": async (env, req, u) => json({ user: u ? await fullUser(env, u) : null }),

  /* signing up is two steps: the address gets a six-digit code (Resend), and only the right code makes the account.
     Until then the e-mail, the hashed password and the code wait in "signups". A student who signs up with a
     university address is checked by the same code: the free month opens at once. */
  "POST /api/signup": async (env, req) => {
    const d = await body(req), email = String(d.email || "").trim().toLowerCase(), pass = String(d.password || ""), ip = req.headers.get("cf-connecting-ip") || "";
    if (!EMAIL.test(email)) return fail("이메일 주소를 확인해 주세요.");
    if (d.student && !uniDomain(email)) return fail("대학생은 학교 메일(.ac.kr, .edu 등)로만 가입할 수 있어요.");
    if (pass.length < 8) return fail("비밀번호는 8자 이상이에요.");
    if (await env.DB.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first()) return fail("이미 가입한 이메일이에요.", 409);
    const state = JSON.stringify(d.state && typeof d.state === "object" ? d.state : {}).slice(0, 8000);
    return sendSignupCode(env, email, { pass: await hashPass(pass), student: d.student ? 1 : 0, state }, ip);
  },
  /* the code again (the password stays as it was given) */
  "POST /api/signup/resend": async (env, req) => {
    const d = await body(req), email = String(d.email || "").trim().toLowerCase();
    const p = await env.DB.prepare("SELECT * FROM signups WHERE email = ?").bind(email).first();
    if (!p) return fail("가입을 처음부터 다시 해 주세요.", 404);
    return sendSignupCode(env, email, p, req.headers.get("cf-connecting-ip") || "");
  },
  "POST /api/signup/verify": async (env, req) => {
    const d = await body(req), email = String(d.email || "").trim().toLowerCase();
    const p = await env.DB.prepare("SELECT * FROM signups WHERE email = ?").bind(email).first();
    if (!p || p.expires < Date.now()) return fail("코드가 없거나 시간이 지났어요. 다시 보내 주세요.");
    if (p.tries >= 5) return fail("여러 번 틀렸어요. 코드를 다시 보내 주세요.", 429);
    if ((await sha(String(d.code || "").trim())) !== p.code) { await env.DB.prepare("UPDATE signups SET tries = tries + 1 WHERE email = ?").bind(email).run(); return fail("코드가 맞지 않아요."); }
    if (await env.DB.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first()) { await env.DB.prepare("DELETE FROM signups WHERE email = ?").bind(email).run(); return fail("이미 가입한 이메일이에요.", 409); }
    /* the name kept on the server: the part of the e-mail before @, made unique (the pages show the e-mail) */
    let base = (email.split("@")[0].match(/[\p{L}\p{N}_.-]/gu) || []).join("").slice(0, 16), nick = "";
    if (base.length < 2) base = "user";
    for (let i = 1; i < 500 && !nick; i++) { const x = i === 1 ? base : base + i; if (!(await env.DB.prepare("SELECT 1 FROM users WHERE nick = ?").bind(x).first())) nick = x; }
    if (!nick) nick = base + b64(rand(3));
    const id = b64(rand(12));
    await env.DB.prepare("INSERT INTO users (id, email, nick, pass, state, created) VALUES (?, ?, ?, ?, ?, ?)").bind(id, email, nick, p.pass, p.state || "{}", Date.now()).run();
    /* the code went to this address, so a university address is a checked one: the student month */
    if (p.student && uniDomain(email) && !(await uniTaken(env, email)))
      await env.DB.prepare("UPDATE users SET uni_email = ?, student = 'verified', trial_until = ? WHERE id = ?").bind(email, Date.now() + MONTH, id).run();
    await env.DB.prepare("DELETE FROM signups WHERE email = ?").bind(email).run();
    try { await countHit(env, req, "signup", d.src, d.camp, d.dev); } catch (e) {}
    const u = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
    return json({ user: await fullUser(env, u) }, 200, { "set-cookie": await startSession(env, id) });
  },

  "POST /api/login": async (env, req) => {
    const d = await body(req), email = String(d.email || "").trim().toLowerCase(), ip = req.headers.get("cf-connecting-ip") || "";
    if (await tooMany(env, "login:" + email, 8, 15 * 60000) || await tooMany(env, "ip:" + ip, 30, 15 * 60000)) return fail("잠시 후 다시 해 주세요.", 429);
    const u = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    if (!u) { const p = await env.DB.prepare("SELECT pass FROM signups WHERE email = ?").bind(email).first(); if (p && await checkPass(String(d.password || ""), p.pass)) return json({ error: "메일로 받은 코드를 넣어 가입을 마쳐 주세요.", pending: true, email }, 403); }
    if (!u || !(await checkPass(String(d.password || ""), u.pass))) { await note(env, "login:" + email); await note(env, "ip:" + ip); return fail("이메일이나 비밀번호가 맞지 않아요.", 401); }
    return json({ user: await fullUser(env, u) }, 200, { "set-cookie": await startSession(env, u.id) });
  },

  "POST /api/logout": async (env, req) => {
    const t = readCookie(req, "sid"); if (t) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(await sha(t)).run();
    return json({ ok: true }, 200, { "set-cookie": cookie("sid", "", 0) });
  },

  /* leaving 1440 (탈퇴): asked with the password. The subscription stops, the site and its pictures and the account are
     deleted at once. Payment records stay for the years the law asks (they keep no e-mail); a school address that gave
     a free month is kept only as a hash for a year, so the month is not given twice. */
  "POST /api/me/delete": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    if (await tooMany(env, "del:" + u.id, 8, 15 * 60000)) return fail("잠시 뒤에 다시 해 주세요.", 429);
    const d = await body(req);
    if (!(await checkPass(String(d.password || ""), u.pass))) { await note(env, "del:" + u.id); return fail("비밀번호가 맞지 않아요.", 403); }
    const s = await env.DB.prepare("SELECT * FROM subs WHERE user_id = ?").bind(u.id).first();
    if (s && s.status === "active" && s.bid) await expireBid(env, s.bid);
    await removeSite(env, u.id);
    if (u.uni_email) await env.DB.prepare("INSERT OR REPLACE INTO uni_used (hash, at) VALUES (?, ?)").bind(await sha("uni:" + u.uni_email), Date.now()).run();
    for (const t of ["sessions", "codes", "requests", "subs"]) await env.DB.prepare("DELETE FROM " + t + " WHERE user_id = ?").bind(u.id).run();
    await env.DB.prepare("DELETE FROM attempts WHERE key IN (?, ?, ?)").bind("login:" + u.email, "signup:" + u.email, "del:" + u.id).run();
    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(u.id).run();
    return json({ ok: true }, 200, { "set-cookie": cookie("sid", "", 0) });
  },

  /* the hub: which form was edited last and the forms kept in 홈 */
  "PUT /api/me/state": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    const d = await body(req), s = JSON.stringify(d.state && typeof d.state === "object" ? d.state : {});
    if (s.length > 8000) return fail("too big", 413);
    await env.DB.prepare("UPDATE users SET state = ? WHERE id = ?").bind(s, u.id).run();
    return json({ ok: true });
  },

  /* the student month: a code to the university address */
  "POST /api/student/send": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    if (u.student === "verified") return fail("이미 확인했어요.");
    const d = await body(req), uni = String(d.uniEmail || "").trim().toLowerCase();
    if (!EMAIL.test(uni)) return fail("학교 메일 주소를 확인해 주세요.");
    if (!uniDomain(uni)) return fail("대학 메일(.ac.kr, .edu 등)이 아니에요. 아래 '관리자 확인 요청'을 써 주세요.", 422);
    if (await uniTaken(env, uni, u.id)) return fail("이 학교 메일은 이미 다른 계정이 썼어요.", 409);
    const old = await env.DB.prepare("SELECT sent FROM codes WHERE user_id = ?").bind(u.id).first();
    if (old && Date.now() - old.sent < 60000) return fail("1분 뒤에 다시 보낼 수 있어요.", 429);
    if (await tooMany(env, "code:" + u.id, 6, DAY)) return fail("오늘은 더 보낼 수 없어요.", 429);
    const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
    await env.DB.prepare("INSERT OR REPLACE INTO codes (user_id, uni_email, code, expires, tries, sent) VALUES (?, ?, ?, ?, 0, ?)").bind(u.id, uni, await sha(code), Date.now() + CODE_LIFE, Date.now()).run();
    await note(env, "code:" + u.id);
    const cm = codeMail(code, "학교 메일 확인 코드", "요청하지 않았다면 이 메일은 지워도 됩니다.");
    try { await sendMail(env, uni, "1440 학교 메일 확인 코드 " + code, cm.text, cm.html); }
    catch (e) { return fail("메일을 보내지 못했어요. 잠시 후 다시 해 주세요.", 502); }
    return json({ ok: true });
  },

  "POST /api/student/verify": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    const d = await body(req), c = await env.DB.prepare("SELECT * FROM codes WHERE user_id = ?").bind(u.id).first();
    if (!c || c.expires < Date.now()) return fail("코드가 없거나 시간이 지났어요. 다시 보내 주세요.");
    if (c.tries >= 5) return fail("여러 번 틀렸어요. 코드를 다시 보내 주세요.", 429);
    if ((await sha(String(d.code || "").trim())) !== c.code) { await env.DB.prepare("UPDATE codes SET tries = tries + 1 WHERE user_id = ?").bind(u.id).run(); return fail("코드가 맞지 않아요."); }
    if (await uniTaken(env, c.uni_email, u.id)) return fail("이 학교 메일은 이미 다른 계정이 썼어요.", 409);
    const until = Math.max(u.trial_until || 0, Date.now()) + MONTH;
    await env.DB.prepare("UPDATE users SET uni_email = ?, student = 'verified', trial_until = ? WHERE id = ?").bind(c.uni_email, until, u.id).run();
    await env.DB.prepare("DELETE FROM codes WHERE user_id = ?").bind(u.id).run();
    return json({ ok: true, trialUntil: until });
  },

  /* an address the site does not know as a university: the admin looks */
  "POST /api/student/request": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    if (u.student === "verified") return fail("이미 확인했어요.");
    const d = await body(req), uni = String(d.uniEmail || "").trim().toLowerCase(), school = String(d.school || "").trim().slice(0, 80);
    if (!EMAIL.test(uni) || !school) return fail("학교 이름과 학교 메일을 적어 주세요.");
    if (await env.DB.prepare("SELECT 1 FROM requests WHERE user_id = ? AND status = 'pending'").bind(u.id).first()) return fail("이미 요청했어요. 확인되면 알려 드려요.");
    await env.DB.prepare("INSERT INTO requests (id, user_id, uni_email, school, created) VALUES (?, ?, ?, ?, ?)").bind(b64(rand(9)), u.id, uni, school, Date.now()).run();
    await env.DB.prepare("UPDATE users SET student = 'pending' WHERE id = ?").bind(u.id).run();
    return json({ ok: true });
  },

  /* the admin: who asked, who is a student, and a free month given or taken back by hand */
  "GET /api/admin/students": async (env, req, u) => {
    if (!isAdmin(env, u)) return fail("관리자만 볼 수 있어요.", 403);
    const reqs = await env.DB.prepare("SELECT r.id, r.uni_email, r.school, r.status, r.created, u.id AS user_id, u.nick, u.email FROM requests r JOIN users u ON u.id = r.user_id ORDER BY r.status = 'pending' DESC, r.created DESC LIMIT 200").all();
    const users = await env.DB.prepare("SELECT id, nick, email, uni_email, student, trial_until, created FROM users ORDER BY created DESC LIMIT 300").all();
    const log = await env.DB.prepare("SELECT at, admin, action, target, ip FROM admin_log ORDER BY at DESC LIMIT 40").all();
    return json({ requests: reqs.results || [], users: users.results || [], log: log.results || [] });
  },
  "POST /api/admin/decide": async (env, req, u) => {
    if (!isAdmin(env, u)) return fail("관리자만 할 수 있어요.", 403);
    const d = await body(req), r = await env.DB.prepare("SELECT * FROM requests WHERE id = ?").bind(String(d.id || "")).first();
    if (!r || r.status !== "pending") return fail("없거나 이미 처리한 요청이에요.", 404);
    const ok = !!d.approve;
    if (ok && await uniTaken(env, r.uni_email, r.user_id)) return fail("이 학교 메일은 이미 다른 계정이 썼어요.", 409);
    await env.DB.prepare("UPDATE requests SET status = ? WHERE id = ?").bind(ok ? "approved" : "denied", r.id).run();
    if (ok) {
      const t = await env.DB.prepare("SELECT trial_until FROM users WHERE id = ?").bind(r.user_id).first();
      await env.DB.prepare("UPDATE users SET uni_email = ?, student = 'verified', trial_until = ? WHERE id = ?").bind(r.uni_email, Math.max((t && t.trial_until) || 0, Date.now()) + MONTH, r.user_id).run();
    } else await env.DB.prepare("UPDATE users SET student = 'none' WHERE id = ?").bind(r.user_id).run();
    return json({ ok: true });
  },
  "GET /api/admin/usage": async (env, req, u) => {
    if (!isAdmin(env, u)) return fail("관리자만 볼 수 있어요.", 403);
    return json(await usage(env));
  },
  /* a page asks to be counted once per visit: no login, no cookie, nothing stored about the person */
  "POST /api/hit": async (env, req) => {
    const d = await body(req);
    if (!HIT_EVENTS.includes(d.ev) || d.ev === "signup") return fail("bad", 400);
    if (/bot|crawl|spider|slurp|preview|headless/i.test(req.headers.get("user-agent") || "")) return json({ ok: true });
    await countHit(env, req, d.ev, d.src, d.camp, d.dev);
    return json({ ok: true });
  },
  "GET /api/admin/traffic": async (env, req, u) => {
    if (!isAdmin(env, u)) return fail("관리자만 볼 수 있어요.", 403);
    return json(await trafficFor(env, +new URL(req.url).searchParams.get("days")));
  },
  "POST /api/admin/grant": async (env, req, u) => {
    if (!isAdmin(env, u)) return fail("관리자만 할 수 있어요.", 403);
    const d = await body(req), days = Math.max(-365, Math.min(365, Math.round(+d.days || 0))), t = await env.DB.prepare("SELECT trial_until FROM users WHERE id = ?").bind(String(d.userId || "")).first();
    if (!t) return fail("그런 사용자가 없어요.", 404);
    const until = days > 0 ? Math.max(t.trial_until || 0, Date.now()) + days * DAY : null;
    await env.DB.prepare("UPDATE users SET trial_until = ? WHERE id = ?").bind(until, String(d.userId)).run();
    return json({ ok: true, trialUntil: until || 0 });
  },
  ...siteRoutes
};

/* visit counts for the admin's 유입 page: only counted by day (no cookie, no address stored, nothing that names a person) */
const HIT_EVENTS = ["view", "forms", "edit", "signup"];
const hitTag = (v) => String(v == null ? "" : v).toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 32);
async function countHit(env, req, ev, src, camp, dev, now = Date.now()) {
  const c = String(req.headers.get("cf-ipcountry") || "").toUpperCase();
  await env.DB.prepare("INSERT INTO hits (day, ev, src, camp, dev, ctry, n) VALUES (?, ?, ?, ?, ?, ?, 1) ON CONFLICT (day, ev, src, camp, dev, ctry) DO UPDATE SET n = n + 1")
    .bind(kstDay(now), ev, hitTag(src) || "direct", hitTag(camp), dev === "m" ? "m" : "d", /^[A-Z]{2}$/.test(c) ? c : "XX").run();
}
async function trafficFor(env, days, now = Date.now()) {
  days = Math.max(1, Math.min(90, Math.round(days) || 14));
  const from = kstDay(now - (days - 1) * DAY);
  const rows = (await env.DB.prepare("SELECT day, ev, src, camp, dev, ctry, n FROM hits WHERE day >= ? LIMIT 20000").bind(from).all()).results || [];
  const daily = {}, src = {}, dev = { m: 0, d: 0 }, ctry = {}, tot = { view: 0, forms: 0, edit: 0, signup: 0 };
  for (let i = days - 1; i >= 0; i--) daily[kstDay(now - i * DAY)] = { view: 0, forms: 0, edit: 0, signup: 0 };
  for (const r of rows) {
    if (daily[r.day]) daily[r.day][r.ev] += r.n;
    const k = r.src + "" + r.camp; (src[k] = src[k] || { src: r.src, camp: r.camp, view: 0, forms: 0, edit: 0, signup: 0 })[r.ev] += r.n;
    tot[r.ev] += r.n;
    if (r.ev === "view") { dev[r.dev] += r.n; ctry[r.ctry] = (ctry[r.ctry] || 0) + r.n; }
  }
  return {
    days, from, totals: tot, devices: dev,
    daily: Object.keys(daily).map((d) => ({ d, ...daily[d] })),
    sources: Object.values(src).sort((a, b) => b.view - a.view || b.signup - a.signup).slice(0, 60),
    countries: Object.keys(ctry).map((c) => ({ c, n: ctry[c] })).sort((a, b) => b.n - a.n).slice(0, 8)
  };
}

/* every look and change the admin makes at people's records is written down (who, when, what, on whom, from where) and
   kept two years: the access record the personal-information safety rules ask for (개인정보의 안전성 확보조치 기준 제8조).
   The admin's page shows the latest ones for the monthly check. */
async function adminLog(env, req, u, key) {
  let target = "";
  if (req.method === "POST") { try { const d = await req.clone().json(); target = String(d.userId || d.id || "").slice(0, 40) + (d.days != null ? " " + (+d.days) + "일" : d.approve != null ? (d.approve ? " 받기" : " 거절") : ""); } catch (e) {} }
  try { await env.DB.prepare("INSERT INTO admin_log (at, admin, action, target, ip) VALUES (?, ?, ?, ?, ?)").bind(Date.now(), u.email, key, target, req.headers.get("cf-connecting-ip") || "").run(); } catch (e) {}
}

export default {
  /* the daily renewal (api/wrangler.jsonc → triggers) */
  async scheduled(event, env, ctx) { ctx.waitUntil(renewSubs(env).then(() => sweepSites(env))); },
  async fetch(req, env, ctx) {
    const url = new URL(req.url), key = req.method + " " + url.pathname.replace(/\/+$/, ""), fn = routes[key];
    /* 이름.kor.gallery is a published site; 1440.kor.gallery itself is the static site (only /api/* is ours) */
    if (url.hostname !== new URL(env.SITE_ORIGIN || "https://1440.kor.gallery").hostname) return serveSite(req, env, url, ctx);
    if (!url.pathname.startsWith("/api/") && env.STATIC) return env.STATIC.fetch(req);
    if (!fn) return fail("not found", 404);
    if (req.method !== "GET" && key !== "POST /api/pay/return" && key !== "POST /api/pay/hook") { /* NICEPAY's posts come from its own servers */
      const origin = req.headers.get("origin");
      if (origin && origin !== url.origin && origin !== env.SITE_ORIGIN) return fail("forbidden", 403);
      if (key === "PUT /api/media") { if (!origin) return fail("forbidden", 403); } /* a file, not JSON: it must say it comes from this site */
      else if (!/application\/json/.test(req.headers.get("content-type") || "")) return fail("json only", 415);
    }
    try {
      const u = await userOf(env, req);
      if (url.pathname.startsWith("/api/admin/") && isAdmin(env, u)) await adminLog(env, req, u, key);
      return await fn(env, req, u);
    }
    catch (e) { return fail("잠시 문제가 생겼어요.", 500); }
  }
};
