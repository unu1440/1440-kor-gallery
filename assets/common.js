/* Shared by every page: the vertical minute-of-the-day clock, n.n / 1440 */
(function () {
  var el = document.getElementById("minute");
  if (!el) return;
  function tick() {
    var d = new Date();
    var m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    el.textContent = (Math.floor(m * 10) / 10).toFixed(1);
  }
  tick();
  setInterval(tick, 1000);
})();
