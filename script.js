/* ==========================================================================
   AI Film Portfolio — orbit, drag/momentum/snap, glass player morph
   ========================================================================== */
(function () {
  "use strict";
  var FILMS = window.FILMS || [], SITE = window.SITE || {};
  // with only a few films, each one floats twice in the cloud (at different depths) so the space feels full
  var NF = FILMS.length, COPIES = NF && NF < 6 ? 2 : 1, N = NF * COPIES, STEP = (Math.PI * 2) / Math.max(1, N);
  var filmOf = function (c) { return NF ? c % NF : 0; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia && matchMedia("(pointer: fine)").matches;
  if (RM) document.documentElement.classList.add("reduce");
  var stage = $("#stage"), ring = $("#ring"), me = $("#me"), headEl = $("#head");
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var TAU = Math.PI * 2;
  var wrap = function (a) { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
  var toSec = function (d) { var p = String(d || "0:30").split(":").map(Number); return p.length > 1 ? p[0] * 60 + p[1] : p[0]; };
  var fmt = function (s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + pad(s % 60); };

  /* ------------------------------------------------------------------ site text */
  $("#siteName").textContent = SITE.name || "Your Name";
  $("#siteRole").textContent = SITE.role || "AI Filmmaker";
  document.title = (SITE.name || "Your Name") + " — " + (SITE.role || "AI Filmmaker");
  $("#nowTotal").textContent = pad(NF);

  /* ------------------------------------------------------------------ cards */
  var IC = {
    shuffle: '<svg viewBox="0 0 24 24"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
    rew: '<svg viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm9 0V6l-8.5 6 8.5 6z"/></svg>',
    fwd: '<svg viewBox="0 0 24 24"><path d="M13 6v12l8.5-6L13 6zM4 6v12l8.5-6L4 6z"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24"><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9z"/></svg>',
    volLo: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/></svg>',
    volHi: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>',
  };
  function thumbHTML(f, label) {
    var m = f.mood || ["#ff9a5a", "#7b2cff", "#0b1020"];
    if (f.poster) return '<img src="' + f.poster + '" alt="" draggable="false">';
    return '<div class="ph" style="--m1:' + m[0] + ";--m2:" + m[1] + ";--m3:" + m[2] + ';animation-delay:' + (-Math.random() * 14).toFixed(1) + 's">' + (label ? '<span class="ph-t">' + esc(f.title) + "</span>" : "") + "</div>";
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // designed film cover: colour backdrop from the film's mood, the real frame from Drive on top when
  // available (public files), then poster typography. kind = "art" (card square), "list", "full" (player)
  function coverImg(f) { return f.poster || (f.drive ? "https://drive.google.com/thumbnail?id=" + encodeURIComponent(f.drive) + "&sz=w1600" : ""); }
  function coverHTML(f, fi, kind) {
    var m = f.mood || ["#ff9a5a", "#7b2cff", "#0b1020"], img = coverImg(f), no = pad(fi + 1), who = esc(SITE.name || "");
    var text;
    if (kind === "art") text = '<b class="cv-num">' + no + "</b>";
    else if (kind === "list") text = '<b class="cv-num">' + no + '</b><span class="cv-mini">' + esc(f.title) + "</span>";
    else text =
      '<div class="cv-top"><span>' + who.toUpperCase() + ' · ORIGINAL</span><span>No. ' + no + "</span></div>" +
      '<div class="cv-mid"><span class="cv-kick">An AI short film</span><b class="cv-title">' + esc(f.title) + '</b><span class="cv-by">by ' + who + "</span></div>" +
      '<div class="cv-bot"><span>' + esc(f.year || "") + (f.duration ? " · " + esc(f.duration) : "") + '</span><i class="cv-rule"></i><span>FILM WITH ' + who.toUpperCase() + "</span></div>";
    return '<div class="cover cv-' + kind + '" style="--m1:' + m[0] + ";--m2:" + m[1] + ";--m3:" + m[2] + '">' +
      '<div class="ph" style="--m1:' + m[0] + ";--m2:" + m[1] + ";--m3:" + m[2] + ";animation-delay:" + (-(fi * 3.7) % 14).toFixed(1) + 's"></div>' +
      (img ? '<img class="cv-img" src="' + esc(img) + '" alt="" draggable="false" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : "") +
      '<div class="cv-shade"></div><div class="cv-text">' + text + "</div></div>";
  }

  var cards = [];
  for (var ci = 0; ci < N; ci++) cards.push((function (i) {
    var fi = filmOf(i), f = FILMS[fi], copy = Math.floor(i / Math.max(1, NF));
    var el = document.createElement("div");
    var size = copy === 0 ? (f.size || "M") : ({ L: "S", M: "L", S: "M" }[f.size || "M"]);
    el.className = "card s-" + size;
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", copy === 0 ? "0" : "-1");
    if (copy) el.setAttribute("aria-hidden", "true");
    el.setAttribute("aria-label", "Play film " + f.title + (f.duration ? ", " + f.duration : ""));
    el.dataset.i = i;
    var tot = f.duration ? toSec(f.duration) : 0, at = Math.round(tot * (0.15 + ((i * 37) % 55) / 100));
    var alt = i % 2; // two control layouts, like real players
    el.innerHTML =
      '<div class="c-top"><div class="c-art">' + coverHTML(f, fi, "art") + '<span class="c-play">' + IC.play + '</span></div>' +
      '<div class="c-names"><div class="c-title">' + esc(f.title) + '</div><div class="c-sub">' + esc(SITE.name || "AI Film") + " · " + f.year + '</div></div><span class="c-heart">' + IC.heart + "</span></div>" +
      '<div class="c-bar" style="--p:' + (tot ? Math.round((at / tot) * 100) : 8 + (i * 17) % 30) + '%"><i></i></div>' +
      '<div class="c-times">' + (tot ? "<span>" + fmt(at) + "</span><span>-" + fmt(tot - at) + "</span>" : "<span>0:00</span><span>▶ Watch</span>") + "</div>" +
      '<div class="c-ctrl"><span class="i">' + IC.shuffle + '</span><span class="i lg f">' + (alt ? IC.rew : IC.prev) + '</span><span class="pl">' + IC.pause + '</span><span class="i lg f">' + (alt ? IC.fwd : IC.next) + '</span><span class="i">' + IC.repeat + "</span></div>" +
      '<div class="c-vol"><span class="i">' + IC.volLo + '</span><div class="c-bar" style="--p:' + (55 + (i * 11) % 35) + '%"><i></i></div><span class="i">' + IC.volHi + "</span></div>";
    ring.appendChild(el);
    return el;
  })(ci));

  // a loose, hand-scattered cloud: every card has its own angle, distance, height and tilt
  var MUL = [3, 5, 7, 11, 13].filter(function (m) { var a = m, b = Math.max(1, N); while (b) { var t = b; b = a % b; a = t; } return a === 1; })[0] || 1;
  var CLOUD = cards.map(function (c, i) {
    return {
      a: i * STEP + (((i * 7) % 5) - 2) * 0.13,                         // angle around me
      rf: 0.78 + ((i * 13) % 5) * 0.11,                                  // distance from me
      h: -0.36 + (((i * MUL) % N) / Math.max(1, N - 1)) * 0.72,          // height (fraction of screen), spread evenly
      rx: (((i * 5) % 7) - 3) * 2.6,                                     // forward/back tilt
      sp: 0.7 + ((i * 3) % 5) * 0.12, ph: i * 1.7,                       // float speed + phase
    };
  });

  /* ------------------------------------------------------------------ geometry */
  // where I am inside the original 1200×1600 photo (used to keep me in frame and line the cutout up)
  var PHOTO = { w: 2172, h: 2896, cut: { x: 783, y: 1142, w: 499, h: 1672 }, headImg: { x: 1027, y: 914, w: 214, h: 298 }, pivot: { x: 1124, y: 1196 }, person: { cx: 1031, top: 917, h: 1894 }, head: { x: 1135, y: 1035, r: 118 } };
  var photo = $("#photo"), G = {};
  // my head follows the cursor: it tilts and leans towards wherever the mouse is
  var LOOK = { x0: 0, y0: 0, s: 1, px: 0, py: 0, mx: null, my: null, a: 0, tx: 0, ty: 0, dirty: true };
  function layout() {
    var W = innerWidth, H = innerHeight, mob = W < 860;
    var frac = mob ? 0.55 : 0.9;                       // how tall I appear on screen
    var s = Math.max(W / PHOTO.w, H / PHOTO.h, (frac * H) / PHOTO.person.h);
    var iw = PHOTO.w * s, ih = PHOTO.h * s;
    var ox = Math.min(0, Math.max(W - iw, W / 2 - PHOTO.person.cx * s));
    var oy = Math.min(0, Math.max(H - ih, H * (mob ? 0.3 : 0.05) - PHOTO.person.top * s));
    photo.style.width = iw + "px"; photo.style.height = ih + "px";
    photo.style.transform = "translate(" + ox + "px," + oy + "px)";
    me.style.width = PHOTO.cut.w * s + "px"; me.style.height = PHOTO.cut.h * s + "px";
    me.style.transform = "translate(" + (ox + PHOTO.cut.x * s) + "px," + (oy + PHOTO.cut.y * s) + "px)";
    headEl.style.width = PHOTO.headImg.w * s + "px"; headEl.style.height = PHOTO.headImg.h * s + "px";
    headEl.style.transformOrigin = (PHOTO.pivot.x - PHOTO.headImg.x) * s + "px " + (PHOTO.pivot.y - PHOTO.headImg.y) * s + "px";
    LOOK.x0 = ox + PHOTO.headImg.x * s; LOOK.y0 = oy + PHOTO.headImg.y * s; LOOK.s = s;
    LOOK.px = ox + PHOTO.pivot.x * s; LOOK.py = oy + PHOTO.head.y * s;
    LOOK.dirty = true;
    G = {
      W: W, H: H, mob: mob, s: s,
      k: mob ? Math.max(1, Math.min(1.45, Math.min(W / 390, H / 760))) : Math.max(0.85, Math.min(1.4, Math.min(H / 900, W / 1440))), // card size for this screen
      cx: ox + PHOTO.person.cx * s,
      cy: mob ? H * 0.5 : H * 0.5,
      rx: mob ? W * 0.47 : Math.min(W * 0.4, 640),
      hy: mob ? H * 0.84 : H * 0.92,                   // vertical spread of the cloud
      headX: ox + PHOTO.head.x * s, headY: oy + PHOTO.head.y * s, headR: PHOTO.head.r * s,
      cw: cards.map(function (c) { return c.offsetWidth; }), ch: cards.map(function (c) { return c.offsetHeight; }),
    };
  }
  layout();
  addEventListener("resize", function () { layout(); sizeDust(); });

  /* ------------------------------------------------------------------ state */
  var S = {
    base: 0, vel: 0, target: null, speed: 0, dragging: false, hover: -1, open: -1,
    lastInteract: -1e9, intro: 0, introStart: 0, hero: -1, dim: 0,
  };
  var OMEGA = TAU / 60; // one slow turn ≈ 60 s

  function heroIndex(base) {
    var best = 0, bd = 9;
    for (var i = 0; i < N; i++) { var dd = Math.abs(wrap(base + CLOUD[i].a)); if (dd < bd) { bd = dd; best = i; } }
    return best;
  }
  function targetFor(i) { return S.base + wrap(-(S.base + CLOUD[i].a)); }
  function snapTo(i) { S.vel = 0; S.target = targetFor(((i % N) + N) % N); poke(); }
  function step(dir) { var h = S.target != null ? heroIndex(S.target) : heroIndex(S.base); snapTo(h + dir); }
  function poke() { S.lastInteract = performance.now(); hideHint(); }

  /* ------------------------------------------------------------------ render loop */
  var last = performance.now();
  var easeOutBack = function (t) { var c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  // if the browser can't keep up (no GPU acceleration, battery saver, weak laptop), switch to "lite":
  // plain tinted glass instead of live blur, no dust or grain. Measured over 2 s once the intro is done.
  var PW = { t0: 0, n: 0, done: false };
  function perfWatch(now) {
    if (PW.done || S.intro < 1 || document.hidden) return;
    if (!PW.t0) { PW.t0 = now; PW.n = 0; return; }
    PW.n++;
    if (now - PW.t0 >= 2000) {
      var fps = PW.n * 1000 / (now - PW.t0); PW.done = true;
      if (fps < 42) document.documentElement.classList.add("lite");
    }
  }
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;

    // intro
    if (S.introStart && S.intro < 1) S.intro = Math.min(1, (now - S.introStart) / (RM ? 400 : 1900));

    // motion
    if (S.open < 0 && !S.dragging) {
      if (Math.abs(S.vel) > 0.12) {
        S.base += S.vel * dt; S.vel *= Math.exp(-dt * 2.6);
        if (Math.abs(S.vel) <= 0.12) { S.vel = 0; S.target = targetFor(heroIndex(S.base)); }
      } else if (S.target != null) {
        var k = 1 - Math.exp(-dt * (RM ? 30 : 7));
        S.base += (S.target - S.base) * k;
        if (Math.abs(S.target - S.base) < 0.0008) { S.base = S.target; S.target = null; }
      } else {
        var idle = now - S.lastInteract > 3000 && S.hover < 0 && !RM && S.intro >= 1;
        var want = idle ? -OMEGA : 0;
        S.speed += (want - S.speed) * (1 - Math.exp(-dt * 1.6));
        S.base += S.speed * dt;
      }
    }
    S.dim += ((S.open >= 0 ? 1 : 0) - S.dim) * (1 - Math.exp(-dt * 7));

    // while a film is open the ring is hidden behind the player: stop re-rendering it once it has dimmed
    if (S.open >= 0 && S.dim > 0.985) { requestAnimationFrame(frame); return; }
    var introE = S.intro >= 1 ? 1 : easeOutBack(S.intro);
    var spinIn = (1 - Math.min(1, S.intro)) * 1.6; // films swirl out from behind me
    var t = now / 1000;
    for (var i = 0; i < N; i++) {
      var C = CLOUD[i], el = cards[i];
      var th = S.base + C.a + spinIn, s = Math.sin(th), d = Math.cos(th), t01 = (d + 1) / 2;
      var hov = S.hover === i ? 1 : 0;
      var sc = (0.6 + 0.44 * Math.pow(t01, 1.2)) * (1 + hov * 0.05) * (0.3 + 0.7 * Math.min(1, introE)) * G.k;
      var fx = RM ? 0 : Math.sin(t * 0.35 * C.sp + C.ph) * 10, fy = RM ? 0 : Math.sin(t * 0.6 * C.sp + C.ph * 1.3) * 9;
      var x = G.cx + s * G.rx * C.rf * introE + fx;
      var y = G.cy + (C.h * G.hy + d * G.H * 0.035) * introE + fy - hov * 10;
      // front films drift around my face instead of covering it
      if (d > 0 && S.intro >= 1) {
        var hw = G.cw[i] * sc * 0.5, hh = G.ch[i] * sc * 0.5;
        var nx = 1 - Math.abs(x - G.headX) / (hw + G.headR);
        var gap = hh + G.headR - Math.abs(y - G.headY);
        if (nx > 0 && gap > 0) { var e = nx * nx * (3 - 2 * nx); y += (y < G.headY ? -1 : 1) * gap * e * Math.min(1, d * 1.6); }
      }
      // 3D tilt: each card turns towards me, plus its own lean (like glass panes in space)
      var ry = -s * 24 + Math.sin(t * 0.3 * C.sp + C.ph) * (RM ? 0 : 3);
      var rx = C.rx + Math.sin(t * 0.4 * C.sp + C.ph) * (RM ? 0 : 2);
      var rz = -s * 3 + C.rx * 0.4;
      var op = (0.62 + 0.38 * t01) * (1 - S.dim * 0.5) * Math.min(1, S.intro * 2.2);
      // cards at the back skip the frosted-glass pass (cheap); only toggled when they cross over
      var far = d < -0.25; if (far !== !!el._far) { el._far = far; el.classList.toggle("far", far); }
      var z = S.intro < 0.35 ? 400 - i : 500 + Math.round(d * 300) + hov * 40;
      el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%) perspective(900px) rotateY(" + ry.toFixed(2) + "deg) rotateX(" + rx.toFixed(2) + "deg) rotate(" + rz.toFixed(2) + "deg) scale(" + sc.toFixed(4) + ")";
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = z;
    }

    var h = heroIndex(S.target != null ? S.target : S.base);
    if (h !== S.hero && S.open < 0) setNow(h);
    perfWatch(now);
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ now showing */
  function filmMeta(f) { return [f.year, f.duration].concat((f.tools || []).slice(0, 2)).filter(Boolean).join(" · "); }
  function cardFor(fi) { // the copy of this film nearest the front
    var best = fi, bd = 9;
    for (var c = fi; c < N; c += NF) { var dd = Math.abs(wrap(S.base + CLOUD[c].a)); if (dd < bd) { bd = dd; best = c; } }
    return best;
  }
  function setNow(i) {
    S.hero = i;
    var fi = filmOf(i), f = FILMS[fi], tx = $(".now-text");
    $("#nowIdx").textContent = pad(fi + 1);
    $("#nowTitle").textContent = f.title;
    $("#nowMeta").textContent = filmMeta(f);
    tx.classList.remove("swap"); void tx.offsetWidth; tx.classList.add("swap");
  }

  /* ------------------------------------------------------------------ pointer: drag / momentum / click */
  var P = null;
  stage.addEventListener("pointerdown", function (e) {
    if (S.open >= 0 || e.button > 0) return;
    var c = e.target.closest && e.target.closest(".card");
    P = { id: e.pointerId, x0: e.clientX, y0: e.clientY, lx: e.clientX, lt: performance.now(), card: c, moved: false, v: 0 };
    stage.setPointerCapture(e.pointerId);
  });
  addEventListener("pointermove", function (e) { if (e.pointerType === "mouse" || FINE) { LOOK.mx = e.clientX; LOOK.my = e.clientY; } }, { passive: true });
  document.addEventListener("pointerleave", function () { LOOK.mx = LOOK.my = null; });
  (function look(now) {
    var W = innerWidth, H = innerHeight, ta = 0, ttx = 0, tty = 0;
    if (LOOK.mx != null && !RM) {
      var dx = (LOOK.mx - LOOK.px) / (W * 0.5), dy = (LOOK.my - LOOK.py) / (H * 0.5);
      dx = Math.max(-1.2, Math.min(1.2, dx)); dy = Math.max(-1.2, Math.min(1.2, dy));
      ta = dx * 7 - dx * dy * 1.5;               // tilt towards the cursor (degrees)
      ttx = dx * 9; tty = dy * 6;                // lean a little that way
    } else if (!RM) {                            // no mouse (phones): a slow, gentle sway
      var t = (now || 0) / 1000; ta = Math.sin(t * 0.5) * 2.2; ttx = Math.sin(t * 0.5) * 3; tty = Math.sin(t * 0.37) * 1.5;
    }
    var k = 0.085;
    var na = LOOK.a + (ta - LOOK.a) * k, nx = LOOK.tx + (ttx - LOOK.tx) * k, ny = LOOK.ty + (tty - LOOK.ty) * k;
    if (LOOK.dirty || Math.abs(na - LOOK.a) > 0.002 || Math.abs(nx - LOOK.tx) > 0.01 || Math.abs(ny - LOOK.ty) > 0.01) {
      LOOK.a = na; LOOK.tx = nx; LOOK.ty = ny; LOOK.dirty = false;
      headEl.style.transform = "translate(" + (LOOK.x0 + nx * LOOK.s * 2).toFixed(2) + "px," + (LOOK.y0 + ny * LOOK.s * 2).toFixed(2) + "px) rotate(" + na.toFixed(3) + "deg)";
    }
    requestAnimationFrame(look);
  })();
  stage.addEventListener("pointermove", function (e) {
    if (FINE && !G.mob) { stage.style.setProperty("--px", (e.clientX / G.W - 0.5).toFixed(3)); stage.style.setProperty("--py", (e.clientY / G.H - 0.5).toFixed(3)); }
    if (!P || e.pointerId !== P.id) return;
    var dx = e.clientX - P.x0, dy = e.clientY - P.y0;
    if (!P.moved && Math.hypot(dx, dy) > (e.pointerType === "touch" ? 10 : 6)) {
      P.moved = true; S.dragging = true; S.target = null; S.vel = 0; stage.classList.add("dragging"); setHover(-1); poke();
    }
    if (!P.moved) return;
    var now = performance.now(), mdx = e.clientX - P.lx, dtm = Math.max(1, now - P.lt) / 1000;
    var dth = mdx / (G.rx * 1.05);
    S.base += dth;
    P.v = P.v * 0.6 + (dth / dtm) * 0.4;
    P.lx = e.clientX; P.lt = now; S.lastInteract = now;
  });
  function endPointer(e) {
    if (!P || e.pointerId !== P.id) return;
    if (P.moved) {
      S.dragging = false; stage.classList.remove("dragging");
      var since = performance.now() - P.lt;
      S.vel = since > 90 ? 0 : Math.max(-7, Math.min(7, P.v));
      if (Math.abs(S.vel) <= 0.12) { S.vel = 0; S.target = targetFor(heroIndex(S.base)); }
      poke();
    } else if (P.card && e.type === "pointerup") {
      openFilm(+P.card.dataset.i);
    }
    P = null;
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  // hover (mouse only)
  function setHover(i) {
    if (S.hover === i) return;
    if (S.hover >= 0) { cards[S.hover].classList.remove("hover"); stopPreview(S.hover); }
    S.hover = i;
    if (i >= 0) { cards[i].classList.add("hover"); startPreview(i); }
  }
  cards.forEach(function (el, i) {
    el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse" && !S.dragging && S.open < 0) setHover(i); });
    el.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && S.hover === i) { setHover(-1); S.lastInteract = performance.now() - 1500; } });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFilm(i); } });
    el.addEventListener("focus", function () { if (kbNav) snapTo(i); });
  });
  var kbNav = false;
  addEventListener("keydown", function (e) { if (e.key === "Tab") kbNav = true; }, true);
  addEventListener("pointerdown", function () { kbNav = false; }, true);

  // muted looping preview inside the hovered card (only when the film has a video)
  var previews = {};
  function startPreview(i) {
    var f = FILMS[filmOf(i)]; if (!f.src) return;
    var th = cards[i].querySelector(".c-art");
    var v = previews[i] || document.createElement("video");
    if (!previews[i]) { v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata"; v.src = f.src; v.style.opacity = 0; v.style.transition = "opacity .5s"; th.appendChild(v); previews[i] = v; }
    v.play().then(function () { v.style.opacity = 1; }).catch(function () {});
  }
  // release the file once the preview fades, so idle cards never hold a download open
  function stopPreview(i) {
    var v = previews[i]; if (!v) return;
    v.pause(); v.style.opacity = 0; delete previews[i];
    setTimeout(function () { v.removeAttribute("src"); v.load(); v.remove(); }, 550);
  }
  function stopAllPreviews() { Object.keys(previews).forEach(stopPreview); }

  // wheel + keys + buttons
  var wAcc = 0, wLast = 0;
  stage.addEventListener("wheel", function (e) {
    if (S.open >= 0) return;
    e.preventDefault();
    wAcc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    var now = performance.now();
    if (Math.abs(wAcc) > 40 && now - wLast > 280) { step(wAcc > 0 ? 1 : -1); wAcc = 0; wLast = now; }
  }, { passive: false });
  addEventListener("keydown", function (e) {
    if (!$("#panelWrap").hidden) { if (e.key === "Escape") closePanel(); return; }
    if (S.open >= 0) {
      if (e.key === "Escape") closeFilm();
      else if (e.key === "ArrowRight") switchFilm(1);
      else if (e.key === "ArrowLeft") switchFilm(-1);
      else if (e.key === " " && e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT") { e.preventDefault(); togglePlay(); }
      return;
    }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  });
  $("#prevBtn").onclick = function () { step(-1); };
  $("#nextBtn").onclick = function () { step(1); };

  /* ------------------------------------------------------------------ hint */
  var hint = $("#hint"), hintTimer;
  var seen = false; try { seen = localStorage.getItem("aifilm.hint") === "1"; } catch (e) {}
  function showHint() { if (seen) return; hint.classList.add("show"); hintTimer = setTimeout(hideHint, 7000); }
  function hideHint() { if (!hint.classList.contains("show")) return; hint.classList.remove("show"); clearTimeout(hintTimer); seen = true; try { localStorage.setItem("aifilm.hint", "1"); } catch (e) {} }

  /* ------------------------------------------------------------------ player */
  var wrapEl = $("#playerWrap"), player = $("#player"), pv = $("#pv"), canvas = $("#pvCanvas"), scrub = $("#pScrub");
  var PL = { i: -1, video: null, playing: false, t: 0, dur: 30, muted: false, raf: 0, idleT: 0 };

  function fillPlayer(i) {
    var f = FILMS[i];
    PL.i = i; PL.t = 0; PL.dur = f.duration ? toSec(f.duration) : 30; PL.playing = false;
    $("#pTitle").textContent = f.title;
    $("#pIdx").textContent = pad(i + 1) + " / " + pad(NF);
    $("#pMeta").textContent = [SITE.name, f.year, f.duration].filter(Boolean).join(" · ");
    $("#pDesc").textContent = f.description || "";
    $("#pTools").innerHTML = (f.tools || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
    $("#pPrevT").textContent = FILMS[(i - 1 + NF) % NF].title;
    $("#pNextT").textContent = FILMS[(i + 1) % NF].title;
    $("#pvBig").textContent = f.title;
    $("#pvCover").innerHTML = coverHTML(f, i, "full");
    var open = $("#pOpen");
    if (f.drive) { open.href = "https://drive.google.com/file/d/" + encodeURIComponent(f.drive) + "/view"; open.hidden = false; } else open.hidden = true;
    if (PL.video) { PL.video.pause(); PL.video.remove(); PL.video = null; }
    if (PL.embed) { PL.embed.remove(); PL.embed = null; }
    pv.classList.remove("playing", "has-video", "has-embed", "embedded", "idle");
    if (f.drive) pv.classList.add("has-embed");
    if (f.src) {
      var v = document.createElement("video");
      v.playsInline = true; v.preload = "auto"; v.src = f.src; v.muted = PL.muted;
      if (f.poster) v.poster = f.poster;
      v.addEventListener("loadedmetadata", function () { PL.dur = v.duration || PL.dur; updTime(); });
      v.addEventListener("timeupdate", function () { PL.t = v.currentTime; updTime(); });
      v.addEventListener("ended", function () { setPlaying(false); });
      pv.insertBefore(v, pv.firstChild);
      PL.video = v; pv.classList.add("has-video");
    }
    pv.style.setProperty("--m1", f.mood[0]);
    updTime();
  }
  function updTime() {
    $("#pTime").textContent = fmt(PL.t); $("#pDur").textContent = fmt(PL.dur);
    var p = PL.dur ? PL.t / PL.dur : 0;
    if (!scrub.matches(":active")) scrub.value = Math.round(p * 1000);
    scrub.style.setProperty("--v", (p * 100).toFixed(1) + "%");
  }
  // Google Drive films play in Drive's own player (it has its own controls)
  function loadEmbed() {
    var f = FILMS[PL.i]; if (!f || !f.drive || PL.embed) return;
    var fr = document.createElement("iframe");
    fr.className = "pv-embed";
    fr.src = "https://drive.google.com/file/d/" + encodeURIComponent(f.drive) + "/preview";
    fr.setAttribute("allow", "autoplay; fullscreen; encrypted-media; picture-in-picture");
    fr.setAttribute("allowfullscreen", "");
    fr.title = f.title;
    pv.appendChild(fr); PL.embed = fr;
    pv.classList.add("embedded");
  }
  function setPlaying(on) {
    if (FILMS[PL.i] && FILMS[PL.i].drive) { if (on) loadEmbed(); return; }
    PL.playing = on;
    pv.classList.toggle("playing", on);
    if (PL.video) { if (on) PL.video.play().catch(function () { setPlaying(false); }); else PL.video.pause(); }
    if (on && PL.t >= PL.dur - 0.05) PL.t = 0;
    bumpIdle();
  }
  function togglePlay() { setPlaying(!PL.playing); }
  $("#pPlay").onclick = togglePlay;
  $("#pvBigPlay").onclick = function () { setPlaying(true); };
  // swallow the "ghost" click a touch tap fires onto whatever appears under the finger as the player opens
  wrapEl.addEventListener("click", function (e) { if (performance.now() - (PL.openedAt || 0) < 500) { e.stopPropagation(); e.preventDefault(); } }, true);
  pv.addEventListener("click", function (e) { if (e.target === canvas || e.target === PL.video || e.target.closest(".pv-soon") || e.target.closest(".pv-cover")) togglePlay(); });
  scrub.addEventListener("input", function () {
    PL.t = (scrub.value / 1000) * PL.dur;
    if (PL.video) PL.video.currentTime = PL.t;
    updTime();
  });
  $("#pMute").onclick = function () { PL.muted = !PL.muted; pv.classList.toggle("muted", PL.muted); if (PL.video) PL.video.muted = PL.muted; };
  $("#pFull").onclick = function () {
    var d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else (pv.requestFullscreen || pv.webkitRequestFullscreen || function () {}).call(pv);
  };
  function bumpIdle() { pv.classList.remove("idle"); clearTimeout(PL.idleT); if (PL.playing) PL.idleT = setTimeout(function () { pv.classList.add("idle"); }, 2600); }
  pv.addEventListener("pointermove", bumpIdle);
  $("#pPrev").onclick = function () { switchFilm(-1); };
  $("#pNext").onclick = function () { switchFilm(1); };
  $("#pClose").onclick = closeFilm;
  $("#scrim").onclick = closeFilm;

  function switchFilm(dir) {
    var ni = (PL.i + dir + NF) % NF, body = player.querySelector(".p-body");
    var go = function () {
      fillPlayer(ni);
      // keep the cloud in sync behind the player so closing returns to this film's card
      var nc = cardFor(ni);
      cards[S.open].classList.remove("opened"); S.open = nc; cards[nc].classList.add("opened");
      S.base = targetFor(nc); S.target = null; S.vel = 0; setNow(nc);
    };
    if (RM) { go(); return; }
    body.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + (-dir * 14) + "px)" }], { duration: 180, easing: "ease-in" }).finished.then(function () {
      go();
      body.animate([{ opacity: 0, transform: "translateX(" + (dir * 14) + "px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
    });
  }

  // placeholder "film": slow colour fields, light sweep, grain, simulated playback
  function drawPlaceholder(now) {
    var f = FILMS[PL.i]; if (!f || wrapEl.hidden) { PL.raf = 0; return; }
    if (PL.video) { PL.raf = requestAnimationFrame(drawPlaceholder); return; } // real film: nothing to paint
    var dpr = Math.min(1.5, devicePixelRatio || 1), w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    var ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height, m = f.mood;
    var dt = PL.lastNow ? Math.min(0.5, (now - PL.lastNow) / 1000) : 0; PL.lastNow = now; // real time, even on slow frames
    if (PL.playing && !PL.video) { PL.t += dt; if (PL.t >= PL.dur) { PL.t = PL.dur; setPlaying(false); } updTime(); }
    var sp = PL.playing ? 1 : 0.25; PL.clock = (PL.clock || 0) + dt * sp;
    var c = PL.clock, scene = Math.floor((PL.t || 0) / 5);
    ctx.fillStyle = m[2]; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (var k = 0; k < 4; k++) {
      var ph = k * 1.9 + scene * 0.8;
      var x = W * (0.5 + 0.38 * Math.sin(c * (0.21 + k * 0.05) + ph)), y = H * (0.5 + 0.34 * Math.cos(c * (0.17 + k * 0.04) + ph * 1.3));
      var r = Math.max(W, H) * (0.32 + 0.1 * Math.sin(c * 0.3 + k));
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexA(m[k % 2], 0.55)); g.addColorStop(1, hexA(m[k % 2], 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // light leak sweep
    var lx = ((c * 0.12) % 1.6 - 0.3) * W;
    var lg = ctx.createLinearGradient(lx - W * 0.2, 0, lx + W * 0.2, H);
    lg.addColorStop(0, "rgba(255,220,190,0)"); lg.addColorStop(0.5, "rgba(255,220,190,.18)"); lg.addColorStop(1, "rgba(255,220,190,0)");
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    // letterbox + grain
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(0, 0, W, H * 0.06); ctx.fillRect(0, H * 0.94, W, H * 0.06);
    if (!grainPat) makeGrain();
    ctx.globalAlpha = 0.12; ctx.fillStyle = grainPat; ctx.save(); ctx.translate((Math.random() * 64) | 0, (Math.random() * 64) | 0); ctx.fillRect(-64, -64, W + 64, H + 64); ctx.restore(); ctx.globalAlpha = 1;
    PL.raf = requestAnimationFrame(drawPlaceholder);
  }
  var grainPat = null;
  function makeGrain() {
    var g = document.createElement("canvas"); g.width = g.height = 128;
    var gx = g.getContext("2d"), id = gx.createImageData(128, 128);
    for (var p = 0; p < id.data.length; p += 4) { var v = Math.random() * 255; id.data[p] = id.data[p + 1] = id.data[p + 2] = v; id.data[p + 3] = 255; }
    gx.putImageData(id, 0, 0); grainPat = canvas.getContext("2d").createPattern(g, "repeat");
  }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }

  /* ------------------------------------------------------------------ open / close with morph */
  var lastFocus = null;
  function rectTransform(from, to) {
    return "translate(" + (from.left - to.left) + "px," + (from.top - to.top) + "px) scale(" + (from.width / to.width) + "," + (from.height / to.height) + ")";
  }
  function openFilm(i) {
    if (S.open >= 0) return;
    poke(); setHover(-1); stopAllPreviews();
    lastFocus = document.activeElement;
    S.open = i; S.vel = 0; S.target = null;
    var card = cards[i], from = card.getBoundingClientRect();
    fillPlayer(filmOf(i)); setNow(i); PL.openedAt = performance.now();
    wrapEl.hidden = false;
    stage.classList.add("viewing");
    card.classList.add("opened");
    var to = player.getBoundingClientRect();
    if (!PL.raf) PL.raf = requestAnimationFrame(drawPlaceholder);
    $("#scrim").animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: "both" });
    if (RM) {
      player.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    } else {
      player.classList.add("morphing");
      player.animate([
        { transform: rectTransform(from, to), borderRadius: "26px", opacity: 0.9 },
        { transform: "none", borderRadius: G.mob ? "0px" : "30px", opacity: 1 },
      ], { duration: 720, easing: "cubic-bezier(.2,.85,.2,1)" }).finished.then(function () { player.classList.remove("morphing"); });
    }
    setTimeout(function () { $("#pClose").focus({ preventScroll: true }); }, 50);
  }
  function closeFilm() {
    if (S.open < 0 || player.dataset.closing) return;
    player.dataset.closing = "1";
    setPlaying(false);
    var i = S.open, card = cards[i];
    var done = function () {
      wrapEl.hidden = true; delete player.dataset.closing;
      card.classList.remove("opened"); stage.classList.remove("viewing");
      S.open = -1; S.lastInteract = performance.now() - 1500;
      if (PL.video) { PL.video.pause(); }
      if (PL.embed) { PL.embed.remove(); PL.embed = null; pv.classList.remove("embedded"); } // stops Drive playback
      if (lastFocus && lastFocus.classList && lastFocus.classList.contains("card")) cards[i].focus({ preventScroll: true });
    };
    $("#scrim").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: "both" });
    if (RM) { player.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).finished.then(done); return; }
    player.classList.add("morphing");
    // let the ring settle un-dimmed for the card's rect
    var to = card.getBoundingClientRect(), from = player.getBoundingClientRect();
    player.animate([
      { transform: "none", opacity: 1 },
      { transform: rectTransform(to, from), borderRadius: "26px", opacity: 0.85 },
    ], { duration: 560, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" }).finished.then(function () {
      player.getAnimations().forEach(function (a) { a.cancel(); });
      player.classList.remove("morphing");
      done();
    });
  }

  /* ------------------------------------------------------------------ panels */
  var panelWrap = $("#panelWrap");
  function openPanel(kind) {
    var t = $("#panelTitle"), b = $("#panelBody");
    if (kind === "films") {
      t.textContent = "Films";
      b.innerHTML = '<div class="plist">' + FILMS.map(function (f, i) {
        return '<button data-film="' + i + '"><span class="t">' + coverHTML(f, i, "list") + "</span><span><b>" + esc(f.title) + "</b><small>" + esc(filmMeta(f) || "AI film") + "</small></span><em>" + (f.duration || "▶") + "</em></button>";
      }).join("") + "</div>";
    } else if (kind === "about") {
      t.textContent = "About";
      var tools = Array.from(new Set(FILMS.flatMap(function (f) { return f.tools || []; })));
      b.innerHTML = "<p>" + esc(SITE.about) + "</p><p>" + NF + " films" + (tools.length ? " · " + esc(tools.join(", ")) : "") + "</p>";
    } else {
      t.textContent = "Contact";
      var L = [["Email", SITE.email ? "mailto:" + SITE.email : "", SITE.email], ["Instagram", SITE.instagram, "Follow"], ["YouTube", SITE.youtube, "Watch"]].filter(function (x) { return x[1]; });
      b.innerHTML = "<p>Collaborations, commissions or just to say hi.</p><div class=\"contact-list\">" + L.map(function (x) { return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + x[0] + "<span>" + esc(x[2]) + "</span></a>"; }).join("") + "</div>";
    }
    panelWrap.hidden = false;
    setTimeout(function () { var c = panelWrap.querySelector(".p-close"); if (c) c.focus({ preventScroll: true }); }, 30);
  }
  function closePanel() { panelWrap.hidden = true; }
  document.querySelectorAll("[data-panel]").forEach(function (b) { b.onclick = function () { if (S.open >= 0) closeFilm(); openPanel(b.dataset.panel); }; });
  panelWrap.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) return closePanel();
    var fb = e.target.closest("[data-film]");
    if (fb) {
      var c = cardFor(+fb.dataset.film); closePanel();
      S.base = targetFor(c); S.target = null; S.vel = 0; setNow(c);
      requestAnimationFrame(function () { requestAnimationFrame(function () { openFilm(c); }); });
    }
  });

  /* ------------------------------------------------------------------ dust */
  var dust = $("#dust"), dctx = dust.getContext("2d"), motes = [];
  function sizeDust() { dust.width = innerWidth; dust.height = innerHeight; }
  var mote = document.createElement("canvas"); mote.width = mote.height = 32;
  (function () { var c = mote.getContext("2d"), g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,214,170,1)"); g.addColorStop(1, "rgba(255,180,120,0)"); c.fillStyle = g; c.fillRect(0, 0, 32, 32); })();
  sizeDust();
  for (var q = 0; q < (innerWidth < 860 ? 40 : 70); q++) motes.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 2.4, s: 0.004 + Math.random() * 0.012, ph: Math.random() * 6.28, a: 0.15 + Math.random() * 0.45 });
  function drawDust(now) {
    var W = innerWidth, H = innerHeight;
    dctx.clearRect(0, 0, W, H);
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      if (!RM) { m.y -= m.s / 60; m.x += Math.sin(now / 2600 + m.ph) * 0.00012; if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); } }
      var x = m.x * W, y = m.y * H, tw = 0.6 + 0.4 * Math.sin(now / 900 + m.ph), r = m.r * 3;
      dctx.globalAlpha = m.a * tw; dctx.drawImage(mote, x - r, y - r, r * 2, r * 2);
    }
    dctx.globalAlpha = 1;
    if (document.documentElement.classList.contains("lite")) { dctx.clearRect(0, 0, W, H); return; }
    requestAnimationFrame(drawDust);
  }

  /* ------------------------------------------------------------------ start */
  // opening title: "FILM WITH HIMANK." over my photo seen through cinema letterbox bars,
  // then the bars open, the camera pulls back and the films fly out around me
  var intro = $("#intro"), introOn = !!intro, timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  if (intro) {
    intro.querySelectorAll("[data-split]").forEach(function (el, line) {
      var txt = el.textContent; el.textContent = "";
      Array.from(txt).forEach(function (c, k) {
        var sp = document.createElement("span"); sp.className = "ch"; sp.textContent = c === " " ? " " : c;
        sp.style.setProperty("--d", (line === 0 ? 0.35 + k * 0.035 : 0.75 + k * 0.075).toFixed(3) + "s");
        sp.style.setProperty("--g", (k * 0.07).toFixed(2) + "s");
        sp.setAttribute("aria-hidden", "true"); el.appendChild(sp);
      });
    });
  }
  function runTimecode() {
    var tc = $("#tc"), t0 = performance.now();
    (function tick(now) {
      if (!introOn) return;
      var f = Math.floor(((now - t0) / 1000) * 24), s = Math.floor(f / 24);
      tc.textContent = "00:00:" + pad(s) + ":" + pad(f % 24);
      requestAnimationFrame(tick);
    })(t0);
  }
  function endIntro() {
    if (!introOn) return;
    introOn = false; timers.forEach(clearTimeout);
    intro.classList.add("lit", "band", "out");
    stage.classList.remove("prelude");                       // camera pulls back, light comes up
    setTimeout(function () { document.body.classList.add("loaded"); }, RM ? 0 : 600);
    setTimeout(function () { S.introStart = performance.now(); }, RM ? 0 : 900);
    setTimeout(function () { intro.classList.add("gone"); }, RM ? 450 : 2000);
    setTimeout(showHint, RM ? 800 : 3200);
  }
  function start() {
    setNow(0);
    requestAnimationFrame(frame);
    requestAnimationFrame(drawDust);
    if (!intro) { stage.classList.add("show-photo"); document.body.classList.add("loaded"); S.introStart = performance.now(); return; }
    stage.style.transition = "none";                         // start already zoomed-in and dark
    stage.classList.add("prelude");
    void stage.offsetWidth;
    stage.style.transition = "";
    stage.classList.add("show-photo");
    runTimecode();
    if (RM) { intro.classList.add("lit", "band", "tag1", "tag2"); later(endIntro, 1800); return; }
    later(function () { intro.classList.add("lit"); }, 250);
    later(function () { intro.classList.add("band"); }, 700);
    later(function () { intro.classList.add("tag1"); }, 2150);
    later(function () { intro.classList.add("tag2"); }, 2750);
    later(endIntro, 4700);
  }
  if (intro) {
    intro.addEventListener("click", endIntro);
    addEventListener("keydown", function (e) {
      if (!introOn) return;
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") { e.preventDefault(); endIntro(); }
      e.stopImmediatePropagation();
    }, true);
  }
  var pending = [photo, me].filter(function (im) { return !im.complete; }).length;
  if (!pending) start();
  else [photo, me].forEach(function (im) { if (!im.complete) { var f = function () { if (--pending <= 0) start(); }; im.addEventListener("load", f, { once: true }); im.addEventListener("error", f, { once: true }); } });
})();
