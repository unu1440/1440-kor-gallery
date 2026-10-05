/* The editor: templates.html?edit=n (&site=name).
   The chosen template fills the screen and is changed where it stands: click a word or a picture and a small window
   opens next to it. A slim rail on the right holds the panels (the page's parts, words and pictures, my pictures,
   typeface and colours, features, site settings); a thin bar on top holds preview and phone (undo and publish are keys).
   The page is drawn with the same code the previews use (window.T1440, see templates.js).
   Changes are kept in this browser (localStorage for words and settings, IndexedDB for the pictures a person adds).
   Words are matched by what they said in the template ("Work" everywhere becomes the new word), so they survive the
   page being drawn again when a feature or a part is switched.
   For a person with no web knowledge: plain Korean, switches, live results, undo, nothing that needs code.
   A phone is for content (words, pictures, checking, publishing); structure and design are for a computer. */
(function () {
  "use strict";
  /* SV: a published site (이름.kor.gallery). The server puts the snapshot in window.SITE_VIEW; the page is drawn as in
     preview, with nothing of the editor around it */
  var SV = window.SITE_VIEW && +window.SITE_VIEW.n ? window.SITE_VIEW : null;
  var T = window.T1440, qs = new URLSearchParams(location.search), N = SV ? +SV.n : +qs.get("edit"), C = SV ? "" : (qs.get("c") || "").replace(/[^a-z0-9]/gi, "").slice(0, 12);
  if (!T || !N || !T.find(N)) return;
  var CHECK = !SV && /[?&]check=editor/.test(location.search); /* development check: see the end of this file */
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
  var BLK = { video: "동영상", table: "작업 표", list: "큰 작업 목록", cv: "이력 (전시 기록)", news: "소식", clients: "함께한 곳", statement: "큰 문장", about: "소개", contact: "연락", timeline: "연표", stats: "숫자", quotes: "후기", team: "팀", available: "의뢰 받는 중", faq: "자주 묻는 질문", price: "가격표", process: "작업 과정", press: "언론 소개", awards: "수상", visit: "찾아오기", links: "링크 모음" };
  var FOOT = { line: "한 줄", columns: "네 칸", name: "큰 이름" };
  var BGS = ["#ffffff", "#fcfcfc", "#f4f4f4", "#f3efe6", "#f6f4f0", "#e9e7e3", "#f4d9cf", "#dfe8d5", "#cfe0ef", "#ffe14d", "#ff8a00", "#0a5cff", "#111111", "#000000"];
  var INKS = ["#111111", "#000000", "#333333", "#ffffff", "#0a5cff", "#1f3fd1", "#b8231a", "#f0462e", "#153f2a", "#2b1bb3"];
  var SVG = function (d, extra) { return '<svg viewBox="0 0 24 24"' + (extra || "") + '>' + d + '</svg>'; };
  var IC = {
    ratio: SVG('<rect x="5" y="4" width="14" height="16" rx="1.5"/><path d="M9 8h6M9 16h6"/>'),
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
  function fresh() { return { texts: {}, tstyle: {}, links: {}, video: null, slots: {}, photos: {}, fit: {}, lib: [], libN: 0, pages: [{ id: "home", type: "page", name: "홈" }], models: {}, rooms: {}, bg: null, bgImg: null, bgFit: "cover", bgDim: 0, motion: null, fav: null, ink: null, face: null, feats: null, more: null, hours: null, until: null, marquee: null, extra: null, title: "", desc: "", ratio: null }; }
  /* the template being changed (the check at the end changes it again and again) */
  function use(n) {
    N = n; b = T.find(n); gen = b.gen; KEY = "1440-edit-" + n + "-" + (T.site || T.defName) + (n === N && C ? "~" + C : "");
    orig = { feats: gen ? gen.feats.slice() : null, more: gen && gen.more ? gen.more.slice() : null, bg: b.bg, ink: b.ink, font: b.font, stretch: b.stretch, extra: (T.handExtra(n) || []).slice(), face: gen ? gen.face : null };
    S = fresh();
    if (SV) { var pubd = SV.s || {}; for (var k1 in S) if (pubd[k1] !== undefined) S[k1] = pubd[k1]; }
    else if (!CHECK) try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) for (var k0 in S) if (saved[k0] !== undefined) S[k0] = saved[k0]; } catch (e) {}
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
      '<div class="ed-l"><button type="button" class="ed-home" id="edBack" aria-label="폼 다시 고르기" title="폼 다시 고르기"><span class="bk" aria-hidden="true">←</span><img class="ed-logo" src="assets/favicon.png?v=1" alt=""></button><span class="ed-no">' + T.tag(N) + '</span>' +
      '<img class="ed-fav" id="edFav" alt="" hidden></div>' +
    '<nav class="ed-rail" id="edRail" aria-label="편집 도구">' +
      '<button type="button" id="edFilesBtn" data-tip="패널" aria-label="탐색기·도구·레이어" aria-pressed="false">탐색기 · 도구 · 레이어</button>' +
      '<button type="button" data-p="blocks" data-tip="페이지 구성" aria-label="페이지 구성" aria-pressed="false">구성</button>' +
      '<button type="button" data-p="texts" data-tip="글 · 사진 목록" aria-label="글 · 사진 목록" aria-pressed="false">글·사진</button>' +
      '<button type="button" data-p="images" data-tip="내 사진" aria-label="내 사진" aria-pressed="false">내 사진</button>' +
      '<button type="button" data-p="bg" data-tip="배경" aria-label="배경" aria-pressed="false">배경</button>' +
      '<button type="button" data-p="type" data-tip="글꼴 · 색" aria-label="글꼴 · 색" aria-pressed="false">글꼴·색</button>' +
      '<button type="button" data-p="motion" data-tip="스크롤 효과" aria-label="스크롤 효과" aria-pressed="false">스크롤</button>' +
      '<button type="button" data-p="feat" data-tip="기능" aria-label="기능" aria-pressed="false">기능</button>' +
      '<button type="button" data-p="site" data-tip="사이트 설정" aria-label="사이트 설정" aria-pressed="false">설정</button>' +
    '</nav>' +
      '<div class="ed-r">' +
        '<button type="button" class="ed-pub ed-pub-mob" id="edPubMob">공개하기</button>' +
        '<button type="button" class="ed-ic" id="edPreview" aria-pressed="false" aria-label="미리보기 ' + CMD + '\\" title="미리보기 ' + CMD + '\\">' + IC.point + '</button>' +
        '<button type="button" class="ed-ic ed-ratio-btn" id="edRatio" aria-haspopup="true" aria-expanded="false" aria-label="화면 비율" title="화면 비율">' + IC.ratio + '</button>' +
        '<button type="button" class="ed-ic ed-dev-desk" id="edDevice" aria-pressed="false" aria-label="폰 화면으로 보기" title="폰 화면 ' + CMD + '⇧X">' + IC.mob + '</button>' +
        '</div>' +
    '</header>' +
    '<aside class="ed-files" id="edFiles" aria-label="폴더"></aside><div class="ed-save"><span class="ed-save-t" id="edSave" role="status"></span><button type="button" class="ed-pub" id="edPub" title="공개하기 ' + CMD + 'P">공개하기</button></div>' +
    '<div class="ed-3d" id="ed3d" hidden></div>' +
    '<div class="ed-rs" id="edRs" role="separator" aria-orientation="vertical" aria-label="폭 조절" tabindex="0"></div>' +
    '<div class="ed-canvas ed-edit" id="edCanvas"></div>' +
    '<aside class="ed-pop" id="edPop" hidden></aside><aside class="ed-tip" id="edTip" hidden></aside>' +
    '<div class="ed-dlg" id="edDlg" hidden role="dialog" aria-modal="true" aria-labelledby="edDlgT"><div class="ed-dlg-box"></div></div>';
  document.body.appendChild(root);
  if (!SV) document.title = "편집 · " + T.tag(N); /* a site keeps the title the server gave it */
  var canvas = $("#edCanvas"), state = $("#edSave"), pop = $("#edPop"), tip = $("#edTip");
  var mode = SV ? "try" : "edit", dev = phone.matches ? "mob" : "desk", panel = null, sel = null, bypass = false, bgTip = false, bgPt = { x: 0, y: 0 };

  /* ---------- keeping and undoing ---------- */
  var hist = [JSON.stringify(S)], hp = 0, saveT = 0;
  /* the corner of the side panel: "자동저장 : 방금 전", and for a moment any short message (moved, copied…) */
  var savedAt = 0, noteT = 0;
  function ago(t) { var s = (Date.now() - t) / 1000, d = new Date(t); return s < 60 ? "방금 전" : s < 3600 ? Math.floor(s / 60) + "분 전" : s < 86400 ? Math.floor(s / 3600) + "시간 전" : (d.getMonth() + 1) + "월 " + d.getDate() + "일"; }
  function showSave(busy) { if (noteT) return; state.textContent = "자동저장 : " + (busy ? "저장 중…" : savedAt ? ago(savedAt) : "켜짐"); }
  setInterval(function () { showSave(); }, 30000);
  function persist() {
    if (CHECK) return;
    drawFiles();
    try { localStorage.setItem(KEY, JSON.stringify(S)); savedAt = Date.now(); showSave(); } catch (e) { note("저장하지 못했어요"); }
    try { var ed = JSON.parse(localStorage.getItem("1440-edited") || "{}"); ed[KEY] = Date.now(); localStorage.setItem("1440-edited", JSON.stringify(ed)); } catch (e) {} /* when this draft was last changed: My hub opens the newest */
    if (window.ACCOUNT && Date.now() - touchedAt > 60000) { touchedAt = Date.now(); ACCOUNT.touch(N, T.site || "", C); }
  }
  function commit(now) {
    if (CHECK) return;
    clearTimeout(saveT);
    saveT = setTimeout(function () {
      var j = JSON.stringify(S); if (j === hist[hp]) return;
      hist = hist.slice(0, hp + 1); hist.push(j); if (hist.length > 60) hist.shift(); hp = hist.length - 1;
      persist(); undoState();
    }, now ? 0 : 500);
    showSave(true);
  }
  $("#edPub").addEventListener("click", function () { publish(); }); $("#edPubMob").addEventListener("click", function () { publish(); });
  function undoState() {} /* undo and redo are keys only (Ctrl/⌘+Z, ⇧Z): the bar has no buttons for them */
  function travel(d) {
    var to = hp + d; if (to < 0 || to >= hist.length) return;
    hp = to; S = JSON.parse(hist[hp]); persist(); undoState(); select(null); render();
  }

  /* ---------- drawing the page ---------- */
  function model() {
    if (gen) { gen.feats = (S.feats || orig.feats).slice(); gen.more = (S.more || orig.more || []).slice(); gen.hours = S.hours || undefined; gen.until = S.until || undefined; gen.marqueeText = S.marquee || undefined; }
    else { T.handExtra(N, S.extra || orig.extra); b.moreList = S.more && S.more.length ? S.more.slice() : null; }
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
    applyRatio();
    var other = swapPage(view, mob);
    view.dataset.edit = mode === "edit" ? "1" : "";
    $$("canvas.rake", view).forEach(function (cv) { var u = photoUrl(cv.dataset.img); if (u) cv.dataset.src = u; });
    T.bringToLife(view, b, mob);
    if (mode === "edit") T.clearTimers(); /* nothing moves while it is being changed */
    if (!other) decorate(view);
    applyEdits(view); applyBg(view); applyMotion(view); applyFav(); measureBind(view);
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
    if (mode === "try" && !SV) canvas.insertAdjacentHTML("beforeend", '<div class="ed-flag">미리보기 중 · 눌러서 써 보세요 (' + CMD + '\\ 로 돌아가기)</div>');
    refreshPanel(); if (sel || bgTip) select(null);
    if (hidL[0] || hidL[1] || hidL[2]) applyLayerVis();
    drawFiles();
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
    /* pieces set side by side in a row (a caption's number, title and year): each is its own text, not one run "01Black Jug2026" */
    if (/flex|grid/.test(getComputedStyle(el).display)) return false;
    return [].every.call(el.querySelectorAll("*"), function (c) { return INLINE[c.tagName]; });
  }
  /* `start` is the whole page, or a window that was just opened over it (menu, info, project page…) */
  function decorate(view, start) {
    var tp = $(".tp", view); if (!tp) return;
    var wi = 0, li = 0, top = start || tp;
    function slot(el) { el.dataset.sk = "l" + (li++); el.dataset.slotHtml = el.innerHTML; el.dataset.slotStyle = el.getAttribute("style") || ""; el.classList.add("ed-t", "ed-slot"); }
    function bars(el) { return el.children.length > 0 && [].every.call(el.children, function (c) { return c.classList.contains("wl"); }); }
    (function walk(el) {
      if (el.matches("[data-video]")) { el.dataset.vh = el.innerHTML; el.classList.add("ed-v"); return; } /* a film frame: changed as a whole */
      if (el.matches(".mq")) { el.classList.add("ed-mq"); return; } /* the moving line of news: changed as a whole */
      if (el.matches("model-viewer")) { el.dataset.pk = "m:" + (el.getAttribute("src") || "").replace(/^.*\//, "").replace(/\.gltf$/, ""); el.classList.add("ed-m"); return; } /* a 3D object */
      if (el.matches("canvas.rake")) { el.dataset.pk = el.dataset.img; el.classList.add("ed-p"); return; } /* the painting the light moves over */
      if (el.namespaceURI && el.namespaceURI.indexOf("svg") >= 0) { /* the words on a floor plan and the like */
        if (el.tagName === "svg") [].forEach.call(el.querySelectorAll("g.room"), function (g, i) { g.dataset.rk = "r" + i; g.classList.add("ed-room"); });
        if (el.tagName === "svg") [].forEach.call(el.querySelectorAll("text"), function (t) { if (!t.children.length && t.textContent.trim() && !t.closest("[data-clock], [data-hours]")) { if (t.dataset.orig === undefined) { t.dataset.orig = t.textContent; t.dataset.fs = parseFloat(getComputedStyle(t).fontSize) || 16; } t.classList.add("ed-t"); } });
        return;
      }
      if (el.matches("[data-drag], script, style, model-viewer, canvas, [data-clock], [data-hours], [data-until]") || (el !== top && el.matches(".lv-layer")) || (top === tp && el.matches(".lv-layer"))) return;
      if (el.classList.contains("wf")) { el.dataset.pk = "w" + (wi++); el.classList.add("ed-p"); return; }
      if (el.tagName === "IMG") { var f = (el.getAttribute("src") || "").replace(/^.*\//, "").replace(/\.jpg$/, ""), box = el.closest(".ph") || el; box.dataset.pk = f; box.classList.add("ed-p"); return; }
      if (el.classList.contains("wl") || bars(el)) { slot(el); return; } /* a wireframe's grey bars: a place where words can go */
      if (textBlock(el)) { if (el.dataset.orig === undefined) { el.dataset.orig = el.dataset.row || el.textContent; el.dataset.ot = el.textContent; el.dataset.fs = parseFloat(getComputedStyle(el).fontSize) || 16; } el.classList.add("ed-t"); return; }
      /* loose words next to something the page fills in itself ("Free admission" beside "Opens in 3 days"): each run of words becomes its own piece */
      if (el.children.length && ownText(el) && !el.closest(SELF)) [].slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeType !== 3 || !n.textContent.trim() || SKIP_TXT.test(n.textContent.trim())) return;
        var sp = document.createElement("span"); sp.textContent = n.textContent; el.replaceChild(sp, n);
      });
      /* the pieces of a row (a caption's number, title and year) are named after their row, so changing one card's year
         changes that card only, not every "2026" on the page; the site's own name keeps its name (설정 changes it everywhere) */
      if (el.children.length > 1 && /flex|grid/.test(getComputedStyle(el).display) && [].every.call(el.children, function (c) { return INLINE[c.tagName] && !c.children.length; })) {
        var row = el.textContent, nm0 = T.site || T.defName;
        [].forEach.call(el.children, function (c, i) { if (c.dataset.row === undefined && c.textContent.trim() !== nm0) c.dataset.row = row + "§" + i; });
      }
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
  /* a link given to a button or word: what was typed becomes a web, mail or phone address (anything else is dropped) */
  function hrefOf(v) {
    v = String(v || "").trim(); if (!v) return "";
    if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "mailto:" + v;
    if (/^\+?[\d\s-]{7,}$/.test(v)) return "tel:" + v.replace(/[\s-]/g, "");
    if (/^[^\s:]+\.[^\s:]{2,}/.test(v) && !/\s/.test(v)) return "https://" + v;
    return "";
  }
  function setHref(el, v) { var h = hrefOf(v); if (h) el.dataset.href = h; else delete el.dataset.href; }
  function styleText(el) {
    var st = S.tstyle[el.dataset.orig] || {}, base = +el.dataset.fs || 16;
    el.style.fontSize = st.s ? (base * (1 + 0.12 * st.s)).toFixed(1) + "px" : "";
    el.style.fontWeight = st.b ? "700" : ""; el.style.fontStyle = st.i ? "italic" : ""; el.style.textAlign = st.a || ""; el.style.color = st.c || "";
  }
  /* a film: a file the person put up, or a YouTube / Vimeo / .mp4 link. Only addresses built here are used: a film from a link is a plain
     video tag or a frame of YouTube-nocookie / Vimeo built from its id, and it loads only when pressed */
  function videoOf(v) {
    v = String(v || "").trim(); var m;
    if ((m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i.exec(v))) return { kind: "embed", label: "YouTube", url: "https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0" };
    if ((m = /vimeo\.com\/(?:video\/)?(\d{6,})/i.exec(v))) return { kind: "embed", label: "Vimeo", url: "https://player.vimeo.com/video/" + m[1] + "?autoplay=1" };
    if (/^https?:\/\/[^\s"'<>]+\.(mp4|webm)(\?[^\s"'<>]*)?$/i.test(v)) return { kind: "file", url: v };
    return null;
  }
  /* a video in "my pictures": kept like a picture (a file as it was read, or /m/… once the site is published) and shown by what it is */
  var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function isVid(u) { return /^data:video\//.test(u || "") || /^\/m\/[a-f0-9]{64}\.(mp4|webm)$/.test(u || ""); }
  function thumb(u, cls) { return isVid(u) ? '<video class="' + (cls || "") + '" src="' + esc(u) + '#t=0.1" muted playsinline preload="metadata"></video>' : '<img class="' + (cls || "") + '" src="' + esc(u) + '" alt="">'; }
  /* a video where a picture was: it plays by itself, silent and in a loop (stays still for people who asked for less motion) */
  function vidFrom(src, url, fit) {
    var v = document.createElement("video"); v.src = url + (/^data:/.test(url) ? "" : "#t=0.1"); v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata"; v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
    if (!REDUCE) v.autoplay = true;
    v.className = (src.className || "") + " ed-pv"; v.setAttribute("style", src.getAttribute("style") || ""); if (src.dataset && src.dataset.pk) v.dataset.pk = src.dataset.pk;
    if (fit) v.style.objectFit = fit;
    return v;
  }
  function fillVideo(el) {
    var v = S.video, src = "", emb = null;
    if (v && v.id && DATA[v.id]) src = DATA[v.id]; else if (v && v.link) { var p = videoOf(v.link); if (p) { if (p.kind === "file") src = p.url; else emb = p; } }
    if (src) el.innerHTML = '<video controls playsinline preload="metadata" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000"></video>', el.firstChild.src = src;
    else if (emb) el.innerHTML = '<button type="button" class="lv-a" data-vembed="' + emb.url + '" style="position:absolute;inset:0;width:100%;height:100%;display:grid;place-items:center;font-size:1.1em;background:#000;color:#fff">▶ ' + emb.label + '</button>';
    else el.innerHTML = el.dataset.vh;
  }
  function applyEdits(view) { /* `view` may be any part of the page */
    $$(".ed-t:not(.ed-slot)", view).forEach(function (el) { var o = el.dataset.orig; if (o !== undefined && S.texts[o] !== undefined) el.textContent = S.texts[o]; if (o !== undefined && S.tstyle[o]) styleText(el); if (o !== undefined && el.classList.contains("lv-a")) setHref(el, S.links && S.links[o]); });
    $$(".ed-slot", view).forEach(function (el) { if (S.slots[el.dataset.sk]) fillSlot(el, S.slots[el.dataset.sk]); });
    if (S.marquee) $$(".ed-mq", view).forEach(function (mq) { mqSet(mq, S.marquee.split(NL).filter(function (x) { return x.trim(); })); });
    $$(".ed-v", view).forEach(fillVideo);
    $$(".ed-m", view).forEach(function (m) { var id = S.models[m.dataset.pk]; if (id && DATA[id]) m.setAttribute("src", DATA[id]); });
    $$(".ed-room", view).forEach(function (g) { var a = S.rooms[g.dataset.rk]; if (a) g.dataset.over = JSON.stringify(a.map(function (id) { return id === "-" ? "-" : ((id && DATA[id]) || ""); })); });
    $$(".ed-p", view).forEach(function (el) {
      var pk = el.dataset.pk, url = photoUrl(pk), fit = S.fit[pk];
      if (url && isVid(url) && el.tagName !== "CANVAS") {
        var host = el.tagName === "IMG" || el.tagName === "VIDEO" ? el : el.querySelector("img, video"), nv;
        if (el.classList.contains("wf")) { nv = document.createElement("div"); nv.className = "ph ed-p"; nv.dataset.pk = pk; nv.setAttribute("style", el.getAttribute("style") || ""); nv.appendChild(vidFrom(document.createElement("i"), url, fit)); el.replaceWith(nv); el = nv; }
        else if (host === el) { nv = vidFrom(el, url, fit); el.replaceWith(nv); el = nv; }
        else if (host) host.replaceWith(vidFrom(host, url, fit));
      } else if (url) {
        if (!el.classList.contains("wf")) { var im0 = el.tagName === "IMG" ? el : el.querySelector("img"); if (im0) { im0.removeAttribute("srcset"); im0.src = url; } }
        else { var d = document.createElement("div"); d.className = "ph ed-p"; d.dataset.pk = pk; d.setAttribute("style", el.getAttribute("style") || ""); var im = document.createElement("img"); im.src = url; im.alt = ""; d.appendChild(im); el.replaceWith(d); el = d; }
      }
      if (fit) { var im1 = el.tagName === "IMG" || el.tagName === "VIDEO" ? el : el.querySelector("img, video"); if (im1) { im1.style.objectFit = fit; im1.style.setProperty("--fit", fit); } }
    });
  }

  /* ---------- choosing a piece: a small window opens next to it ---------- */
  function onClick(e) {
    var lk = e.target.closest("[data-pg]"); if (lk) { e.preventDefault(); e.stopPropagation(); gotoPage(lk.dataset.pg); return; }
    if (mode !== "edit" || bypass) return;
    var el = e.target.closest(".ed-t, .ed-p, .ed-mq, .ed-m, .ed-room, .ed-v");
    e.preventDefault(); e.stopPropagation();
    if (el) return select(el);
    select(null);
    if (!phone.matches && !e.target.closest("a, button, input, select, textarea, label, [contenteditable], .lv-layer, " + SELF)) openBgTip({ x: e.clientX, y: e.clientY });
  }
  function select(el) {
    bgTip = false;
    $$(".ed-sel", canvas).forEach(function (x) { x.classList.remove("ed-sel", "ed-sel-wf"); });
    sel = el && el.isConnected ? el : null;
    if (!sel) tipPos = null;
    if (sel) { sel.classList.add("ed-sel"); if (sel.classList.contains("wf")) sel.classList.add("ed-sel-wf"); }
    drawTip();
  }
  function scrollTo(el) { try { el.scrollIntoView({ block: "center", behavior: "auto" }); } catch (e) {} }
  function tipHead(t) { return '<div class="ed-ph"><b>' + t + '</b><button type="button" class="ed-x" id="edTipX" aria-label="닫기">' + IC.x + '</button></div>'; }
  function tipOpen(title, html) { tip.innerHTML = tipHead(title) + '<div class="ed-pb" id="edTipB">' + html + '</div>'; tip.hidden = false; $("#edTipX").addEventListener("click", function () { select(null); }); placeTip(); }
  var tipPos = null;
  function placeTip() {
    if ((!sel && !bgTip) || tip.hidden || phone.matches) return;
    if (tipPos) { var tp0 = $(".ed-top").offsetHeight; tip.style.left = Math.max(0, Math.min(tipPos.x, root.clientWidth - tip.offsetWidth)) + "px"; tip.style.top = Math.max(tp0, Math.min(tipPos.y, root.clientHeight - 40)) + "px"; tip.style.right = "auto"; return; }
    var r = sel ? sel.getBoundingClientRect() : { left: bgPt.x, right: bgPt.x, top: bgPt.y, bottom: bgPt.y }, w = tip.offsetWidth, h = tip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight, rail = 24 + (filesOpen && !phone.matches ? $("#edFiles").offsetWidth : 0), top = $(".ed-top").offsetHeight;
    var lim = vh - 22, y = r.bottom + 10; if (y + h > lim) y = r.top - h - 10; if (y < top + 8) y = Math.max(top + 8, Math.min(lim - h, top + 12));
    var x = Math.min(Math.max(8, r.left), vw - rail - w - 10);
    tip.style.left = x + "px"; tip.style.top = y + "px"; tip.style.right = "auto";
  }
  function drawTip() {
    if (!sel) { if (bgTip) return; tip.hidden = true; tip.innerHTML = ""; return; }
    if (sel.classList.contains("ed-mq")) return tipMarquee();
    if (sel.classList.contains("ed-slot")) return tipSlot();
    if (sel.classList.contains("ed-m")) return tipModel();
    if (sel.classList.contains("ed-v")) return tipVideo();
    if (sel.classList.contains("ed-room")) return tipRoom();
    if (sel.classList.contains("ed-t")) return tipText();
    tipPhoto();
  }
  function layerNote() {
    var tp = $(".tp", canvas); if (!tp || !$(".lv-layer", tp)) return "";
    return '<div class="ed-box"><button type="button" class="ed-btn ghost" id="edLayerX">이 화면 닫기</button></div>';
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
      (sel.classList.contains("lv-a") ? '<div class="ed-box"><label class="ed-sr" for="edHref">링크</label><input class="ed-in" id="edHref" type="text" inputmode="url" autocomplete="off" placeholder="링크 (https://…, 이메일, 전화)" value="' + esc((S.links && S.links[o]) || "") + '"></div>' : '') +
      (same > 1 ? '<p class="ed-p2">' + same + '곳 함께</p>' : '') +
      ((S.texts[o] !== undefined || S.tstyle[o]) ? '<button type="button" class="ed-link" id="edTxtReset">원래대로 되돌리기</button>' : '') + '</div>' + openBtn());
    bindLayer(); bindOpen();
    var ta = $("#edTa"); ta.value = val;
    ta.addEventListener("input", function () {
      var v = ta.value; $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === o) el.textContent = v; });
      if (v === o) delete S.texts[o]; else S.texts[o] = v;
      $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === o && S.tstyle[o]) styleText(el); });
      commit(); placeTip();
    });
    var hf = $("#edHref"); if (hf) hf.addEventListener("input", function () {
      S.links = S.links || {}; var v = hf.value.trim(); if (v) S.links[o] = v; else delete S.links[o];
      $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === o) setHref(el, v); });
      hf.setAttribute("aria-invalid", v && !hrefOf(v) ? "true" : "false"); commit();
    });
    function setStyle(fn) { var s = S.tstyle[o] || (S.tstyle[o] = {}); fn(s); if (!s.s && !s.b && !s.i && !s.a && !s.c) delete S.tstyle[o]; $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === o) styleText(el); }); commit(true); tipText(); }
    $$("[data-ts]", tip).forEach(function (x) { x.addEventListener("click", function () { setStyle(function (s) { s.s = Math.max(-4, Math.min(8, (s.s || 0) + +x.dataset.ts)); }); }); });
    $("[data-tb]", tip).addEventListener("click", function () { setStyle(function (s) { s.b = s.b ? 0 : 1; }); });
    $("[data-ti]", tip).addEventListener("click", function () { setStyle(function (s) { s.i = s.i ? 0 : 1; }); });
    $$("[data-ta]", tip).forEach(function (x) { x.addEventListener("click", function () { setStyle(function (s) { s.a = s.a === x.dataset.ta ? "" : x.dataset.ta; }); }); });
    $("#edTc").addEventListener("change", function () { var v = this.value; setStyle(function (s) { s.c = v; }); });
    var r = $("#edTxtReset"); if (r) r.addEventListener("click", function () { delete S.texts[o]; delete S.tstyle[o]; $$(".ed-t:not(.ed-slot)", canvas).forEach(function (el) { if (el.dataset.orig === o) { el.textContent = el.dataset.ot !== undefined ? el.dataset.ot : o; styleText(el); } }); commit(true); tipText(); });
    if (!phone.matches) setTimeout(function () { ta.focus(); ta.select(); }, 0);
  }
  function tipSlot() {
    var k = sel.dataset.sk, val = S.slots[k] || "";
    tipOpen("여기에 들어갈 글", '<div class="ed-box"><label class="ed-sr" for="edTa">글</label><textarea class="ed-ta" id="edTa" rows="4"></textarea></div>');
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
  /* a film frame: a link (YouTube, Vimeo or an .mp4 address) or the person's own video file (mp4 or webm) */
  function tipVideo() {
    var v = S.video || {}, mine = !!(v.id && DATA[v.id]);
    tipOpen("동영상", '<div class="ed-box"><label class="ed-sr" for="edVl">링크</label><input class="ed-in" id="edVl" type="text" inputmode="url" autocomplete="off" placeholder="YouTube·Vimeo 링크" value="' + esc(v.link || "") + '">' +
      '<input type="file" accept="video/mp4,video/webm,.mp4,.webm" id="edVf" class="ed-sr"><button type="button" class="ed-btn" id="edVp">' + (mine ? "다른 영상 파일 올리기" : "영상 파일 올리기") + '</button>' +
      '<p class="ed-p2" id="edVm">' + (mine ? "내 영상 파일" : "mp4 · webm · 40MB까지") + '</p>' + ((v.link || v.id) ? '<button type="button" class="ed-link" id="edVr">비우기</button>' : "") + '</div>');
    function paint() { $$(".ed-v", canvas).forEach(fillVideo); commit(true); }
    $("#edVl").addEventListener("input", function () { var t = this.value.trim(); if (t) S.video = { link: t }; else S.video = null; this.setAttribute("aria-invalid", t && !videoOf(t) ? "true" : "false"); $("#edVm").textContent = t && !videoOf(t) ? "이 링크는 쓸 수 없어요" : "mp4 · webm · 40MB까지"; paint(); });
    $("#edVp").addEventListener("click", function () { $("#edVf").click(); });
    $("#edVf").addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return; var msg = $("#edVm");
      if (!/^video\/(mp4|webm)$/.test(f.type)) { msg.textContent = "mp4나 webm 영상만 올릴 수 있어요."; return; }
      if (f.size > 40 * 1048576) { msg.textContent = "파일이 너무 커요. 40MB 이하로 줄여 주세요."; return; }
      msg.textContent = "파일을 읽고 있어요…";
      var rd = new FileReader();
      rd.onload = function () { var url = String(rd.result || ""), id = "v-" + Date.now().toString(36); DATA[id] = url; dbPut(id, url); S.video = { id: id }; paint(); tipVideo(); };
      rd.onerror = function () { msg.textContent = "파일을 읽지 못했어요."; };
      rd.readAsDataURL(f);
    });
    var rs = $("#edVr"); if (rs) rs.addEventListener("click", function () { S.video = null; paint(); tipVideo(); });
  }
  /* a 3D object: the person's own model (a .glb file) in its place */
  function tipModel() {
    var pk = sel.dataset.pk, mine = !!(S.models[pk] && DATA[S.models[pk]]);
    tipOpen("3D 모델", '<div class="ed-box"><p class="ed-p2">' + (mine ? "내 3D 모델" : "예시 모델") + '</p>' +
      '<input type="file" accept=".glb,model/gltf-binary" id="edModelFile" class="ed-sr"><button type="button" class="ed-btn" id="edModelPick">3D 파일(.glb) 올리기</button>' +
      '<p class="ed-p2" id="edModelMsg">.glb · 40MB까지</p>' + (mine ? '<button type="button" class="ed-link" id="edModelReset">예시 모델로 되돌리기</button>' : "") + '</div>');
    $("#edModelPick").addEventListener("click", function () { $("#edModelFile").click(); });
    $("#edModelFile").addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return; var msg = $("#edModelMsg");
      if (f.size > 40 * 1048576) { msg.textContent = "파일이 너무 커요. 40MB 이하로 줄여 주세요."; return; }
      msg.textContent = "파일을 읽고 있어요…";
      var rd = new FileReader();
      rd.onload = function () {
        var url = String(rd.result || ""), head = ""; try { head = atob(url.split(",")[1].slice(0, 8)).slice(0, 4); } catch (e) {}
        if (head !== "glTF") { msg.textContent = ".glb 파일이 아니에요. 3D 프로그램에서 'glb'로 내보낸 파일을 골라 주세요."; return; }
        var id = "m-" + Date.now().toString(36); DATA[id] = url; dbPut(id, url); S.models[pk] = id; commit(true);
        render(); var again = $('.ed-m[data-pk="' + pk + '"]', canvas); if (again) select(again);
      };
      rd.onerror = function () { msg.textContent = "파일을 읽지 못했어요."; };
      rd.readAsDataURL(f);
    });
    var rs = $("#edModelReset"); if (rs) rs.addEventListener("click", function () { delete S.models[pk]; commit(true); render(); });
  }
  /* a room of a floor plan: the pictures shown when the room is pressed */
  function roomPics(g) {
    var orig = (g.dataset.imgs || "").split(",").filter(Boolean), a = (S.rooms[g.dataset.rk] || []).slice(), out = [], n = Math.max(orig.length, a.length);
    for (var i = 0; i < n; i++) {
      var id = a[i], url = id === "-" ? "" : ((id && DATA[id]) || (orig[i] ? T.photoUrl(orig[i]) : ""));
      out.push({ i: i, id: id === undefined ? null : id, url: url, gone: id === "-" });
    }
    return out;
  }
  function tipRoom() {
    var g = sel, rk = g.dataset.rk, list = roomPics(g), words = $$("text", g).map(function (t) { return t.textContent; }).slice(0, 2).join(" ");
    tipOpen("방 사진", '<div class="ed-box"><p class="ed-p2">' + esc(words) + '</p><div class="ed-pics" id="edRoomPics">' +
      list.map(function (o) { return '<div class="it"' + (o.gone ? ' style="opacity:.3"' : "") + '><button type="button" data-rp="' + o.i + '" aria-label="사진 ' + (o.i + 1) + ' 바꾸기">' + (o.url ? '<img src="' + esc(o.url) + '" alt="">' : "") + '</button><button type="button" class="del" data-rx="' + o.i + '" aria-label="' + (o.gone ? "다시 넣기" : "빼기") + '">' + (o.gone ? "+" : IC.x) + '</button></div>'; }).join("") + '</div>' +
      '<input type="file" accept="image/*" id="edRoomFile" class="ed-sr"><button type="button" class="ed-btn ghost" id="edRoomAdd">사진 추가</button><p class="ed-p2" id="edRoomMsg"></p></div>');
    var target = -1, fi = $("#edRoomFile");
    function set(i, id) { var a = (S.rooms[rk] || []).slice(); while (a.length < list.length) a.push(null); a[i] = id; S.rooms[rk] = a; commit(true); render(); var again = $('.ed-room[data-rk="' + rk + '"]', canvas); if (again) select(again); }
    $$("[data-rp]", tip).forEach(function (x) { x.addEventListener("click", function () { target = +x.dataset.rp; fi.click(); }); });
    $$("[data-rx]", tip).forEach(function (x) { x.addEventListener("click", function () { var i = +x.dataset.rx; set(i, list[i].gone ? null : "-"); }); });
    $("#edRoomAdd").addEventListener("click", function () { target = list.length; fi.click(); });
    fi.addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return; var msg = $("#edRoomMsg"); msg.textContent = "준비하고 있어요…";
      addPhoto(f, function (id, err) { if (!id) { msg.textContent = err || "이 사진은 열 수 없어요. JPG나 PNG 사진을 골라 주세요."; return; } set(target, id); });
    });
  }
  function tipMarquee() {
    var words = S.marquee ? S.marquee.split(NL).filter(function (x) { return x.trim(); }) : mqWords(sel);
    tipOpen("흘러가는 글", '<div class="ed-box"><label class="ed-sr" for="edTa">흘러갈 글</label><textarea class="ed-ta" id="edTa" rows="5"></textarea>' +
      (S.marquee ? '<button type="button" class="ed-link" id="edMqReset">원래 글로 되돌리기</button>' : '') + '</div>');
    var ta = $("#edTa"); ta.value = words.join(NL);
    ta.addEventListener("input", function () { var v = ta.value.split(NL).filter(function (x) { return x.trim(); }); if (v.length) { S.marquee = v.join(NL); mqSet(sel, v); commit(); } });
    var r = $("#edMqReset"); if (r) r.addEventListener("click", function () { S.marquee = null; commit(true); render(); var mq = $(".ed-mq", canvas); if (mq) select(mq); });
    if (!phone.matches) setTimeout(function () { ta.focus(); }, 0);
  }
  function tipPhoto() {
    var pk = sel.dataset.pk, mine = !!photoUrl(pk), pim = sel.tagName === "IMG" ? sel : sel.querySelector("img"), src = photoUrl(pk) || (pim ? pim.currentSrc || pim.src : sel.tagName === "CANVAS" ? T.photoUrl(pk) : ""), fit = S.fit[pk] || "";
    tipOpen("사진", layerNote() + '<div class="ed-box">' +
      (src ? thumb(src, 'ed-thumb') : '') +
      '<input type="file" accept="image/*,video/mp4,video/webm" id="edFile" class="ed-sr"><button type="button" class="ed-btn" id="edPick">내 사진·영상 올리기</button>' +
      (S.lib.length ? '<button type="button" class="ed-btn ghost" id="edFromLib">올려 둔 사진에서 고르기</button>' : '') +
      '<div class="ed-tools" role="group" aria-label="사진 채우는 방식"><button type="button" data-fit="cover" aria-pressed="' + (fit === "cover") + '">꽉 채우기</button><button type="button" data-fit="contain" aria-pressed="' + (fit === "contain") + '">통째로 보이기</button></div>' +
      '<p class="ed-p2" id="edPhotoMsg"></p>' +
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
    if (/^video\/(mp4|webm)$/.test(file.type)) { /* a video goes in as it is (40MB at most) */
      if (file.size > 40 * 1048576) return cb(null, "영상이 너무 커요. 40MB 이하로 줄여 주세요.");
      var rd = new FileReader();
      rd.onload = function () { var url = String(rd.result || ""), id = "u-" + (++S.libN); DATA[id] = url; S.lib.push({ id: id, name: file.name || "영상" }); dbPut(id, url); cb(id); };
      rd.onerror = function () { cb(null, "파일을 읽지 못했어요."); };
      rd.readAsDataURL(file); return;
    }
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
    panel = id; pop.hidden = false;
    if (!(id === "images" && sel && sel.classList.contains("ed-p"))) select(null); /* the picture that was chosen stays chosen, so a picture from "my pictures" can go into it */
    $$(".ed [data-p]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.p === id); });
    pop.innerHTML = '<div class="ed-ph"><b>' + TITLE[id] + '</b><button type="button" class="ed-x" id="edPopX" aria-label="닫기">' + IC.x + '</button></div><div class="ed-pb" id="edPb"></div>';
    $("#edPopX").addEventListener("click", closePanel);
    refreshPanel(); drawFiles(); placePop();
  }
  /* the panel can be moved out of the way by its top line (computers only); it stays where it was put, a double click puts it back */
  var POP_KEY = "1440-edit-pop", popPos = null;
  try { popPos = JSON.parse(localStorage.getItem(POP_KEY) || "null"); } catch (e) {}
  function placePop() {
    if (phone.matches || !popPos) { pop.style.left = pop.style.top = pop.style.right = ""; return; }
    var top = ($(".ed-top", root) || {}).offsetHeight || 0, w = pop.offsetWidth, x = Math.max(0, Math.min(popPos.x, root.clientWidth - w)), y = Math.max(top, Math.min(popPos.y, root.clientHeight - 40));
    pop.style.left = x + "px"; pop.style.top = y + "px"; pop.style.right = "auto";
  }
  /* a floating window moves by its title line (computers): the panel remembers where it was put; double click puts it back */
  function movable(box, moved, reset) {
    box.addEventListener("pointerdown", function (e) {
      var h = e.target.closest(".ed-ph"); if (!h || phone.matches || e.button !== 0 || e.target.closest("button")) return;
      e.preventDefault();
      var r = box.getBoundingClientRect(), R = root.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
      try { h.setPointerCapture(e.pointerId); } catch (z) {}
      box.classList.add("moving");
      function mv(ev) { moved(ev.clientX - R.left - dx, ev.clientY - R.top - dy, false); }
      function up(ev) { h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", up); h.removeEventListener("pointercancel", up); box.classList.remove("moving"); moved(ev.clientX - R.left - dx, ev.clientY - R.top - dy, true); }
      h.addEventListener("pointermove", mv); h.addEventListener("pointerup", up); h.addEventListener("pointercancel", up);
    });
    box.addEventListener("dblclick", function (e) { if (e.target.closest(".ed-ph") && !e.target.closest("button")) reset(); });
  }
  movable(pop, function (x, y, end) { popPos = { x: x, y: y }; placePop(); if (end) try { localStorage.setItem(POP_KEY, JSON.stringify(popPos)); } catch (z) {} },
    function () { popPos = null; try { localStorage.removeItem(POP_KEY); } catch (z) {} placePop(); });
  /* the small window next to a chosen piece stays where it was moved until it is closed */
  movable(tip, function (x, y) { tipPos = { x: x, y: y }; placeTip(); }, function () { tipPos = null; placeTip(); });
  window.addEventListener("resize", function () { if (!pop.hidden) placePop(); });
  function closePanel() { panel = null; pop.hidden = true; pop.innerHTML = ""; $$(".ed [data-p]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); drawFiles(); }
  function refreshPanel() {
    if (!panel || pop.hidden) return;
    var pb = $("#edPb"); if (!pb) return;
    if (phone.matches && DESK_ONLY[panel]) { pb.innerHTML = '<div class="ed-box"><h3 class="ed-h">컴퓨터에서 바꿀 수 있어요</h3><p class="ed-p2">컴퓨터에서 바꿀 수 있어요.</p></div>'; return; }
    ({ blocks: panelBlocks, texts: panelTexts, images: panelImages, bg: panelBg, type: panelType, motion: panelMotion, feat: panelFeat, site: panelSite })[panel](pb);
  }
  root.addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (b) openPanel(b.dataset.p); });

  /* -- the page's parts, in order (the list of parts): add, remove, move -- */
  function moreParts() { var m = (S.more || orig.more || []).slice(), foot = m.length && /^f-/.test(m[m.length - 1]) ? m.pop().slice(2) : "line"; return { blocks: m, foot: foot }; }
  function setMore(blocks, foot) {
    var m = blocks.concat("f-" + foot); S.more = JSON.stringify(m) === JSON.stringify(orig.more) || (!gen && !blocks.length) ? null : m; /* a hand-made form with no parts added is as it was made */
    commit(true); var v = viewOf(), st = v ? v.scrollTop : 0; render(); var v2 = viewOf(); if (v2) v2.scrollTop = st;
  }
  function panelBlocks(pb) {
    var mp = moreParts(), left = GEN.MORE.blocks.filter(function (k) { return mp.blocks.indexOf(k) < 0; });
    pb.innerHTML = '<div class="ed-box"></div>' +
      '<div class="ed-box"><div class="ed-blk lock"><span class="ed-grip" aria-hidden="true">•</span><span class="n">첫 화면<small>' + esc(gen ? GEN.layouts[gen.layout].ko : "이 폼") + '</small></span><span></span></div>' +
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
    var h = '<div class="ed-box">' + (mode === "edit" ? "" : '<p class="ed-p2">미리보기 중 · ' + CMD + '\\</p>') + '</div>';
    if (pics.length) h += '<div class="ed-box"><h3 class="ed-h">사진 ' + pics.length + '</h3><div class="ed-pics">' + pics.slice(0, 40).map(function (el, i) {
      var im = el.tagName === "IMG" ? el : el.querySelector("img"), src = photoUrl(el.dataset.pk) || (im ? im.currentSrc || im.src : ""); return '<button type="button" data-p="' + i + '" aria-label="사진 ' + (i + 1) + '">' + (src ? '<img src="' + esc(src) + '" alt="">' : "") + '</button>'; }).join("") + '</div></div>';
    if (slots.length) h += '<div class="ed-box"><h3 class="ed-h">글을 넣을 자리 ' + slots.length + '</h3><ul class="ed-rows">' + slots.slice(0, 40).map(function (el, i) {
      var v = S.slots[el.dataset.sk]; return '<li><button type="button" data-s="' + i + '"><span class="t">' + (v ? esc(v.slice(0, 40)) : "자리 " + (i + 1)) + '</span><span class="k">' + (v ? "고치기" : "글 넣기") + '</span></button></li>'; }).join("") + '</ul></div>';
    if (texts.length) h += '<div class="ed-box"><h3 class="ed-h">글 ' + texts.length + '</h3><ul class="ed-rows">' + texts.slice(0, 80).map(function (el, i) {
      return '<li><button type="button" data-t="' + i + '"><span class="t">' + esc(el.textContent.trim().slice(0, 60)) + '</span><span class="k">고치기</span></button></li>'; }).join("") + '</ul></div>';
    if (mq) h += '<div class="ed-box"><h3 class="ed-h">흘러가는 글</h3><ul class="ed-rows"><li><button type="button" id="edMqRow"><span class="t">' + esc(mqWords(mq).slice(0, 3).join(" · ")) + '</span><span class="k">고치기</span></button></li></ul></div>';
    var ops = openers();
    if (ops.length) h += '<div class="ed-box"><h3 class="ed-h">다른 화면도 고치기</h3><ul class="ed-rows">' + ops.map(function (o, i) { return '<li><button type="button" data-o="' + i + '"><span class="t">' + o.label + '</span><span class="k">열기</span></button></li>'; }).join("") + '</ul></div>';
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
    pb.innerHTML = '<label class="ed-drop-zone" id="edZone"><span><b>사진 · 영상 올리기</b></span><span>끌어 놓거나 눌러서 올리기</span><input type="file" accept="image/*,video/mp4,video/webm" multiple id="edLibFile" class="ed-sr"></label>' +
      '<p class="ed-p2" id="edLibMsg">' + (pic ? "넣을 사진을 누르세요" : "") + '</p>' +
      (S.lib.length ? '<div class="ed-pics">' + S.lib.map(function (it) { return DATA[it.id] ? '<div class="it"><button type="button" data-u="' + it.id + '" draggable="true" aria-label="' + esc(it.name) + '">' + thumb(DATA[it.id]) + '</button><button type="button" class="del" data-del="' + it.id + '" aria-label="지우기">' + IC.x + '</button></div>' : ""; }).join("") + '</div>' : '<p class="ed-p2">없음</p>');
    var zone = $("#edZone", pb), inp = $("#edLibFile", pb);
    function many(files) {
      var fs = [].slice.call(files || []).filter(function (f) { return /^(image|video)\//.test(f.type) || /\.(jpe?g|png|gif|webp|avif|mp4|webm)$/i.test(f.name); }); if (!fs.length) return;
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
      (!gen ? '' : '') + '</div>' +
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
    return '<div class="ed-row" title="' + esc(d[1]) + '"><span class="n">' + d[0] + '</span><button type="button" class="ed-sw" role="switch" aria-checked="' + on + '" aria-label="' + esc(d[0]) + '" data-k="' + k + '" data-g="' + gid + '"' + (locked && on ? ' aria-disabled="true"' : "") + '></button>' + (set ? '<div class="set">' + set + '</div>' : "") + '</div>';
  }
  function panelFeat(pb) {
    var h = "", groups = null;
    if (!gen) {
      var ex = S.extra || orig.extra;
      h += '<div class="ed-box"><p class="ed-p2">메뉴 기능만 바꿀 수 있어요.</p></div><div class="ed-grp"><h3 class="ed-h">메뉴에 넣을 것</h3>' + ["search", "news", "clock", "contact"].map(function (k) { return frow(k, ex.indexOf(k) >= 0, "menu", false); }).join("") + '</div>';
    } else {
      var cur = feats(); groups = GEN.featuresFor(gen);
      h += '<div class="ed-box"></div>';
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
    pb.innerHTML = '<div class="ed-box"><h3 class="ed-h">사이트 이름</h3><label class="ed-sr" for="edName">사이트 이름</label><input class="ed-in" id="edName" type="text" maxlength="40"></div>' +
      '<div class="ed-box"><h3 class="ed-h">사이트 주소</h3><p class="ed-p2"><b style="color:#000">' + esc(host) + '</b></p><button type="button" class="ed-btn ghost" id="edAddr">주소 정하기</button></div>' +
      '<div class="ed-box"><h3 class="ed-h">파비콘</h3><div class="ed-tabmock"><img id="edFavPrev" alt="" ' + (S.fav ? 'src="' + esc(S.fav) + '"' : 'hidden') + '><span class="ed-favdef"' + (S.fav ? ' hidden' : '') + '>1440</span><span class="t">' + esc(S.title || cur) + '</span></div><input type="file" accept="image/*,.ico,.svg" id="edFavFile" class="ed-sr"><button type="button" class="ed-btn ghost" id="edFavPick">' + (S.fav ? "다른 아이콘으로 바꾸기" : "아이콘 올리기") + '</button>' + (S.fav ? '<button type="button" class="ed-link" id="edFavOff">기본 아이콘으로 되돌리기</button>' : '') + '<p class="ed-p2" id="edFavMsg">정사각형 · 64×64</p></div>' +
      '<div class="ed-box"><h3 class="ed-h">검색</h3><label class="ed-sr" for="edTitle">제목</label><input class="ed-in" id="edTitle" type="text" maxlength="60" placeholder="사이트 제목"><label class="ed-sr" for="edDesc">설명</label><textarea class="ed-ta" id="edDesc" rows="3" maxlength="160" placeholder="설명"></textarea></div>' +
      (phone.matches ? "" : '<div class="ed-box"><h3 class="ed-h">단축키</h3><ul class="ed-rows"><li><span class="t">되돌리기</span><span class="k ed-kbd">' + CMD + 'Z</span></li><li><span class="t">다시 하기</span><span class="k ed-kbd">' + CMD + '⇧Z</span></li><li><span class="t">미리보기 켜고 끄기</span><span class="k ed-kbd">' + CMD + '\\</span></li><li><span class="t">폰 · 컴퓨터 화면 바꾸기</span><span class="k ed-kbd">' + CMD + '⇧X</span></li><li><span class="t">공개하기</span><span class="k ed-kbd">' + CMD + 'P</span></li><li><span class="t">고르기 풀기 · 창 닫기</span><span class="k ed-kbd">Esc</span></li></ul></div>') +
      '<div class="ed-box"><h3 class="ed-h">저장</h3><button type="button" class="ed-link" id="edReset">모두 처음 상태로 되돌리기</button></div>';
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
    $("#edAddr", pb).addEventListener("click", function () { publish(); });
    $("#edReset", pb).addEventListener("click", function () { if (!confirm("지금까지 고친 내용을 모두 지우고 처음 폼으로 되돌릴까요?")) return; Object.keys(DATA).forEach(function (k) { dbPut(k, null); delete DATA[k]; }); S = fresh(); commit(true); select(null); render(); });
  }

  /* -- the page's background: a colour and/or a picture (opened from the dock, or by pressing an empty place on the page) -- */
  function swHtml(list, cur, kind) { return '<div class="ed-sws">' + list.map(function (c) { return '<button type="button" class="ed-c" style="background:' + c + '" aria-label="' + c + '" aria-pressed="' + (c.toLowerCase() === String(cur).toLowerCase()) + '" data-c="' + c + '" data-kind="' + kind + '"></button>'; }).join("") + '<input type="color" class="ed-cin" value="' + (/^#[0-9a-f]{6}$/i.test(cur) ? cur : "#ffffff") + '" data-kind="' + kind + '" aria-label="직접 고르기"></div>'; }
  function applyBg(view) {
    var tp = $(".tp", view), url = S.bgImg && DATA[S.bgImg]; if (!tp) return;
    var ov = [].filter.call(tp.children, function (x) { return x.classList.contains("ed-bgv"); })[0]; if (ov) ov.remove();
    if (!url) { tp.style.backgroundImage = ""; return; }
    if (isVid(url)) { /* a video behind the page: silent, in a loop, under everything (the page makes its own layer so it cannot slip behind the window) */
      var bv = vidFrom(document.createElement("i"), url, S.bgFit === "contain" ? "contain" : "cover"), dd = Math.max(0, Math.min(0.8, +S.bgDim || 0));
      bv.className = "ed-bgv"; bv.setAttribute("aria-hidden", "true"); bv.setAttribute("style", "position:absolute;top:0;left:0;width:100%;height:100%;object-fit:" + (S.bgFit === "contain" ? "contain" : "cover") + ";z-index:-1;pointer-events:none" + (dd ? ";filter:brightness(" + (1 - dd) + ")" : ""));
      tp.style.backgroundImage = ""; tp.style.isolation = "isolate"; tp.insertBefore(bv, tp.firstChild); return;
    }
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
      (url ? thumb(url, 'ed-thumb') : '') +
      '<input type="file" accept="image/*,video/mp4,video/webm" id="edBgFile" class="ed-sr"><button type="button" class="ed-btn" id="edBgPick">' + (url ? "다른 사진·영상으로 바꾸기" : "배경 사진·영상 올리기") + '</button>' +
      (S.lib.length ? '<button type="button" class="ed-btn ghost" id="edBgLib">올려 둔 사진에서 고르기</button><div class="ed-pics" id="edBgPics" hidden>' + S.lib.map(function (it) { return DATA[it.id] ? '<button type="button" data-u="' + it.id + '" aria-label="' + esc(it.name) + '">' + thumb(DATA[it.id]) + '</button>' : ""; }).join("") + '</div>' : "") +
      (url ? '<div class="ed-tools" role="group" aria-label="배경 사진 놓는 방식"><button type="button" data-bf="cover" aria-pressed="' + (fit === "cover") + '">꽉 채우기</button><button type="button" data-bf="contain" aria-pressed="' + (fit === "contain") + '">통째로</button><button type="button" data-bf="tile" aria-pressed="' + (fit === "tile") + '">타일처럼 반복</button></div>' +
        '<label class="ed-rng"><span>사진 어둡게</span><input type="range" id="edBgDim" min="0" max="80" step="5" value="' + Math.round((+S.bgDim || 0) * 100) + '"></label>' +
        '<button type="button" class="ed-link" id="edBgOff">배경 사진 빼기</button>' : "") +
      '<p class="ed-p2" id="edBgMsg"></p></div>';
  }
  function bgBind(root, inTip) {
    function redo() { render(); if (inTip) openBgTip(); }
    $$(".ed-c", root).forEach(function (x) { x.addEventListener("click", function () { S.bg = x.dataset.c === orig.bg ? null : x.dataset.c; commit(true); redo(); }); });
    $$(".ed-cin", root).forEach(function (x) { x.addEventListener("change", function () { S.bg = x.value; commit(true); redo(); }); });
    var f = $("#edBgFile", root); $("#edBgPick", root).addEventListener("click", function () { f.click(); });
    f.addEventListener("change", function () {
      var file = f.files && f.files[0]; if (!file) return; var msg = $("#edBgMsg", root); msg.textContent = "준비하고 있어요…";
      addPhoto(file, function (id, err) { if (!id) { msg.textContent = err || "이 사진은 열 수 없어요. JPG나 PNG 사진을 골라 주세요."; return; } S.bgImg = id; commit(true); redo(); });
    });
    var lb = $("#edBgLib", root); if (lb) lb.addEventListener("click", function () { var g = $("#edBgPics", root); g.hidden = !g.hidden; });
    $$("[data-u]", root).forEach(function (x) { x.addEventListener("click", function () { S.bgImg = x.dataset.u; commit(true); redo(); }); });
    $$("[data-bf]", root).forEach(function (x) { x.addEventListener("click", function () { S.bgFit = x.dataset.bf; commit(true); redo(); }); });
    var dm = $("#edBgDim", root); if (dm) dm.addEventListener("input", function () { S.bgDim = +dm.value / 100; applyBg(viewOf()); commit(); });
    var off = $("#edBgOff", root); if (off) off.addEventListener("click", function () { S.bgImg = null; commit(true); redo(); });
  }
  function panelBg(pb) { pb.innerHTML = bgHtml() + ''; bgBind(pb, false); }
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
    function sw(k, on, n, h) { return '<div class="ed-row" title="' + esc(h) + '"><span class="n">' + n + '</span><button type="button" class="ed-sw" role="switch" aria-checked="' + on + '" data-mk="' + k + '" aria-label="' + n + '"></button></div>'; }
    pb.innerHTML = '<div class="ed-box"><button type="button" class="ed-btn ghost" id="edMoTry">미리보기로 보기</button></div>' +
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

  /* -- 폴더: a small file system, as in a code editor's explorer (the site's pages and sets).
        The top line is the person: their nickname once logged in, else the site name they typed on the first page.
        Under it 홈 holds the forms they work on (the one being edited is open, with its pages and sets, which can sit
        one inside another), and 즐겨찾기 the starred templates. A click chooses a row (a page opens at once; another
        form opens with a double click or its ↗). The arrow keys walk the tree, Enter opens, F2 renames, Delete deletes,
        Ctrl+C / X / V copy, cut and paste — pages between sets and into another form of 홈, forms into 홈 (a copy with
        its own draft) or into 즐겨찾기 — and Ctrl+D duplicates. Rows are dragged to move them: before a row, into a
        set, onto another form; Alt or Ctrl while dropping copies. The clipboard is kept across forms and tabs. -- */
  var FILES_KEY = "1440-edit-files-open", filesOpen = false, openF = { base: true, fav: true }, renaming = null, drag = null, curPage = "home", selK = null, treeFocus = false;
  function starsNow() { try { return JSON.parse(localStorage.getItem("1440-stars") || "{}"); } catch (e) { return {}; } }
  function saveStarsNow(o) { try { localStorage.setItem("1440-stars", JSON.stringify(o)); } catch (e) {} }
  function siteQ() { return T.site ? "&site=" + encodeURIComponent(T.site) : ""; }
  function pgById(id) { return (S.pages || []).filter(function (p) { return p.id === id; })[0]; }
  function pgNew() { return "p-" + Date.now().toString(36) + Math.floor(Math.random() * 46656).toString(36); }
  function note(m) { clearTimeout(noteT); state.textContent = m; noteT = setTimeout(function () { noteT = 0; showSave(); }, 3200); }
  function setFiles(on) {
    filesOpen = on; root.classList.toggle("files-open", on);
    var b = $("#edFilesBtn"); if (b) b.setAttribute("aria-pressed", String(on));
    try { localStorage.setItem(FILES_KEY, on ? "1" : "0"); } catch (e) {}
    drawFiles(); setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 40);
  }
  function gotoPage(id) { if (!pgById(id)) id = "home"; curPage = id; select(null); render(); drawFiles(); }

  /* -- forms: the one being edited (ME) and the others kept in 홈; each has its own draft -- */
  /* the published site of this account, so its form can be marked 공개 중 (a blue dot) in the folder */
  var liveSite = null, liveFor = "";
  function isLiveForm(f) { return !!liveSite && (liveSite.fid ? liveSite.fid === fId(f) : (+liveSite.n === +f.n && !f.c)); } /* is this form the one that is public */
  /* the person stops showing the site (the address stays theirs; publishing again brings it back) */
  function unpublish() {
    var A = window.ACCOUNT; if (!A || !liveSite) return;
    if (!confirm(liveSite.name + ".kor.gallery 공개를 멈출까요?\n사이트가 보이지 않게 되고 올린 사진·영상은 지워져요. 편집한 내용은 그대로 남아 있어서 다시 공개할 수 있어요.")) return;
    A.unpublishSite().then(function () { liveSite = null; UP = {}; drawFiles(); note("공개를 멈췄어요"); }, function (e) { note((e && e.userMessage) || "멈추지 못했어요"); });
  }
  function loadLive() {
    var A = window.ACCOUNT; if (!A || CHECK || SV) return;
    var u = A.user; if (!u || A.mode !== "server") { liveFor = ""; if (liveSite) { liveSite = null; drawFiles(); } return; }
    if (liveFor === u.id) return; liveFor = u.id;
    A.site().then(function (x) { liveSite = x && x.published ? x : null; drawFiles(); }, function () { liveFor = ""; });
  }
  var ME = { n: N, site: T.site || "", c: C };
  function fId(f) { return f.n + "|" + (f.site || "") + "|" + (f.c || ""); }
  function fKey(f) { return "1440-edit-" + f.n + "-" + (f.site || T.defName) + (f.c ? "~" + f.c : ""); }
  function sameF(a, b) { return !!a && !!b && fId(a) === fId(b); }
  function isMe(f) { return sameF(f, ME); }
  function fName(f) { return f.name || T.tag(f.n); }
  function fUrl(f) { return "templates.html?edit=" + f.n + (f.site ? "&site=" + encodeURIComponent(f.site) : "") + (f.c ? "&c=" + encodeURIComponent(f.c) : ""); }
  function homeForms() { var h = window.ACCOUNT ? ACCOUNT.state().home.slice() : []; if (!h.some(isMe)) h.unshift({ n: ME.n, site: ME.site, c: ME.c }); return h; }
  function saveHome(h) { if (!window.ACCOUNT) return; var s = ACCOUNT.state(); s.home = h.map(function (f) { var o = { n: +f.n, site: f.site || "", c: f.c || "" }; if (f.name) o.name = f.name; if (f.p) o.p = f.p; return o; }); ACCOUNT.saveState(s); }
  /* projects: folders in 홈 that hold forms (a form cannot hold files of its own) */
  function projs() { return window.ACCOUNT ? (ACCOUNT.state().projects || []).slice() : []; }
  function projById(id) { return projs().filter(function (p) { return p.id === id; })[0]; }
  function folderName(pid) { var p = pid && projById(pid); return p ? p.name : "홈"; }
  function saveProjs(list) { if (!window.ACCOUNT) return; var s = ACCOUNT.state(); s.projects = list; ACCOUNT.saveState(s); }
  function setFormProj(f, pid, before) {
    var h = homeForms(), x = h.filter(function (y) { return sameF(y, f); })[0]; if (!x) return;
    h = h.filter(function (y) { return y !== x; }); x = Object.assign({}, x); if (pid) x.p = pid; else delete x.p;
    var i = before ? h.findIndex(function (y) { return sameF(y, before); }) : -1; h.splice(i < 0 ? h.length : i, 0, x);
    if (pid) openF["j:" + pid] = true; saveHome(h); drawFiles();
  }
  function addProj() {
    var list = projs(), nm = "새 프로젝트", i = 2; while (list.some(function (p) { return p.name === nm; })) nm = "새 프로젝트 " + i++;
    var p = { id: "j" + Date.now().toString(36), name: nm }; list.push(p); saveProjs(list);
    openF.root = openF.home = true; openF["j:" + p.id] = true; selK = renaming = "j:" + p.id; drawFiles();
  }
  function moveProj(id, d, beforeId) {
    var l = projs(), i = l.findIndex(function (p) { return p.id === id; }); if (i < 0) return; var p = l.splice(i, 1)[0];
    var j = beforeId ? l.findIndex(function (x) { return x.id === beforeId; }) : i + d; l.splice(Math.max(0, Math.min(l.length, j < 0 && beforeId ? l.length : j)), 0, p); saveProjs(l); drawFiles();
  }
  function delProj(id) {
    var p = projById(id); if (!p) return; var inn = homeForms().filter(function (f) { return f.p === id; });
    saveHome(homeForms().map(function (f) { if (f.p === id) { f = Object.assign({}, f); delete f.p; } return f; }));
    saveProjs(projs().filter(function (x) { return x.id !== id; })); selK = null; drawFiles(); note("지웠어요: " + p.name + (inn.length ? " (안의 폼은 홈으로)" : ""));
  }
  function formByK(k) { var id = k.slice(2); return homeForms().filter(function (f) { return fId(f) === id; })[0]; }
  function draftOf(f) { if (isMe(f)) return S; try { return JSON.parse(localStorage.getItem(fKey(f)) || "null"); } catch (e) { return null; } }
  function writeDraft(f, d) { try { localStorage.setItem(fKey(f), JSON.stringify(d)); return true; } catch (e) { note("저장하지 못했어요"); return false; } }
  /* pictures of a draft live in IndexedDB under the draft's key: a copied form takes copies of them */
  function copyPics(from, to, done) {
    if (!DB) return done();
    try {
      var t = DB.transaction("photos", "readwrite"), st = t.objectStore("photos"), rq = st.openCursor(IDBKeyRange.bound(from + "|", from + "|￿"));
      rq.onsuccess = function () { var c = rq.result; if (c) { st.put(c.value, to + String(c.key).slice(from.length)); c.continue(); } };
      t.oncomplete = function () { done(); }; t.onerror = function () { done(); };
    } catch (e) { done(); }
  }
  function dropPics(key) { if (!DB) return; try { var t = DB.transaction("photos", "readwrite"); t.objectStore("photos").delete(IDBKeyRange.bound(key + "|", key + "|￿")); } catch (e) {} }
  /* a form put into 홈: a starred template is simply added; a form that already has a draft (or is already in 홈) is copied with its draft */
  function formToHome(f, after, pid) {
    var h = homeForms(), has = isMe(f) || !!localStorage.getItem(fKey(f)) || h.some(function (x) { return sameF(x, f); });
    var nf = { n: +f.n, site: f.site || "", c: "" }, inP = pid || (after && after.p); if (inP) { nf.p = inP; openF["j:" + inP] = true; }
    if (has) {
      nf.c = Date.now().toString(36).slice(-5); nf.name = fName(f) + " 복사";
      var d = isMe(f) ? JSON.parse(JSON.stringify(S)) : draftOf(f);
      if (d) writeDraft(nf, d);
      copyPics(fKey(f), fKey(nf), function () {});
    }
    var i = after ? h.findIndex(function (x) { return sameF(x, after); }) : -1;
    if (i >= 0) h.splice(i + 1, 0, nf); else h.push(nf);
    openF.home = true; selK = "f:" + fId(nf); saveHome(h); drawFiles();
    note(has ? "'" + fName(f) + "'을 복사해 홈에 두었어요" : T.tag(f.n) + "을 홈에 두었어요");
  }
  function rmForm(f) {
    if (isMe(f)) { note("지금 편집 중인 폼은 지울 수 없어요"); return; }
    try { localStorage.removeItem(fKey(f)); } catch (e) {}
    dropPics(fKey(f));
    try { var ed = JSON.parse(localStorage.getItem("1440-edited") || "{}"); delete ed[fKey(f)]; localStorage.setItem("1440-edited", JSON.stringify(ed)); var bl = JSON.parse(localStorage.getItem("1440-last") || "null"); if (bl && sameF(bl, f)) localStorage.removeItem("1440-last"); } catch (e) {} /* My hub must not open a form that is gone */
    saveHome(homeForms().filter(function (x) { return !sameF(x, f); }));
    if (window.ACCOUNT) { var st = ACCOUNT.state(); if (st.last && sameF(st.last, f)) { st.last = null; ACCOUNT.saveState(st); } }
    selK = null; drawFiles(); note("지웠어요: " + fName(f));
  }
  function star(n, on) { var o = starsNow(); if (on) o[n] = 1; else delete o[n]; saveStarsNow(o); openF.fav = true; drawFiles(); }

  /* -- pages and sets of a draft: a set can hold pages and other sets -- */
  function treeOf(pages, id) {
    var inn = {}; inn[id] = 1;
    for (var grew = true; grew;) { grew = false; pages.forEach(function (p) { if (!inn[p.id] && p.parent && inn[p.parent]) { inn[p.id] = 1; grew = true; } }); }
    var all = pages.filter(function (p) { return inn[p.id]; }), top = all.filter(function (p) { return p.id === id; });
    return top.concat(all.filter(function (p) { return p.id !== id; }));
  }
  function insertAt(pages, items, after) {
    var i = pages.length;
    if (after) { var sub = treeOf(pages, after); if (sub.length) i = Math.max.apply(null, sub.map(function (p) { return pages.indexOf(p); })) + 1; }
    pages.splice.apply(pages, [i, 0].concat(items));
  }
  function addPg(type) {
    var p = { id: pgNew(), type: type, name: type === "set" ? "새 세트" : "새 페이지", body: "" }, s = selK && selK.indexOf("p:") === 0 ? pgById(selK.slice(2)) : null;
    if (s && s.type === "set") { p.parent = s.id; openF[s.id] = true; } else if (s && s.parent) p.parent = s.parent;
    insertAt(S.pages, [p], s && s.type !== "set" ? s.id : null);
    openF.base = true; renaming = p.id; selK = "p:" + p.id; commit(true); if (type === "page") { curPage = p.id; select(null); render(); } drawFiles();
  }
  function movePg(id, targetId, into) {
    var it = pgById(id), tg = pgById(targetId); if (!it || !tg || it === tg || it.id === "home") return;
    var items = treeOf(S.pages, id), ids = items.map(function (p) { return p.id; });
    if (ids.indexOf(targetId) >= 0) { note("세트를 자기 안으로 옮길 수 없어요"); return; }
    S.pages = S.pages.filter(function (p) { return ids.indexOf(p.id) < 0; });
    if (into && tg.type === "set") { it.parent = tg.id; openF[tg.id] = true; S.pages = S.pages.concat(items); }
    else { if (tg.parent) it.parent = tg.parent; else delete it.parent; S.pages.splice.apply(S.pages, [S.pages.indexOf(tg), 0].concat(items)); }
    commit(true); drawFiles();
  }
  function toTop(id) { var it = pgById(id); if (!it || it.id === "home") return; var items = treeOf(S.pages, id), ids = items.map(function (p) { return p.id; }); S.pages = S.pages.filter(function (p) { return ids.indexOf(p.id) < 0; }); delete it.parent; S.pages = S.pages.concat(items); commit(true); drawFiles(); }
  function delPg(id) {
    var p = pgById(id); if (!p || p.id === "home") return;
    var kids = S.pages.filter(function (x) { return x.parent === id; });
    if (p.type === "set" && kids.length && !confirm("이 세트 안의 " + kids.length + "개는 한 단계 위로 옮겨요. 세트를 지울까요?")) return;
    if (p.type === "page" && ((p.body || "").trim() || p.name !== "새 페이지") && !confirm("'" + p.name + "' 페이지를 지울까요?")) return;
    kids.forEach(function (k) { if (p.parent) k.parent = p.parent; else delete k.parent; });
    S.pages = S.pages.filter(function (x) { return x !== p; });
    if (curPage === id) curPage = "home";
    selK = null; commit(true); render(); drawFiles();
  }
  function dupPg(id) { var p = pgById(id); if (!p || p.id === "home") return; pastePages({ op: "copy", kind: "pages", from: ME, items: treeOf(S.pages, id) }, ME, p.parent || null, p.id); }
  function hidePg(id) { var p = pgById(id); if (!p || p.id === "home" || p.type !== "page") return; if (p.hidden) delete p.hidden; else p.hidden = 1; commit(true); if (curPage !== "home") render(); drawFiles(); }
  function sibs(p) { return S.pages.filter(function (x) { return x.id !== "home" && x.parent === p.parent; }); }
  function stepOk(p, d) { var a = sibs(p), i = a.indexOf(p); return i + d >= 0 && i + d < a.length; }
  function stepPg(id, d) {
    var p = pgById(id); if (!p || !stepOk(p, d)) return; var a = sibs(p), q = a[a.indexOf(p) + d];
    var mine = treeOf(S.pages, p.id), other = treeOf(S.pages, q.id), rest = S.pages.filter(function (x) { return mine.indexOf(x) < 0 && other.indexOf(x) < 0; });
    var at = S.pages.indexOf(d < 0 ? q : p), first = d < 0 ? mine : other, second = d < 0 ? other : mine;
    var before = S.pages.slice(0, at).filter(function (x) { return rest.indexOf(x) >= 0; });
    S.pages = before.concat(first, second, rest.filter(function (x) { return before.indexOf(x) < 0; })); commit(true); drawFiles();
  }
  function outPg(id) { var p = pgById(id); if (!p || !p.parent) return; var up = pgById(p.parent); if (up && up.parent) { movePg(id, up.id, false); } else toTop(id); }

  /* -- the clipboard: pages (with what a set holds) or a form; kept in this browser so it works across forms and tabs -- */
  var CLIPK = "1440-clip";
  function clipGet() { try { return JSON.parse(localStorage.getItem(CLIPK) || "null"); } catch (e) { return null; } }
  function clipSet(c) { try { if (c) localStorage.setItem(CLIPK, JSON.stringify(c)); else localStorage.removeItem(CLIPK); } catch (e) {} drawFiles(); }
  function copyK(k, cut) {
    if (!k) return;
    if (k.indexOf("p:") === 0) { var p = pgById(k.slice(2)); if (!p || p.id === "home") return; clipSet({ op: cut ? "cut" : "copy", kind: "pages", from: ME, items: JSON.parse(JSON.stringify(treeOf(S.pages, p.id))) }); note((cut ? "잘라 냈어요: " : "복사했어요: ") + p.name); return; }
    /* cutting a form: pasting it into another folder moves it there */
    if (cut) { var cf = k.indexOf("f:") === 0 ? formByK(k) : null; if (cf) { clipSet({ op: "cut", kind: "form", form: cf }); note("잘라 냈어요: " + fName(cf)); } return; }
    var f = k.indexOf("f:") === 0 ? formByK(k) : k.indexOf("v:") === 0 ? { n: +k.slice(2), site: T.site || "", c: "" } : null;
    if (f) { clipSet({ op: "copy", kind: "form", form: f }); note("복사했어요: " + fName(f)); }
  }
  function pastePages(c, f, parent, after) {
    var mine = isMe(f), d = mine ? S : (draftOf(f) || fresh()); if (!d.pages || !d.pages.length) d.pages = [{ id: "home", type: "page", name: "홈" }];
    var items = c.items || [], ids = items.map(function (p) { return p.id; }); if (!items.length) return;
    if (c.op === "cut" && mine && sameF(c.from, ME) && pgById(ids[0])) { /* moving within this form */
      if (parent && ids.indexOf(parent) >= 0) { note("세트를 자기 안으로 옮길 수 없어요"); return; }
      if (after && ids.indexOf(after) >= 0) after = null;
      var moved = treeOf(S.pages, ids[0]), mids = moved.map(function (p) { return p.id; });
      S.pages = S.pages.filter(function (p) { return mids.indexOf(p.id) < 0; });
      if (parent) moved[0].parent = parent; else delete moved[0].parent;
      insertAt(S.pages, moved, after); clipSet(null); if (parent) openF[parent] = true; selK = "p:" + moved[0].id; commit(true); drawFiles(); return;
    }
    var map = {}; items.forEach(function (p) { map[p.id] = pgNew(); });
    var fresh0 = items.map(function (p, i) { var q = JSON.parse(JSON.stringify(p)); q.id = map[p.id]; if (i === 0) { if (parent) q.parent = parent; else delete q.parent; } else q.parent = map[p.parent] || q.parent; return q; });
    var nm0 = fresh0[0].name, nm = nm0, tries = 1, taken = function (x) { return d.pages.some(function (p) { return p.name === x && (p.parent || null) === (parent || null); }); };
    while (taken(nm)) { nm = nm0 + " 복사" + (tries > 1 ? " " + tries : ""); tries++; }
    fresh0[0].name = nm;
    insertAt(d.pages, fresh0, after);
    if (c.op === "cut") { /* take it away where it was cut */
      if (sameF(c.from, ME)) { S.pages = S.pages.filter(function (p) { return ids.indexOf(p.id) < 0; }); if (ids.indexOf(curPage) >= 0) curPage = "home"; }
      else { var src = draftOf(c.from); if (src && src.pages) { src.pages = src.pages.filter(function (p) { return ids.indexOf(p.id) < 0; }); writeDraft(c.from, src); } }
      clipSet(null);
    }
    if (mine) { if (parent) openF[parent] = true; selK = "p:" + fresh0[0].id; commit(true); if (c.op === "cut") render(); drawFiles(); }
    else { writeDraft(f, d); if (c.op === "cut" && sameF(c.from, ME)) { commit(true); render(); } note("'" + fName(f) + "'에 넣었어요"); drawFiles(); }
  }
  function pasteK(k) {
    var c = clipGet(); if (!c) { note("붙여 넣을 것이 없어요"); return; }
    k = k || "f:" + fId(ME);
    if (c.kind === "form" && c.op === "cut") { /* moving a form from one folder to another */
      var mf = homeForms().filter(function (x) { return sameF(x, c.form); })[0]; if (!mf) { clipSet(null); return; }
      if (k === "favs" || k.indexOf("v:") === 0) { star(mf.n, true); return; }
      var tf = k.indexOf("f:") === 0 ? formByK(k) : null, pid = k.indexOf("j:") === 0 ? k.slice(2) : tf ? tf.p || null : null;
      clipSet(null); setFormProj(mf, pid, tf && !sameF(tf, mf) ? tf : null); note("옮겼어요: " + fName(mf) + " → " + folderName(pid)); return;
    }
    if (c.kind === "form") { if (k === "favs" || k.indexOf("v:") === 0) star(c.form.n, true); else formToHome(c.form, k.indexOf("f:") === 0 ? formByK(k) : null, k.indexOf("j:") === 0 ? k.slice(2) : null); return; }
    if (c.kind === "pages") { note("폼 안에는 파일을 만들 수 없어요"); return; }
    if (k === "favs" || k.indexOf("v:") === 0) { note("즐겨찾기에는 폼만 넣을 수 있어요"); return; }
    if (k.indexOf("p:") === 0) { var p = pgById(k.slice(2)); if (!p) return; if (p.type === "set") pastePages(c, ME, p.id, null); else pastePages(c, ME, p.parent || null, p.id === "home" ? null : p.id); return; }
    var f = k.indexOf("f:") === 0 ? formByK(k) : ME; pastePages(c, f || ME, null, null);
  }
  function delK(k) {
    if (!k) return;
    if (k.indexOf("p:") === 0) delPg(k.slice(2));
    else if (k.indexOf("f:") === 0) { var f = formByK(k); if (f) rmForm(f); }
    else if (k.indexOf("v:") === 0) star(+k.slice(2), false);
    else if (k.indexOf("j:") === 0) delProj(k.slice(2));
  }
  function renK(k) {
    if (!k) return;
    if (k.indexOf("p:") === 0 && k !== "p:home") renaming = k.slice(2);
    else if (k.indexOf("f:") === 0 || k.indexOf("j:") === 0) renaming = k;
    else return;
    drawFiles();
  }
  function openK(k, strong) {
    if (!k) return;
    var kind = k.slice(0, 2);
    if (kind === "p:") { var p = pgById(k.slice(2)); if (!p) return; if (p.type === "set") { openF[p.id] = openF[p.id] === false; drawFiles(); } else if (p.id !== curPage) gotoPage(p.id); return; }
    if (kind === "f:") { var f = formByK(k); if (!f) return; if (isMe(f)) { if (curPage !== "home") gotoPage("home"); } else if (strong) location.href = fUrl(f); return; }
    if (kind === "v:") { var n = +k.slice(2); if (strong && n !== N) location.href = "templates.html?edit=" + n + siteQ(); return; }
    if (kind === "j:") { openF[k] = openF[k] === false; drawFiles(); return; }
    var o = { root: "root", home: "home", favs: "fav" }[k]; if (o) { openF[o] = openF[o] === false; drawFiles(); }
  }

  /* -- the menu of a row (right click or ⋯), with the keys that do the same -- */
  var pgMenu = document.createElement("div"); pgMenu.className = "ed-cm"; pgMenu.hidden = true; root.appendChild(pgMenu);
  function closeMenu() { pgMenu.hidden = true; }
  function rowMenu(k, x, y) {
    var clip = !!clipGet(), items = [], kind = k.slice(0, 2), K = CMD;
    if (kind === "p:") {
      var p = pgById(k.slice(2)); if (!p) return; var home = p.id === "home", set = p.type === "set";
      if (set) items.push(["newp", "새 페이지 (이 세트 안에)"], ["news", "새 세트 (이 세트 안에)"], "-");
      else items.push(["open", "열기", "", home]);
      items.push(["ren", "이름 바꾸기", "F2", home], ["dup", "복제", K + "D", home], "-", ["cut", "잘라내기", K + "X", home], ["copy", "복사", K + "C", home], ["paste", set ? "붙여넣기 (이 세트 안에)" : "붙여넣기", K + "V", !clip], "-");
      if (!set) items.push(["hide", p.hidden ? "보이기" : "숨기기 (초안)", "", home]);
      items.push(["up", "위로 옮기기", "", home || !stepOk(p, -1)], ["down", "아래로 옮기기", "", home || !stepOk(p, 1)]);
      if (p.parent) items.push(["out", "세트 밖으로 꺼내기"]);
      items.push("-", ["del", "지우기", "Delete", home]);
    } else if (kind === "f:") {
      var f = formByK(k); if (!f) return; var me = isMe(f), st = !!starsNow()[f.n];
      items.push(["open", me ? "첫 페이지 열기" : "열기", "Enter"], ["ren", "이름 바꾸기", "F2"], "-", ["cut", "잘라내기", K + "X"], ["copy", "복사", K + "C"], ["paste", "붙여넣기", K + "V", !clip], "-");
      /* moving to another folder without dragging (phones cannot drag) */
      var here = f.p && projById(f.p) ? f.p : "";
      [""].concat(projs().map(function (p) { return p.id; })).forEach(function (id) { if (id !== here) items.push(["mv:" + id, folderName(id) + "(으)로 옮기기"]); });
      if (isLiveForm(f)) items.push("-", ["unpub", "공개 중단"]);
      items.push("-", [st ? "unstar" : "star", st ? "즐겨찾기에서 빼기" : "즐겨찾기에 넣기"], "-", ["del", "지우기", "Delete", me]);
    } else if (kind === "j:") {
      var pl = projs(), pi = pl.findIndex(function (p) { return p.id === k.slice(2); });
      items.push(["ren", "이름 바꾸기", "F2"], ["paste", "붙여넣기 (이 프로젝트 안에)", K + "V", !clip], "-", ["jup", "위로 옮기기", "", pi <= 0], ["jdown", "아래로 옮기기", "", pi < 0 || pi >= pl.length - 1], "-", ["del", "프로젝트 지우기", "Delete"]);
    } else if (kind === "v:") {
      items.push(["open", "열기", "Enter", +k.slice(2) === N], ["copy", "복사", K + "C"], ["tohome", "홈에 넣기"], "-", ["del", "즐겨찾기에서 빼기", "Delete"]);
    } else if (k === "home" || k === "root") items.push(["newj", "새 프로젝트"], ["paste", "붙여넣기", K + "V", !clip]);
    else if (k === "favs") items.push(["starme", starsNow()[N] ? "이 폼을 즐겨찾기에서 빼기" : "이 폼을 즐겨찾기에 넣기"], ["paste", "붙여넣기", K + "V", !clip]);
    pgMenu.innerHTML = items.map(function (i) { return i === "-" ? '<hr>' : '<button type="button" data-m="' + i[0] + '"' + (i[3] ? " disabled" : "") + '><span>' + esc(i[1]) + '</span>' + (i[2] ? '<span class="k">' + i[2] + '</span>' : "") + '</button>'; }).join("");
    pgMenu.hidden = false; var w = pgMenu.offsetWidth, h = pgMenu.offsetHeight;
    pgMenu.style.left = Math.max(6, Math.min(x, window.innerWidth - w - 6)) + "px"; pgMenu.style.top = Math.max(6, Math.min(y, window.innerHeight - h - 6)) + "px";
    $$("[data-m]", pgMenu).forEach(function (b) {
      b.addEventListener("click", function () {
        var m = b.dataset.m, id = k.slice(2); closeMenu();
        if (m === "open") openK(k, true); else if (m === "ren") renK(k); else if (m === "dup") dupPg(id); else if (m === "cut") copyK(k, true); else if (m === "copy") copyK(k);
        else if (m === "paste") pasteK(k); else if (m === "hide") hidePg(id); else if (m === "up") stepPg(id, -1); else if (m === "down") stepPg(id, 1); else if (m === "out") outPg(id);
        else if (m === "del") delK(k); else if (m === "newp" || m === "news") { if (kind === "p:") selK = k; else selK = null; addPg(m === "newp" ? "page" : "set"); }
        else if (m === "star" || m === "unstar") star(formByK(k).n, m === "star"); else if (m === "tohome") formToHome({ n: +id, site: T.site || "", c: "" });
        else if (m === "starme") star(N, !starsNow()[N]); else if (m === "unpub") unpublish();
        else if (m === "newj") addProj(); else if (m === "jup" || m === "jdown") moveProj(id, m === "jup" ? -1 : 1); else if (m.indexOf("mv:") === 0) { var mf = formByK(k); setFormProj(mf, m.slice(3) || null); note("옮겼어요: " + fName(mf) + " → " + folderName(m.slice(3))); }
      });
    });
  }
  document.addEventListener("click", function (e) { if (!pgMenu.hidden && !e.target.closest(".ed-cm") && !e.target.closest("[data-dotk]")) closeMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  /* small line icons, the kind a code editor's explorer uses */
  var XI = {
    chev: '<svg viewBox="0 0 16 16"><path d="m6 4 4 4-4 4"/></svg>',
    file: '<svg viewBox="0 0 16 16"><path d="M4 1.8h5l3 3v9.4H4z"/><path d="M9 1.8v3h3"/></svg>',
    home: '<svg viewBox="0 0 16 16"><path d="M2.5 7.5 8 2.8l5.5 4.7"/><path d="M4 6.6v6.6h8V6.6"/></svg>',
    dir: '<svg viewBox="0 0 16 16"><path d="M1.8 4.2h4.2l1.4 1.6h6.8v7.2H1.8z"/></svg>',
    dirOpen: '<svg viewBox="0 0 16 16"><path d="M1.8 4.2h4.2l1.4 1.6h5.4v1.6"/><path d="M1.8 13h10.6l1.8-5.6H3.6z"/></svg>',
    star: '<svg viewBox="0 0 16 16"><path d="m8 2 1.8 3.8 4.1.5-3 2.8.8 4.1L8 11.2l-3.7 2 .8-4.1-3-2.8 4.1-.5z"/></svg>',
    tpl: '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 6h12"/></svg>',
    user: '<svg viewBox="0 0 16 16"><circle cx="8" cy="5.6" r="2.7"/><path d="M2.8 14c.6-2.9 2.7-4.4 5.2-4.4s4.6 1.5 5.2 4.4"/></svg>',
    globe: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4M8 1.8c1.8 1.9 2.6 4 2.6 6.2S9.8 12.3 8 14.2C6.2 12.3 5.4 10.2 5.4 8S6.2 3.7 8 1.8z"/></svg>',
    out: '<svg viewBox="0 0 16 16"><path d="M9.5 2.5h4v4M13.5 2.5 7.5 8.5"/><path d="M12 9.5v4H2.5V4h4"/></svg>',
    newPage: '<svg viewBox="0 0 16 16"><path d="M4 1.8h5l3 3v9.4H4z"/><path d="M9 1.8v3h3M8 8v3.6M6.2 9.8h3.6"/></svg>',
    newDir: '<svg viewBox="0 0 16 16"><path d="M1.8 4.2h4.2l1.4 1.6h6.8v7.2H1.8z"/><path d="M8 7.6v3.6M6.2 9.4h3.6"/></svg>',
    fold: '<svg viewBox="0 0 16 16"><path d="M2.5 3.5h11M2.5 8h11M5 12.5h6"/></svg>',
    eye: '<svg viewBox="0 0 16 16"><path d="M1.5 8s2.4-4.2 6.5-4.2S14.5 8 14.5 8s-2.4 4.2-6.5 4.2S1.5 8 1.5 8z"/><circle cx="8" cy="8" r="1.8"/></svg>',
    eyeOff: '<svg viewBox="0 0 16 16"><path d="M1.5 8s2.4-4.2 6.5-4.2S14.5 8 14.5 8s-2.4 4.2-6.5 4.2S1.5 8 1.5 8z"/><path d="M2.5 13.5 13.5 2.5"/></svg>',
    cube: '<svg viewBox="0 0 16 16"><path d="M8 1.8 13.8 5v6L8 14.2 2.2 11V5z"/><path d="M2.2 5 8 8.2 13.8 5M8 8.2v6"/></svg>'
  };
  /* one row of the tree */
  function row(o) {
    var h = '<div class="ed-pr ' + (o.cls || "") + (selK === o.k ? " sel" : "") + (o.cut ? " cut" : "") + '" role="treeitem" aria-selected="' + (selK === o.k) + '" data-k="' + esc(o.k) + '" style="--d:' + o.d + '"' + (o.drag && !o.ren ? ' draggable="true"' : "") + (o.tg != null ? ' aria-expanded="' + o.tg + '"' : "") + (o.title ? ' title="' + esc(o.title) + '"' : "") + '>';
    h += o.tg != null ? '<button type="button" class="tg' + (o.tg ? " o" : "") + '" data-tgk="' + esc(o.k) + '" tabindex="-1" aria-label="' + (o.tg ? "접기" : "펼치기") + '">' + XI.chev + '</button>' : '<span class="tg"></span>';
    h += '<span class="ic">' + o.ic + '</span>';
    h += o.ren ? '<input class="rn" type="text" maxlength="40" value="' + esc(o.name) + '" aria-label="이름">' : '<span class="nm"><span>' + esc(o.name) + '</span>' + (o.em !== undefined && o.em !== "" ? '<em>' + esc(String(o.em)) + '</em>' : "") + '</span>';
    return h + (o.extra || "") + (o.dots ? '<button type="button" class="dots" data-dotk="' + esc(o.k) + '" tabindex="-1" aria-label="' + esc(o.name) + ' 메뉴">⋯</button>' : "") + '</div>';
  }
  function pgRow(p, depth, cut) {
    var set = p.type === "set", kids = set ? S.pages.filter(function (x) { return x.parent === p.id; }) : [], open = openF[p.id] !== false;
    var h = row({ k: "p:" + p.id, d: depth, tg: set ? open : null, ic: set ? (open ? XI.dirOpen : XI.dir) : XI.file, name: p.name, em: p.hidden ? "초안" : set ? kids.length : "", cls: (p.id === curPage ? " on" : "") + (p.hidden ? " dim" : ""), drag: true, ren: renaming === p.id, dots: true, cut: cut[p.id] });
    if (set && open) h += kids.map(function (k) { return pgRow(k, depth + 1, cut); }).join("") + (kids.length ? "" : '<p class="ed-fe" style="--d:' + (depth + 1) + '">비어 있음</p>');
    return h;
  }
  function treeHtml() {
    var me = window.ACCOUNT && ACCOUNT.user, st = starsNow(), fav = Object.keys(st).map(Number).filter(function (n) { return n >= 1 && n <= T.total; }).sort(function (a, z) { return a - z; });
    var hf = homeForms(), clip = clipGet(), cut = {};
    if (clip && clip.op === "cut" && clip.kind === "pages" && sameF(clip.from, ME)) clip.items.forEach(function (p) { cut[p.id] = 1; });
    var h = '<div class="ed-tree" role="tree" tabindex="0" aria-label="폴더">';
    h += row({ k: "root", d: 0, tg: openF.root !== false, ic: me ? XI.user : XI.globe, name: me ? me.email : (T.site || T.defName), cls: "root", title: me ? "로그인한 계정" : "처음에 적은 사이트 이름" });
    if (openF.root !== false) {
      var pj = projs(), known = {}; pj.forEach(function (p) { known[p.id] = 1; });
      var cutF = clip && clip.op === "cut" && clip.kind === "form" ? fId(clip.form) : "";
      /* a form is one file: it opens, it holds nothing inside */
      var fRow = function (f, d) {
        var mine = isMe(f), k = "f:" + fId(f);
        var live = isLiveForm(f);
        return row({ k: k, d: d, ic: XI.tpl, name: fName(f), em: mine ? "편집 중" : (f.name ? T.tag(f.n) : ""), cls: "site" + (mine ? " on" : "") + (live ? " live-on" : ""), drag: true, ren: renaming === k, dots: true, cut: cutF === fId(f), title: mine ? "지금 편집 중인 폼" : "두 번 눌러 열기",
          extra: (live ? '<span class="live" title="공개 중 · ' + esc(liveSite.name) + '.kor.gallery"><i></i>공개 중</span>' : "") + (mine ? "" : '<button type="button" class="dots go" data-gok="' + esc(k) + '" tabindex="-1" aria-label="열기" title="열기">' + XI.out + '</button>') });
      };
      /* 홈 and every project are folders side by side; a form lives in one of them */
      var loose = hf.filter(function (f) { return !f.p || !known[f.p]; });
      h += row({ k: "home", d: 1, tg: openF.home !== false, ic: XI.home, name: "홈", em: loose.length, cls: "homeh" });
      if (openF.home !== false) h += loose.map(function (f) { return fRow(f, 2); }).join("") || '<p class="ed-fe" style="--d:2">비어 있음</p>';
      pj.forEach(function (p) {
        var k = "j:" + p.id, open = openF[k] !== false, inn = hf.filter(function (f) { return f.p === p.id; });
        h += row({ k: k, d: 1, tg: open, ic: open ? XI.dirOpen : XI.dir, name: p.name, em: inn.length, cls: "proj", drag: true, ren: renaming === k, dots: true, title: "프로젝트 · 폼을 끌어다 넣어요" });
        if (open) h += inn.map(function (f) { return fRow(f, 2); }).join("") || '<p class="ed-fe" style="--d:2">폼을 끌어다 넣어요</p>';
      });
      h += row({ k: "favs", d: 1, tg: openF.fav !== false, ic: XI.star, name: "즐겨찾기", em: fav.length, cls: "favh", extra: '<button type="button" class="dots" id="edStarMe" tabindex="-1" aria-pressed="' + !!st[N] + '" title="이 폼을 즐겨찾기에 ' + (st[N] ? "서 빼기" : "넣기") + '">' + (st[N] ? "★" : "☆") + '</button>' });
      if (openF.fav !== false) h += fav.length ? fav.map(function (n) {
        var b0 = T.find(n) || {}, k = "v:" + n;
        return row({ k: k, d: 2, ic: XI.tpl, name: T.tag(n), em: b0.label || "", cls: "fvrow" + (n === N ? " on" : ""), drag: true, dots: true, title: "두 번 눌러 열기", extra: n === N ? "" : '<button type="button" class="dots go" data-gok="' + k + '" tabindex="-1" aria-label="열기" title="열기">' + XI.out + '</button>' });
      }).join("") : '<p class="ed-fe" style="--d:2">☆를 누른 폼이 여기에 모여요</p>';
    }
    return h + '</div>';
  }
  /* what a dragged row may land on, and what happens */
  function dropMode(src, k, e) {
    if (!src || src === k) return "";
    var sk = src.slice(0, 2), tk = k.slice(0, 2), copy = e.altKey || e.ctrlKey || e.metaKey;
    if (sk === "p:") {
      if (tk === "p:") { var t = pgById(k.slice(2)); if (!t || treeOf(S.pages, src.slice(2)).some(function (p) { return p.id === t.id; })) return ""; return t.type === "set" ? (copy ? "copyin" : "into") : (copy ? "copybefore" : "before"); }
      if (tk === "f:") { var f = formByK(k); return f ? (isMe(f) ? (copy ? "copyin" : "into") : (copy ? "copyin" : "into")) : ""; }
      if (k === "home" || k === "root") return copy ? "copyin" : "into";
      return "";
    }
    if (sk === "f:") { if (tk === "f:" || tk === "j:") return tk === "j:" ? "into" : "before"; if (k === "favs" || tk === "v:") return "into"; if (k === "home") return "into"; return ""; }
    if (sk === "j:") return tk === "j:" ? "before" : "";
    if (sk === "v:") { if (k === "home" || k === "root" || tk === "f:" || tk === "j:") return "into"; return ""; }
    return "";
  }
  function doDrop(src, k, mode) {
    var sk = src.slice(0, 2), tk = k.slice(0, 2), copy = mode.indexOf("copy") === 0;
    if (sk === "p:") {
      var id = src.slice(2), items = treeOf(S.pages, id);
      if (tk === "p:") { var t = pgById(k.slice(2)); if (copy) pastePages({ op: "copy", items: items, from: ME }, ME, t.type === "set" ? t.id : (t.parent || null), t.type === "set" ? null : t.id); else movePg(id, t.id, t.type === "set"); return; }
      var f = tk === "f:" ? formByK(k) : ME;
      if (!f || isMe(f)) { if (copy) pastePages({ op: "copy", items: items, from: ME }, ME, null, null); else toTop(id); return; }
      pastePages({ op: copy ? "copy" : "cut", items: items, from: ME }, f, null, null); return;
    }
    if (sk === "f:") {
      var sf = formByK(src); if (!sf) return;
      /* onto a form: before it, in its project; onto a project: into it; onto 홈: out of any project */
      if (tk === "f:") { var tf = formByK(k); if (tf) setFormProj(sf, tf.p || null, tf); return; }
      if (tk === "j:") { setFormProj(sf, k.slice(2)); return; }
      if (k === "favs" || tk === "v:") { star(sf.n, true); return; }
      if (k === "home") setFormProj(sf, null); return;
    }
    if (sk === "j:") { moveProj(src.slice(2), 0, k.slice(2)); return; }
    if (sk === "v:") formToHome({ n: +src.slice(2), site: T.site || "", c: "" }, tk === "f:" ? formByK(k) : null, tk === "j:" ? k.slice(2) : null);
  }
  /* the tree keeps the keys only while the person is working in it (drawing it again must not take them from the page) */
  document.addEventListener("pointerdown", function (e) { treeFocus = !!(e.target.closest && e.target.closest(".ed-tree")); }, true);
  document.addEventListener("focusin", function (e) { treeFocus = !!(e.target.closest && e.target.closest(".ed-tree")); });
  function bindTree(el) {
    var tree = $(".ed-tree", el); if (!tree) return;
    tree.addEventListener("focus", function () { if (!selK) { selK = "f:" + fId(ME); mark(); } });
    function rows() { return $$(".ed-pr[data-k]", tree); }
    function mark() { rows().forEach(function (r) { var on = r.dataset.k === selK; r.classList.toggle("sel", on); r.setAttribute("aria-selected", String(on)); if (on) try { r.scrollIntoView({ block: "nearest" }); } catch (e) {} }); }
    function toggleK(k, open) {
      var map = { root: "root", home: "home", favs: "fav" }, key = map[k] || (k.indexOf("j:") === 0 ? k : k.indexOf("f:") === 0 ? null : k.slice(2));
      if (!key) return false; var now = openF[key] !== false; if (open === now) return false; openF[key] = open; drawFiles(); return true;
    }
    tree.addEventListener("click", function (e) {
      var tg = e.target.closest("[data-tgk]"); if (tg) { e.stopPropagation(); var k0 = tg.dataset.tgk, r0 = tg.closest(".ed-pr"); selK = k0; toggleK(k0, r0.getAttribute("aria-expanded") !== "true"); return; }
      var dk = e.target.closest("[data-dotk]"); if (dk) { e.stopPropagation(); selK = dk.dataset.dotk; mark(); var r = dk.getBoundingClientRect(); rowMenu(dk.dataset.dotk, r.left, r.bottom + 4); return; }
      var gk = e.target.closest("[data-gok]"); if (gk) { e.stopPropagation(); openK(gk.dataset.gok, true); return; }
      if (e.target.closest("#edStarMe")) { e.stopPropagation(); star(N, !starsNow()[N]); return; }
      var row0 = e.target.closest(".ed-pr[data-k]"); if (!row0 || e.target.closest(".rn")) return;
      selK = row0.dataset.k; tree.focus({ preventScroll: true }); mark();
      openK(selK, false);
    });
    tree.addEventListener("dblclick", function (e) {
      var row0 = e.target.closest(".ed-pr[data-k]"); if (!row0 || e.target.closest(".rn, button")) return; var k = row0.dataset.k;
      if (k.indexOf("p:") === 0) { if (pgById(k.slice(2)) && pgById(k.slice(2)).type === "page") renK(k); } else if (k.indexOf("f:") === 0 || k.indexOf("v:") === 0) openK(k, true);
    });
    tree.addEventListener("contextmenu", function (e) { var row0 = e.target.closest(".ed-pr[data-k]"); if (!row0) return; e.preventDefault(); selK = row0.dataset.k; mark(); rowMenu(selK, e.clientX, e.clientY); });
    tree.addEventListener("keydown", function (e) {
      if (e.target.classList.contains("rn")) return;
      var rs = rows(), i = rs.findIndex(function (r) { return r.dataset.k === selK; }), meta = e.metaKey || e.ctrlKey, key = (e.key || "").toLowerCase(), cur = rs[i];
      var go = function (j) { j = Math.max(0, Math.min(rs.length - 1, j)); selK = rs[j].dataset.k; mark(); };
      if (e.key === "ArrowDown") { e.preventDefault(); go(i + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); go(i < 0 ? 0 : i - 1); }
      else if (e.key === "Home") { e.preventDefault(); go(0); } else if (e.key === "End") { e.preventDefault(); go(rs.length - 1); }
      else if (e.key === "ArrowRight" && cur) { e.preventDefault(); if (cur.getAttribute("aria-expanded") === "false") toggleK(selK, true); else if (cur.getAttribute("aria-expanded") === "true") go(i + 1); }
      else if (e.key === "ArrowLeft" && cur) {
        e.preventDefault();
        if (cur.getAttribute("aria-expanded") === "true") toggleK(selK, false);
        else { var d0 = parseFloat(cur.style.getPropertyValue("--d")); for (var j = i - 1; j >= 0; j--) if (parseFloat(rs[j].style.getPropertyValue("--d")) < d0) { go(j); break; } }
      }
      else if (e.key === "Enter") { e.preventDefault(); openK(selK, true); }
      else if (e.key === "F2") { e.preventDefault(); renK(selK); }
      else if (e.key === "Delete" || (e.key === "Backspace" && MAC && meta)) { e.preventDefault(); delK(selK); }
      else if (meta && key === "c") { e.preventDefault(); copyK(selK); }
      else if (meta && key === "x" && !e.shiftKey) { e.preventDefault(); copyK(selK, true); }
      else if (meta && key === "v") { e.preventDefault(); pasteK(selK); }
      else if (meta && key === "d") { e.preventDefault(); if (selK && selK.indexOf("p:") === 0) dupPg(selK.slice(2)); else if (selK && selK.indexOf("f:") === 0) formToHome(formByK(selK), formByK(selK)); }
    });
    /* dragging rows */
    rows().forEach(function (r) {
      r.addEventListener("dragstart", function (e) { if (r.getAttribute("draggable") !== "true") return; drag = r.dataset.k; selK = drag; try { e.dataTransfer.setData("text/plain", drag); e.dataTransfer.effectAllowed = "copyMove"; } catch (z) {} r.classList.add("drag"); });
      r.addEventListener("dragend", function () { drag = null; $$(".ed-pr.drag, .ed-pr.over, .ed-pr.into", tree).forEach(function (x) { x.classList.remove("drag", "over", "into"); }); });
      r.addEventListener("dragover", function (e) {
        var m = dropMode(drag, r.dataset.k, e); if (!m) return; e.preventDefault();
        try { e.dataTransfer.dropEffect = m.indexOf("copy") === 0 ? "copy" : "move"; } catch (z) {}
        var into = /in$/.test(m) || m === "into"; r.classList.toggle("into", into); r.classList.toggle("over", !into);
      });
      r.addEventListener("dragleave", function () { r.classList.remove("over", "into"); });
      r.addEventListener("drop", function (e) { e.preventDefault(); r.classList.remove("over", "into"); var m = dropMode(drag, r.dataset.k, e), src = drag; drag = null; if (m && src) doDrop(src, r.dataset.k, m); });
    });
    /* renaming in place */
    var rn = $(".rn", tree);
    if (rn) {
      rn.focus(); rn.select();
      var done = false, id0 = renaming;
      var fin = function (ok) {
        if (done) return; done = true; renaming = null;
        var v = rn.value.trim();
        if (id0.indexOf("j:") === 0) { if (ok && v) saveProjs(projs().map(function (p) { return p.id === id0.slice(2) ? { id: p.id, name: v } : p; })); }
        else if (id0.indexOf("f:") === 0) { var f = formByK(id0); if (ok && v && f) { var h = homeForms().map(function (x) { if (sameF(x, f)) { x = Object.assign({}, x); if (v === T.tag(x.n)) delete x.name; else x.name = v; } return x; }); saveHome(h); } }
        else { var p = pgById(id0); if (ok && v && p && v !== p.name) { p.name = v; commit(true); if (curPage !== "home" && viewOf()) render(); } }
        drawFiles(); var t = $(".ed-tree"); if (t) t.focus({ preventScroll: true });
      };
      rn.addEventListener("keydown", function (e) { if (e.key === "Enter") fin(true); else if (e.key === "Escape") { e.stopPropagation(); fin(false); } });
      rn.addEventListener("blur", function () { fin(true); });
    }
    if (treeFocus && !rn) tree.focus({ preventScroll: true });
  }
  /* -- layers, as in Photoshop's Layers panel: the page as three layers (front, middle, back), with an eye for each; and a 3D view, opened only from
        here, that shows the three layers one behind the other and can be turned -- */
  var LYS = [], hidL = { 0: false, 1: false, 2: false };
  var LNAME = [["아래", "배경"], ["중간", "사진 · 블록"], ["위", "글 · 메뉴"]];
  /* the page is three layers: at the back its backdrop, in the middle its pictures and blocks, at the front its words
     and whatever floats (menus, windows). Every piece of the page belongs to one of them. */
  function layersNow() {
    var view = viewOf(), tp = view && $(".tp", view); if (!tp) return [];
    var any = hidL[0] || hidL[1] || hidL[2];
    $$("[data-lyv]", tp).forEach(function (e) { e.style.visibility = ""; e.removeAttribute("data-lyv"); }); /* measure with everything showing */
    var L = collectLayers(tp, view);
    if (any) L.forEach(function (l) { if (l.page) return; l.el.dataset.lyv = "1"; l.el.style.visibility = hidL[l.layer] ? "hidden" : "visible"; });
    return L;
  }
  function collectLayers(tp, view) {
    var out = [];
    var z = zoomOf(view), t0 = tp.getBoundingClientRect(), pw = tp.offsetWidth, ph = tp.offsetHeight;
    function rel(el) { var r = el.getBoundingClientRect(); return { x: (r.left - t0.left) / z, y: (r.top - t0.top) / z, w: r.width / z, h: r.height / z }; }
    out.push({ el: tp, kind: "box", name: "배경", layer: 0, x: 0, y: 0, w: pw, h: ph, bg: getComputedStyle(tp).backgroundColor, page: true });
    (function walk(el, front) {
      [].slice.call(el.children).forEach(function (c) {
        if (out.length > 260 || (c.namespaceURI || "").indexOf("svg") >= 0) return;
        var cs = getComputedStyle(c); if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return;
        var r = rel(c); if (r.w < 2 || r.h < 2) { walk(c, front); return; }
        var floats = front || cs.position === "fixed" || cs.position === "sticky" || c.classList.contains("lv-layer") || c.classList.contains("mq") || c.classList.contains("tp-row");
        var photo = c.tagName === "IMG" || c.classList.contains("ph") || c.classList.contains("wf") || c.tagName === "CANVAS" || c.tagName === "MODEL-VIEWER";
        var ownNodes = [].filter.call(c.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
        var own = ownNodes.map(function (n) { return n.textContent.trim(); }).join(" ");
        /* words with only marked words and line breaks inside ("Open House<br>Nov 13–15", "Work · Info" with links between
           the dots) are one piece of text, drawn whole as the page shows it. Drawn as its own loose words at the top-left
           corner plus each marked word on its own sheet, the two ran over each other. */
        var oneText = !!own && !photo && [].every.call(c.children, function (k) { return k.tagName === "BR" || getComputedStyle(k).display.indexOf("inline") === 0; }) && !c.querySelector("img, canvas, svg, video, model-viewer, .ph, .wf");
        var bgOn = !/^rgba\(0, 0, 0, 0\)$|^transparent$/.test(cs.backgroundColor) || cs.backgroundImage !== "none", bd = parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0;
        var kind = photo ? "photo" : own ? "text" : (bgOn || bd) ? "box" : "";
        if (!kind) { walk(c, floats); return; }
        var big = r.w >= pw * 0.9 && r.h >= ph * 0.9 || c.classList.contains("bd");
        var tNodes = null;
        if (kind === "text") { /* the sheet is put exactly where its words are on the page (not at the box's corner: padding, centring,
                                  a line break or words below a block would move them) */
          tNodes = oneText ? (function () { var a = [], w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT), t; while ((t = w.nextNode())) if (t.textContent.trim()) a.push(t); return a; })() : ownNodes;
          var rg = document.createRange(), u = null;
          tNodes.forEach(function (n) { rg.selectNodeContents(n); [].forEach.call(rg.getClientRects(), function (q) { if (!q.width || !q.height) return; u = u ? { l: Math.min(u.l, q.left), t: Math.min(u.t, q.top), r: Math.max(u.r, q.right), b: Math.max(u.b, q.bottom) } : { l: q.left, t: q.top, r: q.right, b: q.bottom }; }); });
          if (!u) { if (!oneText) walk(c, floats); return; } /* words that take no room on the page are not drawn */
          /* words that run out of a box that cuts them off (a repeated name, a long line in a narrow column): only what shows */
          var cut = false;
          for (var a = c; a; a = a.parentElement) {
            var ao = getComputedStyle(a);
            if (ao.overflowX !== "visible" || ao.overflowY !== "visible") { var q = a.getBoundingClientRect(); if (u.l < q.left || u.t < q.top || u.r > q.right || u.b > q.bottom) cut = true; u = { l: Math.max(u.l, q.left), t: Math.max(u.t, q.top), r: Math.min(u.r, q.right), b: Math.min(u.b, q.bottom) }; }
            if (a === tp) break;
          }
          if (u.r - u.l < 2 || u.b - u.t < 2) { if (!oneText) walk(c, floats); return; } /* all of it is cut off */
          r = { x: (u.l - t0.left) / z, y: (u.t - t0.top) / z, w: (u.r - u.l) / z + (cut ? 0 : 4), h: (u.b - u.t) / z };
        }
        var L = { el: c, kind: kind, layer: floats ? 2 : big ? 0 : kind === "text" ? 2 : 1, x: r.x, y: r.y, w: r.w, h: r.h };
        if (kind === "text") {
          var txt = oneText ? c.innerText.trim() : own;
          L.name = txt.replace(/\s+/g, " ").slice(0, 26); L.txt = txt; L.fs = cs.fontSize; L.color = cs.color; L.fw = cs.fontWeight; L.lh = cs.lineHeight; L.ta = cs.textAlign; L.ff = cs.fontFamily; L.ls = cs.letterSpacing;
          L.fst = cs.fontStyle; L.fx = cs.fontStretch; L.tt = cs.textTransform; L.ws = cs.whiteSpace; /* a narrow face, capitals or italics change where the lines break */
          L.nodes = tNodes; L.cut = !!cut; /* the words this sheet draws, and whether a box cuts them (?check=layertext) */
        }
        else if (kind === "photo") { var im = c.tagName === "IMG" ? c : c.querySelector("img"); L.name = c.tagName === "MODEL-VIEWER" ? "3D 모델" : "사진"; L.src = im ? (im.currentSrc || im.src) : ""; if (!im && c.tagName === "CANVAS") { try { L.src = c.toDataURL("image/jpeg", 0.7); } catch (e) {} } if (c.tagName === "MODEL-VIEWER") L.mv = c; L.fit = im ? getComputedStyle(im).objectFit : "cover"; L.bg = cs.backgroundColor; }
        else { L.name = "블록"; L.bg = cs.backgroundColor; }
        out.push(L);
        if (kind !== "photo" && !(kind === "text" && oneText)) walk(c, floats); /* one piece of text: its marked words are drawn with it */
      });
    })(tp, false);
    return out;
  }
  /* hiding a whole layer for a moment (the eye), kept when the page is drawn again */
  function applyLayerVis() { layersNow(); }
  function layerRows() {
    LYS = layersNow();
    var ico = { 2: '<b>T</b>', 1: XI.tpl, 0: XI.dir };
    return [2, 1, 0].map(function (k) {
      var n = LYS.filter(function (L) { return L.layer === k && !L.page; }).length, hid = hidL[k];
      return '<div class="ed-pr ly' + (hid ? " dim" : "") + '" data-ly="' + k + '" style="--d:1"><button type="button" class="tg eye" data-eye="' + k + '" aria-label="' + LNAME[k][0] + ' 층 ' + (hid ? "보이기" : "숨기기") + '">' + (hid ? XI.eyeOff : XI.eye) + '</button><span class="ic">' + ico[k] + '</span><button type="button" class="nm" data-lyo="' + k + '"><span>' + LNAME[k][0] + '</span><em>' + LNAME[k][1] + '</em><em class="n">' + n + '</em></button></div>';
    }).join("");
  }
  function flashLayer(L) {
    if (!L || !L.el.isConnected) return;
    try { L.el.scrollIntoView({ block: "center", behavior: "auto" }); } catch (e) {}
    mView = viewOf(); mEl = L.el; measShow();
  }
  /* the 3D view: opened by the cube button of the layers section, it takes the place of the page on the main editing area.
     Three sheets, one behind the other, kept plain: only what is big enough to read is drawn (small words become soft bars,
     small boxes are left out). Drag to turn, wheel to come closer. The turn is kept while the view is open. */
  var d3on = false, d3s = { rx: -10, ry: 38, zm: 1, gap: 240 };
  function open3d() {
    var view = viewOf(), tp = view && $(".tp", view), ov = $("#ed3d"); if (!tp || !ov) return;
    LYS = layersNow(); if (!LYS.length) return;
    var pw = tp.offsetWidth, ph = tp.offsetHeight, pbg = LYS[0].bg || "#fff";
    ov.hidden = false; /* measured before drawing: the thickness is kept about the same on the screen whatever the page's size */
    var fit = Math.min(ov.clientWidth / pw, (ov.clientHeight - 150) / ph) * 0.8 || 0.2;
    var T = Math.round(Math.max(10, Math.min(60, 7 / fit))), RAD = Math.min(30, pw / 5, ph / 5), SEG = 6;
    /* the thickness of a sheet is a solid edge, not frames one behind the other (those showed as steps when turned):
       the four sides and the rounded corners (six narrow faces each) stand back from the sheet, and a back closes it.
       Each face is shaded by the way it looks (light from the upper left), so the sheet reads as a slab. */
    function rim(k) {
      var h = "", d = Math.PI / 2 / SEG, rr = RAD * Math.cos(d / 2), c = 2 * RAD * Math.sin(d / 2) + 1, z = "calc(" + (k - 1) + " * var(--gap, 240px))";
      function face(x, y, a, len) {
        var lit = 0.5 + 0.5 * Math.cos(a - Math.PI / 2 - 4.1); /* 1 = facing the light, 0 = away from it */
        h += '<div class="d3-f k' + k + '" style="width:' + len.toFixed(2) + 'px;height:' + T + 'px;--s:' + lit.toFixed(3) + ';transform:translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,' + z + ') rotate(' + a.toFixed(4) + 'rad) rotateX(-90deg) translateX(-50%)"></div>';
      }
      face(pw / 2, 0, 0, pw - 2 * RAD); face(pw, ph / 2, Math.PI / 2, ph - 2 * RAD); face(pw / 2, ph, Math.PI, pw - 2 * RAD); face(0, ph / 2, -Math.PI / 2, ph - 2 * RAD);
      [[pw - RAD, RAD, -Math.PI / 2], [pw - RAD, ph - RAD, 0], [RAD, ph - RAD, Math.PI / 2], [RAD, RAD, Math.PI]].forEach(function (q) {
        for (var i = 0; i < SEG; i++) { var t = q[2] + (i + 0.5) * d; face(q[0] + rr * Math.cos(t), q[1] + rr * Math.sin(t), t + Math.PI / 2, c); }
      });
      return h + '<div class="d3-f d3-b k' + k + '" style="width:' + pw + 'px;height:' + ph + 'px;border-radius:' + RAD + 'px;transform:translateZ(calc(' + z + ' - ' + T + 'px))"></div>';
    }
    var planes = [0, 1, 2].map(function (k) {
      return rim(k) + '<div class="d3-p k' + k + '" style="width:' + pw + 'px;height:' + ph + 'px;border-radius:' + RAD + 'px;--z:' + (k - 1) + (k === 0 ? ";background:" + pbg : "") + '" data-k="' + k + '"><span class="d3-l" style="left:' + k * 34 + '%;font-size:' + Math.round(13 / fit) + 'px">' + LNAME[k][0] + '<small>' + LNAME[k][1] + '</small></span></div>';
    }).join("");
    var cards = LYS.map(function (l, i) {
      if (l.page) return "";
      var st = "left:" + l.x.toFixed(1) + "px;top:" + l.y.toFixed(1) + "px;width:" + l.w.toFixed(1) + "px;height:" + l.h.toFixed(1) + "px;--z:" + (l.layer - 1), inner = "", cls = "d3-c k-" + l.kind;
      if (l.kind === "text") {
        var fs = parseFloat(l.fs) || 16;
        if (fs < 15) { var bh = Math.max(5, fs * 0.42); st = "left:" + l.x.toFixed(1) + "px;top:" + (l.y + (l.h - bh) / 2).toFixed(1) + "px;width:" + Math.max(8, Math.min(l.w, (l.txt || "").length * fs * 0.55)).toFixed(1) + "px;height:" + bh.toFixed(1) + "px;--z:" + (l.layer - 1); cls += " bar"; }
        else { st += ";color:" + l.color + ";font-size:" + l.fs + ";font-weight:" + l.fw + ";line-height:" + l.lh + ";text-align:" + l.ta + ";font-family:" + l.ff.replace(/"/g, "'") + ";letter-spacing:" + l.ls + ";font-style:" + l.fst + ";font-stretch:" + l.fx + ";text-transform:" + l.tt + (/nowrap|pre/.test(l.ws) ? ";white-space:" + l.ws : ""); inner = esc(l.txt); }
      } else if (l.kind === "photo") { inner = l.src ? '<img src="' + esc(l.src) + '" alt="" style="object-fit:' + l.fit + '">' : ""; st += ";background:" + (l.src ? "transparent" : "#dcdcd8"); }
      else { if (l.w < 24 || l.h < 24) return ""; var solid = !/^rgba\(0, 0, 0, 0\)$/.test(l.bg); st += ";background:" + (solid ? l.bg : "transparent"); if (!solid) cls += " ln"; }
      return '<div class="' + cls + '" data-i="' + i + '" style="' + st + '">' + inner + '</div>';
    }).join("");
    ov.innerHTML = '<div class="d3-bar"><b>3D 레이어</b><label class="d3-r"><span>간격</span><input type="range" class="d3-gap" min="0" max="520" value="' + d3s.gap + '"></label><button type="button" class="d3-reset">처음 각도</button><button type="button" class="d3-close" aria-label="닫기">' + IC.x + '</button></div>' +
      '<div class="d3-hint">위 · 중간 · 아래 세 층 — 끌어서 돌리고, 휠로 확대해요</div><div class="d3-scene"><div class="d3-stage" style="width:' + pw + 'px;height:' + ph + 'px">' + planes + cards + '</div></div><div class="d3-tag" hidden></div>';
    d3on = true;
    LYS.forEach(function (l, i) { /* a 3D object shows its own picture */
      if (!l.mv || !l.mv.toDataURL) return;
      try { Promise.resolve(l.mv.toDataURL()).then(function (u) { var c = $('.d3-c[data-i="' + i + '"]', ov); if (c && u) { c.style.background = "transparent"; c.innerHTML = '<img src="' + u + '" alt="" style="object-fit:contain">'; } }, function () {}); } catch (e) {}
    });
    var scene = $(".d3-scene", ov), stage = $(".d3-stage", ov), tag = $(".d3-tag", ov), drag = null;
    function apply() { stage.style.setProperty("--gap", d3s.gap + "px"); stage.style.transform = "translate(-50%,-46%) scale(" + fit * d3s.zm + ") rotateX(" + d3s.rx + "deg) rotateY(" + d3s.ry + "deg)"; }
    apply();
    scene.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, rx: d3s.rx, ry: d3s.ry }; try { scene.setPointerCapture(e.pointerId); } catch (z) {} });
    scene.addEventListener("pointermove", function (e) {
      if (drag) { d3s.ry = drag.ry + (e.clientX - drag.x) * 0.4; d3s.rx = Math.max(-85, Math.min(85, drag.rx - (e.clientY - drag.y) * 0.4)); apply(); tag.hidden = true; return; }
      var c = e.target.closest(".d3-c"), pl = e.target.closest(".d3-p");
      if (c) { var l = LYS[+c.dataset.i]; tag.textContent = LNAME[l.layer][0] + " · " + l.name; }
      else if (pl) tag.textContent = LNAME[+pl.dataset.k][0] + " 층 · " + LNAME[+pl.dataset.k][1];
      else { tag.hidden = true; return; }
      var b = ov.getBoundingClientRect(); tag.hidden = false; tag.style.left = e.clientX - b.left + 14 + "px"; tag.style.top = e.clientY - b.top + 14 + "px";
    });
    scene.addEventListener("pointerup", function () { drag = null; });
    scene.addEventListener("pointerleave", function () { tag.hidden = true; });
    scene.addEventListener("wheel", function (e) { e.preventDefault(); d3s.zm = Math.max(0.3, Math.min(8, d3s.zm * (e.deltaY < 0 ? 1.1 : 0.9))); apply(); }, { passive: false });
    $(".d3-gap", ov).addEventListener("input", function (e) { d3s.gap = +e.target.value; apply(); });
    $(".d3-reset", ov).addEventListener("click", function () { d3s.rx = -10; d3s.ry = 38; d3s.zm = 1; d3s.gap = 240; $(".d3-gap", ov).value = 240; apply(); });
    $(".d3-close", ov).addEventListener("click", close3d);
    var bt = $("#ed3d3"); if (bt) bt.setAttribute("aria-pressed", "true");
    vis3d();
  }
  /* the eye of a layer hides that sheet in the 3D view too: its sheet, its thickness and everything drawn on it */
  function vis3d() {
    var ov = $("#ed3d"); if (!ov || !d3on) return;
    [0, 1, 2].forEach(function (k) { $$(".d3-p.k" + k + ", .d3-f.k" + k, ov).forEach(function (e) { e.style.display = hidL[k] ? "none" : ""; }); });
    $$(".d3-c", ov).forEach(function (c) { var l = LYS[+c.dataset.i]; c.style.display = l && hidL[l.layer] ? "none" : ""; });
  }
  function close3d() { var ov = $("#ed3d"); if (ov) { ov.hidden = true; ov.innerHTML = ""; } d3on = false; var bt = $("#ed3d3"); if (bt) bt.setAttribute("aria-pressed", "false"); }

  var openS = {}, TOOLS = [["blocks", "구성", "페이지 아래 블록", IC.blocks], ["texts", "글·사진", "모든 글과 사진 목록", IC.texts], ["images", "내 사진", "올려 둔 사진", IC.images], ["bg", "배경", "색과 배경 사진", IC.bg], ["type", "글꼴·색", "글꼴과 글자색", "<b>Aa</b>"], ["motion", "스크롤", "나타나는 방식", IC.motion], ["feat", "기능", "메뉴와 기능 켜고 끄기", IC.feat], ["site", "설정", "이름·파비콘·검색 제목", IC.site]];
  function drawFiles() {
    var el = $("#edFiles"); if (!el) return;
    if (!filesOpen) { el.innerHTML = ""; return; }
    if (renaming && $(".rn", el)) return;
    if (!pgById(curPage)) curPage = "home";
    var h = '<div class="ed-fh"><button type="button" class="sh' + (openS.pages === false ? '' : ' o') + '" data-sec="pages">' + XI.chev + '폴더</button><span class="ed-fa"><button type="button" id="edAddProj" title="새 프로젝트" aria-label="새 프로젝트">' + XI.newDir + '</button><button type="button" id="edFold" title="모두 접기" aria-label="모두 접기">' + XI.fold + '</button></span></div>' + treeHtml();
    var pdo = openS.pages !== false;
    h = '<section class="ed-sec' + (pdo ? "" : " c") + '">' + h + '</section>';
    h += '<section class="ed-sec' + (openS.tools === false ? " c" : "") + '"><div class="ed-fh"><button type="button" class="sh' + (openS.tools === false ? "" : " o") + '" data-sec="tools">' + XI.chev + '도구</button></div>' +
      TOOLS.filter(function (t) { return !phone.matches || !DESK_ONLY[t[0]]; }).map(function (t) { return '<button type="button" class="ed-pr tool' + (panel === t[0] && !pop.hidden ? " on" : "") + '" data-p="' + t[0] + '" style="--d:1"><span class="tg"></span><span class="ic">' + t[3] + '</span><span class="nm"><span>' + t[1] + '</span><em>' + t[2] + '</em></span></button>'; }).join("") + (phone.matches ? '<p class="ed-fe" style="--d:1">구성 · 배경 · 글꼴·색 · 스크롤 · 기능은 컴퓨터에서 바꿀 수 있어요</p>' : "") + '</section>';
    if (!phone.matches) h += '<section class="ed-sec' + (openS.layers === false ? " c" : "") + '"><div class="ed-fh"><button type="button" class="sh' + (openS.layers === false ? "" : " o") + '" data-sec="layers">' + XI.chev + '레이어</button><span class="ed-fa"><button type="button" id="ed3d3" title="3D로 보기" aria-label="레이어를 3D로 보기" aria-pressed="' + d3on + '">' + XI.cube + '</button></span></div>' + (openS.layers === false ? "" : layerRows(1)) + '</section>';
    el.innerHTML = h;
    $$("[data-sec]", el).forEach(function (x) { x.addEventListener("click", function () { openS[x.dataset.sec] = openS[x.dataset.sec] === false; drawFiles(); }); });
    $$("[data-eye]", el).forEach(function (x) { x.addEventListener("click", function (e) { e.stopPropagation(); var k = +x.dataset.eye; hidL[k] = !hidL[k]; applyLayerVis(); drawFiles(); vis3d(); }); });
    $$("[data-lyo]", el).forEach(function (x) { x.addEventListener("click", function () { var k = +x.dataset.lyo, L = LYS.filter(function (l) { return l.layer === k && !l.page; })[0]; flashLayer(L); }); });
    var b3 = $("#ed3d3", el); if (b3) b3.addEventListener("click", function () { if (d3on) close3d(); else open3d(); });
    bindTree(el);
    $("#edAddProj", el).addEventListener("click", addProj);
    $("#edFold", el).addEventListener("click", function () { projs().forEach(function (p) { openF["j:" + p.id] = false; }); openF.fav = false; drawFiles(); });
  }
  (function () {
    var rs = $("#edRs"), W_KEY = "1440-edit-files-w", raf = 0;
    function setW(w) { var mx = Math.min(620, window.innerWidth * 0.55); w = Math.max(190, Math.min(mx, w)); root.style.setProperty("--fw", w + "px"); if (!raf) raf = requestAnimationFrame(function () { raf = 0; window.dispatchEvent(new Event("resize")); }); return w; }
    try { var w0 = +localStorage.getItem(W_KEY); if (w0) root.style.setProperty("--fw", w0 + "px"); } catch (e) {}
    rs.addEventListener("pointerdown", function (e) {
      e.preventDefault(); try { rs.setPointerCapture(e.pointerId); } catch (z) {} root.classList.add("resizing");
      var move = function (ev) { setW(window.innerWidth - ev.clientX); }, up = function () { rs.removeEventListener("pointermove", move); rs.removeEventListener("pointerup", up); root.classList.remove("resizing"); try { localStorage.setItem(W_KEY, String(Math.round($("#edFiles").offsetWidth))); } catch (z) {} };
      rs.addEventListener("pointermove", move); rs.addEventListener("pointerup", up);
    });
    rs.addEventListener("keydown", function (e) { if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return; e.preventDefault(); var cur = $("#edFiles").offsetWidth; var w = setW(cur + (e.key === "ArrowLeft" ? 24 : -24)); try { localStorage.setItem(W_KEY, String(Math.round(w))); } catch (z) {} });
  })();
  window.addEventListener("storage", function (e) { if (e.key === "1440-stars" || e.key === CLIPK || e.key === "1440-guest") drawFiles(); });
  /* the account: the top of the tree is the person, and the form being edited becomes the one My hub opens */
  if (window.ACCOUNT && !CHECK && !SV) { ACCOUNT.on(function () { drawFiles(); loadLive(); }); ACCOUNT.ready.then(function () { ACCOUNT.touch(N, T.site || "", C); drawFiles(); loadLive(); }); }
  var touchedAt = Date.now();
  window.addEventListener("focus", function () { if (!renaming) drawFiles(); });

  /* a page other than the first is one screen of its own: the site's name and the pages along the top, a title and some words */
  function pageMarkup(pg, mob) {
    var name = esc(S.texts[T.site || T.defName] !== undefined ? S.texts[T.site || T.defName] : (T.site || T.defName)), nav = S.pages.filter(function (p) { return p.type === "page" && !p.hidden; });
    var links = nav.map(function (p) { return '<a href="#" data-pg="' + p.id + '" class="lv-a' + (p.id === pg.id ? " on" : "") + '">' + esc(p.name) + '</a>'; }).join(" · ");
    return '<div class="tp-row"><span class="tp-name">' + name + '</span><span>' + links + '</span><span></span></div>' +
      '<div class="pg-body" style="position:absolute;left:28px;right:28px;top:' + (mob ? 96 : 130) + 'px;bottom:56px;display:grid;align-content:start;gap:' + (mob ? 20 : 34) + 'px;overflow:hidden">' +
      '<h1 class="big pg-t" data-pgf="title" data-ph="제목" style="position:static;font-size:' + (mob ? 46 : 110) + 'px;margin:0">' + esc(pg.name) + '</h1>' +
      '<div class="pg-b" data-pgf="body" data-ph="여기에 글을 써 보세요" style="font-size:' + (mob ? 17 : 24) + 'px;line-height:1.5;max-width:' + (mob ? 340 : 780) + 'px;white-space:pre-wrap">' + esc(pg.body || "") + '</div></div>' +
      (pg.hidden ? '<div class="tp-foot"><span>초안 · 메뉴에 나오지 않아요</span><span></span></div>' : "");
  }
  function swapPage(view, mob) {
    var pg = pgById(curPage), tp = $(".tp", view); if (!pg || pg.id === "home" || !tp) return false;
    tp.classList.remove("tp-reflow"); tp.innerHTML = pageMarkup(pg, mob);
    $$("[data-pgf]", tp).forEach(function (f) {
      var key = f.dataset.pgf;
      if (mode === "edit") f.setAttribute("contenteditable", "plaintext-only");
      f.addEventListener("input", function () {
        var v = key === "title" ? f.textContent.replace(/\n/g, " ") : f.innerText.replace(/\n$/, "");
        if (key === "title") pg.name = v || "이름 없음"; else pg.body = v;
        commit(); drawFiles();
      });
      f.addEventListener("keydown", function (e) { if (key === "title" && e.key === "Enter") e.preventDefault(); });
    });
    return true;
  }

  /* a short line at the bottom that goes away by itself */
  function hint(t) { var f = document.createElement("div"); f.className = "ed-flag"; f.textContent = t; canvas.appendChild(f); setTimeout(function () { f.remove(); }, 4500); }
  /* ---------- top bar ---------- */
  function setMode(m) { mode = m; select(null); $("#edPreview").setAttribute("aria-pressed", String(m === "try")); render(); }
  function setDev(d) { dev = d; select(null); $("#edDevice").setAttribute("aria-pressed", String(d === "mob")); $("#edDevice").innerHTML = d === "mob" ? IC.desk : IC.mob; $("#edDevice").setAttribute("aria-label", d === "mob" ? "컴퓨터 화면으로 보기" : "폰 화면으로 보기"); render(); }
  $("#edPreview").addEventListener("click", function () { setMode(mode === "edit" ? "try" : "edit"); });
  $("#edDevice").addEventListener("click", function () { setDev(dev === "mob" ? "desk" : "mob"); });
  /* ---------- the shape of the site's window: free, or an Instagram / video ratio ----------
     Only the editor's window changes (the page is drawn at the width of the frame and scrolls inside it): a way to see,
     and to take a picture of, the site at the shape a post needs. A published site is not touched. */
  var RATIOS = [["", "꽉 채우기"], ["1:1", "1:1 · 정사각"], ["4:5", "4:5 · 인스타 피드"], ["3:4", "3:4 · 인스타 격자"], ["9:16", "9:16 · 릴스 · 스토리"], ["16:9", "16:9 · 영상"], ["4:3", "4:3"], ["3:2", "3:2"]];
  /* the shape is for the computer view only: in the editor's phone view (and on a phone) the page keeps its own phone shape and the control is gone */
  function ratioOf() { var m = /^(\d+):(\d+)$/.exec(phone.matches || dev === "mob" ? "" : S.ratio || ""); return m ? [+m[1], +m[2]] : null; }
  function applyRatio() {
    var page = $(".ed-page", canvas), view = viewOf(); if (!page || !view) return;
    var r = ratioOf(), rb = $("#edRatio"); page.classList.toggle("has-ratio", !!r);
    if (rb) { rb.hidden = dev === "mob"; rb.classList.toggle("on", !!r); if (rb.hidden) ratioMenu(false); }
    if (!r) { view.style.width = view.style.height = view.style.background = ""; return; }
    view.style.background = b.bg || ""; /* a short page: the rest of the frame is the page's own colour */
    var pad = SV ? 20 : 28, aw = Math.max(80, canvas.clientWidth - pad * 2), ah = Math.max(80, canvas.clientHeight - pad * 2), q = r[0] / r[1];
    var fw = Math.max(80, Math.min(aw, ah * q)); view.style.width = Math.round(fw) + "px"; view.style.height = Math.round(fw / q) + "px";
    T.scale(view); T.fitHeight(view);
  }
  if (window.ResizeObserver) new ResizeObserver(function () { applyRatio(); }).observe(canvas);
  function ratioMenu(open) {
    var m = $("#edRatioMenu"), b = $("#edRatio");
    if (!m) {
      m = document.createElement("div"); m.id = "edRatioMenu"; m.className = "ed-ratio"; m.setAttribute("role", "menu"); m.hidden = true;
      m.innerHTML = RATIOS.map(function (x) { return '<button type="button" role="menuitemradio" data-r="' + x[0] + '">' + x[1] + '</button>'; }).join("");
      root.appendChild(m);
      m.addEventListener("click", function (e) { var t = e.target.closest("[data-r]"); if (!t) return; setRatio(t.dataset.r); });
    }
    if (open === undefined) open = m.hidden;
    $$("[data-r]", m).forEach(function (x) { var on = x.dataset.r === (S.ratio || ""); x.setAttribute("aria-checked", String(on)); x.classList.toggle("on", on); });
    m.hidden = !open; b.setAttribute("aria-expanded", String(open));
  }
  function setRatio(v) { S.ratio = v || null; commit(); applyRatio(); ratioMenu(false); select(null); }
  $("#edRatio").addEventListener("click", function (e) { e.stopPropagation(); ratioMenu(); });
  document.addEventListener("click", function (e) { var m = $("#edRatioMenu"); if (m && !m.hidden && !e.target.closest("#edRatioMenu, #edRatio")) ratioMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { var m = $("#edRatioMenu"); if (m && !m.hidden) ratioMenu(false); } });
  $("#edBack").addEventListener("click", function () { location.href = "templates.html" + (T.site ? "?site=" + encodeURIComponent(T.site) : ""); });

  /* ---------- publish: the address is chosen here, at the end ---------- */
  var dlg = $("#edDlg");
  function closeDlg() { dlg.hidden = true; }
  /* 공개하기 in steps, in the one quiet window: ① the address → ② an account (only without one: sign up with the
     mail code, or log in) → ③ a pass (only without one: the monthly subscription, 30 days, a year; NICEPAY's window
     comes back here) → ④ the site goes up at 이름.kor.gallery (goLive). */
  var PUB = { email: "" };
  function acct() { return window.ACCOUNT || null; }
  function hasPass(u) { var now = Date.now(); return !!u && (u.paidUntil > now || u.trialUntil > now || !!(u.sub && u.sub.status === "active")); }
  function pubNext() { var A = acct(), u = A && A.user; pubStep(!u ? "join" : !hasPass(u) ? "plan" : "done"); }
  /* ④ for real: the address is taken, the person's pictures go up (each once), and what the editor shows becomes 이름.kor.gallery */
  var UP = {}; /* pictures already put up in this visit: id → /m/… */
  function picsInUse() {
    var ids = {}, add = function (id) { if (id && id !== "-" && DATA[id]) ids[id] = 1; };
    Object.keys(S.photos || {}).forEach(function (pk) { var v = S.photos[pk]; add(v === 1 ? pk : v); });
    Object.keys(S.models || {}).forEach(function (k) { add(S.models[k]); });
    if (S.video && S.video.id) add(S.video.id);
    Object.keys(S.rooms || {}).forEach(function (k) { (S.rooms[k] || []).forEach(add); });
    add(S.bgImg);
    return Object.keys(ids);
  }
  function toBlob(id, url) {
    return fetch(url).then(function (r) { return r.blob(); }).then(function (bl) {
      var type = /^m-/.test(id) ? "model/gltf-binary" : bl.type; /* a video keeps the type its file had */ /* a .glb read from a file has no picture type */
      return bl.type === type ? bl : new Blob([bl], { type: type });
    });
  }
  function goLive(host, say) {
    var A = acct(), addr = $("#edPubAddr");
    if (!A || A.mode !== "server") { say("공개는 1440.kor.gallery에서 할 수 있어요.", true); return; }
    if (!host) { pubStep("addr", { msg: "주소를 정해 주세요.", bad: true }); return; }
    var ids = picsInUse(), media = {}, done = 0, stage = "addr";
    say("공개하는 중…");
    A.claimSite(host).then(function () {
      stage = "pics";
      return ids.reduce(function (p, id) {
        return p.then(function () {
          var u = DATA[id];
          if (/^\/m\//.test(u)) { media[id] = u; return; }
          if (UP[id]) { media[id] = UP[id]; return; }
          say("사진 올리는 중 " + (++done) + "/" + ids.length);
          return toBlob(id, u).then(A.upload).then(function (url) { UP[id] = media[id] = url; });
        });
      }, Promise.resolve());
    }).then(function () {
      say("공개하는 중…");
      return A.publishSite({ n: N, site: T.site || "", fid: fId(ME), s: S, media: media });
    }).then(function (site) {
      liveSite = site; if (A.user) liveFor = A.user.id; drawFiles();
      if (addr) addr.innerHTML = '<a href="' + esc(site.url) + '" target="_blank" rel="noopener">' + esc(site.name + ".kor.gallery") + ' ↗</a>';
      say("공개했어요. 고친 뒤 다시 공개하면 바뀌어요.");
    }, function (e) {
      if (stage === "addr" && e.status && e.status < 500) { pubStep("addr", { msg: e.userMessage, bad: true }); return; } /* the address is taken or not allowed */
      say(e.userMessage || "공개하지 못했어요. 다시 해 주세요.", true);
    });
  }
  function publish(step, note) { dlg.hidden = false; pubStep(typeof step === "string" ? step : "addr", note); }
  function won(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "₩"; }
  function fld(name, label, attrs) { return '<label class="ed-fld"><span>' + label + '</span><input name="' + name + '" ' + (attrs || "") + '></label>'; }
  function pubStep(step, note) {
    var box = $(".ed-dlg-box", dlg), A = acct(), u = A && A.user, host = "", h = "";
    try { host = localStorage.getItem("1440-site-name") || T.site || ""; } catch (e) {}
    var title = { addr: "공개하기", join: "공개하기 · 가입", code: "공개하기 · 가입", login: "공개하기 · 로그인", plan: "공개하기 · 이용권", card: "공개하기 · 월 구독", done: "공개하기" }[step];
    h += '<h2 class="ed-h" id="edDlgT">' + title + '</h2>';
    if (step === "addr") h += '<div class="ed-addr" title="영문 소문자 · 숫자 · -"><label class="ed-sr" for="edAddrIn">주소</label><input id="edAddrIn" type="text" maxlength="30" value="' + esc(host) + '" placeholder="이름" autocapitalize="off" autocomplete="off" spellcheck="false"><span>.kor.gallery</span></div>';
    if (step === "join") h += fld("email", "이메일", 'type="email" autocomplete="email"') + fld("password", "비밀번호 <em>8자 이상</em>", 'type="password" autocomplete="new-password"') +
      '<label class="ed-ck"><input type="checkbox" name="student"><span>대학생입니다 <em>학교 메일이면 첫 한 달 무료</em></span></label>' +
      '<label class="ed-ck"><input type="checkbox" name="agree"><span>만 14세 이상이며, <a href="./#terms" target="_blank" rel="noopener">서비스 약관</a>과 <a href="./#privacy" target="_blank" rel="noopener">개인정보 처리방침</a>에 동의합니다</span></label>';
    if (step === "code") h += '<p class="ed-p2">' + esc(note && note.code ? "미리보기라 메일 대신 여기에 보여요: " + note.code : PUB.email + " 로 코드를 보냈어요. 10분 안에 넣어 주세요.") + '</p>' + fld("code", "코드 <em>6자리</em>", 'inputmode="numeric" autocomplete="one-time-code" maxlength="6"');
    if (step === "login") h += fld("email", "이메일", 'type="email" autocomplete="email"') + fld("password", "비밀번호", 'type="password" autocomplete="current-password"');
    if (step === "plan") h += '<div class="ed-plans">' +
      '<button type="button" class="ed-plan" data-plan="sub"><span>매월 구독</span><span>' + won(4900) + '</span></button>' +
      '<button type="button" class="ed-plan" data-plan="month"><span>30일</span><span>' + won(4900) + '</span></button>' +
      '<button type="button" class="ed-plan" data-plan="year"><span>1년</span><span>' + won(46000) + '</span></button></div>' +
      '<p class="ed-p2">대학생은 학교 메일로 가입하면 첫 한 달이 무료예요. 결제 전에 <a href="./#terms" target="_blank" rel="noopener">요금·환불 조건</a>을 확인해 주세요.</p>';
    if (step === "card") h += fld("cardNo", "카드 번호", 'inputmode="numeric" autocomplete="cc-number" maxlength="19"') + fld("exp", "유효기간 <em>MM/YY</em>", 'inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="MM/YY"') +
      fld("idNo", "생년월일 <em>6자리 · 법인은 사업자번호</em>", 'inputmode="numeric" maxlength="10" autocomplete="off"') + fld("cardPw", "비밀번호 <em>앞 2자리</em>", 'type="password" inputmode="numeric" maxlength="2" autocomplete="off"') +
      '<label class="ed-ck"><input type="checkbox" name="agree"><span>매월 4,900₩ 자동 결제에 동의합니다 <em>이용권이 끝나는 날 결제 · 언제든 해지</em></span></label>';
    if (step === "done") h += '<p class="ed-done" id="edPubAddr">' + esc((host || "이름") + ".kor.gallery") + '</p>';
    h += '<p class="ed-p2 ed-pmsg" role="status"></p><div class="ed-dlg-b">';
    if (step === "join") h += '<button type="button" class="ed-txt" data-go="login">로그인</button>';
    if (step === "login") h += '<button type="button" class="ed-txt" data-go="join">가입하기</button>';
    if (step === "code") h += '<button type="button" class="ed-txt" data-go="resend">코드 다시 받기</button>';
    if (step === "done") h += '<button type="button" class="ed-txt" data-go="addr">주소 바꾸기</button>';
    if (step === "card") h += '<button type="button" class="ed-txt" data-go="plan">뒤로</button>';
    h += '<button type="button" class="ed-txt" id="edDlgX">' + (step === "done" ? "닫기" : "나중에") + '</button>';
    var ok = { addr: "다음 →", join: "코드 받기 →", code: "가입 마치기 →", login: "로그인 →", card: "구독 시작 →" }[step];
    if (ok) h += '<button type="button" class="ed-txt on" id="edDlgOk">' + ok + '</button>';
    box.innerHTML = h + '</div>';
    box.dataset.step = step;
    var m = $(".ed-pmsg", box), say = function (t, bad) { m.textContent = t || ""; m.classList.toggle("err", !!bad); };
    if (note && note.msg) say(note.msg, note.bad);
    var f = function (n) { return box.querySelector('[name="' + n + '"]'); }, okB = $("#edDlgOk", box);
    var busy = function (p, done) { if (okB) okB.disabled = true; say(""); p.then(function (r) { if (okB) okB.disabled = false; done(r); }, function (e) { if (okB) okB.disabled = false; if (e.data && e.data.pending) { PUB.email = e.data.email; pubStep("code", { msg: "메일로 받은 코드를 넣어 가입을 마쳐 주세요." }); return; } say(e.userMessage || "잠시 문제가 생겼어요. 다시 해 주세요.", true); }); };
    $("#edDlgX", box).addEventListener("click", closeDlg);
    [].forEach.call(box.querySelectorAll("[data-go]"), function (b) { b.addEventListener("click", function () {
      if (b.dataset.go !== "resend") { pubStep(b.dataset.go); return; }
      busy(A.resendSignup(PUB.email), function (r) { say(r.devCode ? "미리보기라 메일 대신 여기에 보여요: " + r.devCode : "코드를 다시 보냈어요."); });
    }); });
    var go = {
      addr: function () {
        var inp = $("#edAddrIn", box), v = inp.value.replace(/^-+|-+$/g, "");
        if (v.length < 2) { say("두 글자 이상", true); inp.focus(); return; }
        try { localStorage.setItem("1440-site-name", v); } catch (e) {}
        T.setHost(v); render(); if (!A) { pubStep("done"); return; } A.ready.then(pubNext);
      },
      join: function () {
        var em = f("email").value.trim(), stu = f("student").checked;
        if (stu && !A.isUni(em)) { say("대학생은 학교 메일(.ac.kr, .edu 등)로만 가입할 수 있어요.", true); return; }
        if (!f("agree").checked) { say("약관과 개인정보 처리방침에 동의해 주세요.", true); return; }
        busy(A.signup({ email: em, password: f("password").value, student: stu }), function (r) { PUB.email = r.email; pubStep("code", { code: r.devCode }); });
      },
      code: function () { busy(A.verifySignup(PUB.email, f("code").value.replace(/\D/g, "")), function () { pubNext(); }); },
      login: function () { busy(A.login({ email: f("email").value, password: f("password").value }), function () { pubNext(); }); },
      card: function () {
        var ex = f("exp").value.replace(/\D/g, "");
        if (!f("agree").checked) { say("자동 결제에 동의해 주세요.", true); return; }
        if (ex.length !== 4) { say("유효기간을 MM/YY로 적어 주세요.", true); return; }
        busy(A.subscribe({ cardNo: f("cardNo").value, expMonth: ex.slice(0, 2), expYear: ex.slice(2), idNo: f("idNo").value, cardPw: f("cardPw").value, agree: true }), function () { pubStep("done"); });
      }
    };
    if (okB) okB.addEventListener("click", function () { go[step](); });
    /* Enter goes on, like the button */
    box.onkeydown = function (e) { if (e.key === "Enter" && okB && e.target.tagName === "INPUT" && e.target.type !== "checkbox") { e.preventDefault(); okB.click(); } };
    if (step === "addr") { var inp = $("#edAddrIn", box); inp.addEventListener("input", function () { var v = inp.value.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30); if (v !== inp.value) inp.value = v; }); }
    if (step === "card") {
      ["cardNo", "idNo", "cardPw"].forEach(function (n) { f(n).addEventListener("input", function () { var v = f(n).value.replace(/\D/g, ""); if (n === "cardNo") v = v.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "); if (f(n).value !== v) f(n).value = v; }); });
      f("exp").addEventListener("input", function () { var v = f("exp").value.replace(/\D/g, "").slice(0, 4); v = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v; if (f("exp").value !== v) f("exp").value = v; });
    }
    /* a pass: the subscription asks for a card here; 30 days and a year open NICEPAY's window, which comes back to this form */
    [].forEach.call(box.querySelectorAll("[data-plan]"), function (b) { b.addEventListener("click", function () {
      if (b.dataset.plan === "sub") { pubStep("card"); return; }
      var back = location.pathname + location.search.replace(/([?&])(pay|m)=[^&]*/g, "$1").replace(/[?&]+$/, "").replace(/&&+/g, "&");
      say("결제창을 여는 중…"); A.pay(b.dataset.plan, back).then(function () { say(""); }, function (e) { say(e.userMessage || "결제를 시작하지 못했어요.", true); });
    }); });
    if (!dlg._out) { dlg._out = 1; dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDlg(); }); }
    var first = box.querySelector("input:not([type=checkbox])"); if (first) setTimeout(function () { try { first.focus(); } catch (e) {} }, 0);
    if (step === "done") goLive(host, say);
  }
  /* back from NICEPAY's window: the publish window opens again where it was */
  (function () {
    var q = new URLSearchParams(location.search), r = q.get("pay"); if (!r || CHECK) return;
    var clean = location.search.replace(/([?&])(pay|m)=[^&]*/g, "$1").replace(/[?&]+$/, "").replace(/&&+/g, "&");
    history.replaceState(null, "", location.pathname + clean);
    var A = acct(); if (!A) return;
    A.ready.then(function () { if (r === "ok") publish("done"); else publish("plan", { msg: (q.get("m") || "결제하지 못했어요.") + " 다시 해 주세요.", bad: true }); });
  })();

  /* ---------- keys, as in the tools people already know ---------- */
  document.addEventListener("keydown", function (e) {
    if (SV) return; /* a published site has no editor keys */
    var meta = e.metaKey || e.ctrlKey, key = (e.key || "").toLowerCase(), typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ""));
    if (e.key === "Escape") { if (d3on) close3d(); else if (!dlg.hidden) closeDlg(); else if (sel || bgTip) select(null); else if (panel) closePanel(); return; }
    if (!meta) return;
    if (key === "z" && !typing) { e.preventDefault(); travel(e.shiftKey ? 1 : -1); }
    else if (key === "\\") { e.preventDefault(); setMode(mode === "edit" ? "try" : "edit"); }
    else if (key === "x" && e.shiftKey) { e.preventDefault(); setDev(dev === "mob" ? "desk" : "mob"); }
    else if (key === "p") { e.preventDefault(); publish(); }
  });
  phone.addEventListener && phone.addEventListener("change", function () {
    if (SV) { dev = phone.matches ? "mob" : "desk"; render(); return; } /* a published site follows the screen */
    if (phone.matches) { close3d(); closePanel(); setFiles(false); } else setFiles(true);
    if (phone.matches && dev !== "mob") setDev("mob"); else { render(); }
  });

  /* ---------- development check: templates.html?edit=1&check=editor[&deep=1][&from=1&to=1440] ----------
     Opens every template in the editor, on a computer and on a phone, the way a person would: the page is drawn and
     its words and pictures found, a piece of text is changed and set in a new size, features and parts of the page are
     switched and moved, colours and a typeface are changed, every panel is opened, a picture is chosen. What breaks (an
     error, an empty page, a change that does not show) is written into <body data-editor> as { checked, bad }.
     Nothing is kept. */
  if (CHECK) {
    var DEEP = /[?&]deep=1/.test(location.search), cBad = [], cDone = 0, from = +qs.get("from") || 1, to = +qs.get("to") || T.total;
    var cNote = function (n, why) { cBad.push(T.tag(n) + ": " + why); };
    var cFiles = function (n) {
      try {
        filesOpen = true; root.classList.add("files-open"); S = fresh(); curPage = "home";
        S.pages.push({ id: "t-set", type: "set", name: "세트" }, { id: "t-pg", type: "page", name: "시험 페이지", body: "글", parent: "t-set" });
        drawFiles(); var el = $("#edFiles");
        if (!$('[data-p="bg"]', el) || !$("#ed3d3", el)) cNote(n, "the tools or layers are missing from the side panel");
        if (!$("#edAddProj", el) || $("#edAddPg", el) || $('[data-k="p:t-pg"]', el) || !$("#edStarMe", el)) cNote(n, "the folder list is missing its parts (or shows files inside a form)");
        /* the public form is marked in the folder (a blue dot and 공개 중), only the right one, and nothing when none is public */
        liveSite = { name: "x", n: N, fid: fId(ME), published: 1 }; drawFiles();
        var lv = $$(".ed-pr .live", el); if (lv.length !== 1 || !$(".ed-pr.site.on .live", el) || lv[0].textContent.trim() !== "공개 중") cNote(n, "the public form is not marked in the folder");
        liveSite = { name: "x", n: N, fid: "999||other", published: 1 }; drawFiles(); if ($$(".ed-pr .live", el).length) cNote(n, "another entry is marked public");
        liveSite = null; drawFiles(); if ($$(".ed-pr .live", el).length) cNote(n, "a public mark shows with no public site");
        movePg("t-pg", "home", false); if (pgById("t-pg").parent) cNote(n, "a page does not move out of a set");
        movePg("t-pg", "t-set", true); if (pgById("t-pg").parent !== "t-set") cNote(n, "a page does not move into a set");
        dupPg("t-pg"); if (S.pages.length !== 4) cNote(n, "a page is not duplicated");
        ["desk", "mob"].forEach(function (d) { dev = d; curPage = "t-pg"; render(); var t = $(".pg-t", canvas); if (!t || t.textContent !== "시험 페이지") cNote(n, d + " another page is not drawn"); });
        curPage = "home"; filesOpen = false; root.classList.remove("files-open"); el.innerHTML = ""; S = fresh(); dev = "desk";
      } catch (e) { cNote(n, "page list failed: " + e.message); }
    };
    var cOne = function (n) {
      use(n); mode = "edit"; if (n === from) cFiles(n);
      ["desk", "mob"].forEach(function (d) {
        dev = d; S = fresh(); select(null);
        try { render(); } catch (e) { cNote(n, d + " draw failed: " + e.message); return; }
        var view = viewOf(), tp = view && $(".tp", view);
        if (!tp || !tp.children.length) return cNote(n, d + " empty page");
        /* the shape of the window: every ratio gives a frame of that shape that fits the area; "free" gives it back */
        if (!phone.matches && d === "mob" && (n === from || n % 120 === 1)) {
          S.ratio = "4:5"; applyRatio(); var vm = viewOf(); if ((vm.parentNode.classList.contains("has-ratio") || vm.style.width) || !$("#edRatio").hidden) cNote(n, "the phone view shows a ratio frame or the ratio control");
          S.ratio = null; applyRatio();
        }
        if (!phone.matches && d === "desk" && (n === from || n % 120 === 1)) {
          try {
            RATIOS.forEach(function (rt) {
              if (!rt[0]) return; S.ratio = rt[0]; applyRatio(); var v = viewOf(), pg = v && v.parentNode, q = rt[0].split(":"), w = v.getBoundingClientRect();
              if (!pg || !pg.classList.contains("has-ratio") || Math.abs(w.width / w.height - q[0] / q[1]) > 0.02 || w.width > canvas.clientWidth + 1 || w.height > canvas.clientHeight + 1) cNote(n, d + " the " + rt[0] + " frame is not that shape or does not fit");
            });
            S.ratio = null; applyRatio(); var v0 = viewOf(); if (v0.style.width || v0.parentNode.classList.contains("has-ratio")) cNote(n, d + " the free frame is not given back");
          } catch (e) { cNote(n, d + " ratio failed: " + e.message); }
        }
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
        var lk = $$(".ed-t.lv-a:not(.ed-slot)", canvas)[0];
        if (lk) { /* a button takes a link: it is kept on the button, bad words are dropped, and it survives drawing the page again */
          var lo = lk.dataset.orig; select(lk); var hf = $("#edHref"); if (!hf) cNote(n, d + " no link box on a button");
          else {
            hf.value = "example.com/a"; hf.dispatchEvent(new Event("input"));
            if (lk.dataset.href !== "https://example.com/a" || !S.links || S.links[lo] !== "example.com/a") cNote(n, d + " a link does not stay on its button");
            hf.value = "javascript:alert(1)"; hf.dispatchEvent(new Event("input"));
            if (lk.dataset.href) cNote(n, d + " an unsafe link was kept");
            hf.value = "hi@example.com"; hf.dispatchEvent(new Event("input")); render();
            var lk2 = $$(".ed-t.lv-a:not(.ed-slot)", canvas).filter(function (x) { return x.dataset.orig === lo; })[0];
            if (!lk2 || lk2.dataset.href !== "mailto:hi@example.com") cNote(n, d + " a link is lost when the page is drawn again");
            delete S.links[lo]; commit(true); render();
          }
        }
        if (d === "desk") { /* a film frame: a YouTube link becomes a press-to-play frame, a bad address shows nothing, a video file plays in place */
          var mv = moreParts(); setMore(mv.blocks.concat("video"), mv.foot); var vf = $(".ed-v", canvas);
          if (!vf) cNote(n, d + " the video part cannot be added");
          else {
            S.video = { link: "https://youtu.be/dQw4w9WgXcQ" }; fillVideo(vf); if (!$("[data-vembed]", vf)) cNote(n, d + " a YouTube link makes no frame");
            S.video = { link: "javascript:alert(1)" }; fillVideo(vf); if ($("[data-vembed], video", vf)) cNote(n, d + " an unsafe video link was used");
            DATA["t-v"] = "data:video/webm;base64,AAAA"; S.video = { id: "t-v" }; fillVideo(vf); if (!$("video", vf)) cNote(n, d + " a video file makes no player");
            var pk0 = $$(".ed-p", canvas).filter(function (x) { return x.tagName !== "CANVAS"; })[0];
            if (pk0) { var pid = pk0.dataset.pk; S.photos[pid] = "t-v"; render(); if (!$('.ed-p[data-pk="' + pid + '"] video, video.ed-p[data-pk="' + pid + '"]', canvas)) cNote(n, d + " a video in a picture place is not shown"); delete S.photos[pid]; }
            S.bgImg = "t-v"; render(); if (!$(".ed-bgv", canvas)) cNote(n, d + " a video behind the page is not shown"); S.bgImg = null;
          }
          S.video = null; delete DATA["t-v"]; setMore(mv.blocks, mv.foot);
        }
        if (sl.length) { select(null); select($$(".ed-slot", canvas)[0]); var t2 = $("#edTa"); if (t2) { t2.value = "자리 글"; t2.dispatchEvent(new Event("input")); } }
        var mqe = $(".ed-mq", canvas);
        if (mqe) { select(mqe); var t3 = $("#edTa"); if (!t3) cNote(n, d + " no text box for the moving line"); else { t3.value = "가" + NL + "나"; t3.dispatchEvent(new Event("input")); if (($(".mq-in", mqe).textContent || "").indexOf("가") < 0) cNote(n, d + " the moving line does not change"); S.marquee = null; } }
        if (ps.length) { select($$(".ed-p", canvas)[0]); if (!$("#edFile")) cNote(n, d + " no picture button"); }
        select(null);
        ["blocks", "texts", "images", "bg", "type", "motion", "feat", "site"].forEach(function (id) { try { panel = null; openPanel(id); if (!$("#edPb").children.length) cNote(n, d + " panel " + id + " is empty"); } catch (e) { cNote(n, d + " panel " + id + " failed: " + e.message); } });
        closePanel();
        try { open3d(); if (!$(".d3-p", root) || !$(".d3-c", root)) cNote(n, d + " the 3D view is empty"); close3d(); if (!layersNow().length) cNote(n, d + " no layers"); } catch (e) { cNote(n, d + " 3D view failed: " + e.message); }
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
          } else {
            S.extra = ["search", "news"]; try { render(); } catch (e) { cNote(n, "switching menu items failed: " + e.message); } S.extra = null;
            /* a hand-made form can take the lower parts too (구성): added they show below the page, taken out it is as it was */
            try {
              S.more = ["table", "about", "f-line"]; render(); if (!$(".tp-more", canvas) || $$(".tp-more [data-sec]", canvas).length !== 2) cNote(n, d + " the parts added to a hand-made form do not show");
              S.more = null; render(); if ($(".tp-more", canvas)) cNote(n, d + " the added parts stay after being taken out");
            } catch (e) { cNote(n, "parts on a hand-made form failed: " + e.message); }
          }
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

  /* ---------- development check for the graduation-show templates: templates.html?edit=1&check=grad ----------
     What a person meets in the editor on a page with its own working parts (light on paint, 3D, before/after, loupe,
     daylight, scale, floor plan, roster, docent, guestbook): is every picture and every word on it changeable, and does a
     changed picture show everywhere it is shown? Written into <body data-grad> as { checked, bad }. */
  if (/[?&]check=grad/.test(location.search)) {
    var gBad = [], gDone = 0, gN = 0;
    (function () {
      var all = []; for (var q = 1; q <= T.total; q++) if ((T.find(q) || {}).fam === "grad") all.push(q);
      var TINY = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      function note(n, why) { gBad.push(T.tag(n) + ": " + why); }
      function one(n) {
        use(n); mode = "edit";
        ["desk", "mob"].forEach(function (d) {
          dev = d; S = fresh(); curPage = "home";
          try { render(); } catch (e) { return note(n, d + " draw failed: " + e.message); }
          var view = viewOf(), tp = $(".tp", view); if (!tp) return note(n, d + " no page");
          var W = [["canvas", "canvas"], ["model-viewer", "model-viewer"], [".ba", "before/after"], [".lp", "loupe"], [".daylight", "daylight"], [".sc-stage", "scale"], ["svg .room", "floor plan"], ["[data-rf]", "roster"], [".dc-play", "docent"], [".gb-form", "guestbook"]].filter(function (w) { return $(w[0], tp); }).map(function (w) { return w[1]; });
          var dead = $$("img, canvas.rake, model-viewer, g.room", tp).filter(function (im) { return !im.closest(".ed-p") && !im.classList.contains("ed-p") && !im.classList.contains("ed-m") && !im.classList.contains("ed-room") && !im.closest(".lv-layer"); });
          if (dead.length) note(n, d + " [" + W.join(",") + "] " + dead.length + " picture(s) that cannot be changed");
          var own = function (e) { return [].filter.call(e.childNodes, function (x) { return x.nodeType === 3; }).map(function (x) { return x.textContent; }).join("").trim(); };
          var words = $$("*", tp).filter(function (e) { var o = own(e); return o && !SKIP_TXT.test(o) && !e.closest(".ed-t") && !e.classList.contains("ed-t") && !e.closest(".ed-slot") && !e.closest(".ed-mq") && !e.closest(SELF) && !e.closest(".lv-layer") && e.tagName !== "SCRIPT" && e.tagName !== "STYLE"; });
          if (words.length) note(n, d + " [" + W.join(",") + "] " + words.length + " word(s) that cannot be changed: " + words.slice(0, 3).map(function (e) { return own(e).slice(0, 18); }).join(" | "));
          /* a changed picture must show wherever it is shown */
          var pk = $$(".ed-p", tp).filter(function (e) { return e.querySelector("img") || e.tagName === "IMG"; })[0];
          if (pk) {
            var key = pk.dataset.pk, before = (pk.tagName === "IMG" ? pk : pk.querySelector("img")).currentSrc || "";
            DATA["g-x"] = TINY; S.lib.push({ id: "g-x", name: "t" }); S.photos[key] = "g-x";
            try { render(); } catch (e) { note(n, d + " draw after a new picture failed: " + e.message); }
            var same = $$("img", $(".tp", viewOf())).filter(function (im) { return before && (im.currentSrc || im.src) === before; });
            if (same.length) note(n, d + " [" + W.join(",") + "] the old picture still shows in " + same.length + " place(s) after it was changed");
            delete DATA["g-x"]; S = fresh();
          }
          if (W.indexOf("canvas") >= 0 || W.indexOf("model-viewer") >= 0) {
            try { LYS = layersNow(); open3d(); close3d(); } catch (e) { note(n, d + " layers/3D failed: " + e.message); }
          }
        });
        S = fresh(); dev = "desk";
      }
      function step() {
        if (gN >= all.length) { canvas.innerHTML = ""; T.clearTimers(); document.body.dataset.grad = JSON.stringify({ checked: gDone, bad: gBad }); return; }
        var n = all[gN++]; document.body.dataset.gradAt = n;
        try { one(n); } catch (e) { note(n, "error " + e.message); }
        gDone++; setTimeout(step, 0);
      }
      step();
    })();
    return;
  }

  /* development check: templates.html?edit=1&check=layerpics — every picture layer of all 1440 templates has something to show in the 3D view */
  if (/[?&]check=layerpics/.test(location.search)) {
    var lpBad = [], lpN = 0, lpPics = 0, lpBlank = 0;
    (function step() {
      if (lpN >= T.total) { canvas.innerHTML = ""; T.clearTimers(); document.body.dataset.layerpics = JSON.stringify({ pics: lpPics, blank: lpBlank, bad: lpBad.slice(0, 60), badCount: lpBad.length }); return; }
      var n = ++lpN; document.body.dataset.layerpicsAt = n;
      try {
        use(n); mode = "edit"; dev = "desk"; S = fresh(); curPage = "home"; render();
        layersNow().forEach(function (l) {
          if (l.kind !== "photo") return; lpPics++;
          var empty = l.el.classList.contains("wf") && !l.el.querySelector("img"); /* a wireframe's empty picture is meant to be blank */
          if (empty) { lpBlank++; return; }
          if (!l.src && l.el.tagName !== "MODEL-VIEWER") lpBad.push(T.tag(n) + ": " + l.el.tagName + "." + (l.el.className || "").toString().slice(0, 30));
        });
      } catch (e) { lpBad.push(T.tag(n) + ": error " + e.message); }
      setTimeout(step, 0);
    })();
    return;
  }

  /* development check: templates.html?edit=1&check=layertext — in the 3D view of all 1440 templates (computer and phone
     screens) no words are drawn twice (once with the words around them and again on their own) and no words are drawn
     away from where they are on the page. Written into <body data-layertext> as { checked, texts, bad }. */
  if (/[?&]check=layertext/.test(location.search)) {
    var ltBad = [], ltN = 0, ltDone = 0, ltTexts = 0;
    (function step() {
      if (ltN >= T.total) { canvas.innerHTML = ""; T.clearTimers(); document.body.dataset.layertext = JSON.stringify({ checked: ltDone, texts: ltTexts, bad: ltBad.slice(0, 80), badCount: ltBad.length }); return; }
      var n = ++ltN; document.body.dataset.layertextAt = n;
      ["desk", "mob"].forEach(function (d) {
        try {
          use(n); mode = "edit"; dev = d; S = fresh(); curPage = "home"; render();
          var view = viewOf(), tp = view && $(".tp", view), z = zoomOf(view), t0 = tp.getBoundingClientRect(), seen = new Map(), rg = document.createRange();
          layersNow().forEach(function (l) {
            if (l.kind !== "text" || !l.nodes) return; ltTexts++;
            var u = null;
            l.nodes.forEach(function (t) {
              seen.set(t, (seen.get(t) || 0) + 1);
              rg.selectNodeContents(t); [].forEach.call(rg.getClientRects(), function (q) { if (!q.width || !q.height) return; u = u ? { l: Math.min(u.l, q.left), t: Math.min(u.t, q.top), r: Math.max(u.r, q.right), b: Math.max(u.b, q.bottom) } : { l: q.left, t: q.top, r: q.right, b: q.bottom }; });
            });
            if (!u || l.cut) return; /* (words cut off by their box are drawn only as far as they show) */
            var x = (u.l - t0.left) / z, y = (u.t - t0.top) / z, w = (u.r - u.l) / z, h = (u.b - u.t) / z, k = 6;
            if (x < l.x - k || y < l.y - k || x + w > l.x + l.w + k || y + h > l.y + l.h + k || Math.abs(y - l.y) > k) ltBad.push(T.tag(n) + " " + d + ': drawn away from its words "' + l.name + '"');
          });
          seen.forEach(function (c, t) { if (c > 1) ltBad.push(T.tag(n) + " " + d + ': drawn twice "' + t.textContent.trim().slice(0, 24) + '"'); });
        } catch (e) { ltBad.push(T.tag(n) + " " + d + ": error " + e.message); }
        ltDone++;
      });
      setTimeout(step, 0);
    })();
    return;
  }

  /* a published site: its pictures are on the server (/m/…), the page is drawn once, and that is all */
  if (SV) { root.classList.add("ed-site"); var md = SV.media || {}; for (var mk in md) if (/^\/m\/[a-f0-9]{64}\.(jpg|png|webp|gif|glb|mp4|webm)$/.test(md[mk])) DATA[mk] = md[mk]; render(); return; }
  /* start: the pictures the person added before, then the page */
  undoState();
  var wasOpen = true; try { wasOpen = localStorage.getItem(FILES_KEY) !== "0"; } catch (e) {}
  if (!CHECK) $("#edFilesBtn").addEventListener("click", function () { setFiles(!filesOpen); });
  if (!CHECK && !phone.matches) setFiles(true); /* on a computer the panel is always open */
  if (!CHECK && phone.matches) setFiles(false); /* a phone has no side panel: the page is edited by tapping it */
  openDb(function () { dbLoad(function () { drawFiles(); render(); try { savedAt = JSON.parse(localStorage.getItem("1440-edited") || "{}")[KEY] || 0; } catch (e) {} showSave(); hint("글이나 사진을 눌러서 고쳐 보세요"); }); });
})();
