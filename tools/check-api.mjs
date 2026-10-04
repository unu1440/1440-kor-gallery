/* Checks the accounts server (api/worker.js) without Cloudflare: D1 is played by Node's built-in SQLite and
   Resend by a fake fetch. Needs Node 22.5 or later (node:sqlite).
   node tools/check-api.mjs */
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
/* api/worker.js is an ES module in a folder without package.json: a copy with .mjs is imported */
const copy = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "1440-api-")), "worker.mjs");
fs.writeFileSync(copy, fs.readFileSync(path.join(root, "api/worker.js"), "utf8"));
const W = (await import(pathToFileURL(copy).href)).default;

const db = new DatabaseSync(":memory:");
db.exec(fs.readFileSync(path.join(root, "api/schema.sql"), "utf8"));
const D1 = { prepare(sql) { const st = db.prepare(sql); let args = []; const o = { bind(...a) { args = a; return o; }, async first() { return st.get(...args) || null; }, async all() { return { results: st.all(...args) }; }, async run() { return st.run(...args); } }; return o; } };
const mails = [];
/* Resend gets mail; NICEPAY's approval answers like the sandbox (it says what it was asked) */
const approvals = [];
/* NICEPAY billing: the fake opens encData with the secret key, so the test proves the card was sent right */
const subCalls = [], cancels = []; let cardFails = 0;
import crypto2 from "node:crypto";
function openCard(hexData, secret) { const d = crypto2.createDecipheriv("aes-256-cbc", Buffer.from(secret.slice(0, 32)), Buffer.from(secret.slice(0, 16))); return Buffer.concat([d.update(Buffer.from(hexData, "hex")), d.final()]).toString(); }
globalThis.fetch = async (url, init) => {
  if (/\/v1\/payments\/[^/]+\/cancel$/.test(String(url))) { const b = JSON.parse(init.body); cancels.push({ url: String(url), body: b }); return new Response(JSON.stringify({ resultCode: "0000", status: b.cancelAmt ? "partialCancelled" : "cancelled" })); }
  if (String(url).indexOf("/v1/subscribe/") >= 0) {
    const b = JSON.parse(init.body), u = String(url); subCalls.push({ url: u, body: b, auth: init.headers.authorization });
    if (/\/regist$/.test(u)) { const plain = openCard(b.encData, env.NICEPAY_SECRET_KEY); subCalls[subCalls.length - 1].plain = plain; return new Response(JSON.stringify(/cardNo=4000000000000000/.test(plain) ? { resultCode: "F112", resultMsg: "유효하지않은 카드번호" } : { resultCode: "0000", bid: "BIKY" + subCalls.length, cardName: "[신한]", tid: "R1", orderId: b.orderId })); }
    if (/\/payments$/.test(u)) { if (cardFails > 0) { cardFails--; return new Response(JSON.stringify({ resultCode: "3011", resultMsg: "한도초과" })); } return new Response(JSON.stringify({ resultCode: "0000", status: "paid", amount: b.amount, tid: "S" + subCalls.length })); }
    if (/\/expire$/.test(u)) return new Response(JSON.stringify({ resultCode: "0000" }));
  }
  if (String(url).indexOf("/v1/payments/") >= 0) { const b = JSON.parse(init.body); approvals.push({ url: String(url), auth: init.headers.authorization, body: b }); return new Response(JSON.stringify({ resultCode: "0000", status: "paid", amount: b.amount, tid: String(url).split("/").pop() }), { status: 200 }); }
  mails.push(JSON.parse(init.body)); return new Response("{}", { status: 200 });
};
const env = { DB: D1, RESEND_API_KEY: "x", NICEPAY_CLIENT_KEY: "S2_test", NICEPAY_SECRET_KEY: "secretsecretsecretsecretsecret32", NICEPAY_API: "https://sandbox-api.nicepay.co.kr", ADMIN_EMAILS: "boss@kor.gallery", SITE_ORIGIN: "https://1440.kor.gallery" };
const O = "https://1440.kor.gallery";
function jar() { let c = ""; return async (method, path, data, extra = {}) => {
  const h = { origin: O, "content-type": "application/json", ...(c ? { cookie: c } : {}), ...extra };
  const r = await W.fetch(new Request(O + path, { method, headers: h, body: data ? JSON.stringify(data) : (method === "GET" ? undefined : "{}") }), env);
  const sc = r.headers.get("set-cookie"); if (sc) c = sc.split(";")[0];
  return { status: r.status, body: await r.json() };
}; }
/* signing up: the address gets a code; the code makes the account */
const codeFor = (to) => { const m = mails.filter((x) => x.to[0] === to).pop(); return m && /(\d{6})/.exec(m.subject)[1]; };
async function join(j, data) {
  const s = await j("POST", "/api/signup", data); if (s.status !== 200) return s;
  return j("POST", "/api/signup/verify", { email: data.email, code: codeFor(String(data.email).toLowerCase()) });
}
let ok = 0, bad = 0; const t = (name, cond, extra) => { if (cond) ok++; else { bad++; console.log("✗", name, JSON.stringify(extra || "")); } };

const a = jar(), boss = jar(), c = jar();
let r = await join(a, { nick: "lee", email: "Lee@Mail.com", password: "12345678", state: { last: { n: 12, site: "lee", t: 1 } } });
t("signup", r.status === 200 && r.body.user.nick === "lee" && r.body.user.email === "lee@mail.com" && r.body.user.state.last.n === 12, r);
t("dup email", (await join(c, { nick: "other", email: "lee@mail.com", password: "12345678" })).status === 409);
r = await join(jar(), { email: "lee@other.com", password: "12345678" }); t("nick from e-mail, made unique", r.status === 200 && r.body.user.nick === "lee2", r);
t("student needs a school address", (await join(jar(), { email: "s@gmail.com", password: "12345678", student: true })).status === 400);
r = await join(jar(), { email: "s@korea.ac.kr", password: "12345678", student: true }); t("student school address", r.status === 200 && r.body.user.nick === "s" + "" || r.body.user.nick === "user", r);
t("student checked by the sign-up code", (await (async () => { const j = jar(); await join(j, { email: "t@yonsei.ac.kr", password: "12345678", student: true }); return (await j("GET", "/api/me")).body.user; })()).student === "verified");
// the code step itself
{ const j = jar(), em = "code@mail.com";
  r = await j("POST", "/api/signup", { email: em, password: "12345678" }); t("signup sends a code, no account yet", r.status === 200 && r.body.pending === true && !!codeFor(em) && !r.body.user && (await j("GET", "/api/me")).body.user === null, r);
  t("code mail", /가입 확인 코드/.test(mails[mails.length - 1].subject));
  t("login before the code", (await j("POST", "/api/login", { email: em, password: "12345678" })).body.pending === true);
  t("resend too soon", (await j("POST", "/api/signup/resend", { email: em })).status === 429);
  t("wrong code", (await j("POST", "/api/signup/verify", { email: em, code: "000000" })).status === 400);
  db.prepare("UPDATE signups SET sent = 0 WHERE email = ?").run(em);
  const first = codeFor(em); r = await j("POST", "/api/signup/resend", { email: em }); t("resend", r.status === 200 && mails.filter((x) => x.to[0] === em).length === 2, r);
  r = await j("POST", "/api/signup/verify", { email: em, code: codeFor(em) }); t("verify makes the account", r.status === 200 && r.body.user.email === em && (await j("GET", "/api/me")).body.user.email === em, r);
  t("code used once", (await jar()("POST", "/api/signup/verify", { email: em, code: first })).status === 400);
  t("login after", (await jar()("POST", "/api/login", { email: em, password: "12345678" })).status === 200);
  const k = jar(), em2 = "many@mail.com"; await k("POST", "/api/signup", { email: em2, password: "12345678" });
  for (let i = 0; i < 5; i++) await k("POST", "/api/signup/verify", { email: em2, code: "111111" });
  t("five wrong codes", (await k("POST", "/api/signup/verify", { email: em2, code: codeFor(em2) })).status === 429);
}
t("short pass", (await join(c, { nick: "kim", email: "k@y.com", password: "123" })).status === 400);
t("me", (await a("GET", "/api/me")).body.user.nick === "lee");
t("anon me", (await c("GET", "/api/me")).body.user === null);
t("cross origin", (await a("POST", "/api/logout", {}, { origin: "https://evil.com" })).status === 403);
t("not json", (await a("POST", "/api/logout", {}, { "content-type": "text/plain" })).status === 415);
t("state", (await a("PUT", "/api/me/state", { state: { last: { n: 99, site: "lee", t: 2 }, home: [{ n: 99 }] } })).status === 200);
t("state read", (await a("GET", "/api/me")).body.user.state.last.n === 99);
// student
t("non-uni", (await a("POST", "/api/student/send", { uniEmail: "me@gmail.com" })).status === 422);
r = await a("POST", "/api/student/send", { uniEmail: "me@snu.ac.kr" }); t("send", r.status === 200, r);
const code = codeFor("me@snu.ac.kr"); t("mail", !!code);
t("send again too soon", (await a("POST", "/api/student/send", { uniEmail: "me@snu.ac.kr" })).status === 429);
t("wrong code", (await a("POST", "/api/student/verify", { code: "000000" })).status === 400);
r = await a("POST", "/api/student/verify", { code }); t("verify", r.status === 200 && r.body.trialUntil > Date.now() + 29 * 86400000, r);
t("me student", (await a("GET", "/api/me")).body.user.student === "verified");
// the same address on another account
await join(c, { nick: "kim", email: "kim@mail.com", password: "abcdefgh" });
t("uni reused", (await c("POST", "/api/student/send", { uniEmail: "me@snu.ac.kr" })).status === 409);
r = await c("POST", "/api/student/request", { uniEmail: "kim@artschool.kr", school: "Art School" }); t("request", r.status === 200, r);
t("request twice", (await c("POST", "/api/student/request", { uniEmail: "kim@artschool.kr", school: "Art School" })).status === 400);
t("not admin", (await c("GET", "/api/admin/students")).status === 403);
// admin
await join(boss, { nick: "boss", email: "boss@kor.gallery", password: "bossboss" });
t("admin flag", (await boss("GET", "/api/me")).body.user.admin === true);
r = await boss("GET", "/api/admin/students"); t("list", r.body.requests.length === 1 && r.body.users.length === 7, r);
r = await boss("POST", "/api/admin/decide", { id: r.body.requests[0].id, approve: true }); t("approve", r.status === 200, r);
t("kim verified", (await c("GET", "/api/me")).body.user.student === "verified");
const kimId = (await c("GET", "/api/me")).body.user.id;
r = await boss("POST", "/api/admin/grant", { userId: kimId, days: 0 }); t("revoke", r.status === 200 && r.body.trialUntil === 0, r);
r = await boss("POST", "/api/admin/grant", { userId: kimId, days: 30 }); t("grant", r.body.trialUntil > Date.now(), r);
// the admin's access record: every look and change, with whom it was about
{ const lg = db.prepare("SELECT action, target, admin FROM admin_log ORDER BY at").all();
  t("admin log: looks and changes written", lg.length === 4 && lg[0].action === "GET /api/admin/students" && lg[3].action === "POST /api/admin/grant" && lg[3].target === kimId + " 30일" && lg[1].target.endsWith(" 받기") && lg.every((x) => x.admin === "boss@kor.gallery"), lg);
  t("admin log: not for others", (await c("GET", "/api/admin/students")).status === 403 && db.prepare("SELECT COUNT(*) AS n FROM admin_log").get().n === 4);
  r = await boss("GET", "/api/admin/students"); t("admin log: shown to the admin", Array.isArray(r.body.log) && r.body.log.length === 5 && r.body.log[0].action === "GET /api/admin/students", r.body.log); }
// login
const d = jar();
t("wrong pass", (await d("POST", "/api/login", { email: "lee@mail.com", password: "nope" })).status === 401);
r = await d("POST", "/api/login", { email: "LEE@mail.com", password: "12345678" }); t("login", r.status === 200 && r.body.user.nick === "lee", r);
t("logout", (await d("POST", "/api/logout")).status === 200);
t("after logout", (await d("GET", "/api/me")).body.user === null);
for (let i = 0; i < 8; i++) await d("POST", "/api/login", { email: "kim@mail.com", password: "nopenope" });
t("throttle", (await d("POST", "/api/login", { email: "kim@mail.com", password: "abcdefgh" })).status === 429);

// paying: an order, NICEPAY's post back, the approval, the pass
const hex = async (x) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(x)))].map((c) => c.toString(16).padStart(2, "0")).join("");
const post = async (fields, origin) => { const r = await W.fetch(new Request(O + "/api/pay/return", { method: "POST", headers: { origin: origin || "https://pay.nicepay.co.kr", "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fields) }), env); return { status: r.status, to: r.headers.get("location") }; };
t("order needs login", (await jar()("POST", "/api/pay/order", { plan: "month", method: "kakaopay" })).status === 401);
t("unknown plan", (await a("POST", "/api/pay/order", { plan: "forever", method: "kakaopay" })).status === 400);
r = await a("POST", "/api/pay/order", { plan: "month", method: "kakaopay" }); t("order", r.body.method === "cardAndEasyPay" && r.status === 200 && r.body.amount === 4900 && r.body.clientId === "S2_test" && /\/api\/pay\/return$/.test(r.body.returnUrl), r);
const o1 = r.body, good = { authResultCode: "0000", authResultMsg: "ok", tid: "T123", clientId: "S2_test", orderId: o1.orderId, amount: "4900", authToken: "TOK" };
t("bad signature", (await post({ ...good, signature: "nope" })).to.indexOf("fail") >= 0);
t("changed amount", (await post({ ...good, amount: "100", signature: await hex("TOK" + "S2_test" + "100" + env.NICEPAY_SECRET_KEY) })).to.indexOf("fail") >= 0);
r = await post({ ...good, signature: await hex("TOK" + "S2_test" + "4900" + env.NICEPAY_SECRET_KEY) }); t("paid", r.status === 303 && r.to === "/?pay=ok", r);
t("approval call", approvals.length === 1 && approvals[0].url === "https://sandbox-api.nicepay.co.kr/v1/payments/T123" && approvals[0].auth === "Basic " + btoa("S2_test:" + env.NICEPAY_SECRET_KEY) && approvals[0].body.amount === 4900, approvals);
let me1 = (await a("GET", "/api/me")).body.user; t("pass 30 days", me1.paidUntil > Date.now() + 29 * 86400000 && me1.paidUntil < Date.now() + 31 * 86400000, me1);
t("same order twice", (await post({ ...good, signature: await hex("TOK" + "S2_test" + "4900" + env.NICEPAY_SECRET_KEY) })).to.indexOf("fail") >= 0 && approvals.length === 1);
r = await a("POST", "/api/pay/order", { plan: "year", method: "naverpayCard" }); const o2 = r.body;
t("cancelled window", (await post({ authResultCode: "9999", authResultMsg: "취소", orderId: o2.orderId })).to.indexOf("fail") >= 0);
r = await a("POST", "/api/pay/order", { plan: "year", method: "naverpayCard" });
await post({ ...good, orderId: r.body.orderId, amount: "46000", tid: "T456", signature: await hex("TOK" + "S2_test" + "46000" + env.NICEPAY_SECRET_KEY) });
me1 = (await a("GET", "/api/me")).body.user; t("year adds on", me1.paidUntil > Date.now() + 394 * 86400000, me1);
r = await a("GET", "/api/pay/history"); t("history", r.body.payments.filter((x) => x.status === "paid").length === 2 && r.body.payments.length === 3, r);

// the monthly subscription: card → billing key → first month, renewals by the cron, failures, stopping
const W2 = await import(pathToFileURL(copy).href);
const card = { cardNo: "9410-1234-5678-1234", expYear: "28", expMonth: "3", idNo: "900101", cardPw: "12", agree: true };
const e = jar(); await join(e, { email: "sub@mail.com", password: "12345678" });
t("sub needs login", (await jar()("POST", "/api/sub/start", card)).status === 401);
t("sub needs consent", (await e("POST", "/api/sub/start", { ...card, agree: false })).status === 400);
t("sub bad card", (await e("POST", "/api/sub/start", { ...card, cardNo: "1234" })).status === 400);
t("sub bad expiry", (await e("POST", "/api/sub/start", { ...card, expMonth: "13" })).status === 400);
t("sub refused card", (await e("POST", "/api/sub/start", { ...card, cardNo: "4000000000000000" })).status === 402);
r = await e("POST", "/api/sub/start", card);
const reg = subCalls.filter((x) => /regist$/.test(x.url)).pop();
t("sub card sent encrypted (A2)", reg.body.encMode === "A2" && reg.plain === "cardNo=9410123456781234&expYear=28&expMonth=03&idNo=900101&cardPw=12" && reg.body.encData.indexOf("9410") < 0 && reg.body.signData === await hex(reg.body.orderId + reg.body.ediDate + env.NICEPAY_SECRET_KEY), reg);
t("sub started", r.status === 200 && r.body.user.sub.status === "active" && r.body.user.sub.card === "신한 ··1234" && r.body.user.paidUntil > Date.now() + 29 * 86400000, r);
const pay1 = subCalls.filter((x) => /payments$/.test(x.url)).pop();
t("sub first charge", pay1.url.indexOf("/v1/subscribe/BIKY") >= 0 && pay1.body.amount === 4900 && pay1.body.cardQuota === "0" && pay1.body.signData === await hex(pay1.body.orderId + pay1.url.split("/")[5] + pay1.body.ediDate + env.NICEPAY_SECRET_KEY), pay1);
t("sub twice", (await e("POST", "/api/sub/start", card)).status === 409);
t("me has sub", (await e("GET", "/api/me")).body.user.sub.next > Date.now());
t("no card number kept", JSON.stringify(db.prepare("SELECT * FROM subs").all()).indexOf("56781234") < 0 && JSON.stringify(db.prepare("SELECT * FROM payments").all()).indexOf("56781234") < 0);
let u1 = (await e("GET", "/api/me")).body.user;
let rr = await W2.renewSubs(env, Date.now()); t("cron: nothing due yet", rr.paid === 0 && rr.failed === 0, rr);
const mails0 = mails.length;
rr = await W2.renewSubs(env, u1.paidUntil - 3600000); let u2 = (await e("GET", "/api/me")).body.user;
t("cron renews", rr.paid === 1 && u2.paidUntil >= u1.paidUntil + 29 * 86400000 && u2.sub.next === u2.paidUntil && mails.length === mails0 + 1, { rr, u1, u2 });
cardFails = 3;
for (let i = 0; i < 3; i++) await W2.renewSubs(env, u2.paidUntil + i * 86400000);
let u3 = (await e("GET", "/api/me")).body.user;
t("cron stops after 3 failures", u3.sub.status === "failed" && u3.paidUntil === u2.paidUntil && subCalls.some((x) => /expire$/.test(x.url)), u3);
r = await e("POST", "/api/sub/start", card); t("sub again after failure", r.status === 200 && r.body.user.sub.status === "active", r);
const expires0 = subCalls.filter((x) => /expire$/.test(x.url)).length;
r = await e("POST", "/api/sub/cancel"); t("cancel", r.status === 200 && r.body.user.sub.status === "canceled" && r.body.user.paidUntil > Date.now() && subCalls.filter((x) => /expire$/.test(x.url)).length === expires0 + 1, r);
t("cancel twice", (await e("POST", "/api/sub/cancel")).status === 404);
rr = await W2.renewSubs(env, Date.now() + 400 * 86400000); t("no charge after cancel", rr.paid === 0 && rr.failed === 0, rr);

// NICEPAY's webhook: a cancelled payment takes its days back (once), a cancelled subscription charge stops it
const hookPost = async (h) => { const r = await W.fetch(new Request(O + "/api/pay/hook", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(h) }), env); return { status: r.status, text: await r.text(), type: r.headers.get("content-type") }; };
const sig = async (tid, amount, ediDate) => hex(tid + amount + ediDate + env.NICEPAY_SECRET_KEY);
{ const f = jar(); await join(f, { email: "refund@mail.com", password: "12345678" });
  let o = (await f("POST", "/api/pay/order", { plan: "month" })).body;
  await post({ authResultCode: "0000", authResultMsg: "ok", tid: "TR1", clientId: "S2_test", orderId: o.orderId, amount: "4900", authToken: "TOK", signature: await hex("TOK" + "S2_test" + "4900" + env.NICEPAY_SECRET_KEY) });
  const before = (await f("GET", "/api/me")).body.user.paidUntil;
  const ed = "2026-10-02T15:00:00+0900";
  let hr = await hookPost({ tid: "TR1", status: "cancelled", amount: 4900, balanceAmt: 0, ediDate: ed, signature: "forged" });
  t("hook answers OK as text", hr.status === 200 && hr.text === "OK" && /text\/html/.test(hr.type), hr);
  t("hook: forged signature changes nothing", (await f("GET", "/api/me")).body.user.paidUntil === before);
  await hookPost({ tid: "TR1", status: "paid", amount: 4900, balanceAmt: 4900, ediDate: ed, signature: await sig("TR1", 4900, ed) });
  t("hook: paid event changes nothing", (await f("GET", "/api/me")).body.user.paidUntil === before);
  await hookPost({ tid: "TR1", status: "cancelled", amount: 4900, balanceAmt: 0, ediDate: ed, signature: await sig("TR1", 4900, ed) });
  t("hook: cancelled payment takes the pass back", before > Date.now() + 29 * 86400000 && (await f("GET", "/api/me")).body.user.paidUntil === 0 && db.prepare("SELECT status FROM payments WHERE tid = 'TR1'").get().status === "cancelled");
  // two months bought, one taken back: the other stays
  o = (await f("POST", "/api/pay/order", { plan: "month" })).body;
  await post({ authResultCode: "0000", authResultMsg: "ok", tid: "TR2", clientId: "S2_test", orderId: o.orderId, amount: "4900", authToken: "TOK", signature: await hex("TOK" + "S2_test" + "4900" + env.NICEPAY_SECRET_KEY) });
  o = (await f("POST", "/api/pay/order", { plan: "month" })).body;
  await post({ authResultCode: "0000", authResultMsg: "ok", tid: "TR3", clientId: "S2_test", orderId: o.orderId, amount: "4900", authToken: "TOK", signature: await hex("TOK" + "S2_test" + "4900" + env.NICEPAY_SECRET_KEY) });
  const two = (await f("GET", "/api/me")).body.user.paidUntil;
  await hookPost({ tid: "TR3", status: "cancelled", amount: 4900, balanceAmt: 0, ediDate: ed, signature: await sig("TR3", 4900, ed) });
  await hookPost({ tid: "TR3", status: "cancelled", amount: 4900, balanceAmt: 0, ediDate: ed, signature: await sig("TR3", 4900, ed) });
  const one = (await f("GET", "/api/me")).body.user.paidUntil;
  t("hook: only that payment, only once", Math.abs(two - one - 30 * 86400000) < 5, { two, one });
  // a subscription charge taken back: the days go and the subscription stops
  await f("POST", "/api/sub/start", card);
  const subTid = db.prepare("SELECT tid FROM payments WHERE plan = 'sub' AND user_id = (SELECT id FROM users WHERE email = 'refund@mail.com')").get().tid;
  const withSub = (await f("GET", "/api/me")).body.user;
  await hookPost({ tid: subTid, status: "cancelled", amount: 4900, balanceAmt: 0, ediDate: ed, signature: await sig(subTid, 4900, ed) });
  const afterSub = (await f("GET", "/api/me")).body.user;
  t("hook: subscription charge taken back stops it", afterSub.sub.status === "canceled" && Math.abs(withSub.paidUntil - afterSub.paidUntil - 30 * 86400000) < 5, { withSub, afterSub });
}

// refunds by the 1440 rules
{ const g = jar(), em = "rf@mail.com"; await join(g, { email: em, password: "12345678" });
  const uid = db.prepare("SELECT id FROM users WHERE email = ?").get(em).id;
  const buy = async (plan, tid) => { const o = (await g("POST", "/api/pay/order", { plan })).body; const amt = String(o.amount); await post({ authResultCode: "0000", authResultMsg: "ok", tid, clientId: "S2_test", orderId: o.orderId, amount: amt, authToken: "TOK", signature: await hex("TOK" + "S2_test" + amt + env.NICEPAY_SECRET_KEY) }); return o.orderId; };
  t("nothing to refund", (await g("GET", "/api/pay/refund")).body.quote === null);
  // 1. the same day: all of it, and the days go
  await buy("month", "RA1");
  let q = (await g("GET", "/api/pay/refund")).body.quote; t("same day quote", q.rule === "today" && q.refund === 4900 && q.daysBack === 30, q);
  r = await g("POST", "/api/pay/refund", { orderId: q.orderId });
  t("same day refund", r.status === 200 && r.body.refunded === 4900 && r.body.user.paidUntil === 0 && !cancels[cancels.length - 1].body.cancelAmt && cancels[cancels.length - 1].url.endsWith("/v1/payments/RA1/cancel"), r);
  const c1 = cancels[cancels.length - 1]; t("cancel signed", c1.body.signData === await hex("RA1" + c1.body.ediDate + env.NICEPAY_SECRET_KEY));
  // the webhook for that same cancel comes after: nothing more is taken
  const ed = "2026-10-02T16:00:00+0900"; await hookPost({ tid: "RA1", status: "cancelled", amount: 4900, balanceAmt: 0, ediDate: ed, signature: await sig("RA1", 4900, ed) });
  t("webhook after own refund does nothing", (await g("GET", "/api/me")).body.user.paidUntil === 0);
  // 2. a year pass, bought 100 days ago: the 265 unused days back
  await buy("year", "RA2");
  db.prepare("UPDATE payments SET paid_at = ? WHERE tid = 'RA2'").run(Date.now() - 100 * 86400000 - 3600000);
  db.prepare("UPDATE users SET paid_until = ? WHERE id = ?").run(Date.now() + 265 * 86400000 - 3600000, uid);
  q = (await g("GET", "/api/pay/refund")).body.quote; t("year prorate quote", q.rule === "prorate" && q.daysBack === 264 && q.refund === Math.floor(46000 * 264 / 365), q);
  r = await g("POST", "/api/pay/refund", { orderId: q.orderId }); t("year prorate refund", r.status === 200 && cancels[cancels.length - 1].body.cancelAmt === Math.floor(46000 * 264 / 365) && r.body.user.paidUntil > Date.now() && r.body.user.paidUntil < Date.now() + 86400000, r);
  t("prorated payment marked partial", db.prepare("SELECT status FROM payments WHERE tid = 'RA2'").get().status === "partial");
  t("stale refund refused", (await g("POST", "/api/pay/refund", { orderId: q.orderId })).status === 409);
  // 3. the subscription after its first day: like a pass, the unused days back, and it stops
  await g("POST", "/api/sub/start", card);
  db.prepare("UPDATE payments SET paid_at = ? WHERE plan = 'sub' AND user_id = ?").run(Date.now() - 5 * 86400000, uid);
  db.prepare("UPDATE users SET paid_until = ? WHERE id = ?").run(Date.now() + 25 * 86400000 + 3600000, uid);
  const nC = cancels.length;
  q = (await g("GET", "/api/pay/refund")).body.quote; t("sub quote: unused days", q.rule === "prorate" && q.daysBack === 25 && q.refund === Math.floor(4900 * 25 / 30), q);
  r = await g("POST", "/api/pay/refund", { orderId: q.orderId }); t("sub refund: unused days back, stopped", r.status === 200 && r.body.refunded === Math.floor(4900 * 25 / 30) && r.body.user.sub.status === "canceled" && r.body.user.paidUntil < Date.now() + 86400000 && cancels.length === nC + 1 && cancels[cancels.length - 1].body.cancelAmt === Math.floor(4900 * 25 / 30), r);
  t("nothing more after", (await g("GET", "/api/pay/refund")).body.quote === null);
  // 1 again, for the subscription: the same day gives all of it back
  r = await g("POST", "/api/sub/start", card); q = (await g("GET", "/api/pay/refund")).body.quote;
  r = await g("POST", "/api/pay/refund", { orderId: q.orderId }); t("sub same day: all back, stopped", q.rule === "today" && r.body.refunded === 4900 && r.body.user.sub.status === "canceled", { q, r });
}

// paying from the editor: back to the form that was being published, never to another site
{ const W3 = await import(pathToFileURL(copy).href);
  t("back: editor", W3.safeBack("/templates.html?edit=943&site=test&c=2") === "/templates.html?edit=943&site=test&c=2");
  t("back: no other host", W3.safeBack("//evil.com/x") === "/" && W3.safeBack("https://evil.com") === "/" && W3.safeBack("/templates.html?x=<s>") === "/" && W3.safeBack("") === "/");
  const h = jar(); await join(h, { email: "pub@mail.com", password: "12345678" });
  const o = (await h("POST", "/api/pay/order", { plan: "month", back: "/templates.html?edit=12&site=pub" })).body;
  t("order keeps back", o.back === "/templates.html?edit=12&site=pub", o);
  r = await post({ authResultCode: "0000", authResultMsg: "ok", tid: "TB1", clientId: "S2_test", orderId: o.orderId, amount: "4900", authToken: "TOK", mallReserved: o.back, signature: await hex("TOK" + "S2_test" + "4900" + env.NICEPAY_SECRET_KEY) });
  t("paid: back to the editor", r.to === "/templates.html?edit=12&site=pub&pay=ok", r);
  const o2 = (await h("POST", "/api/pay/order", { plan: "month", back: "/templates.html?edit=12&site=pub" })).body;
  r = await post({ authResultCode: "9999", authResultMsg: "취소", orderId: o2.orderId, mallReserved: "https://evil.com" });
  t("failed: never to another site", r.to.indexOf("/?pay=fail") === 0, r);
}
// sites: 이름.kor.gallery — the address, pictures (R2, by content), publishing, the page, and taking it down after the pass + 7 days
{ const W4 = await import(pathToFileURL(copy).href);
  const R2 = new Map(); env.MEDIA = { async head(k) { return R2.has(k) ? {} : null; }, async put(k, v, o) { R2.set(k, { v: new Uint8Array(v), type: o.httpMetadata.contentType }); }, async get(k) { const x = R2.get(k); return x ? { body: x.v, httpEtag: '"e"', writeHttpMetadata(h) { h.set("content-type", x.type); } } : null; }, async delete(k) { R2.delete(k); } };
  const SHELL = '<!doctype html><html><head><title>1440: 템플릿</title><meta name="description" content="x"><link rel="icon" href="data:old"></head><body></body></html>';
  env.STATIC = { async fetch(rq) { const u = new URL(rq.url); return u.pathname === "/templates" ? new Response(SHELL, { headers: { "content-type": "text/html" } }) : new Response("asset " + u.pathname); } };
  const site = (host, path = "/", method = "GET") => W.fetch(new Request("https://" + host + path, { method }), env);
  t("names: rules", W4.siteNameError("a") && W4.siteNameError("Ab") && W4.siteNameError("-ab") && W4.siteNameError("a--b") && W4.siteNameError("www") && W4.siteNameError("1440") && !W4.siteNameError("my-site2"));
  const s1 = jar(), s2 = jar(); await join(s1, { email: "site1@mail.com", password: "12345678" }); await join(s2, { email: "site2@mail.com", password: "12345678" });
  t("site: none yet", (await s1("GET", "/api/site")).body.site === null);
  r = await s1("POST", "/api/site/name", { name: "haneul" }); t("site: name taken", r.status === 200 && r.body.site.name === "haneul" && r.body.site.url === "https://haneul.kor.gallery", r);
  t("site: the same name for another account", (await s2("POST", "/api/site/name", { name: "haneul" })).status === 409);
  t("site: reserved name", (await s2("POST", "/api/site/name", { name: "admin" })).status === 400);
  r = await s1("POST", "/api/site/name", { name: "haneul-studio" }); t("site: one per account, renamed", r.body.site.name === "haneul-studio" && db.prepare("SELECT COUNT(*) AS n FROM sites WHERE user_id = (SELECT id FROM users WHERE email = 'site1@mail.com')").get().n === 1, r);
  t("site: old name free again", (await s2("POST", "/api/site/name", { name: "haneul" })).status === 200);
  // pictures
  const put = (j, bytes, type, extra = {}) => W.fetch(new Request(O + "/api/media", { method: "PUT", headers: { origin: O, "content-type": type, ...extra }, body: bytes }), env);
  // the jar keeps its cookie inside; a raw PUT needs it, so log in again through a fresh request that returns it
  const lr = await W.fetch(new Request(O + "/api/login", { method: "POST", headers: { origin: O, "content-type": "application/json" }, body: JSON.stringify({ email: "site1@mail.com", password: "12345678" }) }), env);
  const ck = lr.headers.get("set-cookie").split(";")[0];
  const img = new Uint8Array([255, 216, 255, 1, 2, 3]);
  r = await put(null, img, "image/jpeg", { cookie: ck }); let mu = (await r.json()).url;
  t("media: put by content", r.status === 200 && /^\/m\/[a-f0-9]{64}\.jpg$/.test(mu) && R2.has("m/" + mu.slice(3)), mu);
  t("media: same file, same name", (await (await put(null, img, "image/jpeg", { cookie: ck })).json()).url === mu && db.prepare("SELECT COUNT(*) AS n FROM media").get().n === 1);
  t("media: not a picture", (await put(null, img, "text/html", { cookie: ck })).status === 415);
  t("media: needs log-in", (await put(null, img, "image/jpeg")).status === 401);
  t("media: needs this site", (await W.fetch(new Request(O + "/api/media", { method: "PUT", headers: { "content-type": "image/jpeg", cookie: ck }, body: img }), env)).status === 403);
  t("media: too big", (await put(null, new Uint8Array(10 * 1048576 + 1), "image/png", { cookie: ck })).status === 413);
  // publishing needs a pass
  const snap = { n: 161, site: "haneul", s: { texts: { Work: "Works" }, photos: { "x-1": "u-1" }, title: "Haneul <studio>", desc: "Paintings", fav: "data:image/png;base64,AAAA" }, media: { "u-1": mu } };
  t("publish: needs a pass", (await s1("POST", "/api/site/publish", snap)).status === 402);
  db.prepare("UPDATE users SET paid_until = ? WHERE email = 'site1@mail.com'").run(Date.now() + 30 * 86400000);
  t("publish: someone else's picture", (await s1("POST", "/api/site/publish", { ...snap, media: { "u-1": "/m/" + "a".repeat(64) + ".jpg" } })).status === 400);
  t("publish: not our address", (await s1("POST", "/api/site/publish", { ...snap, media: { "u-1": "https://evil.com/x.jpg" } })).status === 400);
  r = await s1("POST", "/api/site/publish", snap); t("publish", r.status === 200 && r.body.site.published > 0 && r.body.site.n === 161, r);
  t("publish: no address yet", (await (async () => { const j = jar(); await join(j, { email: "site3@mail.com", password: "12345678" }); db.prepare("UPDATE users SET paid_until = ? WHERE email = 'site3@mail.com'").run(Date.now() + 86400000); return j("POST", "/api/site/publish", snap); })()).status === 409);
  // the page
  let res = await site("haneul-studio.kor.gallery"), html = await res.text();
  t("page: drawn", res.status === 200 && html.indexOf("window.SITE_VIEW=") > 0 && html.indexOf('"n":161') > 0, html.slice(0, 300));
  t("page: title, description, icon, preview", html.indexOf("<title>Haneul &lt;studio&gt;</title>") > 0 && html.indexOf('<meta name="description" content="Paintings">') > 0 && html.indexOf('<link rel="icon" href="data:image/png;base64,AAAA">') > 0 && html.indexOf('og:url" content="https://haneul-studio.kor.gallery/"') > 0, html);
  t("page: no raw < inside the data", html.slice(html.indexOf("window.SITE_VIEW=")).indexOf("<studio") < 0);
  res = await site("haneul-studio.kor.gallery", mu); t("page: picture from R2", res.status === 200 && res.headers.get("content-type") === "image/jpeg" && /immutable/.test(res.headers.get("cache-control")));
  t("page: assets from the static site", (await (await site("haneul-studio.kor.gallery", "/assets/templates.js")).text()) === "asset /assets/templates.js");
  t("page: unknown name", (await site("nobody.kor.gallery")).status === 404);
  t("page: claimed but not published", (await site("haneul.kor.gallery")).status === 404);
  t("page: www goes home", (await site("www.kor.gallery")).status === 301);
  { const bare = await site("kor.gallery", "/about"); t("page: the bare kor.gallery goes home", bare.status === 301 && bare.headers.get("location") === "https://1440.kor.gallery/"); }
  t("page: read only", (await site("haneul-studio.kor.gallery", "/", "POST")).status === 405);
  // the pass ends: up for 7 more days, then gone with its pictures
  db.prepare("UPDATE users SET paid_until = ? WHERE email = 'site1@mail.com'").run(Date.now() - 3 * 86400000);
  t("grace: still up 3 days after", (await site("haneul-studio.kor.gallery")).status === 200);
  t("grace: no new publishing", (await s1("POST", "/api/site/publish", snap)).status === 402);
  r = await W4.sweepSites(env); t("sweep: kept within 7 days (an address held without a pass is freed)", R2.size === 1 && !!db.prepare("SELECT 1 FROM sites WHERE name = 'haneul-studio'").get() && !db.prepare("SELECT 1 FROM sites WHERE name = 'haneul'").get(), r);
  db.prepare("UPDATE users SET paid_until = ? WHERE email = 'site1@mail.com'").run(Date.now() - 8 * 86400000);
  t("grace over: down", (await site("haneul-studio.kor.gallery")).status === 404);
  r = await W4.sweepSites(env); t("sweep: site and pictures deleted", r.gone >= 1 && R2.size === 0 && !db.prepare("SELECT 1 FROM sites WHERE name = 'haneul-studio'").get() && !db.prepare("SELECT 1 FROM media WHERE key = ?").get(mu.slice(3)), r);
  // old records the privacy policy promises to drop: failed log-ins after 30 days, unfinished sign-ups after a day
  db.prepare("INSERT INTO attempts (key, at) VALUES ('old', ?), ('new', ?)").run(Date.now() - 31 * 86400000, Date.now());
  db.prepare("INSERT INTO admin_log (at, admin, action) VALUES (?, 'old@x', 'GET /x'), (?, 'new@x', 'GET /x')").run(Date.now() - 731 * 86400000, Date.now() - 700 * 86400000);
  db.prepare("INSERT OR REPLACE INTO signups (email, pass, code, expires, sent) VALUES ('gone@mail.com', 'x', 'x', 0, ?)").run(Date.now() - 2 * 86400000);
  await W4.sweepSites(env);
  t("cleanup: old records gone, new kept", !db.prepare("SELECT 1 FROM attempts WHERE key = 'old'").get() && !!db.prepare("SELECT 1 FROM attempts WHERE key = 'new'").get() && !db.prepare("SELECT 1 FROM signups WHERE email = 'gone@mail.com'").get());
  t("cleanup: admin log kept two years", !db.prepare("SELECT 1 FROM admin_log WHERE admin = 'old@x'").get() && !!db.prepare("SELECT 1 FROM admin_log WHERE admin = 'new@x'").get());
  // a pass ending: one mail 3 days before, one on the day it ends; a subscription gets none
  { const nj = jar(); await join(nj, { email: "note@mail.com", password: "12345678" });
    const nid = db.prepare("SELECT id FROM users WHERE email = 'note@mail.com'").get().id;
    db.prepare("INSERT INTO sites (name, user_id, n, data, published, created) VALUES ('noted', ?, 5, '{}', ?, ?)").run(nid, Date.now(), Date.now());
    const sent = () => mails.filter((m) => m.to[0] === "note@mail.com" && /이용권/.test(m.subject)).length;
    db.prepare("UPDATE users SET paid_until = ? WHERE id = ?").run(Date.now() + 10 * 86400000, nid); await W4.sweepSites(env);
    t("notice: none 10 days before", sent() === 0);
    db.prepare("UPDATE users SET paid_until = ? WHERE id = ?").run(Date.now() + 2 * 86400000, nid); await W4.sweepSites(env); await W4.sweepSites(env);
    t("notice: once, 3 days before", sent() === 1 && /곧 끝나요/.test(mails.filter((m) => m.to[0] === "note@mail.com" && /이용권/.test(m.subject))[0].subject));
    db.prepare("UPDATE users SET paid_until = ? WHERE id = ?").run(Date.now() - 3600000, nid); await W4.sweepSites(env); await W4.sweepSites(env);
    const last = mails.filter((m) => m.to[0] === "note@mail.com").pop();
    t("notice: once, when it ends (with the delete date)", sent() === 2 && /끝났어요/.test(last.subject) && /noted\.kor\.gallery/.test(last.text), last);
    db.prepare("DELETE FROM sites WHERE user_id = ?").run(nid); }
  // leaving (탈퇴): password; site, pictures, account gone; payments stay; the school month is not given twice
  { const lv = jar(); await join(lv, { email: "leave@korea.ac.kr", password: "12345678", student: true });
    const lid = db.prepare("SELECT id FROM users WHERE email = 'leave@korea.ac.kr'").get().id;
    db.prepare("INSERT INTO payments (order_id, user_id, plan, amount, status, created) VALUES ('keep-me', ?, 'month', 4900, 'paid', ?)").run(lid, Date.now());
    await lv("POST", "/api/site/name", { name: "leaving" });
    const lck = (await W.fetch(new Request(O + "/api/login", { method: "POST", headers: { origin: O, "content-type": "application/json" }, body: JSON.stringify({ email: "leave@korea.ac.kr", password: "12345678" }) }), env)).headers.get("set-cookie").split(";")[0];
    const lu = await (await W.fetch(new Request(O + "/api/media", { method: "PUT", headers: { origin: O, "content-type": "image/png", cookie: lck }, body: new Uint8Array([137, 80, 78, 71, 9]) }), env)).json();
    t("leave: wrong password", (await lv("POST", "/api/me/delete", { password: "nope" })).status === 403);
    r = await lv("POST", "/api/me/delete", { password: "12345678" });
    t("leave: done", r.status === 200 && !db.prepare("SELECT 1 FROM users WHERE id = ?").get(lid) && !db.prepare("SELECT 1 FROM sites WHERE user_id = ?").get(lid) && !db.prepare("SELECT 1 FROM media WHERE user_id = ?").get(lid) && !R2.has("m/" + lu.url.slice(3)), r);
    t("leave: logged out", (await lv("GET", "/api/me")).body.user === null);
    t("leave: payment record kept", !!db.prepare("SELECT 1 FROM payments WHERE order_id = 'keep-me'").get());
    const again = jar(); await join(again, { email: "leave@korea.ac.kr", password: "12345678", student: true });
    t("leave: same school address, no second free month", (await again("GET", "/api/me")).body.user.trialUntil === 0); }
  // 1440.kor.gallery itself is still the static site
  t("1440 stays static", (await (await W.fetch(new Request(O + "/assets/site.css"), env)).text()) === "asset /assets/site.css");
  delete env.MEDIA; delete env.STATIC;
}
// the admin's usage page: our own counts always; Cloudflare's numbers only with a token (here none)
r = await boss("GET", "/api/admin/usage");
t("usage: admin sees counts", r.status === 200 && r.body.now.mailDay > 0 && r.body.series.mail.length === 14 && r.body.now.users > 0 && r.body.free.workers === 100000 && r.body.errors.workers === "token", r.body);
t("usage: admin only", (await a("GET", "/api/admin/usage")).status === 403);
console.log(ok + " passed, " + bad + " failed");
if (bad) process.exit(1);
