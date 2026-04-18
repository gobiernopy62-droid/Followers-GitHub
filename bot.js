'use strict';

/* ══════════════════════════════════
   FOLLOWERS — BOT AI
   Expuesto como window.FBot
   Depende de: window.FC
══════════════════════════════════ */
window.FBot = (function () {
  const { BSPD, PR, WW, WH, SHURIKEN_RANGE, BOT_FIRE_RATE_MIN, BOT_FIRE_RATE_MAX, rnd, cl, d2, norm } = window.FC;

  function botUpdate(bot, dt, active, world) {
    const { shurikenPowerups, powerups, eggPowerups, npcs, fireProjectile } = world;

    if (bot.stunTimer > 0) return;

    bot._tth       -= dt;
    bot._botFireCd -= dt;

    /* ── Shuriken auto-fire ─────────────────── */
    if (bot.shurikenBoost > 0 && bot._botFireCd <= 0) {
      let bestTarget = null, bestDist = Infinity;
      for (const p of active) {
        if (p === bot) continue;
        const dd = d2(bot, p);
        if (dd < bestDist) { bestDist = dd; bestTarget = p; }
      }
      for (const p of active) {
        if (p === bot) continue;
        for (const f of p.followers) {
          const dd = d2(bot, f);
          if (dd < bestDist) { bestDist = dd; bestTarget = f; }
        }
      }
      if (bestTarget) {
        let tx = bestTarget.x, ty = bestTarget.y;
        const ddx = tx - bot.x, ddy = ty - bot.y;
        const dd  = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dd > SHURIKEN_RANGE) { tx = bot.x + (ddx / dd) * SHURIKEN_RANGE; ty = bot.y + (ddy / dd) * SHURIKEN_RANGE; }
        fireProjectile(bot, tx, ty);
      } else {
        const ang = Math.random() * Math.PI * 2;
        fireProjectile(bot, bot.x + Math.cos(ang) * SHURIKEN_RANGE, bot.y + Math.sin(ang) * SHURIKEN_RANGE);
      }
      bot._botFireCd = rnd(BOT_FIRE_RATE_MIN, BOT_FIRE_RATE_MAX);
    }

    /* ── Target selection ───────────────────── */
    if (bot._tth <= 0 || !bot._tgt || bot._tgt.elim) {
      bot._tth = rnd(.6, 1.3);

      let sDist = Infinity, targetS = null;
      for (const p of shurikenPowerups) { const dd = d2(bot, p); if (dd < sDist) { sDist = dd; targetS = p; } }

      let pDist = Infinity, targetP = null;
      for (const p of powerups)         { const dd = d2(bot, p); if (dd < pDist) { pDist = dd; targetP = p; } }

      let eDist2 = Infinity, targetE = null;
      for (const p of eggPowerups)      { const dd = d2(bot, p); if (dd < eDist2) { eDist2 = dd; targetE = p; } }

      let freeNPC = null, nDist = Infinity;
      for (const n of npcs) {
        if (n.owner !== null) continue;
        const dd = d2(bot, n);
        if (dd < nDist) { nDist = dd; freeNPC = n; }
      }

      let enemy = null, eDist = Infinity;
      for (const p of active) {
        if (p === bot) continue;
        const dd = d2(bot, p);
        if (dd < eDist && p.followers.length > 0) { eDist = dd; enemy = p; }
      }

      if      (targetS && sDist  < 320)         bot._tgt = targetS;
      else if (targetP && pDist  < 300)         bot._tgt = targetP;
      else if (targetE && eDist2 < 320)         bot._tgt = targetE;
      else if (enemy   && eDist  < nDist * 1.4) bot._tgt = enemy;
      else if (freeNPC)                         bot._tgt = freeNPC;
      else if (enemy)                           bot._tgt = enemy;
      else {
        let near = null, nd = Infinity;
        for (const p of active) { if (p === bot) continue; const dd = d2(bot, p); if (dd < nd) { nd = dd; near = p; } }
        bot._tgt = near;
      }
    }

    if (!bot._tgt) return;

    /* ── Move toward target ─────────────────── */
    const spd = bot.speedBoost > 0 ? BSPD * 2 : BSPD;
    const n   = norm(bot._tgt.x - bot.x, bot._tgt.y - bot.y);
    bot.x = cl(bot.x + n.x * spd * dt, PR, WW - PR);
    bot.y = cl(bot.y + n.y * spd * dt, PR, WH - PR);
  }

  return { botUpdate };
})();
