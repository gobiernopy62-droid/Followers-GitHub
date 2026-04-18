'use strict';

/* ══════════════════════════════════
   FOLLOWERS — POWERUPS / SPAWNS
   Expuesto como window.FPowerups
   Depende de: window.FC
══════════════════════════════════ */
window.FPowerups = (function () {
  const { WW, WH, SPAWNS, NR, rnd, d2 } = window.FC;

  /* ── Internal: find a valid random map position ── */
  function safeSpot(avoidList = [], avoidDist = NR * 3.5) {
    for (let tries = 0; tries < 300; tries++) {
      const x = rnd(140, WW - 140);
      const y = rnd(140, WH - 140);
      let bad = false;
      for (const s of SPAWNS)    { if (d2({ x, y }, s) < 180)      { bad = true; break; } }
      if (!bad)
      for (const s of avoidList) { if (d2({ x, y }, s) < avoidDist) { bad = true; break; } }
      if (!bad) return { x, y };
    }
    return null;
  }

  /* ── Public spawn functions ──────────────────── */

  function spawnNPCs(count) {
    const result = [];
    let i = 0;
    while (i < count) {
      const pos = safeSpot(result);
      if (!pos) break;
      result.push({ x: pos.x, y: pos.y, owner: null, ck: null, wx: rnd(-26, 26), wy: rnd(-26, 26) });
      i++;
    }
    return result;
  }

  function spawnVelocityPowerups(count) {
    const result = [];
    let i = 0;
    while (i < count) {
      const pos = safeSpot();
      if (!pos) break;
      result.push({ x: pos.x, y: pos.y });
      i++;
    }
    return result;
  }

  function spawnShurikenPowerups(count) {
    const result = [];
    let i = 0;
    while (i < count) {
      const pos = safeSpot();
      if (!pos) break;
      result.push({ x: pos.x, y: pos.y, spin: 0 });
      i++;
    }
    return result;
  }

  function spawnEggPowerups(count) {
    const result = [];
    let i = 0;
    while (i < count) {
      const pos = safeSpot();
      if (!pos) break;
      result.push({ x: pos.x, y: pos.y, bob: Math.random() * Math.PI * 2 });
      i++;
    }
    return result;
  }

  return { spawnNPCs, spawnVelocityPowerups, spawnShurikenPowerups, spawnEggPowerups };
})();
