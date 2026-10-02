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
const subCalls = []; let cardFails = 0;
import crypto2 from "node:crypto";
function openCard(hexData, secret) { const d = crypto2.createDecipheriv("aes-256-cbc", Buffer.from(secret.slice(0, 32)), Buffer.from(secret.slice(0, 16))); return Buffer.concat([d.update(Buffer.from(hexData, "hex")), d.final()]).toString(); }
globalThis.fetch = async (url, init) => {
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
let ok = 0, bad = 0; const t = (name, cond, extra) => { if (cond) ok++; else { bad++; console.log("✗", name, JSON.stringify(extra || "")); } };

const a = jar(), boss = jar(), c = jar();
let r = await a("POST", "/api/signup", { nick: "lee", email: "Lee@Mail.com", password: "12345678", state: { last: { n: 12, site: "lee", t: 1 } } });
t("signup", r.status === 200 && r.body.user.nick === "lee" && r.body.user.email === "lee@mail.com" && r.body.user.state.last.n === 12, r);
t("dup email", (await c("POST", "/api/signup", { nick: "other", email: "lee@mail.com", password: "12345678" })).status === 409);
r = await jar()("POST", "/api/signup", { email: "lee@other.com", password: "12345678" }); t("nick from e-mail, made unique", r.status === 200 && r.body.user.nick === "lee2", r);
t("student needs a school address", (await jar()("POST", "/api/signup", { email: "s@gmail.com", password: "12345678", student: true })).status === 400);
r = await jar()("POST", "/api/signup", { email: "s@korea.ac.kr", password: "12345678", student: true }); t("student school address", r.status === 200 && r.body.user.nick === "s" + "" || r.body.user.nick === "user", r);
t("short pass", (await c("POST", "/api/signup", { nick: "kim", email: "k@y.com", password: "123" })).status === 400);
t("me", (await a("GET", "/api/me")).body.user.nick === "lee");
t("anon me", (await c("GET", "/api/me")).body.user === null);
t("cross origin", (await a("POST", "/api/logout", {}, { origin: "https://evil.com" })).status === 403);
t("not json", (await a("POST", "/api/logout", {}, { "content-type": "text/plain" })).status === 415);
t("state", (await a("PUT", "/api/me/state", { state: { last: { n: 99, site: "lee", t: 2 }, home: [{ n: 99 }] } })).status === 200);
t("state read", (await a("GET", "/api/me")).body.user.state.last.n === 99);
// student
t("non-uni", (await a("POST", "/api/student/send", { uniEmail: "me@gmail.com" })).status === 422);
r = await a("POST", "/api/student/send", { uniEmail: "me@snu.ac.kr" }); t("send", r.status === 200, r);
const code = mails[0] && /(\d{6})/.exec(mails[0].subject)[1]; t("mail", !!code && mails[0].to[0] === "me@snu.ac.kr");
t("send again too soon", (await a("POST", "/api/student/send", { uniEmail: "me@snu.ac.kr" })).status === 429);
t("wrong code", (await a("POST", "/api/student/verify", { code: "000000" })).status === 400);
r = await a("POST", "/api/student/verify", { code }); t("verify", r.status === 200 && r.body.trialUntil > Date.now() + 29 * 86400000, r);
t("me student", (await a("GET", "/api/me")).body.user.student === "verified");
// the same address on another account
await c("POST", "/api/signup", { nick: "kim", email: "kim@mail.com", password: "abcdefgh" });
t("uni reused", (await c("POST", "/api/student/send", { uniEmail: "me@snu.ac.kr" })).status === 409);
r = await c("POST", "/api/student/request", { uniEmail: "kim@artschool.kr", school: "Art School" }); t("request", r.status === 200, r);
t("request twice", (await c("POST", "/api/student/request", { uniEmail: "kim@artschool.kr", school: "Art School" })).status === 400);
t("not admin", (await c("GET", "/api/admin/students")).status === 403);
// admin
await boss("POST", "/api/signup", { nick: "boss", email: "boss@kor.gallery", password: "bossboss" });
t("admin flag", (await boss("GET", "/api/me")).body.user.admin === true);
r = await boss("GET", "/api/admin/students"); t("list", r.body.requests.length === 1 && r.body.users.length === 5, r);
r = await boss("POST", "/api/admin/decide", { id: r.body.requests[0].id, approve: true }); t("approve", r.status === 200, r);
t("kim verified", (await c("GET", "/api/me")).body.user.student === "verified");
const kimId = (await c("GET", "/api/me")).body.user.id;
r = await boss("POST", "/api/admin/grant", { userId: kimId, days: 0 }); t("revoke", r.status === 200 && r.body.trialUntil === 0, r);
r = await boss("POST", "/api/admin/grant", { userId: kimId, days: 30 }); t("grant", r.body.trialUntil > Date.now(), r);
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
t("easy pay only", (await a("POST", "/api/pay/order", { plan: "month", method: "card" })).status === 400 && (await a("POST", "/api/pay/order", { plan: "month" })).status === 400);
r = await a("GET", "/api/pay/plans"); t("easy pay list", r.body.methods.map((x) => x.method).join() === "naverpayCard,kakaopay,samsungpayCard,payco,ssgpay", r);
env.NICEPAY_EASYPAY = "kakaopay, naverpayCard"; t("easy pay narrowed", (await a("GET", "/api/pay/plans")).body.methods.length === 2 && (await a("POST", "/api/pay/order", { plan: "month", method: "payco" })).status === 400); delete env.NICEPAY_EASYPAY;
r = await a("POST", "/api/pay/order", { plan: "month", method: "kakaopay" }); t("order", r.body.method === "kakaopay" && r.status === 200 && r.body.amount === 4900 && r.body.clientId === "S2_test" && /\/api\/pay\/return$/.test(r.body.returnUrl), r);
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
const e = jar(); await e("POST", "/api/signup", { email: "sub@mail.com", password: "12345678" });
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
console.log(ok + " passed, " + bad + " failed");
if (bad) process.exit(1);
