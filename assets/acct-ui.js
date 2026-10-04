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
  /* the pass in the account list: "~26.11.01" (until that day) */
  function upto(ms) { var d = new Date(ms); return "~" + String(d.getFullYear()).slice(2) + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0"); }
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
    if (!me && /^(account|student|admin|usage|refund|leave)$/.test(id)) id = "login";
    if (me && /^(login|signup)$/.test(id)) id = "account";
    if ((id === "admin" || id === "usage") && !(me && me.admin)) id = "account";
    pages.forEach(function (p) { p.classList.toggle("on", p.id === "a-" + id); });
    ov.classList.toggle("wide", id === "usage"); /* the usage page takes the whole width, on paper */
    side.forEach(function (a) { a.classList.toggle("on", a.dataset.to === id); });
    if (id === "account" || id === "student") fill();
    if (id === "admin") admin();
    if (id === "usage") usagePage();
    if (id === "refund") refundBox();
    var f = $("#a-" + id + " input:not([type=checkbox])"); if (f && isOpen() && matchMedia("(hover: hover)").matches) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 350);
  }
  window.ACCT_UI = { close: function () { if (isOpen()) setOpen(false); }, open: setOpen };

  /* the header: Login, or the person's e-mail (pressing it opens the account) */
  function header() {
    var me = A.user;
    ov.classList.toggle("in", !!me); ov.classList.toggle("is-admin", !!(me && me.admin));
    /* Student only for someone who signed up with a school address and is not checked yet */
    ov.classList.toggle("stu", !!(me && me.student !== "verified" && A.isUni(me.email)));
    var hs = $('[data-v="hubSide"]'); if (hs) hs.href = A.hubUrl();
    if (me) refundBox(); else ov.classList.remove("buyer");
    if (!me) slot.innerHTML = '<a href="#" id="loginLink" aria-expanded="' + isOpen() + '" aria-controls="acctOv">Login</a>';
    else slot.innerHTML = '<a href="#" id="nickLink" class="nick" aria-expanded="' + isOpen() + '" aria-controls="acctOv" title="계정">' + esc(me.email) + '</a>';
    var l = slot.firstChild;
    l.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      setOpen(!isOpen());
    });
  }

  function fill() {
    var me = A.user; if (!me) return;
    $('[data-v="nick"]').textContent = me.email;
    $('[data-v="email"]').textContent = me.email;
    /* the pass now: paid days, else the free student month, else none */
    var paid = me.paidUntil > Date.now(), free = me.trialUntil > Date.now();
    $('[data-v="plan"]').textContent = paid ? upto(me.paidUntil) : free ? "무료 " + upto(me.trialUntil) : "없음";
    /* the subscription: on (card, next charge, stop) or off (the price, and the card form when asked) */
    var sb = me.sub, on = !!(sb && sb.status === "active");
    $('[data-v="subState"]').textContent = on ? "구독 중 · " + sb.card + " · 다음 결제 " + upto(sb.next).slice(1) : sb && sb.status === "failed" ? "카드 결제가 되지 않아 구독이 멈췄어요. 카드를 다시 등록해 주세요." : sb && sb.status === "canceled" ? "해지했어요." + (paid ? " " + upto(me.paidUntil) + " 까지 쓸 수 있어요." : "") : "";
    $('[data-v="subOn"]').hidden = !on; $('[data-v="subOff"]').hidden = on;
    if (on) $('[data-f="sub"]').hidden = true;
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
    login: function (f) {
      busy(f, true); msg(f, "");
      A.login({ email: f.email.value, password: f.password.value }).then(function () { busy(f, false); f.reset(); show("account"); }, function (e) {
        busy(f, false);
        /* signed up but the code was never put in: straight to the code */
        if (e.data && e.data.pending) { f.reset(); show("signup"); codeStep(e.data.email, "메일로 받은 코드를 넣어 가입을 마쳐 주세요. 코드가 없으면 다시 받기를 눌러 주세요."); return; }
        msg(f, e.userMessage || "잠시 문제가 생겼어요. 다시 해 주세요.", true);
      });
    },
    signup: function (f) {
      var stu = f.student.checked, email = f.email.value.trim();
      if (stu && !A.isUni(email)) { msg(f, "대학생은 학교 메일(.ac.kr, .edu 등)로만 가입할 수 있어요.", true); f.email.focus(); return; }
      if (!f.agree.checked) { msg(f, "약관과 개인정보 처리방침에 동의해 주세요.", true); return; }
      run(f, A.signup({ email: email, password: f.password.value, student: stu }), function (r) {
        f.reset(); studentMode(f);
        codeStep(r.email, r.devCode ? "미리보기라 메일 대신 여기에 보여요: " + r.devCode : r.email + " 로 코드를 보냈어요. 10분 안에 넣어 주세요.");
      });
    },
    /* the code from the mail makes the account (a student's school address is checked by it too) */
    code: function (f) {
      run(f, A.verifySignup(f.dataset.email, f.code.value.replace(/\D/g, "")), function () { f.reset(); f.hidden = true; ov.querySelector('[data-f="signup"]').hidden = false; show("account"); });
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
    sub: function (f) {
      var ex = f.exp.value.replace(/\D/g, "");
      if (!f.agree.checked) { msg(f, "자동 결제에 동의해 주세요.", true); return; }
      if (ex.length !== 4) { msg(f, "유효기간을 MM/YY로 적어 주세요.", true); f.exp.focus(); return; }
      run(f, A.subscribe({ cardNo: f.cardNo.value, expMonth: ex.slice(0, 2), expYear: ex.slice(2), idNo: f.idNo.value, cardPw: f.cardPw.value, agree: true }), function () {
        f.reset(); f.hidden = true; fill(); var m = $('[data-v="subMsg"]'); m.textContent = "구독을 시작했어요. 첫 달을 결제했어요."; m.classList.remove("err");
      });
    },
    request: function (f) { run(f, A.request({ school: f.school.value, uniEmail: f.uni.value }), function () { f.reset(); fill(); }); },
    /* leaving: the password once more, then everything goes */
    leave: function (f) {
      if (!f.password.value) { msg(f, "비밀번호를 적어 주세요.", true); f.password.focus(); return; }
      run(f, A.leave(f.password.value), function () { f.reset(); show("login"); msg(ov.querySelector('[data-f="login"]'), "탈퇴했어요. 그동안 고마웠어요."); });
    }
  };
  /* the code step of signing up: the form for the address is put away and the code form takes its place */
  function codeStep(email, text) {
    var sf = ov.querySelector('[data-f="signup"]'), cf = ov.querySelector('[data-f="code"]');
    sf.hidden = true; cf.hidden = false; cf.dataset.email = email; msg(cf, "");
    $('[data-v="codeTo"]', cf).textContent = text;
    try { cf.code.focus({ preventScroll: true }); } catch (e) {}
  }
  ov.addEventListener("click", function (e) {
    var b = e.target.closest("[data-code]"); if (!b) return; e.preventDefault();
    var cf = ov.querySelector('[data-f="code"]');
    if (b.dataset.code === "back") { cf.hidden = true; cf.reset(); ov.querySelector('[data-f="signup"]').hidden = false; return; }
    b.disabled = true;
    A.resendSignup(cf.dataset.email).then(function (r) { b.disabled = false; msg(cf, r.devCode ? "미리보기라 메일 대신 여기에 보여요: " + r.devCode : "코드를 다시 보냈어요."); }, function (er) { b.disabled = false; msg(cf, er.userMessage || "보내지 못했어요.", true); });
  });
  /* "대학생입니다": the e-mail field then takes only a university address */
  function studentMode(f) {
    var on = f.student.checked, lbl = f.querySelector('[data-v="emailLbl"]');
    lbl.innerHTML = on ? '학교 메일 <em>.ac.kr · .edu 등</em>' : "이메일";
    f.email.placeholder = on ? "name@school.ac.kr" : "";
    if (on && f.email.value && !A.isUni(f.email.value)) msg(f, "학교 메일 주소를 적어 주세요.", true); else msg(f, "");
  }
  (function () { var f = ov.querySelector('[data-f="signup"]'); f.student.addEventListener("change", function () { studentMode(f); f.email.focus(); }); f.email.addEventListener("input", function () { if (f.student.checked) studentMode(f); }); })();
  [].forEach.call(ov.querySelectorAll("form[data-f]"), function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); FORMS[f.dataset.f](f); }); });

  /* refunds (the 1440 rules): the latest payment, what it would give back, and the button */
  var RF = null, PLAN = { month: "30일권", year: "1년권", sub: "구독" };
  function won(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "₩"; }
  function refundBox() {
    var box = $('[data-v="rfBox"]');
    A.refundQuote().then(function (q) {
      RF = q; var me = A.user, said = !!$('[data-v="rfMsg"]').textContent;
      ov.classList.toggle("buyer", !!q || !!(me && me.sub && me.sub.status === "active") || said);
      box.hidden = !q && !said; $('[data-v="rfText"]').hidden = !q; $('[data-refund]').hidden = !q; if (!q) return;
      var d = new Date(q.paidAt), when = (d.getMonth() + 1) + "." + String(d.getDate()).padStart(2, "0");
      var head = "최근 결제 · " + PLAN[q.plan] + " " + won(q.amount) + " · " + when + " — ";
      $('[data-v="rfText"]').textContent = head + (q.rule === "today" ? "결제한 날이라 전액 돌려 드려요." : "쓰지 않은 " + q.daysBack + "일만큼 돌려 드려요.") + (q.plan === "sub" ? " 구독도 함께 멈춰요." : "");
      var b = $('[data-refund]'); b.textContent = won(q.refund) + " 환불"; b.hidden = q.refund <= 0;
    }, function () { box.hidden = true; });
  }
  ov.addEventListener("click", function (e) {
    var b = e.target.closest("[data-refund]"); if (!b || !RF) return; e.preventDefault();
    var m = $('[data-v="rfMsg"]'); m.textContent = ""; m.classList.remove("err");
    if (!confirm(won(RF.refund) + "을 환불할까요? 이용권에서 " + RF.daysBack + "일이 빠져요." + (RF.plan === "sub" ? " 구독도 멈춰요." : ""))) return;
    b.disabled = true;
    A.refund(RF.orderId).then(function (r) { b.disabled = false; m.textContent = won(r.refunded) + "을 환불했어요. 카드사에 따라 며칠 걸릴 수 있어요." + (RF && RF.plan === "sub" ? " 구독도 멈췄어요." : ""); fill(); }, function (er) { b.disabled = false; m.textContent = er.userMessage || "환불하지 못했어요."; m.classList.add("err"); });
  });

  /* the subscription: the price opens the card form; 해지 stops it (the days already paid stay) */
  ov.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sub]"); if (!b) return; e.preventDefault();
    var f = $('[data-f="sub"]'), m = $('[data-v="subMsg"]'); m.textContent = ""; m.classList.remove("err");
    if (b.dataset.sub === "open") { f.hidden = !f.hidden; if (!f.hidden) { msg(f, ""); try { f.cardNo.focus(); } catch (er) {} } return; }
    var me = A.user; if (!confirm("구독을 해지할까요?" + (me && me.paidUntil > Date.now() ? " " + upto(me.paidUntil) + " 까지는 그대로 쓸 수 있어요." : ""))) return;
    b.disabled = true;
    A.unsubscribe().then(function () { b.disabled = false; fill(); }, function (er) { b.disabled = false; m.textContent = er.userMessage || "해지하지 못했어요."; m.classList.add("err"); });
  });
  /* the card fields take digits only; the expiry gets its slash */
  (function () {
    var f = $('[data-f="sub"]'); if (!f) return;
    ["cardNo", "idNo", "cardPw"].forEach(function (n) { f[n].addEventListener("input", function () { var v = f[n].value.replace(/\D/g, ""); if (n === "cardNo") v = v.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "); if (f[n].value !== v) f[n].value = v; }); });
    f.exp.addEventListener("input", function () { var v = f.exp.value.replace(/\D/g, "").slice(0, 4); v = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v; if (f.exp.value !== v) f.exp.value = v; });
  })();

  /* paying: the price opens NICEPAY's window at once (card and easy pay in the one window); when it is done NICEPAY
     brings the person back here with ?pay=ok or ?pay=fail */
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

  /* the admin's usage page: on its own wide, solid page. First a card for every free limit (the share used in big
     figures and a word: 여유 / 주의 / 초과 — not colour alone), then for what is counted by the day, the last 14 days
     as bars with a scale. Cloudflare's own numbers need the CF_API_TOKEN secret. */
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function bytes(n) { return n >= 1073741824 ? (n / 1073741824).toFixed(2) + " GB" : n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : n >= 1024 ? Math.round(n / 1024) + " KB" : n + " B"; }
  function pct(used, limit) { var p = limit ? used / limit * 100 : 0; return p === 0 ? "0%" : p < 0.1 ? "<0.1%" : p < 10 ? p.toFixed(1) + "%" : Math.round(p) + "%"; }
  function card(name, when, used, limit, isBytes, missing) {
    if (missing) return '<div class="us-k off"><p class="us-kn">' + name + '<em>' + when + '</em></p><p class="us-kp">—</p><p class="us-kv">연결 필요</p><div class="us-bar"></div></div>';
    var p = limit ? used / limit * 100 : 0, w = p >= 100 ? "초과" : p >= 80 ? "주의" : "여유";
    return '<div class="us-k' + (p >= 80 ? " warn" : "") + '"><p class="us-kn">' + name + '<em>' + when + '</em></p><p class="us-kp">' + pct(used, limit) + '<b>' + w + '</b></p>' +
      '<p class="us-kv">' + (isBytes ? bytes(used) + " / " + bytes(limit) : fmt(used) + " / " + fmt(limit)) + '</p>' +
      '<div class="us-bar" role="img" aria-label="' + name + ' ' + pct(used, limit) + '"><i style="width:' + Math.min(100, Math.max(used > 0 ? 1 : 0, p)).toFixed(2) + '%"></i><s style="left:80%"></s></div></div>';
  }
  function chart(title, s, limit) {
    if (!s) return "";
    var max = Math.max.apply(null, s.map(function (x) { return x.v; })), top = max > 0 ? niceTop(max) : 1, W = 560, H = 150, n = s.length, gap = 4, bw = (W - gap * (n - 1)) / n, h = "";
    [0, 0.5, 1].forEach(function (k) { var y = H - k * H; h += '<line class="g" x1="0" x2="' + W + '" y1="' + y + '" y2="' + y + '"></line>'; });
    s.forEach(function (x, i) {
      var bh = x.v ? Math.max(3, x.v / top * H) : 0, X = i * (bw + gap), Y = H - bh, r = Math.min(4, bw / 2, bh);
      h += '<g class="us-b' + (i === n - 1 ? " now" : "") + '" data-tip="' + x.d.slice(5).replace("-", ".") + " · " + fmt(x.v) + '"><rect x="' + X + '" y="0" width="' + bw + '" height="' + H + '" fill="transparent"></rect>' +
        (bh ? '<path d="M' + X + ' ' + H + 'V' + (Y + r) + 'Q' + X + ' ' + Y + ' ' + (X + r) + ' ' + Y + 'H' + (X + bw - r) + 'Q' + (X + bw) + ' ' + Y + ' ' + (X + bw) + ' ' + (Y + r) + 'V' + H + 'Z"></path>' : "") + '</g>';
    });
    var dates = s.map(function (x, i) { return '<span>' + (i % 2 === (n - 1) % 2 ? (+x.d.slice(5, 7)) + "." + (+x.d.slice(8)) : "") + '</span>'; }).join("");
    var last = s[n - 1];
    return '<figure class="us-c"><figcaption><b>' + title + '</b><span>오늘 <strong>' + fmt(last.v) + '</strong> · 한도 ' + fmt(limit) + '/일 (' + pct(last.v, limit) + ')</span></figcaption>' +
      '<div class="us-plot"><div class="us-y"><span>' + fmt(top) + '</span><span>' + fmt(top / 2) + '</span><span>0</span></div>' +
      '<div class="us-area"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + h + '</svg><div class="us-tip" hidden></div><div class="us-d">' + dates + '</div></div></div>' +
      '<details class="us-t"><summary>표로 보기</summary><table><tr><th>날짜</th><th>값</th></tr>' + s.map(function (x) { return '<tr><td>' + x.d + '</td><td>' + fmt(x.v) + '</td></tr>'; }).join("") + '</table></details></figure>';
  }
  function niceTop(v) { var e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e; }
  function usagePage() {
    var box = $('[data-v="usage"]'), at = $('[data-v="usAt"]');
    box.innerHTML = '<p class="dim">불러오는 중…</p>'; at.textContent = "";
    A.admin.usage().then(function (u) {
      var n = u.now, f = u.free, e = u.errors || {}, s = u.series, d = new Date(u.at);
      at.textContent = "무료 요금제 기준 · " + (d.getMonth() + 1) + "." + d.getDate() + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + " 현재 · 하루 한도는 매일 오전 9시(한국 시간)에 0부터 다시 셉니다";
      var bad = Object.keys(e).filter(function (k) { return e[k] && e[k] !== "token"; }).map(function (k) { return esc(e[k]); });
      var h = "";
      if (!u.token) h += '<p class="us-note">Cloudflare 숫자를 보려면 "Account Analytics: Read" 권한의 API 토큰을 터미널에서 넣어 주세요.<br><code>npx wrangler@4.142.0 secret put CF_API_TOKEN -c api/wrangler.jsonc</code></p>';
      if (bad.length) h += '<p class="us-err">일부 숫자를 불러오지 못했어요: ' + bad.join(" / ") + '</p>';
      var r2 = n.r2Size != null ? n.r2Size : n.mediaBytes;
      h += '<section class="us-g"><h2>Cloudflare</h2><div class="us-ks">' +
        card("Workers 요청", "오늘", n.workers || 0, f.workers, false, n.workers == null) +
        card("D1 읽은 행", "오늘", n.d1Read || 0, f.d1Read, false, n.d1Read == null) +
        card("D1 쓴 행", "오늘", n.d1Write || 0, f.d1Write, false, n.d1Write == null) +
        card("D1 용량", "전체", n.d1Size || 0, f.d1Size, true, !n.d1Size) +
        card("R2 용량", "전체", r2 || 0, f.r2Size, true, false) +
        card("R2 올리기 (Class A)", "이번 달", n.r2A || 0, f.r2A, false, n.r2A == null) +
        card("R2 읽기 (Class B)", "이번 달", n.r2B || 0, f.r2B, false, n.r2B == null) + '</div></section>';
      h += '<section class="us-g"><h2>Resend 메일</h2><div class="us-ks">' + card("보낸 메일", "오늘", n.mailDay, f.mailDay) + card("보낸 메일", "이번 달", n.mailMonth, f.mailMonth) + '</div></section>';
      h += '<section class="us-g"><h2>최근 14일</h2><div class="us-cs">' + chart("Workers 요청", s.workers, f.workers) + chart("D1 읽은 행", s.d1Read, f.d1Read) + chart("D1 쓴 행", s.d1Write, f.d1Write) + chart("보낸 메일", s.mail, f.mailDay) + '</div></section>';
      h += '<section class="us-g us-two"><div><h2>한도가 없거나 따로 보는 것</h2><ul class="ck us-l">' +
        '<li><span class="b"></span><span class="t">정적 파일</span><span class="v">요청 무제한 · 버전당 파일 20,000개</span></li>' +
        '<li><span class="b"></span><span class="t">Cron</span><span class="v">5개 중 1개</span></li>' +
        '<li><span class="b"></span><span class="t">GitHub Actions</span><span class="v"><a class="u" href="https://github.com/settings/billing" target="_blank" rel="noopener">월 2,000분 · 확인 ↗</a></span></li>' +
        '<li><span class="b"></span><span class="t">나이스페이</span><span class="v">무료 한도 없음 · 건마다 수수료</span></li></ul></div>' +
        '<div><h2>지금 1440</h2><ul class="ck us-l">' +
        '<li><span class="b"></span><span class="t">계정</span><span class="v">' + fmt(n.users) + '</span></li>' +
        '<li><span class="b"></span><span class="t">사이트</span><span class="v">' + fmt(n.sites) + ' (공개 ' + fmt(n.published) + ')</span></li>' +
        '<li><span class="b"></span><span class="t">올린 파일</span><span class="v">' + fmt(n.mediaFiles) + ' · ' + bytes(n.mediaBytes) + '</span></li></ul></div></section>';
      box.innerHTML = h;
    }, function (er) { box.innerHTML = '<p class="dim">' + esc(er.userMessage || "불러오지 못했어요.") + '</p>'; });
  }
  /* a bar of a chart shows its day and value while pointed at */
  ov.addEventListener("pointerover", function (e) {
    var g = e.target.closest && e.target.closest(".us-b"); if (!g) return;
    var area = g.closest(".us-area"), tip = area.querySelector(".us-tip"), r = g.getBoundingClientRect(), ar = area.getBoundingClientRect();
    tip.textContent = g.dataset.tip; tip.hidden = false;
    var bar = g.querySelector("path"), bt = bar ? bar.getBoundingClientRect().top : r.bottom;
    tip.style.left = Math.max(0, Math.min(ar.width - tip.offsetWidth, r.left - ar.left + r.width / 2 - tip.offsetWidth / 2)) + "px";
    tip.style.top = Math.max(0, bt - ar.top - tip.offsetHeight - 6) + "px"; /* just above the bar */
  });
  ov.addEventListener("pointerout", function (e) { var g = e.target.closest && e.target.closest(".us-b"); if (g && !g.contains(e.relatedTarget)) { var t = g.closest(".us-area").querySelector(".us-tip"); t.hidden = true; } });

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
      return '<div class="adm-r"><span><b>' + esc(x.email) + '</b><br>' + esc(x.school) + ' · ' + esc(x.uni_email) + ' <em>' + day(x.created) + '</em></span><span class="adm-b"><button type="button" class="u" data-ok="' + esc(x.id) + '">받기</button><button type="button" class="u" data-no="' + esc(x.id) + '">거절</button></span></div>';
    }).join("") : '<p class="dim">기다리는 요청이 없어요.</p>') + past.map(function (x) { return '<div class="adm-r dim"><span>' + esc(x.email) + ' · ' + esc(x.school) + '</span><span>' + (x.status === "approved" ? "받음" : "거절") + '</span></div>'; }).join("");
    var users = LIST.users.filter(function (x) { return !q || (x.nick + " " + x.email + " " + (x.uni_email || "")).toLowerCase().indexOf(q) >= 0; }).slice(0, 60);
    $('[data-v="users"]').innerHTML = users.length ? users.map(function (x) {
      var on = x.trial_until > Date.now();
      return '<div class="adm-r"><span><b>' + esc(x.email) + '</b><br>' + (x.student === "verified" ? "대학생 · " + esc(x.uni_email) : x.student === "pending" ? "확인 요청 중" : "일반") + ' · 무료 ' + (on ? day(x.trial_until) + "까지" : "없음") + '</span>' +
        '<span class="adm-b"><button type="button" class="u" data-grant="' + esc(x.id) + '">+30일</button>' + (on ? '<button type="button" class="u" data-revoke="' + esc(x.id) + '">거두기</button>' : "") + '</span></div>';
    }).join("") : '<p class="dim">없어요.</p>';
    var NAMES = { "GET /api/admin/students": "목록 보기", "POST /api/admin/decide": "요청 결정", "POST /api/admin/grant": "무료 기간", "GET /api/admin/usage": "사용량 보기" };
    $('[data-v="alog"]').innerHTML = (LIST.log || []).length ? LIST.log.map(function (x) {
      var d = new Date(x.at), t = day(x.at) + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      return '<div class="adm-r dim"><span>' + esc(NAMES[x.action] || x.action) + (x.target ? " · " + esc(x.target) : "") + '</span><span>' + t + '</span></div>';
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
    if (e.target.closest("#logoutSide")) { e.preventDefault(); A.logout().then(function () { show("login"); }); return; }
    if (!e.target.closest(".info-half")) setOpen(false);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen()) setOpen(false); });

  A.on(function () { header(); if (isOpen()) { var on = pages.filter(function (p) { return p.classList.contains("on"); })[0]; show(on ? on.id.slice(2) : "login"); } });
  header();
  A.ready.then(function () { header(); });
})();
