/* 1440 accounts on the page side: shared by the first page and the editor.
   When the accounts server (api/worker.js on /api) answers, everything goes there. Until it is deployed (and on the
   local preview) accounts live only in this browser, so sign-up and log-in can be tried; the university code is then
   shown on screen instead of being mailed. The hub (the form last edited and the forms kept in 홈) is kept for a
   guest too, and joins the account when the guest logs in or signs up: the newest form wins. */
(function () {
  var ADMIN = ["1440unu@kor.gallery"], DAY = 86400000, MONTH = 30 * DAY;
  var UNI = /(^|\.)(ac\.[a-z]{2}|edu(\.[a-z]{2})?)$/i, EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i, NICK = /^[\p{L}\p{N}_.-]{2,20}$/u;
  var LKEY = "1440-acct", SKEY = "1440-acct-sid", GKEY = "1440-guest";
  var mode = "local", me = null, subs = [];
  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function emit() { subs.forEach(function (f) { try { f(me); } catch (e) {} }); }
  function err(m) { var e = new Error(m); e.userMessage = m; return e; }

  /* ---------- the hub: which form, and the forms in 홈 ---------- */
  function cleanState(s) {
    s = s && typeof s === "object" ? s : {};
    var home = Array.isArray(s.home) ? s.home.filter(function (f) { return f && +f.n >= 1 && +f.n <= 1440; }).slice(0, 60) : [];
    /* projects: folders in My hub that hold forms (a form names its project with p) */
    var projects = Array.isArray(s.projects) ? s.projects.filter(function (p) { return p && p.id && p.name; }).slice(0, 40) : [];
    return { last: s.last && +s.last.n ? s.last : null, home: home, projects: projects };
  }
  function sameForm(a, b) { return a && b && +a.n === +b.n && (a.site || "") === (b.site || "") && (a.c || "") === (b.c || ""); }
  function merge(a, b) {
    a = cleanState(a); b = cleanState(b);
    var last = !a.last ? b.last : !b.last ? a.last : (a.last.t || 0) >= (b.last.t || 0) ? a.last : b.last, home = a.home.slice();
    b.home.forEach(function (f) { if (!home.some(function (x) { return sameForm(x, f); })) home.push(f); });
    var projects = a.projects.slice(); b.projects.forEach(function (p) { if (!projects.some(function (x) { return x.id === p.id; })) projects.push(p); });
    return { last: last, home: home, projects: projects };
  }
  function stateNow() { return me ? cleanState(me.state) : cleanState(get(GKEY, {})); }
  var saveT = 0;
  function saveState(s) {
    s = cleanState(s);
    if (!me) { put(GKEY, s); emit(); return; }
    me.state = s;
    if (mode === "local") { var db = ldb(); if (db.users[me.id]) { db.users[me.id].state = s; put(LKEY, db); } }
    else { clearTimeout(saveT); saveT = setTimeout(function () { api("PUT", "/api/me/state", { state: s }).catch(function () {}); }, 400); }
    emit();
  }
  /* the editor calls this whenever a form is opened */
  function touch(n, site, c) {
    var s = stateNow(), f = { n: +n, site: site || "", c: c || "", t: Date.now() };
    s.last = f; put(BKEY, f);
    if (!s.home.some(function (x) { return sameForm(x, f); })) s.home.unshift({ n: f.n, site: f.site, c: f.c });
    saveState(s);
  }
  function formUrl(f) { return "templates.html?edit=" + f.n + (f.site ? "&site=" + encodeURIComponent(f.site) : "") + (f.c ? "&c=" + encodeURIComponent(f.c) : ""); }
  /* My hub: the form edited last. The account remembers it; this browser remembers it too (the last form opened here, and
     when each draft was last saved), so a person who logs in after editing still lands in the editor. Only someone who has
     never opened a form goes to the list of forms. */
  var BKEY = "1440-last", EKEY = "1440-edited", DEFNAME = "loremipsum";
  function fromKey(k) { var m = /^1440-edit-(\d+)-(.+?)(?:~([a-z0-9]+))?$/i.exec(k); if (!m || !(+m[1] >= 1 && +m[1] <= 1440)) return null; return { n: +m[1], site: m[2] === DEFNAME ? "" : m[2], c: m[3] || "" }; }
  function browserLast() {
    var ed = get(EKEY, {}), best = null, bt = -1, k;
    for (k in ed) { var f = fromKey(k); if (f && ed[k] > bt && localStorage.getItem(k) != null) { best = f; bt = ed[k]; f.t = ed[k]; } }
    var b = get(BKEY, null); if (b && +b.n && (!best || (b.t || 0) >= bt)) best = b;
    if (best) return best;
    try { for (var i = 0; i < localStorage.length; i++) { var f2 = fromKey(localStorage.key(i)); if (f2) return f2; } } catch (e) {}
    return null;
  }
  function lastForm() { var a = stateNow().last, b = browserLast(); return !a ? b : !b ? a : (b.t || 0) > (a.t || 0) ? b : a; }
  function hubUrl() { var l = lastForm(); return l ? formUrl(l) : "templates.html"; }

  /* ---------- the server ---------- */
  function api(method, path, data) {
    return fetch(path, { method: method, credentials: "same-origin", headers: data ? { "content-type": "application/json" } : {}, body: data ? JSON.stringify(data) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw err(j.error || "잠시 문제가 생겼어요."); return j; }); });
  }

  /* ---------- this browser only (before the server is up) ---------- */
  function ldb() { var d = get(LKEY, null); if (!d || !d.users) d = { users: {}, requests: [], codes: {} }; return d; }
  function b64(buf) { var s = ""; new Uint8Array(buf).forEach(function (c) { s += String.fromCharCode(c); }); return btoa(s); }
  function hash(pass, salt) {
    var te = new TextEncoder();
    return crypto.subtle.importKey("raw", te.encode(pass), "PBKDF2", false, ["deriveBits"])
      .then(function (k) { return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: te.encode(salt), iterations: 100000 }, k, 256); }).then(b64);
  }
  /* the name in the header: the part of the e-mail before @, made unique */
  function nickFrom(email, taken) {
    var base = (String(email).split("@")[0].match(/[\p{L}\p{N}_.-]/gu) || []).join("").slice(0, 16); if (base.length < 2) base = "user";
    for (var i = 1; i < 500; i++) { var x = i === 1 ? base : base + i; if (!taken(x)) return x; }
    return base + Date.now().toString(36).slice(-4);
  }
  function pub(u) { return { id: u.id, nick: u.nick, email: u.email, role: u.role || "user", student: u.student || "none", uniEmail: u.uniEmail || "", trialUntil: u.trialUntil || 0, paidUntil: 0, state: cleanState(u.state), admin: ADMIN.indexOf(u.email) >= 0 }; }
  function lme() { var id = get(SKEY, null), db = ldb(); return id && db.users[id] ? pub(db.users[id]) : null; }
  function need() { if (!me) throw err("로그인해 주세요."); }
  var L = {
    signup: function (d) {
      var db = ldb(), email = String(d.email || "").trim().toLowerCase();
      if (!EMAIL.test(email)) return Promise.reject(err("이메일 주소를 확인해 주세요."));
      if (d.student && !UNI.test(email.split("@")[1])) return Promise.reject(err("대학생은 학교 메일(.ac.kr, .edu 등)로만 가입할 수 있어요."));
      var taken = {}; for (var k0 in db.users) taken[db.users[k0].nick.toLowerCase()] = 1;
      var nick = nickFrom(email, function (x) { return taken[x.toLowerCase()]; });
      if (String(d.password || "").length < 8) return Promise.reject(err("비밀번호는 8자 이상이에요."));
      for (var k in db.users) if (db.users[k].email === email) return Promise.reject(err("이미 가입한 이메일이에요."));
      var id = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), salt = id;
      return hash(d.password, salt).then(function (h) {
        db = ldb(); db.users[id] = { id: id, email: email, nick: nick, pass: h, salt: salt, state: cleanState(d.state), created: Date.now() }; put(LKEY, db); put(SKEY, id);
        return { user: pub(db.users[id]) };
      });
    },
    login: function (d) {
      var db = ldb(), email = String(d.email || "").trim().toLowerCase(), u = null;
      for (var k in db.users) if (db.users[k].email === email) u = db.users[k];
      if (!u) return Promise.reject(err("이메일이나 비밀번호가 맞지 않아요."));
      return hash(String(d.password || ""), u.salt).then(function (h) { if (h !== u.pass) throw err("이메일이나 비밀번호가 맞지 않아요."); put(SKEY, u.id); return { user: pub(u) }; });
    },
    logout: function () { try { localStorage.removeItem(SKEY); } catch (e) {} return Promise.resolve({}); },
    send: function (uni) {
      need(); var db = ldb(), u = db.users[me.id]; uni = String(uni || "").trim().toLowerCase();
      if (u.student === "verified") return Promise.reject(err("이미 확인했어요."));
      if (!EMAIL.test(uni)) return Promise.reject(err("학교 메일 주소를 확인해 주세요."));
      if (!UNI.test(uni.split("@")[1])) return Promise.reject(err("대학 메일(.ac.kr, .edu 등)이 아니에요. 아래 '관리자 확인 요청'을 써 주세요."));
      for (var k in db.users) if (k !== u.id && db.users[k].uniEmail === uni) return Promise.reject(err("이 학교 메일은 이미 다른 계정이 썼어요."));
      var code = String(100000 + Math.floor(Math.random() * 900000));
      db.codes[u.id] = { uni: uni, code: code, expires: Date.now() + 600000, tries: 0 }; put(LKEY, db);
      return Promise.resolve({ ok: true, devCode: code });
    },
    verify: function (code) {
      need(); var db = ldb(), c = db.codes[me.id], u = db.users[me.id];
      if (!c || c.expires < Date.now()) return Promise.reject(err("코드가 없거나 시간이 지났어요. 다시 보내 주세요."));
      if (c.tries >= 5) return Promise.reject(err("여러 번 틀렸어요. 코드를 다시 보내 주세요."));
      if (String(code || "").trim() !== c.code) { c.tries++; put(LKEY, db); return Promise.reject(err("코드가 맞지 않아요.")); }
      u.uniEmail = c.uni; u.student = "verified"; u.trialUntil = Math.max(u.trialUntil || 0, Date.now()) + MONTH; delete db.codes[me.id]; put(LKEY, db);
      return Promise.resolve({ ok: true, trialUntil: u.trialUntil });
    },
    request: function (d) {
      need(); var db = ldb(), u = db.users[me.id], uni = String(d.uniEmail || "").trim().toLowerCase(), school = String(d.school || "").trim();
      if (!EMAIL.test(uni) || !school) return Promise.reject(err("학교 이름과 학교 메일을 적어 주세요."));
      if (db.requests.some(function (r) { return r.userId === u.id && r.status === "pending"; })) return Promise.reject(err("이미 요청했어요. 확인되면 알려 드려요."));
      db.requests.unshift({ id: "r" + Date.now().toString(36), userId: u.id, uniEmail: uni, school: school, status: "pending", created: Date.now() }); u.student = "pending"; put(LKEY, db);
      return Promise.resolve({ ok: true });
    },
    list: function () {
      var db = ldb(), users = Object.keys(db.users).map(function (k) { var u = db.users[k]; return { id: u.id, nick: u.nick, email: u.email, uni_email: u.uniEmail || "", student: u.student || "none", trial_until: u.trialUntil || 0, created: u.created }; });
      var reqs = db.requests.map(function (r) { var u = db.users[r.userId] || {}; return { id: r.id, uni_email: r.uniEmail, school: r.school, status: r.status, created: r.created, user_id: r.userId, nick: u.nick, email: u.email }; });
      return Promise.resolve({ requests: reqs, users: users.sort(function (a, z) { return z.created - a.created; }) });
    },
    decide: function (id, ok) {
      var db = ldb(), r = db.requests.filter(function (x) { return x.id === id; })[0]; if (!r || r.status !== "pending") return Promise.reject(err("없거나 이미 처리한 요청이에요."));
      var u = db.users[r.userId]; r.status = ok ? "approved" : "denied";
      if (u) { if (ok) { u.uniEmail = r.uniEmail; u.student = "verified"; u.trialUntil = Math.max(u.trialUntil || 0, Date.now()) + MONTH; } else u.student = "none"; }
      put(LKEY, db); return Promise.resolve({ ok: true });
    },
    grant: function (userId, days) { var db = ldb(), u = db.users[userId]; if (!u) return Promise.reject(err("그런 사용자가 없어요.")); u.trialUntil = days > 0 ? Math.max(u.trialUntil || 0, Date.now()) + days * DAY : 0; put(LKEY, db); return Promise.resolve({ ok: true, trialUntil: u.trialUntil }); }
  };

  /* ---------- one face for both ---------- */
  function adminOnly() { if (!me || !me.admin) return Promise.reject(err("관리자만 할 수 있어요.")); return null; }
  function take(res) { me = res && res.user ? res.user : me; return res; }
  /* a guest who logs in brings the forms they were working on */
  function adopt(res) {
    var g = cleanState(get(GKEY, {})); take(res);
    if (me && (g.last || g.home.length || g.projects.length)) { var s = merge(me.state, g); me.state = s; saveState(s); try { localStorage.removeItem(GKEY); } catch (e) {} }
    emit(); return me;
  }
  var A = {
    get mode() { return mode; },
    get user() { return me; },
    ready: null,
    on: function (f) { subs.push(f); },
    signup: function (d) { var g = cleanState(get(GKEY, {})); d = { email: d.email, password: d.password, student: !!d.student, state: g }; return (mode === "server" ? api("POST", "/api/signup", d) : L.signup(d)).then(adopt); },
    login: function (d) { return (mode === "server" ? api("POST", "/api/login", d) : L.login(d)).then(adopt); },
    logout: function () { return (mode === "server" ? api("POST", "/api/logout", {}) : L.logout()).then(function () { me = null; emit(); }); },
    refresh: function () { return (mode === "server" ? api("GET", "/api/me") : Promise.resolve({ user: lme() })).then(function (r) { me = r.user || null; emit(); return me; }); },
    sendCode: function (uni) { return mode === "server" ? api("POST", "/api/student/send", { uniEmail: uni }) : L.send(uni); },
    verifyCode: function (code) { return (mode === "server" ? api("POST", "/api/student/verify", { code: code }) : L.verify(code)).then(function (r) { return A.refresh().then(function () { return r; }); }); },
    request: function (d) { return (mode === "server" ? api("POST", "/api/student/request", d) : L.request(d)).then(function (r) { return A.refresh().then(function () { return r; }); }); },
    admin: {
      list: function () { return adminOnly() || (mode === "server" ? api("GET", "/api/admin/students") : L.list()); },
      decide: function (id, ok) { return adminOnly() || (mode === "server" ? api("POST", "/api/admin/decide", { id: id, approve: ok }) : L.decide(id, ok)); },
      grant: function (userId, days) { return adminOnly() || (mode === "server" ? api("POST", "/api/admin/grant", { userId: userId, days: days }) : L.grant(userId, days)); }
    },
    state: stateNow, saveState: saveState, touch: touch, hubUrl: hubUrl, formUrl: formUrl, sameForm: sameForm,
    /* paying (only with the server): the server makes the order, NICEPAY's window takes the card, the server approves */
    /* the easy pays the one-off pass can be paid with (the server knows which are signed with NICEPAY) */
    payMethods: function () {
      var dflt = [{ method: "naverpayCard", name: "네이버페이" }, { method: "kakaopay", name: "카카오페이" }, { method: "samsungpayCard", name: "삼성페이" }, { method: "payco", name: "페이코" }, { method: "ssgpay", name: "SSG페이" }];
      return mode === "server" ? api("GET", "/api/pay/plans").then(function (r) { return r.methods || dflt; }, function () { return dflt; }) : Promise.resolve(dflt);
    },
    pay: function (plan, method) {
      if (mode !== "server") return Promise.reject(err("결제는 1440.kor.gallery에서 할 수 있어요."));
      return api("POST", "/api/pay/order", { plan: plan, method: method }).then(function (o) {
        return loadPay().then(function () {
          return new Promise(function (done, no) {
            window.AUTHNICE.requestPay({ clientId: o.clientId, method: o.method, skinType: "gray", logoImgUrl: location.origin + "/assets/logo-pay.png", orderId: o.orderId, amount: o.amount, goodsName: o.goodsName, returnUrl: o.returnUrl, buyerEmail: o.buyerEmail, buyerName: o.buyerName,
              fnError: function (r) { no(err((r && r.errorMsg) || "결제창을 닫았어요.")); } });
            done();
          });
        });
      });
    },
    /* the monthly subscription: the card goes to our server once (over HTTPS) and on to NICEPAY as a billing key */
    subscribe: function (card) {
      if (mode !== "server") return Promise.reject(err("결제는 1440.kor.gallery에서 할 수 있어요."));
      return api("POST", "/api/sub/start", card).then(function (r) { me = r.user || me; emit(); return me; });
    },
    unsubscribe: function () {
      if (mode !== "server") return Promise.reject(err("결제는 1440.kor.gallery에서 할 수 있어요."));
      return api("POST", "/api/sub/cancel", {}).then(function (r) { me = r.user || me; emit(); return me; });
    },
    payments: function () { return mode === "server" ? api("GET", "/api/pay/history") : Promise.resolve({ payments: [] }); },
    isUni: function (email) { return UNI.test(String(email).split("@")[1] || ""); }
  };
  var payJs = null;
  function loadPay() {
    if (window.AUTHNICE) return Promise.resolve();
    return payJs || (payJs = new Promise(function (done, no) { var sc = document.createElement("script"); sc.src = "https://pay.nicepay.co.kr/v1/js/"; sc.onload = done; sc.onerror = function () { payJs = null; no(err("결제창을 불러오지 못했어요.")); }; document.head.appendChild(sc); }));
  }
  /* is the server there? (the static preview answers /api with a plain 404 page) */
  A.ready = new Promise(function (done) {
    var t = setTimeout(function () { done(); }, 2500);
    fetch("/api/health", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.ok) mode = "server"; }).catch(function () {}).then(function () { clearTimeout(t); done(); });
  }).then(function () { return A.refresh().catch(function () { me = null; return null; }); });
  /* another tab logged in or out */
  window.addEventListener("storage", function (e) { if (mode === "local" && (e.key === SKEY || e.key === LKEY)) A.refresh(); else if (e.key === GKEY && !me) emit(); });
  window.ACCOUNT = A;
})();
