/* Shared by every page: the vertical minute-of-the-day clock (n.n / 1440) and the light behind the page that
   follows the time of day */
(function () {
  var el = document.getElementById("minute");
  function minute() { var d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; }
  var el2 = document.getElementById("minute2");
  function tick() { var v = (Math.floor(minute() * 10) / 10).toFixed(1); if (el) el.textContent = v; if (el2) el2.textContent = v; }
  tick();
  setInterval(tick, 1000);

  /* the light: by day a sun that rises at the lower left, stands high at noon and sets warm at the lower right;
     by night a faint cool moon crossing the top the other way. Very soft: most of the day it is barely there */
  var root = document.documentElement.style;
  function light() {
    var m = minute(), rise = 360, day = 780, t = (m - rise) / day, x, y, c;
    if (t >= 0 && t <= 1) {
      var e = Math.sin(Math.PI * t), a = 0.42 * Math.min(1, t * 7, (1 - t) * 7);
      x = 6 + 88 * t; y = 108 - 96 * e;
      c = "rgba(255," + Math.round(190 + 58 * e) + "," + Math.round(140 + 92 * e) + "," + a.toFixed(3) + ")";
    } else {
      var n = ((m - rise - day) % 1440 + 1440) % 1440 / (1440 - day), b = 0.3 * Math.min(1, n * 6, (1 - n) * 6);
      x = 92 - 84 * n; y = 10 + 14 * Math.abs(n - 0.5);
      c = "rgba(150,168,214," + b.toFixed(3) + ")";
    }
    root.setProperty("--sun-x", x.toFixed(1) + "%");
    root.setProperty("--sun-y", y.toFixed(1) + "%");
    root.setProperty("--sun-c", c);
  }
  light();
  setInterval(light, 60000);
})();
