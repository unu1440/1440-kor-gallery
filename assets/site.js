(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 나만의 [졸업전시 / 포트폴리오 / 갤러리 / 아카이브 / 스튜디오 / 웹사이트],
     started once the intro has finished */
  var words = document.querySelectorAll("#rot .w"), wi = 0;
  function startRotation() {
    setInterval(function () {
      var cur = words[wi], next = words[(wi + 1) % words.length];
      words.forEach(function (w) { w.classList.remove("is-out"); });
      cur.classList.remove("is-on");
      cur.classList.add("is-out");
      next.classList.add("is-on");
      wi = (wi + 1) % words.length;
    }, 2400);
  }

  /* name.kor.gallery field */
  var form = document.getElementById("claim");
  var input = document.getElementById("site");
  var sizer = document.getElementById("sizer");
  var status = document.getElementById("status");
  var NAMES = ["haneul", "studio-morae", "woojin", "badarecords", "seoul-photo", "my-gallery"];

  /* keep "name.kor.gallery →" on one line: shrink its type when it would overflow.
     The longest example sets the size, so the typing animation never makes it jump. */
  var measure = document.createElement("span");
  measure.setAttribute("aria-hidden", "true");
  measure.style.cssText = "position:absolute;visibility:hidden;white-space:pre;pointer-events:none";
  form.appendChild(measure);
  var LONGEST = NAMES.reduce(function (a, b) { return b.length > a.length ? b : a; });

  var title = document.querySelector(".hero h1");
  var tagline = document.getElementById("tagline");

  /* when the line has to shrink (phones), the title shrinks with it so both lines match */
  function fitLine() {
    form.style.fontSize = "";
    title.style.fontSize = "";
    tagline.style.fontSize = "";
    var base = parseFloat(getComputedStyle(form).fontSize);
    var avail = form.parentNode.clientWidth;
    measure.textContent = LONGEST;
    var wName = measure.offsetWidth;
    measure.textContent = ".kor.gallery";
    var need = wName + measure.offsetWidth + base * 1.05;
    var k = need > avail ? avail / need * 0.98 : 1;
    if (k < 1) form.style.fontSize = title.style.fontSize = tagline.style.fontSize = (base * k) + "px";
  }

  function fit() { sizer.textContent = input.value || input.placeholder || " "; }
  fitLine();
  addEventListener("resize", fitLine);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLine);

  function clean(v) {
    return v.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-+/, "").slice(0, 30);
  }

  /* example names type themselves in the placeholder until the visitor types */
  var ni = 0, ci = 0, deleting = false, timer = null;
  function step() {
    if (input.value || form.classList.contains("editing")) return;
    var word = NAMES[ni];
    if (!deleting) {
      ci++;
      input.placeholder = word.slice(0, ci);
      if (ci === word.length) { deleting = true; return later(1600); }
      return later(90 + Math.random() * 70);
    }
    ci--;
    input.placeholder = word.slice(0, ci);
    if (ci === 0) { deleting = false; ni = (ni + 1) % NAMES.length; return later(350); }
    later(40);
  }
  function later(ms) { fit(); timer = setTimeout(step, ms); }

  function startExamples() {
    if (reduce) { input.placeholder = NAMES[0]; fit(); }
    else later(300);
  }

  input.addEventListener("focus", function () {
    form.classList.add("editing");
    clearTimeout(timer);
    if (!input.value) { input.placeholder = ""; fit(); }
  });
  function restartExamples() {
    clearTimeout(timer);
    ci = 0; deleting = false;
    if (reduce) { input.placeholder = NAMES[0]; fit(); } else later(400);
  }
  input.addEventListener("blur", function () {
    if (input.value || !form.classList.contains("editing")) return;
    form.classList.remove("editing", "invite");
    restartExamples();
  });

  /* leave the field: clear what was typed and go back to the example animation */
  function stopEditing() {
    clearTimeout(nudgeTimer);
    form.classList.remove("editing", "ready", "nudge", "invite");
    input.value = "";
    status.textContent = "";
    if (document.activeElement === input) input.blur();
    restartExamples();
  }
  function startEditing() {
    if (form.classList.contains("editing")) return;
    form.classList.add("editing");
    clearTimeout(timer);
    if (!input.value) { input.placeholder = ""; fit(); }
  }
  form.querySelector(".name").addEventListener("pointerdown", startEditing);

  /* a click anywhere, or simply typing, puts the visitor in the address field */
  function invite(msg) {
    startEditing();
    input.focus({ preventScroll: true });
    var len = input.value.length;
    input.setSelectionRange(len, len);
    form.classList.remove("invite");
    void form.offsetWidth; /* restart the cue animation */
    form.classList.add("invite");
    if (msg) status.textContent = msg;
    var r = form.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) form.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }
  /* ---------- first-visit intro ----------
     blank page → "나만의 졸업전시" types in → "내가 원하는 주소로." for 2s → address line.
     A click or key press during the intro skips straight to the end. */
  var root = document.documentElement;
  var typed = document.getElementById("typed");
  var line2 = document.querySelector(".line2");
  var introDone = false;

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    root.classList.remove("intro", "intro-typing");
    line2.classList.remove("show-tagline");
    startRotation();
    startExamples();
  }
  function pause(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  async function runIntro() {
    if (!root.classList.contains("intro")) return finishIntro();
    var text = "나만의 " + words[0].textContent;
    root.classList.add("intro-typing");
    await pause(600);
    for (var i = 1; i <= text.length; i++) {
      if (introDone) return;
      typed.textContent = text.slice(0, i);
      await pause(text[i - 1] === " " ? 90 : 140 + Math.random() * 70);
    }
    await pause(700);
    if (introDone) return;
    root.classList.remove("intro-typing");
    line2.classList.add("show-tagline");
    await pause(500 + 2000);
    if (introDone) return;
    line2.classList.remove("show-tagline");
    await pause(550);
    finishIntro();
  }

  /* a click or tap anywhere toggles: the first opens the address field
     (on phones this also brings up the keyboard), the next goes back to the examples.
     Clicks on the address line itself, links and buttons keep their own behaviour. */
  var wasEditing = false;
  document.addEventListener("pointerdown", function () {
    wasEditing = form.classList.contains("editing");
  }, true);
  document.addEventListener("click", function (e) {
    if (!introDone) { finishIntro(); return; }
    if (e.target.closest("a, button, input, select, textarea, label")) return;
    if (e.target.closest(".claim")) {
      if (!form.classList.contains("editing")) invite(input.value ? "" : HINT);
      return;
    }
    if (wasEditing) stopEditing();
    else invite(HINT);
  });
  var HINT = "원하는 주소를 입력하세요. 영문 소문자, 숫자, 하이픈(-)을 쓸 수 있습니다.";

  /* once the visitor stops typing a valid name, the → starts blinking */
  var nudgeTimer = null;
  function nudgeLater() {
    form.classList.remove("nudge");
    clearTimeout(nudgeTimer);
    if (clean(input.value).replace(/-+$/, "").length < 2) return;
    nudgeTimer = setTimeout(function () { form.classList.add("nudge"); }, 900);
  }
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    var t = e.target;
    if (t === input || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (!introDone) finishIntro();
    if (e.key.length !== 1 || !/[a-z0-9-]/i.test(e.key)) return;
    e.preventDefault();
    invite("");
    input.value = clean(input.value + e.key);
    input.dispatchEvent(new Event("input"));
  });

  input.addEventListener("input", function () {
    startEditing();
    var v = clean(input.value);
    if (v !== input.value) input.value = v;
    form.classList.toggle("ready", v.length >= 2);
    nudgeLater();
    status.textContent = "";
    fit();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = clean(input.value).replace(/-+$/, "");
    if (v.length < 2) {
      status.textContent = "영문 소문자, 숫자, 하이픈(-)으로 두 글자 이상 입력해 주세요.";
      input.focus();
      return;
    }
    input.value = v; fit();
    clearTimeout(nudgeTimer);
    form.classList.remove("nudge");
    location.href = "templates.html?site=" + encodeURIComponent(v);
  });

  fit();
  runIntro();
})();
