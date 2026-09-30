/* Shared by every page: the vertical minute-of-the-day clock (n.n / 1440) */
(function () {
  var el = document.getElementById("minute");
  function minute() { var d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; }
  var el2 = document.getElementById("minute2");
  function tick() { var v = (Math.floor(minute() * 10) / 10).toFixed(1); if (el) el.textContent = v; if (el2) el2.textContent = v; }
  tick();
  setInterval(tick, 1000);
})();
