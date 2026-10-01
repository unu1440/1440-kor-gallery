/* The first page's account layer. "Login" sits to the right of "Information"; it opens a layer like Information
   (words only, arriving out of a blur) with Log in and Sign up. Once in, the header shows the nickname instead, and
   pointing at it brings up "My hub" (the form edited last). Pressing the nickname opens the account: the free month,
   the student check (a code to a university address, or a request the admin looks at) and, for the admin, the
   requests and every account's free month. */
(function () {
  var A = window.ACCOUNT; if (!A) return;
  var ov = document.getElementById("acctOv"), slot = document.getElementById("acctSlot"); if (!ov || !slot) return;
  var side = [].slice.call(ov.querySelectorAll(".info-side [data-to]")), pages = [].slice.call(ov.querySelectorAll(".info-page"));
  function $(s, r) { return (r || ov).querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function day(ms) { var d = new Date(ms); return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0"); }
  function trialText(u) { return u.trialUntil > Date.now() ? day(u.trialUntil) + "까지" : "없음"; }
  var STU = { none: "안 함", pending: "관리자 확인 중", verified: "확인됨" };

  function isOpen() { return ov.classList.contains("open"); }
  function setOpen(on, page) {
    if (on && window.SITE_INFO) window.SITE_INFO.close();
    ov.classList.toggle("open", on); ov.setAttribute("aria-hidden", String(!on)); document.body.classList.toggle("acct-open", on);
    var l = document.getElementById("loginLink") || document.getElementById("nickLink"); if (l) l.setAttribute("aria-expanded", String(on));
    if (on) { show(page || (A.user ? "account" : "login")); ov.scrollTop = 0; }
  }
  function show(id) {
    var me = A.user;
    if (!me && /^(account|student|admin)$/.test(id)) id = "login";
    if (me && /^(login|signup)$/.test(id)) id = "account";
    if (id === "admin" && !(me && me.admin)) id = "account";
    pages.forEach(function (p) { p.classList.toggle("on", p.id === "a-" + id); });
    side.forEach(function (a) { a.classList.toggle("on", a.dataset.to === id); });
    if (id === "account" || id === "student") fill();
    if (id === "admin") admin();
    var f = $("#a-" + id + " input:not([type=checkbox])"); if (f && isOpen() && matchMedia("(hover: hover)").matches) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 350);
  }
  window.ACCT_UI = { close: function () { if (isOpen()) setOpen(false); }, open: setOpen };

  /* the header: Login, or the nickname with My hub under it */
  function header() {
    var me = A.user;
    ov.classList.toggle("in", !!me); ov.classList.toggle("is-admin", !!(me && me.admin));
    if (!me) slot.innerHTML = '<a href="#" id="loginLink" aria-expanded="' + isOpen() + '" aria-controls="acctOv">Login</a>';
    else slot.innerHTML = '<a href="#" id="nickLink" class="nick" aria-expanded="' + isOpen() + '" aria-controls="acctOv" title="계정">' + esc(me.nick) + '</a><a class="hub" href="' + esc(A.hubUrl()) + '">My hub</a>';
    var l = slot.firstChild;
    l.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      /* a touch screen has no pointing: the first tap shows My hub, the next opens the account */
      if (me && !matchMedia("(hover: hover)").matches && !slot.classList.contains("peek") && !isOpen()) { slot.classList.add("peek"); return; }
      slot.classList.remove("peek"); setOpen(!isOpen());
    });
  }
  document.addEventListener("click", function (e) { if (!e.target.closest("#acctSlot")) slot.classList.remove("peek"); });

  function fill() {
    var me = A.user; if (!me) return;
    $('[data-v="nick"]').textContent = me.nick;
    $('[data-v="email"]').textContent = me.email;
    $('[data-v="trial"]').textContent = trialText(me);
    $('[data-v="student"]').textContent = STU[me.student] || "안 함";
    $('[data-v="paid"]').textContent = me.paidUntil > Date.now() ? day(me.paidUntil) + "까지" : "없음";
    $('[data-v="hub"]').href = A.hubUrl();
    var st = $('[data-v="stuState"]'), done = me.student === "verified", wait = me.student === "pending";
    st.textContent = done ? "확인했어요 (" + me.uniEmail + "). 무료 이용은 " + trialText(me) + "." : wait ? "관리자가 확인하고 있어요. 확인되면 한 달이 열려요." : "학교 메일로 코드를 받아 넣으면 첫 한 달이 무료예요. 학교 메일 하나로 한 번만 받을 수 있어요.";
    ov.querySelector('[data-f="send"]').hidden = done || wait;
    if (done || wait) ov.querySelector('[data-f="verify"]').hidden = true;
    $('[data-v="reqBox"]').hidden = done || wait;
  }

  function msg(form, text, bad) { var m = form.querySelector(".acct-msg"); if (!m) return; m.textContent = text || ""; m.classList.toggle("err", !!bad); }
  function busy(form, on) { var b = form.querySelector(".acct-go"); if (b) b.disabled = on; }
  function run(form, p, ok) {
    busy(form, true); msg(form, "");
    return p.then(function (r) { busy(form, false); ok && ok(r); }, function (e) { busy(form, false); msg(form, e.userMessage || "잠시 문제가 생겼어요. 다시 해 주세요.", true); });
  }
  var FORMS = {
    login: function (f) { run(f, A.login({ email: f.email.value, password: f.password.value }), function () { f.reset(); show("account"); }); },
    signup: function (f) {
      if (!f.agree.checked) { msg(f, "약관과 개인정보 보호정책에 동의해 주세요.", true); return; }
      var stu = f.student.checked;
      run(f, A.signup({ nick: f.nick.value, email: f.email.value, password: f.password.value }), function () { f.reset(); show(stu ? "student" : "account"); });
    },
    send: function (f) {
      var uni = f.uni.value.trim();
      if (uni && !A.isUni(uni)) { msg(f, "대학 메일(.ac.kr, .edu 등)이 아니에요. 아래 '관리자 확인 요청'을 써 주세요.", true); return; }
      run(f, A.sendCode(uni), function (r) {
        var v = ov.querySelector('[data-f="verify"]'); v.hidden = false; msg(v, "");
        msg(f, r && r.devCode ? "미리보기라 메일 대신 여기에 보여요: " + r.devCode : uni + " 로 코드를 보냈어요. 10분 안에 넣어 주세요.");
        try { v.code.focus(); } catch (e) {}
      });
    },
    verify: function (f) { run(f, A.verifyCode(f.code.value), function () { f.reset(); f.hidden = true; msg(ov.querySelector('[data-f="send"]'), ""); fill(); }); },
    request: function (f) { run(f, A.request({ school: f.school.value, uniEmail: f.uni.value }), function () { f.reset(); fill(); }); }
  };
  [].forEach.call(ov.querySelectorAll("form[data-f]"), function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); FORMS[f.dataset.f](f); }); });

  /* paying: the window is NICEPAY's; when it is done NICEPAY brings the person back here with ?pay=ok or ?pay=fail */
  ov.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pay]"); if (!b) return; e.preventDefault();
    var m = $('[data-v="payMsg"]'); m.textContent = "결제창을 여는 중…"; m.classList.remove("err"); b.disabled = true;
    A.pay(b.dataset.pay).then(function () { m.textContent = ""; b.disabled = false; }, function (er) { b.disabled = false; m.textContent = er.userMessage || "결제를 시작하지 못했어요."; m.classList.add("err"); });
  });
  (function () {
    var q = new URLSearchParams(location.search), r = q.get("pay"); if (!r) return;
    history.replaceState(null, "", location.pathname);
    A.ready.then(function () {
      setOpen(true, "account");
      var m = $('[data-v="payMsg"]');
      if (r === "ok") { m.textContent = "결제했어요. 이용권이 늘어났어요."; m.classList.remove("err"); }
      else { m.textContent = (q.get("m") || "결제하지 못했어요.") + " 다시 해 주세요."; m.classList.add("err"); }
    });
  })();

  /* the admin: requests first, then every account */
  var LIST = null;
  function admin() {
    var r = $('[data-v="reqs"]'), u = $('[data-v="users"]');
    r.innerHTML = u.innerHTML = '<p class="dim">불러오는 중…</p>';
    A.admin.list().then(function (d) { LIST = d; drawAdmin(); }, function (e) { r.innerHTML = '<p class="dim">' + esc(e.userMessage || "불러오지 못했어요.") + '</p>'; u.innerHTML = ""; });
  }
  function drawAdmin() {
    if (!LIST) return;
    var q = ($('[data-v="q"]').value || "").trim().toLowerCase(), pend = LIST.requests.filter(function (x) { return x.status === "pending"; }), past = LIST.requests.filter(function (x) { return x.status !== "pending"; }).slice(0, 8);
    $('[data-v="reqs"]').innerHTML = (pend.length ? pend.map(function (x) {
      return '<div class="adm-r"><span><b>' + esc(x.nick) + '</b> <em>' + esc(x.email) + '</em><br>' + esc(x.school) + ' · ' + esc(x.uni_email) + ' <em>' + day(x.created) + '</em></span><span class="adm-b"><button type="button" class="u" data-ok="' + esc(x.id) + '">받기</button><button type="button" class="u" data-no="' + esc(x.id) + '">거절</button></span></div>';
    }).join("") : '<p class="dim">기다리는 요청이 없어요.</p>') + past.map(function (x) { return '<div class="adm-r dim"><span>' + esc(x.nick) + ' · ' + esc(x.school) + '</span><span>' + (x.status === "approved" ? "받음" : "거절") + '</span></div>'; }).join("");
    var users = LIST.users.filter(function (x) { return !q || (x.nick + " " + x.email + " " + (x.uni_email || "")).toLowerCase().indexOf(q) >= 0; }).slice(0, 60);
    $('[data-v="users"]').innerHTML = users.length ? users.map(function (x) {
      var on = x.trial_until > Date.now();
      return '<div class="adm-r"><span><b>' + esc(x.nick) + '</b> <em>' + esc(x.email) + '</em><br>' + (x.student === "verified" ? "대학생 · " + esc(x.uni_email) : x.student === "pending" ? "확인 요청 중" : "일반") + ' · 무료 ' + (on ? day(x.trial_until) + "까지" : "없음") + '</span>' +
        '<span class="adm-b"><button type="button" class="u" data-grant="' + esc(x.id) + '">+30일</button>' + (on ? '<button type="button" class="u" data-revoke="' + esc(x.id) + '">거두기</button>' : "") + '</span></div>';
    }).join("") : '<p class="dim">없어요.</p>';
  }
  ov.addEventListener("input", function (e) { if (e.target.matches('[data-v="q"]')) drawAdmin(); });
  ov.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ok],[data-no],[data-grant],[data-revoke]"); if (!b) return;
    var m = $('[data-v="admMsg"]'), p = b.dataset.ok ? A.admin.decide(b.dataset.ok, true) : b.dataset.no ? A.admin.decide(b.dataset.no, false) : b.dataset.grant ? A.admin.grant(b.dataset.grant, 30) : A.admin.grant(b.dataset.revoke, 0);
    b.disabled = true;
    p.then(function () { m.textContent = "바꿨어요."; m.classList.remove("err"); return A.admin.list(); }).then(function (d) { if (d) { LIST = d; drawAdmin(); } A.refresh(); }, function (er) { b.disabled = false; m.textContent = er.userMessage || "하지 못했어요."; m.classList.add("err"); });
  });

  /* moving about the layer, closing it */
  ov.addEventListener("click", function (e) {
    var to = e.target.closest("[data-to]"); if (to) { e.preventDefault(); show(to.dataset.to); return; }
    var inf = e.target.closest("[data-info]"); if (inf) { e.preventDefault(); setOpen(false); if (window.SITE_INFO) window.SITE_INFO.open(inf.dataset.info); return; }
    if (e.target.closest("#logoutLink")) { e.preventDefault(); A.logout().then(function () { show("login"); }); return; }
    if (!e.target.closest(".info-half")) setOpen(false);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen()) setOpen(false); });

  A.on(function () { header(); if (isOpen()) { var on = pages.filter(function (p) { return p.classList.contains("on"); })[0]; show(on ? on.id.slice(2) : "login"); } });
  header();
  A.ready.then(function () { $(".acct-local").hidden = A.mode !== "local"; header(); });
})();
