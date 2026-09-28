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
    { name: "그로테스크", font: '"Inter", "Pretendard Variable", sans-serif', stretch: "100%" },
    { name: "콘덴스드", font: '"Archivo", "Pretendard Variable", sans-serif', stretch: "75%" },
    { name: "세리프", font: '"Newsreader", "Nanum Myeongjo", serif', stretch: "100%" }
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
        '<div class="tpl-slot" data-n="' + n + '"><div class="mac mac-empty"><div class="mac-bar"></div><div class="mac-view"></div></div></div>' +
        '<span class="tpl-use" aria-hidden="true">미리보기</span></button>' +
      '<div class="tpl-cap">' +
        '<button type="button" class="star" aria-pressed="' + (!!stars[n]) + '" aria-label="' + tag(n) + ' 즐겨찾기">' + (stars[n] ? "★" : "☆") + '</button>' +
        '<span class="nm"><span class="no m">' + tag(n) + '</span><span class="dsc">' + b.label + '</span></span>' +
        '<span class="pill">18개 변형</span></div></article>';
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

  /* ---------- preview window: the page at full size, working, with its 18 variants ---------- */
  var modal = document.getElementById("preview"), mStage = document.getElementById("pvStage");
  var mNo = document.getElementById("pvNo"), mDesc = document.getElementById("pvDesc"), mPal = document.getElementById("pvPal"), mType = document.getElementById("pvType");
  var pvN = 1, lastFocus = null;
  function renderPreview() {
    var f = find(pvN);
    mStage.innerHTML = windowFor(f.b, f.v);
    var view = mStage.querySelector(".mac-view");
    view.classList.add("live");
    scale(view); if (ro) ro.observe(view);
    if (f.b.init) f.b.init(view, true);
    tick();
    mNo.textContent = tag(pvN);
    mDesc.textContent = f.b.cat + " · " + f.b.label;
    var pi = Math.floor(f.v / 3), ti = f.v % 3;
    mPal.innerHTML = f.b.palettes.map(function (p, i) { return '<button type="button" data-p="' + i + '" aria-pressed="' + (i === pi) + '" aria-label="색 ' + (i + 1) + '" style="background:' + p[0] + ';color:' + p[1] + '">Aa</button>'; }).join("");
    mType.innerHTML = TYPES.map(function (t, i) { return '<button type="button" data-t="' + i + '" aria-pressed="' + (i === ti) + '">' + t.name + '</button>'; }).join("");
  }
  function openPreview(n) {
    pvN = n; lastFocus = document.activeElement;
    modal.hidden = false; document.body.style.overflow = "hidden";
    renderPreview();
    modal.querySelector(".pv-close").focus();
  }
  function closePreview() {
    modal.hidden = true; document.body.style.overflow = ""; mStage.innerHTML = "";
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
