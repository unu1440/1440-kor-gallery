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
globalThis.fetch = async (url, init) => { mails.push(JSON.parse(init.body)); return new Response("{}", { status: 200 }); };
const env = { DB: D1, RESEND_API_KEY: "x", ADMIN_EMAILS: "boss@kor.gallery", SITE_ORIGIN: "https://1440.kor.gallery" };
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
t("dup nick", (await c("POST", "/api/signup", { nick: "LEE", email: "x@y.com", password: "12345678" })).status === 409);
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
r = await boss("GET", "/api/admin/students"); t("list", r.body.requests.length === 1 && r.body.users.length === 3, r);
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
console.log(ok + " passed, " + bad + " failed");
if (bad) process.exit(1);
