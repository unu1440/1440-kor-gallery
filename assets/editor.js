/* The editor: templates.html?edit=n (&site=name).
   The chosen template fills the screen and is changed where it stands: click a word or a picture and a small window
   opens next to it. A slim rail on the right holds the panels (the page's parts, words and pictures, my pictures,
   typeface and colours, features, site settings); a thin bar on top holds undo, preview, phone and publish.
   The page is drawn with the same code the previews use (window.T1440, see templates.js).
   Changes are kept in this browser (localStorage for words and settings, IndexedDB for the pictures a person adds).
   Words are matched by what they said in the template ("Work" everywhere becomes the new word), so they survive the
   page being drawn again when a feature or a part is switched.
   For a person with no web knowledge: plain Korean, switches, live results, undo, nothing that needs code.
   A phone is for content (words, pictures, checking, publishing); structure and design are for a computer. */
(function () {
  "use strict";
  var T = window.T1440, qs = new URLSearchParams(location.search), N = +qs.get("edit");
  if (!T || !N || !T.find(N)) return;
  var CHECK = /[?&]check=editor/.test(location.search); /* development check: see the end of this file */
  var b, gen, GEN = T.GEN, NL = String.fromCharCode(10);
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = T.esc;
  var phone = window.matchMedia("(max-width: 760px)");
  var MAC = /Mac|iPhone|iPad/.test(navigator.platform || "");
  var CMD = MAC ? "⌘" : "Ctrl+";

  /* ---------- plain words for everything a person can switch ---------- */
  var FEAT = {
    index: ["작업 색인", "메뉴에 '색인'을 넣어요. 누르면 작업 목록이 열려요."],
    contact: ["연락처", "메뉴에 '연락처'를 넣어요. 이메일과 SNS 링크가 나와요."],
    search: ["검색", "방문자가 작품을 검색할 수 있어요."],
    news: ["뉴스레터 구독", "이메일 주소를 받는 창을 넣어요."],
    lang: ["한국어 · 영어 바꾸기", "방문자가 한국어와 영어를 바꿔 볼 수 있어요."],
    clock: ["지금 시각", "메뉴 옆에 실시간 시계를 보여 줘요."],
    filter: ["종류별로 보기", "작품을 종류별로 골라 볼 수 있는 버튼이에요."],
    pages: ["쪽 나누기", "작품이 많을 때 1 · 2 · 3쪽으로 나눠요."],
    products: ["상품으로 팔기", "'담기' 버튼과 장바구니를 넣어요."],
    view: ["격자 · 목록 바꾸기", "방문자가 사진 격자와 글 목록을 바꿔 볼 수 있어요."],
    peek: ["올리면 사진 넘기기", "마우스를 올리면 사진이 다음 장으로 바뀌어요."],
    "slides-click": ["사진을 눌러서 넘기기", "사진을 누르면 다음 사진이 나와요."],
    "slides-arrows": ["화살표로 넘기기", "← → 버튼으로 사진을 넘겨요."],
    "slides-auto": ["자동으로 넘기기", "가만히 있어도 사진이 저절로 넘어가요."],
    "slides-dots": ["점을 눌러 고르기", "사진 수만큼 점이 생겨요."],
    "slides-thumbs": ["작은 사진으로 고르기", "아래에 작은 사진이 줄지어 나와요."],
    "slides-list": ["글 목록에 올려서 보기", "목록의 제목에 올리면 그 사진이 나와요."],
    rake: ["빛 비추기", "마우스를 움직이면 사진에 빛이 비쳐요."],
    model: ["3D로 돌려 보기", "입체 물건을 돌려 볼 수 있어요."],
    compare: ["전후 비교", "가운데 선을 밀어 두 사진을 비교해요."],
    loupe: ["돋보기", "사진을 크게 확대해 볼 수 있어요."],
    daylight: ["낮 · 밤 조명", "해가 뜨고 지는 조명을 바꿔 볼 수 있어요."],
    docent: ["음성 안내", "작품 설명을 소리로 들려줘요."],
    guestbook: ["방명록", "방문자가 짧은 글을 남길 수 있어요."],
    scale: ["실제 크기로 보기", "사람과 나란히 놓은 실제 크기를 보여 줘요."],
    audio: ["음악 플레이어", "옆 칸에 재생 버튼이 있는 플레이어를 넣어요."],
    accordion: ["눌러서 펼치는 목록", "제목을 누르면 설명이 펼쳐져요."],
    form: ["문의 양식", "이름과 메시지를 받는 양식을 넣어요."],
    hours: ["영업시간", "지금 문을 열었는지 알려 줘요."],
    countdown: ["오픈까지 남은 날", "정한 날까지 며칠 남았는지 보여 줘요."],
    marquee: ["흘러가는 글자", "한 줄 소식이 옆으로 흘러가요."],
    backdrop: ["배경 효과", "은은한 점이나 선 무늬를 깔아요."],
    autohide: ["내리면 메뉴 숨기기", "아래로 내리면 메뉴가 숨고 올리면 다시 나와요."],
    dark: ["밝게 · 어둡게 바꾸기", "방문자가 화면 밝기를 바꿀 수 있어요."],
    toc: ["이 페이지 목차", "페이지 안의 각 부분으로 바로 가는 링크를 넣어요."],
    cv: ["이력서 인쇄", "이력을 인쇄하기 좋은 모양으로 바꿔 줘요."],
    vcard: ["연락처 저장", "방문자가 내 연락처를 폰에 저장할 수 있어요."],
    drag: ["끌어서 넘기기", "사진 줄을 손가락이나 마우스로 끌어 넘겨요."]
  };
  var GROUP = { menu: "메뉴에 넣을 것", slides: "사진 넘기는 방법", grid: "작품 목록", hero: "큰 사진 효과", panel: "옆 칸에 넣을 것", when: "시간 알림", page: "페이지 기능" };
  var FACE = { sans: "기본 고딕", cond: "좁은 고딕", wide: "넓은 고딕", serif: "세리프", mono: "타자기", suit: "SUIT 고딕", maru: "마루부리 명조", galmuri: "갈무리 픽셀", instrument: "인스트루먼트", bricolage: "브리콜라주", shoulders: "빅 숄더스", fraunces: "프라운스", unbounded: "언바운디드" };
  var BLK = { table: "작업 표", list: "큰 작업 목록", cv: "이력 (전시 기록)", news: "소식", clients: "함께한 곳", statement: "큰 문장", about: "소개", contact: "연락", timeline: "연표", stats: "숫자", quotes: "후기", team: "팀" };
  var FOOT = { line: "한 줄", columns: "네 칸", name: "큰 이름" };
  var BGS = ["#ffffff", "#fcfcfc", "#f4f4f4", "#f3efe6", "#f6f4f0", "#e9e7e3", "#f4d9cf", "#dfe8d5", "#cfe0ef", "#ffe14d", "#ff8a00", "#0a5cff", "#111111", "#000000"];
  var INKS = ["#111111", "#000000", "#333333", "#ffffff", "#0a5cff", "#1f3fd1", "#b8231a", "#f0462e", "#153f2a", "#2b1bb3"];
  var SVG = function (d, extra) { return '<svg viewBox="0 0 24 24"' + (extra || "") + '>' + d + '</svg>'; };
  var IC = {
    back: SVG('<path d="M15 6l-6 6 6 6"/>'),
    undo: SVG('<path d="M9 7 4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 0 12"/>'),
    redo: SVG('<path d="m15 7 5 5-5 5"/><path d="M20 12h-9a6 6 0 0 0 0 12"/>'),
    point: SVG('<path d="M7 3v14l3.5-3.2 2.6 5.2 2.2-1.1-2.6-5.1H18z"/>'),
    mob: SVG('<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>'),
    desk: SVG('<rect x="3" y="4.5" width="18" height="12" rx="1.2"/><path d="M9 20h6M12 16.5V20"/>'),
    blocks: SVG('<rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/>'),
    texts: SVG('<path d="M4 6h16M4 12h16M4 18h10"/>'),
    images: SVG('<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17.5 5-5 4 4 3-3 4 4"/>'),
    feat: SVG('<rect x="3" y="8" width="18" height="8" rx="4"/><circle cx="8" cy="12" r="2.4"/>'),
    site: SVG('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
    bg: SVG('<path d="M5 12 12 5l7 7-7 7z"/><path d="M19 15c1 1.5 1.5 2.5 1.5 3.3a1.5 1.5 0 0 1-3 0c0-.8.5-1.8 1.5-3.3z"/>'),
    motion: SVG('<rect x="8" y="3.5" width="8" height="13" rx="4"/><path d="M12 7v3"/><path d="m8.5 19.5 3.5 2 3.5-2"/>'),
    x: SVG('<path d="M6 6l12 12M18 6 6 18"/>'),
    up: SVG('<path d="m6 14 6-6 6 6"/>'),
    down: SVG('<path d="m6 10 6 6 6-6"/>'),
    left: SVG('<path d="M4 7h16M4 12h10M4 17h16"/>'),
    center: SVG('<path d="M4 7h16M7 12h10M4 17h16"/>'),
    right: SVG('<path d="M4 7h16M10 12h10M4 17h16"/>')
  };

  /* ---------- what was there in the template, and what the person changed ---------- */
  var KEY, orig, S, DATA = {}; /* DATA: pictures added by the person: key → data URL */
  function fresh() { return { texts: {}, tstyle: {}, slots: {}, photos: {}, fit: {}, lib: [], libN: 0, bg: null, bgImg: null, bgFit: "cover", bgDim: 0, motion: null, fav: null, ink: null, face: null, feats: null, more: null, hours: null, until: null, marquee: null, extra: null, title: "", desc: "" }; }
  /* the template being changed (the check at the end changes it again and again) */
  function use(n) {
    N = n; b = T.find(n); gen = b.gen; KEY = "1440-edit-" + n + "-" + (T.site || T.defName);
    orig = { feats: gen ? gen.feats.slice() : null, more: gen && gen.more ? gen.more.slice() : null, bg: b.bg, ink: b.ink, font: b.font, stretch: b.stretch, extra: (T.handExtra(n) || []).slice(), face: gen ? gen.face : null };
    S = fresh();
    if (!CHECK) try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) for (var k0 in S) if (saved[k0] !== undefined) S[k0] = saved[k0]; } catch (e) {}
  }
  use(N);

  /* ---------- pictures are kept in IndexedDB (they are too big for localStorage) ---------- */
  var DB = null;
  function openDb(cb) {
    try {
      var rq = indexedDB.open("1440-edit", 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore("photos"); };
      rq.onsuccess = function () { DB = rq.result; cb(); };
      rq.onerror = function () { cb(); };
    } catch (e) { cb(); }
  }
  function dbPut(pk, val) { if (!DB || CHECK) return; try { var t = DB.transaction("photos", "readwrite"); if (val) t.objectStore("photos").put(val, KEY + "|" + pk); else t.objectStore("photos").delete(KEY + "|" + pk); } catch (e) {} }
  function dbLoad(cb) {
    if (!DB) return cb();
    try {
      var t = DB.transaction("photos", "readonly"), st = t.objectStore("photos"), rq = st.openCursor(IDBKeyRange.bound(KEY + "|", KEY + "|￿"));
      rq.onsuccess = function () { var c = rq.result; if (c) { DATA[String(c.key).slice(KEY.length + 1)] = c.value; c.continue(); } else cb(); };
      rq.onerror = function () { cb(); };
    } catch (e) { cb(); }
  }
  function photoUrl(pk) { var v = S.photos[pk]; return v ? DATA[v === 1 ? pk : v] : null; }

  /* ---------- the page around the template ---------- */
  var root = document.createElement("div");
  root.className = "ed";
  root.innerHTML =
    '<header class="ed-top">' +
      '<div class="ed-l"><button type="button" class="ed-home" id="edBack" aria-label="템플릿 다시 고르기">← 1440</button><span class="ed-no">' + T.tag(N) + '</span>' +
      '<img class="ed-fav" id="edFav" alt="" hidden></div>' +
      '<div class="ed-r"><button type="button" class="ed-ic" id="edUndo" aria-label="되돌리기 ' + CMD + 'Z" title="되돌리기 ' + CMD + 'Z">' + IC.undo + '</button><button type="button" class="ed-ic" id="edRedo" aria-label="다시 하기" title="다시 하기 ' + CMD + '⇧Z">' + IC.redo + '</button><span class="ed-sep"></span>' +
        '<button type="button" class="ed-ic" id="edPreview" aria-pressed="false" aria-label="미리보기 ' + CMD + '\\" title="미리보기 ' + CMD + '\\">' + IC.point + '</button>' +
        '<button type="button" class="ed-ic ed-dev-desk" id="edDevice" aria-pressed="false" aria-label="폰 화면으로 보기" title="폰 화면 ' + CMD + '⇧X">' + IC.mob + '</button>' +
        '<span class="ed-state" id="edState" role="status"></span><button type="button" class="ed-pub" id="edPub" title="공개하기 ' + CMD + 'P">공개하기</button></div>' +
    '</header>' +
    '<div class="ed-canvas ed-edit" id="edCanvas"></div>' +
    '<nav class="ed-rail" id="edRail" aria-label="편집 도구">' +
      '<button type="button" data-p="blocks" data-tip="페이지 구성" aria-label="페이지 구성" aria-pressed="false"><i class="ico" style="--a:#5ac8fa;--b:#0a84ff">' + IC.blocks + '</i></button>' +
      '<button type="button" data-p="texts" data-tip="글 · 사진 목록" aria-label="글 · 사진 목록" aria-pressed="false"><i class="ico" style="--a:#ffb340;--b:#ff7a00">' + IC.texts + '</i></button>' +
      '<button type="button" data-p="images" data-tip="내 사진" aria-label="내 사진" aria-pressed="false"><i class="ico" style="--a:#6be08a;--b:#1f9d45">' + IC.images + '</i></button>' +
      '<button type="button" data-p="bg" data-tip="배경" aria-label="배경" aria-pressed="false"><i class="ico" style="--a:#ff8fa3;--b:#e5386d">' + IC.bg + '</i></button>' +
      '<button type="button" data-p="type" data-tip="글꼴 · 색" aria-label="글꼴 · 색" aria-pressed="false"><i class="ico" style="--a:#c987f7;--b:#7a3bd6">' + '<b>Aa</b>' + '</i></button>' +
      '<button type="button" data-p="motion" data-tip="스크롤 효과" aria-label="스크롤 효과" aria-pressed="false"><i class="ico" style="--a:#64d2c8;--b:#16897f">' + IC.motion + '</i></button>' +
      '<button type="button" data-p="feat" data-tip="기능" aria-label="기능" aria-pressed="false"><i class="ico" style="--a:#ff7a70;--b:#d92f2f">' + IC.feat + '</i></button>' +
      '<button type="button" data-p="site" data-tip="사이트 설정" aria-label="사이트 설정" aria-pressed="false"><i class="ico" style="--a:#a4a4ad;--b:#5b5b66">' + IC.site + '</i></button>' +
    '</nav>' +
    '<aside class="ed-pop" id="edPop" hidden></aside><aside class="ed-tip" id="edTip" hidden></aside>' +
    '<div class="ed-dlg" id="edDlg" hidden role="dialog" aria-modal="true" aria-labelledby="edDlgT"><div class="ed-dlg-box"></div></div>';
  document.body.appendChild(root);
  document.title = "편집 · " + T.tag(N);
  var canvas = $("#edCanvas"), state = $("#edState"), pop = $("#edPop"), tip = $("#edTip");
  var mode = "edit", dev = phone.matches ? "mob" : "desk", panel = null, sel = null, bypass = false, bgTip = false, bgPt = { x: 0, y: 0 };

  /* ---------- keeping and undoing ---------- */
  var hist = [JSON.stringify(S)], hp = 0, saveT = 0;
  function persist() {
    if (CHECK) return;
    try { localStorage.setItem(KEY, JSON.stringify(S)); state.textContent = "초안 · 저장됨"; } catch (e) { state.textContent = "저장하지 못했어요"; }
  }
  function commit(now) {
    if (CHECK) return;
    clearTimeout(saveT);
    saveT = setTimeout(function () {
      var j = JSON.stringify(S); if (j === hist[hp]) return;
      hist = hist.slice(0, hp + 1); hist.push(j); if (hist.length > 60) hist.shift(); hp = hist.length - 1;
      persist(); undoState();
    }, now ? 0 : 500);
    state.textContent = "저장 중…";
  }
  function undoState() { $("#edUndo").disabled = hp <= 0; $("#edRedo").disabled = hp >= hist.length - 1; }
  function travel(d) {
    var to = hp + d; if (to < 0 || to >= hist.length) return;
    hp = to; S = JSON.parse(hist[hp]); persist(); undoState(); select(null); render();
  }
  $("#edUndo").addEventListener("click", function () { travel(-1); });
  $("#edRedo").addEventListener("click", function () { travel(1); });

  /* ---------- drawing the page ---------- */
  function model() {
    if (gen) { gen.feats = (S.feats || orig.feats).slice(); gen.more = (S.more || orig.more || []).slice(); gen.hours = S.hours || undefined; gen.until = S.until || undefined; gen.marqueeText = S.marquee || undefined; }
    else T.handExtra(N, S.extra || orig.extra);
    b.bg = S.bg || orig.bg; b.ink = S.ink || orig.ink;
    if (S.face && GEN.FACES[S.face]) { b.font = GEN.FACES[S.face][0]; b.stretch = GEN.FACES[S.face][1]; } else { b.font = orig.font; b.stretch = orig.stretch; }
  }
  function viewOf() { return $(".mac-view", canvas); }
  function render() {
    T.clearTimers(); model();
    var mob = dev === "mob", old = viewOf(), scroll = 0;
    if (old && old.firstElementChild) scroll = old.scrollTop / (parseFloat(old.firstElementChild.style.zoom) || 1);
    canvas.innerHTML = '<div class="ed-page' + (mob ? " is-mob" : "") + '"><div class="mac-view"' + (mob ? ' data-w="390"' : "") + '><div class="canvas' + (mob ? " mob" : "") + '">' + T.pageFor(b, mob) + '</div></div></div>';
    canvas.classList.toggle("ed-edit", mode === "edit"); canvas.classList.toggle("ed-try", mode === "try");
    var view = viewOf();
    T.bringToLife(view, b, mob);
    if (mode === "edit") T.clearTimers(); /* nothing moves while it is being changed */
    decorate(view); applyEdits(view); applyBg(view); applyMotion(view); applyFav(); measureBind(view);
    view.addEventListener("click", onClick, true);
    view.addEventListener("scroll", function () { if (sel) placeTip(); }, { passive: true });
    view.addEventListener("dragover", function (e) { if (mode === "edit" && e.dataTransfer && /Files|text\/plain/.test([].join.call(e.dataTransfer.types || [], ","))) e.preventDefault(); });
    view.addEventListener("drop", onDrop);
    /* a window opened over the page (info, menu, project…) is changeable too */
    var tpEl = $(".tp", view);
    if (tpEl) new MutationObserver(function (ms) {
      ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 && n.classList.contains("lv-layer") && mode === "edit") { decorate(view, n); applyEdits(n); refreshPanel(); } }); });
      if (mode === "edit" && sel && !sel.isConnected) select(null);
    }).observe(tpEl, { childList: true });
    if (scroll) view.scrollTop = scroll * (parseFloat(view.firstElementChild.style.zoom) || 1);
    if (mode === "edit") $$("form", view).forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); }); });
    if (mode === "try") canvas.insertAdjacentHTML("beforeend", '<div class="ed-flag">미리보기 중 · 눌러서 써 보세요 (' + CMD + '\\ 로 돌아가기)</div>');
    refreshPanel(); if (sel || bgTip) select(null);
  }
  window.addEventListener("resize", function () { var v = viewOf(); if (v) { T.scale(v); T.fitHeight(v); } placeTip(); });

  /* which pieces can be changed: text with nothing but words in it, pictures (a wireframe's empty picture too),
     a wireframe's grey bars (a place for words) and the moving line of news */
  var INLINE = { SPAN: 1, B: 1, STRONG: 1, I: 1, EM: 1, BR: 1, SUP: 1, SUB: 1, SMALL: 1, MARK: 1, U: 1 };
  /* numbers are content too (12 years, a price, a year); only signs and what the page counts by itself are left alone */
  var SKIP_TXT = /^[\s\/.:–\-·()+,%×←→↑↓✕✦•]+$/, SELF = "[data-sn], [data-page], [data-sd], [data-sg], [data-quote], [data-goto], [data-sort], [data-clock], [data-hours], [data-until]";
  function ownText(el) { return [].some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); }); }
  /* a piece of text is a leaf (nothing but words) or a paragraph with a few marked words in it: one thing to change */
  function textBlock(el) {
    var t = el.textContent.trim(); if (!t || SKIP_TXT.test(t) || t.length > 400 || el.closest(SELF)) return false;
    if (el.querySelector("[data-clock], [data-hours], [data-until], button, a, input, img, select, textarea, canvas, svg")) return false;
    if (!el.children.length) return true;
    if (!ownText(el)) return false;
    return [].every.call(el.querySelectorAll("*"), function (c) { return INLINE[c.tagName]; });
  }
  /* `start` is the whole page, or a window that was just opened over it (menu, info, project page…) */
  function decorate(view, start) {
    var tp = $(".tp", view); if (!tp) return;
    var wi = 0, li = 0, top = start || tp;
    function slot(el) { el.dataset.sk = "l" + (li++); el.dataset.slotHtml = el.innerHTML; el.dataset.slotStyle = el.getAttribute("style") || ""; el.classList.add("ed-t", "ed-slot"); }
    function bars(el) { return el.children.length > 0 && [].every.call(el.children, function (c) { return c.classList.contains("wl"); }); }
    (function walk(el) {
      if (el.matches(".mq")) { el.classList.add("ed-mq"); return; } /* the moving line of news: changed as a whole */
      if (el.matches("[data-drag], svg, script, style, model-viewer, canvas, [data-clock], [data-hours], [data-until]") || (el !== top && el.matches(".lv-layer")) || (top === tp && el.matches(".lv-layer"))) return;
      if (el.classList.contains("wf")) { el.dataset.pk = "w" + (wi++); el.classList.add("ed-p"); return; }
      if (el.tagName === "IMG") { var f = (el.getAttribute("src") || "").replace(/^.*\//, "").replace(/\.jpg$/, ""), box = el.closest(".ph") || el; box.dataset.pk = f; box.classList.add("ed-p"); return; }
      if (el.classList.contains("wl") || bars(el)) { slot(el); return; } /* a wireframe's grey bars: a place where words can go */
      if (textBlock(el)) { if (el.dataset.orig === undefined) { el.dataset.orig = el.textContent; el.dataset.fs = parseFloat(getComputedStyle(el).fontSize) || 16; } el.classList.add("ed-t"); return; }
      /* loose words next to something the page fills in itself ("Free admission" beside "Opens in 3 days"): each run of words becomes its own piece */
      if (el.children.length && ownText(el) && !el.closest(SELF)) [].slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeType !== 3 || !n.textContent.trim() || SKIP_TXT.test(n.textContent.trim())) return;
        var sp = document.createElement("span"); sp.textContent = n.textContent; el.replaceChild(sp, n);
      });
      [].slice.call(el.children).forEach(walk);
    })(top);
  }
  /* words put into a wireframe's place: the bars give way to the text, sized like the bars were */
  function fillSlot(el, text) {
    var h = parseFloat((el.querySelector(".wl") || el).style.height) || 0;
    el.textContent = text; el.style.cssText = el.dataset.slotStyle + ";display:block;white-space:pre-wrap;line-height:1.3;font-size:" + (h >= 20 ? Math.round(h * 1.7) : 16) + "px;overflow-wrap:anywhere";
    el.classList.add("ed-filled");
  }
  function emptySlot(el) { el.innerHTML = el.dataset.slotHtml; el.setAttribute("style", el.dataset.slotStyle); el.classList.remove("ed-filled"); }
  /* how a piece of text is set: size, weight, slant, alignment, colour (kept by what the text said in the template) */
  function styleText(el) {
    var st = S.tstyle[el.dataset.orig] || {}, base = +el.dataset.fs || 16;
    el.style.fontSize = st.s ? (base * (1 + 0.12 * st.s)).toFixed(1) + "px" : "";
    el.style.fontWeight = st.b ? "700" : ""; el.style.fontStyle = st.i ? "italic" : ""; el.style.textAlign = st.a || ""; el.style.color = st.c || "";
  }
  function applyEdits(view) { /* `view` may be any part of the page */
    $$(".ed-t:not(.ed-slot)", view).forEach(function (el) { var o = el.dataset.orig; if (o !== undefined && S.texts[o] !== undefined) el.textContent = S.texts[o]; if (o !== undefined && S.tstyle[o]) styleText(el); });
    $$(".ed-slot", view).forEach(function (el) { if (S.slots[el.dataset.sk]) fillSlot(el, S.slots[el.dataset.sk]); });
    if (S.marquee) $$(".ed-mq", view).forEach(function (mq) { mqSet(mq, S.marquee.split(NL).filter(function (x) { return x.trim(); })); });
    $$(".ed-p", view).forEach(function (el) {
      var pk = el.dataset.pk, url = photoUrl(pk), fit = S.fit[pk];
      if (url) {
        if (!el.classList.contains("wf")) { var im0 = el.tagName === "IMG" ? el : el.querySelector("img"); if (im0) { im0.removeAttribute("srcset"); im0.src = url; } }
        else { var d = document.createElement("div"); d.className = "ph ed-p"; d.dataset.pk = pk; d.setAttribute("style", el.getAttribute("style") || ""); var im = document.createElement("img"); im.src = url; im.alt = ""; d.appendChild(im); el.replaceWith(d); el = d; }
      }
      if (fit) { var im1 = el.tagName === "IMG" ? el : el.querySelector("img"); if (im1) { im1.style.objectFit = fit; im1.style.setProperty("--fit", fit); } }
    });
  }

  /* ---------- choosing a piece: a small window opens next to it ---------- */
  function onClick(e) {
    if (mode !== "edit" || bypass) return;
    var el = e.target.closest(".ed-t, .ed-p, .ed-mq");
    e.preventDefault(); e.stopPropagation();
    if (el) return select(el);
    select(null);
    if (!phone.matches && !e.target.closest("a, button, input, select, textarea, label, .lv-layer, " + SELF)) openBgTip({ x: e.clientX, y: e.clientY });
  }
  function select(el) {
    bgTip = false;
    $$(".ed-sel", canvas).forEach(function (x) { x.classList.remove("ed-sel", "ed-sel-wf"); });
    sel = el && el.isConnected ? el : null;
    if (sel) { sel.classList.add("ed-sel"); if (sel.classList.contains("wf")) sel.classList.add("ed-sel-wf"); }
    drawTip();
  }
  function scrollTo(el) { try { el.scrollIntoView({ block: "center", behavior: "auto" }); } catch (e) {} }
  function tipHead(t) { return '<div class="ed-ph"><b>' + t + '</b><button type="button" class="ed-x" id="edTipX" aria-label="닫기">' + IC.x + '</button></div>'; }
  function tipOpen(title, html) { tip.innerHTML = tipHead(title) + '<div class="ed-pb" id="edTipB">' + html + '</div>'; tip.hidden = false; $("#edTipX").addEventListener("click", function () { select(null); }); placeTip(); }
  function placeTip() {
    if ((!sel && !bgTip) || tip.hidden || phone.matches) return;
    var r = sel ? sel.getBoundingClientRect() : { left: bgPt.x, right: bgPt.x, top: bgPt.y, bottom: bgPt.y }, w = tip.offsetWidth, h = tip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight, rail = 24, top = $(".ed-top").offsetHeight;
    var lim = vh - $(".ed-rail").offsetHeight - 22, y = r.bottom + 10; if (y + h > lim) y = r.top - h - 10; if (y < top + 8) y = Math.max(top + 8, Math.min(lim - h, top + 12));
    var x = Math.min(Math.max(8, r.left), vw - rail - w - 10);
    tip.style.left = x + "px"; tip.style.top = y + "px"; tip.style.right = "auto";
  }
  function drawTip() {
    if (!sel) { if (bgTip) return; tip.hidden = true; tip.innerHTML = ""; return; }
    if (sel.classList.contains("ed-mq")) return tipMarquee();
    if (sel.classList.contains("ed-slot")) return tipSlot();
    if (sel.classList.contains("ed-t")) return tipText();
    tipPhoto();
  }
  function layerNote() {
    var tp = $(".tp", canvas); if (!tp || !$(".lv-layer", tp)) return "";
    return '<div class="ed-box"><p class="ed-p2">지금은 열려 있는 화면을 고치고 있어요.</p><button type="button" class="ed-btn ghost" id="edLayerX">이 화면 닫기</button></div>';
  }
  function bindLayer() { var x = $("#edLayerX"); if (x) x.addEventListener("click", function () { T.closeAll($(".tp", canvas)); select(null); }); }
  /* the windows a visitor can open (info, menu, search, project page…): each can be opened here and changed too */
  var OPEN = { info: "정보 창", menu: "메뉴 창", index: "작업 색인", search: "검색 창", news: "뉴스레터 창", contact: "연락 창" };
  function openers() {
    var out = [], seen = {}, tp = $(".tp", canvas); if (!tp) return out;
    $$("[data-lv]", tp).forEach(function (el) { var k = el.dataset.lv; if (OPEN[k] && !seen[k] && !el.closest(".lv-layer")) { seen[k] = 1; out.push({ label: OPEN[k], el: el }); } });
    var pj = $("[data-proj]", tp); if (pj && !pj.closest(".lv-layer")) out.push({ label: "작품 페이지", el: pj });
    return out;
  }
  function openLayer(el) {
    var tp = $(".tp", canvas); T.closeAll(tp); bypass = true; try { el.click(); } finally { bypass = false; }
    setTimeout(function () { select(null); }, 60);
  }
  function openBtn() {
    var op = sel.closest("[data-lv], [data-proj]"), k = op && (op.dataset.lv || "proj");
    if (op && (OPEN[k] || k === "proj") && !op.closest(".lv-layer")) return '<div class="ed-box"><button type="button" class="ed-btn ghost" id="edOpen">' + (k === "proj" ? "작품 페이지" : OPEN[k]) + ' 열어서 고치기</button></div>';
    return "";
  }
  function bindOpen() { var o = $("#edOpen"); if (o) { var op = sel.closest("[data-lv], [data-proj]"); o.addEventListener("click", function () { openLayer(op); }); } }

  function tipText() {
    var o = sel.dataset.orig, val = sel.textContent, same = $$(".ed-t:not(.ed-slot)", canvas).filter(function (x) { return x.dataset.orig === o; }).length, st = S.tstyle[o] || {};
    tipOpen("글", layerNote() +
      '<div class="ed-box"><label class="ed-sr" for="edTa">글</label><textarea class="ed-ta" id="edTa" rows="3"></textarea>' +
      '<div class="ed-tools" role="group" aria-label="글 모양"><button type="button" data-ts="-1" aria-label="작게" title="작게">A−</button><button type="button" data-ts="1" aria-label="크게" title="크게">A+</button><span class="sp"></span>' +
        '<button type="button" data-tb aria-pressed="' + !!st.b + '" aria-label="굵게" title="굵게"><b>B</b></button><button type="button" data-ti aria-pressed="' + !!st.i + '" aria-label="기울임" title="기울임"><i>I</i></button><span class="sp"></span>' +
        '<button type="button" data-ta="left" aria-pressed="' + (st.a === "left") + '" aria-label="왼쪽 정렬">' + IC.left + '</button><button type="button" data-ta="center" aria-pressed="' + (st.a === "center") + '" aria-label="가운데 정렬">' + IC.center + '</button><button type="button" data-ta="right" aria-pressed="' + (st.a === "right") + '" aria-label="오른쪽 정렬">' + IC.right + '</button><span class="sp"></span>' +
        '<label title="글자색" aria-label="글자색"><input type="color" id="edTc" value="' + (st.c || "#111111") + '"></label></div>' +
      (same > 1 ? '<p class="ed-p2">같은 글 ' + same + '곳이 함께 바뀌어요. 사이트 이름은 한 번만 고치면 돼요.</p>' : '') +
      ((S.texts[o] !== undefined || S.tstyle[o]) ? '<button type="button" class="ed-link" id="edTxtReset">원래대로 되돌리기</button>' : '') + '</div>' + openBtn());
    bindLayer(); bindOpen();
    var ta = $("#edTa"); ta.value = val;
    ta.addEventListener("input", function () {
      var v = ta.value; $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === o) el.textContent = v; });
      if (v === o) delete S.texts[o]; else S.texts[o] = v;
      $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === o && S.tstyle[o]) styleText(el); });
      commit(); placeTip();
    });
    function setStyle(fn) { var s = S.tstyle[o] || (S.tstyle[o] = {}); fn(s); if (!s.s && !s.b && !s.i && !s.a && !s.c) delete S.tstyle[o]; $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === o) styleText(el); }); commit(true); tipText(); }
    $$("[data-ts]", tip).forEach(function (x) { x.addEventListener("click", function () { setStyle(function (s) { s.s = Math.max(-4, Math.min(8, (s.s || 0) + +x.dataset.ts)); }); }); });
    $("[data-tb]", tip).addEventListener("click", function () { setStyle(function (s) { s.b = s.b ? 0 : 1; }); });
    $("[data-ti]", tip).addEventListener("click", function () { setStyle(function (s) { s.i = s.i ? 0 : 1; }); });
    $$("[data-ta]", tip).forEach(function (x) { x.addEventListener("click", function () { setStyle(function (s) { s.a = s.a === x.dataset.ta ? "" : x.dataset.ta; }); }); });
    $("#edTc").addEventListener("change", function () { var v = this.value; setStyle(function (s) { s.c = v; }); });
    var r = $("#edTxtReset"); if (r) r.addEventListener("click", function () { delete S.texts[o]; delete S.tstyle[o]; $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === o) { el.textContent = o; styleText(el); } }); commit(true); tipText(); });
    if (!phone.matches) setTimeout(function () { ta.focus(); ta.select(); }, 0);
  }
  function tipSlot() {
    var k = sel.dataset.sk, val = S.slots[k] || "";
    tipOpen("여기에 들어갈 글", '<div class="ed-box"><p class="ed-p2">회색 막대 자리에 글을 적으면 막대 대신 글이 나와요. 다 지우면 막대로 돌아가요.</p><label class="ed-sr" for="edTa">글</label><textarea class="ed-ta" id="edTa" rows="4"></textarea></div>');
    var ta = $("#edTa"); ta.value = val;
    ta.addEventListener("input", function () { var v = ta.value; if (v.trim()) { S.slots[k] = v; fillSlot(sel, v); } else { delete S.slots[k]; emptySlot(sel); } commit(); placeTip(); });
    if (!phone.matches) setTimeout(function () { ta.focus(); }, 0);
  }
  /* the moving line: its phrases, one to a line (the page repeats them to fill the width) */
  function mqWords(mq) {
    var seen = {}, out = [];
    (($(".mq-in", mq) || mq).textContent || "").split("✦").forEach(function (w) { w = w.replace(/ /g, " ").trim(); if (w && !seen[w]) { seen[w] = 1; out.push(w); } });
    return out;
  }
  function mqSet(mq, words) {
    var inn = $(".mq-in", mq); if (!inn || !words.length) return;
    var line = words.map(esc).join(" &nbsp;✦&nbsp; ") + " &nbsp;✦&nbsp; "; inn.innerHTML = line + line + line + line;
  }
  function tipMarquee() {
    var words = S.marquee ? S.marquee.split(NL).filter(function (x) { return x.trim(); }) : mqWords(sel);
    tipOpen("흘러가는 글", '<div class="ed-box"><p class="ed-p2">화면에서 옆으로 흘러가는 소식이에요. 한 줄에 하나씩 적으면 사이사이에 ✦ 표시가 들어가요.</p><label class="ed-sr" for="edTa">흘러갈 글</label><textarea class="ed-ta" id="edTa" rows="5"></textarea>' +
      (S.marquee ? '<button type="button" class="ed-link" id="edMqReset">원래 글로 되돌리기</button>' : '') + '</div>');
    var ta = $("#edTa"); ta.value = words.join(NL);
    ta.addEventListener("input", function () { var v = ta.value.split(NL).filter(function (x) { return x.trim(); }); if (v.length) { S.marquee = v.join(NL); mqSet(sel, v); commit(); } });
    var r = $("#edMqReset"); if (r) r.addEventListener("click", function () { S.marquee = null; commit(true); render(); var mq = $(".ed-mq", canvas); if (mq) select(mq); });
    if (!phone.matches) setTimeout(function () { ta.focus(); }, 0);
  }
  function tipPhoto() {
    var pk = sel.dataset.pk, mine = !!photoUrl(pk), pim = sel.tagName === "IMG" ? sel : sel.querySelector("img"), src = photoUrl(pk) || (pim ? pim.currentSrc || pim.src : ""), fit = S.fit[pk] || "";
    tipOpen("사진", layerNote() + '<div class="ed-box">' +
      (src ? '<img class="ed-thumb" src="' + esc(src) + '" alt="">' : '<p class="ed-p2">아직 사진이 없는 자리예요. 사진을 올리면 이 자리에 들어가요.</p>') +
      '<input type="file" accept="image/*" id="edFile" class="ed-sr"><button type="button" class="ed-btn" id="edPick">내 사진 올리기</button>' +
      (S.lib.length ? '<button type="button" class="ed-btn ghost" id="edFromLib">올려 둔 사진에서 고르기</button>' : '') +
      '<div class="ed-tools" role="group" aria-label="사진 채우는 방식"><button type="button" data-fit="cover" aria-pressed="' + (fit === "cover") + '">꽉 채우기</button><button type="button" data-fit="contain" aria-pressed="' + (fit === "contain") + '">통째로 보이기</button></div>' +
      '<p class="ed-p2" id="edPhotoMsg">폰에서는 사진첩이나 카메라에서 고를 수 있어요. 큰 사진은 자동으로 알맞은 크기로 줄여서 저장해요.</p>' +
      (mine ? '<button type="button" class="ed-link" id="edPhotoReset">원래 사진으로 되돌리기</button>' : '') + '</div>' + openBtn());
    bindLayer(); bindOpen();
    $("#edPick").addEventListener("click", function () { $("#edFile").click(); });
    $("#edFile").addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return; var msg = $("#edPhotoMsg"); msg.textContent = "사진을 준비하고 있어요…";
      addPhoto(f, function (id, err) { if (!id) { msg.textContent = err || "이 사진은 열 수 없어요. JPG나 PNG 사진을 골라 주세요."; return; } putPhoto(pk, id); });
    });
    var fl = $("#edFromLib"); if (fl) fl.addEventListener("click", function () { openPanel("images"); });
    $$("[data-fit]", tip).forEach(function (x) { x.addEventListener("click", function () { S.fit[pk] = S.fit[pk] === x.dataset.fit ? "" : x.dataset.fit; if (!S.fit[pk]) delete S.fit[pk]; commit(true); var keep = pk; render(); var again = $('.ed-p[data-pk="' + keep + '"]', canvas); if (again) select(again); }); });
    var r = $("#edPhotoReset"); if (r) r.addEventListener("click", function () { delete S.photos[pk]; commit(true); render(); });
  }
  /* a picture from the phone or the computer, made smaller (long side 1800) so it is quick to keep and to load */
  function shrink(file, cb) {
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      var k = Math.min(1, 1800 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas");
      c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      try { cb(c.toDataURL("image/jpeg", 0.86)); } catch (e) { cb(null); }
    };
    im.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    im.src = url;
  }
  /* into "my pictures" (kept, and can be used again) */
  function addPhoto(file, cb) {
    shrink(file, function (url) {
      if (!url) return cb(null);
      var id = "u-" + (++S.libN); DATA[id] = url; S.lib.push({ id: id, name: file.name || "사진" }); dbPut(id, url); cb(id);
    });
  }
  function putPhoto(pk, id) {
    S.photos[pk] = id; commit(true);
    render(); var again = $('.ed-p[data-pk="' + pk + '"]', canvas); if (again) { scrollTo(again); select(again); }
  }
  /* a picture (or a file) dropped onto a picture on the page */
  function onDrop(e) {
    if (mode !== "edit") return;
    var el = e.target.closest && e.target.closest(".ed-p"); if (!el) return;
    var lib = e.dataTransfer && e.dataTransfer.getData("text/plain"), files = e.dataTransfer && e.dataTransfer.files;
    e.preventDefault();
    if (lib && /^u-\d+$/.test(lib) && DATA[lib]) return putPhoto(el.dataset.pk, lib);
    if (files && files.length) addPhoto(files[0], function (id) { if (id) putPhoto(el.dataset.pk, id); });
  }

  /* ---------- panels from the rail ---------- */
  var TITLE = { blocks: "페이지 구성", texts: "글 · 사진 목록", images: "내 사진", bg: "배경", type: "글꼴 · 색", motion: "스크롤 효과", feat: "기능", site: "사이트 설정" };
  var DESK_ONLY = { blocks: 1, bg: 1, type: 1, motion: 1, feat: 1 };
  function openPanel(id) {
    if (panel === id && !pop.hidden) return closePanel();
    panel = id; pop.hidden = false; select(null);
    $$("#edRail button").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.p === id); });
    pop.innerHTML = '<div class="ed-ph"><b>' + TITLE[id] + '</b><button type="button" class="ed-x" id="edPopX" aria-label="닫기">' + IC.x + '</button></div><div class="ed-pb" id="edPb"></div>';
    $("#edPopX").addEventListener("click", closePanel);
    refreshPanel();
  }
  function closePanel() { panel = null; pop.hidden = true; pop.innerHTML = ""; $$("#edRail button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); }
  function refreshPanel() {
    if (!panel || pop.hidden) return;
    var pb = $("#edPb"); if (!pb) return;
    if (phone.matches && DESK_ONLY[panel]) { pb.innerHTML = '<div class="ed-box"><h3 class="ed-h">컴퓨터에서 바꿀 수 있어요</h3><p class="ed-p2">폰에서는 글과 사진을 고치고 공개할 수 있어요. 페이지 구성, 배경, 글꼴과 색, 스크롤 효과, 기능 켜고 끄기는 컴퓨터로 들어와서 해 주세요.</p></div>'; return; }
    ({ blocks: panelBlocks, texts: panelTexts, images: panelImages, bg: panelBg, type: panelType, motion: panelMotion, feat: panelFeat, site: panelSite })[panel](pb);
  }
  $$("#edRail button").forEach(function (x) { x.addEventListener("click", function () { openPanel(x.dataset.p); }); });

  /* -- the page's parts, in order (Cargo calls this the pages list): add, remove, move -- */
  function moreParts() { var m = (S.more || orig.more || []).slice(), foot = m.length && /^f-/.test(m[m.length - 1]) ? m.pop().slice(2) : "line"; return { blocks: m, foot: foot }; }
  function setMore(blocks, foot) {
    var m = blocks.concat("f-" + foot); S.more = JSON.stringify(m) === JSON.stringify(orig.more) ? null : m;
    commit(true); var v = viewOf(), st = v ? v.scrollTop : 0; render(); var v2 = viewOf(); if (v2) v2.scrollTop = st;
  }
  function panelBlocks(pb) {
    if (!gen) { pb.innerHTML = '<div class="ed-box"><h3 class="ed-h">이 템플릿은 구성이 정해져 있어요</h3><p class="ed-p2">손으로 만든 템플릿이라 첫 화면 아래 부분을 바꿀 수 없어요. 글, 사진, 색, 메뉴 기능은 바꿀 수 있어요.</p></div>'; return; }
    var mp = moreParts(), left = GEN.MORE.blocks.filter(function (k) { return mp.blocks.indexOf(k) < 0; });
    pb.innerHTML = '<div class="ed-box"><p class="ed-p2">첫 화면 아래에 이어지는 부분이에요. 끌어서 순서를 바꾸고, ✕로 빼고, 아래에서 더할 수 있어요.</p></div>' +
      '<div class="ed-box"><div class="ed-blk lock"><span class="ed-grip" aria-hidden="true">•</span><span class="n">첫 화면<small>' + esc(GEN.layouts[gen.layout].ko) + '</small></span><span></span></div>' +
      '<div id="edBlks">' + mp.blocks.map(function (k, i) {
        return '<div class="ed-blk" draggable="true" data-i="' + i + '"><span class="ed-grip" aria-hidden="true">⋮⋮</span><button type="button" class="n" data-go="' + i + '" style="text-align:left">' + BLK[k] + '<small>' + GEN.MORE.en[k] + '</small></button><span class="b"><button type="button" data-mv="-1" aria-label="위로" ' + (i ? "" : "disabled") + '>' + IC.up + '</button><button type="button" data-mv="1" aria-label="아래로" ' + (i < mp.blocks.length - 1 ? "" : "disabled") + '>' + IC.down + '</button><button type="button" data-rm aria-label="빼기">' + IC.x + '</button></span></div>';
      }).join("") + '</div></div>' +
      (left.length ? '<div class="ed-box"><h3 class="ed-h">더하기</h3><div class="ed-chips">' + left.map(function (k) { return '<button type="button" class="ed-chip" data-add="' + k + '">+ ' + BLK[k] + '</button>'; }).join("") + '</div></div>' : '') +
      '<div class="ed-box"><h3 class="ed-h">맨 아래 모양</h3><div class="ed-chips">' + GEN.MORE.foots.map(function (k) { return '<button type="button" class="ed-chip" data-foot="' + k + '" aria-pressed="' + (k === mp.foot) + '">' + FOOT[k] + '</button>'; }).join("") + '</div></div>';
    $$("[data-mv]", pb).forEach(function (x) { x.addEventListener("click", function () { var i = +x.closest(".ed-blk").dataset.i, j = i + +x.dataset.mv, a = mp.blocks.slice(); if (j < 0 || j >= a.length) return; a.splice(j, 0, a.splice(i, 1)[0]); setMore(a, mp.foot); }); });
    $$("[data-rm]", pb).forEach(function (x) { x.addEventListener("click", function () { var a = mp.blocks.slice(); a.splice(+x.closest(".ed-blk").dataset.i, 1); setMore(a, mp.foot); }); });
    $$("[data-add]", pb).forEach(function (x) { x.addEventListener("click", function () { setMore(mp.blocks.concat(x.dataset.add), mp.foot); var v = viewOf(); if (v) v.scrollTop = v.scrollHeight; }); });
    $$("[data-foot]", pb).forEach(function (x) { x.addEventListener("click", function () { setMore(mp.blocks, x.dataset.foot); }); });
    $$("[data-go]", pb).forEach(function (x) { x.addEventListener("click", function () { var el = $('.tp-more [data-sec="' + x.dataset.go + '"]', canvas); if (el) el.scrollIntoView({ block: "start", behavior: "auto" }); }); });
    var drag = -1;
    $$(".ed-blk[draggable]", pb).forEach(function (row) {
      row.addEventListener("dragstart", function (e) { drag = +row.dataset.i; row.classList.add("drag"); try { e.dataTransfer.setData("text/plain", "blk"); e.dataTransfer.effectAllowed = "move"; } catch (x) {} });
      row.addEventListener("dragend", function () { row.classList.remove("drag"); $$(".over", pb).forEach(function (o) { o.classList.remove("over"); }); });
      row.addEventListener("dragover", function (e) { if (drag < 0) return; e.preventDefault(); $$(".over", pb).forEach(function (o) { o.classList.remove("over"); }); row.classList.add("over"); });
      row.addEventListener("drop", function (e) { e.preventDefault(); var to = +row.dataset.i; if (drag < 0 || drag === to) return; var a = mp.blocks.slice(); a.splice(to, 0, a.splice(drag, 1)[0]); drag = -1; setMore(a, mp.foot); });
    });
  }

  /* -- every word and picture on the page (and the windows a visitor can open) -- */
  function panelTexts(pb) {
    var texts = [], seen = {}, pics = [], pseen = {}, slots = $$(".ed-slot", canvas), mq = $(".ed-mq", canvas);
    $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { var o = el.dataset.orig; if (seen[o]) return; seen[o] = 1; texts.push(el); });
    $$(".ed-p", canvas).forEach(function (el) { var k = el.dataset.pk; if (pseen[k]) return; pseen[k] = 1; pics.push(el); });
    var h = '<div class="ed-box"><p class="ed-p2">' + (mode === "edit" ? "화면에서 직접 눌러도 되고, 여기서 골라도 돼요. 바꾼 내용은 자동으로 저장돼요." : "지금은 미리보기 중이에요. 고치려면 위의 화살표 버튼(" + CMD + "\\)을 누르세요.") + '</p></div>';
    if (pics.length) h += '<div class="ed-box"><h3 class="ed-h">사진 ' + pics.length + '</h3><div class="ed-pics">' + pics.slice(0, 40).map(function (el, i) {
      var im = el.tagName === "IMG" ? el : el.querySelector("img"), src = photoUrl(el.dataset.pk) || (im ? im.currentSrc || im.src : ""); return '<button type="button" data-p="' + i + '" aria-label="사진 ' + (i + 1) + '">' + (src ? '<img src="' + esc(src) + '" alt="">' : "") + '</button>'; }).join("") + '</div></div>';
    if (slots.length) h += '<div class="ed-box"><h3 class="ed-h">글을 넣을 자리 ' + slots.length + '</h3><p class="ed-p2">회색 막대는 글이 들어갈 자리예요.</p><ul class="ed-rows">' + slots.slice(0, 40).map(function (el, i) {
      var v = S.slots[el.dataset.sk]; return '<li><button type="button" data-s="' + i + '"><span class="t">' + (v ? esc(v.slice(0, 40)) : "자리 " + (i + 1)) + '</span><span class="k">' + (v ? "고치기" : "글 넣기") + '</span></button></li>'; }).join("") + '</ul></div>';
    if (texts.length) h += '<div class="ed-box"><h3 class="ed-h">글 ' + texts.length + '</h3><ul class="ed-rows">' + texts.slice(0, 80).map(function (el, i) {
      return '<li><button type="button" data-t="' + i + '"><span class="t">' + esc(el.textContent.trim().slice(0, 60)) + '</span><span class="k">고치기</span></button></li>'; }).join("") + '</ul></div>';
    if (mq) h += '<div class="ed-box"><h3 class="ed-h">흘러가는 글</h3><ul class="ed-rows"><li><button type="button" id="edMqRow"><span class="t">' + esc(mqWords(mq).slice(0, 3).join(" · ")) + '</span><span class="k">고치기</span></button></li></ul></div>';
    var ops = openers();
    if (ops.length) h += '<div class="ed-box"><h3 class="ed-h">다른 화면도 고치기</h3><p class="ed-p2">방문자가 눌러 열어 보는 화면이에요. 열고 그 안의 글과 사진을 고쳐 보세요.</p><ul class="ed-rows">' + ops.map(function (o, i) { return '<li><button type="button" data-o="' + i + '"><span class="t">' + o.label + '</span><span class="k">열기</span></button></li>'; }).join("") + '</ul></div>';
    pb.innerHTML = h;
    function pick(el) { scrollTo(el); setTimeout(function () { select(el); }, 40); }
    $$("[data-t]", pb).forEach(function (x) { x.addEventListener("click", function () { pick(texts[+x.dataset.t]); }); });
    $$("[data-p]", pb).forEach(function (x) { x.addEventListener("click", function () { pick(pics[+x.dataset.p]); }); });
    $$("[data-s]", pb).forEach(function (x) { x.addEventListener("click", function () { pick(slots[+x.dataset.s]); }); });
    var mqr = $("#edMqRow", pb); if (mqr) mqr.addEventListener("click", function () { pick(mq); });
    $$("[data-o]", pb).forEach(function (x) { x.addEventListener("click", function () { openLayer(ops[+x.dataset.o].el); }); });
  }

  /* -- my pictures: put in once, use anywhere (click one while a picture on the page is chosen, or drag it onto a picture) -- */
  function panelImages(pb) {
    var pic = sel && sel.classList.contains("ed-p") ? sel : null;
    pb.innerHTML = '<label class="ed-drop-zone" id="edZone"><span><b>사진 올리기</b></span><span>여기에 끌어 놓거나 눌러서 고르세요 (여러 장 가능)</span><input type="file" accept="image/*" multiple id="edLibFile" class="ed-sr"></label>' +
      '<p class="ed-p2" id="edLibMsg">' + (pic ? "지금 고른 사진 자리에 넣을 사진을 아래에서 누르세요." : "페이지의 사진을 먼저 누르고 아래 사진을 누르면 그 자리에 들어가요. 사진을 끌어서 페이지의 사진 위에 놓아도 돼요.") + '</p>' +
      (S.lib.length ? '<div class="ed-pics">' + S.lib.map(function (it) { return DATA[it.id] ? '<div class="it"><button type="button" data-u="' + it.id + '" draggable="true" aria-label="' + esc(it.name) + '"><img src="' + esc(DATA[it.id]) + '" alt=""></button><button type="button" class="del" data-del="' + it.id + '" aria-label="지우기">' + IC.x + '</button></div>' : ""; }).join("") + '</div>' : '<p class="ed-p2">아직 올린 사진이 없어요.</p>');
    var zone = $("#edZone", pb), inp = $("#edLibFile", pb);
    function many(files) {
      var fs = [].slice.call(files || []).filter(function (f) { return /^image\//.test(f.type) || /\.(jpe?g|png|gif|webp|avif)$/i.test(f.name); }); if (!fs.length) return;
      var msg = $("#edLibMsg", pb); msg.textContent = fs.length + "장을 준비하고 있어요…"; var left = fs.length;
      fs.forEach(function (f) { addPhoto(f, function () { if (--left === 0) { commit(true); refreshPanel(); } }); });
    }
    inp.addEventListener("change", function () { many(this.files); });
    zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("on"); });
    zone.addEventListener("dragleave", function () { zone.classList.remove("on"); });
    zone.addEventListener("drop", function (e) { e.preventDefault(); zone.classList.remove("on"); many(e.dataTransfer.files); });
    $$("[data-u]", pb).forEach(function (x) {
      x.addEventListener("click", function () { if (pic && pic.isConnected) putPhoto(pic.dataset.pk, x.dataset.u); else $("#edLibMsg", pb).textContent = "먼저 페이지에서 바꿀 사진을 눌러 주세요."; });
      x.addEventListener("dragstart", function (e) { try { e.dataTransfer.setData("text/plain", x.dataset.u); } catch (z) {} });
    });
    $$("[data-del]", pb).forEach(function (x) { x.addEventListener("click", function () { var id = x.dataset.del; S.lib = S.lib.filter(function (i) { return i.id !== id; }); Object.keys(S.photos).forEach(function (k) { if (S.photos[k] === id) delete S.photos[k]; }); if (S.bgImg === id) S.bgImg = null; delete DATA[id]; dbPut(id, null); commit(true); render(); }); });
  }

  /* -- typeface and colours -- */
  function lum(hex) { var m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return 0; var n = parseInt(m[1], 16), a = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
  function contrast(a, z) { var x = lum(a), y = lum(z); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function panelType(pb) {
    var bg = S.bg || orig.bg, ink = S.ink || orig.ink, face = S.face || orig.face || "", low = contrast(bg, ink) < 3;
    function sw(list, cur, kind) { return '<div class="ed-sws">' + list.map(function (c) { return '<button type="button" class="ed-c" style="background:' + c + '" aria-label="' + c + '" aria-pressed="' + (c.toLowerCase() === String(cur).toLowerCase()) + '" data-c="' + c + '" data-kind="' + kind + '"></button>'; }).join("") + '<input type="color" class="ed-cin" value="' + (/^#[0-9a-f]{6}$/i.test(cur) ? cur : "#ffffff") + '" data-kind="' + kind + '" aria-label="직접 고르기"></div>'; }
    pb.innerHTML = '<div class="ed-box"><h3 class="ed-h">바탕색</h3>' + sw(BGS, bg, "bg") + '</div><div class="ed-box"><h3 class="ed-h">글자색</h3>' + sw(INKS, ink, "ink") + (low ? '<p class="ed-warn">글자가 바탕과 비슷해서 읽기 어려워요. 다른 색을 골라 보세요.</p>' : '') + '</div>' +
      '<div class="ed-box"><h3 class="ed-h">글꼴</h3><div class="ed-faces">' + Object.keys(GEN.FACES).map(function (k) { return '<button type="button" class="ed-face" aria-pressed="' + (k === face) + '" data-f="' + k + '"><span class="s" style="font-family:' + GEN.FACES[k][0].replace(/"/g, "'") + ';font-stretch:' + GEN.FACES[k][1] + '">가나다 Abc</span><span class="l">' + FACE[k] + '</span></button>'; }).join("") + '</div>' +
      (!gen ? '<p class="ed-p2">이 템플릿은 일부 글에만 글꼴이 적용될 수 있어요.</p>' : '') + '</div><p class="ed-p2">개별 글의 크기와 굵기는 화면에서 그 글을 눌러 바꿔요.</p>' +
      ((S.bg || S.ink || S.face) ? '<button type="button" class="ed-link" id="edLookReset">색과 글꼴을 원래대로</button>' : '');
    $$(".ed-c", pb).forEach(function (x) { x.addEventListener("click", function () { S[x.dataset.kind] = x.dataset.c === orig[x.dataset.kind] ? null : x.dataset.c; commit(true); render(); }); });
    $$(".ed-cin", pb).forEach(function (x) { x.addEventListener("change", function () { S[x.dataset.kind] = x.value; commit(true); render(); }); });
    $$(".ed-face", pb).forEach(function (x) { x.addEventListener("click", function () { S.face = x.dataset.f === orig.face ? null : x.dataset.f; commit(true); render(); }); });
    var r = $("#edLookReset", pb); if (r) r.addEventListener("click", function () { S.bg = S.ink = S.face = null; commit(true); render(); });
  }

  /* -- features in plain words -- */
  function feats() { return (S.feats || orig.feats || []).slice(); }
  function setFeats(f) { S.feats = f.sort(); if (JSON.stringify(S.feats) === JSON.stringify(orig.feats)) S.feats = null; commit(true); render(); }
  function sel24(id, v) { var o = ""; for (var i = 0; i < 24; i++) o += '<option value="' + i + '"' + (i === +v ? " selected" : "") + '>' + i + '</option>'; return '<select class="ed-sel2" id="' + id + '">' + o + '</select>'; }
  function defDate() { var d = new Date(Date.now() + 30 * 864e5); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function frow(k, on, gid, locked) {
    var d = FEAT[k] || [k, ""], set = "";
    if (on && k === "hours") { var hh = gen && gen.hours || [10 + (gen ? gen.seed % 3 : 0), 18 + (gen ? gen.seed % 3 : 0)]; set = '<label class="ed-sr" for="edO">여는 시각</label>' + sel24("edO", hh[0]) + '<span>시부터</span>' + sel24("edC", hh[1]) + '<span>시까지</span>'; }
    if (on && k === "countdown") { var u = S.until || (gen && gen.until) || ""; set = '<label for="edU">날짜</label><input class="ed-in" type="date" id="edU" value="' + esc(u || defDate()) + '">'; }
    if (on && k === "marquee") set = '<span class="ed-p2">화면 아래 흘러가는 글을 눌러 문구를 고쳐요.</span>';
    return '<div class="ed-row"><span class="n">' + d[0] + '</span><button type="button" class="ed-sw" role="switch" aria-checked="' + on + '" aria-label="' + esc(d[0]) + '" data-k="' + k + '" data-g="' + gid + '"' + (locked && on ? ' aria-disabled="true"' : "") + '></button><span class="h">' + d[1] + '</span>' + (set ? '<div class="set">' + set + '</div>' : "") + '</div>';
  }
  function panelFeat(pb) {
    var h = "", groups = null;
    if (!gen) {
      var ex = S.extra || orig.extra;
      h += '<div class="ed-box"><p class="ed-p2">이 템플릿은 화면 구성이 정해져 있어서 메뉴에 넣을 기능만 바꿀 수 있어요.</p></div><div class="ed-grp"><h3 class="ed-h">메뉴에 넣을 것</h3>' + ["search", "news", "clock", "contact"].map(function (k) { return frow(k, ex.indexOf(k) >= 0, "menu", false); }).join("") + '</div>';
    } else {
      var cur = feats(); groups = GEN.featuresFor(gen);
      h += '<div class="ed-box"><p class="ed-p2">스위치를 켜면 바로 페이지에 나타나요. 눌러 보려면 위의 화살표 버튼(' + CMD + '\\)을 누르세요.</p></div>';
      groups.forEach(function (g) { h += '<div class="ed-grp"><h3 class="ed-h">' + (GROUP[g.id] || g.id) + '</h3>' + g.items.map(function (k) { return frow(k, cur.indexOf(k) >= 0, g.id, g.type === "radio" && !g.none); }).join("") + '</div>'; });
    }
    pb.innerHTML = h;
    function group(k) { for (var i = 0; groups && i < groups.length; i++) if (groups[i].items.indexOf(k) >= 0) return groups[i]; return null; }
    $$(".ed-sw", pb).forEach(function (sw) {
      sw.addEventListener("click", function () {
        if (sw.getAttribute("aria-disabled") === "true") return;
        var k = sw.dataset.k, on = sw.getAttribute("aria-checked") !== "true";
        if (!gen) { var ex2 = (S.extra || orig.extra).slice(), i = ex2.indexOf(k); if (on && i < 0) ex2.push(k); if (!on && i >= 0) ex2.splice(i, 1); S.extra = JSON.stringify(ex2.slice().sort()) === JSON.stringify(orig.extra.slice().sort()) ? null : ex2; commit(true); render(); return; }
        var g = group(k), f = feats();
        if (g && g.type === "radio") g.items.forEach(function (x) { var j = f.indexOf(x); if (j >= 0) f.splice(j, 1); });
        var j2 = f.indexOf(k); if (on && j2 < 0) f.push(k); if (!on && j2 >= 0) f.splice(j2, 1);
        setFeats(f);
      });
    });
    var o = $("#edO", pb), c = $("#edC", pb);
    if (o && c) [o, c].forEach(function (x) { x.addEventListener("change", function () { S.hours = [+o.value, +c.value]; commit(true); render(); }); });
    var u = $("#edU", pb); if (u) u.addEventListener("change", function () { S.until = u.value || null; commit(true); render(); });
  }

  /* -- the site as a whole -- */
  function panelSite(pb) {
    var name = T.site || T.defName, cur = S.texts[name] !== undefined ? S.texts[name] : name, host = T.host;
    pb.innerHTML = '<div class="ed-box"><h3 class="ed-h">사이트 이름</h3><label class="ed-sr" for="edName">사이트 이름</label><input class="ed-in" id="edName" type="text" maxlength="40"><p class="ed-p2">페이지 곳곳에 나오는 이름이 한 번에 바뀌어요.</p></div>' +
      '<div class="ed-box"><h3 class="ed-h">사이트 주소</h3><p class="ed-p2"><b style="color:#000">' + esc(host) + '</b></p><button type="button" class="ed-btn ghost" id="edAddr">주소 정하기</button></div>' +
      '<div class="ed-box"><h3 class="ed-h">파비콘 (탭에 보이는 작은 아이콘)</h3><div class="ed-tabmock"><img id="edFavPrev" alt="" ' + (S.fav ? 'src="' + esc(S.fav) + '"' : 'hidden') + '><span class="ed-favdef"' + (S.fav ? ' hidden' : '') + '>1440</span><span class="t">' + esc(S.title || cur) + '</span></div><input type="file" accept="image/*,.ico,.svg" id="edFavFile" class="ed-sr"><button type="button" class="ed-btn ghost" id="edFavPick">' + (S.fav ? "다른 아이콘으로 바꾸기" : "아이콘 올리기") + '</button>' + (S.fav ? '<button type="button" class="ed-link" id="edFavOff">기본 아이콘으로 되돌리기</button>' : '') + '<p class="ed-p2" id="edFavMsg">정사각형 이미지가 좋아요. 자동으로 64×64로 맞춰요.</p></div>' +
      '<div class="ed-box"><h3 class="ed-h">검색에 나올 제목과 설명</h3><label class="ed-sr" for="edTitle">제목</label><input class="ed-in" id="edTitle" type="text" maxlength="60" placeholder="사이트 제목"><label class="ed-sr" for="edDesc">설명</label><textarea class="ed-ta" id="edDesc" rows="3" maxlength="160" placeholder="이 사이트를 한두 문장으로 소개해 보세요"></textarea><p class="ed-p2">공개한 뒤 검색 결과와 링크 미리보기에 쓰여요.</p></div>' +
      (phone.matches ? "" : '<div class="ed-box"><h3 class="ed-h">단축키</h3><ul class="ed-rows"><li><span class="t">되돌리기</span><span class="k ed-kbd">' + CMD + 'Z</span></li><li><span class="t">다시 하기</span><span class="k ed-kbd">' + CMD + '⇧Z</span></li><li><span class="t">미리보기 켜고 끄기</span><span class="k ed-kbd">' + CMD + '\</span></li><li><span class="t">폰 · 컴퓨터 화면 바꾸기</span><span class="k ed-kbd">' + CMD + '⇧X</span></li><li><span class="t">공개하기</span><span class="k ed-kbd">' + CMD + 'P</span></li><li><span class="t">고르기 풀기 · 창 닫기</span><span class="k ed-kbd">Esc</span></li></ul></div>') +
      '<div class="ed-box"><h3 class="ed-h">저장</h3><p class="ed-p2">고친 내용은 자동으로 이 브라우저에 초안으로 저장돼요. 공개하기 전에는 다른 사람에게 보이지 않아요.</p><button type="button" class="ed-link" id="edReset">모두 처음 상태로 되돌리기</button></div>';
    var nm = $("#edName", pb), tt = $("#edTitle", pb), ds = $("#edDesc", pb); nm.value = cur; tt.value = S.title || ""; ds.value = S.desc || "";
    nm.addEventListener("input", function () {
      var v = nm.value; $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === name) el.textContent = v; });
      if (!v.trim() || v === name) delete S.texts[name]; else S.texts[name] = v; commit();
    });
    var ff = $("#edFavFile", pb); $("#edFavPick", pb).addEventListener("click", function () { ff.click(); });
    ff.addEventListener("change", function () { var file = ff.files && ff.files[0]; if (!file) return; makeIcon(file, function (u) { if (!u) { $("#edFavMsg", pb).textContent = "이 파일은 열 수 없어요. PNG나 JPG, SVG 이미지를 골라 주세요."; return; } S.fav = u; commit(true); applyFav(); refreshPanel(); }); });
    var fo = $("#edFavOff", pb); if (fo) fo.addEventListener("click", function () { S.fav = null; commit(true); applyFav(); refreshPanel(); });
    tt.addEventListener("input", function () { S.title = tt.value; commit(); });
    ds.addEventListener("input", function () { S.desc = ds.value; commit(); });
    $("#edAddr", pb).addEventListener("click", publish);
    $("#edReset", pb).addEventListener("click", function () { if (!confirm("지금까지 고친 내용을 모두 지우고 처음 템플릿으로 되돌릴까요?")) return; Object.keys(DATA).forEach(function (k) { dbPut(k, null); delete DATA[k]; }); S = fresh(); commit(true); select(null); render(); });
  }

  /* -- the page's background: a colour and/or a picture (opened from the dock, or by pressing an empty place on the page) -- */
  function swHtml(list, cur, kind) { return '<div class="ed-sws">' + list.map(function (c) { return '<button type="button" class="ed-c" style="background:' + c + '" aria-label="' + c + '" aria-pressed="' + (c.toLowerCase() === String(cur).toLowerCase()) + '" data-c="' + c + '" data-kind="' + kind + '"></button>'; }).join("") + '<input type="color" class="ed-cin" value="' + (/^#[0-9a-f]{6}$/i.test(cur) ? cur : "#ffffff") + '" data-kind="' + kind + '" aria-label="직접 고르기"></div>'; }
  function applyBg(view) {
    var tp = $(".tp", view), url = S.bgImg && DATA[S.bgImg]; if (!tp) return;
    if (!url) { tp.style.backgroundImage = ""; return; }
    var d = Math.max(0, Math.min(0.8, +S.bgDim || 0)), fit = S.bgFit || "cover", img = 'url("' + url + '")', sz = fit === "tile" ? "34%" : fit;
    tp.style.backgroundImage = d ? "linear-gradient(rgba(0,0,0," + d + "), rgba(0,0,0," + d + "))," + img : img;
    tp.style.backgroundSize = d ? "100% 100%," + sz : sz;
    tp.style.backgroundRepeat = fit === "tile" ? (d ? "no-repeat,repeat" : "repeat") : "no-repeat";
    tp.style.backgroundPosition = "center top";
  }
  function bgHtml() {
    var bg = S.bg || orig.bg, url = S.bgImg && DATA[S.bgImg], fit = S.bgFit || "cover";
    return '<div class="ed-box"><h3 class="ed-h">바탕색</h3>' + swHtml(BGS, bg, "bg") + '</div>' +
      '<div class="ed-box"><h3 class="ed-h">배경 사진</h3>' +
      (url ? '<img class="ed-thumb" src="' + esc(url) + '" alt="">' : '<p class="ed-p2">사진을 올리면 페이지 뒤에 깔려요. 글이 잘 안 보이면 사진을 어둡게 하거나 글자색을 바꿔 보세요.</p>') +
      '<input type="file" accept="image/*" id="edBgFile" class="ed-sr"><button type="button" class="ed-btn" id="edBgPick">' + (url ? "다른 사진으로 바꾸기" : "배경 사진 올리기") + '</button>' +
      (S.lib.length ? '<button type="button" class="ed-btn ghost" id="edBgLib">올려 둔 사진에서 고르기</button><div class="ed-pics" id="edBgPics" hidden>' + S.lib.map(function (it) { return DATA[it.id] ? '<button type="button" data-u="' + it.id + '" aria-label="' + esc(it.name) + '"><img src="' + esc(DATA[it.id]) + '" alt=""></button>' : ""; }).join("") + '</div>' : "") +
      (url ? '<div class="ed-tools" role="group" aria-label="배경 사진 놓는 방식"><button type="button" data-bf="cover" aria-pressed="' + (fit === "cover") + '">꽉 채우기</button><button type="button" data-bf="contain" aria-pressed="' + (fit === "contain") + '">통째로</button><button type="button" data-bf="tile" aria-pressed="' + (fit === "tile") + '">타일처럼 반복</button></div>' +
        '<label class="ed-rng"><span>사진 어둡게</span><input type="range" id="edBgDim" min="0" max="80" step="5" value="' + Math.round((+S.bgDim || 0) * 100) + '"></label>' +
        '<button type="button" class="ed-link" id="edBgOff">배경 사진 빼기</button>' : "") +
      '<p class="ed-p2" id="edBgMsg">폰에서도 사진을 고를 수 있어요. 큰 사진은 알맞은 크기로 줄여서 저장해요.</p></div>';
  }
  function bgBind(root, inTip) {
    function redo() { render(); if (inTip) openBgTip(); }
    $$(".ed-c", root).forEach(function (x) { x.addEventListener("click", function () { S.bg = x.dataset.c === orig.bg ? null : x.dataset.c; commit(true); redo(); }); });
    $$(".ed-cin", root).forEach(function (x) { x.addEventListener("change", function () { S.bg = x.value; commit(true); redo(); }); });
    var f = $("#edBgFile", root); $("#edBgPick", root).addEventListener("click", function () { f.click(); });
    f.addEventListener("change", function () {
      var file = f.files && f.files[0]; if (!file) return; var msg = $("#edBgMsg", root); msg.textContent = "사진을 준비하고 있어요…";
      addPhoto(file, function (id) { if (!id) { msg.textContent = "이 사진은 열 수 없어요. JPG나 PNG 사진을 골라 주세요."; return; } S.bgImg = id; commit(true); redo(); });
    });
    var lb = $("#edBgLib", root); if (lb) lb.addEventListener("click", function () { var g = $("#edBgPics", root); g.hidden = !g.hidden; });
    $$("[data-u]", root).forEach(function (x) { x.addEventListener("click", function () { S.bgImg = x.dataset.u; commit(true); redo(); }); });
    $$("[data-bf]", root).forEach(function (x) { x.addEventListener("click", function () { S.bgFit = x.dataset.bf; commit(true); redo(); }); });
    var dm = $("#edBgDim", root); if (dm) dm.addEventListener("input", function () { S.bgDim = +dm.value / 100; applyBg(viewOf()); commit(); });
    var off = $("#edBgOff", root); if (off) off.addEventListener("click", function () { S.bgImg = null; commit(true); redo(); });
  }
  function panelBg(pb) { pb.innerHTML = bgHtml() + '<p class="ed-p2">페이지의 빈 곳을 눌러도 이 창이 열려요.</p>'; bgBind(pb, false); }
  function openBgTip(pt) {
    if (pt) { select(null); bgPt = pt; } else if (!bgTip) return;
    bgTip = true; tipOpen("배경", bgHtml()); bgBind(tip, true);
  }

  /* -- what happens as the page is scrolled (seen in the preview): things appear softly, a bar shows how far, a button goes back to the top -- */
  var REVEAL = { fade: "서서히", rise: "아래에서 올라오며", zoom: "살짝 커지며", slide: "옆에서" };
  function mo() { return S.motion || {}; }
  function setMo(k, v) { var m = Object.assign({}, S.motion || {}); if (v === "" || v === false || v === undefined) delete m[k]; else m[k] = v; S.motion = Object.keys(m).length ? m : null; commit(true); render(); }
  function panelMotion(pb) {
    var m = mo(), r = m.r || "", t = m.t || "all", sp = m.sp || "mid";
    function chips(id, cur, list) { return '<div class="ed-chips" data-k="' + id + '">' + list.map(function (x) { return '<button type="button" class="ed-chip" data-v="' + x[0] + '" aria-pressed="' + (cur === x[0]) + '">' + x[1] + '</button>'; }).join("") + '</div>'; }
    function sw(k, on, n, h) { return '<div class="ed-row"><span class="n">' + n + '</span><button type="button" class="ed-sw" role="switch" aria-checked="' + on + '" data-mk="' + k + '" aria-label="' + n + '"></button><span class="h">' + h + '</span></div>'; }
    pb.innerHTML = '<div class="ed-box"><p class="ed-p2">화면 아래로 스크롤할 때 나타나는 방식이에요. 고른 뒤 아래 버튼이나 위의 화살표 버튼(' + CMD + '\\)으로 미리보기에서 확인하세요.</p><button type="button" class="ed-btn ghost" id="edMoTry">미리보기로 보기</button></div>' +
      '<div class="ed-box"><h3 class="ed-h">나타나는 방식</h3>' + chips("r", r, [["", "없음"]].concat(Object.keys(REVEAL).map(function (k) { return [k, REVEAL[k]]; }))) + '</div>' +
      (r ? '<div class="ed-box"><h3 class="ed-h">나타나게 할 것</h3>' + chips("t", t, [["all", "사진과 글"], ["photo", "사진만"], ["text", "글만"]]) + '</div>' +
        '<div class="ed-box"><h3 class="ed-h">속도</h3>' + chips("sp", sp, [["fast", "빠르게"], ["mid", "보통"], ["slow", "천천히"]]) + '</div>' : "") +
      '<div class="ed-grp"><h3 class="ed-h">함께 쓸 수 있는 것</h3>' +
      sw("bar", !!m.bar, "읽은 만큼 보이는 선", "화면 맨 위에 얼마나 내려왔는지 가는 선으로 보여 줘요.") +
      sw("par", !!m.par, "사진이 살짝 늦게 따라오기", "스크롤할 때 사진이 글보다 조금 천천히 움직여 깊이감이 생겨요.") +
      sw("top", !!m.top, "맨 위로 가는 버튼", "아래로 내려가면 왼쪽 아래에 나타나요.") + '</div>';
    $$(".ed-chips", pb).forEach(function (c) { $$("button", c).forEach(function (x) { x.addEventListener("click", function () { setMo(c.dataset.k, x.dataset.v); }); }); });
    $$(".ed-sw", pb).forEach(function (x) { x.addEventListener("click", function () { setMo(x.dataset.mk, x.getAttribute("aria-checked") !== "true"); }); });
    $("#edMoTry", pb).addEventListener("click", function () { if (mode !== "try") setMode("try"); });
  }
  function applyMotion(view) {
    var m = S.motion; if (!m || mode !== "try") return;
    var vr = view.getBoundingClientRect(), vh = view.clientHeight, bar = null, top = null;
    if (m.r) {
      var pick = m.t === "photo" ? ".ed-p" : m.t === "text" ? ".ed-t, .ed-mq" : ".ed-t, .ed-p, .ed-mq", dur = { fast: 0.45, mid: 0.8, slow: 1.3 }[m.sp || "mid"] || 0.8;
      var all = $$(pick, view).filter(function (x) { return !x.closest(".lv-layer") && x.offsetParent !== null && x.getBoundingClientRect().top - vr.top > vh * 0.9; });
      all = all.filter(function (x) { return !all.some(function (y) { return y !== x && y.contains(x); }); });
      view.style.setProperty("--rv-d", dur + "s");
      all.forEach(function (x, i) { x.classList.add("ed-rv", "ed-rv-" + m.r); x.dataset.rvd = i % 2; });
      var io = new IntersectionObserver(function (es) {
        es.filter(function (e) { return e.isIntersecting; }).sort(function (a, z) { return a.boundingClientRect.top - z.boundingClientRect.top; }).forEach(function (e, i) {
          var el = e.target; io.unobserve(el); el.style.transitionDelay = Math.min(i, 5) * 90 + "ms"; el.classList.add("ed-rv-in");
          setTimeout(function () { el.classList.remove("ed-rv", "ed-rv-" + m.r, "ed-rv-in"); el.style.transitionDelay = ""; }, dur * 1000 + Math.min(i, 5) * 90 + 120);
        });
      }, { root: view, threshold: 0.12 });
      all.forEach(function (x) { io.observe(x); });
    }
    if (m.bar) { bar = document.createElement("div"); bar.className = "ed-prog"; canvas.appendChild(bar); }
    if (m.top) { top = document.createElement("button"); top.type = "button"; top.className = "ed-totop"; top.textContent = "↑ 맨 위로"; top.hidden = true; canvas.appendChild(top); top.addEventListener("click", function () { view.scrollTo({ top: 0, behavior: "smooth" }); }); }
    var pars = m.par ? $$(".ed-p img, img.ed-p", view).filter(function (im) { return getComputedStyle(im).objectFit === "cover"; }) : [], raf = 0;
    pars.forEach(function (im) { im.style.scale = "1.12"; });
    function tick() {
      raf = 0; var max = view.scrollHeight - view.clientHeight;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? view.scrollTop / max : 0) + ")";
      if (top) top.hidden = view.scrollTop < vh * 0.6;
      pars.forEach(function (im) { var r = im.getBoundingClientRect(), k = ((r.top + r.height / 2) - (vr.top + vh / 2)) / vh; k = Math.max(-1, Math.min(1, k)); im.style.translate = "0 " + (k * -5).toFixed(2) + "%"; });
    }
    view.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true }); tick();
  }

  /* -- the tab icon (favicon) -- */
  function makeIcon(file, cb) {
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      var w = im.naturalWidth || 64, h = im.naturalHeight || 64, k = Math.min(w, h), c = document.createElement("canvas"); c.width = c.height = 64;
      try { c.getContext("2d").drawImage(im, (w - k) / 2, (h - k) / 2, k, k, 0, 0, 64, 64); URL.revokeObjectURL(url); cb(c.toDataURL("image/png")); } catch (e) { URL.revokeObjectURL(url); cb(null); }
    };
    im.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    im.src = url;
  }
  function applyFav() {
    var l = document.querySelector('link[rel~="icon"]');
    if (!l) { l = document.createElement("link"); l.rel = "icon"; document.head.appendChild(l); }
    if (l.dataset.orig === undefined) l.dataset.orig = l.getAttribute("href") || "";
    if (S.fav) { l.setAttribute("href", S.fav); l.type = "image/png"; } else { if (l.dataset.orig) l.setAttribute("href", l.dataset.orig); l.removeAttribute("type"); }
    var f = $("#edFav"); if (f) { if (S.fav) { f.src = S.fav; f.hidden = false; } else f.hidden = true; }
  }

  /* -- the size of whatever the pointer is over (in the page's own pixels) -- */
  var meas = document.createElement("div"); meas.className = "ed-meas"; meas.hidden = true; meas.innerHTML = "<i></i><b></b>"; root.appendChild(meas);
  var mEl = null, mRaf = 0, mView = null;
  function zoomOf(view) { return parseFloat(view.firstElementChild && view.firstElementChild.style.zoom) || 1; }
  function measShow() {
    mRaf = 0; if (!mEl || !mEl.isConnected || mode !== "edit" || !mView) { meas.hidden = true; return; }
    var r = mEl.getBoundingClientRect(), z = zoomOf(mView), w = Math.round(r.width / z), h = Math.round(r.height / z);
    if (r.width < 1 || r.height < 1) { meas.hidden = true; return; }
    var i = meas.firstChild, b = meas.lastChild, txt = w + " × " + h;
    if (mEl.tagName === "IMG" && mEl.naturalWidth) txt += "  ·  원본 " + mEl.naturalWidth + " × " + mEl.naturalHeight;
    b.textContent = txt; meas.hidden = false;
    i.style.cssText = "left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px";
    var bw = b.offsetWidth, bh = b.offsetHeight, top = $(".ed-top").offsetHeight, y = r.top - bh - 5; if (y < top + 4) y = Math.min(r.top + 5, window.innerHeight - bh - 4);
    b.style.left = Math.max(4, Math.min(r.left, window.innerWidth - bw - 4)) + "px"; b.style.top = y + "px";
  }
  function measureBind(view) {
    mView = view; mEl = null; meas.hidden = true;
    if (!window.matchMedia("(hover: hover)").matches) return;
    view.addEventListener("mousemove", function (e) { var t = e.target; mEl = t === view ? null : t; if (!mRaf) mRaf = requestAnimationFrame(measShow); });
    view.addEventListener("mouseleave", function () { mEl = null; meas.hidden = true; });
    view.addEventListener("scroll", function () { if (mEl && !mRaf) mRaf = requestAnimationFrame(measShow); }, { passive: true });
  }

  /* -- the dock: a name appears over the icon under the pointer; pressing one makes it hop once, as in the Mac's Dock -- */
  (function () {
    var dock = $("#edRail"), dt = document.createElement("div");
    dt.className = "ed-dtip"; dt.hidden = true; root.appendChild(dt);
    $$("button", dock).forEach(function (x) {
      x.addEventListener("pointerenter", function (e) { if (e.pointerType === "touch") return; var r = x.getBoundingClientRect(); dt.textContent = x.dataset.tip; dt.style.left = r.left + r.width / 2 + "px"; dt.style.top = r.top - 10 + "px"; dt.hidden = false; });
      x.addEventListener("pointerleave", function () { dt.hidden = true; });
      x.addEventListener("click", function () { dt.hidden = true; x.classList.remove("hop"); void x.offsetWidth; x.classList.add("hop"); });
      x.addEventListener("animationend", function () { x.classList.remove("hop"); });
    });
  })();

  /* a short line at the bottom that goes away by itself */
  function hint(t) { var f = document.createElement("div"); f.className = "ed-flag"; f.textContent = t; canvas.appendChild(f); setTimeout(function () { f.remove(); }, 4500); }
  /* ---------- top bar ---------- */
  function setMode(m) { mode = m; select(null); $("#edPreview").setAttribute("aria-pressed", String(m === "try")); render(); }
  function setDev(d) { dev = d; select(null); $("#edDevice").setAttribute("aria-pressed", String(d === "mob")); $("#edDevice").innerHTML = d === "mob" ? IC.desk : IC.mob; $("#edDevice").setAttribute("aria-label", d === "mob" ? "컴퓨터 화면으로 보기" : "폰 화면으로 보기"); render(); }
  $("#edPreview").addEventListener("click", function () { setMode(mode === "edit" ? "try" : "edit"); });
  $("#edDevice").addEventListener("click", function () { setDev(dev === "mob" ? "desk" : "mob"); });
  $("#edBack").addEventListener("click", function () { location.href = "templates.html" + (T.site ? "?site=" + encodeURIComponent(T.site) : ""); });

  /* ---------- publish: the address is chosen here, at the end ---------- */
  var dlg = $("#edDlg");
  function closeDlg() { dlg.hidden = true; }
  function publish() {
    var name = ""; try { name = localStorage.getItem("1440-site-name") || T.site || ""; } catch (e) {}
    $(".ed-dlg-box", dlg).innerHTML = '<h2 class="ed-h" id="edDlgT" style="font-size:1.4em">공개하기</h2><p class="ed-p2">내 사이트 주소를 정해 주세요. 영문 소문자, 숫자, 하이픈(-)을 쓸 수 있어요.</p>' +
      '<div class="ed-addr"><label class="ed-sr" for="edAddrIn">주소</label><input id="edAddrIn" type="text" maxlength="30" value="' + esc(name) + '" placeholder="이름" autocapitalize="off" autocomplete="off" spellcheck="false"><span>.kor.gallery</span></div>' +
      '<p class="ed-p2" id="edAddrMsg">가입과 로그인, 실제 공개는 준비 중이에요. 지금은 주소만 저장해 둘게요. 고친 내용은 이 브라우저에 초안으로 저장되어 있어요.</p>' +
      '<div class="ed-dlg-b"><button type="button" class="ed-btn ghost" id="edDlgX">닫기</button><button type="button" class="ed-btn" id="edDlgOk">주소 저장</button></div>';
    dlg.hidden = false; var inp = $("#edAddrIn");
    inp.addEventListener("input", function () { var v = inp.value.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30); if (v !== inp.value) inp.value = v; });
    $("#edDlgX").addEventListener("click", closeDlg);
    $("#edDlgOk").addEventListener("click", function () {
      var v = inp.value.replace(/^-+|-+$/g, ""), m = $("#edAddrMsg");
      if (v.length < 2) { m.textContent = "두 글자 이상 적어 주세요."; inp.focus(); return; }
      try { localStorage.setItem("1440-site-name", v); } catch (e) {}
      m.textContent = v + ".kor.gallery 주소를 저장했어요. 가입·공개는 준비 중이에요."; T.setHost(v); render();
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDlg(); }, { once: true });
    setTimeout(function () { inp.focus(); }, 0);
  }
  $("#edPub").addEventListener("click", publish);

  /* ---------- keys, as in the tools people already know ---------- */
  document.addEventListener("keydown", function (e) {
    var meta = e.metaKey || e.ctrlKey, key = (e.key || "").toLowerCase(), typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ""));
    if (e.key === "Escape") { if (!dlg.hidden) closeDlg(); else if (sel || bgTip) select(null); else if (panel) closePanel(); return; }
    if (!meta) return;
    if (key === "z" && !typing) { e.preventDefault(); travel(e.shiftKey ? 1 : -1); }
    else if (key === "\\") { e.preventDefault(); setMode(mode === "edit" ? "try" : "edit"); }
    else if (key === "x" && e.shiftKey) { e.preventDefault(); setDev(dev === "mob" ? "desk" : "mob"); }
    else if (key === "p") { e.preventDefault(); publish(); }
  });
  phone.addEventListener && phone.addEventListener("change", function () { if (phone.matches && dev !== "mob") setDev("mob"); else { render(); } });

  /* ---------- development check: templates.html?edit=1&check=editor[&deep=1][&from=1&to=1440] ----------
     Opens every template in the editor, on a computer and on a phone, the way a person would: the page is drawn and
     its words and pictures found, a piece of text is changed and set in a new size, features and parts of the page are
     switched and moved, colours and a typeface are changed, every panel is opened, a picture is chosen. What breaks (an
     error, an empty page, a change that does not show) is written into <body data-editor> as { checked, bad }.
     Nothing is kept. */
  if (CHECK) {
    var DEEP = /[?&]deep=1/.test(location.search), cBad = [], cDone = 0, from = +qs.get("from") || 1, to = +qs.get("to") || T.total;
    var cNote = function (n, why) { cBad.push(T.tag(n) + ": " + why); };
    var cOne = function (n) {
      use(n); mode = "edit";
      ["desk", "mob"].forEach(function (d) {
        dev = d; S = fresh(); select(null);
        try { render(); } catch (e) { cNote(n, d + " draw failed: " + e.message); return; }
        var view = viewOf(), tp = view && $(".tp", view);
        if (!tp || !tp.children.length) return cNote(n, d + " empty page");
        var ts = $$(".ed-t:not(.ed-slot)", view), sl = $$(".ed-slot", view), ps = $$(".ed-p", view);
        if (!ts.length && !sl.length && !ps.length) cNote(n, d + " nothing can be changed");
        if (ts.length) {
          var el = ts[0], o = el.dataset.orig;
          select(el); var ta = $("#edTa"); if (!ta) return cNote(n, d + " no text box");
          ta.value = "테스트 글"; ta.dispatchEvent(new Event("input"));
          if (el.textContent !== "테스트 글" || S.texts[o] !== "테스트 글") cNote(n, d + " a changed text does not show");
          var up = $('[data-ts="1"]', tip); if (up) { up.click(); if (!S.tstyle[o] || S.tstyle[o].s !== 1) cNote(n, d + " a text size does not change"); }
          render(); var again = $$(".ed-t:not(.ed-slot)", canvas).filter(function (x) { return x.dataset.orig === o; })[0];
          if (!again || again.textContent !== "테스트 글") cNote(n, d + " a changed text is lost when the page is drawn again");
        }
        if (sl.length) { select(null); select($$(".ed-slot", canvas)[0]); var t2 = $("#edTa"); if (t2) { t2.value = "자리 글"; t2.dispatchEvent(new Event("input")); } }
        var mqe = $(".ed-mq", canvas);
        if (mqe) { select(mqe); var t3 = $("#edTa"); if (!t3) cNote(n, d + " no text box for the moving line"); else { t3.value = "가" + NL + "나"; t3.dispatchEvent(new Event("input")); if (($(".mq-in", mqe).textContent || "").indexOf("가") < 0) cNote(n, d + " the moving line does not change"); S.marquee = null; } }
        if (ps.length) { select($$(".ed-p", canvas)[0]); if (!$("#edFile")) cNote(n, d + " no picture button"); }
        select(null);
        ["blocks", "texts", "images", "bg", "type", "motion", "feat", "site"].forEach(function (id) { try { panel = null; openPanel(id); if (!$("#edPb").children.length) cNote(n, d + " panel " + id + " is empty"); } catch (e) { cNote(n, d + " panel " + id + " failed: " + e.message); } });
        closePanel();
        if (d === "desk") {
          if (gen) {
            var groups = GEN.featuresFor(gen); if (!DEEP) groups = groups.slice(0, 3);
            groups.forEach(function (g) {
              (DEEP ? g.items : [g.items[0]]).forEach(function (k) {
                S.feats = null; var f = feats(), on = f.indexOf(k) >= 0;
                if (g.type === "radio") g.items.forEach(function (x) { var j = f.indexOf(x); if (j >= 0) f.splice(j, 1); });
                if (on) f.splice(f.indexOf(k), 1); else f.push(k);
                try { S.feats = f.sort(); render(); } catch (e) { cNote(n, "switching " + k + " failed: " + e.message); }
                if (!$(".tp", canvas) || !$(".tp", canvas).children.length) cNote(n, "empty page after switching " + k);
              });
            });
            S.feats = null;
            /* the parts of the page: take one out, add every other, move, change the foot */
            var mp = moreParts(), sets = [mp.blocks.slice(1), mp.blocks.slice().reverse(), GEN.MORE.blocks.slice(0, DEEP ? 12 : 4)];
            if (DEEP) GEN.MORE.blocks.forEach(function (k) { sets.push([k]); });
            GEN.MORE.foots.forEach(function (ft) { sets.push(null, ft); });
            sets.forEach(function (a, i) {
              try {
                if (a === null) return;
                if (typeof a === "string") { S.more = mp.blocks.concat("f-" + a); } else S.more = a.concat("f-" + mp.foot);
                render();
                if (!$(".tp-more", canvas)) cNote(n, "the lower part of the page is missing after changing the parts");
              } catch (e) { cNote(n, "changing the parts of the page failed: " + e.message); }
            });
            S.more = null;
          } else { S.extra = ["search", "news"]; try { render(); } catch (e) { cNote(n, "switching menu items failed: " + e.message); } S.extra = null; }
          S.bg = "#ffcc00"; S.ink = "#222222"; S.face = "serif";
          try { render(); var st = $(".tp", canvas).getAttribute("style") || ""; if (st.indexOf("#ffcc00") < 0) cNote(n, "the background colour does not show"); } catch (e) { cNote(n, "colours failed: " + e.message); }
          /* the page's background picture, the scrolling effects, the tab icon and the size under the pointer */
          try {
            DATA["t-bg"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="; S.lib.push({ id: "t-bg", name: "t" }); S.bgImg = "t-bg"; S.bgDim = 0.3; render();
            if (($(".tp", canvas).style.backgroundImage || "").indexOf("url(") < 0) cNote(n, "the background picture does not show");
            openBgTip({ x: 200, y: 200 }); if (!$("#edBgPick", tip) || tip.hidden) cNote(n, "the background window does not open"); select(null);
            S.motion = { r: "rise", t: "all", bar: 1, par: 1, top: 1 }; mode = "try"; render(); mode = "edit";
            S.fav = DATA["t-bg"]; applyFav(); var lk = document.querySelector('link[rel~="icon"]'); if (!lk || lk.getAttribute("href") !== S.fav) cNote(n, "the tab icon does not change"); S.fav = null; applyFav();
            S.motion = null; render(); var t1 = $$(".ed-t:not(.ed-slot)", canvas).filter(function (x) { var q = x.getBoundingClientRect(); return q.width > 1 && q.height > 1; })[0];
            if (t1) { mView = viewOf(); mEl = t1; measShow(); if (meas.hidden || !/\d+ × \d+/.test(meas.lastChild.textContent)) cNote(n, "the size under the pointer is not shown"); mEl = null; meas.hidden = true; }
          } catch (e) { cNote(n, "background, scrolling effects or tab icon failed: " + e.message); }
          S = fresh();
        }
      });
      S = fresh(); try { model(); } catch (e) {}
    };
    var cStep = function (n) {
      if (n > to) { canvas.innerHTML = ""; closePanel(); T.clearTimers(); document.body.dataset.editor = JSON.stringify({ checked: cDone, bad: cBad }); return; }
      document.body.dataset.editorAt = n;
      try { cOne(n); } catch (e) { cNote(n, "error " + e.message); }
      cDone++; setTimeout(function () { cStep(n + 1); }, 0);
    };
    cStep(from);
    return;
  }

  /* start: the pictures the person added before, then the page */
  undoState();
  openDb(function () { dbLoad(function () { render(); state.textContent = Object.keys(S.texts).length || Object.keys(S.photos).length || S.feats || S.more || S.bg || S.ink || S.face ? "초안 · 저장됨" : "초안"; hint("글이나 사진을 눌러서 고쳐 보세요"); }); });
})();
