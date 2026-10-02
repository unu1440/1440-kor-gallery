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

async function sendMail(env, to, subject, text) {
  if (!env.RESEND_API_KEY) throw new Error("no mail key");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM || "1440 <no-reply@kor.gallery>", to: [to], subject, text })
  });
  if (!r.ok) throw new Error("mail " + r.status);
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
      try { await sendMail(env, s.email, "1440 구독 결제 4,900₩", "1440 월 구독이 결제되었습니다.\n\n금액 4,900₩ · " + (s.card || "카드") + "\n이용 기간 ~" + ymd(r.until) + "\n\n해지는 1440.kor.gallery → 계정 → 구독에서 할 수 있습니다."); } catch (e) {}
    } else {
      failed++; const tries = (s.tries || 0) + 1;
      if (tries >= SUB.tries) {
        await env.DB.prepare("UPDATE subs SET status = 'failed', bid = '', tries = ? WHERE user_id = ?").bind(tries, s.user_id).run(); await expireBid(env, s.bid);
        try { await sendMail(env, s.email, "1440 구독이 멈췄어요", "등록한 카드로 결제가 되지 않아 1440 월 구독을 멈췄습니다 (" + r.msg + ").\n\n1440.kor.gallery → 계정 → 구독에서 카드를 다시 등록하면 이어서 쓸 수 있습니다."); } catch (e) {}
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
  try { await sendMail(env, email, "1440 가입 확인 코드 " + code, "1440 가입 확인 코드: " + code + "\n\n10분 안에 입력해 주세요. 가입하지 않았다면 이 메일은 지워도 됩니다.\n\n1440.kor.gallery"); }
  catch (e) { return fail("메일을 보내지 못했어요. 잠시 후 다시 해 주세요.", 502); }
  return json({ pending: true, email });
}

async function body(req) { try { return await req.json(); } catch (e) { return {}; } }

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
    return json({ orderId, method: "cardAndEasyPay", amount: plan.amount, goodsName: plan.goods, clientId: env.NICEPAY_CLIENT_KEY, returnUrl: new URL(req.url).origin + "/api/pay/return", buyerEmail: u.email, buyerName: u.nick });
  },

  "POST /api/pay/return": async (env, req) => {
    const back = (q) => new Response(null, { status: 303, headers: { location: "/?pay=" + q, "cache-control": "no-store" } });
    let f; try { f = await req.formData(); } catch (e) { return back("fail&m=" + encodeURIComponent("결제 정보를 읽지 못했어요.")); }
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
    if (p.student && uniDomain(email) && !(await env.DB.prepare("SELECT 1 FROM users WHERE uni_email = ?").bind(email).first()))
      await env.DB.prepare("UPDATE users SET uni_email = ?, student = 'verified', trial_until = ? WHERE id = ?").bind(email, Date.now() + MONTH, id).run();
    await env.DB.prepare("DELETE FROM signups WHERE email = ?").bind(email).run();
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
    if (await env.DB.prepare("SELECT 1 FROM users WHERE uni_email = ? AND id != ?").bind(uni, u.id).first()) return fail("이 학교 메일은 이미 다른 계정이 썼어요.", 409);
    const old = await env.DB.prepare("SELECT sent FROM codes WHERE user_id = ?").bind(u.id).first();
    if (old && Date.now() - old.sent < 60000) return fail("1분 뒤에 다시 보낼 수 있어요.", 429);
    if (await tooMany(env, "code:" + u.id, 6, DAY)) return fail("오늘은 더 보낼 수 없어요.", 429);
    const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
    await env.DB.prepare("INSERT OR REPLACE INTO codes (user_id, uni_email, code, expires, tries, sent) VALUES (?, ?, ?, ?, 0, ?)").bind(u.id, uni, await sha(code), Date.now() + CODE_LIFE, Date.now()).run();
    await note(env, "code:" + u.id);
    try { await sendMail(env, uni, "1440 학교 메일 확인 코드 " + code, "1440 학교 메일 확인 코드: " + code + "\n\n10분 안에 입력해 주세요. 요청하지 않았다면 이 메일은 지워도 됩니다.\n\n1440.kor.gallery"); }
    catch (e) { return fail("메일을 보내지 못했어요. 잠시 후 다시 해 주세요.", 502); }
    return json({ ok: true });
  },

  "POST /api/student/verify": async (env, req, u) => {
    if (!u) return fail("로그인해 주세요.", 401);
    const d = await body(req), c = await env.DB.prepare("SELECT * FROM codes WHERE user_id = ?").bind(u.id).first();
    if (!c || c.expires < Date.now()) return fail("코드가 없거나 시간이 지났어요. 다시 보내 주세요.");
    if (c.tries >= 5) return fail("여러 번 틀렸어요. 코드를 다시 보내 주세요.", 429);
    if ((await sha(String(d.code || "").trim())) !== c.code) { await env.DB.prepare("UPDATE codes SET tries = tries + 1 WHERE user_id = ?").bind(u.id).run(); return fail("코드가 맞지 않아요."); }
    if (await env.DB.prepare("SELECT 1 FROM users WHERE uni_email = ? AND id != ?").bind(c.uni_email, u.id).first()) return fail("이 학교 메일은 이미 다른 계정이 썼어요.", 409);
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
    return json({ requests: reqs.results || [], users: users.results || [] });
  },
  "POST /api/admin/decide": async (env, req, u) => {
    if (!isAdmin(env, u)) return fail("관리자만 할 수 있어요.", 403);
    const d = await body(req), r = await env.DB.prepare("SELECT * FROM requests WHERE id = ?").bind(String(d.id || "")).first();
    if (!r || r.status !== "pending") return fail("없거나 이미 처리한 요청이에요.", 404);
    const ok = !!d.approve;
    if (ok && await env.DB.prepare("SELECT 1 FROM users WHERE uni_email = ? AND id != ?").bind(r.uni_email, r.user_id).first()) return fail("이 학교 메일은 이미 다른 계정이 썼어요.", 409);
    await env.DB.prepare("UPDATE requests SET status = ? WHERE id = ?").bind(ok ? "approved" : "denied", r.id).run();
    if (ok) {
      const t = await env.DB.prepare("SELECT trial_until FROM users WHERE id = ?").bind(r.user_id).first();
      await env.DB.prepare("UPDATE users SET uni_email = ?, student = 'verified', trial_until = ? WHERE id = ?").bind(r.uni_email, Math.max((t && t.trial_until) || 0, Date.now()) + MONTH, r.user_id).run();
    } else await env.DB.prepare("UPDATE users SET student = 'none' WHERE id = ?").bind(r.user_id).run();
    return json({ ok: true });
  },
  "POST /api/admin/grant": async (env, req, u) => {
    if (!isAdmin(env, u)) return fail("관리자만 할 수 있어요.", 403);
    const d = await body(req), days = Math.max(-365, Math.min(365, Math.round(+d.days || 0))), t = await env.DB.prepare("SELECT trial_until FROM users WHERE id = ?").bind(String(d.userId || "")).first();
    if (!t) return fail("그런 사용자가 없어요.", 404);
    const until = days > 0 ? Math.max(t.trial_until || 0, Date.now()) + days * DAY : null;
    await env.DB.prepare("UPDATE users SET trial_until = ? WHERE id = ?").bind(until, String(d.userId)).run();
    return json({ ok: true, trialUntil: until || 0 });
  }
};

export default {
  /* the daily renewal (api/wrangler.jsonc → triggers) */
  async scheduled(event, env, ctx) { ctx.waitUntil(renewSubs(env)); },
  async fetch(req, env) {
    const url = new URL(req.url), key = req.method + " " + url.pathname.replace(/\/+$/, ""), fn = routes[key];
    if (!fn) return fail("not found", 404);
    if (req.method !== "GET" && key !== "POST /api/pay/return") { /* NICEPAY's form post comes from its own site */
      const origin = req.headers.get("origin");
      if (origin && origin !== url.origin && origin !== env.SITE_ORIGIN) return fail("forbidden", 403);
      if (!/application\/json/.test(req.headers.get("content-type") || "")) return fail("json only", 415);
    }
    try { return await fn(env, req, await userOf(env, req)); }
    catch (e) { return fail("잠시 문제가 생겼어요.", 500); }
  }
};
