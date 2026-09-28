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

  document.getElementById("catsAddr").innerHTML = site
    ? '<span class="lbl">주소 </span><b>' + esc(host) + '</b><a href="./">바꾸기</a>'
    : '<a href="./">주소 정하기</a>';

  /* ---------- building blocks for a 1440 × 900 page ---------- */
  function src(n) { return "assets/img/samples/" + n + ".jpg"; }
  function ph(n, style, cls) { return '<div class="ph ' + (cls || "") + '" style="' + style + '"><img src="' + src(n) + '" alt="" loading="lazy" decoding="async"></div>'; }
  function row(a, b, c) { return '<div class="tp-row"><span class="tp-name">' + a + '</span><span>' + (b || "") + '</span><span>' + (c || "") + '</span></div>'; }
  var CLOCK = '<span class="m" data-clock>00:00:00</span>';
  function foot(l, r) { return '<div class="tp-foot"><span>' + (l || "© 2026 " + N) + '</span><span>' + (r || "") + '</span></div>'; }
  function grid(items, style, cols, ar) {
    return '<div class="gg" style="' + style + ';grid-template-columns:' + cols + '">' + items.map(function (it, i) {
      return '<div class="gi"><div class="fr" style="--ar:' + (it[2] || ar) + '"><img src="' + src(it[0]) + '" alt="" loading="lazy" decoding="async"></div>' +
        '<span><i>' + String(i + 1).padStart(2, "0") + '</i>' + it[1] + '</span></div>';
    }).join("") + '</div>';
  }
  function wf(style) { return '<div class="wf" style="' + style + '"></div>'; }
  function lines(style, ws, h) { return '<div style="position:absolute;display:grid;gap:10px;' + style + '">' + ws.map(function (w) { return '<div class="wl" style="width:' + w + (h ? ";height:" + h : "") + '"></div>'; }).join("") + '</div>'; }
  function page(bg, ink, inner) { return '<div class="tp" style="--t-bg:' + bg + ';--t-ink:' + ink + '">' + inner + '</div>'; }

  var OBJ = [["cer-dark-jug", "검은 주전자"], ["ch-tulip", "튤립 의자"], ["gl-green", "녹색 유리"], ["sc-kintsugi", "금으로 이은 두상"],
    ["st-pear", "배"], ["ch-yellow", "노란 의자"], ["cer-blue-set", "푸른 도자"], ["gl-flower", "유리 꽃"],
    ["st-bottles", "병"], ["cer-cup-speckle", "점박이 컵"], ["ch-orange", "주황 의자"], ["st-tulip", "튤립"]];
  var PHOTO = [["sh-walker", "걷는 사람"], ["pt-bw-woman", "초상 I"], ["ld-sea-blue", "바다"], ["ld-dune-bw", "사구"],
    ["fm-street", "거리"], ["sh-palm", "야자 그림자"], ["ld-lake-dusk", "호수"], ["fm-water-sparkle", "물빛"]];
  var SPACE = [["int-light-line", "빛의 선"], ["arch-brutal-long", "긴 건물"], ["int-m2", "M2"], ["arch-grid-facade", "격자 외벽"]];
  var SKY = [["ld-palm-beach", "해변"], ["arch-curve", "곡면"], ["ld-blue-hills", "푸른 능선"], ["ld-sea-gradient", "수평선"], ["ld-dune-gold", "금빛 사구"], ["arch-window-sky", "하늘 창"]];

  /* ---------- template families ---------- */
  var F = {};

  F.feed = [
    { bg: "#fcfcfc", ink: "#111", html: function () {
      return row(N, "작업, 정보, 이메일", CLOCK) + ph("cer-vases-beige", "left:470px;top:96px;width:500px;height:620px") +
        '<div style="position:absolute;left:28px;right:28px;top:740px;display:grid;grid-template-columns:1fr 1fr;gap:30px;font-size:16px"><span><span class="m dim">01 / 12</span>&nbsp;&nbsp;세 개의 병, 2025</span><p style="opacity:.7">작업실 창가에서 찍은 백자 연작. 유약을 입히기 전의 흙빛을 그대로 남겼습니다.</p></div>' + foot();
    } },
    { bg: "#f3efe6", ink: "#1b1a14", html: function () {
      return row(N, "작업 · 정보", "이메일") + ph("ld-lake-dusk", "left:28px;top:84px;width:860px;height:640px") +
        '<div style="position:absolute;left:920px;right:28px;top:84px;font-size:17px;display:grid;gap:14px"><b style="font-size:30px;font-weight:500;letter-spacing:-.03em">해 질 녘의 호수</b><p style="opacity:.75">호수 위로 해가 지는 20분을 같은 자리에서 기록한 연작의 첫 장입니다.</p><span class="m dim">2025 · 중형 필름 · 6 × 7</span></div>' + foot();
    } },
    { bg: "#fff", ink: "#111", html: function () {
      return row(N, "작업, 정보, 이메일", CLOCK) + ph("ld-sea-deep", "left:28px;right:28px;top:76px;height:680px") +
        '<div style="position:absolute;left:28px;top:772px;font-size:16px"><span class="m dim">03 / 12</span>&nbsp;&nbsp;깊은 바다, 2026</div>' + foot();
    } },
    { bg: "#fcfcfc", ink: "#111", html: function () {
      return row(N, "작업 · 정보 · 이메일", "인스타그램 ↗") + ph("sc-kintsugi", "left:28px;top:90px;width:680px;height:600px") + ph("sc-hand", "left:732px;top:90px;width:680px;height:600px") +
        '<div style="position:absolute;left:28px;right:28px;top:706px;display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:16px"><span>금으로 이은 두상 — 석고, 금박</span><span>손 — 석고, 2025</span></div>' + foot();
    } },
    { bg: "#fcfcfc", ink: "#111", html: function () {
      return row(N, "", "정보, 이메일") + '<h3 class="big" style="left:24px;top:86px;font-size:150px;font-weight:600">' + N + '</h3>' +
        '<div style="position:absolute;left:28px;top:330px;width:560px;font-size:18px;display:grid;gap:14px"><p>의자와 조명, 빈 무대를 찍는 사진가입니다. 사물이 놓인 자리와 그림자를 기록합니다.</p><span class="m dim">선택 작업 2019 — 2026</span></div>' +
        ph("ch-black-stage", "right:28px;top:330px;width:520px;height:460px") + foot();
    } },
    { bg: "#111", ink: "#eee", html: function () {
      return row(N, "작업 · 정보", CLOCK) + ph("ld-dark-hill", "left:270px;top:100px;width:900px;height:600px") +
        '<div style="position:absolute;left:0;right:0;top:730px;text-align:center;font-size:17px"><span class="m dim">06 / 12</span>&nbsp;&nbsp;어두운 언덕, 2026</div>' + foot();
    } }
  ];

  F.grid = [
    { bg: "#fff", ink: "#111", html: function () { return row(N, "작업 · 정보 · 이메일", "인스타그램 ↗") + grid(OBJ.slice(0, 8), "left:28px;right:28px;top:80px", "repeat(4,1fr)", "4 / 5"); } },
    { bg: "#f3efe6", ink: "#1b1a14", html: function () { return row(N, "작업 · 정보", "이메일") + grid(PHOTO.slice(0, 6), "left:28px;right:28px;top:80px", "repeat(3,1fr)", "4 / 3"); } },
    { bg: "#fcfcfc", ink: "#111", html: function () { return row(N, "색인", CLOCK) + grid(OBJ, "left:28px;right:28px;top:80px;gap:26px 12px", "repeat(6,1fr)", "3 / 4"); } },
    { bg: "#141414", ink: "#eee", html: function () { return row(N, "작업 · 정보", "이메일") + grid(SKY.concat(SPACE.slice(0, 4)), "left:28px;right:28px;top:80px", "repeat(5,1fr)", "1 / 1"); } },
    { bg: "#fff", ink: "#111", html: function () {
      return row(N, "작업 · 정보 · 이메일", "") +
        grid([["int-light-line", "빛의 선", "16 / 10"], ["arch-grid-facade", "격자 외벽", "4 / 5"], ["arch-white-wall", "흰 벽", "4 / 5"]], "left:28px;right:28px;top:80px", "2fr 1fr 1fr") +
        grid([["int-stairs", "계단", "4 / 5"], ["pt-bw-man", "초상 II", "4 / 5"], ["ld-dune-gold", "금빛 사구", "16 / 10"]], "left:28px;right:28px;top:520px", "1fr 1fr 2fr");
    } },
    { bg: "#fcfcfc", ink: "#111", html: function () { return row(N, "작업 · 정보", CLOCK) + grid([["fa-yellow-sky", "노란 드레스"], ["ld-lake-dusk", "호수"], ["fm-street", "거리"], ["sh-window-light", "창의 빛"]], "left:28px;right:28px;top:80px;gap:40px 24px", "repeat(2,1fr)", "16 / 9"); } }
  ];

  F.slide = [
    { bg: "#0e0e0e", ink: "#ececec", html: function () {
      return row(N, "작업 · 정보", "이메일") + ph("fa-yellow-sky", "left:420px;top:100px;width:600px;height:600px") +
        '<span style="position:absolute;left:80px;top:390px;font-size:34px;opacity:.5">←</span><span style="position:absolute;right:80px;top:390px;font-size:34px;opacity:.5">→</span>' +
        '<div style="position:absolute;left:0;right:0;top:730px;text-align:center"><span class="m dim">03 / 08</span>&nbsp;&nbsp;노란 드레스</div>' + foot(null, CLOCK);
    } },
    { bg: "#fcfcfc", ink: "#111", html: function () {
      return row(N, "작업 · 정보", "이메일") + ph("ld-sea-gradient", "left:120px;right:120px;top:90px;height:640px") +
        '<span style="position:absolute;left:40px;top:390px;font-size:30px;opacity:.4">←</span><span style="position:absolute;right:40px;top:390px;font-size:30px;opacity:.4">→</span>' +
        '<div style="position:absolute;left:120px;top:750px"><span class="m dim">01 / 06</span>&nbsp;&nbsp;수평선</div>' + foot();
    } },
    { bg: "#000", ink: "#fff", html: function () {
      return ph("ld-dune-gold", "inset:0") + '<div style="position:absolute;inset:0;background:linear-gradient(transparent 60%,rgba(0,0,0,.45))"></div>' +
        row(N, "작업 · 정보", "이메일") + '<div style="position:absolute;left:28px;bottom:28px;font-size:22px"><span class="m" style="opacity:.7">05 / 12</span>&nbsp;&nbsp;금빛 사구</div>';
    } },
    { bg: "#fff", ink: "#111", html: function () {
      return '<div style="position:absolute;left:28px;top:22px;width:360px;display:grid;gap:26px;font-size:16px"><b class="tp-name">' + N + '</b>' +
        '<div style="display:grid;gap:6px">' + SPACE.map(function (s, i) { return '<span style="' + (i === 1 ? "" : "opacity:.4") + '"><span class="m">0' + (i + 1) + '</span>&nbsp;&nbsp;' + s[1] + '</span>'; }).join("") + '</div>' +
        '<p style="opacity:.7">빛이 드는 실내를 기록하는 연작입니다. 사람이 떠난 뒤의 조명과 벽을 찍었습니다.</p></div>' +
        ph("int-light-line", "left:420px;right:28px;top:22px;bottom:22px");
    } },
    { bg: "#fcfcfc", ink: "#111", html: function () {
      return row(N, "작업 · 정보", CLOCK) + ph("arch-white-wall", "left:170px;right:170px;top:84px;height:600px") +
        '<div style="position:absolute;left:170px;right:170px;top:712px;display:grid;grid-template-columns:repeat(8,1fr);gap:10px">' +
        OBJ.slice(0, 8).map(function (o, i) { return '<div style="aspect-ratio:1;overflow:hidden;' + (i ? "opacity:.45" : "outline:2px solid #111") + '"><img src="' + src(o[0]) + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>'; }).join("") + '</div>';
    } },
    { bg: "#e9e7e3", ink: "#111", html: function () {
      return row(N, "", "정보") + ph("pt-bw-studio", "left:480px;top:70px;width:480px;height:700px") +
        '<div style="position:absolute;left:28px;bottom:26px;font-size:17px;display:grid;gap:4px"><span>초상, 2026</span><span class="m dim">아카이벌 피그먼트 프린트</span></div><div style="position:absolute;right:28px;bottom:26px" class="m dim">02 / 09</div>';
    } }
  ];

  /* ---------- graphic: type-led pages, original to 1440 ----------
     English carries the page; Korean sits underneath as a smaller, quieter line. */
  function at(style, html) { return '<div style="position:absolute;' + style + '">' + html + '</div>'; }
  function ko(txt, style) { return '<span class="ko" style="' + (style || "") + '">' + txt + '</span>'; }
  var CHECK = '<svg viewBox="0 0 24 24" style="width:.78em;height:.78em;vertical-align:-.06em;margin-right:.2em" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="square"><path d="M3 13l6 6L21 5"/></svg>';
  function chip(t) { return '<span style="border:1px solid;padding:2px 7px;border-radius:99px">' + t + '</span>'; }

  F.graphic = [
    { desc: "책 표지 · 큰 그로테스크", bg: "#6c4d8c", ink: "#ece7f2", html: function () {
      return at("left:28px;top:22px;font-size:15px", '<b class="tp-name">' + N + '</b>') +
        at("right:28px;top:84px;text-align:right;font-size:146px;line-height:.94;letter-spacing:-.05em;font-weight:500", "Ways of<br>Arranging") +
        at("right:32px;top:390px;font-size:22px", ko("배치의 방식 — 선반, 탁자, 벽에 관한 에세이", "opacity:.72")) +
        at("left:28px;right:28px;bottom:26px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;font-size:14px;line-height:1.4;border-top:1px solid;padding-top:12px",
          "<span>An essay on shelves,<br>tables and walls</span><span>Third printing<br>2026</span><span>112 pages<br>Softcover, sewn</span><span style='text-align:right'>Order ↗</span>");
    } },
    { desc: "콘덴스드 대문자 · 번호", bg: "#fbfbfa", ink: "#0d0d0d", html: function () {
      return at("left:28px;right:28px;top:22px;display:flex;justify-content:space-between;font-size:15px", "<b class='tp-name'>" + N + "</b><span>Photographs · Words</span>") +
        at("left:22px;top:80px;font-family:var(--f-cond);font-stretch:62%;font-weight:800;font-size:196px;line-height:.86;text-transform:uppercase", N + "<br>After<br>Hours") +
        at("right:28px;top:84px;font-size:220px;font-weight:200;letter-spacing:-.06em;line-height:.8", "12") +
        at("left:28px;bottom:26px;right:28px;display:flex;justify-content:space-between;font-size:16px", "<span>Twelve photographs taken between midnight and six</span>" + ko("업무 시간 이후 — 자정부터 여섯 시까지", "opacity:.55"));
    } },
    { desc: "3개 언어 제목 · 저널", bg: "#ffffff", ink: "#111", html: function () {
      var col = function (t, b) { return '<div style="display:grid;gap:6px"><b style="font-weight:500">' + t + '</b><span style="opacity:.62">' + b + '</span></div>'; };
      return at("left:28px;right:28px;top:22px;display:grid;grid-template-columns:repeat(4,1fr);font-size:13px", '<span>' + N + ' Quarterly</span><span>Contributors</span><span>Back Issues</span><span style="text-align:right">Subscribe ↗</span>') +
        at("left:26px;top:70px;font-size:74px;font-weight:700;line-height:1.02;letter-spacing:-.035em", "Everyday Signs<br>Signes du quotidien<br>" + ko("일상의 표지판", "font-weight:600;opacity:.42")) +
        at("left:28px;right:420px;top:350px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px;font-size:14px;line-height:1.45",
          col("A quarterly on the printed street", "Issue three follows bus-stop timetables, hand-painted shop fronts and the numbers on apartment doors.") +
          col("Une revue trimestrielle", "Le numéro trois suit les horaires d'arrêts de bus et les enseignes peintes à la main.") +
          col(ko("거리의 인쇄물에 관한 계간지"), ko("3호는 버스 정류장 시간표, 손으로 그린 간판, 아파트 문의 숫자를 따라갑니다."))) +
        at("left:26px;bottom:18px;font-size:92px;font-weight:700;line-height:1", "No. 03") +
        ph("int-m2", "right:28px;top:350px;width:370px;bottom:28px");
    } },
    { desc: "공연 포스터 · 라인업", bg: "#153f2a", ink: "#ffb3cf", html: function () {
      var set = [["22:00", "Soyo"], ["23:30", "Mul"], ["01:00", "Parang"], ["02:30", "Hoya b2b Dal"], ["04:00", "Ending set"]];
      return at("left:28px;right:28px;top:22px;display:flex;justify-content:space-between;font-size:14px", "<span>" + N + " Nights</span>" + CLOCK) +
        at("left:22px;top:70px;font-family:var(--f-cond);font-stretch:62%;font-weight:900;font-size:260px;line-height:.82;text-transform:uppercase", "Night<br>Shift") +
        at("right:28px;top:90px;width:420px;display:grid;gap:4px;font-family:var(--f-cond);font-weight:700;font-size:34px;text-transform:uppercase", set.map(function (s) { return '<div style="display:flex;justify-content:space-between;border-bottom:2px solid;padding:6px 0"><span class="m" style="font-size:22px">' + s[0] + '</span><span>' + s[1] + '</span></div>'; }).join("")) +
        at("right:28px;top:470px;width:420px;font-size:17px;line-height:1.45", "One room, one long night, no phones on the floor. Doors close at midnight.<br>" + ko("한 공간, 긴 밤 하나. 자정에 문을 닫습니다.", "opacity:.75")) +
        at("left:28px;right:28px;bottom:22px;display:flex;justify-content:space-between;font-family:var(--f-cond);font-weight:800;font-size:26px;text-transform:uppercase", "<span>Fri 13 Nov 2026</span><span>Warehouse 4, Mullae</span>");
    } },
    { desc: "체크리스트 포스터", bg: "#f0462e", ink: "#fff6ea", html: function () {
      return at("left:28px;right:28px;top:22px;display:flex;justify-content:space-between;font-size:14px;font-weight:600", "<span>" + N + " Open Air</span><span>Map ↗</span>") +
        at("left:28px;top:80px;font-family:var(--f-cond);font-weight:900;font-size:40px;text-transform:uppercase", "What to bring") +
        at("left:28px;top:140px;font-family:var(--f-cond);font-weight:900;font-size:84px;line-height:1.02;text-transform:uppercase", ["Water", "Earplugs", "A friend", "Patience", "Cash for the coats"].map(function (x) { return CHECK + x; }).join("<br>")) +
        at("right:28px;top:80px;text-align:right;font-family:var(--f-cond);font-stretch:62%;font-weight:900;font-size:300px;line-height:.82", "08<br>08") +
        at("right:28px;bottom:28px;text-align:right;font-size:18px;line-height:1.45", "Summer gathering in the park<br>From noon until the last train<br>" + ko("챙길 것 — 물, 귀마개, 친구, 인내심", "opacity:.8"));
    } },
    { desc: "이름 반복 · 외곽선", bg: "#f4f2ec", ink: "#1f3fd1", html: function () {
      var rows = ""; for (var i = 0; i < 7; i++) rows += '<div style="' + (i % 2 ? "color:transparent;-webkit-text-stroke:2px currentColor" : "") + '">' + N + ' ' + N + '</div>';
      return at("left:18px;right:18px;top:6px;font-family:var(--f-cond);font-stretch:112%;font-weight:900;font-size:118px;line-height:.98;text-transform:uppercase;white-space:nowrap;overflow:hidden", rows) +
        at("left:28px;right:28px;bottom:20px;display:flex;justify-content:space-between;font-size:15px;color:#111", "<span>Work · About · Contact</span>" + ko("이름을 일곱 번 — 작업 · 소개 · 연락", "opacity:.6"));
    } },
    { desc: "초대형 시각 · 사진", bg: "#ffffff", ink: "#0c0c0c", html: function () {
      return at("left:28px;right:28px;top:22px;display:grid;grid-template-columns:1fr 1fr 1fr;font-size:14px", "<span>Photographs</span><span>" + N + " — Morning Index</span><span style='text-align:right'>About</span>") +
        ph("sh-window-light", "right:28px;top:90px;width:360px;height:440px") +
        at("left:28px;top:120px;width:460px;font-size:17px;line-height:1.45", "Photographed at twelve minutes past seven, every morning for a year.<br>" + ko("1년 동안 매일 아침 7시 12분에 찍은 사진.", "opacity:.5")) +
        at("left:14px;bottom:-46px;font-size:420px;font-weight:800;letter-spacing:-.075em;line-height:1", "07:12");
    } },
    { desc: "세리프 전시 안내 · 액자", bg: "#cfe0ef", ink: "#14202c", html: function () {
      return at("left:28px;right:28px;top:22px;display:grid;grid-template-columns:repeat(3,1fr);font-size:13px", '<span>' + N + '</span><span style="text-align:center">Exhibitions</span><span style="text-align:right">Visit ↗</span>') +
        at("left:620px;top:80px;width:200px;height:250px;padding:12px;background:#fff;box-shadow:0 10px 30px -14px rgba(0,0,0,.4)", '<img src="' + src("paint-ochre") + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">') +
        at("left:0;right:0;top:370px;text-align:center;font-family:var(--f-serif);font-size:58px;line-height:1.14", "Kim Haneul<br>One Painting, 1440 Minutes<br><i>October 2 — November 15, 2026</i>") +
        at("left:0;right:0;top:590px;text-align:center;font-family:var(--f-kserif);font-size:22px", ko("그림 한 점, 1,440분 — 김하늘 개인전", "opacity:.7")) +
        at("left:0;right:0;bottom:30px;text-align:center;font-family:var(--f-serif);font-size:16px", "Tuesday — Sunday, 11 am — 7 pm · Free admission");
    } },
    { desc: "콘덴스드 소문자 · 검정", bg: "#0c0c0c", ink: "#ff6fae", html: function () {
      return at("left:28px;right:28px;top:22px;display:grid;grid-template-columns:1fr auto 1fr;font-size:15px;color:#e8e8e8", '<b class="tp-name">' + N + '</b><span>writing &nbsp;talks &nbsp;reading list</span><span style="text-align:right">newsletter</span>') +
        at("left:0;right:0;top:120px;text-align:center;font-family:var(--f-cond);font-stretch:62%;font-weight:500;font-size:150px;line-height:.9;letter-spacing:-.02em", "notes toward<br>a slower<br>internet") +
        at("left:0;right:0;bottom:44px;text-align:center;color:#e8e8e8;font-size:17px", "a column, once a month<br>" + ko("더 느린 인터넷을 위한 메모", "opacity:.55;font-size:15px"));
    } },
    { desc: "프로젝트 색인 표", bg: "#f2ecd2", ink: "#1a1a14", html: function () {
      var rows = [["2026", "Harbour Library", "Annual report", "Print"], ["2026", "Mullae Metalworks", "Website", "Screen"], ["2025", "Oryu Gallery", "Exhibition identity", "Space"], ["2025", "Seoul Photo Annual", "Book", "Print"],
        ["2024", "Margin Notes", "Magazine", "Print"], ["2024", "Moraenae Film Days", "Posters", "Print"], ["2023", "Paper & Pencil", "Packaging", "Object"], ["2023", "Bada Records", "Sleeves", "Print"], ["2022", "Small Museum", "Catalogue", "Print"], ["2021", "Studio Halla", "Type specimen", "Print"]];
      return at("left:28px;right:28px;top:20px;display:grid;grid-template-columns:1fr 1fr auto;font-size:13px;line-height:1.3", '<span><b>' + N + '</b><br>Graphic design</span><span>Index of projects<br>2021 — 2026</span><span style="text-align:right">Contact<br>Instagram ↗</span>') +
        at("left:28px;right:28px;top:190px;display:grid;grid-template-columns:120px 1.3fr 1.3fr auto;font-size:13px;opacity:.6", "<span>Year</span><span>Client</span><span>Project " + ko("프로젝트", "") + "</span><span>Type</span>") +
        at("left:28px;right:28px;top:214px;font-family:var(--f-cond);font-stretch:80%;font-weight:600;font-size:32px;line-height:1.26", rows.map(function (r) { return '<div style="display:grid;grid-template-columns:120px 1.3fr 1.3fr auto;border-bottom:1px solid rgba(0,0,0,.15)"><span class="m" style="font-size:24px">' + r[0] + '</span><span>' + r[1] + '</span><span>' + r[2] + '</span><span>' + r[3] + '</span></div>'; }).join(""));
    } },
    { desc: "블랙레터 · 신문", bg: "#141c33", ink: "#f2ead8", html: function () {
      return at("left:28px;right:28px;top:22px;display:flex;justify-content:space-between;font-size:14px;border-bottom:1px solid;padding-bottom:10px", "<span>Vol. 1 — No. 1440</span><span>" + N + " Press</span><span>Price: one hour</span>") +
        at("left:0;right:0;top:120px;text-align:center;font-family:var(--f-black);font-size:170px;line-height:1", "The Night<br>Edition") +
        at("left:0;right:0;top:500px;text-align:center;font-size:30px;letter-spacing:.02em", "A Newspaper for Insomniacs") +
        at("left:0;right:0;top:552px;text-align:center;font-family:var(--f-kserif);font-size:20px", ko("밤의 신문 — 잠 못 드는 사람들을 위하여", "opacity:.7")) +
        at("left:140px;right:140px;bottom:36px;display:grid;grid-template-columns:repeat(3,1fr);gap:30px;font-family:var(--f-serif);font-size:15px;line-height:1.45;border-top:1px solid;padding-top:14px",
          "<p>Weather: clear until four, then fog along the river.</p><p>Tonight: the last bus, the first bakery, a list of open windows.</p><p>Letters to the editor are read aloud at dawn.</p>");
    } },
    { desc: "액자 엽서 · 사진", bg: "#e9e4dc", ink: "#b8231a", html: function () {
      return at("left:0;right:0;top:22px;text-align:center;font-size:13px;font-weight:600;letter-spacing:.08em", N.toUpperCase() + " EDITIONS") +
        at("left:90px;right:90px;top:64px;bottom:64px;border:2px solid;display:grid;grid-template-columns:1.2fr 1fr",
          '<div style="padding:50px;display:grid;align-content:space-between"><div style="font-family:var(--f-cond);font-stretch:112%;font-weight:700;font-size:78px;line-height:1.05;text-transform:uppercase">Postcards<br>from a<br>Quiet City</div>' +
          '<div style="font-size:16px;line-height:1.5">Twelve cards, printed in two colours on uncoated board.<br>' + ko("조용한 도시에서 온 엽서 열두 장", "opacity:.7") + '</div></div>' +
          '<div style="border-left:2px solid;padding:26px"><img src="' + src("arch-reflection") + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>');
    } },
    { desc: "색 띠 문장", bg: "#ffffff", ink: "#111", html: function () {
      var bands = [["#ffcf33", "#2a1d00", "Every"], ["#2b59ff", "#e8eeff", "minute"], ["#ff7a59", "#2a0e06", "is a"], ["#1f1f1f", "#f2f2f2", "blank"], ["#9be3c1", "#0c2a1c", "page."]];
      return at("left:0;right:0;top:0", bands.map(function (b, i) { return '<div style="background:' + b[0] + ';color:' + b[1] + ';height:170px;padding-left:' + (24 + i * 120) + 'px;font-weight:700;font-size:150px;letter-spacing:-.05em;line-height:170px;overflow:hidden;white-space:nowrap">' + b[2] + '</div>'; }).join("")) +
        at("left:28px;right:28px;bottom:14px;display:flex;justify-content:space-between;font-size:14px", "<span>" + N + " — Diary, 2026</span>" + ko("매 분은 빈 페이지다", "opacity:.6"));
    } },
    { desc: "세리프 이탤릭 · 밤 운영", bg: "#39402a", ink: "#efe8d2", html: function () {
      return at("left:28px;right:28px;top:22px;display:grid;grid-template-columns:repeat(4,1fr);font-size:12px;line-height:1.35", '<span>' + N + '<br>Library of Things</span><span>Thursdays 6pm — 11pm</span><span>Borrow · Return · Repair</span><span style="text-align:right">' + CLOCK + '</span>') +
        at("left:0;right:0;top:170px;text-align:center;font-family:var(--f-serif);font-size:124px;line-height:1;letter-spacing:-.02em", "<i>Open Late</i><br>on Thursdays") +
        at("left:0;right:0;top:470px;text-align:center;font-family:var(--f-serif);font-size:30px;line-height:1.3", "Borrow a drill, a tent, a projector,<br>or a sewing machine until eleven.") +
        at("left:0;right:0;top:600px;text-align:center;font-family:var(--f-kserif);font-size:22px", ko("목요일은 밤 11시까지 — 물건 도서관", "opacity:.72"));
    } },
    { desc: "시험 인쇄 · 파랑", bg: "#2437ff", ink: "#d7dcff", html: function () {
      return '<div style="position:absolute;left:720px;top:0;width:720px;height:900px;overflow:hidden;opacity:.55;mix-blend-mode:multiply"><img src="' + src("arch-grid-facade") + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.2)"></div>' +
        at("left:22px;right:22px;top:18px;font-size:160px;font-weight:800;line-height:.9;letter-spacing:-.05em;text-transform:uppercase", N.slice(0, 8) + "<br>Test Print<br>No. 26") +
        at("left:28px;bottom:110px;width:560px;font-size:17px;line-height:1.45;color:#fff", "A proof sheet: registration marks, a grey scale and one façade, printed in process blue.<br>" + ko("시험 인쇄 — 맞춤표, 회색 단계, 외벽 사진 한 장.", "opacity:.7")) +
        at("left:28px;right:28px;bottom:22px;display:flex;justify-content:space-between;font-size:15px;color:#fff", '<span>Index &nbsp; Info</span>' + CLOCK);
    } },
    { desc: "도형 여섯 개", bg: "#f5f3ee", ink: "#111", html: function () {
      var shapes = ['<circle cx="50" cy="50" r="38"/>', '<rect x="14" y="14" width="72" height="72"/>', '<path d="M50 10L90 86H10Z"/>', '<path d="M10 50h80M50 10v80"/>', '<circle cx="50" cy="50" r="38" fill="currentColor"/>', '<path d="M14 86L86 14M14 14h72v72"/>'];
      return at("left:28px;right:28px;top:22px;display:grid;grid-template-columns:repeat(4,1fr);font-size:13px", '<span>' + N + '</span><span>Form Studies</span><span>Drawings, 2026</span><span style="text-align:right">About</span>') +
        at("left:28px;right:28px;top:66px;display:grid;grid-template-columns:repeat(3,1fr);gap:0", shapes.map(function (s, i) { return '<div style="border-top:1px solid rgba(0,0,0,.2);border-left:' + (i % 3 ? "1px solid rgba(0,0,0,.2)" : "0") + ';padding:20px;display:grid;gap:8px"><svg viewBox="0 0 100 100" style="width:250px;height:250px;margin:0 auto" fill="none" stroke="currentColor" stroke-width="6">' + s + '</svg><span style="font-size:14px">Form 0' + (i + 1) + '</span></div>'; }).join("")) +
        at("left:28px;bottom:14px;font-size:14px", ko("형태 연구 — 여섯 개의 도형", "opacity:.6"));
    } },
    { desc: "서체 견본", bg: "#ffffff", ink: "#111", html: function () {
      return at("left:28px;right:28px;top:22px;display:grid;grid-template-columns:1fr auto 1fr;font-size:13px;font-family:var(--mono)", '<span>TYPE SPECIMEN</span><span style="background:#f7e437;padding:0 6px">ARCHIVO — OMNIBUS-TYPE</span><span style="text-align:right">SIL OFL 1.1</span>') +
        at("left:0;right:0;top:120px;text-align:center;font-family:var(--f-cond);font-size:230px;font-weight:500;letter-spacing:-.04em", "Archivo") +
        at("left:28px;right:28px;top:470px;border-top:1px solid #111;padding-top:14px;display:grid;grid-template-columns:2fr 1fr;gap:40px",
          '<div style="font-family:var(--f-cond);font-size:34px;line-height:1.2">A grotesque with a width axis from 62 to 125. <i>Narrow for posters,</i> wide for signs, and anywhere between for the text in the middle.</div>' +
          '<div style="font-size:15px;line-height:1.5"><b style="font-weight:500">Notes</b><br><span style="opacity:.6">Variable · wdth 62–125 · wght 100–900</span><br><br>' + ko("폭을 바꿀 수 있는 그로테스크 — 포스터에는 좁게, 간판에는 넓게.", "opacity:.55") + '</div>');
    } },
    { desc: "굵은 이탤릭 이름", bg: "#f4f1ea", ink: "#1b3fd6", html: function () {
      return at("left:0;right:0;top:0;height:54px;background:#1b3fd6;color:#f4f1ea;display:flex;align-items:center;justify-content:space-between;padding:0 28px;font-family:var(--f-cond);font-weight:800;font-style:italic;font-size:20px;text-transform:uppercase", "<span>Room 3 — Works on Paper</span><span>" + N + "</span>") +
        at("left:28px;right:28px;top:200px;font-family:var(--f-cond);font-weight:900;font-style:italic;font-size:210px;line-height:.86;text-transform:uppercase;letter-spacing:-.02em", "Mina Oh") +
        at("left:32px;top:420px;font-size:18px;line-height:1.5", "Drawings in pencil and salt<br>November 19 — December 21, 2026<br>" + ko("오미나 — 연필과 소금으로 그린 드로잉", "opacity:.7")) +
        at("left:28px;right:28px;bottom:28px;display:grid;grid-template-columns:repeat(3,1fr);font-size:14px;border-top:1px solid;padding-top:10px", "<span>Works (24)</span><span>Text by Jae Won</span><span style='text-align:right'>Enquiries ↗</span>");
    } },
    { desc: "소문자 콘덴스드 · 표지", bg: "#cfeee0", ink: "#12352a", html: function () {
      return at("left:28px;right:28px;top:22px;display:flex;justify-content:space-between;font-size:14px", "<span>Books</span><span>" + N + "</span><span>Shop ↗</span>") +
        at("left:0;right:0;top:110px;text-align:center;font-family:var(--f-serif);font-size:24px;letter-spacing:.08em", "JAE WON") +
        at("left:0;right:0;top:170px;text-align:center;font-family:var(--f-cond);font-stretch:62%;font-weight:700;font-size:260px;line-height:.9;letter-spacing:-.02em", "afterglow") +
        at("left:0;right:0;top:560px;text-align:center;font-family:var(--f-serif);font-size:17px;letter-spacing:.08em;line-height:1.55", "SHORT STORIES<br>HARBOUR BOOKS, INCHEON<br>2026") +
        at("left:0;right:0;top:660px;text-align:center;font-size:18px", ko("잔광 — 원재 단편집", "opacity:.6")) +
        at("left:28px;bottom:22px;display:flex;gap:8px;font-size:12px", chip("Read an excerpt") + chip("Instagram"));
    } },
    { desc: "원형 번호 · 캡션", bg: "#ffffff", ink: "#111", html: function () {
      return at("left:28px;right:28px;top:22px;display:flex;justify-content:space-between;font-size:14px", "<span>" + N + " Objects</span><span>Archive &nbsp;Information</span>") +
        at("left:470px;top:100px;width:500px;height:500px;border-radius:50%;background:#ff6a1f;display:grid;place-items:center;color:#1d0a00;font-size:170px;font-weight:600;letter-spacing:-.05em", "Nº1") +
        at("left:0;right:0;top:640px;text-align:center;font-size:14px;opacity:.7", "Object one of twelve. A single thing, photographed on the first day of each month. <b>[More]</b>") +
        at("left:0;right:0;top:672px;text-align:center;font-size:14px", ko("사물 1 — 매달 첫날 찍은 하나의 물건", "opacity:.55"));
    } },
    { desc: "종이 네 장 · 숫자", bg: "#ffffff", ink: "#222", html: function () {
      var sheet = function (x, l) { return '<div style="position:absolute;left:' + x + 'px;top:300px;width:230px;height:310px">' + [16, 8, 0].map(function (d) { return '<div style="position:absolute;left:' + d + 'px;top:' + d + 'px;width:230px;height:310px;background:#fff;border:1.5px solid #333"></div>'; }).join("") +
        '<div style="position:absolute;left:16px;top:16px;width:230px;height:310px;display:grid;place-items:center;font-family:var(--f-serif);font-style:italic;font-size:170px">' + l + '</div></div>'; };
      return at("left:28px;right:28px;top:22px;display:grid;grid-template-columns:1fr auto 1fr;font-size:12px;letter-spacing:.06em;border-bottom:1px solid #999;padding-bottom:10px", "<span>" + N.toUpperCase() + "</span><span>PAPER STUDIES</span><span style='text-align:right'>VOL. 3</span>") +
        at("left:0;right:0;top:110px;text-align:center;font-size:48px;letter-spacing:.02em", "Paper Studies<br><span style='opacity:.45;font-family:var(--f-serif)'>four sheets, one number</span>") +
        at("left:0;right:0;top:250px;text-align:center;font-size:17px", ko("종이 연구 — 네 장, 숫자 하나", "opacity:.55")) +
        sheet(220, "1") + sheet(480, "4") + sheet(740, "4") + sheet(1000, "0");
    } },
    { desc: "카드 · 하이라이트", bg: "#aecbf2", ink: "#111", html: function () {
      var card = function (x, y, w, h, t, body) { return at("left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px;background:#fff;border:2px solid #111;box-shadow:6px 6px 0 #111;padding:16px;font-family:var(--mono);font-size:13px;line-height:1.5;overflow:hidden", "<b>" + t + "</b><br>" + body); };
      var hl = function (t) { return '<span style="background:#b7f06a">' + t + '</span>'; };
      return card(28, 28, 440, 300, N + " — Email, Instagram", "A two-person studio for books and screens.<br><br>We make " + hl("identities") + ", printed matter and websites for libraries, publishers and small shops.<br><br>" + ko("책과 화면을 위한 2인 스튜디오.")) +
        card(500, 28, 440, 300, "Project 12 — Library Report", "An annual report in twelve chapters, " + hl("one typeface") + " and three colours.<br><br>See project →") +
        '<div class="wf" style="left:972px;top:28px;width:440px;height:300px;background-color:#fff;outline:2px solid #111"></div>' +
        card(28, 360, 440, 330, "Clients", "Harbour Library<br>Seoul Photo Annual<br>Margin Notes<br>Oryu Gallery<br><br>Teaching<br>Typography II, 2024–") +
        '<div class="wf" style="left:500px;top:360px;width:440px;height:330px;background-color:#fff;outline:2px solid #111"></div>' +
        card(972, 360, 440, 330, "Project 09 — School Signs", "Wayfinding for a concrete school. Signs are cast into the walls and " + hl("painted by hand") + ".<br><br>See project →") +
        card(28, 722, 440, 150, "Now", "Working on a cookbook set in two typefaces.");
    } },
    { desc: "반복 라벨 타일", bg: "#0e0e0e", ink: "#ff8fc8", html: function () {
      var t = '<div style="border:3px solid #ff8fc8;padding:8px 10px;font-family:var(--f-cond);font-stretch:75%;font-weight:900;font-size:62px;line-height:.92;text-transform:uppercase">Night Market<br>No. 14</div>';
      return at("left:28px;right:28px;top:10px;display:grid;grid-template-columns:1fr 1fr 1fr auto;font-size:13px", '<span>' + N + '</span><span>Stalls</span><span>Map</span><span>Friday 7pm ↗</span>') +
        at("left:14px;right:14px;top:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px", Array(13).join(t)) +
        at("right:28px;bottom:14px;font-size:14px;background:#0e0e0e;padding:4px 8px", ko("야시장 14회", ""));
    } },
    { desc: "트랙 리스트 · A/B면", bg: "#d9ccf2", ink: "#1b1330", html: function () {
      var a = [["Morning Ferry", "3:12"], ["Salt on the Window", "4:05"], ["Slow Bus", "2:48"], ["Paper Moon Bakery", "3:37"], ["1440", "6:00"]];
      var b = [["Tunnel Echo", "3:51"], ["Night Market", "4:22"], ["Soft Signals", "2:59"], ["Last Train Home", "5:10"], ["Blank Page", "1:44"]];
      var list = function (side, t) { return '<div style="background:#fff;padding:18px 20px;font-size:22px;line-height:1.4"><b style="font-weight:500;font-size:15px">' + side + '</b><br>' + t.map(function (x, i) { return '<div style="display:flex;justify-content:space-between"><span><span class="m" style="opacity:.4;font-size:14px">0' + (i + 1) + '</span>&nbsp; ' + x[0] + '</span><span class="m" style="opacity:.45;font-size:16px">' + x[1] + '</span></div>'; }).join("") + '</div>'; };
      return at("left:28px;top:28px;width:560px", list("Side A", a)) + at("left:620px;top:28px;width:560px", list("Side B", b)) +
        at("left:28px;bottom:26px;font-family:var(--f-cond);font-stretch:62%;font-weight:800;font-size:150px;line-height:.85;text-transform:uppercase", "Soft<br>Signals") +
        at("right:28px;bottom:26px;text-align:right;font-size:15px;line-height:1.45", N + " — 12-inch LP, 45 rpm<br>" + ko("부드러운 신호 — 열 곡", "opacity:.7"));
    } },
    { desc: "책 표지 · 사진 반반", bg: "#f7f7f5", ink: "#111", html: function () {
      return at("left:0;top:0;width:700px;bottom:0", '<div style="position:absolute;right:40px;top:70px;text-align:right;font-style:italic;font-weight:700;letter-spacing:-.03em">' +
          '<span style="font-size:22px;font-weight:500">series </span><span style="font-size:88px">MARGIN</span><br><span style="font-size:40px;font-weight:600;line-height:1">field notes<br>on</span>' +
          '<div style="margin-top:130px;font-size:80px;line-height:.95">CONCRETE</div><div style="font-size:26px;margin-top:6px">Park Studio</div>' +
          '<div style="margin-top:130px;font-size:96px;line-height:1">120</div><div style="font-size:36px">drawings</div></div>') +
        ph("arch-concrete-blocks", "left:700px;right:0;top:0;height:470px") +
        at("left:740px;right:28px;top:520px;display:grid;grid-template-columns:200px 1fr;gap:30px;font-size:14px;line-height:1.5", "<span><b>" + N + "</b><br>Information<br>Email<br>Instagram</span><span>A pocket book of drawings made on site, one building per page.<br><br>" + ko("현장에서 그린 콘크리트 건물 드로잉 120점.") + "</span>");
    } },
    { desc: "세리프 이탤릭 목록", bg: "#f3f2ee", ink: "#1b1b1b", html: function () {
      return at("left:28px;top:40px;font-family:var(--f-serif);font-style:italic;font-weight:300;font-size:74px;line-height:1.13;letter-spacing:-.02em", "Seo Jiwoo<br>Thirty Mornings<br>Watercolour on Paper, 2025<br>Versions 1 — 30<br>Printed by<br>Harbour Books, Incheon") +
        at("left:32px;top:740px;font-size:20px", ko("서지우 — 서른 번의 아침, 종이에 수채", "opacity:.55")) +
        at("left:28px;bottom:22px;display:flex;gap:8px;font-size:12px", chip("About") + chip("Instagram")) +
        at("right:28px;bottom:22px;font-family:var(--mono);font-size:11px;text-align:right;opacity:.6", N + "<br>Catalogue, edition of 300");
    } },
    { desc: "쌓인 대문자 목록 · 띠", bg: "#101a3a", ink: "#f3ede5", html: function () {
      var l = ["Museum Shop", "Postcards", "Candles", "Tote Bags", "Posters"], m = ["Catalogues", "Pencils", "Tea Towels", "Gift Cards"];
      var big = function (x) { return '<div style="font-family:var(--f-cond);font-stretch:112%;font-weight:900;font-size:74px;line-height:.93;text-transform:uppercase;text-align:center">' + x + '</div>'; };
      return at("left:28px;top:14px;font-size:11px;line-height:1.3;text-transform:uppercase", N + " Museum<br>Ground floor") +
        at("left:0;right:0;top:10px", l.map(big).join("") + '<div style="background:#ff7a1f;color:#101a3a;margin:8px 0;font-family:var(--f-cond);font-stretch:112%;font-weight:900;font-size:128px;line-height:1.05;text-align:center">Open 11 — 19</div>' + m.map(big).join("")) +
        at("left:28px;bottom:14px;font-size:12px;line-height:1.3", "Closed on Mondays<br>" + ko("뮤지엄 숍 — 월요일 휴무", ""));
    } }
  ];

  F.blank = [
    { name: "빈 템플릿", n: 2, bg: "#fcfcfc", ink: "#111", html: function () {
      return row(N) + '<div style="position:absolute;inset:110px 28px 80px;border:2px dashed #d6d6d6;border-radius:12px;display:grid;place-content:center;text-align:center;gap:8px"><b style="font-size:34px;font-weight:500;letter-spacing:-.03em">여기서 시작하세요.</b><span style="opacity:.45;font-size:20px">글, 이미지, 영상, 갤러리를 자유롭게 놓을 수 있습니다.</span></div>';
    } },
    { name: "와이어프레임 W102", n: 2, bg: "#fff", ink: "#111", html: function () {
      return row(N, "작업, 정보, 이메일", CLOCK) + wf("left:460px;top:90px;width:520px;height:620px") + lines("left:28px;top:740px;width:500px", ["40%", "90%", "70%"]) + lines("left:760px;top:740px;width:640px", ["100%", "95%", "60%"]);
    } },
    { name: "와이어프레임 W203", n: 3, bg: "#fff", ink: "#111", html: function () {
      var cells = ""; for (var i = 0; i < 8; i++) cells += '<div style="display:grid;gap:8px"><div class="wf in" style="--ar:4/3"></div><div class="wl" style="width:' + (40 + (i * 17) % 50) + '%"></div></div>';
      return row(N, "작업 · 정보 · 이메일", "인스타그램 ↗") + '<div style="position:absolute;left:28px;right:28px;top:84px;display:grid;grid-template-columns:repeat(4,1fr);gap:30px 16px">' + cells + '</div>';
    } },
    { name: "와이어프레임 W304", n: 2, bg: "#f4f4f4", ink: "#111", html: function () {
      return row(N, "작업 · 정보", "이메일") + wf("left:200px;right:200px;top:90px;height:620px;background-color:#e9e9e9") + '<span style="position:absolute;left:80px;top:390px;font-size:34px;opacity:.35">←</span><span style="position:absolute;right:80px;top:390px;font-size:34px;opacity:.35">→</span><div style="position:absolute;left:0;right:0;top:740px;text-align:center" class="m dim">01 / 08</div>';
    } },
    { name: "와이어프레임 W405", n: 4, bg: "#fff", ink: "#111", html: function () {
      var rows = ""; for (var i = 0; i < 14; i++) rows += '<div style="display:grid;grid-template-columns:1.2fr 1.6fr 1fr 60px;gap:20px;padding:9px 0;border-bottom:1px solid #eee"><div class="wl" style="width:' + (50 + i * 7 % 40) + '%"></div><div class="wl" style="width:' + (40 + i * 13 % 50) + '%"></div><div class="wl" style="width:60%"></div><div class="wl"></div></div>';
      return row(N, "색인", "정보") + '<div style="position:absolute;left:28px;width:840px;top:90px">' + rows + '</div>' + wf("left:900px;right:28px;top:90px;height:540px");
    } },
    { name: "와이어프레임 W506", n: 2, bg: "#fff", ink: "#111", html: function () {
      return '<div style="position:absolute;left:28px;top:22px;width:340px;display:grid;gap:22px;font-size:16px"><b class="tp-name">' + N + '</b></div>' + lines("left:28px;top:80px;width:340px", ["60%", "80%", "50%", "70%", "40%"]) + lines("left:28px;top:300px;width:340px", ["100%", "100%", "90%", "95%", "60%"]) + wf("left:400px;right:28px;top:22px;bottom:22px");
    } },
    { name: "와이어프레임 W607", n: 3, bg: "#fff", ink: "#111", html: function () {
      return row(N, "작업 · 정보 · 이메일", "") +
        '<div style="position:absolute;left:28px;right:28px;top:84px;display:grid;grid-template-columns:2fr 1fr 1.3fr;gap:16px;height:360px">' + '<div class="wf" style="position:relative"></div><div class="wf" style="position:relative"></div><div class="wf" style="position:relative"></div></div>' +
        '<div style="position:absolute;left:28px;right:28px;top:470px;display:grid;grid-template-columns:1fr 1.5fr 2fr;gap:16px;height:360px"><div class="wf" style="position:relative"></div><div class="wf" style="position:relative"></div><div class="wf" style="position:relative"></div></div>';
    } },
    { name: "와이어프레임 W708", n: 2, bg: "#fcfcfc", ink: "#111", html: function () {
      return row(N, "", "정보, 이메일") + lines("left:28px;top:100px;width:900px;gap:22px", ["70%", "55%"], "70px") +
        lines("left:28px;top:330px;width:560px", ["100%", "96%", "90%", "70%"]) + wf("right:28px;top:330px;width:520px;height:460px");
    } }
  ];

  F.populated = [
    { name: "채워진 템플릿 P101", n: 3, bg: "#fcfcfc", ink: "#111", html: function () {
      return row(N + " 건축", "프로젝트 · 사무소 · 연락", "") + ph("int-skylight-tree", "left:28px;right:28px;top:72px;height:430px") +
        '<div style="position:absolute;left:28px;top:516px;font-size:17px"><b style="font-weight:500">문래 공공 도서관</b>&nbsp;&nbsp;<span class="dim">2026 · 서울</span></div>' +
        grid([["arch-grid-facade", "격자 외벽"], ["int-stairs", "계단"], ["int-m2", "M2"], ["arch-concrete-blocks", "콘크리트 블록"]], "left:28px;right:28px;top:570px", "repeat(4,1fr)", "4 / 3");
    } },
    { name: "채워진 템플릿 P202", n: 3, bg: "#111", ink: "#eee", html: function () {
      return row(N, "사진 · 전시 · 연락", CLOCK) +
        grid([["pt-bw-woman", "초상 I", "3 / 4"], ["sh-walker", "걷는 사람", "4 / 3"], ["ld-dune-bw", "사구", "4 / 3"], ["pt-bw-man", "초상 II", "3 / 4"]], "left:28px;right:28px;top:80px;align-items:end", "0.75fr 1.33fr 1.33fr 0.75fr") +
        grid([["sh-bars", "빛의 창살", "4 / 3"], ["st-bw-roses", "장미", "4 / 3"], ["hd-bw", "손", "4 / 3"]], "left:28px;right:28px;top:520px", "repeat(3,1fr)");
    } },
    { name: "채워진 템플릿 P303", n: 2, bg: "#fff", ink: "#111", html: function () {
      return '<div style="position:absolute;left:28px;top:22px;width:420px;display:grid;gap:22px;font-size:17px"><b class="tp-name">' + N + ' 갤러리</b>' +
        '<div style="font-size:44px;font-weight:500;letter-spacing:-.04em;line-height:1.1">사물의 시간<br><span class="dim">Time of Objects</span></div>' +
        '<div class="m" style="font-size:15px;line-height:1.7">2026. 10. 02 — 11. 15<br>화–일 11:00 — 19:00<br>입장 무료</div><p style="opacity:.75">손과 그릇, 빛에 관한 사진 여덟 점을 모은 전시입니다.</p></div>' +
        ph("sc-hand", "left:480px;top:22px;width:450px;bottom:22px") + ph("cer-dark-jug", "left:950px;right:28px;top:22px;height:420px") + ph("cer-cup-speckle", "left:950px;right:28px;top:462px;bottom:22px");
    } },
    { name: "채워진 템플릿 P404", n: 3, bg: "#f6f4f0", ink: "#1b1a14", html: function () {
      var items = [["cer-vases-beige", "백자 세 병", "₩ 128,000"], ["ch-tulip", "튤립 의자", "₩ 340,000"], ["gl-green", "녹색 유리 화병", "₩ 86,000"], ["cer-cup-speckle", "점박이 컵", "₩ 34,000"],
        ["ch-yellow", "노란 의자", "₩ 420,000"], ["cer-blue-set", "푸른 도자 세트", "₩ 210,000"], ["gl-flower", "유리 꽃", "₩ 58,000"], ["st-yellow-jars", "노란 항아리", "₩ 96,000"]];
      return row(N + " 상점", "전체 · 도자 · 가구 · 유리", "장바구니 (0)") +
        '<div style="position:absolute;left:28px;right:28px;top:80px;display:grid;grid-template-columns:repeat(4,1fr);gap:30px 16px">' + items.map(function (x) {
          return '<div style="display:grid;gap:8px"><div style="aspect-ratio:1;background:#ece9e2;overflow:hidden"><img src="' + src(x[0]) + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div><div style="display:flex;justify-content:space-between;font-size:15px"><span>' + x[1] + '</span><span class="m">' + x[2] + '</span></div></div>';
        }).join("") + '</div>';
    } },
    { name: "채워진 템플릿 P505", n: 2, bg: "#000", ink: "#fff", html: function () {
      return ph("dn-blur", "inset:0") + row(N + " 스튜디오", "작업 · 소개", "문의") +
        '<h3 class="big" style="left:24px;bottom:110px;font-size:120px;font-weight:600">움직임의 잔상</h3><div style="position:absolute;left:28px;bottom:28px;font-size:17px;opacity:.8">무용 · 영상 · 2026</div>';
    } },
    { name: "채워진 템플릿 P606", n: 3, bg: "#fcfcfc", ink: "#111", html: function () {
      var cv = '<div style="display:grid;gap:6px">' + [["2026", "개인전 「사물의 시간」, 서울"], ["2025", "단체전 「표면」, 부산"], ["2024", "레지던시, 헬싱키"], ["2023", "사진집 『그림자 연구』 출간"]].map(function (x) { return '<div style="display:grid;grid-template-columns:70px 1fr;padding:6px 0;border-top:1px solid #e5e5e5"><span class="m dim">' + x[0] + '</span><span>' + x[1] + '</span></div>'; }).join("") + '</div>';
      return row(N, "작업 · 이력 · 연락", "") + '<div style="position:absolute;left:28px;top:90px;width:560px;display:grid;gap:22px;font-size:17px"><div style="font-size:56px;font-weight:600;letter-spacing:-.045em;line-height:1.05">' + N + '<br><span class="dim" style="font-weight:400">패션 사진가</span></div>' + cv + '</div>' +
        ph("fa-white-suit", "left:640px;right:28px;top:90px;height:470px") + grid([["fa-coat", "코트"], ["fa-profile", "옆모습"], ["fa-black-coat", "검은 코트"]], "left:640px;right:28px;top:590px", "repeat(3,1fr)", "4 / 3");
    } }
  ];

  F.populated = F.populated.concat([
    { name: "채워진 템플릿 P707", n: 3, bg: "#ffffff", ink: "#111", html: function () {
      return ph("fa-profile", "left:0;top:0;width:760px;bottom:0") +
        at("left:790px;right:28px;top:22px;display:flex;justify-content:space-between;font-size:15px", '<b class="tp-name">' + N + ' Journal</b><span>Issues · About</span>') +
        at("left:790px;right:28px;top:110px;font-family:var(--f-serif);font-size:76px;line-height:1;letter-spacing:-.02em", "The Face<br><i>in Profile</i>") +
        at("left:790px;right:28px;top:300px;font-family:var(--f-kserif);font-size:22px", ko("옆모습의 얼굴 — 저널 12호", "opacity:.6")) +
        at("left:790px;right:28px;top:380px;display:grid;grid-template-columns:1fr 1fr;gap:28px;font-family:var(--f-serif);font-size:17px;line-height:1.5",
          "<p>Issue twelve is about people who would rather not look at the camera. Eight photographers, one question: what does a portrait keep when the face turns away?</p><p>With essays on shadow, on the back of the head, and on the long history of the silhouette in print.</p>") +
        at("left:790px;bottom:24px;font-family:var(--mono);font-size:13px;opacity:.6", "No. 12 — Autumn 2026 — 148 pp.");
    } },
    { name: "채워진 템플릿 P808", n: 2, bg: "#efe9df", ink: "#2b2520", html: function () {
      return row(N + " Ceramics", "Shop · Studio · Classes", "Cart (0)") +
        ph("cer-shelf", "left:28px;top:80px;width:880px;height:560px") +
        at("left:940px;right:28px;top:80px;display:grid;gap:18px;font-size:17px;line-height:1.5", '<div style="font-size:54px;line-height:1;letter-spacing:-.04em;font-weight:500">Slow Wares</div>' +
          '<p>Hand-thrown stoneware from a two-person studio. Every piece is fired twice and glazed by hand, so no two are the same.</p>' + ko("둘이 운영하는 공방의 물레 성형 석기. 두 번 굽고 손으로 유약을 입힙니다.", "opacity:.6;font-size:15px") +
          '<span style="border-top:1px solid;padding-top:12px">New batch — 12 cups, 6 jugs</span>') +
        at("left:28px;right:28px;top:668px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px", ["cer-cup-speckle", "cer-dark-jug", "cer-vases-beige", "cer-blue-set", "st-yellow-jars"].map(function (c, i) {
          return '<div style="display:grid;gap:6px"><div style="aspect-ratio:4/3;overflow:hidden"><img src="' + src(c) + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div><div style="display:flex;justify-content:space-between;font-size:13px"><span>Piece 0' + (i + 1) + '</span><span class="m">₩ ' + (38 + i * 16) + ',000</span></div></div>';
        }).join(""));
    } },
    { name: "채워진 템플릿 P909", n: 4, bg: "#fcfcfc", ink: "#111", html: function () {
      var projects = [["Shadow Studies", "2026"], ["Walking North", "2025"], ["Glass, Water", "2025"], ["White Wall", "2024"], ["Palm House", "2023"], ["Bars of Light", "2022"], ["Night Shop", "2021"]];
      return row(N, "Index · Information", CLOCK) +
        at("left:28px;top:110px;width:560px;font-size:44px;line-height:1.16;letter-spacing:-.035em", projects.map(function (p, i) { return '<div style="display:flex;justify-content:space-between;' + (i === 1 ? "" : "opacity:.28") + '"><span>' + p[0] + '</span><span class="m" style="font-size:18px">' + p[1] + '</span></div>'; }).join("")) +
        at("left:28px;bottom:26px;font-size:15px", ko("사진 연작 색인 — 이름에 마우스를 올리면 사진이 바뀝니다", "opacity:.55")) +
        ph("sh-walker", "left:640px;right:28px;top:110px;bottom:70px");
    } },
    { name: "채워진 템플릿 P110", n: 3, bg: "#dfe0dc", ink: "#161616", html: function () {
      return row(N + " Architects", "Projects · Office · Press", "Contact") +
        at("left:28px;top:84px;font-size:220px;font-weight:600;letter-spacing:-.06em;line-height:.85", "07") +
        at("left:28px;top:300px;width:420px;font-size:18px;line-height:1.5", "<b style='font-weight:500'>House on a Slope</b><br>Gapyeong, 2026<br><br>A concrete house that follows the hill in four steps. Each floor is one room wide and opens to the valley.<br><br>" + ko("비탈의 집 — 언덕을 따라 네 단으로 놓인 콘크리트 주택.", "opacity:.6;font-size:15px")) +
        ph("arch-concrete-blocks", "left:500px;top:84px;width:450px;height:720px") + ph("int-stairs", "left:970px;right:28px;top:84px;height:350px") + ph("arch-steps-teal", "left:970px;right:28px;top:454px;height:350px");
    } },
    { name: "채워진 템플릿 P111", n: 3, bg: "#f7f6f2", ink: "#111", html: function () {
      var pins = [["st-tulip", 40, 90, 200, 260, -3], ["fa-yellow-sky", 280, 130, 230, 300, 2], ["gl-green", 540, 80, 210, 210, -2], ["ch-orange", 780, 120, 230, 260, 3], ["bk-red-fan", 1040, 90, 250, 190, -1],
        ["sh-palm", 60, 420, 240, 320, 2], ["cer-blue-set", 330, 470, 250, 220, -2], ["ab-waves-white", 610, 350, 220, 300, 1], ["hd-blue", 860, 420, 200, 280, -3], ["st-coffee", 1100, 330, 240, 240, 2]];
      return row(N + " Moodboard", "Spring 2027", "1 / 4") +
        pins.map(function (p) { return '<div style="position:absolute;left:' + p[1] + 'px;top:' + p[2] + 'px;width:' + p[3] + 'px;height:' + p[4] + 'px;transform:rotate(' + p[5] + 'deg);box-shadow:0 10px 24px -12px rgba(0,0,0,.35);overflow:hidden"><img src="' + src(p[0]) + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>'; }).join("") +
        at("left:28px;bottom:22px;font-size:15px", "Colour, glass, hands and paper — references for the spring collection. " + ko("봄 컬렉션 레퍼런스", "opacity:.55"));
    } },
    { name: "채워진 템플릿 P112", n: 2, bg: "#0b0b0b", ink: "#f0f0f0", html: function () {
      return ph("dn-jump", "left:0;top:0;width:900px;bottom:0") +
        at("left:930px;right:28px;top:22px;display:flex;justify-content:space-between;font-size:15px", '<b class="tp-name">' + N + ' Dance Company</b><span>Tour · Company</span>') +
        at("left:930px;right:28px;top:120px;font-family:var(--f-cond);font-stretch:62%;font-weight:800;font-size:128px;line-height:.88;text-transform:uppercase", "Weight<br>of Air") +
        at("left:930px;right:28px;top:380px;font-size:18px;line-height:1.5", "A new work for six dancers.<br>Premiere at Seongsu Stage, Seoul, 14 March 2027.<br><br>" + ko("여섯 무용수를 위한 신작 — 2027년 3월 14일 초연", "opacity:.6;font-size:15px")) +
        at("left:930px;right:28px;bottom:28px;display:grid;gap:6px;font-size:15px", ["14 Mar — Seoul", "22 Mar — Busan", "05 Apr — Tokyo", "19 Apr — Taipei"].map(function (d, i) { return '<div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.2);padding-top:6px"><span>' + d + '</span><span style="opacity:.6">' + (i ? "Tickets ↗" : "Sold out") + '</span></div>'; }).join(""));
    } }
  ]);

  F.blank = F.blank.concat([
    { name: "와이어프레임 W809", n: 3, bg: "#fff", ink: "#111", html: function () {
      var b = [[40, 90, 200, 260], [280, 130, 230, 300], [540, 80, 210, 210], [780, 120, 230, 260], [1040, 90, 250, 190], [60, 420, 240, 320], [330, 470, 250, 220], [610, 350, 220, 300], [860, 420, 200, 280], [1100, 330, 240, 240]];
      return row(N, "", "1 / 4") + b.map(function (x) { return wf("left:" + x[0] + "px;top:" + x[1] + "px;width:" + x[2] + "px;height:" + x[3] + "px"); }).join("");
    } },
    { name: "와이어프레임 W910", n: 2, bg: "#fff", ink: "#111", html: function () {
      var rows = ""; for (var i = 0; i < 7; i++) rows += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #eee"><div class="wl" style="width:' + (40 + i * 11 % 40) + '%;height:26px;' + (i === 1 ? "background:#cfcfcf" : "") + '"></div><div class="wl" style="width:60px"></div></div>';
      return row(N, "색인 · 정보", CLOCK) + '<div style="position:absolute;left:28px;top:100px;width:560px">' + rows + '</div>' + wf("left:640px;right:28px;top:100px;bottom:70px");
    } },
    { name: "와이어프레임 W011", n: 2, bg: "#fff", ink: "#111", html: function () {
      return wf("left:0;top:0;width:760px;bottom:0") + '<div style="position:absolute;left:790px;top:22px"><b class="tp-name">' + N + '</b></div>' +
        lines("left:790px;right:28px;top:110px", ["80%", "55%"], "60px") + lines("left:790px;right:28px;top:380px", ["100%", "96%", "90%", "94%", "70%"]);
    } },
    { name: "와이어프레임 W112", n: 3, bg: "#fff", ink: "#111", html: function () {
      var cells = ""; for (var i = 0; i < 5; i++) cells += '<div style="display:grid;gap:6px"><div class="wf in" style="--ar:4/3"></div><div class="wl" style="width:70%"></div></div>';
      return row(N, "상점 · 공방 · 수업", "장바구니 (0)") + wf("left:28px;top:80px;width:880px;height:560px") + lines("left:940px;right:28px;top:80px", ["60%", "100%", "95%", "80%", "50%"], "22px") +
        '<div style="position:absolute;left:28px;right:28px;top:668px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px">' + cells + '</div>';
    } }
  ]);

  /* ---------- graduation show: made for showing finished work online ----------
     Each can carry an init(root, live) that wires up its interaction.
     live = true in the large preview and the shuffle stage; cards stay still. */
  var SCHOOL = "College of Art & Design";
  function gradHead(sub) {
    return at("left:28px;right:28px;top:22px;display:grid;grid-template-columns:1fr auto 1fr;font-size:15px",
      '<b class="tp-name">' + N + '</b><span>Graduation Show 2026' + (sub ? " — " + sub : "") + '</span><span style="text-align:right">Works · Artists · Visit</span>');
  }
  function label(t, meta, koT) {
    return '<div style="display:grid;gap:6px;font-size:16px;line-height:1.45"><b style="font-weight:600;font-size:22px;letter-spacing:-.02em">' + t + '</b><span style="opacity:.65">' + meta + '</span>' + (koT ? ko(koT, "opacity:.55;font-size:15px") : "") + '</div>';
  }
  var HAND = '<svg viewBox="0 0 24 24" style="width:1.1em;height:1.1em;vertical-align:-.2em" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>';

  /* raking light: relight a painting from its own brightness, as if a lamp moved across it */
  function rakingLight(root, live) {
    var cv = root.querySelector("canvas.rake");
    if (!cv || cv.dataset.on) return;
    cv.dataset.on = 1;
    var img = new Image();
    img.onload = function () {
      var gl = cv.getContext("webgl", { preserveDrawingBuffer: true });
      if (!gl) return;
      var vs = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0,1);}";
      var fs = "precision mediump float;varying vec2 uv;uniform sampler2D t;uniform vec2 px;uniform vec3 L;uniform float k;" +
        "float h(vec2 o){vec3 c=texture2D(t,uv+o*px).rgb;return dot(c,vec3(.3,.59,.11));}" +
        "void main(){float dx=h(vec2(1,0))-h(vec2(-1,0));float dy=h(vec2(0,1))-h(vec2(0,-1));" +
        "vec3 n=normalize(vec3(-dx*k,-dy*k,1.));vec3 l=normalize(L);vec3 c=texture2D(t,uv).rgb;" +
        "float d=max(dot(n,l),0.);float s=pow(max(dot(reflect(-l,n),vec3(0,0,1)),0.),24.);" +
        "gl_FragColor=vec4(c*(.18+d*1.05)+vec3(s*.35),1.);}";
      function sh(type, s) { var o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); return o; }
      var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.uniform2f(gl.getUniformLocation(pr, "px"), 1.6 / img.width, 1.6 / img.height);
      gl.uniform1f(gl.getUniformLocation(pr, "k"), 9.0);
      var uL = gl.getUniformLocation(pr, "L");
      function draw(x, y) { gl.viewport(0, 0, cv.width, cv.height); gl.uniform3f(uL, x, y, 0.55); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      draw(-0.8, 0.5);
      if (!live) return;
      var wrap = cv.parentNode;
      wrap.style.cursor = "crosshair";
      wrap.addEventListener("pointermove", function (e) {
        var r = cv.getBoundingClientRect();
        draw(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      });
      var t0 = performance.now(), idle = true;
      wrap.addEventListener("pointerenter", function () { idle = false; });
      (function sweep(t) { if (!document.body.contains(cv)) return; if (idle) { var a = (t - t0) / 1600; draw(Math.cos(a) * .9, Math.sin(a * .7) * .6); } requestAnimationFrame(sweep); })(t0);
    };
    img.src = src(cv.dataset.img);
  }

  /* before / after: drag to compare the underdrawing with the finished piece */
  function beforeAfter(root, live) {
    var box = root.querySelector(".ba"); if (!box || !live || box.dataset.on) return;
    box.dataset.on = 1;
    var top = box.querySelector(".ba-top"), bar = box.querySelector(".ba-bar");
    function set(e) { var r = box.getBoundingClientRect(); var p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); top.style.clipPath = "inset(0 " + ((1 - p) * 100) + "% 0 0)"; bar.style.left = p * 100 + "%"; }
    box.addEventListener("pointermove", set);
    box.addEventListener("pointerdown", set);
  }

  /* loupe: a round lens that magnifies the brushwork under the pointer */
  function loupe(root, live) {
    var box = root.querySelector(".lp"); if (!box || !live || box.dataset.on) return;
    box.dataset.on = 1;
    var lens = box.querySelector(".lens");
    box.addEventListener("pointermove", function (e) {
      var r = box.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      lens.style.left = fx * 100 + "%"; lens.style.top = fy * 100 + "%";
      lens.style.backgroundPosition = (fx * 100) + "% " + (fy * 100) + "%";
      lens.style.opacity = 1;
    });
    box.addEventListener("pointerleave", function () { lens.style.opacity = 0; });
  }

  /* light of the day: the room is lit by the current minute of 1440 */
  function dayLight(root) {
    var el = root.querySelector(".daylight"); if (!el) return;
    var d = new Date(), m = d.getHours() * 60 + d.getMinutes(), f = m / 1440;
    var sun = Math.sin(f * Math.PI * 2 - Math.PI / 2) * .5 + .5;
    el.style.setProperty("--sun", sun.toFixed(3));
    el.style.setProperty("--ang", (f * 360 - 90).toFixed(1) + "deg");
    var t = root.querySelector(".daylight-t"); if (t) t.textContent = String(m + 1).padStart(4, "0") + "/1440";
  }

  /* docent: captions follow the (sample) talk */
  function docent(root, live) {
    var btn = root.querySelector(".dc-play"); if (!btn || !live || btn.dataset.on) return;
    btn.dataset.on = 1;
    var lines = root.querySelectorAll(".dc-line"), i = -1, timer = null;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (timer) { clearInterval(timer); timer = null; btn.textContent = "▶ Play"; return; }
      btn.textContent = "❚❚ Pause";
      timer = setInterval(function () { i = (i + 1) % lines.length; lines.forEach(function (l, k) { l.style.opacity = k === i ? 1 : .3; }); }, 1600);
    });
  }

  /* guestbook: leave a note on the wall (kept in this browser only) */
  function guestbook(root, live) {
    var f = root.querySelector(".gb-form"); if (!f || !live || f.dataset.on) return;
    f.dataset.on = 1;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = f.querySelector("input").value.trim(); if (!v) return;
      var n = document.createElement("div"); n.className = "gb-note"; n.textContent = v;
      n.style.cssText = "background:#fff3a6;padding:14px;font-size:17px;transform:rotate(" + (Math.random() * 6 - 3) + "deg);box-shadow:0 6px 14px -8px rgba(0,0,0,.4)";
      root.querySelector(".gb-wall").prepend(n); f.reset();
    });
  }

  /* scale: switch between the artwork alone and next to a person */
  function scaleToggle(root, live) {
    var b = root.querySelector(".sc-toggle"); if (!b || !live || b.dataset.on) return;
    b.dataset.on = 1;
    b.addEventListener("click", function (e) { e.stopPropagation(); root.querySelector(".sc-stage").classList.toggle("with-person"); });
  }

  function mv(model, style, orbit) {
    return '<model-viewer src="assets/3d/' + model + '/' + model + '.gltf" ar ar-modes="webxr scene-viewer quick-look" camera-controls auto-rotate rotation-per-second="18deg" interaction-prompt="none" shadow-intensity="1" exposure="1.05" environment-image="neutral"' +
      (orbit ? ' camera-orbit="' + orbit + '"' : "") + ' style="position:absolute;' + style + ';background:transparent;--poster-color:transparent"></model-viewer>';
  }

  F.grad = [
    { desc: "빛 비추기 · 회화 질감", bg: "#0f0f0f", ink: "#efefef", init: rakingLight, html: function () {
      return gradHead("Painting") +
        '<div style="position:absolute;left:28px;top:80px;width:880px;height:760px;background:#000"><canvas class="rake" data-img="paint-ochre" width="880" height="760" style="width:100%;height:100%;display:block"></canvas></div>' +
        at("left:940px;right:28px;top:80px;display:grid;gap:24px", label("Afternoon, Held", "Oil on linen, 116.8 × 91 cm, 2026", "오후를 붙잡다 — 린넨에 유채") +
          '<p style="font-size:16px;line-height:1.55;opacity:.8">Move the light across the canvas. The ridges of paint catch it the way they would on a wall at four in the afternoon.</p>' +
          ko(HAND + " 마우스나 손가락으로 조명을 움직여 붓 자국의 두께를 보세요.", "font-size:15px;opacity:.7") +
          '<div style="font-size:14px;opacity:.55;border-top:1px solid rgba(255,255,255,.2);padding-top:12px">Kim Haneul · Painting, BFA</div>');
    } },
    { desc: "3D 뷰어 · 도자", bg: "#ece8e1", ink: "#1d1a16", html: function () {
      return gradHead("Ceramics") + '<div style="position:absolute;left:28px;top:80px;width:880px;height:760px;background:radial-gradient(ellipse at 50% 70%,#fff 0,#e4ded4 70%)"></div>' +
        mv("ceramic_vase_02", "left:28px;top:80px;width:880px;height:760px", "30deg 75deg 2.1m") +
        at("left:940px;right:28px;top:80px;display:grid;gap:24px", label("Vessel for One Flower", "Stoneware, celadon glaze, 32 × 18 cm", "꽃 한 송이를 위한 그릇 — 석기, 청자 유약") +
          '<p style="font-size:16px;line-height:1.55;opacity:.8">Turn it, look inside, check the foot. On a phone you can place it on your own table in AR.</p>' +
          ko("돌려 보고, 안을 들여다보고, 굽까지 확인하세요. 휴대폰에서는 AR로 내 책상 위에 놓아볼 수 있습니다.", "font-size:15px;opacity:.7") +
          '<div style="display:flex;gap:8px;font-size:13px">' + chip("360°") + chip("Zoom") + chip("AR") + '</div>');
    } },
    { desc: "3D 뷰어 · 조각 세 점", bg: "#1b1b1b", ink: "#eee", html: function () {
      return gradHead("Sculpture") +
        mv("marble_bust_01", "left:28px;top:90px;width:450px;height:620px", "20deg 80deg 1.1m") +
        mv("concrete_cat_statue", "left:495px;top:90px;width:450px;height:620px") +
        mv("antique_ceramic_vase_01", "left:962px;top:90px;width:450px;height:620px") +
        at("left:28px;right:28px;top:726px;display:grid;grid-template-columns:repeat(3,1fr);gap:17px",
          label("Head, After", "Marble, 58 cm", "그 후의 두상 — 대리석") + label("Cat, Waiting", "Cast concrete, 40 cm", "기다리는 고양이 — 콘크리트") + label("Old Jar, New Crack", "Earthenware, 36 cm", "오래된 항아리 — 토기"));
    } },
    { desc: "실제 크기 비교", bg: "#f4f3ef", ink: "#111", init: scaleToggle, html: function () {
      return gradHead("Scale") +
        '<div class="sc-stage" style="position:absolute;left:28px;top:80px;width:1000px;height:760px;border-bottom:2px solid #111">' +
          '<div style="position:absolute;left:260px;bottom:0;width:420px;height:560px;overflow:hidden;box-shadow:0 18px 30px -18px rgba(0,0,0,.5)"><img src="' + src("paint-knife") + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>' +
          '<div class="sc-dim" style="position:absolute;left:260px;bottom:572px;width:420px;border-top:1.5px solid;text-align:center;font-family:var(--mono);font-size:14px;padding-top:4px">130 cm</div>' +
          '<div class="sc-dim" style="position:absolute;left:692px;bottom:0;height:560px;border-left:1.5px solid;writing-mode:vertical-rl;font-family:var(--mono);font-size:14px;padding-left:4px">162 cm</div>' +
          '<svg class="sc-person" viewBox="0 0 60 170" style="position:absolute;left:780px;bottom:0;height:590px;fill:#111;opacity:.85"><circle cx="30" cy="14" r="11"/><path d="M16 32h28l6 58h-9l-3 80h-8l-2-58-2 58h-8l-3-80h-9z"/></svg>' +
        '</div>' +
        at("left:1060px;right:28px;top:80px;display:grid;gap:22px", label("Tide Table", "Acrylic and plaster on canvas, 162 × 130 cm", "조석표 — 캔버스에 아크릴, 석고") +
          '<p style="font-size:16px;line-height:1.55;opacity:.8">Seen next to a person 175 cm tall.</p>' + ko("키 175cm 사람과 나란히 본 실제 크기.", "font-size:15px;opacity:.65") +
          '<button type="button" class="sc-toggle" style="font:inherit;font-size:14px;padding:8px 14px;border:1px solid;border-radius:99px;background:none;cursor:pointer">Person on / off</button>');
    } },
    { desc: "작업 과정 전후", bg: "#ffffff", ink: "#111", init: beforeAfter, html: function () {
      return gradHead("Process") +
        '<div class="ba" style="position:absolute;left:28px;top:80px;width:1000px;height:760px;overflow:hidden;cursor:ew-resize">' +
          '<img src="' + src("paint-violet") + '" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">' +
          '<div class="ba-top" style="position:absolute;inset:0;clip-path:inset(0 50% 0 0)"><img src="' + src("paint-violet") + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(2.2) brightness(1.4)"></div>' +
          '<div class="ba-bar" style="position:absolute;top:0;bottom:0;left:50%;width:2px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.3)"><span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:#fff;color:#111;display:grid;place-items:center;font-size:18px">⇆</span></div>' +
          '<span style="position:absolute;left:16px;bottom:14px;color:#fff;font-size:14px;text-shadow:0 1px 3px #000">Underdrawing, week 2</span><span style="position:absolute;right:16px;bottom:14px;color:#fff;font-size:14px;text-shadow:0 1px 3px #000">Finished, week 14</span>' +
        '</div>' +
        at("left:1060px;right:28px;top:80px;display:grid;gap:22px", label("Weather Report", "Oil on canvas, 14 weeks", "일기예보 — 14주의 기록") +
          '<p style="font-size:16px;line-height:1.55;opacity:.8">Drag across the picture to go from the first underdrawing to the last layer.</p>' + ko("그림 위를 좌우로 움직여 밑그림과 완성작을 비교하세요.", "font-size:15px;opacity:.65"));
    } },
    { desc: "전시장 평면도", bg: "#f6f5f1", ink: "#111", html: function () {
      var rooms = [["A", 40, 40, 420, 300, "Painting", "Kim · Lee · Oh"], ["B", 480, 40, 300, 300, "Ceramics", "Park · Seo"], ["C", 800, 40, 360, 200, "Sculpture", "Jung · Han"], ["D", 800, 260, 360, 300, "Video", "Choi · Yoon"], ["E", 40, 360, 740, 200, "Design", "Kang · Lim · Shin"]];
      return gradHead("Floor Plan") +
        '<svg viewBox="0 0 1200 600" style="position:absolute;left:28px;top:90px;width:1040px;height:520px" font-family="Inter,Pretendard Variable,sans-serif">' +
          rooms.map(function (r) { return '<g class="room"><rect x="' + r[1] + '" y="' + r[2] + '" width="' + r[3] + '" height="' + r[4] + '" fill="#fff" stroke="#111" stroke-width="3"/><text x="' + (r[1] + 20) + '" y="' + (r[2] + 52) + '" font-size="44" font-weight="700">' + r[0] + '</text><text x="' + (r[1] + 20) + '" y="' + (r[2] + 88) + '" font-size="22">' + r[5] + '</text><text x="' + (r[1] + 20) + '" y="' + (r[2] + 118) + '" font-size="18" opacity=".55">' + r[6] + '</text></g>'; }).join("") +
          '<path d="M600 580v-20" stroke="#111" stroke-width="3"/><text x="560" y="598" font-size="16">Entrance</text></svg>' +
        at("left:1100px;right:28px;top:90px;display:grid;gap:18px", label("Visit", "3rd floor, Building 2<br>June 5 — 14, 2026, 10 — 18", "2관 3층, 6월 5일 — 14일") +
          '<p style="font-size:15px;line-height:1.5;opacity:.75">Choose a room to see who is showing there.</p>' + ko("방을 누르면 그 방의 작가와 작업이 보입니다.", "font-size:14px;opacity:.6")) +
        at("left:28px;right:28px;bottom:24px;font-size:14px;opacity:.6", SCHOOL + " · 42 graduates · 5 rooms");
    } },
    { desc: "졸업생 명단 벽", bg: "#111", ink: "#f1f1f1", html: function () {
      var names = ["Kim Haneul", "Lee Dohyun", "Oh Mina", "Park Seoyun", "Seo Jiwoo", "Jung Woojin", "Han Sora", "Choi Yerin", "Yoon Jae", "Kang Minho", "Lim Dain", "Shin Hayoung", "Baek Siwoo", "Ryu Nari", "Moon Gaeun", "Hwang Eunbi", "Song Taeho", "Jeon Haru"];
      var majors = ["Painting", "Ceramics", "Sculpture", "Video", "Design", "Printmaking"];
      var imgs = ["paint-ochre", "cer-vases-beige", "sc-kintsugi", "dn-blur", "bk-red-fan", "paint-grey"];
      return gradHead("Artists") +
        at("left:28px;top:84px;width:880px;columns:2;column-gap:40px;font-size:40px;line-height:1.18;letter-spacing:-.03em", names.map(function (n, i) { return '<div style="' + (i === 3 ? "" : "opacity:.35") + '">' + n + ' <span style="font-size:15px;opacity:.6;letter-spacing:0">' + majors[i % 6] + '</span></div>'; }).join("")) +
        ph(imgs[3], "left:940px;right:28px;top:84px;height:520px") +
        at("left:940px;right:28px;top:630px", label("Park Seoyun", "Video · Motion After Image, 2026", "박서윤 — 영상")) +
        at("left:28px;bottom:24px;font-size:14px;opacity:.55", "42 graduates " + ko("· 졸업생 42명 — 이름에 마우스를 올리면 작업이 보입니다", ""));
    } },
    { desc: "루페 · 붓질 확대", bg: "#e9e6df", ink: "#141414", init: loupe, html: function () {
      return gradHead("Detail") +
        '<div class="lp" style="position:absolute;left:28px;top:80px;width:880px;height:760px;overflow:hidden;cursor:none">' +
          '<img src="' + src("paint-green") + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">' +
          '<div class="lens" style="position:absolute;left:50%;top:50%;width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:50%;border:3px solid #fff;box-shadow:0 10px 30px rgba(0,0,0,.4);background-image:url(' + src("paint-green") + ');background-size:400%;background-position:50% 50%;opacity:1;pointer-events:none;transition:opacity .2s"></div>' +
        '</div>' +
        at("left:940px;right:28px;top:80px;display:grid;gap:22px", label("Green Hour", "Oil on board, 60 × 72 cm", "초록의 시간 — 패널에 유채") +
          '<p style="font-size:16px;line-height:1.55;opacity:.8">A four-times loupe follows your pointer, so you can read each stroke the way you would up close in the room.</p>' + ko("4배 확대경으로 붓질 하나하나를 가까이에서 보세요.", "font-size:15px;opacity:.65"));
    } },
    { desc: "하루의 빛 · 1440", bg: "#faf7f0", ink: "#1a1712", init: dayLight, html: function () {
      return gradHead("Light") +
        '<div class="daylight" style="position:absolute;left:28px;top:80px;width:880px;height:760px;overflow:hidden;background:linear-gradient(var(--ang,120deg),rgba(255,214,150,calc(var(--sun,.6)*.55)),rgba(40,50,90,calc((1 - var(--sun,.6))*.6))),#d9d4c9">' +
          '<div style="position:absolute;left:250px;top:120px;width:380px;height:500px;box-shadow:calc((var(--sun,.6) - .5)*60px) 30px 40px rgba(0,0,0,.35)"><img src="' + src("paint-white") + '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>' +
        '</div>' +
        at("left:940px;right:28px;top:80px;display:grid;gap:22px", label("White Relief", "Plaster and pigment on panel, 90 × 70 cm", "흰 부조 — 패널에 석고, 안료") +
          '<p style="font-size:16px;line-height:1.55;opacity:.8">The room follows the real time of day: warm in the afternoon, blue after dark.</p>' + ko("전시실의 빛이 실제 시각을 따라 바뀝니다.", "font-size:15px;opacity:.65") +
          '<div class="daylight-t m" style="font-size:40px;letter-spacing:-.02em">0000/1440</div>');
    } },
    { desc: "오디오 도슨트", bg: "#f2efe8", ink: "#15130f", init: docent, html: function () {
      var t = ["I started with the smallest pot on the shelf.", "Each one is thrown to the width of my hand.", "The glaze runs where the kiln was hottest.", "I keep the cracked ones; they tell me the temperature.", "There are forty-two, one for every graduate this year."];
      return gradHead("Docent") + ph("cer-shelf", "left:28px;top:80px;width:760px;height:760px") +
        at("left:820px;right:28px;top:80px;display:grid;gap:20px", label("Forty-Two Cups", "Stoneware, installation, 2026", "마흔두 개의 컵 — 설치") +
          '<button type="button" class="dc-play" style="justify-self:start;font:inherit;font-size:15px;padding:10px 18px;border-radius:99px;border:0;background:#15130f;color:#f2efe8;cursor:pointer">▶ Play</button>' +
          '<div style="display:grid;gap:10px;font-size:22px;line-height:1.35;letter-spacing:-.01em">' + t.map(function (x, i) { return '<div class="dc-line" style="opacity:' + (i ? .3 : 1) + ';transition:opacity .4s">' + x + '</div>'; }).join("") + '</div>' +
          ko("작가가 직접 설명하는 도슨트. 재생하면 자막이 따라갑니다(예시).", "font-size:14px;opacity:.6"));
    } },
    { desc: "방명록 벽", bg: "#e7ecef", ink: "#111", init: guestbook, html: function () {
      var notes = ["Loved the blue room!", "The cups made me cry a little.", "Congratulations, class of 2026", "좋은 전시 감사합니다", "Come back in ten years", "The light piece at 4pm was perfect"];
      return gradHead("Guestbook") +
        at("left:28px;top:84px;font-size:90px;font-weight:700;letter-spacing:-.05em;line-height:.95", "Leave a<br>note") +
        at("left:32px;top:290px;width:400px;font-size:16px;line-height:1.5", "Say something to the graduates. Notes stay on the wall until the show closes.<br>" + ko("졸업생에게 한마디 남겨 주세요.", "opacity:.6")) +
        '<form class="gb-form" style="position:absolute;left:28px;top:420px;width:400px;display:flex;gap:8px"><input aria-label="메모" placeholder="Your note" style="flex:1;font:inherit;font-size:16px;padding:10px 12px;border:1px solid #111;background:#fff"><button style="font:inherit;font-size:15px;padding:10px 14px;border:0;background:#111;color:#fff;cursor:pointer">Pin</button></form>' +
        '<div class="gb-wall" style="position:absolute;left:470px;right:28px;top:84px;bottom:28px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-content:start">' +
          notes.map(function (n, i) { return '<div class="gb-note" style="background:' + ["#fff3a6", "#ffd1e0", "#cfe9ff"][i % 3] + ';padding:18px;font-size:19px;line-height:1.35;transform:rotate(' + [-2, 1.5, -1, 2, -1.5, 1][i] + 'deg);box-shadow:0 6px 14px -8px rgba(0,0,0,.4)">' + n + '</div>'; }).join("") + '</div>';
    } }
  ];

  /* ---------- the catalogue: 80 designs × 18 variants = 1440, numbered n/1440 ---------- */
  var PALETTES = [["#fcfcfc", "#111"], ["#f3efe6", "#1b1a14"], ["#141414", "#ececec"], ["#e8ebee", "#15181c"], ["#f4d9cf", "#2d1f1c"], ["#dfe8d5", "#1c2a17"], ["#1f3fd1", "#eef1ff"]];
  var TYPES = [
    { name: "그로테스크", font: "'Inter', 'Pretendard Variable', sans-serif", stretch: "100%" },
    { name: "콘덴스드", font: "'Archivo', 'Pretendard Variable', sans-serif", stretch: "75%" },
    { name: "세리프", font: "'Newsreader', 'Nanum Myeongjo', serif", stretch: "100%" }
  ];
  var ORDER = [
    ["feed", "기본", "기본 피드"], ["grid", "기본", "기본 그리드"], ["slide", "기본", "기본 슬라이드쇼"],
    ["grad", "졸업전시", "졸업전시"], ["graphic", "그래픽", "그래픽"], ["blank", "빈 템플릿", "와이어프레임"], ["populated", "채워진 템플릿", "채워진 템플릿"]
  ];
  var BASES = [], no = 1;
  ORDER.forEach(function (o) {
    F[o[0]].forEach(function (b, i) {
      b.fam = o[0]; b.cat = o[1]; b.label = b.desc || (o[2] + " " + String(i + 1).padStart(2, "0"));
      var own = [b.bg, b.ink];
      b.palettes = [own].concat(PALETTES.filter(function (p) { return p[0].toLowerCase() !== own[0].toLowerCase(); }).slice(0, 5));
      b.first = no; no += 18;
      BASES.push(b);
    });
  });
  var TOTAL = no - 1; /* 1440 */
  function pad(n) { return String(n).padStart(4, "0"); }
  function numOf(b, v) { return b.first + v; }
  function tag(n) { return pad(n) + "/1440"; }
  function find(n) {
    for (var i = 0; i < BASES.length; i++) { var b = BASES[i]; if (n >= b.first && n < b.first + 18) return { b: b, v: n - b.first }; }
    return null;
  }

  /* ---------- rendering a template ---------- */
  var ICON = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    fwd: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3h1.5v11h-13V10H7zm2 0h6V7a3 3 0 0 0-6 0v3z"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M19 12H5M10.5 6.5 5 12l5.5 5.5"/></svg>'
  };
  function pageFor(b, v) {
    var pal = b.palettes[Math.floor(v / 3)], ty = TYPES[v % 3];
    return '<div class="tp" style="--t-bg:' + pal[0] + ';--t-ink:' + pal[1] + ';--t-font:' + ty.font + ';--t-stretch:' + ty.stretch + '">' + b.html() + '</div>';
  }
  function windowFor(b, v) {
    return '<div class="mac" aria-hidden="true"><div class="mac-bar">' +
      '<div class="mac-left"><span class="lights"><i></i><i></i><i></i></span><span class="mac-nav">' + ICON.back + ICON.fwd + '</span></div>' +
      '<div class="mac-url">' + ICON.lock + '<span>' + esc(host) + '</span></div>' +
      '<div class="mac-tools">' + ICON.share + ICON.plus + '</div></div>' +
      '<div class="mac-view"><div class="canvas">' + pageFor(b, v) + '</div></div></div>';
  }

  var stars = {};
  try { stars = JSON.parse(localStorage.getItem("1440-stars") || "{}"); } catch (e) {}
  function saveStars() { try { localStorage.setItem("1440-stars", JSON.stringify(stars)); } catch (e) {} }

  function card(b, v) {
    v = v || 0;
    var n = numOf(b, v);
    return '<article class="tpl" data-n="' + n + '">' +
      '<button type="button" class="tpl-open" aria-label="' + tag(n) + ' 미리보기">' +
        '<div class="tpl-slot" data-n="' + n + '"><div class="mac mac-empty"><div class="mac-bar"></div><div class="mac-view"></div></div></div></button>' +
      '<div class="tpl-cap">' +
        '<span class="nm"><span class="no m">' + tag(n) + '</span><span class="dsc">' + b.label + '</span></span>' +
        '<button type="button" class="star" aria-pressed="' + (!!stars[n]) + '" aria-label="' + tag(n) + ' 즐겨찾기">' + (stars[n] ? "★" : "☆") + '</button></div></article>';
  }

  /* fill a card's window only when it comes near the screen, so 80 designs stay light */
  var ro = "ResizeObserver" in window ? new ResizeObserver(function (es) { es.forEach(function (e) { scale(e.target); }); }) : null;
  /* shrink the 1440 × 900 page with CSS zoom rather than transform: zoom changes layout,
     so the 3D viewer and pointer maths measure the page at the size it is shown */
  var ZOOM = CSS.supports && CSS.supports("zoom", "0.5");
  function scale(view) {
    var c = view.firstElementChild; if (!c || !view.clientWidth) return;
    var k = view.clientWidth / 1440;
    if (ZOOM) { c.style.zoom = k; c.style.transform = ""; } else c.style.transform = "scale(" + k + ")";
  }
  function fill(slot, live) {
    var f = find(+slot.dataset.n);
    slot.innerHTML = windowFor(f.b, f.v);
    var view = slot.querySelector(".mac-view");
    scale(view); if (ro) ro.observe(view);
    if (f.b.init) f.b.init(view, !!live);
    tick();
  }
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); fill(e.target); } });
  }, { rootMargin: "600px 0px" }) : null;
  function watch(scope) {
    (scope || document).querySelectorAll(".tpl-slot").forEach(function (s) {
      if (s.querySelector(".mac-empty")) { if (io) io.observe(s); else fill(s); }
    });
  }

  /* ---------- sections ---------- */
  var basic = document.getElementById("basicCols");
  basic.innerHTML = ["feed", "grid", "slide"].map(function (f) {
    var fam = BASES.filter(function (b) { return b.fam === f; });
    return '<div class="fam" data-fam="' + f + '"><h3 class="fam-t">' + { feed: "기본 피드", grid: "기본 그리드", slide: "기본 슬라이드쇼" }[f] + '</h3><div class="fam-card">' + card(fam[0]) + '</div>' +
      '<ul class="vlist">' + fam.map(function (b, i) { return '<li><button type="button" data-n="' + b.first + '" aria-current="' + (i === 0) + '">' + tag(b.first) + '</button></li>'; }).join("") + '</ul></div>';
  }).join("");
  basic.addEventListener("click", function (e) {
    var btn = e.target.closest(".vlist button"); if (!btn) return;
    var fam = btn.closest(".fam"), f = find(+btn.dataset.n);
    fam.querySelector(".fam-card").innerHTML = card(f.b, f.v);
    fam.querySelectorAll(".vlist button").forEach(function (x) { x.setAttribute("aria-current", x === btn); });
    watch(fam);
  });
  document.querySelectorAll(".row[data-family]").forEach(function (r) {
    r.innerHTML = BASES.filter(function (b) { return b.fam === r.dataset.family; }).map(function (b) { return card(b); }).join("");
  });
  function range(fams) {
    var bs = BASES.filter(function (b) { return fams.indexOf(b.fam) >= 0; });
    return tag(bs[0].first).slice(0, 4) + "–" + tag(bs[bs.length - 1].first + 17) + " · " + (bs.length * 18) + "개";
  }
  document.getElementById("basicN").textContent = range(["feed", "grid", "slide"]);
  document.querySelectorAll("[data-count]").forEach(function (el) { el.textContent = range([el.dataset.count]); });

  /* ---------- shuffle ---------- */
  var stage = document.getElementById("shuffleStage");
  var cur = 1 + Math.floor(Math.random() * TOTAL);
  function showShuffle() {
    var f = find(cur);
    stage.innerHTML = '<button type="button" class="shuffle-btn shuffle-prev" aria-label="이전 템플릿">' + ICON.prev + '</button>' + card(f.b, f.v) +
      '<button type="button" class="shuffle-btn shuffle-next" aria-label="다른 템플릿">' + ICON.next + '</button>';
    fill(stage.querySelector(".tpl-slot"), true);
    document.getElementById("shuffleNo").textContent = tag(cur);
    markPicked();
  }
  stage.addEventListener("click", function (e) {
    if (e.target.closest(".shuffle-next")) { cur = 1 + Math.floor(Math.random() * TOTAL); showShuffle(); }
    if (e.target.closest(".shuffle-prev")) { cur = cur > 1 ? cur - 1 : TOTAL; showShuffle(); }
  });

  /* ---------- live clocks inside the pages ---------- */
  function tick() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    var s = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    document.querySelectorAll("[data-clock]").forEach(function (n) { n.textContent = s; });
  }
  setInterval(tick, 1000);

  /* ---------- live preview: the page in the preview window works like a real site ----------
     menus open overlay pages, pictures open a quick view, slideshows, thumbnails and lists
     switch the picture, and a shop keeps a cart. Only in the preview; cards stay still. */
  var NAMES = {};
  [OBJ, PHOTO, SPACE, SKY].forEach(function (a) { a.forEach(function (x) { NAMES[x[0]] = x[1]; }); });
  var POOL = PHOTO.concat(SKY, SPACE, OBJ).map(function (x) { return x[0]; });
  var LINKS = [
    ["index", "Back Issues|Reading list|Exhibitions|Projects|Project|Selected|Archive|Writing|Issues|Index|Works|Work|Talks|Books|Shop|Photographs|작업|색인|프로젝트|전시|사진|상점"],
    ["info", "Information|Contributors|Company|Classes|Studio|Office|Press|About|Info|Artists|Words|정보|소개|이력|사무소|공방|수업"],
    ["contact", "Enquiries|Contact|Email|Mail|이메일|연락|문의"],
    ["cart", "장바구니|Cart"],
    ["out", "Newsletter|Subscribe|Instagram|Visit|Order|Tour|Map|인스타그램"]
  ];
  var LINK_RE = new RegExp("(^|[^A-Za-z가-힣])(" + LINKS.map(function (l) { return l[1]; }).join("|") + ")(\\s?(?:↗|\\(\\d+\\)))?(?=$|[^A-Za-z가-힣])", "gi");
  function kindOf(word, tail) {
    if (tail && tail.indexOf("↗") >= 0) return "out";
    for (var i = 0; i < LINKS.length; i++) if (new RegExp("^(" + LINKS[i][1] + ")$", "i").test(word)) return LINKS[i][0];
    return "out";
  }
  function fileOf(img) { var m = /([^\/]+)\.jpg/.exec(img.getAttribute("src") || ""); return m ? m[1] : ""; }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function isKo(s) { return /[가-힣]/.test(s); }

  /* menu words in the header and footer become links */
  function linkify(tp) {
    var cr = tp.getBoundingClientRect(), s = cr.height / 900 || 1, nodes = [], w = document.createTreeWalker(tp, NodeFilter.SHOW_TEXT), t;
    while ((t = w.nextNode())) nodes.push(t);
    nodes.forEach(function (t) {
      var el = t.parentElement;
      if (!el || el.closest(".lv-a, .ko, button")) return;
      LINK_RE.lastIndex = 0;
      if (!LINK_RE.test(t.nodeValue)) return;
      var r = el.getBoundingClientRect(), top = (r.top - cr.top) / s, bottom = (r.bottom - cr.top) / s;
      if (top > 100 && bottom < 820) return;
      LINK_RE.lastIndex = 0;
      var html = esc(t.nodeValue).replace(LINK_RE, function (m, pre, word, tail) {
        return pre + '<button type="button" class="lv-a" data-lv="' + kindOf(word, tail) + '">' + word + (tail || "") + '</button>';
      });
      t.replaceWith(document.createRange().createContextualFragment(html));
    });
    /* like Cargo, the site name opens the information page when there is no link for it */
    if (tp.querySelector('.lv-a[data-lv="info"]')) return;
    var name = (site || "이름").toLowerCase(), w2 = document.createTreeWalker(tp, NodeFilter.SHOW_TEXT);
    while ((t = w2.nextNode())) {
      var el2 = t.parentElement, v = t.nodeValue.trim();
      if (!v || v.toLowerCase().indexOf(name) < 0 || el2.closest(".lv-a, .ko, button")) continue;
      var r2 = el2.getBoundingClientRect(), top2 = (r2.top - cr.top) / s, bot2 = (r2.bottom - cr.top) / s;
      if (top2 > 100 && bot2 < 820) continue;
      var b2 = document.createElement("button");
      b2.type = "button"; b2.className = "lv-a"; b2.dataset.lv = "info"; b2.textContent = t.nodeValue;
      t.replaceWith(b2);
      return;
    }
  }

  /* every picture on the page, with the caption it carries */
  function gallery(tp) {
    var seen = {}, out = [];
    [].forEach.call(tp.querySelectorAll("img"), function (im) {
      if (im.closest(".lv-layer")) return;
      var s = im.getAttribute("src"); if (!s || seen[s]) return; seen[s] = 1;
      var gi = im.closest(".gi"), cap = gi && gi.querySelector("span") ? gi.querySelector("span").textContent.replace(/^\s*\d+/, "").trim() : (NAMES[fileOf(im)] || "");
      out.push({ src: s, cap: cap });
    });
    return out;
  }
  function poolItems(n, first) {
    var files = POOL.filter(function (f) { return f !== first; });
    if (first) files.unshift(first);
    return files.slice(0, n).map(function (f) { return { src: src(f), cap: NAMES[f] || "" }; });
  }

  function layer(tp, cls, html) {
    var keepIndex = cls.indexOf("lv-lb") >= 0;
    [].forEach.call(tp.querySelectorAll(".lv-layer"), function (l) { if (!(keepIndex && l.classList.contains("lv-index"))) l.remove(); });
    var d = document.createElement("div");
    d.className = "lv-layer " + cls;
    d.innerHTML = html;
    tp.appendChild(d);
    return d;
  }
  function closeTop(tp) {
    var ls = tp.querySelectorAll(".lv-layer");
    if (ls.length) ls[ls.length - 1].remove();
    markOn(tp);
  }
  function markOn(tp, kind) {
    [].forEach.call(tp.querySelectorAll(".lv-a"), function (a) { a.classList.toggle("on", !!kind && a.dataset.lv === kind && !!tp.querySelector(".lv-layer")); });
  }
  function toast(tp, msg) {
    var old = tp.querySelector(".lv-toast"); if (old) old.remove();
    var d = document.createElement("div"); d.className = "lv-toast"; d.textContent = msg; tp.appendChild(d);
    setTimeout(function () { d.remove(); }, 2200);
  }
  function mail() { return "hello@" + host; }

  function openInfo(tp, ko) {
    var cv = ko
      ? [["2026", "개인전 「하루의 표면」, 서울"], ["2025", "단체전 「빛과 그릇」, 부산"], ["2024", "레지던시, 제주"], ["2023", "작업집 『1,440분』 출간"]]
      : [["2026", "Solo show, The Surface of a Day, Seoul"], ["2025", "Group show, Light and Vessels, Busan"], ["2024", "Residency, Jeju"], ["2023", "Book, 1,440 Minutes"]];
    layer(tp, "lv-side",
      '<div class="lv-top"><span>' + (ko ? "정보" : "Information") + '</span><button type="button" class="lv-x">' + (ko ? "닫기" : "Close") + ' ✕</button></div>' +
      '<b class="lv-h">' + N + '</b>' +
      (ko ? '<p>서울에서 사진과 사물, 책을 만듭니다. 작은 출판사와 갤러리, 작업실과 함께 일합니다.</p>'
          : '<p>Makes photographs, objects and books in Seoul, working with small publishers, galleries and studios.</p><p class="ko" style="opacity:.55">서울에서 사진과 사물, 책을 만듭니다.</p>') +
      '<dl class="lv-dl">' + cv.map(function (c) { return '<div><dt class="m">' + c[0] + '</dt><dd>' + c[1] + '</dd></div>'; }).join("") + '</dl>' +
      '<div class="lv-links"><button type="button" class="lv-a" data-lv="contact">' + esc(mail()) + '</button><button type="button" class="lv-a" data-lv="out">' + (ko ? "인스타그램" : "Instagram") + ' ↗</button></div>');
    markOn(tp, "info");
  }
  function openIndex(tp, ko) {
    var items = gallery(tp); if (items.length < 3) items = poolItems(8);
    items = items.slice(0, 10);
    var d = layer(tp, "lv-index",
      '<div class="lv-top"><span>' + (ko ? "작업" : "Index") + ' <span class="m" style="opacity:.5">(' + items.length + ')</span></span><button type="button" class="lv-x">' + (ko ? "닫기" : "Close") + ' ✕</button></div>' +
      '<ol>' + items.map(function (it, i) { return '<li><button type="button" class="lv-row' + (i ? "" : " on") + '" data-i="' + i + '"><span class="m">' + pad2(i + 1) + '</span><span>' + (it.cap || (ko ? "무제" : "Untitled")) + '</span><span class="m">' + (2026 - (i % 5)) + '</span></button></li>'; }).join("") + '</ol>' +
      '<div class="lv-idx-img"><img src="' + items[0].src + '" alt=""></div>');
    d._items = items;
    markOn(tp, "index");
  }
  function openCart(tp, ko) {
    var cart = tp._lv.cart;
    layer(tp, "lv-side",
      '<div class="lv-top"><span>' + (ko ? "장바구니" : "Cart") + ' (' + cart.length + ')</span><button type="button" class="lv-x">' + (ko ? "닫기" : "Close") + ' ✕</button></div>' +
      (cart.length ? '<div class="lv-cart">' + cart.map(function (c) { return '<div><img src="' + c.src + '" alt=""><span>' + (c.cap || "—") + '</span></div>'; }).join("") + '</div>' +
        '<button type="button" class="lv-btn lv-pay" data-lv="pay">' + (ko ? "결제하기" : "Checkout") + ' →</button>'
        : '<p style="opacity:.6">' + (ko ? "장바구니가 비어 있습니다. 사진을 눌러 담아 보세요." : "Your cart is empty. Open a picture to add it.") + '</p>'));
    markOn(tp, "cart");
  }
  function openLightbox(tp, items, i) {
    var st = tp._lv, ko = st.ko;
    var d = layer(tp, "lv-lb",
      '<button type="button" class="lv-btn lv-nav" data-d="-1" aria-label="이전">←</button><figure><img alt=""></figure><button type="button" class="lv-btn lv-nav" data-d="1" aria-label="다음">→</button>' +
      '<div class="lv-cap"><span class="c"></span><span class="m n"></span><span class="r">' +
        (st.shop ? '<button type="button" class="lv-a lv-add" data-lv="add">' + (ko ? "장바구니에 담기" : "Add to cart") + '</button>' : "") +
        '<button type="button" class="lv-a lv-x">' + (ko ? "닫기" : "Close") + ' ✕</button></span></div>');
    d._items = items; d._i = i;
    showLb(d);
  }
  function showLb(d) {
    var it = d._items[d._i], im = d.querySelector("figure img");
    im.src = it.src; im.classList.remove("lv-fade"); void im.offsetWidth; im.classList.add("lv-fade");
    d.querySelector(".c").textContent = it.cap || "";
    d.querySelector(".n").textContent = pad2(d._i + 1) + " / " + pad2(d._items.length);
  }
  function lbStep(d, k) { d._i = (d._i + k + d._items.length) % d._items.length; showLb(d); }
  function updateCart(tp) {
    var n = tp._lv.cart.length;
    [].forEach.call(tp.querySelectorAll('.lv-a[data-lv="cart"]'), function (a) { a.textContent = a.textContent.replace(/\(\d+\)/, "(" + n + ")"); });
  }

  /* slideshow: a counter like "03 / 08" or ← → arrows drive the largest picture */
  function swap(img, s) {
    if (!img) return;
    img.src = s; img.classList.remove("lv-fade"); void img.offsetWidth; img.classList.add("lv-fade");
  }
  function setupSlides(tp, st) {
    var imgs = [].slice.call(tp.querySelectorAll("img")), area = function (im) { var r = im.getBoundingClientRect(); return r.width * r.height; };
    st.main = imgs.sort(function (a, b) { return area(b) - area(a); })[0] || null;
    var counter = [].filter.call(tp.querySelectorAll(".m"), function (m) { return /^\s*\d{1,2} \/ \d{1,2}\s*$/.test(m.textContent); })[0] ||
      [].filter.call(tp.querySelectorAll("span, div"), function (m) { return !m.children.length && /^\s*\d{1,2} \/ \d{1,2}\s*$/.test(m.textContent); })[0];
    var arrows = [].filter.call(tp.querySelectorAll("span, div"), function (el) { return !el.children.length && /^[←→]$/.test(el.textContent.trim()); });
    if (!st.main || (!counter && !arrows.length)) return;
    var cur = 1, total = 8;
    if (counter) { var m = /(\d+) \/ (\d+)/.exec(counter.textContent); cur = +m[1]; total = +m[2]; counter.classList.add("lv-hot"); counter.dataset.step = 1; st.two = m[1].length === 2; }
    var items = poolItems(total, fileOf(st.main));
    items.unshift.apply(items, items.splice(total - (cur - 1)));   /* the picture on show sits at its own number */
    st.slide = { items: items, i: cur - 1, counter: counter };
    arrows.forEach(function (a) { a.classList.add("lv-hot"); a.dataset.step = a.textContent.trim() === "←" ? -1 : 1; });
  }
  function slideStep(st, k) {
    var sl = st.slide; sl.i = (sl.i + k + sl.items.length) % sl.items.length;
    var it = sl.items[sl.i];
    swap(st.main, it.src);
    if (sl.counter) {
      sl.counter.textContent = st.two ? pad2(sl.i + 1) + " / " + pad2(sl.items.length) : (sl.i + 1) + " / " + sl.items.length;
      var cap = sl.counter.nextSibling;
      if (cap && cap.nodeType === 3 && cap.nodeValue.trim()) cap.nodeValue = "  " + (it.cap || "");
    }
  }

  /* lists and thumbnail strips: one bright item among dimmed ones picks the picture */
  function setupLists(tp, st) {
    st.lists = [];
    [].forEach.call(tp.querySelectorAll("div"), function (el) {
      var ch = el.children, dim = 0, val = "";
      if (ch.length < 3) return;
      for (var i = 0; i < ch.length; i++) { var o = ch[i].style.opacity; if (o && +o <= 0.5) { dim++; val = o; } }
      if (dim < 2 || dim < ch.length - 1 || dim === ch.length) return;
      [].forEach.call(ch, function (c, i) { c.classList.add("lv-hot"); c.dataset.li = st.lists.length + ":" + i; });
      st.lists.push({ el: el, dim: val });
    });
  }
  function listPick(tp, st, li, i) {
    var L = st.lists[li], ch = L.el.children, c = ch[i];
    [].forEach.call(ch, function (x, k) {
      x.style.opacity = k === i ? "" : L.dim;
      if (x.querySelector("img")) x.style.outline = k === i ? "2px solid currentColor" : "none";
    });
    var im = c.querySelector("img"), f = im ? fileOf(im) : "";
    if (!f) for (var k in NAMES) if (c.textContent.indexOf(NAMES[k]) >= 0) { f = k; break; }
    if (!f) f = POOL[i % POOL.length];
    if (st.main && !(im && im === st.main)) swap(st.main, src(f));
  }

  function liven(view, b) {
    var tp = view.querySelector(".tp"); if (!tp) return;
    linkify(tp);
    var st = tp._lv = { cart: [], ko: isKo(tp.querySelector(".lv-a") ? tp.querySelector(".lv-a").textContent : "작업"), own: !!b.init };
    st.shop = !!tp.querySelector('.lv-a[data-lv="cart"]');
    if (!st.own) { setupSlides(tp, st); setupLists(tp, st); }
    /* type specimen: the big word is a type tester */
    [].forEach.call(tp.querySelectorAll("div"), function (el) {
      if (el.children.length || el.textContent !== "Archivo" || !/font-size:\s*2\d\dpx/.test(el.getAttribute("style") || "")) return;
      el.contentEditable = "true"; el.spellcheck = false; el.classList.add("lv-edit"); el.title = "눌러서 직접 입력해 보세요";
    });
    var fx = st.own ? null : FX[b.name || b.desc || b.label];
    if (fx) { try { fx.run(tp, st); } catch (err) { if (window.console) console.error(err); } }

    tp.addEventListener("mouseover", function (e) {
      var row = e.target.closest(".lv-row");
      if (row) {
        var d = row.closest(".lv-index");
        d.querySelector(".lv-idx-img img").src = d._items[+row.dataset.i].src;
        [].forEach.call(d.querySelectorAll(".lv-row"), function (r) { r.classList.toggle("on", r === row); });
        return;
      }
      var li = e.target.closest("[data-li]");
      if (li && !li.querySelector("img") && !e.target.closest(".lv-layer")) { var p = li.dataset.li.split(":"); listPick(tp, st, +p[0], +p[1]); }
    });

    tp.addEventListener("click", function (e) {
      var t = e.target, lb = t.closest(".lv-lb");
      if (t.closest(".lv-x")) return closeTop(tp);
      var a = t.closest(".lv-a, .lv-pay");
      if (a) {
        var k = a.dataset.lv;
        if (a.closest(".lv-layer") == null) st.ko = isKo(a.textContent);
        if (k === "info") openInfo(tp, st.ko);
        else if (k === "index") openIndex(tp, st.ko);
        else if (k === "cart") openCart(tp, st.ko);
        else if (k === "contact") {
          try { navigator.clipboard.writeText(mail()); } catch (err) {}
          toast(tp, mail() + " 주소를 복사했습니다");
        }
        else if (k === "add") {
          var it = lb._items[lb._i]; st.cart.push(it); updateCart(tp);
          toast(tp, (it.cap ? it.cap + " — " : "") + "장바구니에 담았습니다 (" + st.cart.length + ")");
        }
        else if (k === "pay") toast(tp, "미리보기에서는 결제하지 않습니다");
        else toast(tp, "미리보기에서는 외부 링크가 열리지 않습니다");
        return;
      }
      if (lb) {
        var nav = t.closest(".lv-nav");
        if (nav) lbStep(lb, +nav.dataset.d);
        else if (t.tagName === "IMG") lbStep(lb, 1);
        else if (!t.closest(".lv-cap")) closeTop(tp);
        return;
      }
      var row = t.closest(".lv-row");
      if (row) { var d = row.closest(".lv-index"); openLightbox(tp, d._items, +row.dataset.i); return; }
      if (t.closest(".lv-layer")) return;
      if (t.closest("[data-fx]")) return;
      if (t.closest(".tp-name")) { [].forEach.call(tp.querySelectorAll(".lv-layer"), function (l) { l.remove(); }); markOn(tp); return; }
      if (st.own) return;
      var step = t.closest("[data-step]");
      if (step && st.slide) return slideStep(st, +step.dataset.step);
      var li = t.closest("[data-li]");
      if (li) { var p = li.dataset.li.split(":"); listPick(tp, st, +p[0], +p[1]); return; }
      if (t.tagName === "IMG") {
        if (st.slide && t === st.main) return slideStep(st, 1);
        var items = gallery(tp), s = t.getAttribute("src"), i = 0;
        items.forEach(function (it, k) { if (it.src === s) i = k; });
        openLightbox(tp, items, i);
      }
    });
  }

  /* ---------- a wider pool of free photographs (Unsplash licence, see assets/img/samples/CREDITS.md) ---------- */
  var DREAM = [["dc-green-corridor", "초록 복도"], ["dc-ferris-wheel", "관람차"], ["dc-tree-lined-road", "가로수 길"], ["dc-floating-eye-fountain", "떠 있는 눈"], ["dc-bridge-railing", "안개 다리"],
    ["dc-empty-parking-escalator", "빈 에스컬레이터"], ["dc-night-road", "밤길"], ["dc-waiting-room-window", "대기실"], ["dc-pool-building-aerial", "수영장"], ["dc-pool-ladder-wall", "수영장 사다리"],
    ["dc-green-lit-room", "초록 방"], ["dc-desert-geometry", "사막의 문"], ["dc-white-chair-on-hill", "언덕 위 의자"], ["dc-iridescent-bubbles", "비눗방울"], ["dc-bubble-close-up", "방울 하나"],
    ["dc-clear-bubbles", "맑은 방울"], ["dc-green-bubbles", "초록 방울"], ["dc-prism-spectrum", "프리즘"], ["dc-soft-rainbow", "무지개"], ["dc-rainbow-in-water", "물 위 무지개"],
    ["dc-night-rainbow-mountains", "밤 무지개"], ["dc-grey-brown-mountain", "회갈색 산"], ["dc-desert-aerial-rocks", "사막 위에서"]];
  var CLOUD = [["cl-cloudy-sky", "구름 낀 하늘"], ["cl-white-grey-clouds", "흰 구름"], ["cl-pink-clouds", "분홍 구름"], ["cl-white-cloud", "구름 한 점"], ["cl-pink-purple-clouds", "보랏빛 구름"]];
  var MOUNT = [["mt-green-ridges", "초록 능선"], ["mt-orange-ridges", "노을 능선"], ["mt-green-mountain", "푸른 산"], ["mt-rock-mountain", "바위산"], ["mt-meadow-mountain", "초원과 산"],
    ["mt-snow-mountain", "설산"], ["mt-black-white-mountain", "흑백 설산"], ["mt-snow-peak", "눈 덮인 봉우리"], ["mt-misty-mountain", "안개 산"]];
  var SPRING = [["spr-blossom-by-water", "물가의 벚꽃"], ["spr-pink-blossom", "분홍 벚꽃"], ["spr-white-blossom", "흰 벚꽃"], ["spr-blossom-river", "강가 벚나무"], ["spr-pink-bloom", "꽃가지"]];
  var SUMMER = [["sum-clear-beach", "맑은 해변"], ["sum-green-field-town", "초록 논"], ["sum-beach-clouds", "여름 구름"], ["sum-beach-umbrella", "파라솔"], ["sum-beach-from-above", "위에서 본 해변"], ["sum-farm-field", "논길"], ["sum-green-grass", "여름 풀"]];
  var AUTUMN = [["aut-maple-bokeh", "단풍"], ["aut-red-purple-leaves", "붉은 잎"], ["aut-orange-leaf", "주황 잎"], ["aut-dry-leaves-concrete", "마른 잎"], ["aut-three-leaves", "잎 세 장"]];
  var WINTER = [["win-snowy-pines", "눈 쌓인 소나무"], ["win-falling-snow", "내리는 눈"], ["win-icy-branches", "얼음 가지"], ["win-snow-surface", "눈밭"], ["win-balloons-bare-tree", "겨울 나무"]];
  var FOREST = [["fo-misty-forest", "안개 숲"], ["fo-pine-forest", "소나무 숲"], ["fo-forest-aerial", "숲 위에서"], ["fo-grey-fog-forest", "회색 안개 숲"], ["fo-fog-trees", "안개 나무"]];
  var DESERT = [["de-dune-white-sky", "흰 하늘 사구"], ["de-brown-desert", "갈색 사막"], ["de-desert-blue-sky", "푸른 사막"], ["de-dune-group", "모래 언덕"]];
  var WATER = [["wt-blue-water", "푸른 물속"], ["wt-school-of-fish", "물고기 떼"], ["wt-deep-blue-bubbles", "깊은 물"], ["wt-sun-ripples-sand", "물결 빛"], ["wt-shark", "상어"]];
  var NIGHT = [["sky-milky-way", "은하수"], ["ct-neon-alley-bike", "네온 골목"], ["sky-star-cluster", "별무리"], ["ct-empty-lamp-street", "가로등 거리"], ["sky-stars-over-peak", "봉우리 위 별"],
    ["ct-city-timelapse", "도시의 빛"], ["sky-starry-night", "별밤"], ["ct-crossing-in-rain", "비 오는 건널목"], ["sky-dark-starry-sky", "어두운 별하늘"]];
  var KOREA = [["kr-wooden-street", "한옥 골목"], ["kr-roof-blue-sky", "처마"], ["kr-big-roof", "기와 지붕"], ["kr-bench-building", "한옥 마당"], ["kr-wood-floor-curtain-room", "마루"], ["kr-wooden-glass-door", "나무 문"]];
  var FLORA = [["fl-pink-flower", "분홍 꽃"], ["pl-leaf-on-white", "몬스테라"], ["fl-yellow-flower", "노란 꽃"], ["pl-plant-cover", "온실"], ["fl-yellow-purple-flower", "달리아"],
    ["pl-green-leaf", "새잎"], ["fl-pink-white-flower", "분홍 꽃잎"], ["pl-plant-wooden-vase", "화분"], ["fl-pink-yellow-flower", "노을빛 꽃"], ["pl-green-leaves", "잎 벽"]];
  var ANIMAL = [["an-cat-on-chair", "의자 위 고양이"], ["an-small-green-bird", "초록 새"], ["an-orange-cat", "주황 고양이"], ["an-owl", "올빼미"], ["an-long-fur-cat", "긴털 고양이"],
    ["an-orange-bird", "주황 새"], ["an-kitten", "아기 고양이"], ["an-two-eagles", "독수리"]];
  var FOOD = [["fd-strawberry-pastries", "딸기 과자"], ["fd-fruit-and-jug", "과일과 주전자"], ["fd-pink-flower-cake", "꽃 케이크"], ["fd-oranges-on-wood", "귤"], ["fd-strawberry-cake", "딸기 케이크"],
    ["fd-vase-and-grapes", "포도"], ["fd-orange-blackberry", "오렌지와 블랙베리"]];
  var ABSTRACT = [["ab-pastel-spheres", "파스텔 구"], ["ab-flowing-curves", "푸른 곡선"], ["ab-floating-cubes-spheres", "떠 있는 큐브"], ["ab-orange-orb-blue", "주황 구"], ["ab-blue-white-round", "흰 원반"],
    ["ab-purple-swirl", "보라 소용돌이"], ["ab-purple-blue-blur", "보랏빛 번짐"], ["ab-blue-gradient", "푸른 그라데이션"], ["ab-purple-pink-light", "분홍 빛"]];
  var ART = [["art-green-abstract-painting", "초록 추상"], ["art-red-brown-abstract", "붉은 추상"], ["art-thick-white-impasto", "두꺼운 물감"], ["art-white-paint-wall", "흰 붓질"],
    ["paint-ochre", "황토"], ["paint-violet", "보라"], ["paint-green", "초록"], ["paint-grey", "회색"], ["paint-knife", "나이프 자국"], ["paint-white", "흰 캔버스"]];
  var MUSIC = [["mu-bw-vinyl", "흑백 레코드"], ["mu-amber-vinyl", "호박색 레코드"], ["mu-black-vinyl-white", "검은 레코드"], ["mu-concert", "공연"], ["mu-stage-greyscale", "무대 조명"], ["mu-blue-spotlight-stage", "푸른 무대"]];
  var FASHION = [["fa-red-dress-blue-sky", "빨간 옷"], ["fa-red-blazer-stairs", "빨간 재킷"], ["fa-blazer-hands-pockets", "흑백 재킷"]];
  var RETRO = [["rt-film-strips-cat", "필름 스트립"], ["rt-polka-dot-fabric", "필름 조각"], ["rt-red-dot-frame", "빨간 테두리"], ["tx-white-paper", "흰 종이"], ["tx-plaster-surface", "석고 면"], ["tx-blue-stain", "푸른 얼룩"]];
  var SEASONS = [["봄", SPRING], ["여름", SUMMER], ["가을", AUTUMN], ["겨울", WINTER]];
  [DREAM, CLOUD, MOUNT, SPRING, SUMMER, AUTUMN, WINTER, FOREST, DESERT, WATER, NIGHT, KOREA, FLORA, ANIMAL, FOOD, ABSTRACT, ART, MUSIC, FASHION, RETRO].forEach(function (a) { a.forEach(function (x) { NAMES[x[0]] = x[1]; }); });
  [["cer-vases-beige", "세 개의 병"], ["ld-sea-deep", "깊은 바다"], ["ld-dark-hill", "어두운 언덕"], ["fa-yellow-sky", "노란 드레스"], ["fa-coat", "코트"], ["fa-profile", "옆모습"], ["fa-black-coat", "검은 코트"],
    ["fa-white-suit", "흰 수트"], ["pt-bw-studio", "초상, 작업실"], ["pt-bw-man", "초상 II"], ["pt-shadow-face", "그림자 얼굴"], ["pt-turtleneck", "터틀넥"], ["arch-concrete-blocks", "콘크리트 블록"],
    ["arch-white-wall", "흰 벽"], ["int-skylight-tree", "천창과 나무"], ["int-stairs", "계단"], ["arch-steps-teal", "청록 계단"], ["arch-reflection", "반사"]].forEach(function (x) { NAMES[x[0]] = x[1]; });
  /* the generic pool now mixes every subject, a few at a time */
  POOL = (function () {
    var cats = [PHOTO, DREAM, MOUNT, SKY, FLORA, NIGHT, OBJ, WATER, KOREA, CLOUD, FOOD, AUTUMN, WINTER, SPRING, SUMMER, ABSTRACT, ANIMAL, ART, FOREST, DESERT, SPACE, MUSIC], out = [], seen = {};
    for (var i = 0; i < 12; i++) cats.forEach(function (c) { var x = c[i]; if (x && !seen[x[0]]) { seen[x[0]] = 1; out.push(x[0]); } });
    return out;
  })();
  function files(a) { return a.map(function (x) { return x[0]; }); }

  /* ---------- per-template motion: every design has its own behaviour in the live preview ----------
     Timers live in FXT and stop whenever the preview changes or closes. */
  var FXT = [];
  function fxClear() { FXT.forEach(function (o) { clearInterval(o.i); clearTimeout(o.t); cancelAnimationFrame(o.r); }); FXT = []; }
  function every(ms, fn) { FXT.push({ i: setInterval(fn, ms) }); }
  function after(ms, fn) { FXT.push({ t: setTimeout(fn, ms) }); }
  function frame(fn) {
    var o = {}, last = performance.now(); FXT.push(o);
    (function f(now) { var dt = Math.min(now - last, 100); last = now; if (fn(dt, now) !== false) o.r = requestAnimationFrame(f); })(last);
  }
  function $$(root, s) { return [].slice.call(root.querySelectorAll(s)); }
  function sty(tp, s) { return $$(tp, "[style]").filter(function (e) { return !e.closest(".lv-layer") && e.getAttribute("style").indexOf(s) >= 0; })[0]; }
  function txt(tp, s) { var best = null; $$(tp, "*").forEach(function (e) { if (!e.closest(".lv-layer") && e.textContent.indexOf(s) >= 0 && (!best || best.contains(e))) best = e; }); return best; }
  function pt(tp, e) { var r = tp.getBoundingClientRect(), k = r.width / 1440 || 1; return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }; }
  function boxOf(tp, el) { var r = el.getBoundingClientRect(), R = tp.getBoundingClientRect(), k = R.width / 1440 || 1; return { x: (r.left - R.left) / k, y: (r.top - R.top) / k, w: r.width / k, h: r.height / k }; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function add(tp, style, html) { var d = document.createElement("div"); d.style.cssText = "position:absolute;" + style; d.innerHTML = html || ""; d.dataset.fx = 1; tp.appendChild(d); return d; }
  /* put a photograph into a placeholder or frame, above what is there */
  function putImg(el, f, style) {
    var im = el.querySelector("img.fx-img");
    if (!im) { im = document.createElement("img"); im.className = "fx-img"; im.alt = ""; im.dataset.fx = 1; im.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;" + (style || ""); el.appendChild(im); }
    swap(im, src(f));
    return im;
  }
  function largest(tp) {
    var area = function (im) { var r = im.getBoundingClientRect(); return r.width * r.height; };
    return $$(tp, "img").filter(function (im) { return !im.closest(".lv-layer"); }).sort(function (a, b) { return area(b) - area(a); })[0];
  }
  function own(el, cursor) { el.dataset.fx = 1; el.style.cursor = cursor || "pointer"; return el; }
  /* turn off the generic slideshow and list switching where a template brings its own */
  function plain(tp, st) {
    st.slide = null; st.lists = [];
    $$(tp, "[data-step],[data-li]").forEach(function (e) { delete e.dataset.step; delete e.dataset.li; e.classList.remove("lv-hot"); });
  }
  function counterFn(tp) {
    var m = $$(tp, ".m").filter(function (e) { return /^\s*\d{1,2} \/ \d{1,2}\s*$/.test(e.textContent); })[0];
    if (!m) return function () {};
    var cap = m.nextSibling;
    return function (i, n, name) { m.textContent = pad2(i + 1) + " / " + pad2(n); if (cap && cap.nodeType === 3 && name != null) cap.nodeValue = "  " + name; };
  }
  function wrapChars(el) {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(function (line) {
      var d = document.createElement("div"); d.innerHTML = line;
      return d.textContent.split("").map(function (c) { return '<span class="fx-ch">' + (c === " " ? "&nbsp;" : esc(c)) + '</span>'; }).join("");
    }).join("<br>");
    return $$(el, ".fx-ch");
  }
  function lineGroups(tp) { var g = []; $$(tp, ".wl").forEach(function (l) { if (g.indexOf(l.parentNode) < 0) g.push(l.parentNode); }); return g; }
  function skip(e) { return !!e.target.closest(".lv-layer, .lv-a, button, .tp-row"); }
  function draggable(tp, els) {
    var z = 30;
    els.forEach(function (el) {
      el.dataset.fx = 1; el.style.cursor = "grab"; el.style.touchAction = "none";
      el.addEventListener("pointerdown", function (e) {
        if (e.target.closest(".lv-a, button")) return;
        e.preventDefault();
        var p0 = pt(tp, e), b = boxOf(tp, el), l0 = parseFloat(el.style.left), t0 = parseFloat(el.style.top);
        if (isNaN(l0)) l0 = b.x; if (isNaN(t0)) t0 = b.y;
        el._moved = false; el.style.zIndex = ++z; el.style.cursor = "grabbing"; el.style.right = "auto"; el.style.bottom = "auto";
        el.setPointerCapture(e.pointerId);
        function mv(ev) { var p = pt(tp, ev); if (Math.abs(p.x - p0.x) + Math.abs(p.y - p0.y) > 4) el._moved = true; el.style.left = (l0 + p.x - p0.x) + "px"; el.style.top = (t0 + p.y - p0.y) + "px"; }
        function up() { el.style.cursor = "grab"; el.removeEventListener("pointermove", mv); el.removeEventListener("pointerup", up); }
        el.addEventListener("pointermove", mv); el.addEventListener("pointerup", up);
      });
    });
  }
  /* a small copy of a picture flies from where it was clicked to the cart */
  function fly(tp, from, to, s) {
    if (!to) return;
    var a = boxOf(tp, from), b = boxOf(tp, to);
    var d = add(tp, "left:" + a.x + "px;top:" + a.y + "px;width:" + a.w + "px;height:" + a.h + "px;z-index:25;pointer-events:none;overflow:hidden", '<img src="' + s + '" alt="" style="width:100%;height:100%;object-fit:cover">');
    d.animate([{ transform: "none", opacity: 1 }, { transform: "translate(" + (b.x - a.x) + "px," + (b.y - a.y) + "px) scale(.08)", opacity: .4 }], { duration: 700, easing: "cubic-bezier(.6,0,.3,1)" }).onfinish = function () {
      d.remove(); to.animate([{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }], { duration: 300 });
    };
  }

  var FX = {
    /* ----- basic feed ----- */
    "기본 피드 01": { hint: "휠을 굴리면 다음 작업으로 넘어갑니다", run: function (tp, st) {
      plain(tp, st);
      var im = largest(tp), box = im.parentNode, set = counterFn(tp), list = ["cer-vases-beige"].concat(files(FOOD).slice(0, 4), files(OBJ).slice(0, 3), files(FLORA).slice(0, 4)), i = 0, busy = false, lastW = 0;
      set(0, list.length, NAMES[list[0]]);
      function go(d) {
        if (busy) return; busy = true; i = (i + d + list.length) % list.length;
        box.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(" + (-50 * d) + "px)", opacity: 0 }], { duration: 200, easing: "ease-in" }).onfinish = function () {
          im.src = src(list[i]); set(i, list.length, NAMES[list[i]]);
          box.animate([{ transform: "translateY(" + (50 * d) + "px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 360, easing: "cubic-bezier(.2,.7,.2,1)" }).onfinish = function () { busy = false; };
        };
      }
      tp.addEventListener("wheel", function (e) {
        if (e.target.closest(".lv-layer")) return;
        e.preventDefault(); var now = performance.now();
        if (Math.abs(e.deltaY) < 4 || now - lastW < 650) return;
        lastW = now; go(e.deltaY > 0 ? 1 : -1);
      }, { passive: false });
      own(im).addEventListener("click", function () { go(1); });
    } },
    "기본 피드 02": { hint: "사진 위에서 좌우로 움직이면 20분이 흐릅니다", run: function (tp) {
      var im = largest(tp);
      var lab = add(tp, "left:44px;top:678px;font-family:var(--mono);font-size:15px;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.45);pointer-events:none;z-index:2", "18:40");
      add(tp, "left:28px;top:744px;width:860px;height:1px;background:currentColor;opacity:.2;pointer-events:none");
      var dot = add(tp, "left:24px;top:740px;width:9px;height:9px;border-radius:50%;background:currentColor;pointer-events:none");
      im.style.transition = "filter .15s";
      tp.addEventListener("mousemove", function (e) {
        var p = pt(tp, e); if (p.x < 28 || p.x > 888 || p.y < 84 || p.y > 724) return;
        var k = (p.x - 28) / 860, m = 40 + Math.round(k * 20);
        im.style.filter = "brightness(" + (1.1 - k * .65).toFixed(2) + ") saturate(" + (1 + k * .5).toFixed(2) + ") hue-rotate(" + Math.round(-k * 28) + "deg)";
        lab.textContent = m >= 60 ? "19:00" : "18:" + pad2(m);
        dot.style.left = (24 + k * 860) + "px";
      });
    } },
    "기본 피드 03": { hint: "저절로 넘어갑니다 · 사진에 올리면 멈추고, 누르면 다음", run: function (tp, st) {
      plain(tp, st);
      var im = largest(tp), set = counterFn(tp), list = ["ld-sea-deep"].concat(files(WATER), files(NIGHT).slice(0, 4), files(CLOUD).slice(0, 2)), i = 0, acc = 0, hold = false, dur = 2800;
      var bar = add(tp, "left:28px;top:764px;height:2px;width:0;background:currentColor;pointer-events:none");
      set(0, list.length, NAMES[list[0]]);
      im.parentNode.addEventListener("mouseenter", function () { hold = true; });
      im.parentNode.addEventListener("mouseleave", function () { hold = false; });
      own(im).addEventListener("click", function () { acc = dur; });
      frame(function (dt) {
        if (!tp.isConnected) return false;
        if (!hold) acc += dt;
        if (acc >= dur) { acc = 0; i = (i + 1) % list.length; swap(im, src(list[i])); set(i, list.length, NAMES[list[i]]); }
        bar.style.width = (acc / dur * 1384) + "px";
      });
    } },
    "기본 피드 04": { hint: "사진에 올리면 그 사진이 넓게 펼쳐집니다", run: function (tp) {
      var a = $$(tp, ".ph"), ease = "cubic-bezier(.2,.7,.2,1)";
      a.forEach(function (p) { p.style.transition = "left .6s " + ease + ", width .6s " + ease; });
      function lay(k) { var w = k < 0 ? [680, 680] : k === 0 ? [920, 440] : [440, 920]; a[0].style.width = w[0] + "px"; a[1].style.left = (52 + w[0]) + "px"; a[1].style.width = w[1] + "px"; }
      a.forEach(function (p, k) { p.addEventListener("mouseenter", function () { lay(k); }); p.addEventListener("mouseleave", function () { lay(-1); }); });
    } },
    "기본 피드 05": { hint: "마우스를 좌우로 움직이면 이름의 굵기가 바뀝니다", run: function (tp) {
      var h = tp.querySelector("h3.big"), im = largest(tp);
      h.style.transition = "font-weight .25s, letter-spacing .25s"; im.style.transition = "transform .4s ease-out";
      tp.addEventListener("mousemove", function (e) {
        var p = pt(tp, e), k = clamp(p.x / 1440, 0, 1);
        h.style.fontWeight = Math.round(300 + k * 600); h.style.letterSpacing = (-0.02 - k * .05).toFixed(3) + "em";
        im.style.transform = "translate(" + ((720 - p.x) / 60).toFixed(1) + "px," + ((450 - p.y) / 60).toFixed(1) + "px) scale(1.05)";
      });
    } },
    "기본 피드 06": { hint: "손전등처럼 비춰 보세요 · 사진을 누르면 다음 밤", run: function (tp, st) {
      plain(tp, st);
      var im = largest(tp), set = counterFn(tp), list = ["ld-dark-hill"].concat(files(NIGHT)), i = 0;
      var dark = add(tp, "left:0;right:0;top:64px;bottom:64px;pointer-events:none");
      function light(x, y) { dark.style.background = "radial-gradient(circle 230px at " + x + "px " + y + "px, transparent 0, transparent 35%, rgba(0,0,0,.93) 100%)"; }
      light(720, 336); set(0, list.length, NAMES[list[0]]);
      tp.addEventListener("mousemove", function (e) { var p = pt(tp, e); light(p.x, p.y - 64); });
      own(im).addEventListener("click", function () { i = (i + 1) % list.length; swap(im, src(list[i])); set(i, list.length, NAMES[list[i]]); });
    } },

    /* ----- basic grid ----- */
    "기본 그리드 01": { hint: "사진 위에서 마우스를 움직이면 입체로 기울어집니다", run: function (tp) {
      $$(tp, ".gi .fr").forEach(function (fr) {
        fr.style.transition = "transform .25s ease-out";
        fr.addEventListener("mousemove", function (e) {
          var r = fr.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          fr.style.transform = "perspective(700px) rotateY(" + (x * 18).toFixed(1) + "deg) rotateX(" + (-y * 18).toFixed(1) + "deg) scale(1.04)";
        });
        fr.addEventListener("mouseleave", function () { fr.style.transform = ""; });
      });
    } },
    "기본 그리드 02": { hint: "흑백 사진에 올리면 색이 돌아옵니다", run: function (tp) {
      var gis = $$(tp, ".gi"), grey = "grayscale(1) contrast(1.05)";
      gis.forEach(function (g) {
        var im = g.querySelector("img"); im.style.transition = "filter .5s, transform .6s"; im.style.filter = grey; g.style.transition = "opacity .4s";
        g.addEventListener("mouseenter", function () { gis.forEach(function (o) { o.style.opacity = o === g ? 1 : .45; }); im.style.filter = "none"; im.style.transform = "scale(1.05)"; });
        g.addEventListener("mouseleave", function () { gis.forEach(function (o) { o.style.opacity = 1; }); im.style.filter = grey; im.style.transform = ""; });
      });
    } },
    "기본 그리드 03": { hint: "위쪽 − + 로 열 개수를 바꾸고, 휠로 내려 봅니다", run: function (tp) {
      var gg = tp.querySelector(".gg"), n = 6, y = 0;
      var c = add(tp, "right:170px;top:22px;font-size:16px;display:flex;gap:12px;align-items:baseline", '<button type="button" class="lv-btn" data-d="-1">−</button><span class="m">6 열</span><button type="button" class="lv-btn" data-d="1">+</button>');
      gg.style.transition = "transform .35s ease-out";
      c.addEventListener("click", function (e) {
        var b = e.target.closest("[data-d]"); if (!b) return;
        n = clamp(n + +b.dataset.d, 3, 8); y = 0; gg.style.transform = "";
        gg.style.gridTemplateColumns = "repeat(" + n + ",1fr)"; c.querySelector(".m").textContent = n + " 열";
      });
      tp.addEventListener("wheel", function (e) {
        if (e.target.closest(".lv-layer")) return;
        var max = Math.max(0, boxOf(tp, gg).h + y - 790); if (!max) return;
        e.preventDefault(); y = clamp(y + e.deltaY, 0, max); gg.style.transform = "translateY(" + -y + "px)";
      }, { passive: false });
    } },
    "기본 그리드 04": { hint: "사진이 하나씩 천천히 다른 풍경으로 바뀝니다", run: function (tp) {
      var gis = $$(tp, ".gi"), pool = files(DREAM).concat(files(CLOUD), files(NIGHT)), k = 0, over = null;
      gis.forEach(function (g) { g.addEventListener("mouseenter", function () { over = g; }); g.addEventListener("mouseleave", function () { over = null; }); });
      every(1600, function () {
        var g = gis[Math.floor(Math.random() * gis.length)]; if (g === over) return;
        var f = pool[k++ % pool.length]; swap(g.querySelector("img"), src(f)); g.querySelector("span").lastChild.nodeValue = NAMES[f];
      });
    } },
    "기본 그리드 05": { hint: "사진에 올리면 나머지가 흐려집니다", run: function (tp) {
      var gis = $$(tp, ".gi");
      gis.forEach(function (g) {
        g.style.transition = "filter .4s, opacity .4s, transform .5s cubic-bezier(.2,.7,.2,1)";
        g.addEventListener("mouseenter", function () { gis.forEach(function (o) { var me = o === g; o.style.filter = me ? "" : "blur(4px)"; o.style.opacity = me ? 1 : .5; o.style.transform = me ? "scale(1.02)" : ""; }); });
        g.addEventListener("mouseleave", function () { gis.forEach(function (o) { o.style.filter = ""; o.style.opacity = 1; o.style.transform = ""; }); });
      });
    } },
    "기본 그리드 06": { hint: "사진에 올리면 영화처럼 천천히 다가갑니다", run: function (tp) {
      $$(tp, ".gi").forEach(function (g, i) {
        var im = g.querySelector("img"); im.style.transformOrigin = ["20% 30%", "80% 40%", "30% 80%", "70% 70%"][i % 4];
        g.addEventListener("mouseenter", function () { im.style.transition = "transform 7s linear"; im.style.transform = "scale(1.3)"; });
        g.addEventListener("mouseleave", function () { im.style.transition = "transform .6s ease"; im.style.transform = ""; });
      });
    } },

    /* ----- basic slideshow ----- */
    "기본 슬라이드쇼 01": { hint: "화면 왼쪽·오른쪽을 눌러 넘깁니다", run: function (tp, st) {
      plain(tp, st);
      var im = largest(tp), box = im.parentNode, set = counterFn(tp), list = ["fa-yellow-sky"].concat(files(FASHION), ["fa-coat", "fa-profile", "fa-white-suit", "fa-black-coat"]), i = 0, busy = false;
      set(0, list.length, NAMES[list[0]]); im.dataset.fx = 1; im.style.cursor = "inherit";
      function go(d) {
        if (busy) return; busy = true; i = (i + d + list.length) % list.length;
        box.animate([{ transform: "none", opacity: 1 }, { transform: "translateX(" + (-90 * d) + "px)", opacity: 0 }], { duration: 220, easing: "ease-in" }).onfinish = function () {
          im.src = src(list[i]); set(i, list.length, NAMES[list[i]]);
          box.animate([{ transform: "translateX(" + (90 * d) + "px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.2,.7,.2,1)" }).onfinish = function () { busy = false; };
        };
      }
      tp.addEventListener("mousemove", function (e) { tp.style.cursor = skip(e) ? "" : pt(tp, e).x < 720 ? "w-resize" : "e-resize"; });
      tp.addEventListener("click", function (e) { if (!skip(e)) go(pt(tp, e).x < 720 ? -1 : 1); });
    } },
    "기본 슬라이드쇼 02": { hint: "사계절이 저절로 흐릅니다 · 아래 계절 이름을 눌러 이동", run: function (tp, st) {
      plain(tp, st);
      var im = largest(tp), box = im.parentNode, set = counterFn(tp), list = [], i = -1;
      SEASONS.forEach(function (s) { files(s[1]).slice(0, 2).forEach(function (f) { list.push([f, s[0]]); }); });
      var top = document.createElement("img"); top.alt = ""; top.dataset.fx = 1; top.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0"; box.appendChild(top);
      var nav = add(tp, "right:120px;top:750px;display:flex;gap:20px;font-size:17px", SEASONS.map(function (s, k) { return '<button type="button" class="lv-btn" data-s="' + k + '" style="opacity:.35;transition:opacity .3s">' + s[0] + '</button>'; }).join(""));
      function show(k) {
        i = (k + list.length) % list.length; var f = list[i][0];
        top.style.transition = "none"; top.style.opacity = 0; top.src = src(f); void top.offsetWidth;
        top.style.transition = "opacity 1.2s ease"; top.style.opacity = 1;
        after(1250, function () { if (list[i][0] === f) im.src = src(f); });
        set(i, list.length, list[i][1] + " — " + NAMES[f]);
        $$(nav, "button").forEach(function (b, j) { b.style.opacity = j === Math.floor(i / 2) ? 1 : .35; });
      }
      show(0); every(3400, function () { show(i + 1); });
      nav.addEventListener("click", function (e) { var b = e.target.closest("[data-s]"); if (b) show(+b.dataset.s * 2); });
      own(im); box.addEventListener("click", function () { show(i + 1); });
      $$(tp, "span").filter(function (s) { return /^[←→]$/.test(s.textContent.trim()); }).forEach(function (a) { own(a).addEventListener("click", function () { show(i + (a.textContent.trim() === "←" ? -1 : 1)); }); });
    } },
    "기본 슬라이드쇼 03": { hint: "천천히 다가가며 넘어갑니다 · 누르면 멈춤과 재생", run: function (tp, st) {
      plain(tp, st);
      var im = largest(tp), set = counterFn(tp), list = ["ld-dune-gold"].concat(files(DESERT), files(MOUNT).slice(0, 5)), i = 0, playing = true;
      var state = add(tp, "right:28px;bottom:32px;font-size:15px;color:#fff;opacity:.85", "재생 중");
      function kb() { im.style.transition = "none"; im.style.transform = "none"; void im.offsetWidth; im.style.transition = "transform 5.2s linear"; im.style.transform = "scale(1.14) translate(" + (i % 2 ? -2 : 2) + "%,-1%)"; }
      set(0, list.length, NAMES[list[0]]); kb(); im.dataset.fx = 1; im.style.cursor = "pointer";
      every(5000, function () { if (!playing) return; i = (i + 1) % list.length; swap(im, src(list[i])); set(i, list.length, NAMES[list[i]]); kb(); });
      tp.addEventListener("click", function (e) {
        if (skip(e)) return;
        playing = !playing; state.textContent = playing ? "재생 중" : "일시정지";
        if (playing) kb(); else { var m = getComputedStyle(im).transform; im.style.transition = "none"; im.style.transform = m; }
      });
    } },
    "기본 슬라이드쇼 04": { hint: "왼쪽 목록에 올리면 사진이 아래에서 밀려 올라옵니다", run: function (tp, st) {
      plain(tp, st);
      var im = largest(tp), box = im.parentNode, rows = $$(tp, "span").filter(function (s) { var m = s.querySelector(".m"); return m && /^0\d$/.test(m.textContent); });
      var list = files(SPACE).concat(files(KOREA).slice(0, 3)), cur = 1;
      KOREA.slice(0, 3).forEach(function (x, k) { var s = document.createElement("span"); s.style.opacity = ".4"; s.innerHTML = '<span class="m">0' + (5 + k) + '</span>&nbsp;&nbsp;' + x[1]; rows[0].parentNode.appendChild(s); rows.push(s); });
      function wipe(f) {
        var t = document.createElement("img"); t.src = src(f); t.alt = ""; t.dataset.fx = 1;
        t.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;clip-path:inset(100% 0 0 0);transition:clip-path .7s cubic-bezier(.7,0,.2,1)";
        box.appendChild(t); void t.offsetWidth; t.style.clipPath = "inset(0 0 0 0)";
        after(720, function () { im.src = src(f); t.remove(); });
      }
      rows.forEach(function (r, k) {
        r.style.cursor = "pointer"; r.style.transition = "opacity .2s";
        r.addEventListener("mouseenter", function () { if (k === cur) return; cur = k; rows.forEach(function (o, j) { o.style.opacity = j === k ? "" : ".4"; }); wipe(list[k]); });
      });
    } },
    "기본 슬라이드쇼 05": { hint: "썸네일이 차례로 재생됩니다 · 썸네일에 올리면 멈추고 선택", run: function (tp, st) {
      plain(tp, st);
      var im = largest(tp), strip = sty(tp, "grid-template-columns:repeat(8,1fr)"), th = [].slice.call(strip.children), i = 0, acc = 0, hold = false, dur = 2200;
      th.forEach(function (t, k) {
        t.style.position = "relative"; own(t); t.querySelector("img").dataset.fx = 1;
        var b = document.createElement("i"); b.style.cssText = "position:absolute;left:0;bottom:0;height:3px;width:0;background:currentColor"; t.appendChild(b);
        t.addEventListener("mouseenter", function () { hold = true; pick(k); });
        t.addEventListener("mouseleave", function () { hold = false; });
      });
      function pick(k) { i = k; acc = 0; th.forEach(function (t, j) { t.style.opacity = j === k ? 1 : .45; t.style.outline = j === k ? "2px solid currentColor" : "none"; t.lastChild.style.width = 0; }); swap(im, th[k].querySelector("img").src); }
      pick(0);
      frame(function (dt) { if (!tp.isConnected) return false; if (!hold) acc += dt; th[i].lastChild.style.width = Math.min(100, acc / dur * 100) + "%"; if (acc >= dur) pick((i + 1) % th.length); });
    } },
    "기본 슬라이드쇼 06": { hint: "화면 위에서 좌우로 움직이면 사진이 넘어갑니다", run: function (tp, st) {
      plain(tp, st);
      var im = largest(tp), c = $$(tp, ".m").filter(function (m) { return /\d{2} \/ \d{2}/.test(m.textContent); })[0], cur = -1;
      var list = ["pt-bw-studio", "pt-bw-woman", "pt-bw-man", "pt-shadow-face", "pt-turtleneck", "fa-profile", "fa-blazer-hands-pockets", "fa-red-blazer-stairs", "fa-black-coat"];
      tp.style.cursor = "ew-resize"; im.style.cursor = "inherit"; im.dataset.fx = 1;
      tp.addEventListener("mousemove", function (e) {
        if (e.target.closest(".lv-layer")) return;
        var k = clamp(Math.floor(pt(tp, e).x / 1440 * list.length), 0, list.length - 1); if (k === cur) return;
        cur = k; im.src = src(list[k]); if (c) c.textContent = pad2(k + 1) + " / " + pad2(list.length);
      });
    } },

    /* ----- graphic ----- */
    "책 표지 · 큰 그로테스크": { hint: "제목에 올리면 글자가 흩어지고, 누르면 그 배치로 멈춥니다", run: function (tp) {
      var t = sty(tp, "font-size:146px"), ch = wrapChars(t), fixed = false;
      function scatter(on) { ch.forEach(function (c) { c.style.transform = on ? "translate(" + Math.round((Math.random() - .5) * 240) + "px," + Math.round((Math.random() - .5) * 170) + "px) rotate(" + Math.round((Math.random() - .5) * 60) + "deg)" : ""; }); }
      own(t);
      t.addEventListener("mouseenter", function () { if (!fixed) scatter(true); });
      t.addEventListener("mouseleave", function () { if (!fixed) scatter(false); });
      t.addEventListener("click", function () { fixed = !fixed; scatter(fixed); });
    } },
    "콘덴스드 대문자 · 번호": { hint: "마우스를 움직이면 밤 사진이 뒤따라옵니다", run: function (tp) {
      var list = files(NIGHT).concat(files(DREAM).slice(4, 8)).slice(0, 12), k = 0, last = null, num = sty(tp, "font-size:220px");
      tp.addEventListener("mousemove", function (e) {
        if (e.target.closest(".lv-layer")) return;
        var p = pt(tp, e); if (last && Math.hypot(p.x - last.x, p.y - last.y) < 90) return; last = p;
        var f = list[k % list.length]; k++; num.textContent = pad2((k - 1) % 12 + 1);
        var d = add(tp, "left:" + (p.x - 90) + "px;top:" + (p.y - 120) + "px;width:180px;height:240px;pointer-events:none;overflow:hidden;box-shadow:0 10px 30px -12px rgba(0,0,0,.5)", '<img src="' + src(f) + '" alt="" style="width:100%;height:100%;object-fit:cover">');
        d.animate([{ transform: "scale(.6)", opacity: 0 }, { transform: "scale(1)", opacity: 1, offset: .15 }, { transform: "scale(1)", opacity: 1, offset: .7 }, { transform: "scale(.9)", opacity: 0 }], { duration: 1100, easing: "ease-out" }).onfinish = function () { d.remove(); };
      });
    } },
    "3개 언어 제목 · 저널": { hint: "아래 세 단락에 올리면 그 언어의 제목과 사진이 드러납니다", run: function (tp) {
      var t = sty(tp, "font-size:74px");
      t.innerHTML = t.innerHTML.split(/<br\s*\/?>/i).map(function (h) { return '<div style="transition:opacity .35s">' + h + '</div>'; }).join("");
      var lines = [].slice.call(t.children), cols = [].slice.call(sty(tp, "grid-template-columns:repeat(3,1fr);gap:22px").children), im = largest(tp), pics = ["int-m2", "ct-empty-lamp-street", "kr-wooden-street"], cur = -1, hover = false;
      function show(k) {
        if (k === cur) return; cur = k;
        lines.forEach(function (l, j) { l.style.opacity = j === k ? 1 : .12; });
        cols.forEach(function (c, j) { c.style.transition = "opacity .35s"; c.style.opacity = j === k ? 1 : .3; });
        swap(im, src(pics[k]));
      }
      cols.forEach(function (c, k) { c.addEventListener("mouseenter", function () { hover = true; show(k); }); c.addEventListener("mouseleave", function () { hover = false; }); });
      show(0); every(2400, function () { if (!hover) show((cur + 1) % 3); });
    } },
    "공연 포스터 · 라인업": { hint: "지금 무대에 선 순서가 움직입니다 · 이름을 누르면 ★ 저장", run: function (tp) {
      var rows = [].slice.call(sty(tp, "width:420px;display:grid;gap:4px").children), cur = 0;
      rows.forEach(function (r) {
        r.style.transition = "background-color .3s, color .3s, padding .3s"; own(r);
        r.addEventListener("click", function () { var s = r.lastChild; s.textContent = /^★ /.test(s.textContent) ? s.textContent.slice(2) : "★ " + s.textContent; });
      });
      function now(k) { cur = k; rows.forEach(function (r, j) { var on = j === k; r.style.background = on ? "var(--t-ink)" : ""; r.style.color = on ? "var(--t-bg)" : ""; r.style.paddingLeft = r.style.paddingRight = on ? "10px" : ""; }); }
      now(0); every(1800, function () { now((cur + 1) % rows.length); });
    } },
    "체크리스트 포스터": { hint: "항목을 눌러 챙긴 것을 체크하세요", run: function (tp) {
      var box = sty(tp, "font-size:84px"), big = sty(tp, "font-size:300px"), done = 0;
      box.innerHTML = box.innerHTML.split(/<br\s*\/?>/i).map(function (h) { return '<div style="cursor:pointer;transition:opacity .25s">' + h + '</div>'; }).join("");
      var rows = [].slice.call(box.children);
      rows.forEach(function (r) {
        var svg = r.querySelector("svg"); svg.style.transition = "opacity .2s, transform .3s"; svg.style.opacity = .15; r.dataset.fx = 1;
        r.addEventListener("click", function () {
          var on = !r._on; r._on = on; svg.style.opacity = on ? 1 : .15; svg.style.transform = on ? "scale(1.25)" : ""; r.style.opacity = on ? .55 : 1; done += on ? 1 : -1;
          if (done === rows.length) { big.animate([{ transform: "none" }, { transform: "rotate(-6deg) scale(1.06)" }, { transform: "none" }], { duration: 600 }); toast(tp, "다 챙겼어요 — 공원에서 만나요"); }
        });
      });
    } },
    "이름 반복 · 외곽선": { hint: "줄마다 반대로 흐릅니다 · 줄에 올리면 채움과 외곽선이 뒤바뀝니다", run: function (tp) {
      [].slice.call(sty(tp, "font-size:118px").children).forEach(function (r, i) {
        var one = r.innerHTML, st0 = r.getAttribute("style") || "";
        r.innerHTML = '<span style="display:inline-block">' + Array(7).join(one + " ") + '</span>';
        if (!reduce) r.firstChild.animate([{ transform: "translateX(" + (i % 2 ? "-50%" : "0") + ")" }, { transform: "translateX(" + (i % 2 ? "0" : "-50%") + ")" }], { duration: 16000 + i * 1700, iterations: Infinity });
        r.addEventListener("mouseenter", function () { r.setAttribute("style", st0 ? "" : "color:transparent;-webkit-text-stroke:2px currentColor"); });
        r.addEventListener("mouseleave", function () { r.setAttribute("style", st0); });
      });
    } },
    "초대형 시각 · 사진": { hint: "지금 시각이 흐릅니다 · 큰 숫자 위에서 좌우로 움직이면 하루 1,440분을 훑습니다", run: function (tp) {
      var clk = sty(tp, "font-size:420px"), im = largest(tp), hover = false, last = "", blink = true;
      function pic(h) { return h < 5 ? "sky-milky-way" : h < 7 ? "cl-pink-clouds" : h < 11 ? "cl-cloudy-sky" : h < 16 ? "sum-clear-beach" : h < 19 ? "mt-orange-ridges" : h < 21 ? "cl-pink-purple-clouds" : "ct-empty-lamp-street"; }
      function show(mins, on) {
        var h = Math.floor(mins / 60) % 24;
        clk.innerHTML = pad2(h) + '<span style="opacity:' + (on ? 1 : .15) + '">:</span>' + pad2(mins % 60);
        var f = pic(h); if (f !== last) { last = f; swap(im, src(f)); }
      }
      function now() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
      show(now(), true);
      every(500, function () { if (!hover) { blink = !blink; show(now(), blink); } });
      own(clk, "ew-resize");
      clk.addEventListener("mousemove", function (e) { hover = true; show(Math.floor(clamp(pt(tp, e).x, 0, 1439)), true); });
      clk.addEventListener("mouseleave", function () { hover = false; });
    } },
    "세리프 전시 안내 · 액자": { hint: "마우스를 따라 액자가 기울고, 누르면 다른 그림을 겁니다", run: function (tp) {
      var fr = sty(tp, "width:200px;height:250px"), im = fr.querySelector("img"), list = ["paint-ochre"].concat(files(ART).filter(function (f) { return f !== "paint-ochre"; })), i = 0;
      fr.style.transition = "transform .3s ease-out, box-shadow .3s"; own(fr); im.dataset.fx = 1; im.style.cursor = "inherit";
      tp.addEventListener("mousemove", function (e) {
        var p = pt(tp, e), x = (p.x - 720) / 720, y = (p.y - 205) / 450;
        fr.style.transform = "perspective(800px) rotateY(" + (x * 20).toFixed(1) + "deg) rotateX(" + (-y * 14).toFixed(1) + "deg)";
        fr.style.boxShadow = (-x * 24).toFixed(0) + "px " + (14 - y * 10).toFixed(0) + "px 34px -14px rgba(0,0,0,.45)";
      });
      fr.addEventListener("click", function () { i = (i + 1) % list.length; swap(im, src(list[i])); });
    } },
    "콘덴스드 소문자 · 검정": { hint: "글자가 천천히 쳐집니다 · 누를 때마다 더 느리게", run: function (tp) {
      var t = sty(tp, "font-size:150px"), speed = 70, run = 0;
      var all = t.innerHTML.split(/<br\s*\/?>/i).map(function (h) { var d = document.createElement("div"); d.innerHTML = h; return d.textContent; }).join("\n");
      own(t);
      function type() {
        var id = ++run, i = 0;
        (function step() {
          if (id !== run || !tp.isConnected) return; i++;
          t.innerHTML = esc(all.slice(0, i)).replace(/\n/g, "<br>") + '<span class="fx-caret">▍</span>';
          if (i < all.length) after(speed * (.5 + Math.random()), step);
        })();
      }
      after(300, type);
      t.addEventListener("click", function () { speed = Math.min(speed * 1.8, 600); type(); });
    } },
    "프로젝트 색인 표": { hint: "줄에 올리면 작업 사진이 따라오고, Year·Client 같은 머리글을 누르면 정렬됩니다", run: function (tp) {
      var body = sty(tp, "top:214px"), head = sty(tp, "top:190px"), pics = files(ART).concat(files(ABSTRACT), files(KOREA)), dir = {};
      var prev = add(tp, "left:0;top:0;width:260px;height:190px;pointer-events:none;opacity:0;overflow:hidden;transition:opacity .15s;z-index:5;box-shadow:0 14px 30px -14px rgba(0,0,0,.5)", '<img alt="" style="width:100%;height:100%;object-fit:cover">'), pim = prev.firstChild;
      function rows() { return [].slice.call(body.children); }
      rows().forEach(function (r, k) { r.dataset.pic = pics[k * 3 % pics.length]; r.style.transition = "background-color .15s"; });
      body.addEventListener("mousemove", function (e) {
        var r = e.target.closest("div[data-pic]"); if (!r) return;
        var p = pt(tp, e); prev.style.opacity = 1; prev.style.left = Math.min(p.x + 24, 1150) + "px"; prev.style.top = (p.y - 95) + "px";
        if (pim.dataset.f !== r.dataset.pic) { pim.dataset.f = r.dataset.pic; pim.src = src(r.dataset.pic); }
        rows().forEach(function (o) { o.style.background = o === r ? "color-mix(in srgb, currentColor 8%, transparent)" : ""; });
      });
      body.addEventListener("mouseleave", function () { prev.style.opacity = 0; rows().forEach(function (o) { o.style.background = ""; }); });
      [].slice.call(head.children).forEach(function (h, c) {
        own(h);
        h.addEventListener("click", function () {
          dir[c] = -(dir[c] || -1);
          rows().sort(function (a, b) { var x = a.children[c].textContent, y = b.children[c].textContent; return x < y ? -dir[c] : x > y ? dir[c] : 0; }).forEach(function (r) { body.appendChild(r); });
          [].slice.call(head.children).forEach(function (o, j) { o.textContent = o.textContent.replace(/ [↑↓]$/, "") + (j === c ? (dir[c] > 0 ? " ↑" : " ↓") : ""); });
        });
      });
    } },
    "블랙레터 · 신문": { hint: "큰 제목을 누르면 아침판으로 바뀝니다", run: function (tp) {
      var h = sty(tp, "font-family:var(--f-black)"), sub = txt(tp, "A Newspaper for"), kor = txt(tp, "밤의 신문"), cols = sty(tp, "grid-template-columns:repeat(3,1fr);gap:30px");
      var cs = getComputedStyle(tp), bg = cs.getPropertyValue("--t-bg"), ink = cs.getPropertyValue("--t-ink"), night = true, n0 = cols.innerHTML;
      var m0 = "<p>Weather: bright by eight, a light wind from the sea.</p><p>This morning: the first ferry, warm bread, a list of open doors.</p><p>Letters to the editor are answered by noon.</p>";
      tp.style.transition = "background-color .6s, color .6s"; own(h);
      h.addEventListener("click", function () {
        night = !night;
        tp.style.setProperty("--t-bg", night ? bg : ink); tp.style.setProperty("--t-ink", night ? ink : bg);
        h.innerHTML = night ? "The Night<br>Edition" : "The Morning<br>Edition";
        sub.textContent = night ? "A Newspaper for Insomniacs" : "A Newspaper for Early Risers";
        if (kor) kor.textContent = night ? "밤의 신문 — 잠 못 드는 사람들을 위하여" : "아침 신문 — 일찍 일어나는 사람들을 위하여";
        cols.innerHTML = night ? n0 : m0;
      });
    } },
    "액자 엽서 · 사진": { hint: "사진을 누르면 엽서 뒷면이 보입니다 · 아래 ← → 로 다른 엽서", run: function (tp) {
      var cell = tp.querySelector("img").parentNode, i = 0, flipped = false;
      var list = ["arch-reflection"].concat(files(KOREA), files(SPRING).slice(0, 2), files(WINTER).slice(0, 2), files(NIGHT).slice(1, 2)).slice(0, 12);
      cell.style.perspective = "1400px";
      cell.innerHTML = '<div style="position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.2,.7,.2,1);cursor:pointer" data-fx="1">' +
        '<div style="position:absolute;inset:0;backface-visibility:hidden"><img alt="" data-fx="1" src="' + src(list[0]) + '" style="width:100%;height:100%;object-fit:cover;cursor:inherit"></div>' +
        '<div style="position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);background:#fbf8f2;color:#333;padding:24px;display:grid;grid-template-columns:1.2fr 1fr;gap:20px;font-size:15px;line-height:1.5">' +
          '<div style="font-family:var(--f-serif);font-style:italic;font-size:21px;line-height:1.4">Greetings from a quiet city. The bakery opens at six; the river is still asleep.<br><br><span class="ko" style="font-size:15px;font-style:normal">조용한 도시에서 안부를 전합니다.</span></div>' +
          '<div style="border-left:1px solid #ccc;padding-left:20px;display:grid;align-content:space-between"><div style="justify-self:end;width:78px;height:96px;border:2px dashed #b8231a;display:grid;place-items:center;text-align:center;font-size:12px;color:#b8231a">1440<br>STAMP</div>' +
          '<div style="display:grid;gap:30px"><div style="border-bottom:1px solid #999"></div><div style="border-bottom:1px solid #999"></div><div style="border-bottom:1px solid #999"></div></div></div></div></div>';
      var card = cell.firstChild, im = card.querySelector("img");
      card.addEventListener("click", function () { flipped = !flipped; card.style.transform = flipped ? "rotateY(180deg)" : ""; });
      var nav = add(tp, "left:0;right:0;bottom:22px;display:flex;justify-content:center;gap:18px;align-items:baseline;font-size:15px", '<button type="button" class="lv-btn" data-d="-1">←</button><span class="m">01 / ' + pad2(list.length) + '</span><button type="button" class="lv-btn" data-d="1">→</button>');
      nav.addEventListener("click", function (e) {
        var b = e.target.closest("[data-d]"); if (!b) return;
        i = (i + +b.dataset.d + list.length) % list.length; flipped = false; card.style.transform = "";
        swap(im, src(list[i])); nav.querySelector(".m").textContent = pad2(i + 1) + " / " + pad2(list.length);
      });
    } },
    "색 띠 문장": { hint: "좌우로 움직이면 띠가 밀리고, 띠를 누르면 색이 바뀝니다", run: function (tp) {
      var bands = [].slice.call(sty(tp, "left:0;right:0;top:0").children);
      var cols = [["#ffcf33", "#2a1d00"], ["#2b59ff", "#e8eeff"], ["#ff7a59", "#2a0e06"], ["#1f1f1f", "#f2f2f2"], ["#9be3c1", "#0c2a1c"], ["#f2b8d9", "#3a0f24"], ["#e7e1d6", "#2a2620"]];
      bands.forEach(function (b, i) {
        b._base = parseFloat(b.style.paddingLeft) || 0; b._c = i; own(b);
        b.style.transition = "padding-left .5s cubic-bezier(.2,.7,.2,1), background-color .3s, color .3s";
        b.addEventListener("click", function () { b._c = (b._c + 1) % cols.length; b.style.background = cols[b._c][0]; b.style.color = cols[b._c][1]; });
      });
      tp.addEventListener("mousemove", function (e) { var x = pt(tp, e).x - 720; bands.forEach(function (b, i) { b.style.paddingLeft = Math.max(0, b._base + x * (i + 1) * .18) + "px"; }); });
    } },
    "세리프 이탤릭 · 밤 운영": { hint: "지금 열려 있는지 실제 시간으로 보여 줍니다 · 물건 이름을 눌러 예약", run: function (tp) {
      var t = txt(tp, "Borrow a drill"), badge = add(tp, "left:50%;top:116px;transform:translateX(-50%);padding:5px 16px;border:1px solid;border-radius:99px;font-size:15px;white-space:nowrap", "");
      function status() {
        var d = new Date(), day = d.getDay(), h = d.getHours();
        if (day === 4 && h >= 18 && h < 23) return "● Open now — until 11 pm";
        var ahead = (4 - day + 7) % 7; if (day === 4 && h >= 18) ahead = 7;
        var o = new Date(d); o.setDate(d.getDate() + ahead); o.setHours(18, 0, 0, 0);
        var ms = o - d, dd = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5), mm = Math.floor(ms % 36e5 / 6e4);
        return "Closed — opens in " + (dd ? dd + "d " : "") + hh + "h " + pad2(mm) + "m";
      }
      badge.textContent = status(); every(20000, function () { badge.textContent = status(); });
      t.innerHTML = t.innerHTML.replace(/(a drill|a tent|a projector|a sewing machine)/g, '<span class="fx-item" style="cursor:pointer;border-bottom:1px dotted;transition:opacity .2s">$1</span>');
      $$(t, ".fx-item").forEach(function (s) {
        s.dataset.fx = 1;
        s.addEventListener("click", function () { var on = !s._on; s._on = on; s.style.textDecoration = on ? "line-through" : ""; s.style.opacity = on ? .5 : 1; toast(tp, (on ? "예약했습니다 — " : "반납했습니다 — ") + s.textContent); });
      });
    } },
    "시험 인쇄 · 파랑": { hint: "마우스를 움직이면 인쇄가 어긋나고, 누르면 잉크 색이 바뀝니다", run: function (tp) {
      var ph = sty(tp, "mix-blend-mode:multiply"), title = sty(tp, "font-size:160px"), ghost = title.cloneNode(true);
      var inks = [["#2437ff", "#d7dcff"], ["#ff2d8a", "#ffe0ef"], ["#ffe600", "#2a2600"], ["#111111", "#e9e9e9"]], k = 0;
      ghost.style.color = "#ff2d8a"; ghost.style.mixBlendMode = "multiply"; ghost.style.pointerEvents = "none"; ghost.dataset.fx = 1;
      title.parentNode.insertBefore(ghost, title.nextSibling);
      $$(tp, "img").forEach(function (i) { i.dataset.fx = 1; i.style.cursor = "inherit"; });
      tp.addEventListener("mousemove", function (e) {
        var p = pt(tp, e), dx = (p.x - 720) / 36, dy = (p.y - 450) / 36;
        ghost.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
        ph.style.transform = "translate(" + (-dx / 2).toFixed(1) + "px," + (-dy / 2).toFixed(1) + "px)";
      });
      tp.addEventListener("click", function (e) {
        if (skip(e)) return; k = (k + 1) % inks.length;
        tp.style.setProperty("--t-bg", inks[k][0]); tp.style.setProperty("--t-ink", inks[k][1]); ghost.style.color = inks[(k + 1) % inks.length][0];
      });
    } },
    "도형 여섯 개": { hint: "도형에 올리면 돌아가고, 누르면 채워집니다", run: function (tp) {
      $$(tp, 'svg[viewBox="0 0 100 100"]').forEach(function (s) {
        var r = 0, full = false, parts = $$(s, "circle,rect,path");
        parts.forEach(function (p) { p._f = p.getAttribute("fill") || "none"; });
        own(s); s.style.transition = "transform .6s cubic-bezier(.2,.7,.2,1)";
        s.addEventListener("mouseenter", function () { r += 90; s.style.transform = "rotate(" + r + "deg) scale(1.08)"; });
        s.addEventListener("mouseleave", function () { s.style.transform = "rotate(" + r + "deg)"; });
        s.addEventListener("click", function () { full = !full; parts.forEach(function (p) { p.setAttribute("fill", full ? (p._f === "none" ? "currentColor" : "none") : p._f); }); });
      });
    } },
    "서체 견본": { hint: "마우스 가로는 폭, 세로는 굵기 · 큰 글자를 눌러 직접 입력", run: function (tp) {
      var t = sty(tp, "font-size:230px"), out = add(tp, "right:28px;top:432px;font-family:var(--mono);font-size:13px;opacity:.7", "wdth 100 · wght 500");
      tp.addEventListener("mousemove", function (e) {
        var p = pt(tp, e), w = Math.round(62 + clamp(p.x / 1440, 0, 1) * 63), g = Math.round(300 + clamp(p.y / 900, 0, 1) * 600);
        t.style.fontStretch = w + "%"; t.style.fontWeight = g; out.textContent = "wdth " + w + " · wght " + g;
      });
    } },
    "굵은 이탤릭 이름": { hint: "마우스를 빠르게 좌우로 흔들면 이름이 기울어집니다", run: function (tp) {
      var n = sty(tp, "font-size:210px"), lastX = null, v = 0;
      n.style.transformOrigin = "left bottom";
      tp.addEventListener("mousemove", function (e) { var x = pt(tp, e).x; if (lastX !== null) v += (x - lastX) * .6; lastX = x; });
      frame(function () {
        if (!tp.isConnected) return false; v *= .9;
        n.style.transform = "skewX(" + clamp(-v, -35, 35).toFixed(1) + "deg) scaleX(" + (1 + Math.min(Math.abs(v) / 200, .25)).toFixed(3) + ")";
      });
    } },
    "소문자 콘덴스드 · 표지": { hint: "마우스를 따라 잔광이 번집니다 · 아래 Read an excerpt 를 눌러 보세요", run: function (tp) {
      var t = sty(tp, "font-size:260px");
      tp.addEventListener("mousemove", function (e) {
        var p = pt(tp, e), dx = (p.x - 720) / 18, dy = (p.y - 320) / 18, hue = Math.round(p.x / 1440 * 120 + 280);
        t.style.textShadow = dx.toFixed(1) + "px " + dy.toFixed(1) + "px 30px hsla(" + hue + ",90%,60%,.55), " + (dx * 2).toFixed(1) + "px " + (dy * 2).toFixed(1) + "px 90px hsla(" + (hue + 40) + ",90%,60%,.35)";
      });
      tp.addEventListener("mouseleave", function () { t.style.textShadow = ""; });
      var chip = $$(tp, "span").filter(function (s) { return s.textContent === "Read an excerpt"; })[0];
      if (chip) own(chip).addEventListener("click", function () {
        layer(tp, "lv-side", '<div class="lv-top"><span>Excerpt</span><button type="button" class="lv-x">Close ✕</button></div><b class="lv-h" style="font-family:var(--f-cond);font-stretch:62%">afterglow</b>' +
          '<p style="font-family:var(--f-serif);font-size:21px;line-height:1.5">The sun had gone, but the wall across the street kept its colour for eleven more minutes. She counted them from the window, the way you count the seconds after lightning.</p>' +
          '<p class="ko" style="opacity:.6">해는 졌지만 길 건너 벽은 11분 동안 그 색을 붙들고 있었다.</p>');
      });
    } },
    "원형 번호 · 캡션": { hint: "원에 올리면 사진이 보이고, 누르면 다음 물건 · [More] 를 눌러 보세요", run: function (tp) {
      var c = sty(tp, "border-radius:50%"), cap = txt(tp, "Object one of twelve"), kor = txt(tp, "사물 1"), i = 0;
      var list = ["cer-dark-jug", "fd-oranges-on-wood", "ch-orange", "gl-green", "fl-yellow-flower", "an-orange-bird", "mu-amber-vinyl", "cer-cup-speckle", "fd-vase-and-grapes", "ab-orange-orb-blue", "aut-orange-leaf", "st-yellow-jars"];
      var colors = ["#ff6a1f", "#ffb627", "#e8453c", "#2f9e6b", "#f2d600", "#ff8a3d", "#c86b1a", "#7a8b99", "#6b4fa0", "#2b59ff", "#d9541e", "#e0b400"];
      var words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
      own(c); c.style.transition = "background-color .4s"; c.style.backgroundSize = "cover"; c.style.backgroundPosition = "center";
      function paint(on) { c.style.backgroundImage = on ? "url(" + src(list[i]) + ")" : ""; c.style.color = on ? "#fff" : ""; c.style.textShadow = on ? "0 2px 24px rgba(0,0,0,.45)" : ""; }
      c.addEventListener("mouseenter", function () { paint(true); });
      c.addEventListener("mouseleave", function () { paint(false); });
      c.addEventListener("click", function () {
        i = (i + 1) % 12; c.style.backgroundColor = colors[i]; c.textContent = "Nº" + (i + 1); paint(true);
        c.animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 700, easing: "cubic-bezier(.2,.7,.2,1)" });
        if (cap && cap.firstChild) cap.firstChild.nodeValue = "Object " + words[i] + " of twelve. A single thing, photographed on the first day of each month. ";
        if (kor) kor.textContent = "사물 " + (i + 1) + " — 매달 첫날 찍은 하나의 물건";
      });
      var more = cap && cap.querySelector("b");
      if (more) own(more).addEventListener("click", function () { more.textContent = more.textContent === "[More]" ? "[Less] Twelve months, twelve objects, one window sill and the same north light." : "[More]"; });
    } },
    "종이 네 장 · 숫자": { hint: "종이에 올리면 펼쳐지고, 누르면 숫자가 바뀝니다", run: function (tp) {
      $$(tp, "div").filter(function (d) { return /top:300px;width:230px;height:310px/.test(d.getAttribute("style") || ""); }).forEach(function (s) {
        var sh = [].slice.call(s.children).slice(0, 3), num = s.children[3], ease = "transform .5s cubic-bezier(.2,.7,.2,1)";
        own(s); sh.concat(num).forEach(function (p) { p.style.transition = ease; p.style.transformOrigin = "50% 100%"; });
        s.addEventListener("mouseenter", function () { sh[0].style.transform = "rotate(10deg) translate(26px,-6px)"; sh[1].style.transform = "rotate(5deg) translate(12px,-2px)"; sh[2].style.transform = num.style.transform = "rotate(-3deg)"; });
        s.addEventListener("mouseleave", function () { sh.concat(num).forEach(function (p) { p.style.transform = ""; }); });
        s.addEventListener("click", function () {
          var n = (parseInt(num.textContent, 10) + 1) % 10;
          num.animate([{ opacity: 1 }, { opacity: 0, translate: "0 -30px" }], { duration: 150 }).onfinish = function () { num.textContent = n; num.animate([{ opacity: 0, translate: "0 30px" }, { opacity: 1, translate: "0 0" }], { duration: 220 }); };
        });
      });
    } },
    "카드 · 하이라이트": { hint: "카드를 끌어서 책상처럼 옮겨 보세요", run: function (tp) {
      draggable(tp, $$(tp, "div").filter(function (d) { var s = d.getAttribute("style") || ""; return s.indexOf("box-shadow:6px 6px 0") >= 0 || (d.classList.contains("wf") && s.indexOf("outline:2px") >= 0); }));
    } },
    "반복 라벨 타일": { hint: "간판이 차례로 켜집니다 · 간판에 올리면 켜진 채로", run: function (tp) {
      var tiles = [].slice.call(sty(tp, "grid-template-columns:repeat(3,1fr);gap:10px").children), k = 0, over = null;
      function light(t, on) { t.style.background = on ? "var(--t-ink)" : ""; t.style.color = on ? "var(--t-bg)" : ""; t.style.boxShadow = on ? "0 0 34px var(--t-ink)" : ""; }
      tiles.forEach(function (t) {
        t.style.transition = "background-color .12s, color .12s, box-shadow .12s, opacity .12s";
        t.addEventListener("mouseenter", function () { over = t; light(t, true); });
        t.addEventListener("mouseleave", function () { over = null; light(t, false); });
      });
      every(150, function () {
        tiles.forEach(function (t) { if (t !== over) { light(t, false); t.style.opacity = Math.random() < .08 ? .35 : 1; } });
        var t = tiles[k++ % tiles.length]; if (t !== over) light(t, true);
      });
    } },
    "트랙 리스트 · A/B면": { hint: "곡을 누르면 재생되고 레코드가 돕니다 · 같은 곡을 다시 누르면 멈춤", run: function (tp) {
      var rows = $$(tp, "div").filter(function (d) { return d.parentNode && /background:#fff;padding:18px 20px/.test(d.parentNode.getAttribute("style") || ""); });
      var disc = add(tp, "right:28px;top:40px;width:220px;height:220px;border-radius:50%;overflow:hidden;box-shadow:0 12px 30px -14px rgba(0,0,0,.5)", '<img src="' + src("mu-bw-vinyl") + '" alt="" style="width:100%;height:100%;object-fit:cover">');
      var spin = disc.animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 1800, iterations: Infinity }); spin.pause();
      var cur = -1, t = 0, len = 1, bar = null, playing = false;
      function mark() { rows.forEach(function (r, j) { r.style.fontWeight = j === cur ? 600 : ""; var n = r.querySelector(".m"); if (n) n.textContent = j === cur ? (playing ? "▶" : "Ⅱ") : pad2(j % 5 + 1); }); }
      function play(k) {
        if (bar) bar.remove(); cur = k; t = 0;
        var d = rows[k].lastElementChild.textContent.split(":"); len = (+d[0] * 60 + +d[1]) * 1000 / 12;
        bar = document.createElement("i"); bar.style.cssText = "position:absolute;left:0;bottom:-2px;height:2px;width:0;background:currentColor"; rows[k].appendChild(bar);
        playing = true; spin.play(); mark();
      }
      rows.forEach(function (r, k) {
        own(r); r.style.position = "relative";
        r.addEventListener("click", function () { if (k === cur) { playing = !playing; if (playing) spin.play(); else spin.pause(); mark(); } else play(k); });
      });
      frame(function (dt) { if (!tp.isConnected) return false; if (!playing || cur < 0) return; t += dt; bar.style.width = Math.min(100, t / len * 100) + "%"; if (t >= len) play((cur + 1) % rows.length); });
    } },
    "책 표지 · 사진 반반": { hint: "사진에 올리면 드로잉처럼 바뀌고, 누르면 다른 건물", run: function (tp) {
      var im = largest(tp), list = ["arch-concrete-blocks", "arch-brutal-long", "kr-big-roof", "arch-grid-facade", "kr-roof-blue-sky", "arch-curve"], i = 0, n = txt(tp, "120"), c = 0;
      im.style.transition = "filter .5s"; own(im);
      im.parentNode.addEventListener("mouseenter", function () { im.style.filter = "grayscale(1) contrast(2.4) brightness(1.3)"; });
      im.parentNode.addEventListener("mouseleave", function () { im.style.filter = ""; });
      im.addEventListener("click", function () { i = (i + 1) % list.length; swap(im, src(list[i])); });
      (function up() { c += 3; if (n) n.textContent = Math.min(c, 120); if (c < 120) after(16, up); })();
    } },
    "세리프 이탤릭 목록": { hint: "마우스를 위아래로 움직여 서른 가지 판을 넘겨 보세요", run: function (tp) {
      var t = sty(tp, "font-size:74px"), lines = t.innerHTML.split(/<br\s*\/?>/i), cur = -1;
      var tints = ["transparent", "#f6d9c8", "#d3e2f1", "#e2e8c6", "#f1d3e4", "#cfe8dc", "#f3e4bd", "#dcd6f0"];
      var wash = add(tp, "inset:0;pointer-events:none;mix-blend-mode:multiply;transition:background-color .4s");
      tp.addEventListener("mousemove", function (e) {
        var k = clamp(Math.floor(pt(tp, e).y / 900 * 30), 0, 29); if (k === cur) return; cur = k;
        lines[3] = "Version " + (k + 1) + " of 30"; t.innerHTML = lines.join("<br>"); wash.style.background = tints[k % tints.length];
      });
    } },
    "쌓인 대문자 목록 · 띠": { hint: "상품 이름에 올리면 띠가 따라오고, 누르면 담깁니다 · 가운데 띠는 실제 영업 여부", run: function (tp) {
      var items = [].slice.call(sty(tp, "left:0;right:0;top:10px").children), band = items.filter(function (d) { return /Open 11/.test(d.textContent); })[0];
      var d = new Date(), open = d.getDay() !== 1 && d.getHours() >= 11 && d.getHours() < 19;
      if (band) band.textContent = (open ? "Open · " : "Closed · ") + "11—19";
      items.forEach(function (it) {
        if (it === band) return; own(it); it.style.transition = "background-color .2s, color .2s";
        it.addEventListener("mouseenter", function () { it.style.background = "#ff7a1f"; it.style.color = "#101a3a"; });
        it.addEventListener("mouseleave", function () { it.style.background = ""; it.style.color = ""; });
        it.addEventListener("click", function () { toast(tp, it.textContent + " — 장바구니에 담았습니다"); });
      });
    } },

    /* ----- graduation show: most carry their own init; these fill in what the page promises ----- */
    "빛 비추기 · 회화 질감": { hint: "마우스를 움직이면 조명이 그림 표면을 비춥니다", run: function () {} },
    "3D 뷰어 · 도자": { hint: "끌어서 돌리고, 휠로 가까이 봅니다", run: function () {} },
    "3D 뷰어 · 조각 세 점": { hint: "세 작품을 각각 끌어서 돌려 보세요", run: function () {} },
    "실제 크기 비교": { hint: "Person on / off 를 눌러 사람과 크기를 비교합니다", run: function () {} },
    "작업 과정 전후": { hint: "그림 위를 좌우로 끌면 밑그림과 완성작이 비교됩니다", run: function () {} },
    "루페 · 붓질 확대": { hint: "그림 위에서 움직이면 네 배 확대경이 따라갑니다", run: function () {} },
    "하루의 빛 · 1440": { hint: "전시실의 빛이 지금 시각을 따라 바뀝니다", run: function () {} },
    "오디오 도슨트": { hint: "재생을 누르면 작품 설명이 흐릅니다", run: function () {} },
    "방명록 벽": { hint: "한 줄 남기면 벽에 붙습니다", run: function () {} },
    "전시장 평면도": { hint: "방을 누르면 그 방의 작가와 작업이 열립니다", run: function (tp) {
      var info = { A: ["Painting", "Kim · Lee · Oh", ["paint-ochre", "art-green-abstract-painting"]], B: ["Ceramics", "Park · Seo", ["cer-vases-beige", "cer-blue-set"]],
        C: ["Sculpture", "Jung · Han", ["sc-kintsugi", "sc-hand"]], D: ["Video", "Choi · Yoon", ["dn-blur", "mu-blue-spotlight-stage"]], E: ["Design", "Kang · Lim · Shin", ["bk-red-fan", "ab-pastel-spheres"]] };
      var rooms = $$(tp, "g.room");
      rooms.forEach(function (g) {
        own(g);
        g.addEventListener("click", function () {
          var k = g.querySelector("text").textContent, r = info[k]; if (!r) return;
          rooms.forEach(function (o) { o.querySelector("rect").setAttribute("fill", o === g ? "#ffe66b" : "#fff"); });
          layer(tp, "lv-side", '<div class="lv-top"><span>Room ' + k + '</span><button type="button" class="lv-x">Close ✕</button></div><b class="lv-h">' + r[0] + '</b><p>' + r[1] + '</p>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' + r[2].map(function (f) { return '<img src="' + src(f) + '" alt="" style="width:100%;aspect-ratio:3/4;object-fit:cover">'; }).join("") + '</div>' +
            '<p class="ko" style="opacity:.6">' + k + '실 — ' + r[1] + '</p>');
        });
      });
    } },
    "졸업생 명단 벽": { hint: "이름에 올리면 그 작가의 작업과 설명으로 바뀝니다", run: function (tp, st) {
      plain(tp, st);
      var names = [].slice.call(sty(tp, "columns:2").children), im = largest(tp), lab = sty(tp, "left:940px;right:28px;top:630px");
      var work = { Painting: ["paint-ochre", "Oil on canvas"], Ceramics: ["cer-vases-beige", "Stoneware"], Sculpture: ["sc-kintsugi", "Plaster and gold"], Video: ["dn-blur", "Single-channel video"], Design: ["bk-red-fan", "Books and posters"], Printmaking: ["paint-grey", "Etching"] };
      var extra = { Painting: "art-red-brown-abstract", Ceramics: "cer-blue-set", Sculpture: "sc-hand", Video: "mu-stage-greyscale", Design: "ab-pastel-spheres", Printmaking: "tx-blue-stain" };
      names.forEach(function (n, i) {
        n.style.cursor = "default"; n.style.transition = "opacity .2s";
        n.addEventListener("mouseenter", function () {
          names.forEach(function (o) { o.style.opacity = o === n ? "" : ".35"; });
          var major = n.lastElementChild.textContent, who = n.firstChild.nodeValue.trim(), w = work[major] || work.Painting;
          swap(im, src(i % 2 ? extra[major] || w[0] : w[0]));
          if (lab) { lab.innerHTML = label(who, major + " · " + w[1] + ", 2026", who + " — " + major); lab.classList.remove("lv-fade"); void lab.offsetWidth; lab.classList.add("lv-fade"); }
        });
      });
    } },

    /* ----- wireframes: each shows a different way a page fills up ----- */
    "빈 템플릿": { hint: "점선 상자를 누를 때마다 블록이 하나씩 쌓입니다", run: function (tp) {
      var box = sty(tp, "border:2px dashed"), html0 = box.innerHTML, css0 = box.style.cssText, step = 0, pics = files(DREAM).slice(0, 3);
      own(box, "copy");
      box.addEventListener("click", function () {
        step = (step + 1) % 6;
        if (!step) { box.innerHTML = html0; box.style.cssText = css0; return; }
        if (step === 1) { box.innerHTML = ""; box.style.placeContent = "start"; box.style.textAlign = "left"; box.style.padding = "40px"; box.style.gap = "18px"; }
        var b = document.createElement("div"); b.className = "lv-fade";
        if (step >= 3) {
          var row = box.querySelector(".fx-row");
          if (!row) { row = document.createElement("div"); row.className = "fx-row"; row.style.cssText = "display:flex;gap:12px"; box.appendChild(row); }
          b.innerHTML = '<img src="' + src(pics[step - 3]) + '" alt="" data-fx="1" style="height:230px;display:block">'; row.appendChild(b); return;
        }
        b.innerHTML = step === 1 ? '<b style="font-size:48px;font-weight:600;letter-spacing:-.04em">' + N + '</b>'
          : '<p style="font-size:18px;max-width:560px;margin:0;opacity:.75">사진과 글을 올리는 곳입니다. 블록을 더하고, 옮기고, 지우면서 페이지를 만듭니다.</p>';
        box.appendChild(b);
      });
    } },
    "와이어프레임 W102": { hint: "빈 칸을 누르면 사진이 들어가고 회색 줄이 글로 바뀝니다", run: function (tp) {
      var w = tp.querySelector(".wf"), g = lineGroups(tp), pics = files(DREAM), i = -1;
      own(w, "copy");
      w.addEventListener("click", function () {
        i = (i + 1) % pics.length; var f = pics[i], im = putImg(w, f);
        im.animate([{ transform: "scale(1.15)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 500, easing: "cubic-bezier(.2,.7,.2,1)" });
        if (g[0]) g[0].innerHTML = '<b style="font-size:20px;font-weight:500">' + NAMES[f] + '</b><span class="m" style="opacity:.5">2026 · ' + pad2(i + 1) + ' / ' + pad2(pics.length) + '</span>';
        if (g[1] && i === 0) g[1].innerHTML = '<p class="lv-fade" style="margin:0;font-size:16px;line-height:1.6;opacity:.8">비어 있는 공간을 찍은 연작입니다. 사람이 떠난 뒤의 빛과 벽, 오래된 복도의 초록을 기록했습니다.</p>';
      });
    } },
    "와이어프레임 W203": { hint: "칸에 올리면 +, 누르면 사진이 채워집니다", run: function (tp) {
      var k = Math.floor(Math.random() * 40);
      $$(tp, ".wf.in").forEach(function (c) {
        own(c, "copy");
        var plus = document.createElement("span"); plus.textContent = "+"; plus.style.cssText = "position:absolute;inset:0;display:grid;place-items:center;font-size:48px;opacity:0;transition:opacity .2s;z-index:2"; c.appendChild(plus);
        c.addEventListener("mouseenter", function () { plus.style.opacity = .6; });
        c.addEventListener("mouseleave", function () { plus.style.opacity = 0; });
        c.addEventListener("click", function () {
          var f = POOL[k++ % POOL.length]; putImg(c, f);
          if (!c._cap) { var l = c.nextElementSibling, s = document.createElement("span"); s.style.fontSize = "14px"; if (l) l.replaceWith(s); else c.parentNode.appendChild(s); c._cap = s; }
          c._cap.textContent = NAMES[f] || "";
        });
      });
    } },
    "와이어프레임 W304": { hint: "← → 나 빈 칸을 누르면 슬라이드에 사진이 채워집니다", run: function (tp, st) {
      plain(tp, st);
      var w = tp.querySelector(".wf"), list = files(CLOUD).concat(files(DREAM).slice(13)), i = -1;
      var cnt = document.createElement("span"); cnt.style.cssText = "position:absolute;left:28px;bottom:24px;z-index:2;font-size:15px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.5)"; w.appendChild(cnt);
      function go(d) { i = (i + d + list.length) % list.length; putImg(w, list[i]); cnt.textContent = pad2(i + 1) + " / " + pad2(list.length) + "  " + NAMES[list[i]]; }
      $$(tp, "span").filter(function (s) { return /^[←→]$/.test(s.textContent.trim()); }).forEach(function (a) { own(a).addEventListener("click", function () { go(a.textContent.trim() === "←" ? -1 : 1); }); });
      own(w).addEventListener("click", function () { go(1); });
    } },
    "와이어프레임 W405": { hint: "목록 줄에 올리면 오른쪽 칸에 사진이 나타납니다", run: function (tp) {
      var box = sty(tp, "width:840px;top:90px"), rows = [].slice.call(box.children), w = $$(tp, ".wf").pop(), list = files(MOUNT).concat(files(FOREST)), im = null;
      rows.forEach(function (r, k) {
        r.style.transition = "background-color .15s";
        r.addEventListener("mouseenter", function () { rows.forEach(function (o) { o.style.background = o === r ? "#f3f3f3" : ""; }); im = putImg(w, list[k % list.length], "transition:opacity .3s"); im.style.opacity = 1; });
      });
      box.addEventListener("mouseleave", function () { rows.forEach(function (o) { o.style.background = ""; }); if (im) im.style.opacity = 0; });
    } },
    "와이어프레임 W506": { hint: "불러오는 중인 화면입니다 · 누르면 내용이 채워지고, 다시 누르면 비워집니다", run: function (tp) {
      var g = lineGroups(tp), w = tp.querySelector(".wf"), on = false;
      $$(tp, ".wl").forEach(function (l) { l.classList.add("fx-shim"); });
      var saved = g.map(function (x) { return x.innerHTML; });
      w.dataset.fx = 1;
      tp.addEventListener("click", function (e) {
        if (skip(e)) return; on = !on;
        if (on) {
          g[0].innerHTML = '<b class="lv-fade" style="font-size:30px;font-weight:600;letter-spacing:-.03em;line-height:1.1">기다림의 방들</b><span class="m lv-fade" style="opacity:.5">사진 연작 · 2026</span>';
          if (g[1]) g[1].innerHTML = '<p class="lv-fade" style="margin:0;font-size:16px;line-height:1.6;opacity:.8">대기실, 복도, 빈 수영장처럼 누군가를 기다리는 공간을 찍었습니다. 사람이 없는 시간에만 촬영했습니다.</p>';
          putImg(w, "dc-waiting-room-window");
        } else {
          g.forEach(function (x, k) { x.innerHTML = saved[k]; });
          var im = w.querySelector(".fx-img"); if (im) im.remove();
        }
      });
    } },
    "와이어프레임 W607": { hint: "누를 때마다 여섯 칸이 차례로 다른 주제로 채워집니다", run: function (tp) {
      var cells = $$(tp, ".wf"), sets = [DREAM, MOUNT, FLORA, FOOD, ANIMAL, KOREA, ABSTRACT], p = 0;
      cells.forEach(function (c) { own(c); });
      tp.addEventListener("click", function (e) {
        if (skip(e)) return; var set = files(sets[p++ % sets.length]);
        cells.forEach(function (c, k) { after(k * 110, function () { var im = putImg(c, set[k % set.length]); im.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: 520, easing: "cubic-bezier(.7,0,.2,1)" }); }); });
      });
    } },
    "와이어프레임 W708": { hint: "누르면 제목이 타이핑되고 사진이 들어옵니다", run: function (tp) {
      var g = lineGroups(tp), w = tp.querySelector(".wf"), saved = g.map(function (x) { return x.innerHTML; }), on = false, run = 0;
      w.dataset.fx = 1;
      tp.addEventListener("click", function (e) {
        if (skip(e)) return; on = !on; var id = ++run;
        if (!on) { g.forEach(function (x, k) { x.innerHTML = saved[k]; }); var old = w.querySelector(".fx-img"); if (old) old.remove(); return; }
        var head = "여기에 제목이\n들어갑니다", i = 0;
        g[0].innerHTML = '<div style="font-size:64px;font-weight:600;letter-spacing:-.04em;line-height:1.1"></div>';
        var h = g[0].firstChild;
        (function step() {
          if (id !== run) return; i++;
          h.innerHTML = esc(head.slice(0, i)).replace(/\n/g, "<br>") + '<span class="fx-caret">▍</span>';
          if (i < head.length) after(60, step);
          else {
            if (g[1]) g[1].innerHTML = '<p class="lv-fade" style="margin:0;font-size:17px;line-height:1.6;opacity:.8">글과 사진을 넣으면 이 자리에 그대로 들어갑니다. 제목 크기, 줄 간격, 사진 비율은 모두 바꿀 수 있습니다.</p>';
            putImg(w, "sum-beach-clouds");
          }
        })();
      });
    } },
    "와이어프레임 W809": { hint: "칸을 누르면 사진이 붙고, 끌어서 옮길 수 있습니다 · 오른쪽 위 1 / 4 를 누르면 섞기", run: function (tp) {
      var cells = $$(tp, ".wf"), pool = files(FLORA).concat(files(FOOD), files(ANIMAL)), k = 0, page = 1, pg = txt(tp, "1 / 4");
      draggable(tp, cells);
      cells.forEach(function (c) { c.addEventListener("click", function () { if (!c._moved) putImg(c, pool[k++ % pool.length]); }); });
      if (pg) own(pg).addEventListener("click", function () {
        page = page % 4 + 1; pg.textContent = page + " / 4";
        cells.forEach(function (c) { c.style.transition = "left .6s cubic-bezier(.2,.7,.2,1), top .6s cubic-bezier(.2,.7,.2,1)"; c.style.left = Math.round(30 + Math.random() * 1140) + "px"; c.style.top = Math.round(80 + Math.random() * 480) + "px"; });
        after(650, function () { cells.forEach(function (c) { c.style.transition = ""; }); });
      });
    } },
    "와이어프레임 W910": { hint: "줄을 누르면 펼쳐져 내용이 보입니다", run: function (tp) {
      var box = sty(tp, "top:100px;width:560px"), rows = [].slice.call(box.children), w = $$(tp, ".wf").pop(), list = files(WINTER).concat(files(AUTUMN)), open = null;
      rows.forEach(function (r, k) {
        var f = list[k % list.length], more = document.createElement("div");
        own(r); r.style.flexWrap = "wrap";
        more.style.cssText = "flex-basis:100%;height:0;overflow:hidden;transition:height .45s cubic-bezier(.2,.7,.2,1);display:flex;gap:14px";
        more.innerHTML = '<img src="' + src(f) + '" alt="" data-fx="1" style="width:120px;height:90px;object-fit:cover;margin-top:12px"><div style="display:grid;gap:8px;margin-top:14px;flex:1;align-content:start"><b style="font-weight:500">' + NAMES[f] + '</b><div class="wl" style="width:90%"></div><div class="wl" style="width:60%"></div></div>';
        r.appendChild(more);
        r.addEventListener("click", function () { var was = open === r; if (open) open.lastChild.style.height = 0; open = was ? null : r; if (open) { more.style.height = "106px"; putImg(w, f); } });
      });
    } },
    "와이어프레임 W011": { hint: "왼쪽 빈 칸 위에서 움직이면 사진이 드러납니다 · 누르면 다음 산", run: function (tp) {
      var w = tp.querySelector(".wf"), list = files(MOUNT), i = 0, im = putImg(w, list[0]);
      function mask(v) { im.style.webkitMaskImage = v; im.style.maskImage = v; }
      mask("radial-gradient(circle 0px at 50% 50%, #000 0, transparent 100%)"); own(w);
      w.addEventListener("mousemove", function (e) { var r = w.getBoundingClientRect(); mask("radial-gradient(circle 230px at " + ((e.clientX - r.left) / r.width * 100).toFixed(1) + "% " + ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%, #000 55%, transparent 100%)"); });
      w.addEventListener("mouseleave", function () { mask("radial-gradient(circle 0px at 50% 50%, #000 0, transparent 100%)"); });
      w.addEventListener("click", function () { i = (i + 1) % list.length; im.src = src(list[i]); });
    } },
    "와이어프레임 W112": { hint: "아래 칸을 누르면 상품이 채워지고 장바구니로 날아갑니다", run: function (tp, st) {
      var cells = $$(tp, ".wf.in"), big = $$(tp, ".wf").filter(function (c) { return !c.classList.contains("in"); })[0], cart = tp.querySelector('.lv-a[data-lv="cart"]');
      var list = [["cer-cup-speckle", "₩ 34,000"], ["fd-oranges-on-wood", "₩ 12,000"], ["pl-plant-wooden-vase", "₩ 58,000"], ["cer-blue-set", "₩ 210,000"], ["fd-vase-and-grapes", "₩ 46,000"]];
      cells.forEach(function (c, k) {
        own(c, "copy");
        c.addEventListener("click", function () {
          var f = list[k % list.length][0], im = putImg(c, f); if (big) putImg(big, f);
          var l = c.nextElementSibling;
          if (l && l.classList.contains("wl")) { var s = document.createElement("span"); s.style.fontSize = "14px"; s.textContent = NAMES[f] + " · " + list[k % list.length][1]; l.replaceWith(s); }
          st.cart.push({ src: src(f), cap: NAMES[f] }); updateCart(tp); fly(tp, im, cart, src(f));
        });
      });
    } },

    /* ----- populated ----- */
    "채워진 템플릿 P101": { hint: "아래 사진을 누르면 큰 사진이 바뀌고, 가만히 두면 저절로 넘어갑니다", run: function (tp) {
      var hero = largest(tp), title = txt(tp, "문래 공공 도서관"), gis = $$(tp, ".gi"), i = 0, idle = 0;
      var list = [hero.getAttribute("src")].concat(gis.map(function (g) { return g.querySelector("img").getAttribute("src"); }));
      var names = ["문래 공공 도서관"].concat(gis.map(function (g) { return g.querySelector("span").lastChild.nodeValue; }));
      function show(k) { i = k; swap(hero, list[k]); if (title) title.textContent = names[k]; gis.forEach(function (g, j) { g.style.opacity = j === k - 1 ? .4 : 1; }); }
      gis.forEach(function (g, j) { own(g); g.style.transition = "opacity .3s"; g.querySelector("img").dataset.fx = 1; g.addEventListener("click", function () { idle = 0; show(j + 1); }); });
      every(3200, function () { if (++idle > 1) show((i + 1) % list.length); });
    } },
    "채워진 템플릿 P202": { hint: "사진 위에 마우스를 올려 암실에서 현상해 보세요", run: function (tp) {
      var ims = $$(tp, ".gi img"), done = 0, lab = add(tp, "right:28px;top:48px;font-family:var(--mono);font-size:14px;opacity:.6", "현상 0 / " + ims.length);
      ims.forEach(function (im) {
        im.style.transition = "filter 1.6s ease, opacity 1.6s"; im.style.filter = "brightness(2.4) contrast(.35) sepia(.4)"; im.style.opacity = .3;
        im.closest(".gi").addEventListener("mouseenter", function () { if (im._dev) return; im._dev = 1; im.style.filter = "none"; im.style.opacity = 1; lab.textContent = "현상 " + (++done) + " / " + ims.length; });
      });
    } },
    "채워진 템플릿 P303": { hint: "전시까지 남은 날을 오늘 날짜로 셉니다 · 마우스를 위아래로 움직여 보세요", run: function (tp) {
      var dt = txt(tp, "2026. 10. 02"), start = new Date(2026, 9, 2), end = new Date(2026, 10, 15, 23, 59), now = new Date(), days = Math.ceil((start - now) / 864e5);
      if (dt) {
        var tag = document.createElement("span"); tag.style.cssText = "justify-self:start;padding:2px 12px;border-radius:99px;background:var(--t-ink);color:var(--t-bg);font-size:14px";
        tag.textContent = now < start ? "D-" + days + " · 곧 열립니다" : now <= end ? "지금 전시 중" : "전시가 끝났습니다";
        dt.parentNode.insertBefore(tag, dt.nextSibling);
      }
      var ims = $$(tp, ".ph img");
      tp.addEventListener("mousemove", function (e) { var y = (pt(tp, e).y - 450) / 450; ims.forEach(function (im, k) { im.style.transform = "scale(1.14) translateY(" + (y * [20, -28, 32][k % 3]).toFixed(1) + "px)"; }); });
    } },
    "채워진 템플릿 P404": { hint: "위쪽 분류(도자·가구·유리)를 누르면 상품이 걸러집니다", run: function (tp) {
      var mid = tp.querySelector(".tp-row").children[1], cats = { "도자": /cer-|st-yellow/, "가구": /ch-/, "유리": /gl-/ }, cards = [].slice.call(sty(tp, "grid-template-columns:repeat(4,1fr);gap:30px 16px").children);
      mid.innerHTML = ["전체", "도자", "가구", "유리"].map(function (c, k) { return '<button type="button" class="lv-btn fx-cat" data-c="' + c + '" style="opacity:' + (k ? .45 : 1) + '">' + c + '</button>'; }).join(" · ");
      mid.addEventListener("click", function (e) {
        var b = e.target.closest(".fx-cat"); if (!b) return; var re = cats[b.dataset.c];
        $$(mid, ".fx-cat").forEach(function (x) { x.style.opacity = x === b ? 1 : .45; });
        cards.forEach(function (c) { var on = !re || re.test(c.querySelector("img").getAttribute("src")); c.style.transition = "opacity .35s, transform .35s, filter .35s"; c.style.opacity = on ? 1 : .12; c.style.filter = on ? "" : "grayscale(1)"; c.style.transform = on ? "" : "scale(.94)"; });
      });
    } },
    "채워진 템플릿 P505": { hint: "마우스를 움직이면 제목에 움직임의 잔상이 남습니다", run: function (tp) {
      var h = tp.querySelector("h3.big"), bg = largest(tp), last = 0;
      bg.style.transition = "transform .5s ease-out";
      tp.addEventListener("mousemove", function (e) {
        var p = pt(tp, e), now = performance.now();
        bg.style.transform = "scale(1.08) translate(" + ((720 - p.x) / 50).toFixed(1) + "px," + ((450 - p.y) / 50).toFixed(1) + "px)";
        if (now - last < 60) return; last = now;
        var g = h.cloneNode(true); g.dataset.fx = 1; g.style.pointerEvents = "none"; h.parentNode.insertBefore(g, h);
        g.animate([{ transform: "none", opacity: .45 }, { transform: "translate(" + ((p.x - 720) / 10).toFixed(0) + "px," + ((p.y - 450) / 16).toFixed(0) + "px)", opacity: 0 }], { duration: 800, easing: "ease-out" }).onfinish = function () { g.remove(); };
      });
    } },
    "채워진 템플릿 P606": { hint: "이력 줄에 올리면 그해의 사진으로 바뀝니다", run: function (tp) {
      var im = largest(tp), base = im.getAttribute("src"), rows = $$(tp, "div").filter(function (d) { return /grid-template-columns:70px 1fr;padding:6px 0/.test(d.getAttribute("style") || ""); });
      var list = ["fa-red-dress-blue-sky", "fa-red-blazer-stairs", "fa-blazer-hands-pockets", "fa-white-suit"];
      rows.forEach(function (r, k) {
        r.style.transition = "padding-left .25s";
        r.addEventListener("mouseenter", function () { r.style.paddingLeft = "10px"; swap(im, src(list[k % list.length])); });
        r.addEventListener("mouseleave", function () { r.style.paddingLeft = ""; });
      });
      if (rows[0]) rows[0].parentNode.addEventListener("mouseleave", function () { swap(im, base); });
    } },
    "채워진 템플릿 P707": { hint: "왼쪽 사진 위에서 위아래로 움직이면 다른 얼굴이 드러납니다", run: function (tp) {
      var ph = tp.querySelector(".ph"), top = document.createElement("img"), line = document.createElement("i");
      top.src = src("pt-shadow-face"); top.alt = ""; top.dataset.fx = 1; top.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;clip-path:inset(0 0 100% 0)";
      line.style.cssText = "position:absolute;left:0;right:0;top:0;height:1px;background:#fff;opacity:0";
      ph.appendChild(top); ph.appendChild(line);
      ph.addEventListener("mousemove", function (e) { var r = ph.getBoundingClientRect(), k = clamp((e.clientY - r.top) / r.height, 0, 1); top.style.transition = ""; top.style.clipPath = "inset(0 0 " + (100 - k * 100).toFixed(1) + "% 0)"; line.style.top = (k * 100) + "%"; line.style.opacity = .8; });
      ph.addEventListener("mouseleave", function () { top.style.transition = "clip-path .6s"; top.style.clipPath = "inset(0 0 100% 0)"; line.style.opacity = 0; });
    } },
    "채워진 템플릿 P808": { hint: "아래 상품을 누르면 장바구니로 날아갑니다", run: function (tp, st) {
      var cart = tp.querySelector('.lv-a[data-lv="cart"]'), row = sty(tp, "top:668px");
      if (row) [].slice.call(row.children).forEach(function (it) {
        var im = it.querySelector("img"); if (!im) return;
        im.dataset.fx = 1; own(it); it.style.transition = "transform .25s";
        it.addEventListener("mouseenter", function () { it.style.transform = "translateY(-6px)"; });
        it.addEventListener("mouseleave", function () { it.style.transform = ""; });
        it.addEventListener("click", function () { st.cart.push({ src: im.getAttribute("src"), cap: NAMES[fileOf(im)] || "" }); updateCart(tp); fly(tp, im, cart, im.getAttribute("src")); });
      });
    } },
    "채워진 템플릿 P909": { hint: "이름에 올리면 사진이 바뀌고, 가만히 두면 스스로 넘어갑니다", run: function (tp, st) {
      var L = st.lists && st.lists[0]; if (!L) return;
      var n = L.el.children.length, i = 1, idle = 0;
      L.el.addEventListener("mouseover", function (e) { idle = 0; var c = e.target.closest("[data-li]"); if (c) i = +c.dataset.li.split(":")[1]; });
      every(2000, function () { if (++idle < 2) return; i = (i + 1) % n; listPick(tp, st, 0, i); });
    } },
    "채워진 템플릿 P110": { hint: "큰 번호를 누르면 다음 프로젝트로 넘어갑니다", run: function (tp) {
      var num = sty(tp, "font-size:220px"), info = sty(tp, "top:300px;width:420px"), ims = $$(tp, ".ph img"), i = 0;
      var P = [["07", "House on a Slope", "Gapyeong, 2026", "A concrete house that follows the hill in four steps. Each floor is one room wide and opens to the valley.", "비탈의 집 — 언덕을 따라 네 단으로 놓인 콘크리트 주택.", ["arch-concrete-blocks", "int-stairs", "arch-steps-teal"]],
        ["08", "Courtyard Rooms", "Jeonju, 2025", "Six rooms around a timber courtyard. The roof lines follow the old houses next door.", "마당의 방 — 나무 마당을 둘러싼 여섯 개의 방.", ["kr-bench-building", "kr-wood-floor-curtain-room", "kr-roof-blue-sky"]],
        ["09", "Pool Pavilion", "Busan, 2025", "A public pool with a thin roof and a wall of glass facing the sea.", "수영장 파빌리온 — 바다를 향한 유리벽의 공공 수영장.", ["dc-pool-building-aerial", "dc-pool-ladder-wall", "arch-curve"]],
        ["10", "Forest Library", "Hongcheon, 2024", "A reading room raised above the forest floor on twelve columns.", "숲의 도서관 — 열두 개의 기둥 위에 놓인 열람실.", ["fo-misty-forest", "int-skylight-tree", "arch-white-wall"]]];
      own(num);
      num.addEventListener("click", function () {
        i = (i + 1) % P.length; var p = P[i];
        num.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(-40px)", opacity: 0 }], { duration: 180 }).onfinish = function () { num.textContent = p[0]; num.animate([{ transform: "translateY(40px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 260, easing: "cubic-bezier(.2,.7,.2,1)" }); };
        if (info) { info.innerHTML = "<b style='font-weight:500'>" + p[1] + "</b><br>" + p[2] + "<br><br>" + p[3] + "<br><br>" + ko(p[4], "opacity:.6;font-size:15px"); info.classList.remove("lv-fade"); void info.offsetWidth; info.classList.add("lv-fade"); }
        ims.forEach(function (im, k) { after(k * 120, function () { swap(im, src(p[5][k % 3])); }); });
      });
    } },
    "채워진 템플릿 P111": { hint: "사진을 끌어서 옮기고, 오른쪽 위 1 / 4 를 누르면 다음 보드", run: function (tp, st) {
      plain(tp, st);
      var pins = $$(tp, "div").filter(function (d) { return /transform:rotate/.test(d.getAttribute("style") || "") && d.querySelector("img"); });
      var boards = [null, files(FLORA), files(DREAM).slice(9, 19), files(FOOD).concat(files(ANIMAL))], orig = pins.map(function (p) { return p.querySelector("img").getAttribute("src"); }), pg = txt(tp, "1 / 4"), page = 0;
      draggable(tp, pins);
      if (pg) own(pg).addEventListener("click", function () {
        page = (page + 1) % 4; pg.textContent = (page + 1) + " / 4";
        pins.forEach(function (p, k) { after(k * 60, function () { swap(p.querySelector("img"), page ? src(boards[page][k % boards[page].length]) : orig[k]); }); });
      });
    } },
    "채워진 템플릿 P112": { hint: "제목 글자가 떠다니고, 마우스를 가까이 대면 밀려 올라갑니다", run: function (tp) {
      var t = sty(tp, "font-size:128px"), ch = wrapChars(t), m = { x: -999, y: -999 };
      var base = ch.map(function (c) { var b = boxOf(tp, c); return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; });
      tp.addEventListener("mousemove", function (e) { m = pt(tp, e); });
      tp.addEventListener("mouseleave", function () { m = { x: -999, y: -999 }; });
      frame(function (dt, now) {
        if (!tp.isConnected) return false;
        ch.forEach(function (c, i) { var d = Math.hypot(m.x - base[i].x, m.y - base[i].y), push = d < 180 ? (180 - d) / 180 * 55 : 0; c.style.transform = "translateY(" + (Math.sin(now / 650 + i * .7) * 7 - push).toFixed(1) + "px) rotate(" + (Math.sin(now / 900 + i) * 3).toFixed(1) + "deg)"; });
      });
      var dates = sty(tp, "bottom:28px;display:grid;gap:6px");
      if (dates) [].slice.call(dates.children).forEach(function (r) {
        r.style.transition = "padding-left .25s";
        r.addEventListener("mouseenter", function () { r.style.paddingLeft = "12px"; });
        r.addEventListener("mouseleave", function () { r.style.paddingLeft = ""; });
        own(r).addEventListener("click", function () { toast(tp, r.textContent.replace(/\s+/g, " ").trim() + " — 표를 담았습니다"); });
      });
    } }
  };

  /* ---------- preview window: the page at full size, working, with its 18 variants ---------- */
  var modal = document.getElementById("preview"), mStage = document.getElementById("pvStage");
  var mNo = document.getElementById("pvNo"), mDesc = document.getElementById("pvDesc"), mPal = document.getElementById("pvPal"), mType = document.getElementById("pvType");
  var pvN = 1, lastFocus = null;
  var mHint = document.getElementById("pvHint");
  function renderPreview() {
    fxClear();
    var f = find(pvN);
    mStage.innerHTML = windowFor(f.b, f.v);
    var view = mStage.querySelector(".mac-view");
    view.classList.add("live");
    scale(view); if (ro) ro.observe(view);
    if (f.b.init) f.b.init(view, true);
    tick();
    mNo.textContent = tag(pvN);
    mDesc.textContent = f.b.cat + " · " + f.b.label;
    var fx = FX[f.b.name || f.b.desc || f.b.label];
    mHint.textContent = fx ? fx.hint : "";
    var pi = Math.floor(f.v / 3), ti = f.v % 3;
    mPal.innerHTML = f.b.palettes.map(function (p, i) { return '<button type="button" data-p="' + i + '" aria-pressed="' + (i === pi) + '" aria-label="색 ' + (i + 1) + '" style="background:' + p[0] + ';color:' + p[1] + '">Aa</button>'; }).join("");
    mType.innerHTML = TYPES.map(function (t, i) { return '<button type="button" data-t="' + i + '" aria-pressed="' + (i === ti) + '">' + t.name + '</button>'; }).join("");
    fitPreview();
    liven(view, f.b);
  }
  /* the whole window must fit the screen without scrolling: size it by the height left over */
  var pvBox = modal.querySelector(".pv-box");
  function fitPreview() {
    var mac = mStage.querySelector(".mac");
    if (modal.hidden || !mac) return;
    pvBox.style.width = ""; mac.style.width = "";
    pvBox.style.maxHeight = "none"; /* measure the real height, not the clipped one */
    var cs = getComputedStyle(modal);
    var availH = modal.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 2;
    for (var k = 0; k < 3; k++) {
      var extra = pvBox.offsetHeight - mac.offsetHeight, bar = mac.firstElementChild.offsetHeight;
      var w = Math.floor(Math.min(mStage.clientWidth, Math.max(160, (availH - extra - bar) * 1.6)));
      var side = pvBox.offsetWidth - mStage.clientWidth;
      mac.style.width = w + "px";
      pvBox.style.width = (w + side) + "px";
    }
    pvBox.style.maxHeight = "";
  }
  window.addEventListener("resize", fitPreview);
  function openPreview(n) {
    pvN = n; lastFocus = document.activeElement;
    modal.hidden = false; document.body.style.overflow = "hidden";
    renderPreview();
    modal.querySelector(".pv-close").focus();
  }
  function closePreview() {
    modal.hidden = true; document.body.style.overflow = ""; mStage.innerHTML = ""; fxClear();
    if (lastFocus) lastFocus.focus();
  }
  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest(".pv-close")) return closePreview();
    var f = find(pvN), pi = Math.floor(f.v / 3), ti = f.v % 3;
    var p = e.target.closest("[data-p]"), t = e.target.closest("[data-t]");
    if (p) { pvN = f.b.first + (+p.dataset.p) * 3 + ti; renderPreview(); }
    if (t) { pvN = f.b.first + pi * 3 + (+t.dataset.t); renderPreview(); }
    if (e.target.closest(".pv-prev")) { pvN = pvN > 1 ? pvN - 1 : TOTAL; renderPreview(); }
    if (e.target.closest(".pv-next")) { pvN = pvN < TOTAL ? pvN + 1 : 1; renderPreview(); }
    if (e.target.closest(".pv-use")) { choose(pvN); closePreview(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.target.isContentEditable) { if (e.key === "Escape") e.target.blur(); e.stopPropagation(); return; }
    var tp = modal.hidden ? null : mStage.querySelector(".tp");
    var ls = tp ? tp.querySelectorAll(".lv-layer") : [];
    if (!ls.length) return;
    var top = ls[ls.length - 1];
    if (e.key === "Escape") closeTop(tp);
    else if (top.classList.contains("lv-lb") && (e.key === "ArrowLeft" || e.key === "ArrowRight")) lbStep(top, e.key === "ArrowLeft" ? -1 : 1);
    else return;
    e.preventDefault(); e.stopPropagation();
  }, true);
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") closePreview();
    if (e.key === "ArrowRight") { pvN = pvN < TOTAL ? pvN + 1 : 1; renderPreview(); }
    if (e.key === "ArrowLeft") { pvN = pvN > 1 ? pvN - 1 : TOTAL; renderPreview(); }
  });

  /* ---------- picking and stars ---------- */
  var picked = null;
  var bar = document.getElementById("pickbar"), barT = document.getElementById("pickbarT"), status = document.getElementById("pickStatus");
  function markPicked() { document.querySelectorAll(".tpl").forEach(function (c) { c.classList.toggle("is-picked", +c.dataset.n === picked); }); }
  function choose(n) {
    picked = n; markPicked();
    var f = find(n);
    barT.innerHTML = esc(host) + ' · <b>' + tag(n) + '</b> ' + f.b.label;
    bar.hidden = false;
    status.textContent = host + ", " + tag(n) + " 템플릿을 골랐습니다.";
  }
  document.addEventListener("click", function (e) {
    var sb = e.target.closest(".star");
    if (sb) {
      var n = +sb.closest(".tpl").dataset.n;
      if (stars[n]) delete stars[n]; else stars[n] = 1;
      saveStars();
      document.querySelectorAll('.tpl[data-n="' + n + '"] .star').forEach(function (b) { b.setAttribute("aria-pressed", !!stars[n]); b.textContent = stars[n] ? "★" : "☆"; });
      return;
    }
    var open = e.target.closest(".tpl-open");
    if (open) openPreview(+open.closest(".tpl").dataset.n);
  });
  document.getElementById("pickbarGo").addEventListener("click", function () {
    barT.textContent = "가입 기능은 준비 중입니다.";
    status.textContent = "가입 기능은 준비 중입니다.";
  });

  /* ---------- category links follow the section in view ---------- */
  var links = document.querySelectorAll(".cats-links a");
  function setOn(id) { links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + id); }); }
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setOn(e.target.id); }); }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".sec").forEach(function (s) { so.observe(s); });
  }
  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var s = document.querySelector(a.getAttribute("href"));
      s.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      setOn(s.id);
    });
  });

  showShuffle();
  watch();
})();
