(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* the address typed on the first page arrives as ?site=name */
  function clean(v) {
    return (v || "").toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var site = clean(new URLSearchParams(location.search).get("site"));
  var host = (site || "이름") + ".kor.gallery";
  var N = esc(site || "이름");

  var addr = document.getElementById("catsAddr");
  addr.innerHTML = site
    ? '<span class="lbl">주소 </span><b>' + esc(host) + '</b><a href="./">바꾸기</a>'
    : '<a href="./">주소 정하기</a>';

  /* ---------- page layouts, each drawn on a 1440 × 900 canvas ---------- */
  var L = {
    blank: function () {
      return '<div class="tp tp-blank">' +
        '<div class="tp-row"><span class="tp-name">' + N + '</span><span></span><span></span></div>' +
        '<div class="hint"><b>여기서 시작하세요.</b><span>글, 이미지, 영상, 갤러리를 자유롭게 놓을 수 있습니다.</span></div></div>';
    },
    feed: function (o) {
      return '<div class="tp tp-feed' + (o.left ? " left" : "") + '">' +
        '<div class="tp-row"><span class="tp-name">' + N + '</span><span>작업, 정보, 이메일</span><span class="m" data-clock>00:00:00</span></div>' +
        '<div class="art ' + o.art + '"></div>' +
        '<div class="cap"><span><span class="m dim">01 / 12</span>&nbsp;&nbsp;무제 (창문 연작), 2026</span>' +
        '<p>해 질 무렵 창문에 비친 도시를 열두 장의 그림으로 기록했습니다. 캔버스에 유채, 각 53 × 65 cm.</p></div></div>';
    },
    grid: function (o) {
      var arts = ["window", "sea", "field", "wall", "orb", "clay", "moss", "dusk", "sea", "window"];
      var labels = ["창문 연작", "바다 기록", "들판", "벽의 결", "빛의 구", "흙", "이끼", "저녁", "해안선", "노을"];
      var n = o.cols * 2;
      return '<div class="tp tp-grid" style="--cols:' + o.cols + '">' +
        '<div class="tp-row"><span class="tp-name">' + N + '</span><span>작업 · 정보 · 이메일</span><span>인스타그램 ↗</span></div>' +
        '<div class="g">' + arts.slice(0, n).map(function (a, i) {
          return '<div><div class="art ' + a + '"></div><span><i>' + String(i + 1).padStart(2, "0") + '</i>' + labels[i] + '</span></div>';
        }).join("") + '</div></div>';
    },
    slide: function (o) {
      return '<div class="tp tp-slide' + (o.full ? " full" : "") + '">' +
        '<div class="tp-row"><span class="tp-name">' + N + '</span><span>작업 · 정보</span><span>이메일</span></div>' +
        '<div class="art ' + o.art + '"></div>' + (o.full ? "" : '<span class="arr l">←</span><span class="arr r">→</span>') +
        '<div class="n"><span class="m dim">03 / 08</span>&nbsp;&nbsp;' + o.caption + '</div>' +
        '<div class="foot"><span>© 2026 ' + N + '</span><span class="m" data-clock>00:00:00</span></div></div>';
    },
    type: function (o) {
      return '<div class="tp tp-type">' +
        '<div class="tp-row"><span class="tp-name">' + N + '</span><span>샘플 (자료)</span><span>정보</span></div>' +
        '<h3>' + o.title + '<span>' + o.sub + '</span></h3>' +
        '<div class="bottom"><span>이메일</span><span class="m" data-clock>00:00:00</span></div></div>';
    },
    cover: function () {
      return '<div class="tp tp-cover">' +
        '<div class="tp-row"><span class="tp-name">' + N + '</span><span>총서 04</span><span>이메일, 인스타그램 ↗</span></div>' +
        '<div class="wrap"><h3>한국 현대 타이포그래피 선집</h3><div class="rule"></div>' +
        '<div class="en">An Anthology of Contemporary Korean Typography</div><div class="rule"></div>' +
        '<div class="ed">제2판, 증보 — 활자와 화면 사이의 오십 년</div></div>' +
        '<div class="meta m">148 × 210 MM · 312쪽</div></div>';
    },
    flyer: function () {
      return '<div class="tp tp-flyer">' +
        '<div class="tp-row"><span class="tp-name">' + N + '</span><span>입장 무료</span><span>지도 ↗</span></div>' +
        '<div class="k">제3회</div><h3>을지로 인쇄 축제</h3>' +
        '<ul><li>활판 인쇄 시연</li><li>리소 인쇄 워크숍 여섯 회</li><li>포스터 교환 장터</li></ul>' +
        '<div class="d">SAT 21 NOV 2026 — 11:00 TIL 21:00</div></div>';
    },
    index: function () {
      var rows = [["동네서점연합", "연간 도서 목록", "R/XTR-082", "2026"], ["Gallery Nine", "Exhibition Identity", "R/PRT-017", "2025"],
        ["문래 금속공방", "웹사이트", "R/CXX-500", "2025"], ["Studio Halla", "Type Specimen", "R/ANV-310", "2024"],
        ["한밭 영화제", "포스터 시리즈", "X/BXN-014", "2023"], ["종이와 연필", "패키지 디자인", "X/QOR-809", "2022"],
        ["서울 사진 연감", "편집 디자인", "X/CRQ-081", "2022"], ["Field Notes", "Magazine Layout", "X/SHF-902", "2021"],
        ["을지로 활판소", "아이덴티티", "X/TSL-203", "2021"], ["바다 레코드", "앨범 커버", "V/PLX-302", "2020"]];
      return '<div class="tp tp-index">' +
        '<div class="tp-row"><span class="tp-name">' + N + '</span><span>☑ 인덱스 ☐ 그리드</span><span>정보</span></div>' +
        '<table><thead><tr><th>클라이언트</th><th>프로젝트</th><th>코드</th><th class="y">연도</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="m">' + r[2] + '</td><td class="y m">' + r[3] + '</td></tr>'; }).join("") +
        '</tbody></table></div>';
    }
  };

  /* ---------- families and their variants ---------- */
  var FAMILIES = {
    feed: [
      { name: "기본 피드 01", layout: "feed", o: { art: "window" }, bg: "#fcfcfc", ink: "#111" },
      { name: "기본 피드 02", layout: "feed", o: { art: "sea", left: true }, bg: "#f3efe6", ink: "#1b1a14" },
      { name: "기본 피드 03", layout: "feed", o: { art: "dusk" }, bg: "#111", ink: "#eee" }
    ],
    grid: [
      { name: "기본 그리드 01", layout: "grid", o: { cols: 4 }, bg: "#fff", ink: "#111" },
      { name: "기본 그리드 02", layout: "grid", o: { cols: 3 }, bg: "#f3efe6", ink: "#1b1a14" },
      { name: "기본 그리드 03", layout: "grid", o: { cols: 5 }, bg: "#141414", ink: "#eee" }
    ],
    slide: [
      { name: "기본 슬라이드쇼 01", layout: "slide", o: { art: "orb", caption: "빛의 구, 2026" }, bg: "#0e0e0e", ink: "#ececec" },
      { name: "기본 슬라이드쇼 02", layout: "slide", o: { art: "field", caption: "들판, 2025" }, bg: "#fcfcfc", ink: "#111" },
      { name: "기본 슬라이드쇼 03", layout: "slide", o: { art: "sea", caption: "바다 기록, 2024", full: true }, bg: "#000", ink: "#fff" }
    ],
    graphic: [
      { name: "그래픽 T101", layout: "type", o: { title: "빛과 그림자", sub: "Light & Shadow" }, bg: "#1f3fff", ink: "#fff", variants: 4 },
      { name: "그래픽 E330", layout: "cover", o: {}, bg: "#f0dc4a", ink: "#1b1a14", variants: 3 },
      { name: "그래픽 R486", layout: "flyer", o: {}, bg: "#e3261b", ink: "#fff6ea", variants: 3 },
      { name: "그래픽 I908", layout: "index", o: {}, bg: "#e8ebee", ink: "#15181c", variants: 5 },
      { name: "그래픽 T102", layout: "type", o: { title: "여름 활자", sub: "Summer Type" }, bg: "#111", ink: "#f2f2f2", variants: 4 },
      { name: "그래픽 E331", layout: "cover", o: {}, bg: "#f2c7bd", ink: "#2d1f1c", variants: 3 }
    ],
    blank: [
      { name: "빈 템플릿", layout: "blank", o: {}, bg: "#fcfcfc", ink: "#111", variants: 2 },
      { name: "빈 템플릿 (어두운)", layout: "blank", o: {}, bg: "#111", ink: "#eee", variants: 2 }
    ]
  };
  var ALL = [];
  Object.keys(FAMILIES).forEach(function (f) {
    FAMILIES[f].forEach(function (t) {
      t.id = t.name.replace(/\s+/g, "-");
      t.variants = t.variants || FAMILIES[f].length;
      ALL.push(t);
    });
  });

  var ICON = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    fwd: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3h1.5v11h-13V10H7zm2 0h6V7a3 3 0 0 0-6 0v3z"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/></svg>'
  };

  /* favourites stay in this browser only */
  var stars = {};
  try { stars = JSON.parse(localStorage.getItem("1440-stars") || "{}"); } catch (e) {}
  function saveStars() { try { localStorage.setItem("1440-stars", JSON.stringify(stars)); } catch (e) {} }

  function card(t) {
    return '<article class="tpl" data-id="' + t.id + '">' +
      '<button type="button" class="tpl-open" aria-label="' + t.name + ' 템플릿 고르기">' +
        '<div class="mac" aria-hidden="true">' +
          '<div class="mac-bar">' +
            '<div class="mac-left"><span class="lights"><i></i><i></i><i></i></span><span class="mac-nav">' + ICON.back + ICON.fwd + '</span></div>' +
            '<div class="mac-url">' + ICON.lock + '<span>' + esc(host) + '</span></div>' +
            '<div class="mac-tools">' + ICON.share + ICON.plus + '</div>' +
          '</div>' +
          '<div class="mac-view"><div class="canvas" style="--t-bg:' + t.bg + ';--t-ink:' + t.ink + '">' + L[t.layout](t.o) + '</div></div>' +
        '</div>' +
        '<span class="tpl-use" aria-hidden="true">사용하기</span>' +
      '</button>' +
      '<div class="tpl-cap">' +
        '<button type="button" class="star" aria-pressed="' + (!!stars[t.id]) + '" aria-label="' + t.name + ' 즐겨찾기">' + (stars[t.id] ? "★" : "☆") + '</button>' +
        '<span class="nm">' + t.name + '</span>' +
        '<span class="pill">' + t.variants + '개 변형</span>' +
      '</div>' +
    '</article>';
  }

  document.querySelectorAll(".row[data-family]").forEach(function (row) {
    row.innerHTML = FAMILIES[row.dataset.family].map(card).join("");
  });

  /* ---------- shuffle: one large preview, → shows another at random ---------- */
  var stage = document.getElementById("shuffleStage");
  var order = ALL.slice().sort(function () { return Math.random() - 0.5; });
  var si = 0;
  function showShuffle() {
    stage.innerHTML = card(order[si]) +
      '<button type="button" class="shuffle-next" aria-label="다른 템플릿 보기">' + ICON.next + '</button>';
    stage.querySelector(".shuffle-next").addEventListener("click", function () {
      si = (si + 1) % order.length;
      showShuffle();
    });
    markPicked();
    scaleAll();
    observe();
  }

  /* ---------- scale every 1440 × 900 page to its window ---------- */
  var ro = "ResizeObserver" in window ? new ResizeObserver(function (es) { es.forEach(function (e) { scale(e.target); }); }) : null;
  function scale(v) { v.firstElementChild.style.transform = "scale(" + (v.clientWidth / 1440) + ")"; }
  function scaleAll() { document.querySelectorAll(".mac-view").forEach(scale); }
  function observe() { if (ro) document.querySelectorAll(".mac-view").forEach(function (v) { ro.observe(v); }); }
  if (!ro) addEventListener("resize", scaleAll);

  /* ---------- live clocks inside previews ---------- */
  function tick() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    var s = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    document.querySelectorAll("[data-clock]").forEach(function (n) { n.textContent = s; });
  }
  setInterval(tick, 1000);

  /* ---------- picking, stars ---------- */
  var picked = null;
  var bar = document.getElementById("pickbar");
  var barT = document.getElementById("pickbarT");
  var status = document.getElementById("pickStatus");
  function markPicked() {
    document.querySelectorAll(".tpl").forEach(function (c) { c.classList.toggle("is-picked", c.dataset.id === picked); });
  }
  document.addEventListener("click", function (e) {
    var starBtn = e.target.closest(".star");
    if (starBtn) {
      var id = starBtn.closest(".tpl").dataset.id;
      stars[id] = !stars[id];
      if (!stars[id]) delete stars[id];
      saveStars();
      document.querySelectorAll('.tpl[data-id="' + id + '"] .star').forEach(function (b) {
        b.setAttribute("aria-pressed", !!stars[id]);
        b.textContent = stars[id] ? "★" : "☆";
      });
      return;
    }
    var open = e.target.closest(".tpl-open");
    if (!open) return;
    picked = open.closest(".tpl").dataset.id;
    var t = ALL.filter(function (x) { return x.id === picked; })[0];
    markPicked();
    barT.innerHTML = esc(host) + ' · <b>' + t.name + '</b>';
    bar.hidden = false;
    status.textContent = host + ", " + t.name + " 템플릿을 골랐습니다.";
  });
  document.getElementById("pickbarGo").addEventListener("click", function () {
    status.textContent = "가입 기능은 준비 중입니다.";
    barT.innerHTML = '가입 기능은 준비 중입니다.';
  });

  /* ---------- category bar follows the section in view ---------- */
  var links = document.querySelectorAll(".cats-links a");
  function setOn(id) { links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + id); }); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setOn(e.target.id); });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".sec").forEach(function (s) { io.observe(s); });
  }
  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var s = document.querySelector(a.getAttribute("href"));
      s.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      setOn(s.id);
    });
  });
  setOn("shuffle");

  showShuffle();
  observe();
  scaleAll();
  tick();
})();
