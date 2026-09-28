/* Checks the generated template catalogue.
   node tools/check-templates.js
   Fails when two generated templates share nav + layout + features, or the whole combination,
   when a template uses the same photograph twice, or when the numbers do not reach 1440. */
var fs = require("fs"), path = require("path"), vm = require("vm");
var root = path.join(__dirname, "..");
var sandbox = { window: {}, console: console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "assets/photos.js"), "utf8"), sandbox);
var G = require(path.join(root, "assets/tpl-gen.js"));
var HAND = G.HAND;
var photos = sandbox.window.PHOTOS, cat = G.catalogue(photos, HAND), specs = cat.specs, fail = 0;
function bad(m) { console.error("✗ " + m); fail++; }

/* templates.js is one scope: two functions or variables with the same name silently replace each other */
var page = fs.readFileSync(path.join(root, "assets/templates.js"), "utf8"), names = {};
(page.match(/^  (?:function|var) [A-Za-z0-9_$]+/gm) || []).forEach(function (m) { var n = m.trim().split(" ")[1]; if (names[n]) bad("templates.js declares " + n + " twice"); names[n] = 1; });

var last = cat.plan[cat.plan.length - 1];
if (last.first + last.hand + last.gen - 1 !== 1440) bad("numbers end at " + (last.first + last.hand + last.gen - 1) + ", not 1440");
var hand = Object.keys(HAND).reduce(function (a, k) { return a + HAND[k]; }, 0);
if (specs.length + hand !== 1440) bad(specs.length + " generated + " + hand + " hand-made ≠ 1440");

var sk = {}, fk = {}, nos = {};
specs.forEach(function (s) {
  if (sk[s.skey]) bad("same nav + layout + features: " + sk[s.skey] + " and " + s.no + " (" + s.skey + ")"); else sk[s.skey] = s.no;
  if (fk[s.key]) bad("same combination: " + fk[s.key] + " and " + s.no); else fk[s.key] = s.no;
  if (nos[s.no]) bad("number used twice: " + s.no); nos[s.no] = 1;
});

/* render every page and look for repeated photographs (data-dup marks the second layer of a before/after) */
var env = { N: "name", plain: "name", esc: function (x) { return String(x).replace(/[&<>"]/g, ""); }, src: function (f) { return "assets/img/samples/" + f + ".jpg"; },
  photo: function (f) { var p = photos.filter(function (x) { return x[0] === f; })[0]; return { f: f, ko: p[1], g: p[2], en: G.enName(f) }; } };
var use = {};
specs.forEach(function (s) {
  /* the second layer of a before/after and the loupe lens magnify the same picture on purpose */
  var r = G.render(s, env), out = r.html.replace(/<img data-dup[^>]*>/g, "").replace(/background-image:url\([^)]*\)/g, "");
  var seen = {}, basicOk = s.cat === "basic"; /* basic templates share pictures, as Cargo's do */
  (out.match(/samples\/[a-z0-9-]+\.jpg/g) || []).concat((out.match(/data-img="[a-z0-9-]+"/g) || []).map(function (m) { return "samples/" + m.slice(10, -1) + ".jpg"; })).forEach(function (m) {
    if (seen[m] && !(basicOk && s.photos.length > G.SHARED.length)) bad(s.no + " uses " + m + " twice"); seen[m] = 1;
  });
  /* pictures waiting in a slideshow, a floor-plan room or a name list count as shown */
  (out.match(/data-(imgs|rf)="[^"]+"/g) || []).forEach(function (m) { m.replace(/^[^"]*"|"$/g, "").split(",").forEach(function (f) { if (f) seen["samples/" + f + ".jpg"] = 1; }); });
  var shown = Object.keys(seen).length; for (var k = 1; k < (r.slides || 0); k++) if (!seen["samples/" + s.photos[k] + ".jpg"]) shown++;
  if (s.cat !== "blank" && !basicOk && shown !== s.photos.length) bad(s.no + " (" + s.layout + ") shows " + Object.keys(seen).length + " of its " + s.photos.length + " photographs");
  if (s.cat !== "basic") Object.keys(seen).forEach(function (m) { use[m] = (use[m] || 0) + 1; });
});
/* the hand-made list in tpl-gen.js must match what templates.js shows */
var names = {}; photos.forEach(function (p) { names[p[0]] = 1; });
var pageSrc = fs.readFileSync(path.join(root, "assets/templates.js"), "utf8"), hs = {};
(pageSrc.slice(pageSrc.indexOf("  F.graphic = ["), pageSrc.indexOf("/* ---------- the catalogue")).match(/[a-z]+-[a-z0-9-]+/g) || []).forEach(function (f) { if (names[f]) hs[f] = 1; });
var hl = Object.keys(hs).sort().join(), gl = G.HAND_USED.slice().sort().join();
if (hl !== gl) bad("tpl-gen.js HAND_USED is out of date with the hand-made templates");
G.HAND_USED.forEach(function (f) { use["samples/" + f + ".jpg"] = (use["samples/" + f + ".jpg"] || 0) + 1; });
var counts = Object.keys(use).map(function (k) { return use[k]; }).sort(function (a, b) { return a - b; });
console.log("generated " + specs.length + " + hand-made " + hand + " = " + (specs.length + hand));
console.log("unique nav+layout+features: " + Object.keys(sk).length + ", unique combinations: " + Object.keys(fk).length);
console.log("photographs: " + photos.length + " in the pool; basic templates share " + G.SHARED.length);
console.log("other templates: " + counts.length + " photographs used; per photograph min " + counts[0] + " / median " + counts[counts.length >> 1] + " / max " + counts[counts.length - 1]);
console.log(specs.strict ? "✓ no photograph is shared between templates (outside the basic set)" : "! photographs are still shared between templates: " + specs.demand + " needed for none to be, " + specs.pool + " available — add about " + (specs.demand - specs.pool) + " more");
var layouts = {}; specs.forEach(function (s) { layouts[s.layout] = (layouts[s.layout] || 0) + 1; });
console.log("layouts: " + Object.keys(layouts).length);
if (fail) { console.error(fail + " problem(s)"); process.exit(1); }
console.log("✓ ok");
