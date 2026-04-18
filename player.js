'use strict';

/* ══════════════════════════════════
   FOLLOWERS — PLAYER
   Expuesto como window.FPlayer
   Depende de: window.FC
══════════════════════════════════ */
window.FPlayer = (function () {
  const { CKS, CLR, SPAWNS, FSPD, FR, WW, WH, rnd, rI, cl } = window.FC;

  const STORAGE_KEY = 'followers_cfg';

  /* ── Persistence (auto-save) ─────────────── */

  function loadSettings() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        name:  data.name  || 'Influencer #1',
        color: data.color || null,
      };
    } catch {
      return { name: 'Influencer #1', color: null };
    }
  }

  function saveSettings(pset) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: pset.name, color: pset.color }));
    } catch { /* localStorage no disponible — falla silenciosamente */ }
  }

  /* ── Player factory ──────────────────────── */

  function makePlayer(id, name, ck, human, spawn) {
    return {
      id, name, ck, human,
      elim:          false,
      x:             spawn.x,
      y:             spawn.y,
      followers:     [],
      _tgt:          null,
      _tth:          0,
      speedBoost:    0,
      shurikenBoost: 0,
      huevoBoost:    0,
      stunTimer:     0,
      _stealCd:      0,
      _botFireCd:    0,
      _eggCd:        0,
    };
  }

  function mkPlayers(pset) {
    const players = [];
    let hc = pset.color;
    const av = [...CKS];
    if (!hc) hc = av[rI(0, av.length - 1)];
    av.splice(av.indexOf(hc), 1);
    av.sort(() => Math.random() - .5);
    const sp = [...SPAWNS].sort(() => Math.random() - .5);

    players.push(makePlayer(0, pset.name || 'Influencer #1', hc, true, sp[0]));
    for (let i = 0; i < 5; i++)
      players.push(makePlayer(i + 1, CLR[av[i]].n, av[i], false, sp[i + 1]));

    return players;
  }

  /* ── Swarm (blob) physics ────────────────── */

  function blobUpdate(p, dt) {
    const REP_RAD       = FR * 2.5;
    const REP_FORCE     = 350;
    const currentFSpeed = p.speedBoost > 0 ? FSPD * 2 : FSPD;

    for (let i = 0; i < p.followers.length; i++) {
      const f    = p.followers[i];
      const dx   = p.x - f.x;
      const dy   = p.y - f.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let vx = 0, vy = 0;
      if (dist > 1) {
        const spd = Math.min(dist * 10, currentFSpeed);
        vx = (dx / dist) * spd;
        vy = (dy / dist) * spd;
      }

      let rx = 0, ry = 0;
      for (let j = 0; j < p.followers.length; j++) {
        if (i === j) continue;
        const other = p.followers[j];
        let ox = f.x - other.x, oy = f.y - other.y;
        let od = Math.sqrt(ox * ox + oy * oy);
        if (od < REP_RAD) {
          if (od === 0) { ox = rnd(-1, 1); oy = rnd(-1, 1); od = 0.1; }
          const push = 1 - od / REP_RAD;
          rx += (ox / od) * REP_FORCE * push;
          ry += (oy / od) * REP_FORCE * push;
        }
      }

      f.x = cl(f.x + (vx + rx) * dt, FR, WW - FR);
      f.y = cl(f.y + (vy + ry) * dt, FR, WH - FR);
    }
  }

  return { loadSettings, saveSettings, mkPlayers, blobUpdate };
})();