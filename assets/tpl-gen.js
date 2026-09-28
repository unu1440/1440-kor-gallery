/* Template generator for 1440.kor.gallery.
   The 80 hand-made templates in templates.js are joined by 1,360 generated ones, so that every
   number n/1440 is its own template. A generated template is a combination of
     nav     where the menu sits (top, side, bottom, corners, a menu button …)
     layout  how the first page is built (one picture, a grid, a slideshow, an index …)
     type    size step, letter case and alignment of the words
     cap     how pictures are captioned
     feats   the site features it carries (index, shop, filter, slideshow mode, audio …)
   No two generated templates share the same nav + layout + features, and no two share the whole
   combination; tools/check-templates.js fails when they do.
   Photographs come from window.PHOTOS and are handed out least-used first, never twice in one
   template. Works in the browser (window.TPLGEN) and in Node (module.exports) for the check. */
(function (root) {
  "use strict";

  /* ---------- deterministic randomness: the same catalogue on every load ---------- */
  function rng(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  function chance(r, p) { return r() < p; }
  function shuffled(r, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function arv(a) { var m = String(a).split("/"); return m.length > 1 ? +m[0] / +m[1] : +a; }
  function px(x, y, w, h) { return "left:" + Math.round(x) + "px;top:" + Math.round(y) + "px;width:" + Math.round(w) + "px;height:" + Math.round(h) + "px"; }

  /* ---------- vocabulary ---------- */
  var NAV_KO = { top3: "위 3단 메뉴", top2: "위 양끝 메뉴", left: "왼쪽 세로 메뉴", right: "오른쪽 세로 메뉴", bottom: "아래 메뉴 바", center: "가운데 제목", corners: "네 구석 메뉴", burger: "메뉴 버튼" };
  var NAVS = Object.keys(NAV_KO);
  var SCALES = { s: 1, m: 1.4, l: 1.9, xl: 2.6 };
  var CASES = ["none", "upper", "lower"];
  var ALIGNS = ["left", "center", "right"];
  var CAPS = ["below", "numbered", "overlay", "hover", "none"];
  var CAP_KO = { below: "아래 캡션", numbered: "번호 캡션", overlay: "사진 위 캡션", hover: "올리면 캡션", none: "캡션 없음" };
  var FACES = {
    sans: ["'Inter', 'Pretendard Variable', sans-serif", "100%"],
    cond: ["'Archivo', 'Pretendard Variable', sans-serif", "75%"],
    wide: ["'Archivo', 'Pretendard Variable', sans-serif", "118%"],
    serif: ["'Newsreader', 'Nanum Myeongjo', serif", "100%"],
    mono: ["'Geist Mono', 'Pretendard Variable', monospace", "100%"]
  };
  var FEAT_KO = {
    index: "작업 색인", contact: "연락처", shop: "상점·장바구니", search: "검색", news: "뉴스레터 구독", lang: "한/영 전환", clock: "실시간 시계",
    filter: "분류 필터", pages: "페이지 넘김", products: "상품 담기",
    "slides-click": "슬라이드쇼(눌러 넘김)", "slides-arrows": "슬라이드쇼(화살표)", "slides-auto": "슬라이드쇼(자동 재생)", "slides-dots": "슬라이드쇼(점 이동)",
    "slides-thumbs": "슬라이드쇼(썸네일)", "slides-list": "목록에 올려 사진 바꾸기",
    audio: "오디오 플레이어", accordion: "펼침 목록", form: "문의 양식", hours: "영업시간 표시", countdown: "남은 날 표시", sort: "표 정렬",
    rake: "빛 비추기", model: "3D 뷰어", compare: "전후 비교", loupe: "돋보기", daylight: "낮밤 조명", docent: "오디오 도슨트", guestbook: "방명록", scale: "실제 크기 보기",
    rooms: "전시장 평면도", roster: "작가 명단", menu: "메뉴 열기"
  };

  var NAV_ITEMS = {
    home: ["Work", "작업"], info: ["Info", "정보"], index: ["Index", "색인"], contact: ["Contact", "연락"], shop: ["Shop", "상점"], cart: ["Cart (0)", "장바구니 (0)"],
    search: ["Search", "검색"], news: ["Newsletter", "뉴스레터"], lang: ["EN / 한", "한 / EN"]
  };
  var SEPS = [" · ", ", ", "&nbsp;&nbsp;&nbsp;", " / "];

  /* ---------- words (original; no real people, works, places of business or brands) ---------- */
  var ABOUT = [
    ["Photographs rooms after people leave them: the light on a wall, a chair pushed back, the hour before closing.", "사람이 떠난 뒤의 방을 찍습니다. 벽에 남은 빛, 밀려난 의자, 문 닫기 전의 한 시간."],
    ["Makes vessels and small furniture in a studio by the river. Things meant to be used every day for a long time.", "강가 작업실에서 그릇과 작은 가구를 만듭니다. 오래, 매일 쓰일 물건을 생각합니다."],
    ["Designs books, posters and type. Most of the work is about spacing: between letters, lines and pages.", "책과 포스터, 글자를 디자인합니다. 일의 대부분은 간격, 글자와 줄과 쪽 사이의 간격입니다."],
    ["Paints slowly, in layers, one picture a season. The paintings are about weather and the time it takes to notice it.", "한 계절에 한 점씩, 여러 겹으로 천천히 그립니다. 날씨와 그것을 알아차리는 데 걸리는 시간에 관한 그림입니다."],
    ["Records the 1,440 minutes of a day in photographs, sound and short films.", "하루 1,440분을 사진과 소리, 짧은 영상으로 기록합니다."],
    ["An independent studio for spaces, objects and exhibitions, working with small institutions and private clients.", "공간과 사물, 전시를 만드는 독립 스튜디오입니다. 작은 기관, 개인 의뢰인과 함께 일합니다."],
    ["Draws plants, animals and the insides of houses for books, walls and packaging.", "책과 벽, 포장지를 위해 식물과 동물, 집 안을 그립니다."],
    ["Shoots food, tables and kitchens for restaurants and cookbooks. Mostly daylight, mostly before lunch.", "식당과 요리책을 위해 음식과 식탁, 부엌을 찍습니다. 주로 자연광으로, 주로 점심 전에."]
  ];
  var TITLES = ["Morning Table", "Quiet Rooms", "Salt and Glass", "A Year of Windows", "Blue Hour", "Soft Machines", "Paper Weather", "Field Notes", "Second Light", "Small Objects",
    "North Facing", "Long Exposure", "Afterimage", "Low Tide", "Open Studio", "Thin Walls", "Held Still", "Common Ground", "Half Moon", "Slow Water", "Room Tone", "Dry Season"];
  var TITLES_KO = ["아침 식탁", "조용한 방", "소금과 유리", "창문의 한 해", "푸른 시간", "부드러운 기계", "종이 날씨", "현장 노트", "두 번째 빛", "작은 사물",
    "북향", "긴 노출", "잔상", "썰물", "열린 작업실", "얇은 벽", "멈춘 채로", "공터", "반달", "느린 물", "방의 소리", "건기"];
  var CITIES = ["Seoul", "Busan", "Jeju", "Daegu", "Gwangju", "Incheon", "Gangneung", "Jeonju", "Suwon", "Pohang"];
  var CITIES_KO = ["서울", "부산", "제주", "대구", "광주", "인천", "강릉", "전주", "수원", "포항"];
  var MATS = [["Archival pigment print", "피그먼트 프린트"], ["Stoneware, ash glaze", "석기, 재유"], ["Oil on linen", "린넨에 유채"], ["Oak and linen", "참나무, 린넨"], ["Risograph, two colours", "리소그래프, 2도"],
    ["Silver gelatin print", "젤라틴 실버 프린트"], ["Glass and steel", "유리, 강철"], ["Ink on paper", "종이에 먹"], ["Single-channel video, 6 min", "단채널 영상, 6분"], ["Plaster and pigment", "석고, 안료"]];
  var TRACKS = ["Window Seat", "Four in the Afternoon", "Night Bus", "Hands", "Tide Table", "Paper Moon", "Last Train", "Rooftop", "Early Light", "Small Hours", "Kettle", "Blue Tiles"];
  var ROLES = [["Painting", "회화"], ["Ceramics", "도예"], ["Sculpture", "조소"], ["Video", "영상"], ["Design", "디자인"], ["Printmaking", "판화"], ["Photography", "사진"], ["Textile", "섬유"]];
  var PEOPLE = ["Kim Haneul", "Lee Dohyun", "Oh Mina", "Park Seoyun", "Seo Jiwoo", "Jung Woojin", "Han Sora", "Choi Yerin", "Yoon Jae", "Kang Minho", "Lim Dain", "Shin Hayoung",
    "Baek Siwoo", "Ryu Nari", "Moon Gaeun", "Hwang Eunbi", "Song Taeho", "Jeon Haru", "Nam Yuri", "Cha Ian", "Go Eunseo", "Bae Joon", "Ahn Sol", "Ko Mirae"];
  var PRICES = ["₩38,000", "₩48,000", "₩65,000", "₩120,000", "₩24,000", "₩89,000", "₩210,000", "₩15,000", "₩56,000", "₩74,000", "₩32,000", "₩160,000"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ---------- the page chrome: menu positions and the box left for content ---------- */
  function navItems(c) {
    var f = c.f, it = [["home"], ["info"]];
    if (f.index) it.push(["index"]);
    if (f.shop || f.products) it.push(["shop"]);
    if (f.contact) it.push(["contact"]);
    if (f.search) it.push(["search"]);
    if (f.news) it.push(["news"]);
    var util = [];
    if (f.shop || f.products) util.push(["cart"]);
    if (f.lang) util.push(["lang"]);
    return { main: it, util: util };
  }
  var LV = { home: "home", info: "info", index: "index", contact: "contact", shop: "home", cart: "cart", search: "search", news: "news", lang: "lang" };
  function navBtn(c, k) {
    var w = NAV_ITEMS[k[0]], main = c.ko ? w[1] : w[0], other = c.ko ? w[0] : w[1];
    return '<button type="button" class="lv-a" data-lv="' + LV[k[0]] + '"' + (c.f.lang && k[0] !== "lang" ? ' data-t="' + other + '"' : "") + '>' + main + '</button>';
  }
  function navHtml(c) {
    var s = c.s, n = navItems(c), sep = c.sep, ink = c.bleedInk ? "color:#fff;" : "";
    var main = n.main.map(function (k) { return navBtn(c, k); }).join(sep);
    var util = n.util.map(function (k) { return navBtn(c, k); }).concat(c.f.clock ? ['<span class="m" data-clock>00:00:00</span>'] : []).join(sep);
    var name = '<button type="button" class="lv-a tp-name" data-lv="home">' + c.N + '</button>';
    var fs = 16, h = "", B;
    switch (s.nav) {
      case "top3":
        h = '<div class="tp-row tp-nav" style="' + ink + '"><span>' + name + '</span><span>' + main + '</span><span>' + util + '</span></div>';
        B = { x: 28, y: 84, w: 1384, h: 776 }; break;
      case "top2":
        h = '<div class="tp-nav" style="position:absolute;left:28px;right:28px;top:22px;display:flex;justify-content:space-between;gap:30px;font-size:' + fs + 'px;' + ink + '"><span>' + name + '</span><span>' + main + (util ? sep + util : "") + '</span></div>';
        B = { x: 28, y: 84, w: 1384, h: 776 }; break;
      case "left":
      case "right":
        var side = s.nav === "left" ? "left:28px" : "right:28px;text-align:right";
        h = '<div class="tp-nav" style="position:absolute;' + side + ';top:22px;bottom:22px;width:210px;display:flex;flex-direction:column;gap:28px;font-size:' + fs + 'px;' + ink + '">' + name +
          '<div style="display:grid;gap:4px">' + n.main.map(function (k) { return '<span>' + navBtn(c, k) + '</span>'; }).join("") + '</div>' +
          (util ? '<div style="display:grid;gap:4px">' + util.split(sep).map(function (u) { return '<span>' + u + '</span>'; }).join("") + '</div>' : "") +
          '<div style="margin-top:auto;font-size:14px;opacity:.55">' + c.foot + '</div></div>';
        B = s.nav === "left" ? { x: 290, y: 28, w: 1122, h: 844 } : { x: 28, y: 28, w: 1122, h: 844 }; break;
      case "bottom":
        h = '<div class="tp-nav" style="position:absolute;left:28px;right:28px;bottom:22px;display:grid;grid-template-columns:1fr auto 1fr;gap:20px;font-size:' + fs + 'px;' + ink + '"><span>' + name + '</span><span>' + main + '</span><span style="text-align:right">' + (util || c.foot) + '</span></div>';
        B = { x: 28, y: 28, w: 1384, h: 800 }; break;
      case "center":
        var big = Math.round(34 * Math.min(c.sc, 1.9));
        h = '<div class="tp-nav" style="position:absolute;left:28px;right:28px;top:20px;display:grid;justify-items:center;gap:8px;' + ink + '"><span style="font-size:' + big + 'px;font-weight:600;letter-spacing:-.03em;line-height:1.05">' + name + '</span>' +
          '<span style="font-size:' + fs + 'px">' + main + (util ? sep + util : "") + '</span></div>';
        var top = 20 + big * 1.05 + 44;
        B = { x: 28, y: top, w: 1384, h: 860 - top }; break;
      case "corners":
        var half = Math.ceil(n.main.length / 2);
        var a = n.main.slice(0, half).map(function (k) { return navBtn(c, k); }).join(sep), b = n.main.slice(half).map(function (k) { return navBtn(c, k); }).join(sep);
        h = '<div class="tp-nav" style="' + ink + '"><span style="position:absolute;left:28px;top:22px;font-size:' + fs + 'px">' + name + '</span><span style="position:absolute;right:28px;top:22px;font-size:' + fs + 'px">' + a + '</span>' +
          '<span style="position:absolute;left:28px;bottom:22px;font-size:' + fs + 'px">' + b + '</span><span style="position:absolute;right:28px;bottom:22px;font-size:' + fs + 'px">' + (util || c.foot) + '</span></div>';
        B = { x: 28, y: 70, w: 1384, h: 760 }; break;
      default: /* burger */
        h = '<div class="tp-nav" style="position:absolute;left:28px;right:28px;top:22px;display:flex;justify-content:space-between;align-items:center;font-size:' + fs + 'px;' + ink + '"><span>' + name + '</span><span>' +
          (util ? util + "&nbsp;&nbsp;&nbsp;" : "") + '<button type="button" class="lv-a" data-lv="menu"><span style="display:inline-block;width:22px;border-top:2px solid;border-bottom:2px solid;height:8px;vertical-align:.1em;margin-right:8px"></span>' + (c.ko ? "메뉴" : "Menu") + '</button></span><span hidden>' + n.main.map(function (k) { return navBtn(c, k); }).join("") + '</span></div>';
        B = { x: 28, y: 84, w: 1384, h: 776 };
    }
    var hasFoot = ["top3", "top2", "center", "burger"].indexOf(s.nav) >= 0;
    return { html: h, box: B, foot: hasFoot };
  }

  /* ---------- a rendering context: photographs, words, wireframe mode ---------- */
  function ctx(spec, env) {
    var c = {
      s: spec, f: {}, env: env, wire: spec.cat === "blank", N: env.N, ko: spec.ko, sc: SCALES[spec.type.scale], al: spec.type.align,
      sep: SEPS[spec.seed % SEPS.length], P: spec.photos.map(function (f) { return env.photo(f); }), slides: null
    };
    spec.feats.forEach(function (k) { c.f[k.replace(/-.*/, "")] = true; c.f[k] = true; });
    /* wireframes carry no photographs: empty stand-ins keep subjects for filters */
    if (c.wire) for (var w = 0; w < 48; w++) c.P.push({ f: "", ko: "", en: "", g: GROUPS[w % GROUPS.length] });
    c.r = rng(spec.seed * 7 + 3);
    c.src = env.src;
    c.foot = "© 2026 " + env.N;
    c.t = function (en, ko) {
      var main = c.ko ? ko : en, other = c.ko ? en : ko;
      return c.f.lang && other ? '<span data-t="' + env.esc(other) + '">' + main + '</span>' : main;
    };
    c.title = function (i) { var p = c.P[i % c.P.length]; return p ? c.t(p.en, p.ko) : ""; };
    c.year = function (i) { return 2026 - ((i * 7 + spec.seed) % 6); };
    c.img = function (i, style, attrs) {
      if (c.wire) return '<div class="wf" style="' + style + '" ' + (attrs || "") + '></div>';
      var p = c.P[i]; if (!p) return "";
      return '<div class="ph" style="' + style + '" ' + (attrs || "") + '><img src="' + c.src(p.f) + '" alt="" loading="lazy" decoding="async"></div>';
    };
    c.lines = function (ws, style, h) { return '<div style="display:grid;gap:10px;' + (style || "") + '">' + ws.map(function (w) { return '<div class="wl" style="width:' + w + (h ? ";height:" + h + "px" : "") + '"></div>'; }).join("") + '</div>'; };
    c.para = function (en, ko, style) {
      if (c.wire) return c.lines(["100%", "92%", "97%", "60%"], style);
      return '<p style="' + (style || "") + '">' + c.t(en, ko) + '</p>';
    };
    c.capText = function (i) {
      if (c.wire) return '<div class="wl" style="width:' + (40 + (i * 17) % 40) + '%;height:9px;margin-top:4px"></div>';
      return c.title(i);
    };
    /* grid item with caption, as .gi so the quick view finds its caption */
    c.fig = function (i, ar, k, extra) {
      var cap = spec.cap, p = c.P[i];
      if (!p && !c.wire) return "";
      var price = c.f.products ? PRICES[(i + spec.seed) % PRICES.length] : "";
      var cat = p ? ' data-cat="' + p.g + '"' : "";
      var frame = c.wire ? '<div class="wf in" style="--ar:' + ar + '"></div>' : '<div class="fr" style="--ar:' + ar + '"><img src="' + c.src(p.f) + '" alt="" loading="lazy" decoding="async"></div>';
      var body = "";
      if (c.wire) body = cap === "none" ? "" : c.capText(i);
      else if (price) body = '<span>' + c.title(i) + '<i>' + price + '</i><button type="button" class="lv-a" data-add="' + i + '" style="margin-left:auto">' + (c.ko ? "담기" : "Add") + '</button></span>';
      else if (cap === "numbered") body = '<span><i>' + pad2(k + 1) + '</i>' + c.title(i) + '</span>';
      else if (cap === "below") body = '<span>' + c.title(i) + '<i>' + c.year(i) + '</i></span>';
      else if (cap === "overlay" || cap === "hover") body = '<span>' + c.title(i) + '</span>';
      else body = '<span style="display:none">' + c.title(i) + '</span>';
      return '<div class="gi' + (cap === "overlay" && !price ? " ov" : "") + '"' + cat + (extra || "") + '>' + frame + body + '</div>';
    };
    /* caption for a single large picture */
    c.one = function (i, n, style) {
      if (c.wire) return '<div style="position:absolute;' + style + '">' + c.lines(["260px"], "", 10) + '</div>';
      var cap = spec.cap, t = c.title(i), y = c.year(i);
      var num = '<span class="m" data-sn style="opacity:.55">' + pad2(1) + ' / ' + pad2(n) + '</span>';
      var txt = cap === "numbered" ? num + '&nbsp;&nbsp;<span data-sc>' + t + '</span>' : cap === "none" ? (n > 1 ? num : "") : '<span data-sc>' + t + '</span>' + (cap === "below" ? '<span style="opacity:.55">, ' + y + '</span>' : "") + (n > 1 ? '&nbsp;&nbsp;&nbsp;' + num : "");
      return '<div style="position:absolute;font-size:16px;' + style + '">' + txt + '</div>';
    };
    return c;
  }

  /* ---------- feature blocks placed inside a layout ---------- */
  /* the text column of a layout can hold one of: audio player, accordion, form */
  function panel(c, w) {
    var f = c.f, ko = c.ko, h = "";
    if (f.audio) {
      var tr = shuffled(c.r, TRACKS).slice(0, 5);
      h = '<div data-audio style="display:grid;gap:0;font-size:16px;width:' + w + 'px"><div style="display:flex;justify-content:space-between;font-size:13px;opacity:.55;padding-bottom:6px;border-bottom:1px solid">' +
        '<span>' + (ko ? "듣기" : "Listen") + '</span><span class="m" data-atime>00:00</span></div>' +
        tr.map(function (t, i) {
          var d = (2 + (i * 3 + c.s.seed) % 4) + ":" + pad2((i * 17 + c.s.seed * 3) % 60);
          return '<div data-play="' + i + '" data-len="' + d + '" style="position:relative;display:grid;grid-template-columns:30px 1fr auto;padding:7px 0;border-bottom:1px solid color-mix(in srgb,currentColor 18%,transparent)">' +
            '<span class="m" data-pi style="opacity:.5">' + pad2(i + 1) + '</span><span>' + t + '</span><span class="m" style="opacity:.5">' + d + '</span>' +
            '<i data-prog style="position:absolute;left:0;bottom:-1px;height:2px;width:0;background:currentColor"></i></div>';
        }).join("") + '</div>';
    } else if (f.accordion) {
      var rows = ko ? [["소개", "작업실은 도시 북쪽 오래된 인쇄소 건물 3층에 있습니다."], ["의뢰", "책, 전시, 공간 작업을 받습니다. 일정은 두 달 전에 정합니다."], ["수업", "매달 둘째 주 토요일, 여섯 명과 함께하는 작은 수업을 엽니다."], ["자주 묻는 질문", "배송은 3–5일, 교환은 7일 안에 가능합니다."]]
        : [["About", "The studio is on the third floor of an old print shop in the north of the city."], ["Commissions", "Books, exhibitions and spaces. We plan about two months ahead."], ["Classes", "A small class for six people on the second Saturday of each month."], ["FAQ", "Shipping takes 3–5 days; exchanges within 7 days."]];
      h = '<div style="display:grid;font-size:17px;width:' + w + 'px">' + rows.map(function (r) {
        return '<div data-acc style="border-top:1px solid;padding:9px 0"><div style="display:flex;justify-content:space-between"><span>' + r[0] + '</span><span data-acc-i>+</span></div>' +
          '<div class="acc-more" style="font-size:15px;opacity:.7">' + (c.wire ? c.lines(["90%", "70%"], "padding-top:8px") : r[1]) + '</div></div>';
      }).join("") + '</div>';
    } else if (f.form) {
      var inp = "font:inherit;font-size:15px;padding:9px 0;border:0;border-bottom:1px solid currentColor;background:none;color:inherit;width:100%;outline:none";
      h = '<form data-form style="display:grid;gap:10px;width:' + w + 'px;font-size:15px"><b style="font-weight:500">' + (ko ? "문의하기" : "Get in touch") + '</b>' +
        '<input style="' + inp + '" placeholder="' + (ko ? "이름" : "Name") + '" aria-label="이름"><input style="' + inp + '" placeholder="' + (ko ? "이메일" : "Email") + '" aria-label="이메일">' +
        '<input style="' + inp + '" placeholder="' + (ko ? "하고 싶은 말" : "Message") + '" aria-label="내용">' +
        '<button style="justify-self:start;font:inherit;font-size:15px;padding:8px 18px;border:1px solid;border-radius:99px;background:none;color:inherit;cursor:pointer">' + (ko ? "보내기" : "Send") + ' →</button></form>';
    }
    return h;
  }
  /* small live line in the footer: opening hours or days left */
  function widget(c) {
    var f = c.f, ko = c.ko;
    if (f.hours) { var o = 10 + c.s.seed % 3, cl = 18 + c.s.seed % 3; return '<span data-hours="' + o + ',' + cl + '" data-ko="' + (ko ? 1 : "") + '">' + (ko ? "영업시간 " : "Open ") + o + "–" + cl + '</span>'; }
    if (f.countdown) {
      var m = 10 + c.s.seed % 3, d = 1 + (c.s.seed * 7) % 27, iso = "2026-" + pad2(m) + "-" + pad2(d);
      return '<span data-until="' + iso + '" data-ko="' + (ko ? 1 : "") + '">' + (ko ? "개막 " : "Opening ") + MONTHS[m - 1] + " " + d + '</span>';
    }
    return "";
  }
  /* toolbar above a grid: filter chips and pages */
  function toolbar(c, cats) {
    var f = c.f, ko = c.ko, l = "", r = "";
    if (f.filter) {
      var name = { obj: ["Objects", "사물"], people: ["People", "사람"], land: ["Landscape", "풍경"], space: ["Spaces", "공간"], art: ["Paintings", "그림"], life: ["Still life", "정물"], dream: ["Dream", "꿈"] };
      l = '<button type="button" class="lv-a" data-filter="*" style="font-weight:600">' + (ko ? "전체" : "All") + '</button>' + cats.map(function (g) { return c.sep + '<button type="button" class="lv-a" data-filter="' + g + '" style="opacity:.5">' + name[g][ko ? 1 : 0] + '</button>'; }).join("");
    }
    if (f.pages) r = [1, 2, 3].map(function (p) { return '<button type="button" class="lv-a m" data-page="' + p + '" style="' + (p === 1 ? "font-weight:600" : "opacity:.5") + '">' + p + '</button>'; }).join("&nbsp;&nbsp;") + '&nbsp;&nbsp;<button type="button" class="lv-a" data-page="+">→</button>';
    if (!l && !r) return "";
    return '<div style="display:flex;justify-content:space-between;gap:20px;font-size:15px;margin-bottom:18px">' + '<span>' + l + '</span><span>' + r + '</span></div>';
  }
  function catsOf(c, n) { var seen = [], i; for (i = 0; i < n && i < c.P.length; i++) if (seen.indexOf(c.P[i].g) < 0) seen.push(c.P[i].g); return seen.slice(0, 4); }
  /* slideshow controls for the chosen mode */
  function slideCtl(c, n, where) {
    var f = c.f;
    if (f["slides-arrows"]) return '<div style="position:absolute;' + where + ';display:flex;gap:26px;font-size:30px"><button type="button" class="lv-btn" data-sg="-1" aria-label="이전">←</button><button type="button" class="lv-btn" data-sg="1" aria-label="다음">→</button></div>';
    if (f["slides-dots"]) { var d = ""; for (var i = 0; i < n; i++) d += '<button type="button" class="lv-btn" data-sd="' + i + '" style="width:11px;height:11px;border-radius:50%;border:1.5px solid;background:' + (i ? "none" : "currentColor") + '"></button>'; return '<div style="position:absolute;' + where + ';display:flex;gap:10px">' + d + '</div>'; }
    if (f["slides-auto"]) return '<div style="position:absolute;' + where + ';display:flex;gap:14px;align-items:center;font-size:15px"><button type="button" class="lv-a" data-sp>' + (c.ko ? "멈춤" : "Pause") + '</button><span style="width:120px;height:2px;background:color-mix(in srgb,currentColor 25%,transparent);position:relative"><i data-sbar style="position:absolute;left:0;top:0;bottom:0;width:0;background:currentColor"></i></span></div>';
    return "";
  }
  function slideMain(c, i, style, n) { c.slides = n; return c.img(i, style, 'data-sm="' + n + '"'); }

  /* ---------- layouts for basic, blank and populated templates ----------
     each: fam (feed | grid | slide), ko name, need(spec) photos, panel (has a text column),
     grid (can filter / page / sell), slide (always a slideshow), modes (slideshow modes it takes) */
  var L = {};
  function gridLayout(cols, ar, gap) {
    return function (c, B) {
      var bar = toolbar(c, catsOf(c, 30)), top = bar ? 40 : 0;
      var fw = (B.w - gap * (cols - 1)) / cols, ih = fw / arv(ar) + 30, rows = Math.max(1, Math.min(3, Math.ceil((B.h - top) / (ih + 26))));
      var per = cols * rows, pages = c.f.pages ? 3 : 1, h = "";
      for (var p = 0; p < pages; p++) {
        var items = [];
        for (var k = 0; k < per; k++) items.push(c.fig(p * per + k, ar, k, pages > 1 ? ' data-pg="' + (p + 1) + '"' + (p ? ' style="display:none"' : "") : ""));
        h += items.join("");
      }
      return '<div style="position:absolute;' + px(B.x, B.y, B.w, B.h) + '">' + bar + '<div class="gg cap-' + c.s.cap + '" style="position:relative;gap:26px ' + gap + 'px;grid-template-columns:repeat(' + cols + ',1fr)">' + h + '</div></div>';
    };
  }
  function gridNeed(cols, ar, gap) {
    return function (s, B) { var fw = (B.w - gap * (cols - 1)) / cols, ih = fw / arv(ar) + 30, rows = Math.max(1, Math.min(3, Math.ceil((B.h - (s.feats.indexOf("filter") >= 0 || s.feats.indexOf("pages") >= 0 ? 40 : 0)) / (ih + 26)))); return cols * rows * (s.feats.indexOf("pages") >= 0 ? 3 : 1); };
  }
  [[3, "4 / 3", 22], [4, "4 / 5", 18], [5, "1 / 1", 16], [6, "3 / 4", 12]].forEach(function (g) {
    L["grid-" + g[0]] = { fam: "grid", ko: g[0] + "열 그리드", grid: true, need: gridNeed(g[0], g[1], g[2]), render: gridLayout(g[0], g[1], g[2]) };
  });
  var MAS_AR = ["3 / 4", "4 / 5", "1 / 1", "4 / 3", "2 / 3", "16 / 10", "3 / 4", "5 / 4"];
  function masonry(cols) {
    return function (c, B) {
      var bar = toolbar(c, catsOf(c, 14)), n = cols * 4, h = "";
      for (var k = 0; k < n; k++) h += c.fig(k, MAS_AR[(k + c.s.seed) % MAS_AR.length], k, ' style="break-inside:avoid;margin-bottom:22px"');
      return '<div style="position:absolute;' + px(B.x, B.y, B.w, B.h + 60) + ';overflow:hidden">' + bar + '<div class="cap-' + c.s.cap + '" style="columns:' + cols + ';column-gap:18px">' + h + '</div></div>';
    };
  }
  L["masonry-3"] = { fam: "grid", ko: "3단 세로 흐름", grid: true, need: function () { return 12; }, render: masonry(3) };
  L["masonry-4"] = { fam: "grid", ko: "4단 세로 흐름", grid: true, need: function () { return 16; }, render: masonry(4) };
  L["rows"] = { fam: "grid", ko: "줄 맞춤", grid: true, need: function () { return 10; }, render: function (c, B) {
    var bar = toolbar(c, catsOf(c, 10)), ars = [[1.5, .8, 1.33], [1, 1.78, .75, 1.25], [1.33, 1.5, .8]], k = 0, h = "";
    ars.forEach(function (row) {
      h += '<div style="display:flex;gap:14px;margin-bottom:22px">' + row.map(function (a) { var i = k++; return '<div style="flex:' + a + ' 1 0;min-width:0" class="cap-' + c.s.cap + '">' + c.fig(i, String(a), i) + '</div>'; }).join("") + '</div>';
    });
    return '<div style="position:absolute;' + px(B.x, B.y, B.w, B.h + 60) + ';overflow:hidden">' + bar + h + '</div>';
  } };
  L["bento"] = { fam: "grid", ko: "큰 칸과 작은 칸", grid: true, need: function (s) { return s.feats.indexOf("pages") >= 0 ? 15 : 5; }, render: function (c, B) {
    var bar = toolbar(c, catsOf(c, 5)), pages = c.f.pages ? 3 : 1, h = "";
    for (var p = 0; p < pages; p++) for (var k = 0; k < 5; k++) {
      var i = p * 5 + k, pg = pages > 1 ? ' data-pg="' + (p + 1) + '"' : "";
      h += c.fig(i, k ? "4 / 3" : "4 / 3", k, pg + ' style="' + (k ? "" : "grid-column:span 2;grid-row:span 2;") + (p ? "display:none" : "") + '"');
    }
    return '<div style="position:absolute;' + px(B.x, B.y, B.w, B.h) + '">' + bar + '<div class="gg cap-' + c.s.cap + '" style="position:relative;gap:22px 16px;grid-template-columns:repeat(4,1fr)">' + h + '</div></div>';
  } };
  L["sheet"] = { fam: "grid", ko: "밀착 인화지", grid: true, need: function () { return 10; }, render: function (c, B) {
    var bar = toolbar(c, catsOf(c, 10)), h = "";
    for (var k = 0; k < 10; k++) {
      var fig = c.fig(k, "3 / 2", k);
      h += '<div style="background:#141414;padding:10px 10px 6px;color:#f1f1f1">' + fig.replace('class="gi', 'class="gi') + '<div class="m" style="font-size:12px;opacity:.6;margin-top:4px">' + (k + 12) + 'A&nbsp;&nbsp;▸</div></div>';
    }
    return '<div style="position:absolute;' + px(B.x, B.y, B.w, B.h) + '">' + bar + '<div class="gg cap-' + c.s.cap + '" style="position:relative;gap:14px;grid-template-columns:repeat(5,1fr)">' + h + '</div></div>';
  } };

  /* one picture, or a few, with words */
  function slidesN(s) { return s.feats.some(function (f) { return /^slides/.test(f); }) ? 8 : 1; }
  L["hero-center"] = { fam: "feed", ko: "가운데 사진 한 장", modes: ["click", "arrows", "auto", "dots"], need: slidesN, render: function (c, B) {
    var w = Math.min(600, B.w * .44), h = B.h - 80, x = B.x + (B.w - w) / 2, n = c.f.slides ? 8 : 1;
    return slideMain(c, 0, px(x, B.y, w, h), n) + c.one(0, n, "left:" + B.x + "px;right:" + (1440 - B.x - B.w) + "px;top:" + (B.y + h + 22) + "px;text-align:" + c.al) + slideCtl(c, n, "left:" + (x + w + 30) + "px;top:" + (B.y + h - 30) + "px");
  } };
  L["hero-wide"] = { fam: "feed", ko: "넓은 사진 한 장", modes: ["click", "arrows", "auto", "dots"], need: slidesN, render: function (c, B) {
    var h = B.h - 70, n = c.f.slides ? 8 : 1;
    return slideMain(c, 0, px(B.x, B.y, B.w, h), n) + c.one(0, n, "left:" + B.x + "px;top:" + (B.y + h + 20) + "px") + slideCtl(c, n, "right:" + (1440 - B.x - B.w) + "px;top:" + (B.y + h + 14) + "px");
  } };
  L["hero-bleed"] = { fam: "feed", ko: "화면 가득 사진", bleed: true, modes: ["click", "auto", "dots"], need: slidesN, render: function (c) {
    var n = c.f.slides ? 8 : 1;
    return slideMain(c, 0, "inset:0", n) + '<div style="position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.28),transparent 22%,transparent 70%,rgba(0,0,0,.4));pointer-events:none"></div>' +
      '<div style="color:#fff">' + c.one(0, n, "left:28px;bottom:" + (c.s.nav === "bottom" || c.s.nav === "corners" ? 70 : 28) + "px;font-size:20px") + slideCtl(c, n, "right:28px;bottom:" + (c.s.nav === "bottom" || c.s.nav === "corners" ? 70 : 30) + "px") + '</div>';
  } };
  L["split"] = { fam: "feed", ko: "반반 나눔", panel: true, modes: ["click", "arrows", "auto", "dots"], need: slidesN, render: function (c, B) {
    var w = Math.round(B.w * .5), n = c.f.slides ? 8 : 1, ab = ABOUT[c.s.seed % ABOUT.length], tx = B.x + w + 40, tw = B.w - w - 40;
    var head = Math.round(30 * c.sc);
    return slideMain(c, 0, px(B.x, B.y, w, B.h), n) + slideCtl(c, n, "left:" + (B.x + 20) + "px;top:" + (B.y + B.h - 44) + "px;color:#fff") +
      '<div style="position:absolute;' + px(tx, B.y, tw, B.h) + ';display:flex;flex-direction:column;gap:22px;text-align:' + c.al + '">' +
      (c.wire ? c.lines(["70%"], "", head * .7) : '<b style="font-size:' + head + 'px;font-weight:500;letter-spacing:-.03em;line-height:1.08">' + c.title(0) + '</b>') +
      c.para(ab[0], ab[1], "font-size:18px;opacity:.8;max-width:520px") + c.one(0, n, "position:static") + panel(c, Math.min(tw, 460)) + '</div>';
  } };
  L["text-led"] = { fam: "feed", ko: "글 위주", panel: true, need: function () { return 2; }, render: function (c, B) {
    var ab = ABOUT[(c.s.seed + 3) % ABOUT.length], fs = Math.round(26 * c.sc), w = Math.round(B.w * .62);
    var body = c.wire ? c.lines(["100%", "96%", "99%", "90%", "70%"], "", Math.round(fs * .6)) : '<p style="font-size:' + fs + 'px;line-height:1.18;letter-spacing:-.025em">' + c.t(ab[0], ab[1]) + '</p>';
    return '<div style="position:absolute;' + px(B.x, B.y, w, B.h) + ';display:flex;flex-direction:column;gap:30px;text-align:' + c.al + '">' + body + panel(c, 460) + '</div>' +
      c.img(0, px(B.x + w + 40, B.y, B.w - w - 40, (B.h - 40) * .58)) + c.img(1, px(B.x + w + 40 + (B.w - w - 40) * .35, B.y + (B.h - 40) * .58 + 20, (B.w - w - 40) * .65, (B.h - 40) * .42));
  } };
  L["diptych"] = { fam: "feed", ko: "두 장 나란히", need: function () { return 2; }, render: function (c, B) {
    var w = (B.w - 24) / 2, h = B.h - 60;
    return c.img(0, px(B.x, B.y, w, h)) + c.img(1, px(B.x + w + 24, B.y, w, h)) +
      c.one(0, 1, "left:" + B.x + "px;top:" + (B.y + h + 16) + "px") + c.one(1, 1, "left:" + (B.x + w + 24) + "px;top:" + (B.y + h + 16) + "px");
  } };
  L["feed-row"] = { fam: "feed", ko: "가로로 흐르는 사진", need: function () { return 4; }, render: function (c, B) {
    var h = B.h - 60, ws = [h * .75, h * 1.2, h * .8, h * .75], x = B.x, out = "";
    ws.forEach(function (w, i) { out += c.img(i, px(x, B.y, w, h)) + c.one(i, 1, "left:" + x + "px;top:" + (B.y + h + 16) + "px"); x += w + 20; });
    return out + '<div style="position:absolute;right:28px;top:' + (B.y + h + 16) + 'px;font-size:15px;opacity:.55">' + (c.ko ? "옆으로 넘겨 보기 →" : "Scroll sideways →") + '</div>';
  } };
  L["collage"] = { fam: "feed", ko: "자유 배치", need: function () { return 5; }, render: function (c, B) {
    var spots = [[0, .05, .27, .5], [.3, 0, .22, .36], [.56, .12, .3, .44], [.14, .6, .24, .38], [.72, .58, .26, .4]], out = "";
    spots.forEach(function (s, i) {
      var x = B.x + s[0] * B.w, y = B.y + s[1] * B.h, w = s[2] * B.w, h = s[3] * B.h;
      out += c.img(i, px(x, y, w, h * .88)) + c.one(i, 1, "left:" + x + "px;top:" + (y + h * .88 + 8) + "px;font-size:14px");
    });
    return out;
  } };
  L["name-big"] = { fam: "feed", ko: "큰 이름과 사진", panel: true, need: function () { return 1; }, render: function (c, B) {
    var fs = Math.round(90 * Math.min(c.sc, 2.1)), ab = ABOUT[(c.s.seed + 5) % ABOUT.length], top = B.y + fs * 1.1 + 20;
    return '<h3 class="big" style="left:' + (B.x - 4) + 'px;right:' + (1440 - B.x - B.w) + 'px;top:' + B.y + 'px;font-size:' + fs + 'px;text-align:' + c.al + '">' + c.N + '</h3>' +
      '<div style="position:absolute;' + px(B.x, top, B.w * .4, B.y + B.h - top) + ';display:flex;flex-direction:column;gap:24px">' + c.para(ab[0], ab[1], "font-size:18px") + panel(c, B.w * .4) + '</div>' +
      c.img(0, px(B.x + B.w * .45, top, B.w * .55, B.y + B.h - top));
  } };

  /* slideshows: the picture changes, the page stays */
  L["slide-frame"] = { fam: "slide", ko: "액자형 슬라이드쇼", slide: true, modes: ["click", "arrows", "auto", "dots"], need: function () { return 8; }, render: function (c, B) {
    var w = B.w * .56, h = B.h - 90, x = B.x + (B.w - w) / 2;
    return slideMain(c, 0, px(x, B.y, w, h), 8) + c.one(0, 8, "left:" + B.x + "px;right:" + (1440 - B.x - B.w) + "px;top:" + (B.y + h + 22) + "px;text-align:center") +
      (c.f["slides-arrows"] ? '<button type="button" class="lv-btn" data-sg="-1" style="position:absolute;left:' + (B.x + 30) + 'px;top:' + (B.y + h / 2 - 20) + 'px;font-size:34px;opacity:.5">←</button><button type="button" class="lv-btn" data-sg="1" style="position:absolute;left:' + (B.x + B.w - 60) + 'px;top:' + (B.y + h / 2 - 20) + 'px;font-size:34px;opacity:.5">→</button>' : slideCtl(c, 8, "left:" + (B.x + B.w - 240) + "px;top:" + (B.y + h + 22) + "px"));
  } };
  L["slide-bleed"] = { fam: "slide", ko: "화면 가득 슬라이드쇼", slide: true, bleed: true, modes: ["click", "auto", "dots", "arrows"], need: function () { return 8; }, render: function (c) {
    var low = c.s.nav === "bottom" || c.s.nav === "corners" ? 70 : 28;
    return slideMain(c, 0, "inset:0", 8) + '<div style="position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.3),transparent 20%,transparent 72%,rgba(0,0,0,.42));pointer-events:none"></div>' +
      '<div style="color:#fff">' + c.one(0, 8, "left:28px;bottom:" + low + "px;font-size:20px") + slideCtl(c, 8, "right:28px;bottom:" + (low + 2) + "px") + '</div>';
  } };
  L["slide-thumbs"] = { fam: "slide", ko: "썸네일 슬라이드쇼", slide: true, modes: ["thumbs"], need: function () { return 9; }, render: function (c, B) {
    var h = B.h - 150, tw = (Math.min(B.w, 1100) - 7 * 10) / 8, tx = B.x + (B.w - Math.min(B.w, 1100)) / 2, out = slideMain(c, 0, px(B.x + B.w * .15, B.y, B.w * .7, h), 9);
    for (var k = 1; k < 9; k++) out += c.img(k, px(tx + (k - 1) * (tw + 10), B.y + h + 40, tw, tw * .7) + ";cursor:pointer;opacity:.6", 'data-st="' + k + '"');
    return out + c.one(0, 9, "left:" + (B.x + B.w * .15) + "px;top:" + (B.y + h + 10) + "px;font-size:14px");
  } };
  L["index-list"] = { fam: "slide", ko: "색인 목록과 사진", slide: true, modes: ["list"], need: function () { return 10; }, render: function (c, B) {
    var fs = Math.round(18 * Math.min(c.sc, 1.9)), w = B.w * .42, rows = "";
    for (var k = 0; k < 10; k++) rows += '<div data-sl="' + k + '" style="display:grid;grid-template-columns:52px 1fr auto;gap:10px;padding:5px 0;border-bottom:1px solid color-mix(in srgb,currentColor 14%,transparent);' + (k ? "opacity:.35" : "") + '">' +
      '<span class="m" style="font-size:14px">' + pad2(k + 1) + '</span>' + (c.wire ? c.lines([(40 + k * 7 % 40) + "%"], "align-self:center", 10) : '<span>' + c.title(k) + '</span>') + '<span class="m" style="font-size:14px;opacity:.6">' + c.year(k) + '</span></div>';
    return '<div style="position:absolute;' + px(B.x, B.y, w, B.h) + ';font-size:' + fs + 'px;line-height:1.25;overflow:hidden">' + rows + '</div>' + slideMain(c, 0, px(B.x + w + 40, B.y, B.w - w - 40, B.h), 10);
  } };
  L["slide-side"] = { fam: "slide", ko: "사진과 설명 칸", slide: true, panel: true, modes: ["click", "arrows", "auto", "dots"], need: function () { return 8; }, render: function (c, B) {
    var w = B.w * .66, tx = B.x + w + 36, tw = B.w - w - 36, ab = ABOUT[(c.s.seed + 1) % ABOUT.length];
    return slideMain(c, 0, px(B.x, B.y, w, B.h), 8) + '<div style="position:absolute;' + px(tx, B.y, tw, B.h) + ';display:flex;flex-direction:column;gap:20px;text-align:' + c.al + '">' +
      c.one(0, 8, "position:static;font-size:" + Math.round(18 * Math.min(c.sc, 1.6)) + "px") + c.para(ab[0], ab[1], "font-size:16px;opacity:.75") + panel(c, tw) + '</div>' + slideCtl(c, 8, "left:" + tx + "px;top:" + (B.y + B.h - 40) + "px");
  } };
  L["slide-film"] = { fam: "slide", ko: "양옆이 보이는 슬라이드쇼", slide: true, modes: ["click", "arrows", "auto", "dots"], need: function () { return 8; }, render: function (c, B) {
    var w = B.w * .5, h = B.h - 80, x = B.x + (B.w - w) / 2, side = (B.w - w) / 2 - 30;
    return c.img(7, px(B.x - side * .4, B.y + 50, side, h - 100) + ";opacity:.4", 'data-sprev') + c.img(1, px(x + w + 30, B.y + 50, side + side * .4, h - 100) + ";opacity:.4", 'data-snext') +
      slideMain(c, 0, px(x, B.y, w, h), 8) + c.one(0, 8, "left:" + x + "px;top:" + (B.y + h + 20) + "px") + slideCtl(c, 8, "left:" + (x + w - 200) + "px;top:" + (B.y + h + 16) + "px");
  } };

  /* ---------- populated: whole sites with real content, one kind of site each ---------- */
  var P = {};
  function pHead(c, B, en, ko, sub) {
    var fs = Math.round(40 * Math.min(c.sc, 2));
    return '<div style="position:absolute;left:' + B.x + 'px;top:' + B.y + 'px;width:' + B.w + 'px;display:flex;justify-content:space-between;align-items:baseline;gap:30px">' +
      (c.wire ? c.lines(["420px"], "", fs * .6) : '<b style="font-size:' + fs + 'px;font-weight:600;letter-spacing:-.035em;line-height:1">' + c.t(en, ko) + '</b>') + '<span style="font-size:15px;opacity:.6">' + (sub || "") + '</span></div>';
  }
  P["shop"] = { ko: "상점", feats: ["products"], need: function () { return 8; }, render: function (c, B) {
    var top = Math.round(40 * Math.min(c.sc, 2)) + 30, bar = toolbar(c, catsOf(c, 8)), items = "";
    for (var k = 0; k < 8; k++) items += c.fig(k, "4 / 5", k);
    return pHead(c, B, "New objects", "새로 들어온 물건", c.ko ? "무료 배송 · 7일 안 교환" : "Free shipping · 7-day exchange") +
      '<div style="position:absolute;' + px(B.x, B.y + top, B.w, B.h - top) + '">' + bar + '<div class="gg cap-below" style="position:relative;gap:26px 16px;grid-template-columns:repeat(4,1fr)">' + items + '</div></div>';
  } };
  P["journal"] = { ko: "읽을거리", need: function () { return 6; }, render: function (c, B) {
    var w = B.w * .5, out = c.img(0, px(B.x, B.y, w, B.h * .72)), fs = Math.round(34 * Math.min(c.sc, 2));
    out += '<div style="position:absolute;' + px(B.x, B.y + B.h * .72 + 16, w, 200) + ';display:grid;gap:8px"><span class="m" style="font-size:13px;opacity:.6">' + (c.ko ? "이번 호" : "This issue") + ' · No. ' + (12 + c.s.seed % 30) + '</span>' +
      (c.wire ? c.lines(["80%"], "", 20) : '<b style="font-size:' + fs + 'px;font-weight:500;letter-spacing:-.03em;line-height:1.05">' + c.t(TITLES[c.s.seed % TITLES.length], TITLES_KO[c.s.seed % TITLES.length]) + '</b>') + '</div>';
    var list = "";
    for (var k = 1; k < 6; k++) list += '<div data-cat="' + c.P[k].g + '" style="display:grid;grid-template-columns:150px 1fr;gap:18px;padding:12px 0;border-top:1px solid color-mix(in srgb,currentColor 20%,transparent)">' + c.img(k, "position:relative;height:100px") +
      '<div style="display:grid;gap:6px;align-content:start"><span class="m" style="font-size:12px;opacity:.55">' + MONTHS[(k * 3 + c.s.seed) % 12] + ' ' + (k * 4 + 2) + ', 2026</span>' + (c.wire ? c.lines(["90%", "60%"]) : '<b style="font-weight:500;font-size:19px">' + c.title(k) + '</b><span style="font-size:14px;opacity:.65">' + c.t("Notes from the studio, with pictures and a short reading list.", "작업실에서 쓴 메모와 사진, 짧은 읽을거리.") + '</span>') + '</div></div>';
    return out + '<div style="position:absolute;' + px(B.x + w + 36, B.y, B.w - w - 36, B.h) + ';overflow:hidden">' + toolbar(c, catsOf(c, 6)) + list + '</div>';
  } };
  P["band"] = { ko: "음악가", feats: ["audio"], need: function () { return 1; }, render: function (c, B) {
    var w = B.w * .46, fs = Math.round(64 * Math.min(c.sc, 2));
    var dates = [0, 1, 2, 3].map(function (k) { return '<div style="display:grid;grid-template-columns:90px 1fr auto;gap:12px;padding:7px 0;border-top:1px solid color-mix(in srgb,currentColor 20%,transparent)"><span class="m">' + MONTHS[(c.s.seed + k * 2) % 12] + ' ' + pad2(3 + k * 6) + '</span><span>' + c.t(CITIES[(c.s.seed + k) % 10], CITIES_KO[(c.s.seed + k) % 10]) + '</span><button type="button" class="lv-a" data-add="t' + k + '">' + (k === 1 ? (c.ko ? "매진" : "Sold out") : (c.ko ? "예매" : "Tickets")) + '</button></div>'; }).join("");
    return c.img(0, px(B.x, B.y, w, B.h)) + '<div style="position:absolute;' + px(B.x + w + 40, B.y, B.w - w - 40, B.h) + ';display:flex;flex-direction:column;gap:26px">' +
      (c.wire ? c.lines(["70%"], "", fs * .5) : '<b style="font-size:' + fs + 'px;font-weight:700;letter-spacing:-.045em;line-height:.95">' + TRACKS[c.s.seed % TRACKS.length] + '</b>') +
      panel(c, B.w - w - 40) + '<div style="font-size:16px">' + dates + '</div></div>';
  } };
  P["cafe"] = { ko: "식당·카페", feats: ["hours"], need: function () { return 3; }, render: function (c, B) {
    var menu = c.ko ? [["오늘의 수프", "9,000"], ["구운 채소와 곡물", "14,000"], ["제철 과일 타르트", "7,500"], ["보리차 한 주전자", "5,000"], ["드립 커피", "6,000"]] : [["Soup of the day", "9,000"], ["Roast vegetables, grains", "14,000"], ["Seasonal fruit tart", "7,500"], ["A pot of barley tea", "5,000"], ["Filter coffee", "6,000"]];
    var w = B.w * .36;
    return '<div style="position:absolute;' + px(B.x, B.y, w, B.h) + ';display:flex;flex-direction:column;gap:18px;font-size:18px"><b style="font-size:' + Math.round(34 * Math.min(c.sc, 2)) + 'px;font-weight:500;letter-spacing:-.03em">' + c.t("Today", "오늘의 메뉴") + '</b>' +
      menu.map(function (m) { return '<div style="display:flex;justify-content:space-between;border-bottom:1px dotted">' + (c.wire ? c.lines(["200px"], "", 10) : '<span>' + m[0] + '</span>') + '<span class="m">' + m[1] + '</span></div>'; }).join("") + panel(c, w) + '</div>' +
      c.img(0, px(B.x + w + 40, B.y, (B.w - w - 40) * .58, B.h)) + c.img(1, px(B.x + w + 40 + (B.w - w - 40) * .58 + 16, B.y, (B.w - w - 40) * .42 - 16, B.h * .48)) + c.img(2, px(B.x + w + 40 + (B.w - w - 40) * .58 + 16, B.y + B.h * .48 + 16, (B.w - w - 40) * .42 - 16, B.h * .52 - 16));
  } };
  P["studio"] = { ko: "건축·공간 스튜디오", feats: ["slides-list"], need: function () { return 6; }, render: function (c, B) {
    var rows = "", w = B.w * .5;
    for (var k = 0; k < 6; k++) rows += '<div data-sl="' + k + '" style="display:grid;grid-template-columns:1fr 130px 70px;padding:8px 0;border-bottom:1px solid color-mix(in srgb,currentColor 18%,transparent);' + (k ? "opacity:.4" : "") + '">' + (c.wire ? c.lines(["60%"], "", 11) : '<span>' + c.title(k) + '</span>') + '<span>' + c.t(CITIES[(k + c.s.seed) % 10], CITIES_KO[(k + c.s.seed) % 10]) + '</span><span class="m" style="text-align:right">' + c.year(k) + '</span></div>';
    return '<div style="position:absolute;' + px(B.x, B.y, w - 30, B.h) + ';font-size:' + Math.round(19 * Math.min(c.sc, 1.6)) + 'px;display:flex;flex-direction:column;gap:30px"><div>' + rows + '</div>' + panel(c, w - 30) + '</div>' + slideMain(c, 0, px(B.x + w, B.y, B.w - w, B.h), 6);
  } };
  P["publisher"] = { ko: "출판사·서점", feats: ["products"], need: function () { return 6; }, render: function (c, B) {
    var items = "";
    for (var k = 0; k < 6; k++) items += c.fig(k, "2 / 3", k);
    return pHead(c, B, "Books", "책", c.ko ? "작은 출판사 · 2019년부터" : "A small press since 2019") + '<div class="gg cap-below" style="position:absolute;' + px(B.x, B.y + 80, B.w, B.h - 80) + ';gap:26px 22px;grid-template-columns:repeat(6,1fr)">' + items + '</div>';
  } };
  P["event"] = { ko: "행사·축제", feats: ["accordion", "countdown"], need: function () { return 3; }, render: function (c, B) {
    var fs = Math.round(80 * Math.min(c.sc, 2)), m = 10 + c.s.seed % 3;
    var prog = [0, 1, 2, 3, 4].map(function (k) { return '<div data-acc style="border-top:1px solid;padding:8px 0"><div style="display:grid;grid-template-columns:80px 1fr auto"><span class="m">' + pad2(10 + k * 2) + ':00</span><span>' + (c.wire ? c.lines(["50%"], "", 10) : c.title(k)) + '</span><span data-acc-i>+</span></div><div class="acc-more" style="font-size:14px;opacity:.7;padding-left:80px">' + c.t("Talk and walk-through with the makers, 40 minutes.", "만든 사람과 함께 둘러보는 40분.") + '</div></div>'; }).join("");
    return '<div style="position:absolute;' + px(B.x, B.y, B.w * .55, B.h) + '">' + (c.wire ? c.lines(["80%", "60%"], "", fs * .5) : '<b style="display:block;font-size:' + fs + 'px;font-weight:700;letter-spacing:-.05em;line-height:.92">' + c.t("Open House", "오픈 하우스") + '<br>' + MONTHS[m - 1] + ' ' + (4 + c.s.seed % 20) + '–' + (6 + c.s.seed % 20) + '</b>') +
      '<div style="margin-top:36px;font-size:17px">' + prog + '</div></div>' + c.img(0, px(B.x + B.w * .6, B.y, B.w * .4, B.h * .62)) + c.img(1, px(B.x + B.w * .6, B.y + B.h * .62 + 16, B.w * .19, B.h * .38 - 16)) + c.img(2, px(B.x + B.w * .81, B.y + B.h * .62 + 16, B.w * .19, B.h * .38 - 16));
  } };
  P["cv"] = { ko: "이력 중심", feats: ["slides-list"], need: function () { return 4; }, render: function (c, B) {
    var ab = ABOUT[c.s.seed % ABOUT.length], rows = "";
    for (var k = 0; k < 7; k++) rows += '<div data-sl="' + (k % 4) + '" style="display:grid;grid-template-columns:70px 1fr;gap:12px;padding:6px 0;border-top:1px solid color-mix(in srgb,currentColor 16%,transparent)"><span class="m" style="opacity:.6">' + (2026 - k) + '</span>' + (c.wire ? c.lines([(50 + k * 9 % 40) + "%"], "", 10) : '<span>' + c.t((k % 3 ? "Group show, " : "Solo show, ") + TITLES[(k + c.s.seed) % TITLES.length] + ", " + CITIES[(k + c.s.seed) % 10], (k % 3 ? "단체전 「" : "개인전 「") + TITLES_KO[(k + c.s.seed) % TITLES.length] + "」, " + CITIES_KO[(k + c.s.seed) % 10]) + '</span>') + '</div>';
    var w = B.w * .34;
    return '<div style="position:absolute;' + px(B.x, B.y, w, B.h) + ';display:flex;flex-direction:column;gap:22px">' + c.para(ab[0], ab[1], "font-size:19px") + panel(c, w) + '</div>' +
      '<div style="position:absolute;' + px(B.x + w + 40, B.y, B.w * .3, B.h) + ';font-size:16px">' + rows + '</div>' + slideMain(c, 0, px(B.x + w + 40 + B.w * .3 + 30, B.y, B.w - w - B.w * .3 - 70, B.h * .7), 4);
  } };
  P["class"] = { ko: "수업·워크숍", feats: ["form"], need: function () { return 3; }, render: function (c, B) {
    var w = B.w * .3, cards = "";
    for (var k = 0; k < 3; k++) cards += '<div style="display:grid;gap:10px;align-content:start">' + c.img(k, "position:relative;height:" + Math.round(B.h * .45) + "px") +
      '<span class="m" style="font-size:13px;opacity:.6">' + MONTHS[(c.s.seed + k) % 12] + ' ' + (5 + k * 7) + ' · 6 ' + (c.ko ? "명" : "seats") + '</span>' + (c.wire ? c.lines(["70%"], "", 12) : '<b style="font-weight:500;font-size:20px">' + c.title(k) + '</b>') + '<span style="font-size:15px">' + PRICES[(k + c.s.seed) % 12] + '</span></div>';
    return '<div class="gg" style="' + px(B.x, B.y, B.w - w - 40, B.h) + ';grid-template-columns:repeat(3,1fr);gap:18px">' + cards + '</div><div style="position:absolute;' + px(B.x + B.w - w, B.y, w, B.h) + '">' + panel(c, w) + '</div>';
  } };
  P["photo"] = { ko: "사진가 연작", feats: ["slides-thumbs"], need: function () { return 7; }, render: function (c, B) {
    var fs = Math.round(24 * Math.min(c.sc, 2)), h = B.h * .62, out = slideMain(c, 0, px(B.x, B.y, B.w * .62, h), 7);
    out += '<div style="position:absolute;' + px(B.x + B.w * .62 + 30, B.y, B.w * .38 - 30, h) + ';display:flex;flex-direction:column;justify-content:space-between">' + (c.wire ? c.lines(["90%", "70%"], "", 18) : '<b style="font-size:' + fs + 'px;font-weight:500;letter-spacing:-.02em">' + c.t(TITLES[(c.s.seed + 2) % TITLES.length] + ", " + (2020 + c.s.seed % 6) + "–2026", TITLES_KO[(c.s.seed + 2) % TITLES.length] + ", " + (2020 + c.s.seed % 6) + "–2026") + '</b>') + c.one(0, 7, "position:static") + '</div>';
    for (var k = 1; k < 7; k++) out += c.img(k, px(B.x + (k - 1) * (B.w + 12) / 6, B.y + h + 24, (B.w + 12) / 6 - 12, B.h - h - 24) + ";opacity:.85;cursor:pointer", 'data-st="' + k + '"');
    return out;
  } };
  P["gallery"] = { ko: "전시 공간", need: function () { return 4; }, render: function (c, B) {
    var fs = Math.round(56 * Math.min(c.sc, 2)), now = c.wire ? c.lines(["80%", "50%"], "", 24) : '<span class="m" style="font-size:13px;opacity:.6">' + c.t("Now showing", "지금 전시") + '</span><b style="display:block;font-size:' + fs + 'px;font-weight:600;letter-spacing:-.04em;line-height:1">' + c.title(0) + '</b><span>' + PEOPLE[c.s.seed % PEOPLE.length] + '</span>';
    var next = [1, 2, 3].map(function (k) { return '<div style="display:grid;gap:8px">' + c.img(k, "position:relative;height:190px") + '<span style="font-size:15px">' + c.title(k) + '</span><span class="m" style="font-size:13px;opacity:.6">' + MONTHS[(c.s.seed + k * 2) % 12] + ' 2026</span></div>'; }).join("");
    return c.img(0, px(B.x, B.y, B.w * .6, B.h * .66)) + '<div style="position:absolute;' + px(B.x + B.w * .6 + 36, B.y, B.w * .4 - 36, B.h * .66) + ';display:flex;flex-direction:column;gap:14px">' + now + panel(c, B.w * .4 - 36) + '</div>' +
      '<div class="gg" style="' + px(B.x, B.y + B.h * .66 + 26, B.w, B.h * .34) + ';grid-template-columns:repeat(3,1fr);gap:20px">' + next + '</div>';
  } };
  Object.keys(P).forEach(function (k) { var p = P[k]; L["p-" + k] = { fam: "populated", ko: p.ko, panel: true, grid: k === "shop" || k === "journal", need: p.need, render: p.render, req: p.feats || [] }; });

  /* ---------- graphic: type-led pages. English carries the page, Korean sits under it ---------- */
  var GPAL = [["#1f3fd1", "#eef1ff"], ["#f0462e", "#fff6ea"], ["#ffe14d", "#111"], ["#153f2a", "#ffb3cf"], ["#0c0c0c", "#ff6fae"], ["#6c4d8c", "#ece7f2"], ["#cfeee0", "#12352a"], ["#f4f2ec", "#1f3fd1"],
    ["#101a3a", "#f3ede5"], ["#aecbf2", "#111"], ["#ff8a00", "#1a1a1a"], ["#e8e1ff", "#2b1bb3"], ["#ffffff", "#e0301e"], ["#2437ff", "#d7dcff"], ["#d9ccf2", "#1b1330"], ["#39402a", "#efe8d2"],
    ["#f2ecd2", "#1a1a14"], ["#141c33", "#f2ead8"], ["#00a86b", "#ffffff"], ["#fcfcfc", "#111111"], ["#ffd6e0", "#8a0f2a"], ["#111111", "#c8ff3d"], ["#e9e4dc", "#b8231a"], ["#0a5cff", "#ffffff"]];
  var WORDS = [["Objects", "사물"], ["Spaces", "공간"], ["Books", "책"], ["Images", "이미지"], ["Sound", "소리"], ["Type", "글자"], ["Film", "영상"], ["Print", "인쇄"], ["Light", "빛"], ["Water", "물"], ["Paper", "종이"], ["Clay", "흙"]];
  var G = {};
  function sub(c, t, style) { return '<span class="ko" style="display:block;font-size:17px;opacity:.7;letter-spacing:-.02em;' + (style || "") + '">' + t + '</span>'; }
  function gtitle(c) { var i = c.s.seed % TITLES.length; return [TITLES[i], TITLES_KO[i]]; }
  G["giant"] = { ko: "화면 가득 이름", panel: true, need: function () { return 0; }, render: function (c, B) {
    var fs = Math.round(Math.min(330, 1384 / Math.max(4, String(c.env.plain).length) * 1.55) * Math.min(1, c.sc / 1.4 + .35)), t = gtitle(c);
    return '<div class="big" style="left:' + (B.x - 6) + 'px;right:' + (1440 - B.x - B.w) + 'px;top:' + B.y + 'px;font-size:' + fs + 'px;text-align:' + c.al + ';font-weight:800">' + c.N + '</div>' +
      '<div style="position:absolute;left:' + B.x + 'px;bottom:' + (1440 * 0 + 900 - B.y - B.h) + 'px;width:560px;display:grid;gap:10px;font-size:20px"><b style="font-weight:500">' + t[0] + '</b>' + sub(c, t[1]) + '</div>' +
      '<div style="position:absolute;right:' + (1440 - B.x - B.w) + 'px;bottom:' + (900 - B.y - B.h) + 'px">' + panel(c, 420) + '</div>';
  } };
  G["stack"] = { ko: "쌓인 대문자 단어", need: function () { return 1; }, render: function (c, B) {
    var ws = shuffled(c.r, WORDS).slice(0, 5), fs = Math.round(Math.min(150, (B.h - 40) / 5 / .92) * Math.min(1, .55 + c.sc / 4));
    return '<div style="position:absolute;left:' + B.x + 'px;top:' + B.y + 'px;width:' + (B.w * .66) + 'px;font-weight:800;font-size:' + fs + 'px;line-height:.92;letter-spacing:-.04em;text-transform:uppercase;text-align:' + c.al + '">' +
      ws.map(function (w, i) { return '<div data-sl="' + i + '" style="' + (i ? "opacity:.28" : "") + '">' + w[0] + '<span class="ko" style="font-size:18px;letter-spacing:0;font-weight:500;margin-left:14px;vertical-align:.9em">' + w[1] + '</span></div>'; }).join("") + '</div>' +
      c.img(0, px(B.x + B.w * .7, B.y, B.w * .3, B.h * .7)) + '<div style="position:absolute;left:' + (B.x + B.w * .7) + 'px;top:' + (B.y + B.h * .7 + 14) + 'px;font-size:15px">' + c.title(0) + '</div>';
  } };
  G["repeat"] = { ko: "반복 줄", need: function () { return 0; }, render: function (c, B) {
    var fs = Math.round(96 * Math.min(1.3, .6 + c.sc / 3)), n = Math.floor(B.h / (fs * .95)), out = "", word = c.env.plain + " — ";
    for (var i = 0; i < n; i++) out += '<div style="white-space:nowrap;' + (i % 2 ? "color:transparent;-webkit-text-stroke:1.5px var(--t-ink)" : "") + ';margin-left:' + (-((i * 137) % 400)) + 'px">' + word + word + word + word + '</div>';
    return '<div style="position:absolute;' + px(0, B.y, 1440, B.h) + ';overflow:hidden;font-weight:800;font-size:' + fs + 'px;line-height:.95;letter-spacing:-.04em">' + out + '</div>';
  } };
  G["bands"] = { ko: "색 띠 문장", need: function () { return 0; }, render: function (c, B) {
    var cols = [["#111", "#fff"], ["#f0462e", "#fff"], ["#ffe14d", "#111"], ["#1f3fd1", "#fff"], ["#fff", "#111"], ["#00a86b", "#fff"]], t = shuffled(c.r, WORDS), n = 5, h = B.h / n;
    return '<div style="position:absolute;' + px(0, B.y, 1440, B.h) + '">' + cols.slice(0, n).map(function (k, i) { return '<div data-sl="' + i + '" style="background:' + k[0] + ';color:' + k[1] + ';height:' + h + 'px;line-height:' + h + 'px;padding-left:' + (28 + i * 90) + 'px;font-size:' + Math.round(h * .78) + 'px;font-weight:700;letter-spacing:-.05em;white-space:nowrap;overflow:hidden">' + t[i][0] + ' <span class="ko" style="font-size:20px;letter-spacing:0;vertical-align:.5em">' + t[i][1] + '</span></div>'; }).join("") + '</div>';
  } };
  G["cover"] = { ko: "책 표지 · 사진 반반", panel: true, need: function () { return 1; }, render: function (c, B) {
    var t = gtitle(c), fs = Math.round(80 * Math.min(c.sc, 1.9));
    return c.img(0, px(B.x + B.w / 2, B.y, B.w / 2, B.h)) + '<div style="position:absolute;' + px(B.x, B.y, B.w / 2 - 40, B.h) + ';display:flex;flex-direction:column;justify-content:space-between;text-align:' + c.al + '">' +
      '<div><div style="font-size:' + fs + 'px;font-weight:700;line-height:.95;letter-spacing:-.045em">' + t[0] + '</div>' + sub(c, t[1], "margin-top:14px") + '</div>' + panel(c, 440) +
      '<div style="display:flex;justify-content:space-between;font-size:16px;border-top:2px solid;padding-top:10px"><span>' + c.N + '</span><span class="m">No. ' + pad2(c.s.seed % 40 + 1) + '</span></div></div>';
  } };
  G["specimen"] = { ko: "서체 견본", need: function () { return 0; }, render: function (c, B) {
    var sizes = [20, 34, 56, 88];
    return '<div style="position:absolute;' + px(B.x, B.y, B.w, B.h) + ';display:grid;grid-template-columns:1.2fr 1fr;gap:40px">' +
      '<div style="font-size:' + Math.round(300 * Math.min(1.1, c.sc / 2 + .3)) + 'px;font-weight:600;line-height:.85;letter-spacing:-.04em">Aa<br><span style="font-size:.35em;letter-spacing:0">가나</span></div>' +
      '<div style="display:grid;gap:14px;align-content:start">' + sizes.map(function (s) { return '<div style="font-size:' + s + 'px;line-height:1.05;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;border-top:1px solid;padding-top:6px"><span class="m" style="font-size:12px;opacity:.55;display:block">' + s + ' pt</span>The quiet hour 조용한 시간</div>'; }).join("") +
      '<div class="m" style="font-size:15px;line-height:1.5;opacity:.75">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 !?&amp;@</div></div></div>';
  } };
  G["lineup"] = { ko: "공연 라인업", need: function () { return 0; }, render: function (c, B) {
    var names = shuffled(c.r, PEOPLE).slice(0, 6), m = MONTHS[(c.s.seed + 4) % 12], fs = Math.round(120 * Math.min(1.25, .55 + c.sc / 3));
    return '<div style="position:absolute;left:' + B.x + 'px;top:' + B.y + 'px;font-weight:800;font-size:' + fs + 'px;line-height:.9;letter-spacing:-.05em;text-transform:uppercase">Live<br>' + m + ' ' + (10 + c.s.seed % 18) + '</div>' +
      '<div style="position:absolute;right:' + (1440 - B.x - B.w) + 'px;top:' + B.y + 'px;width:560px;font-size:28px;font-weight:600">' + names.map(function (n, i) { return '<div data-sl="' + i + '" style="display:flex;justify-content:space-between;border-bottom:2px solid;padding:6px 0"><span class="m" style="font-size:18px">' + pad2(19 + Math.floor(i / 2)) + ':' + (i % 2 ? "30" : "00") + '</span><span>' + n + '</span></div>'; }).join("") + '</div>' +
      '<div style="position:absolute;left:' + B.x + 'px;bottom:' + (900 - B.y - B.h) + 'px;width:500px">' + panel(c, 460) + sub(c, CITIES_KO[c.s.seed % 10] + " · 저녁 7시부터", "margin-top:14px") + '</div>';
  } };
  G["calendar"] = { ko: "달력", need: function () { return 0; }, render: function (c, B) {
    var mi = (c.s.seed + 8) % 12, cells = "", ev = [3, 11, 17, 24];
    for (var d = 1; d <= 35; d++) { var on = ev.indexOf(d) >= 0; cells += '<div data-acc style="border-top:1px solid;padding:6px 8px;min-height:' + Math.round((B.h - 170) / 5) + 'px;' + (on ? "background:var(--t-ink);color:var(--t-bg)" : "") + '"><span class="m" style="font-size:14px">' + (d <= 31 ? d : "") + '</span>' + (on ? '<div style="font-size:15px;margin-top:6px">' + TITLES[(d + c.s.seed) % TITLES.length] + '</div><div class="acc-more" style="font-size:13px;opacity:.8">19:00 · ' + CITIES[d % 10] + '</div>' : "") + '</div>'; }
    return '<div style="position:absolute;left:' + B.x + 'px;top:' + B.y + 'px;font-size:' + Math.round(70 * Math.min(1.4, c.sc)) + 'px;font-weight:700;letter-spacing:-.04em;line-height:1">' + ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][mi] + '</div>' +
      '<div class="gg" style="' + px(B.x, B.y + 120, B.w, B.h - 120) + ';grid-template-columns:repeat(7,1fr);gap:0 8px">' + cells + '</div>';
  } };
  G["circle"] = { ko: "원형 글자", need: function () { return 1; }, render: function (c, B) {
    var r = Math.min(B.h, 760) / 2 - 10, cx = B.x + B.w / 2, cy = B.y + B.h / 2, word = (c.env.plain + " · ").repeat(4);
    return c.img(0, px(cx - r * .62, cy - r * .62, r * 1.24, r * 1.24) + ";border-radius:50%") +
      '<svg viewBox="-100 -100 200 200" style="position:absolute;' + px(cx - r, cy - r, r * 2, r * 2) + ';overflow:visible"><defs><path id="cp' + c.s.seed + '" d="M0,-86a86,86 0 1,1 -.1,0"/></defs><text font-size="15" font-weight="700" letter-spacing="2" fill="currentColor" style="text-transform:uppercase"><textPath href="#cp' + c.s.seed + '">' + word + '</textPath></text></svg>' +
      '<div style="position:absolute;left:' + B.x + 'px;bottom:' + (900 - B.y - B.h) + 'px;width:320px;font-size:16px">' + c.title(0) + sub(c, gtitle(c)[1]) + '</div>';
  } };
  G["vertical"] = { ko: "세로 제목", panel: true, need: function () { return 2; }, render: function (c, B) {
    var t = gtitle(c), fs = Math.round(130 * Math.min(1.2, .6 + c.sc / 3));
    return '<div style="position:absolute;left:' + B.x + 'px;top:' + B.y + 'px;height:' + B.h + 'px;writing-mode:vertical-rl;transform:rotate(180deg);font-size:' + fs + 'px;font-weight:800;line-height:.9;letter-spacing:-.04em;white-space:nowrap;overflow:hidden">' + t[0] + '</div>' +
      c.img(0, px(B.x + fs * 1.2, B.y, B.w * .36, B.h * .62)) + c.img(1, px(B.x + fs * 1.2 + B.w * .36 + 20, B.y + B.h * .2, B.w * .24, B.h * .42)) +
      '<div style="position:absolute;' + px(B.x + fs * 1.2, B.y + B.h * .62 + 24, B.w * .6, B.h * .38 - 24) + ';display:grid;grid-template-columns:1fr 1fr;gap:30px;font-size:16px"><div>' + c.para(ABOUT[c.s.seed % 8][0], ABOUT[c.s.seed % 8][1]) + sub(c, t[1], "margin-top:10px") + '</div>' + panel(c, 340) + '</div>';
  } };
  G["issue"] = { ko: "큰 번호 · 차례", panel: true, need: function () { return 1; }, render: function (c, B) {
    var n = pad2(c.s.seed % 60 + 1), fs = Math.round(420 * Math.min(1, .5 + c.sc / 5)), rows = "";
    for (var k = 0; k < 6; k++) rows += '<div data-sl="' + k + '" style="display:grid;grid-template-columns:40px 1fr auto;padding:6px 0;border-top:1px solid;' + (k ? "opacity:.4" : "") + '"><span class="m">' + pad2(k * 8 + 4) + '</span><span>' + TITLES[(k + c.s.seed) % TITLES.length] + '</span><span class="ko" style="opacity:.6">' + TITLES_KO[(k + c.s.seed) % TITLES.length] + '</span></div>';
    return '<div class="m" style="position:absolute;left:' + (B.x - 10) + 'px;top:' + (B.y - fs * .12) + 'px;font-size:' + fs + 'px;line-height:1;letter-spacing:-.06em">' + n + '</div>' +
      '<div style="position:absolute;' + px(B.x + B.w * .52, B.y, B.w * .48, B.h) + ';display:flex;flex-direction:column;gap:24px;font-size:18px"><b style="font-size:15px;font-weight:500">Contents 차례</b><div>' + rows + '</div>' + panel(c, B.w * .48) + '</div>' +
      c.img(0, px(B.x, B.y + B.h * .56, B.w * .46, B.h * .44));
  } };
  G["wordgrid"] = { ko: "단어 칸", need: function () { return 0; }, render: function (c, B) {
    var ws = shuffled(c.r, WORDS).slice(0, 9);
    return '<div class="gg" style="' + px(B.x, B.y, B.w, B.h) + ';grid-template-columns:repeat(3,1fr);gap:0">' + ws.map(function (w, i) { return '<div data-acc style="border-top:1.5px solid;' + (i % 3 ? "border-left:1.5px solid;" : "") + 'padding:14px 18px;height:' + Math.round(B.h / 3) + 'px;display:flex;flex-direction:column;justify-content:space-between"><span class="m" style="font-size:14px">' + pad2(i + 1) + '</span><div><div style="font-size:' + Math.round(54 * Math.min(1.3, .6 + c.sc / 3)) + 'px;font-weight:700;letter-spacing:-.04em;line-height:1">' + w[0] + '</div>' + sub(c, w[1]) + '<div class="acc-more" style="font-size:14px;opacity:.75;margin-top:6px">Projects, workshops and a reading list.</div></div></div>'; }).join("") + '</div>';
  } };
  G["manifesto"] = { ko: "선언문", panel: true, need: function () { return 0; }, render: function (c, B) {
    var ab = ABOUT[(c.s.seed + 2) % ABOUT.length], fs = Math.round(56 * Math.min(1.3, .55 + c.sc / 3)), words = ab[0].split(" ");
    var hl = words.map(function (w, i) { return i % 7 === 3 ? '<span style="background:var(--t-ink);color:var(--t-bg);padding:0 .12em">' + w + '</span>' : w; }).join(" ");
    return '<div style="position:absolute;' + px(B.x, B.y, B.w * .82, B.h) + ';font-size:' + fs + 'px;line-height:1.08;letter-spacing:-.03em;font-weight:500;text-align:' + c.al + '">' + hl + sub(c, ab[1], "margin-top:24px;font-size:20px") + '</div>' +
      '<div style="position:absolute;right:' + (1440 - B.x - B.w) + 'px;bottom:' + (900 - B.y - B.h) + 'px">' + panel(c, 380) + '</div>';
  } };
  G["table"] = { ko: "프로젝트 표", need: function () { return 0; }, render: function (c, B) {
    var head = ["No.", "Project", "Client", "Year"], rows = "";
    for (var k = 0; k < 9; k++) rows += '<tr><td class="m">' + pad2(k * 3 + 1) + '</td><td>' + TITLES[(k + c.s.seed) % TITLES.length] + '</td><td>' + ["Studio North", "A small press", "City library", "Private", "Harbour hall", "Riverside school"][(k + c.s.seed) % 6] + '</td><td class="m y">' + (2026 - (k * 5 + c.s.seed) % 9) + '</td></tr>';
    return '<div style="position:absolute;left:' + B.x + 'px;top:' + B.y + 'px;font-size:' + Math.round(64 * Math.min(1.3, .6 + c.sc / 3)) + 'px;font-weight:700;letter-spacing:-.04em;line-height:1">Index <span class="ko" style="font-size:22px;letter-spacing:0;font-weight:500">프로젝트 목록</span></div>' +
      '<table class="tbl" data-sorttable style="left:' + B.x + 'px;right:' + (1440 - B.x - B.w) + 'px;top:' + (B.y + 110) + 'px;font-size:22px"><thead><tr>' + head.map(function (h, i) { return '<th data-sort="' + i + '"' + (i === 3 ? ' class="y"' : "") + '>' + h + '</th>'; }).join("") + '</tr></thead><tbody>' + rows + '</tbody></table>';
  } };
  G["ticket"] = { ko: "입장권", need: function () { return 1; }, render: function (c, B) {
    var w = Math.min(1100, B.w), x = B.x + (B.w - w) / 2, h = Math.min(460, B.h - 60), y = B.y + (B.h - h) / 2, t = gtitle(c), m = MONTHS[(c.s.seed + 2) % 12];
    return '<div style="position:absolute;' + px(x, y, w, h) + ';border:2px solid;display:grid;grid-template-columns:1fr 1.6fr 260px">' + c.img(0, "position:relative") +
      '<div style="padding:26px;display:flex;flex-direction:column;justify-content:space-between;border-left:2px solid"><div style="font-size:' + Math.round(54 * Math.min(1.3, .6 + c.sc / 3)) + 'px;font-weight:700;line-height:.95;letter-spacing:-.04em">' + t[0] + '</div>' + sub(c, t[1]) + '<div class="m" style="font-size:16px">' + m + ' ' + (3 + c.s.seed % 25) + ' · 19:30 · ' + CITIES[c.s.seed % 10] + '</div></div>' +
      '<div style="padding:26px;border-left:2px dashed;display:flex;flex-direction:column;justify-content:space-between"><span class="m" style="font-size:14px">ADMIT ONE</span><span class="m" style="font-size:44px">' + String(1000 + c.s.seed * 37 % 9000) + '</span><button type="button" class="lv-a" data-add="t0" style="font-size:17px;text-align:left">' + (c.ko ? "표 담기 →" : "Get tickets →") + '</button></div></div>';
  } };
  G["tilted"] = { ko: "기울어진 띠", need: function () { return 1; }, render: function (c, B) {
    var t = gtitle(c), fs = Math.round(110 * Math.min(1.2, .55 + c.sc / 3));
    return c.img(0, px(B.x + B.w * .1, B.y + 20, B.w * .8, B.h - 40)) + '<div style="position:absolute;left:-60px;right:-60px;top:' + (B.y + B.h / 2 - fs * .6) + 'px;transform:rotate(-6deg);background:var(--t-bg);padding:10px 0;white-space:nowrap;overflow:hidden;font-size:' + fs + 'px;font-weight:800;letter-spacing:-.04em;line-height:1;text-align:center;text-transform:uppercase">' + t[0] + ' — ' + t[0] + '</div>' +
      '<div style="position:absolute;left:' + B.x + 'px;bottom:' + (900 - B.y - B.h) + 'px">' + sub(c, t[1]) + '</div>';
  } };
  G["shapes"] = { ko: "도형과 이름표", need: function () { return 0; }, render: function (c, B) {
    var sh = ['<circle cx="50" cy="50" r="44"/>', '<rect x="8" y="8" width="84" height="84"/>', '<path d="M50 6 94 90H6z"/>', '<path d="M6 50h88M50 6v88"/>', '<path d="M10 90 90 10M10 10l80 80"/>', '<path d="M50 6a44 44 0 0 1 0 88z"/>'], ws = shuffled(c.r, WORDS);
    return '<div class="gg" style="' + px(B.x, B.y, B.w, B.h) + ';grid-template-columns:repeat(3,1fr);gap:0">' + shuffled(c.r, sh).map(function (s, i) { return '<div data-acc style="border-top:1.5px solid;' + (i % 3 ? "border-left:1.5px solid;" : "") + 'padding:14px;display:grid;gap:8px;justify-items:center"><svg viewBox="0 0 100 100" style="width:' + Math.round(B.h / 2 - 90) + 'px;height:' + Math.round(B.h / 2 - 90) + 'px" fill="' + (i % 2 ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="5">' + s + '</svg><span style="font-size:16px">' + ws[i][0] + ' <span class="ko" style="opacity:.6">' + ws[i][1] + '</span></span><div class="acc-more" style="font-size:13px;opacity:.7">Form 0' + (i + 1) + '</div></div>'; }).join("") + '</div>';
  } };
  G["quote"] = { ko: "큰 따옴표 인용", panel: true, need: function () { return 1; }, render: function (c, B) {
    var ab = ABOUT[(c.s.seed + 6) % ABOUT.length], fs = Math.round(46 * Math.min(1.3, .6 + c.sc / 3));
    return '<div style="position:absolute;left:' + (B.x - 8) + 'px;top:' + (B.y - 60) + 'px;font-size:320px;font-weight:800;line-height:1">“</div>' +
      '<div style="position:absolute;' + px(B.x + 160, B.y + 40, B.w * .62, B.h) + ';font-size:' + fs + 'px;line-height:1.12;letter-spacing:-.03em">' + ab[0] + sub(c, ab[1], "margin-top:20px;font-size:19px") + '<div style="font-size:16px;margin-top:26px">— ' + c.N + '</div></div>' +
      c.img(0, px(B.x + B.w * .74, B.y, B.w * .26, B.h * .56)) + '<div style="position:absolute;left:' + (B.x + B.w * .74) + 'px;top:' + (B.y + B.h * .56 + 24) + 'px">' + panel(c, B.w * .26) + '</div>';
  } };
  Object.keys(G).forEach(function (k) { var g = G[k]; L["g-" + k] = { fam: "graphic", ko: g.ko, panel: !!g.panel, need: g.need, render: g.render }; });

  /* ---------- graduation show: the finished work, shown the way it is meant to be seen ---------- */
  var GR = {};
  var WORKS = [["Afternoon, Held", "오후를 붙잡다"], ["Weather Report", "일기예보"], ["Green Hour", "초록의 시간"], ["White Relief", "흰 부조"], ["Tide Table", "조석표"], ["Forty-Two Cups", "마흔두 개의 컵"],
    ["Vessel for One Flower", "꽃 한 송이를 위한 그릇"], ["Head, After", "그 후의 두상"], ["Night Garden", "밤의 정원"], ["Slow Fold", "느린 접힘"], ["Room for Two", "두 사람의 방"], ["Salt Line", "소금의 선"]];
  var MODELS = ["ceramic_vase_01", "ceramic_vase_02", "ceramic_vase_03", "ceramic_vase_04", "antique_ceramic_vase_01", "marble_bust_01", "concrete_cat_statue", "wooden_bowl_01", "mid_century_lounge_chair"];
  var ART_G = ["art", "obj"];
  function glabel(c, i, meta) {
    var w = WORKS[(c.s.seed + i) % WORKS.length];
    return '<div style="display:grid;gap:6px;font-size:16px;line-height:1.45"><b style="font-weight:600;font-size:' + Math.round(22 * Math.min(c.sc, 1.6)) + 'px;letter-spacing:-.02em">' + w[0] + '</b><span style="opacity:.65">' + (meta || MATS[(c.s.seed + i) % MATS.length][0] + ", 2026") + '</span><span class="ko" style="opacity:.55;font-size:15px">' + w[1] + '</span></div>';
  }
  /* the one big work on the page, shown with the graduation feature it carries */
  function hero(c, x, y, w, h) {
    var f = c.f, p = c.P[0], s = p ? c.src(p.f) : "";
    if (c.wire) return '<div class="wf" style="' + px(x, y, w, h) + '"></div>';
    if (f.rake) return '<div style="position:absolute;' + px(x, y, w, h) + ';background:#000"><canvas class="rake" data-img="' + p.f + '" width="' + Math.round(w) + '" height="' + Math.round(h) + '" style="width:100%;height:100%;display:block"></canvas></div>';
    if (f.model) { var m = MODELS[c.s.seed % MODELS.length]; return '<div style="position:absolute;' + px(x, y, w, h) + ';background:radial-gradient(ellipse at 50% 70%,color-mix(in srgb,var(--t-bg) 70%,#fff) 0,var(--t-bg) 70%)"></div><model-viewer src="assets/3d/' + m + '/' + m + '.gltf" ar ar-modes="webxr scene-viewer quick-look" camera-controls auto-rotate rotation-per-second="18deg" interaction-prompt="none" shadow-intensity="1" exposure="1.05" environment-image="neutral" style="position:absolute;' + px(x, y, w, h) + ';background:transparent;--poster-color:transparent"></model-viewer>'; }
    if (f.compare) return '<div class="ba" style="position:absolute;' + px(x, y, w, h) + ';overflow:hidden;cursor:ew-resize"><img src="' + s + '" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><div class="ba-top" style="position:absolute;inset:0;clip-path:inset(0 50% 0 0)"><img data-dup src="' + s + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(2.2) brightness(1.4)"></div><div class="ba-bar" style="position:absolute;top:0;bottom:0;left:50%;width:2px;background:#fff"><span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:#fff;color:#111;display:grid;place-items:center;font-size:18px">⇆</span></div></div>';
    if (f.loupe) return '<div class="lp" style="position:absolute;' + px(x, y, w, h) + ';overflow:hidden;cursor:none"><img src="' + s + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"><div class="lens" style="position:absolute;left:50%;top:50%;width:240px;height:240px;margin:-120px 0 0 -120px;border-radius:50%;border:3px solid #fff;box-shadow:0 10px 30px rgba(0,0,0,.4);background-image:url(' + s + ');background-size:400%;background-position:50% 50%;opacity:1;pointer-events:none;transition:opacity .2s"></div></div>';
    if (f.daylight) return '<div class="daylight" style="position:absolute;' + px(x, y, w, h) + ';overflow:hidden;background:linear-gradient(var(--ang,120deg),rgba(255,214,150,calc(var(--sun,.6)*.55)),rgba(40,50,90,calc((1 - var(--sun,.6))*.6))),#d9d4c9"><div style="position:absolute;' + px(w * .25, h * .14, w * .5, h * .68) + ';box-shadow:calc((var(--sun,.6) - .5)*60px) 30px 40px rgba(0,0,0,.35)"><img src="' + s + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div></div>';
    if (f.scale) { var pw = w * .42, phh = h * .72; return '<div class="sc-stage" style="position:absolute;' + px(x, y, w, h) + ';border-bottom:2px solid"><div style="position:absolute;left:' + (w * .18) + 'px;bottom:0;width:' + pw + 'px;height:' + phh + 'px;overflow:hidden;box-shadow:0 18px 30px -18px rgba(0,0,0,.5)"><img src="' + s + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div><div style="position:absolute;left:' + (w * .18) + 'px;bottom:' + (phh + 10) + 'px;width:' + pw + 'px;border-top:1.5px solid;text-align:center;font-family:var(--mono);font-size:14px;padding-top:4px">' + (90 + c.s.seed % 80) + ' cm</div><svg class="sc-person" viewBox="0 0 60 170" style="position:absolute;left:' + (w * .7) + 'px;bottom:0;height:' + (h * .8) + 'px;fill:currentColor"><circle cx="30" cy="14" r="11"/><path d="M16 32h28l6 58h-9l-3 80h-8l-2-58-2 58h-8l-3-80h-9z"/></svg></div>'; }
    return c.img(0, px(x, y, w, h));
  }
  function extras(c, w) {
    var f = c.f, ko = c.ko;
    if (f.scale) return '<button type="button" class="sc-toggle" style="justify-self:start;font:inherit;font-size:14px;padding:8px 14px;border:1px solid;border-radius:99px;background:none;color:inherit;cursor:pointer">Person on / off</button>';
    if (f.docent) {
      var t = ["I started with the smallest one on the shelf.", "Each is made to the width of my hand.", "The colour runs where it was hottest.", "I keep the cracked ones; they tell me the temperature."];
      return '<button type="button" class="dc-play" style="justify-self:start;font:inherit;font-size:15px;padding:10px 18px;border-radius:99px;border:0;background:var(--t-ink);color:var(--t-bg);cursor:pointer">▶ Play</button><div style="display:grid;gap:8px;font-size:19px;line-height:1.35">' + t.map(function (x, i) { return '<div class="dc-line" style="opacity:' + (i ? .3 : 1) + ';transition:opacity .4s">' + x + '</div>'; }).join("") + '</div>';
    }
    if (f.guestbook) return '<form class="gb-form" style="display:flex;gap:8px;width:' + Math.min(w, 420) + 'px"><input aria-label="메모" placeholder="Leave a note" style="flex:1;font:inherit;font-size:15px;padding:9px 12px;border:1px solid;background:transparent;color:inherit"><button style="font:inherit;font-size:14px;padding:9px 14px;border:0;background:var(--t-ink);color:var(--t-bg);cursor:pointer">Pin</button></form><div class="gb-wall" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:15px"><div class="gb-note" style="background:#fff3a6;color:#111;padding:12px;transform:rotate(-1.5deg)">Congratulations!</div><div class="gb-note" style="background:#cfe9ff;color:#111;padding:12px;transform:rotate(1deg)">좋은 전시 감사합니다</div></div>';
    if (f.daylight) return '<div class="daylight-t m" style="font-size:36px;letter-spacing:-.02em">0000/1440</div>';
    return panel(c, Math.min(w, 460));
  }
  function gradNavLabel(c) { return "Graduation Show 2026"; }
  GR["left"] = { ko: "작품 크게 · 설명 오른쪽", hero: true, need: function () { return 1; }, render: function (c, B) {
    var w = B.w * .63;
    return hero(c, B.x, B.y, w, B.h) + '<div style="position:absolute;' + px(B.x + w + 32, B.y, B.w - w - 32, B.h) + ';display:flex;flex-direction:column;gap:20px"><span class="m" style="font-size:13px;opacity:.6">' + gradNavLabel(c) + '</span>' + glabel(c, 0) +
      c.para("Finished work, shown the way it is meant to be seen.", "완성작을 원래 보여야 하는 방식으로 보여 줍니다.", "font-size:16px;opacity:.8") + extras(c, B.w - w - 32) + '<span style="margin-top:auto;font-size:14px;opacity:.55">' + PEOPLE[c.s.seed % PEOPLE.length] + ' · ' + ROLES[c.s.seed % ROLES.length][0] + ', BFA</span></div>';
  } };
  GR["right"] = { ko: "설명 왼쪽 · 작품 크게", hero: true, need: function () { return 1; }, render: function (c, B) {
    var w = B.w * .6, tw = B.w - w - 36;
    return '<div style="position:absolute;' + px(B.x, B.y, tw, B.h) + ';display:flex;flex-direction:column;gap:20px"><div style="font-size:' + Math.round(44 * Math.min(c.sc, 1.8)) + 'px;font-weight:700;letter-spacing:-.04em;line-height:1">' + gradNavLabel(c) + '</div>' + glabel(c, 0) + extras(c, tw) + '</div>' + hero(c, B.x + tw + 36, B.y, w, B.h);
  } };
  GR["band"] = { ko: "작품 가로 띠 · 아래 설명", hero: true, need: function () { return 1; }, render: function (c, B) {
    var h = B.h * .66;
    return hero(c, B.x, B.y, B.w, h) + '<div style="position:absolute;' + px(B.x, B.y + h + 24, B.w, B.h - h - 24) + ';display:grid;grid-template-columns:1fr 1fr 1fr;gap:30px">' + glabel(c, 0) +
      c.para("Move, drag or play — each piece has its own way of being looked at.", "움직이고, 끌고, 재생해 보세요. 작품마다 보는 방법이 다릅니다.", "font-size:16px;opacity:.8") + '<div style="display:grid;gap:12px;align-content:start">' + extras(c, B.w / 3) + '</div></div>';
  } };
  GR["students"] = { ko: "졸업생 그리드", grid: true, need: function () { return 8; }, render: function (c, B) {
    var bar = toolbar(c, catsOf(c, 8)), items = "";
    for (var k = 0; k < 8; k++) { var r = ROLES[(k + c.s.seed) % ROLES.length], p = c.P[k]; items += '<div class="gi" data-cat="' + (p ? p.g : "art") + '">' + (c.wire ? '<div class="wf in" style="--ar:4 / 5"></div>' : '<div class="fr" style="--ar:4 / 5"><img src="' + c.src(p.f) + '" alt="" loading="lazy"></div>') + '<span>' + PEOPLE[(k + c.s.seed) % PEOPLE.length] + '<i>' + r[0] + '</i></span></div>'; }
    return '<div style="position:absolute;' + px(B.x, B.y, B.w, B.h) + '"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px"><b style="font-size:' + Math.round(40 * Math.min(c.sc, 1.8)) + 'px;font-weight:700;letter-spacing:-.04em">Graduates <span class="ko" style="font-size:18px;font-weight:500;letter-spacing:0">졸업생</span></b><span style="font-size:15px;opacity:.6">42 · ' + ROLES.length + ' majors</span></div>' + bar +
      '<div class="gg cap-below" style="position:relative;grid-template-columns:repeat(4,1fr);gap:22px 16px">' + items + '</div></div>';
  } };
  GR["poster"] = { ko: "전시 포스터", panel: true, need: function () { return 1; }, render: function (c, B) {
    var fs = Math.round(150 * Math.min(1.2, .55 + c.sc / 3)), m = 5 + c.s.seed % 6;
    return '<div style="position:absolute;left:' + B.x + 'px;top:' + B.y + 'px;width:' + (B.w * .62) + 'px;font-size:' + fs + 'px;font-weight:800;letter-spacing:-.055em;line-height:.88;text-align:' + c.al + '">Degree<br>Show<br>2026</div>' +
      '<div style="position:absolute;' + px(B.x + B.w * .66, B.y, B.w * .34, B.h) + ';display:flex;flex-direction:column;gap:18px">' + c.img(0, "position:relative;height:" + Math.round(B.h * .5) + "px") +
      '<div style="font-size:18px">' + MONTHS[m - 1] + ' ' + (3 + c.s.seed % 10) + ' — ' + (12 + c.s.seed % 10) + ', 10:00–18:00<br><span class="ko" style="opacity:.6;font-size:16px">' + m + '월 · 본관 1–3층</span></div>' + panel(c, B.w * .34) + '</div>';
  } };
  GR["roster"] = { ko: "작가 명단 벽", need: function () { return 6; }, render: function (c, B) {
    var names = shuffled(c.r, PEOPLE).slice(0, 16), w = B.w * .6;
    return '<div data-roster style="position:absolute;left:' + B.x + 'px;top:' + B.y + 'px;width:' + w + 'px;columns:2;column-gap:36px;font-size:' + Math.round(26 * Math.min(1.5, c.sc)) + 'px;line-height:1.2;letter-spacing:-.03em">' +
      names.map(function (n, i) { var r = ROLES[(i + c.s.seed) % ROLES.length]; return '<div data-rf="' + (c.P[i % 6] ? c.P[i % 6].f : "") + '" data-role="' + r[0] + '" style="' + (i ? "opacity:.35" : "") + '">' + n + ' <span style="font-size:14px;opacity:.6;letter-spacing:0">' + r[0] + '</span></div>'; }).join("") + '</div>' +
      c.img(0, px(B.x + w + 40, B.y, B.w - w - 40, B.h * .66), "data-rimg") + '<div data-rlab style="position:absolute;' + px(B.x + w + 40, B.y + B.h * .66 + 20, B.w - w - 40, 120) + '">' + glabel(c, 0, names[0] + " · " + ROLES[c.s.seed % ROLES.length][0]) + '</div>';
  } };
  GR["plan"] = { ko: "전시장 평면도", need: function () { return 10; }, render: function (c, B) {
    var R = [["A", 30, 30, 400, 290], ["B", 450, 30, 300, 290], ["C", 770, 30, 380, 190], ["D", 770, 240, 380, 320], ["E", 30, 340, 720, 220]], sc = Math.min((B.w * .72) / 1180, (B.h - 30) / 590);
    var rooms = R.map(function (r, i) { var ro = ROLES[(i + c.s.seed) % ROLES.length]; return '<g class="room" data-room="' + i + '" data-role="' + ro[0] + '" data-ko="' + ro[1] + '" data-imgs="' + (c.P[i * 2] ? c.P[i * 2].f + "," + c.P[i * 2 + 1].f : "") + '"><rect x="' + r[1] + '" y="' + r[2] + '" width="' + r[3] + '" height="' + r[4] + '" fill="var(--t-bg)" stroke="currentColor" stroke-width="3"/><text x="' + (r[1] + 20) + '" y="' + (r[2] + 50) + '" font-size="42" font-weight="700" fill="currentColor">' + r[0] + '</text><text x="' + (r[1] + 20) + '" y="' + (r[2] + 84) + '" font-size="22" fill="currentColor">' + ro[0] + '</text></g>'; }).join("");
    return '<svg viewBox="0 0 1180 590" style="position:absolute;' + px(B.x, B.y, 1180 * sc, 590 * sc) + '" font-family="Inter,Pretendard Variable,sans-serif">' + rooms + '</svg>' +
      '<div style="position:absolute;' + px(B.x + B.w * .76, B.y, B.w * .24, B.h) + ';display:flex;flex-direction:column;gap:16px"><b style="font-size:26px;font-weight:600">Visit</b><span style="font-size:16px">Building 2, floors 1–3<br>10:00–18:00</span><span class="ko" style="opacity:.6;font-size:15px">방을 누르면 그 방의 작업이 열립니다.</span>' + panel(c, B.w * .24) + '</div>';
  } };
  GR["catalog"] = { ko: "작품 목록 표", need: function () { return 0; }, render: function (c, B) {
    var rows = "";
    for (var k = 0; k < 10; k++) { var w = WORKS[(k + c.s.seed) % WORKS.length], r = ROLES[(k * 3 + c.s.seed) % ROLES.length]; rows += '<tr><td class="m">' + pad2(k + 1) + '</td><td>' + w[0] + '</td><td>' + PEOPLE[(k * 5 + c.s.seed) % PEOPLE.length] + '</td><td>' + r[0] + '</td><td class="m y">' + ["A", "B", "C", "D", "E"][k % 5] + '</td></tr>'; }
    return '<div style="position:absolute;left:' + B.x + 'px;top:' + B.y + 'px;font-size:' + Math.round(44 * Math.min(c.sc, 1.7)) + 'px;font-weight:700;letter-spacing:-.04em">Works <span class="ko" style="font-size:18px;font-weight:500;letter-spacing:0">출품작 목록</span></div>' +
      '<table class="tbl" data-sorttable style="left:' + B.x + 'px;right:' + (1440 - B.x - B.w) + 'px;top:' + (B.y + 80) + 'px"><thead><tr><th data-sort="0">No.</th><th data-sort="1">Title</th><th data-sort="2">Artist</th><th data-sort="3">Major</th><th data-sort="4" class="y">Room</th></tr></thead><tbody>' + rows + '</tbody></table>';
  } };
  GR["trio"] = { ko: "작품 세 점 나란히", need: function () { return 3; }, render: function (c, B) {
    var w = (B.w - 40) / 3, h = B.h - 150, out = "";
    for (var k = 0; k < 3; k++) out += c.img(k, px(B.x + k * (w + 20), B.y, w, h)) + '<div style="position:absolute;' + px(B.x + k * (w + 20), B.y + h + 18, w, 130) + '">' + glabel(c, k) + '</div>';
    return out;
  } };
  GR["program"] = { ko: "행사 일정", need: function () { return 2; }, render: function (c, B) {
    var ev = [["Opening night", "개막 행사"], ["Artist talks", "작가와의 대화"], ["Portfolio review", "포트폴리오 리뷰"], ["Closing party", "폐막 파티"], ["Family morning", "가족과 함께"]];
    var rows = ev.map(function (e, i) { return '<div data-acc style="border-top:1.5px solid;padding:10px 0"><div style="display:grid;grid-template-columns:130px 1fr auto;font-size:22px"><span class="m" style="font-size:16px">' + MONTHS[(c.s.seed % 6) + 4] + ' ' + (4 + i * 2) + '</span><span>' + e[0] + ' <span class="ko" style="font-size:15px;opacity:.6">' + e[1] + '</span></span><span data-acc-i>+</span></div><div class="acc-more" style="font-size:15px;opacity:.7;padding-left:130px">18:00–20:00 · Room ' + "ABCDE"[i] + '</div></div>'; }).join("");
    return '<div style="position:absolute;' + px(B.x, B.y, B.w * .58, B.h) + '"><div style="font-size:' + Math.round(54 * Math.min(c.sc, 1.8)) + 'px;font-weight:700;letter-spacing:-.04em;margin-bottom:24px">Programme</div>' + rows + '</div>' +
      c.img(0, px(B.x + B.w * .63, B.y, B.w * .37, B.h * .6)) + c.img(1, px(B.x + B.w * .63, B.y + B.h * .6 + 16, B.w * .2, B.h * .4 - 16));
  } };
  Object.keys(GR).forEach(function (k) { var g = GR[k]; L["gr-" + k] = { fam: "grad", ko: g.ko, hero: !!g.hero, panel: !!(g.panel || g.hero), grid: !!g.grid, need: g.need, render: g.render, req: k === "roster" ? ["roster"] : k === "plan" ? ["rooms"] : k === "catalog" ? ["sort"] : k === "program" ? ["accordion"] : [] }; });
  L["g-table"].req = ["sort"]; L["g-calendar"].req = ["accordion"]; L["g-wordgrid"].req = ["accordion"]; L["g-shapes"].req = ["accordion"];

  /* ---------- the catalogue ---------- */
  var FAMS = {
    feed: ["hero-center", "hero-wide", "hero-bleed", "split", "text-led", "diptych", "feed-row", "collage", "name-big"],
    grid: ["grid-3", "grid-4", "grid-5", "grid-6", "masonry-3", "masonry-4", "rows", "bento", "sheet"],
    slide: ["slide-frame", "slide-bleed", "slide-thumbs", "index-list", "slide-side", "slide-film"],
    populated: Object.keys(P).map(function (k) { return "p-" + k; }),
    graphic: Object.keys(G).map(function (k) { return "g-" + k; }),
    grad: Object.keys(GR).map(function (k) { return "gr-" + k; })
  };
  var NAVFEATS = ["index", "contact", "shop", "search", "news", "lang", "clock"];
  var PAL_BASIC = [["#fcfcfc", "#111111"], ["#ffffff", "#111111"], ["#f3efe6", "#1b1a14"], ["#111111", "#ececec"], ["#e9e7e3", "#111111"], ["#000000", "#ffffff"], ["#eef0f2", "#15181c"], ["#f6f4f0", "#1b1a14"], ["#f4d9cf", "#2d1f1c"], ["#dfe8d5", "#1c2a17"]];
  var PAL_BLANK = [["#ffffff", "#111111"], ["#fcfcfc", "#111111"], ["#f4f4f4", "#111111"]];
  var GROUPS = ["obj", "people", "land", "space", "art", "life", "dream"];
  /* kinds of site that want particular pictures (file prefixes, see photos.js) */
  var PREFS = {
    "p-shop": ["cer", "ch", "gl", "st", "hd"], "p-cafe": ["fd", "st", "cer", "pl", "fl"], "p-band": ["mu", "dn", "ct", "sky"], "p-studio": ["arch", "int", "kr"],
    "p-publisher": ["bk", "paint", "art", "ab", "tx", "rt"], "p-photo": ["pt", "fa", "sh", "fm", "ld"], "p-gallery": ["art", "paint", "sc", "int"], "p-class": ["cer", "hd", "paint", "fl", "fd"],
    "p-cv": ["pt", "fa", "art", "paint", "sc"], "g-cover": ["bk", "arch", "pt", "ld"], "gr-students": ["art", "paint", "sc", "cer", "gl", "dn", "fa", "bk"]
  };

  function pickFeats(r, cat, lay, nav) {
    var f = [], L0 = L[lay];
    (L0.req || []).forEach(function (x) { f.push(x); });
    if (L0.slide) f.push("slides-" + pick(r, L0.modes));
    else if (L0.modes && chance(r, .4)) f.push("slides-" + pick(r, L0.modes));
    if (L0.grid && cat !== "grad") { if (chance(r, .4)) f.push("filter"); else if (chance(r, .3) && lay !== "rows" && lay.indexOf("masonry") < 0 && lay !== "sheet" && lay !== "p-journal") f.push("pages"); if (chance(r, .2) && f.indexOf("products") < 0 && lay !== "p-journal") f.push("products"); }
    if (L0.grid && cat === "grad" && chance(r, .6)) f.push("filter");
    if (L0.hero) f.push(pick(r, ["rake", "model", "compare", "loupe", "daylight", "docent", "guestbook", "scale"]));
    var heroTakesPanel = f.some(function (x) { return /^(docent|guestbook|scale|daylight)$/.test(x); });
    if (L0.panel && !heroTakesPanel && !f.some(function (x) { return /^(audio|accordion|form)$/.test(x); }) && chance(r, .55)) f.push(pick(r, ["audio", "accordion", "form"]));
    if (["top3", "top2", "center", "burger"].indexOf(nav) >= 0 && !f.some(function (x) { return x === "hours" || x === "countdown"; }) && chance(r, .3)) f.push(pick(r, ["hours", "countdown"]));
    var n = 1 + Math.floor(r() * 3), pool = shuffled(r, NAVFEATS);
    for (var i = 0; i < pool.length && n > 0; i++) { var k = pool[i]; if (k === "shop" && f.indexOf("products") >= 0) continue; f.push(k); n--; }
    return f.sort();
  }
  function navFor(r, lay) { var L0 = L[lay], ok = NAVS.filter(function (n) { return !(L0.bleed && (n === "left" || n === "right")); }); return pick(r, ok); }

  function build(photos, plan) {
    var specs = [], used = {}, skeys = {}, fkeys = {};
    /* plan: [[cat, fam-list, count, firstNo], …] */
    plan.forEach(function (p) {
      var cat = p[0], lays = p[1], count = p[2], no = p[3];
      for (var i = 0; i < count; i++) {
        var r = rng(no * 131 + 17), spec = null;
        for (var tries = 0; tries < 400 && !spec; tries++) {
          var lay = lays[(i + tries) % lays.length], nav = navFor(r, lay);
          if (cat === "grad" && nav === "corners") continue;
          var feats = pickFeats(r, cat, lay, nav);
          var type = { scale: pick(r, ["s", "m", "l", "xl"]), "case": pick(r, CASES), align: pick(r, ALIGNS) };
          if (cat === "graphic" && type["case"] === "lower" && chance(r, .5)) type["case"] = "upper";
          var cap = pick(r, CAPS);
          var sk = nav + "|" + lay + "|" + feats.join("+");
          var fk = sk + "|" + type.scale + "|" + type["case"] + "|" + type.align + "|" + cap;
          if (skeys[sk] || fkeys[fk]) continue;
          skeys[sk] = 1; fkeys[fk] = 1;
          var pal = cat === "graphic" ? GPAL[(no * 7) % GPAL.length] : cat === "blank" ? PAL_BLANK[no % PAL_BLANK.length] : cat === "grad" ? pick(r, PAL_BASIC.concat(GPAL.slice(0, 6))) : PAL_BASIC[(no * 3 + i) % PAL_BASIC.length];
          var face = cat === "graphic" ? pick(r, ["sans", "cond", "wide", "serif", "sans", "cond"]) : cat === "blank" ? "sans" : pick(r, ["sans", "sans", "serif", "cond", "mono", "sans"]);
          spec = { no: no, cat: cat, seed: no, nav: nav, layout: lay, type: type, cap: cap, feats: feats, bg: pal[0], ink: pal[1], face: face,
            ko: cat === "graphic" || cat === "grad" ? false : chance(r, .5), groups: shuffled(r, GROUPS).slice(0, 3), key: fk, skey: sk };
        }
        if (!spec) throw new Error("no free combination for " + cat + " " + no);
        specs.push(spec); no++;
      }
    });
    /* photographs: least used first, from the template's subjects, never twice in one template */
    var P0 = photos.map(function (p, i) { return { f: p[0], ko: p[1], g: p[2], i: i }; });
    specs.forEach(function (s) {
      var B = boxOf(s), need = Math.min(L[s.layout].need(s, B) || 0, P0.length);
      if (s.feats.indexOf("model") >= 0 || s.cat === "blank") need = 0; /* wireframes show no photographs */
      if (s.cat === "grad") s.groups = /rake|compare|loupe|daylight|scale/.test(s.feats.join()) ? ART_G : ["art", "obj", "space"];
      var want = PREFS[s.layout], like = want ? function (p) { return want.indexOf(p.f.split("-")[0]) >= 0; } : function (p) { return s.groups.indexOf(p.g) >= 0; };
      var pref = P0.filter(like), rest = P0.filter(function (p) { return !like(p); });
      var off = (s.no * 37) % P0.length;
      function order(a) { return a.slice().sort(function (x, y) { return (used[x.f] || 0) - (used[y.f] || 0) || ((x.i - off + P0.length) % P0.length) - ((y.i - off + P0.length) % P0.length); }); }
      var got = order(pref).slice(0, need);
      if (got.length < need) got = got.concat(order(rest).slice(0, need - got.length));
      s.photos = got.map(function (p) { used[p.f] = (used[p.f] || 0) + 1; return p.f; });
    });
    return specs;
  }

  /* the content box a menu position leaves, the same numbers navHtml uses */
  function boxOf(s) {
    if (s.nav === "left" || s.nav === "right") return { w: 1122, h: 844 };
    if (s.nav === "bottom") return { w: 1384, h: 800 };
    if (s.nav === "corners") return { w: 1384, h: 760 };
    if (s.nav === "center") return { w: 1384, h: 860 - (20 + Math.round(34 * Math.min(SCALES[s.type.scale], 1.9)) * 1.05 + 44) };
    return { w: 1384, h: 776 };
  }
  function enName(f) { return f.replace(/^[a-z]+-/, "").split("-").map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" "); }

  /* one template page, 1440 × 900 */
  function render(spec, env) {
    var c = ctx(spec, env), L0 = L[spec.layout];
    c.bleedInk = !!L0.bleed;
    var nav = navHtml(c), body = L0.render(c, nav.box);
    var foot = "";
    if (nav.foot && !L0.bleed) foot = '<div class="tp-foot"><span>' + c.foot + '</span><span>' + widget(c) + '</span></div>';
    else if (widget(c)) foot = '<div class="tp-foot" style="' + (L0.bleed ? "color:#fff;opacity:.85" : "") + '"><span></span><span>' + widget(c) + '</span></div>';
    var cs = spec.type["case"] === "upper" ? "text-transform:uppercase;" : spec.type["case"] === "lower" ? "text-transform:lowercase;" : "";
    return { html: body + nav.html + foot, style: cs, slides: c.slides };
  }
  function describe(spec) {
    var L0 = L[spec.layout];
    return { label: NAV_KO[spec.nav] + " · " + L0.ko, feats: spec.feats.map(function (k) { return FEAT_KO[k] || k; }) };
  }

  /* numbering: each section starts with its hand-made templates, then generated ones fill it up
     basic 480 (feed 160 · grid 160 · slideshow 160) · graduation 120 · graphic 360 · blank 240 · populated 240 */
  var SECTIONS = [["feed", "basic", 160], ["grid", "basic", 160], ["slide", "basic", 160], ["grad", "grad", 120], ["graphic", "graphic", 360], ["blank", "blank", 240], ["populated", "populated", 240]];
  function plan(hand) {
    var out = [], no = 1;
    SECTIONS.forEach(function (s) {
      var h = hand[s[0]] || 0, lays = s[0] === "blank" ? FAMS.feed.concat(FAMS.grid, FAMS.slide, FAMS.populated) : FAMS[s[0]];
      out.push({ fam: s[0], cat: s[1], first: no, hand: h, gen: s[2] - h, lays: lays });
      no += s[2];
    });
    return out;
  }
  /* how many hand-made templates templates.js has per section (the tools use this; the page counts its own) */
  var HAND = { feed: 6, grid: 6, slide: 6, grad: 12, graphic: 27, blank: 12, populated: 12 };
  function catalogue(photos, hand) {
    hand = hand || HAND;
    var pl = plan(hand);
    return { plan: pl, specs: build(photos, pl.map(function (p) { return [p.cat, p.lays, p.gen, p.first + p.hand]; })) };
  }

  var API = { build: build, plan: plan, catalogue: catalogue, SECTIONS: SECTIONS, HAND: HAND, render: render, describe: describe, FAMS: FAMS, FACES: FACES, FEAT_KO: FEAT_KO, enName: enName, layouts: L };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  root.TPLGEN = API;
})(typeof window !== "undefined" ? window : globalThis);
