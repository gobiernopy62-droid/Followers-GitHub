'use strict';

/* ══════════════════════════════════
   FOLLOWERS — GAME
   Entry point. Expone window.G
   Depende de: FC, FPlayer, FBot, FPowerups, FRender, FAudio, FLang
══════════════════════════════════ */
window.G = (function () {

  /* ── Namespace shortcuts ─────────────────── */
  const {
    WW, WH, PR, NR, FR, PSPD, CSPD,
    NPC_N, POW_N, SHURIKEN_POW_N, EGG_POW_N,
    RT, MAX_R, CLR, SPAWNS,
    SHURIKEN_RANGE, SHURIKEN_SPD, SHURIKEN_R, SHURIKEN_DUR,
    STEAL_CD, FIRE_RATE,
    EGG_BOOST_DUR, EGG_STUN_DUR, EGG_PLACE_CD, EGG_R,
    rnd, rI, cl, d2, norm,
  } = window.FC;

  const { loadSettings, saveSettings, mkPlayers, blobUpdate } = window.FPlayer;
  const { botUpdate }                                          = window.FBot;
  const { spawnNPCs, spawnVelocityPowerups, spawnShurikenPowerups, spawnEggPowerups } = window.FPowerups;
  const { loadImgs, ensureCity, draw, drawMinimap }           = window.FRender;
  const FSkins                                                 = window.FSkins;
  const FA                                                     = window.FAudio;
  const FLang                                                  = window.FLang;

  /* ── DOM ─────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const cv  = $('gc');
  const ctx = cv.getContext('2d');

  /* ── State ───────────────────────────────── */
  let state  = 'menu';
  let round  = 1;
  let rTimer = RT;
  let lastT  = 0;
  let raf    = 0;

  let pset = loadSettings();

  let players = [], npcs = [], parts = [];
  let powerups = [], shurikenPowerups = [], eggPowerups = [];
  let placedEggs = [], projectiles = [];
  let projIdCounter = 0;

  let camX = WW / 2, camY = WH / 2;
  let humanFireCd = 0;
  let mouseWorldX = 0, mouseWorldY = 0;
  let mobileShoot = false;

  /* ── Economy ─────────────────────────────── */
  let humanPlacement = 0;   // 1-6; 0 = not registered
  const COINS_BY_PLACE = { 1: 50, 2: 25, 3: 10, 4: 5, 5: 2, 6: 1 };

  /* ── Responsive scale ────────────────────────
     On small screens (mobile) we zoom out so characters
     don't look disproportionately large.
     Reference resolution: 900px wide.
     On desktop (≥900px) scale is always 1 → no change.
  ─────────────────────────────────────────────── */
  const SCALE_REF = 900;
  let gameScale   = 1;

  const keys = {};
  const joy  = { active: false, id: -1, bx: 0, by: 0, dx: 0, dy: 0, r: 65 };

  /* ── Mobile detection ────────────────────── */
  const isMobile = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ── Combat helpers ──────────────────────── */
  function fireProjectile(shooter, tx, ty) {
    FA.playSfx('shuriken');
    const n = norm(tx - shooter.x, ty - shooter.y);
    projectiles.push({
      id: projIdCounter++,
      x: shooter.x, y: shooter.y,
      ox: shooter.x, oy: shooter.y,
      vx: n.x * SHURIKEN_SPD, vy: n.y * SHURIKEN_SPD,
      ownerId: shooter.id, ownerCk: shooter.ck, angle: 0,
    });
  }

  function addParts(x, y, ck) {
    const c = CLR[ck].h;
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2, sp = rnd(60, 200);
      parts.push({ x, y, vx: Math.cos(a) * sp * .016, vy: Math.sin(a) * sp * .016, r: rnd(3, 9), c, life: 1 });
    }
  }

  /* ── Screen management ───────────────────── */
  const SCREENS = ['loading', 'menu', 'settings', 'skins', 'rend', 'gover', 'exitsc'];
  /* Screens that overlay the menu — menu stays visible behind */
  const OVER_MENU = new Set(['settings', 'exitsc']);
  function show(id) {
    SCREENS.forEach(s => {
      if (s === 'menu' && OVER_MENU.has(id)) return;
      $(s).classList.toggle('off', s !== id);
    });
    cv.classList.toggle('vis', id === 'game');
    $('hud').classList.toggle('vis', id === 'game');
    $('mobile-controls').classList.toggle('vis', id === 'game' && isMobile());
  }

  /* ── Menu particles ──────────────────────── */
  function spawnMenuParts() {
    const mp = $('mp'); mp.innerHTML = '';
    const C  = ['#FF3355', '#33AAFF', '#33EE66', '#FFCC00', '#FF8833', '#CC33FF'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'pt';
      const sz = rnd(6, 20);
      el.style.cssText = `width:${sz}px;height:${sz}px;left:${rnd(0, 100)}%;background:${C[rI(0, C.length - 1)]};opacity:0;animation-duration:${rnd(6, 17)}s;animation-delay:${rnd(-12, 0)}s`;
      mp.appendChild(el);
    }
  }

  /* ── HUD ─────────────────────────────────── */
  function updHUD() {
    const secs = Math.ceil(rTimer);
    const el   = $('htmr');
    el.textContent = secs;
    el.className   = 'h-tmr' + (secs <= 5 ? ' urgent' : '');
    $('hrnd').textContent = FLang.t('hud_round', { r: round, max: MAX_R });
    const sc = $('hsc'); sc.innerHTML = '';
    for (const p of [...players].sort((a, b) => b.followers.length - a.followers.length)) {
      const boostFx    = p.speedBoost    > 0 ? `box-shadow:0 0 10px ${CLR[p.ck].h};border-color:${CLR[p.ck].h}` : '';
      const shurikenFx = p.shurikenBoost > 0 ? 'border-color:#FF4444;box-shadow:0 0 10px rgba(255,50,50,.7)'    : '';
      const huevoFx    = p.huevoBoost    > 0 ? 'border-color:#FFDD55;box-shadow:0 0 10px rgba(255,220,50,.7)'   : '';
      const stunFx     = p.stunTimer     > 0 ? 'border-color:#AAAAFF;box-shadow:0 0 12px rgba(160,160,255,.9)'  : '';
      const icons =
        (p.speedBoost    > 0 ? '⚡'  : '') +
        (p.shurikenBoost > 0 ? '🗡️' : '') +
        (p.huevoBoost    > 0 ? '🥚'  : '') +
        (p.stunTimer     > 0 ? '💫'  : '');
      const row = document.createElement('div');
      row.className     = 'h-si' + (p.elim ? ' elim' : '');
      row.style.cssText = stunFx || huevoFx || shurikenFx || boostFx;
      row.innerHTML =
        `<div class="h-dot" style="background:${CLR[p.ck].h}"></div>` +
        `<span style="max-width:88px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${p.name}</span>` +
        `<span class="h-cnt">×${p.followers.length}</span>` +
        (icons ? `<span style="font-size:11px;margin-left:2px">${icons}</span>` : '');
      sc.appendChild(row);
    }
    $('hspec').style.display = players[0]?.elim ? 'block' : 'none';
  }

  function updateShootBtn() {
    if (!players.length) return;
    const h = players[0], btn = $('shoot-btn');
    btn.classList.toggle('disabled', !(h && !h.elim && (h.shurikenBoost > 0 || h.huevoBoost > 0)));
    btn.textContent = (h?.huevoBoost > 0) ? '🥚' : '✦';
  }

  /* ── Update ──────────────────────────────── */
  function update(dt) {
    if (state !== 'playing') return;
    rTimer -= dt;
    if (rTimer <= 0) { rTimer = 0; endRound(); return; }

    const active = players.filter(p => !p.elim);
    const h      = players[0];

    /* Timers */
    for (const p of active) {
      if (p.speedBoost    > 0) { p.speedBoost   -= dt; if (Math.random() < 0.3) addParts(p.x, p.y, p.ck); }
      if (p.shurikenBoost > 0) p.shurikenBoost   = Math.max(0, p.shurikenBoost - dt);
      if (p.huevoBoost    > 0) p.huevoBoost       = Math.max(0, p.huevoBoost    - dt);
      if (p._eggCd        > 0) p._eggCd           = Math.max(0, p._eggCd        - dt);
      if (p.stunTimer     > 0) p.stunTimer         = Math.max(0, p.stunTimer     - dt);
      if (p._stealCd      > 0) p._stealCd          = Math.max(0, p._stealCd     - dt);
      if (p._botFireCd    > 0) p._botFireCd         = Math.max(0, p._botFireCd   - dt);
    }

    /* Human shuriken (SHIFT + mouse) */
    humanFireCd = Math.max(0, humanFireCd - dt);
    if (!h.elim && h.shurikenBoost > 0 && keys['Shift'] && humanFireCd <= 0) {
      let tx = mouseWorldX, ty = mouseWorldY;
      const dx = tx - h.x, dy = ty - h.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) { tx = h.x; ty = h.y + SHURIKEN_RANGE; }
      else if (dist > SHURIKEN_RANGE) { tx = h.x + (dx / dist) * SHURIKEN_RANGE; ty = h.y + (dy / dist) * SHURIKEN_RANGE; }
      humanFireCd = FIRE_RATE;
      fireProjectile(h, tx, ty);
    }

    /* Shuriken powerup spin */
    for (const sp of shurikenPowerups) sp.spin = (sp.spin || 0) + dt * 2.5;

    /* Human movement */
    if (!h.elim && h.stunTimer <= 0) {
      let dx = 0, dy = 0;
      if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
      if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
      if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;
      if (joy.active) { dx += joy.dx; dy += joy.dy; }
      if (dx || dy) {
        const spd = h.speedBoost > 0 ? PSPD * 2 : PSPD;
        const n   = norm(dx, dy);
        h.x = cl(h.x + n.x * spd * dt, PR, WW - PR);
        h.y = cl(h.y + n.y * spd * dt, PR, WH - PR);
      }
    }

    /* Mobile shoot */
    if (!h.elim && h.shurikenBoost > 0 && mobileShoot && humanFireCd <= 0) {
      let tx, ty;
      if (joy.active && (joy.dx || joy.dy)) {
        const n = norm(joy.dx, joy.dy); tx = h.x + n.x * SHURIKEN_RANGE; ty = h.y + n.y * SHURIKEN_RANGE;
      } else {
        const others = players.filter(p => !p.elim && p !== h);
        let best = null, bd = Infinity;
        for (const p of others) { const dd = d2(h, p); if (dd < bd) { bd = dd; best = p; } }
        if (best) { tx = best.x; ty = best.y; } else { tx = h.x; ty = h.y + SHURIKEN_RANGE; }
      }
      humanFireCd = FIRE_RATE; fireProjectile(h, tx, ty);
    }

    /* Spectator camera */
    if (h.elim) {
      let dx = 0, dy = 0;
      if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
      if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
      if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;
      if (dx || dy) {
        const n = norm(dx, dy);
        const hvw = (cv.width  / gameScale) / 2;
        const hvh = (cv.height / gameScale) / 2;
        camX = cl(camX + n.x * CSPD * dt, hvw, WW - hvw);
        camY = cl(camY + n.y * CSPD * dt, hvh, WH - hvh);
      }
    }

    /* Bots */
    for (const p of players) if (!p.human && !p.elim) botUpdate(p, dt, active, { shurikenPowerups, powerups, eggPowerups, npcs, fireProjectile });

    /* ── Player ↔ Player collision separation ──────────────────
       Evita que los jugadores se superpongan entre sí.
       Se ejecutan 3 iteraciones para resolver correctamente
       el caso de varios bots apilados sobre el mismo objetivo.
    ─────────────────────────────────────────────────────────── */
    const minDist = PR * 2;
    for (let iter = 0; iter < 3; iter++) {
      for (let a = 0; a < active.length; a++) {
        for (let b = a + 1; b < active.length; b++) {
          const pa = active[a], pb = active[b];
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist, ny = dy / dist;
            pa.x = cl(pa.x - nx * overlap, PR, WW - PR);
            pa.y = cl(pa.y - ny * overlap, PR, WH - PR);
            pb.x = cl(pb.x + nx * overlap, PR, WW - PR);
            pb.y = cl(pb.y + ny * overlap, PR, WH - PR);
          }
        }
      }
    }

    /* Swarm */
    for (const p of active) blobUpdate(p, dt);

    /* NPC wander */
    for (const n of npcs) {
      if (n.owner !== null) continue;
      n.x = cl(n.x + n.wx * dt, NR, WW - NR); n.y = cl(n.y + n.wy * dt, NR, WH - NR);
      if (n.x <= NR || n.x >= WW - NR) n.wx *= -1;
      if (n.y <= NR || n.y >= WH - NR) n.wy *= -1;
      if (Math.random() < .3 * dt) { n.wx = rnd(-28, 28); n.wy = rnd(-28, 28); }
    }

    /* Player → free NPC */
    /* FIX Bug #4: only one 'pop' per frame even if multiple NPCs are collected at once */
    let _popPlayed = false;
    for (const p of active) for (const n of npcs) {
      if (n.owner !== null) continue;
      if (d2(p, n) < PR + NR) {
        n.owner = p.id; n.ck = p.ck; p.followers.push(n);
        addParts(n.x, n.y, p.ck);
        if (p.human && !_popPlayed) { FA.playSfx('pop'); _popPlayed = true; }
      }
    }

    /* Player → velocity power-up */
    for (const p of active) for (let i = powerups.length - 1; i >= 0; i--) {
      if (d2(p, powerups[i]) < PR + NR) { p.speedBoost = 10; addParts(powerups[i].x, powerups[i].y, p.ck); powerups.splice(i, 1); }
    }

    /* Player → shuriken power-up */
    for (const p of active) for (let i = shurikenPowerups.length - 1; i >= 0; i--) {
      const sp = shurikenPowerups[i];
      if (d2(p, sp) < PR + NR) {
        p.shurikenBoost = SHURIKEN_DUR;
        if (p.human) humanFireCd = 0; else p._botFireCd = 0;
        addParts(sp.x, sp.y, p.ck); shurikenPowerups.splice(i, 1);
      }
    }

    /* Player → egg power-up */
    for (const p of active) for (let i = eggPowerups.length - 1; i >= 0; i--) {
      if (d2(p, eggPowerups[i]) < PR + NR) {
        p.huevoBoost = EGG_BOOST_DUR; p._eggCd = 0;
        addParts(eggPowerups[i].x, eggPowerups[i].y, p.ck); eggPowerups.splice(i, 1);
      }
    }

    /* Egg bob */
    for (const ep of eggPowerups) ep.bob = (ep.bob || 0) + dt * 2.8;

    /* Bot egg placement */
    for (const p of active) {
      if (p.human || p.huevoBoost <= 0 || p._eggCd > 0) continue;
      let nearEnemy = false;
      for (const e of active) { if (e !== p && d2(p, e) < 180) { nearEnemy = true; break; } }
      if (nearEnemy) { placedEggs.push({ x: p.x, y: p.y, ownerId: p.id, life: EGG_BOOST_DUR }); p._eggCd = EGG_PLACE_CD; }
    }

    /* Player → placed egg (stun) */
    for (const p of active) {
      if (p.stunTimer > 0) continue;
      for (let i = placedEggs.length - 1; i >= 0; i--) {
        const eg = placedEggs[i];
        if (eg.ownerId === p.id) continue;
        if (d2(p, eg) < PR + EGG_R) { p.stunTimer = EGG_STUN_DUR; addParts(eg.x, eg.y, p.ck); placedEggs.splice(i, 1); }
      }
    }

    /* Projectile movement & collision */
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i];
      pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.angle += dt * 14;
      const traveled = Math.sqrt((pr.x - pr.ox) ** 2 + (pr.y - pr.oy) ** 2);
      if (traveled >= SHURIKEN_RANGE || pr.x < 0 || pr.x > WW || pr.y < 0 || pr.y > WH) { projectiles.splice(i, 1); continue; }
      let hit = false;
      for (const p of active) {
        if (p.id === pr.ownerId) continue;
        if (d2(pr, p) < PR + SHURIKEN_R) {
          for (const f of p.followers) { f.owner = null; f.ck = null; f.wx = rnd(-28, 28); f.wy = rnd(-28, 28); }
          p.followers = []; addParts(p.x, p.y, pr.ownerCk); projectiles.splice(i, 1); hit = true; break;
        }
      }
      if (hit) continue;
      for (const p of active) {
        if (p.id === pr.ownerId) continue;
        for (let fi = p.followers.length - 1; fi >= 0; fi--) {
          const f = p.followers[fi];
          if (d2(pr, f) < FR + SHURIKEN_R) {
            p.followers.splice(fi, 1);
            const shooter = players.find(pl => pl.id === pr.ownerId);
            if (shooter && !shooter.elim) { f.ck = shooter.ck; f.owner = shooter.id; shooter.followers.push(f); addParts(f.x, f.y, shooter.ck); }
            else { f.owner = null; f.ck = null; f.wx = rnd(-26, 26); f.wy = rnd(-26, 26); }
            projectiles.splice(i, 1); hit = true; break;
          }
        }
        if (hit) break;
      }
    }

    /* Contact follower steal */
    for (const p of active) {
      if (p._stealCd > 0) continue;
      for (const e of active) {
        if (e === p || e.followers.length === 0) continue;
        for (let fi = 0; fi < e.followers.length; fi++) {
          const f = e.followers[fi];
          if (d2(p, f) < PR + FR) {
            e.followers.splice(fi, 1); f.ck = p.ck; f.owner = p.id;
            p.followers.push(f); p._stealCd = STEAL_CD; addParts(f.x, f.y, p.ck); break;
          }
        }
        if (p._stealCd > 0) break;
      }
    }

    /* Particle decay */
    for (let i = parts.length - 1; i >= 0; i--) {
      const pt = parts[i];
      pt.x += pt.vx; pt.y += pt.vy; pt.vx *= .88; pt.vy *= .88; pt.life -= dt * 2.8;
      if (pt.life <= 0) parts.splice(i, 1);
    }

    /* Camera — follow the human player */
    if (!h.elim) {
      camX += (h.x - camX) * .12; camY += (h.y - camY) * .12;
      const hvw = (cv.width  / gameScale) / 2;
      const hvh = (cv.height / gameScale) / 2;
      camX = cl(camX, hvw, WW - hvw);
      camY = cl(camY, hvh, WH - hvh);
    }

    updHUD();
    updateShootBtn();
  }

  /* ── Loop ────────────────────────────────── */
  function resize() {
    if (cv.width !== window.innerWidth || cv.height !== window.innerHeight) {
      cv.width  = window.innerWidth;
      cv.height = window.innerHeight;
    }
    gameScale = cv.width / SCALE_REF;
  }

  function loop(ts) {
    if (state !== 'playing') { raf = 0; return; }
    const dt = Math.min((ts - lastT) / 1000, .05); lastT = ts;
    resize(); update(dt);
    draw(ctx, cv, camX, camY, { players, npcs, powerups, shurikenPowerups, eggPowerups, placedEggs, projectiles, parts }, gameScale);
    drawMinimap(ctx, cv, camX, camY, { players, powerups, shurikenPowerups, eggPowerups }, isMobile());
    raf = requestAnimationFrame(loop);
  }

  /* ── Round / Game over ───────────────────── */
  function endRound() {
    state = 'roundend';
    cancelAnimationFrame(raf); raf = 0;
    draw(ctx, cv, camX, camY, { players, npcs, powerups, shurikenPowerups, eggPowerups, placedEggs, projectiles, parts }, gameScale);

    const active = players.filter(p => !p.elim);
    if (active.length <= 1) { gameOver(active[0] || null); return; }

    const sorted = [...active].sort((a, b) => b.followers.length - a.followers.length);
    const loser  = sorted[sorted.length - 1];
    loser.elim   = true;

    /* Register the human player's placement if they were eliminated */
    if (loser.id === 0) humanPlacement = active.length;

    $('ret').innerHTML = FLang.t('rend_title', { r: round });

    const remaining = active.length - 1;
    const nameHtml  = `<b style="color:${CLR[loser.ck].h}">${loser.name}</b>`;
    const resubKey  = remaining <= 1 ? 'rend_elim_winner' : 'rend_elim_followers';
    $('resub').innerHTML = FLang.t(resubKey).replace('{name}', nameHtml);

    const list = $('relist'); list.innerHTML = '';
    sorted.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 're-row' + (p === loser ? ' elim' : '');
      row.innerHTML =
        `<div class="re-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>` +
        `<div class="re-cd" style="background:${CLR[p.ck].h}"></div>` +
        `<div class="re-nm">${p.name}${p === loser ? `<span class="re-tag">${FLang.t('rend_elim_tag')}</span>` : ''}</div>` +
        `<div class="re-cn">${p.followers.length} 👥</div>`;
      list.appendChild(row);
    });

    const btn = $('rebtn');
    if (remaining <= 1) {
      btn.innerHTML = FLang.t('rend_see_winner');
      btn.onclick   = () => { FA.playSfx('click'); gameOver(sorted[0]); };
    } else {
      btn.innerHTML = FLang.t('rend_continue');
      btn.onclick   = () => { FA.playSfx('click'); nextRound(); };
    }
    show('rend');
  }

  function nextRound() {
    round++;
    npcs             = spawnNPCs(NPC_N);
    powerups         = spawnVelocityPowerups(POW_N);
    shurikenPowerups = spawnShurikenPowerups(SHURIKEN_POW_N);
    eggPowerups      = spawnEggPowerups(EGG_POW_N);
    placedEggs = []; projectiles = [];
    const sp = [...SPAWNS].sort(() => Math.random() - .5); let si = 0;
    for (const p of players) {
      if (p.elim) continue;
      p.x = sp[si].x; p.y = sp[si].y;
      p.speedBoost = 0; p.shurikenBoost = 0; p.huevoBoost = 0;
      p.stunTimer = 0; p._stealCd = 0; p._botFireCd = 0; p._eggCd = 0;
      si++;
    }
    rTimer = RT; state = 'playing'; show('game');
    lastT = performance.now(); raf = requestAnimationFrame(loop);
  }

  /* ── Game over — step 1: show winner ────── */
  function gameOver(winner) {
    FA.playMusic('menu');
    state = 'gameover';
    if (!winner) { show('menu'); return; }

    if (winner.id === 0) humanPlacement = 1;

    $('gowin').textContent = winner.name;
    $('gowin').style.color = CLR[winner.ck].h;
    $('godet').textContent = FLang.t('gover_followers', { n: winner.followers.length });

    $('go-step1').style.display = '';
    $('go-step2').style.display = 'none';
    show('gover');

    function advance() {
      cleanup();
      showCoinsStep();
    }

    function onKey(e) {
      if (e.key === ' ' || e.key === 'Spacebar') advance();
    }

    function onPointer() { advance(); }

    function cleanup() {
      window.removeEventListener('keydown', onKey);
      $('gover').removeEventListener('pointerdown', onPointer);
    }

    window.addEventListener('keydown', onKey);
    $('gover').addEventListener('pointerdown', onPointer);
  }

  /* ── Game over — step 2: show coins ─────── */
  function showCoinsStep() {
    const earned   = COINS_BY_PLACE[humanPlacement] || 0;
    const newTotal = earned > 0 ? FSkins.addCoins(earned) : FSkins.loadCoins();

    $('go-coins-earned').textContent = earned > 0 ? `+${earned}` : '0';
    $('go-coins-total').innerHTML    = FLang.t('gover_coins_total', { n: newTotal });

    $('go-step1').style.display = 'none';
    $('go-step2').style.display = '';
  }

  /* ── Public API ──────────────────────────── */
  function start() {
    cancelAnimationFrame(raf); raf = 0;
    round = 1; rTimer = RT; humanFireCd = 0; humanPlacement = 0;
    parts = []; placedEggs = []; projectiles = [];
    for (const k in keys) keys[k] = false;
    ensureCity();
    players          = mkPlayers(pset);
    players[0].skin  = FSkins.loadSkin();
    npcs             = spawnNPCs(NPC_N);
    powerups         = spawnVelocityPowerups(POW_N);
    shurikenPowerups = spawnShurikenPowerups(SHURIKEN_POW_N);
    eggPowerups      = spawnEggPowerups(EGG_POW_N);
    camX = players[0].x; camY = players[0].y;
    FA.playMusic('gameplay');
    state = 'playing'; resize(); show('game');
    lastT = performance.now(); raf = requestAnimationFrame(loop);
  }

  /* ── Skins screen ────────────────────────── */
  function goSkins() {
    FA.playMusic('dresser');
    show('skins');
    const currentSkin = FSkins.loadSkin();
    const color       = pset.color || 'red';
    const coins       = FSkins.loadCoins();

    const charImg = $('sk-char-img');
    charImg.src   = CLR[color].img;
    $('sk-player-name').textContent = pset.name || 'Influencer #1';
    $('sk-glow').style.background   =
      `radial-gradient(circle, ${CLR[color].g} 0%, transparent 70%)`;

    $('sk-coin-count').textContent = coins;

    const grid = $('sk-grid');
    grid.innerHTML = '';

    for (const skin of FSkins.SKINS) {
      const unlocked  = FSkins.isUnlocked(skin.id);
      const canAfford = coins >= skin.price;
      const selected  = skin.id === currentSkin && unlocked;

      const card = document.createElement('div');
      card.className =
        'sk-card' +
        (selected  ? ' sk-selected'   : '') +
        (!unlocked ? ' sk-locked'     : '') +
        (!unlocked && !canAfford ? ' sk-cant-afford' : '');
      card.dataset.skinId = skin.id;

      card.onclick = () => {
        FA.playSfx('click');
        if (unlocked) selectSkin(skin.id);
        else updateSkinPreview(skin.id);
      };

      const imgWrap = skin.file
        ? `<div class="sk-card-img-wrap">
             <img src="${skin.file}" class="sk-card-img" alt="${FSkins.getSkinName(skin)}">
             ${!unlocked ? '<div class="sk-lock-icon">🔒</div>' : ''}
           </div>`
        : `<div class="sk-card-img-wrap sk-card-empty">&#8960;</div>`;

      const priceTag = !unlocked
        ? `<div class="sk-card-price">
             <img src="Assets/Moneda.png" class="sk-price-coin" alt=""> ${skin.price}
           </div>`
        : '';

      const buyBtn = (!unlocked && canAfford)
        ? `<button class="sk-buy-btn"
             onclick="event.stopPropagation(); FAudio.playSfx('click'); G.buySkin('${skin.id}')">
             ${FLang.t('skins_buy')}
           </button>`
        : '';

      card.innerHTML =
        imgWrap +
        `<div class="sk-card-name">${FSkins.getSkinName(skin)}</div>` +
        priceTag +
        buyBtn;

      grid.appendChild(card);
    }

    updateSkinPreview(currentSkin);
  }

  function selectSkin(skinId) {
    if (!FSkins.isUnlocked(skinId)) return;
    FSkins.saveSkin(skinId);
    document.querySelectorAll('.sk-card').forEach(c =>
      c.classList.toggle('sk-selected', c.dataset.skinId === skinId)
    );
    updateSkinPreview(skinId);
  }

  function updateSkinPreview(skinId) {
    const skin    = FSkins.getSkinById(skinId);
    const overlay = $('sk-skin-overlay');
    if (skin.file) {
      overlay.src = skin.file;

      /* Apply sizing once the image dimensions are known */
      function applySize() {
        const aspect = overlay.naturalWidth / overlay.naturalHeight;
        if (aspect < 1) {
          /* Taller than wide: fix width to 100% (same as character),
             height grows proportionally upward from the feet */
          overlay.style.cssText =
            'position:absolute;bottom:0;left:0;width:100%;height:auto;z-index:2;display:block';
        } else {
          /* Wider than tall (or square): fix height to 100%,
             width grows proportionally, centered horizontally */
          overlay.style.cssText =
            'position:absolute;bottom:0;left:50%;transform:translateX(-50%);height:100%;width:auto;z-index:2;display:block';
        }
      }

      if (overlay.complete && overlay.naturalWidth) {
        applySize();
      } else {
        overlay.onload = applySize;
      }
    } else {
      overlay.style.cssText = 'display:none';
    }
    $('sk-desc-name').textContent = FSkins.getSkinName(skin);
    $('sk-desc-text').textContent = FSkins.getSkinDesc(skin);

    const priceEl = $('sk-desc-price');
    if (!FSkins.isUnlocked(skin.id) && skin.price > 0) {
      priceEl.style.display = '';
      priceEl.innerHTML =
        `<img src="Assets/Moneda.png" class="sk-price-coin" alt=""> ${FLang.t('skins_price', { n: skin.price })}`;
    } else {
      priceEl.style.display = 'none';
    }
  }

  /** Buys a skin and rebuilds the screen if successful. */
  function buySkin(id) {
    const ok = FSkins.buySkin(id);
    if (ok) goSkins();
  }

  function goCfg() {
    show('settings');
    document.querySelectorAll('.csw').forEach(el => el.classList.toggle('on', el.dataset.c === pset.color));
    $('cname').value = pset.name || 'Influencer #1';
    $('toggle-music').checked = FA.isMusicEnabled();
    $('toggle-sfx').checked   = FA.isSfxEnabled();
    /* Sync language button active state */
    FLang.applyToDOM();
  }

  function goMenu() {
    cancelAnimationFrame(raf); raf = 0;
    state = 'menu'; joy.active = false; joy.dx = 0; joy.dy = 0; mobileShoot = false;
    FA.playMusic('menu');
    show('menu'); spawnMenuParts();
  }

  function goExit() { cancelAnimationFrame(raf); raf = 0; state = 'exit'; show('exitsc'); }

  /* ── Pause overlay ───────────────────────── */
  function pauseGame() {
    if (state !== 'playing') return;
    state = 'paused';
    cancelAnimationFrame(raf); raf = 0;
    $('pause-overlay').classList.remove('off');
  }

  function resumeGame() {
    if (state !== 'paused') return;
    $('pause-overlay').classList.add('off');
    state = 'playing';
    lastT = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function confirmExit() {
    $('pause-overlay').classList.add('off');
    goMenu();
  }

  function pickClr(ck) {
    pset.color = ck;
    document.querySelectorAll('.csw').forEach(el => el.classList.toggle('on', el.dataset.c === ck));
    saveSettings(pset);
  }

  function saveCfg() { goMenu(); }

  /* ── Settings: auto-save on name input ───── */
  $('cname').addEventListener('input', () => {
    pset.name = $('cname').value.trim() || 'Influencer #1';
    saveSettings(pset);
  });

  /* ── Joystick ────────────────────────────── */
  function joyUpdate() {
    const maxR = joy.r, px = cl(joy.dx * maxR, -maxR, maxR), py = cl(joy.dy * maxR, -maxR, maxR);
    const jKnob = $('joystick-knob');
    jKnob.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
    jKnob.classList.toggle('active', joy.active);
  }

  const jZone = $('joystick-zone');
  jZone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0], r = jZone.getBoundingClientRect();
    joy.id = t.identifier; joy.bx = r.left + r.width / 2; joy.by = r.top + r.height / 2;
    const rawDx = t.clientX - joy.bx, rawDy = t.clientY - joy.by;
    const dist  = Math.sqrt(rawDx * rawDx + rawDy * rawDy) || 1, cd = Math.min(dist, joy.r);
    joy.dx = (rawDx / dist) * (cd / joy.r); joy.dy = (rawDy / dist) * (cd / joy.r);
    joy.active = true; joyUpdate();
  }, { passive: false });

  window.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier !== joy.id) continue;
      const rawDx = t.clientX - joy.bx, rawDy = t.clientY - joy.by;
      const dist  = Math.sqrt(rawDx * rawDx + rawDy * rawDy) || 1, cd = Math.min(dist, joy.r);
      joy.dx = (rawDx / dist) * (cd / joy.r); joy.dy = (rawDy / dist) * (cd / joy.r);
      joyUpdate(); break;
    }
  }, { passive: true });

  window.addEventListener('touchend', e => {
    for (const t of e.changedTouches) {
      if (t.identifier !== joy.id) continue;
      joy.active = false; joy.dx = 0; joy.dy = 0; joy.id = -1; joyUpdate(); break;
    }
  }, { passive: true });

  /* ── Shoot button (mobile) ───────────────── */
  const shootBtn = $('shoot-btn');
  shootBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    if (state === 'playing' && players.length) {
      const h = players[0];
      if (!h.elim && h.huevoBoost > 0 && h._eggCd <= 0) {
        placedEggs.push({ x: h.x, y: h.y, ownerId: h.id, life: EGG_BOOST_DUR });
        h._eggCd = EGG_PLACE_CD;
        shootBtn.classList.add('firing');
        setTimeout(() => shootBtn.classList.remove('firing'), 200);
        return;
      }
    }
    mobileShoot = true; shootBtn.classList.add('firing');
  }, { passive: false });
  shootBtn.addEventListener('touchend', () => { mobileShoot = false; shootBtn.classList.remove('firing'); });

  /* ── Keyboard ────────────────────────────── */
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    keys[e.key] = true;
    if (e.key === 'Escape' && state === 'playing') pauseGame();
    if (e.key === 'Escape' && state === 'paused')  resumeGame();
  });
  window.addEventListener('keyup',  e => { if (e.target.tagName === 'INPUT') return; keys[e.key] = false; });
  window.addEventListener('blur',   () => { for (const k in keys) keys[k] = false; });
  window.addEventListener('resize', resize);

  /* ── Mouse ───────────────────────────────── */
  window.addEventListener('mousemove', e => {
    const vw = cv.width  / gameScale;
    const vh = cv.height / gameScale;
    const ox = camX - vw / 2;
    const oy = camY - vh / 2;
    mouseWorldX = e.clientX / gameScale + ox;
    mouseWorldY = e.clientY / gameScale + oy;
  });
  window.addEventListener('mousedown', e => {
    if (e.button !== 0 || state !== 'playing') return;
    const h = players[0];
    if (!h || h.elim || h.huevoBoost <= 0 || h._eggCd > 0) return;
    placedEggs.push({ x: h.x, y: h.y, ownerId: h.id, life: EGG_BOOST_DUR });
    h._eggCd = EGG_PLACE_CD;
  });

  /* ── Init ────────────────────────────────── */
  ensureCity();
  show('loading');

  Promise.all([loadImgs(), FA.audioReady]).then(() => {
    /* Ocultar spinner, mostrar prompt localizado */
    $('ld-spinner').style.display = 'none';
    const prompt = $('ld-prompt');
    prompt.innerHTML = FLang.t('loading_start');
    prompt.style.display = '';

    /* Cualquier interacción del usuario arranca el juego */
    function goToMenu() {
      window.removeEventListener('keydown', goToMenu);
      $('loading').removeEventListener('pointerdown', goToMenu);
      show('menu');
      spawnMenuParts();
      FA.playMusic('menu');
    }

    window.addEventListener('keydown', goToMenu);
    $('loading').addEventListener('pointerdown', goToMenu);
  });

  return { start, goCfg, goSkins, selectSkin, buySkin, goMenu, goExit, pickClr, saveCfg, nextRound, pauseGame, resumeGame, confirmExit };
})();