/* Shared by every page: the vertical minute-of-the-day clock (n.n / 1440) */
(function () {
  var el = document.getElementById("minute");
  function minute() { var d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; }
  var el2 = document.getElementById("minute2");
  function tick() { var v = (Math.floor(minute() * 10) / 10).toFixed(1); if (el) el.textContent = v; if (el2) el2.textContent = v; }
  tick();
  setInterval(tick, 1000);
})();

/* Visit counts for the admin's 유입 page: which kind of page (front page, form list, editor), where the person came from
   (the link's utm tags, or the site that sent them) and phone or computer, once per visit. No cookie, no address and
   nothing about the person is kept; the tags live in this tab's sessionStorage so a later sign-up can say where it came from. */
(function () {
  if (location.hostname !== "1440.kor.gallery") return;
  var ss; try { ss = window.sessionStorage; ss.getItem("1440-utm"); } catch (e) { return; }
  function tag(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 32); }
  var q = new URLSearchParams(location.search), from = null;
  try { from = JSON.parse(ss.getItem("1440-utm") || "null"); } catch (e) {}
  if (!from) {
    var s = tag(q.get("utm_source")), c = tag(q.get("utm_campaign"));
    if (!s) {
      var h = ""; try { h = new URL(document.referrer).hostname.toLowerCase(); } catch (e) {}
      var map = [[/instagram\.com$/, "instagram"], [/facebook\.com$|fb\.com$/, "facebook"], [/kakao|kakaocdn/, "kakao"], [/naver\.com$/, "naver"], [/google\./, "google"], [/daum\.net$/, "daum"], [/youtube\.com$|youtu\.be$/, "youtube"], [/(^|\.)t\.co$|twitter\.com$|(^|\.)x\.com$/, "x"]];
      s = "direct"; if (h && h !== location.hostname) { s = tag(h.replace(/^www\./, "")) || "direct"; map.some(function (m) { if (m[0].test(h)) { s = m[1]; return true; } }); }
    }
    from = { s: s, c: c }; try { ss.setItem("1440-utm", JSON.stringify(from)); } catch (e) {}
  }
  var path = location.pathname.replace(/\/+$/, ""), ev = "";
  if (path === "" || path === "/index.html") ev = "view";
  else if (path === "/templates.html") ev = q.has("edit") ? "edit" : (q.has("view") || q.has("check") ? "" : "forms");
  if (!ev || ss.getItem("1440-hit-" + ev)) return;
  try { ss.setItem("1440-hit-" + ev, "1"); } catch (e) {}
  try { fetch("/api/hit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ev: ev, src: from.s, camp: from.c, dev: matchMedia("(max-width: 760px)").matches ? "m" : "d" }), keepalive: true }).catch(function () {}); } catch (e) {}
})();
