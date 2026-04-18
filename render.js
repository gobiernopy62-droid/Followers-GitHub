'use strict';

/* ══════════════════════════════════
   FOLLOWERS — RENDER
   Expuesto como window.FRender
   Depende de: window.FC
══════════════════════════════════ */
window.FRender = (function () {
  const { WW, WH, ROAD, BLOCK, STEP, CLR, SHURIKEN_RANGE, FR, NR, PR, EGG_R, ASSET_PATHS } = window.FC;

  /* ── Image cache ─────────────────────────── */
  const IMGS = {};

  function loadImgs() {
    const entries = [...Object.entries(ASSET_PATHS)];
    if (window.FSkins) {
      for (const skin of window.FSkins.SKINS) {
        if (skin.file) entries.push([`skin_${skin.id}`, skin.file]);
      }
    }

    const total = entries.length;
    if (total === 0) return Promise.resolve();

    let settled = 0;
    return new Promise(resolve => {
      function check() { if (++settled >= total) resolve(); }
      for (const [key, src] of entries) {
        const img   = new Image();
        img.onload  = () => { IMGS[key] = img;  check(); };
        img.onerror = () => { IMGS[key] = null; check(); };
        img.src     = src;
      }
    });
  }

  /* ── Offscreen city canvas ───────────────── */
  let ofc = null, ofx = null;

  function buildCity() {
    const cols = Math.ceil(WW / STEP), rows = Math.ceil(WH / STEP);
    const sidewalks = [];
    for (let bx = 0; bx < cols; bx++)
      for (let by = 0; by < rows; by++)
        sidewalks.push({ x: bx * STEP + ROAD, y: by * STEP + ROAD, w: BLOCK, h: BLOCK });
    return { sidewalks };
  }

  function drawCity(data) {
    ofx.fillStyle = '#1e2025';
    ofx.fillRect(0, 0, WW, WH);
    const cols = Math.ceil(WW / STEP), rows = Math.ceil(WH / STEP);

    ofx.strokeStyle = 'rgba(255,255,255,0.15)';
    ofx.lineWidth   = 4;
    ofx.setLineDash([20, 20]);
    for (let bx = 0; bx <= cols; bx++) { const rx = bx * STEP + ROAD / 2; ofx.beginPath(); ofx.moveTo(rx, 0); ofx.lineTo(rx, WH); ofx.stroke(); }
    for (let by = 0; by <= rows; by++) { const ry = by * STEP + ROAD / 2; ofx.beginPath(); ofx.moveTo(0, ry); ofx.lineTo(WW, ry); ofx.stroke(); }
    ofx.setLineDash([]);

    for (const s of data.sidewalks) {
      ofx.fillStyle   = '#2a2d34';
      ofx.fillRect(s.x, s.y, s.w, s.h);
      ofx.strokeStyle = '#181a1f';
      ofx.lineWidth   = 6;
      ofx.strokeRect(s.x, s.y, s.w, s.h);
      ofx.strokeStyle = 'rgba(255,255,255,0.03)';
      ofx.lineWidth   = 2;
      for (let i = 1; i < 4; i++) {
        ofx.beginPath(); ofx.moveTo(s.x + (s.w / 4) * i, s.y);               ofx.lineTo(s.x + (s.w / 4) * i, s.y + s.h); ofx.stroke();
        ofx.beginPath(); ofx.moveTo(s.x,                  s.y + (s.h / 4) * i); ofx.lineTo(s.x + s.w,           s.y + (s.h / 4) * i); ofx.stroke();
      }
    }

    const vg = ofx.createRadialGradient(WW / 2, WH / 2, WW * .3, WW / 2, WH / 2, WW * .8);
    vg.addColorStop(0, 'transparent');
    vg.addColorStop(1, 'rgba(0,0,0,.6)');
    ofx.fillStyle = vg;
    ofx.fillRect(0, 0, WW, WH);
  }

  function ensureCity() {
    if (ofc) return;
    ofc = document.createElement('canvas');
    ofc.width = WW; ofc.height = WH;
    ofx = ofc.getContext('2d');
    drawCity(buildCity());
  }

  /* ── Draw helpers ────────────────────────── */

  function drawFallback(ctx, x, y, r, ck, isNPC) {
    ctx.save();
    ctx.globalAlpha = .26;
    const gr = ctx.createRadialGradient(x, y, r * .2, x, y, r * 2.2);
    gr.addColorStop(0, isNPC ? 'rgba(200,210,255,.5)' : (CLR[ck] || CLR.red).g);
    gr.addColorStop(1, 'transparent');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .26; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x + 2, y + r * .7, r * .8, r * .42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle   = isNPC ? '#d8daf0' : (CLR[ck] || CLR.red).h;
    ctx.strokeStyle = isNPC ? 'rgba(160,165,210,.5)' : (CLR[ck] || CLR.red).d;
    ctx.lineWidth   = 2.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.beginPath(); ctx.arc(x - r * .28, y - r * .3, r * .4, 0, Math.PI * 2); ctx.fill();
    if (isNPC) {
      ctx.fillStyle = 'rgba(90,90,150,.85)'; ctx.font = `700 ${r * .9}px Nunito`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y + 1);
    }
    ctx.restore();
  }

  function drawChar(ctx, x, y, r, ck, name, isNPC, isFollower) {
    const img = IMGS[isNPC ? 'npc' : ck];
    const s   = r * 2;
    if (img) {
      ctx.save(); ctx.globalAlpha = .24; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(x + 2, y + r * .75, r * .78, r * .38, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

      if (!isFollower && !isNPC) {
        ctx.save(); ctx.globalAlpha = .28;
        const gr = ctx.createRadialGradient(x, y, r * .2, x, y, r * 2.4);
        gr.addColorStop(0, CLR[ck].g); gr.addColorStop(1, 'transparent');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }

      if (isFollower && ck) {
        ctx.save();
        ctx.drawImage(img, x - r, y - r, s, s);
        ctx.globalAlpha = .42; ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = CLR[ck].h; ctx.fillRect(x - r, y - r, s, s);
        ctx.restore();
      } else {
        ctx.drawImage(img, x - r, y - r, s, s);
      }
    } else {
      drawFallback(ctx, x, y, r, ck, isNPC);
    }

    if (name && !isFollower) {
      ctx.save();
      ctx.font = '700 11px Nunito'; ctx.textAlign = 'center';
      const tw = ctx.measureText(name).width;
      const bw = tw + 14, bh = 17, bx2 = x - bw / 2, by2 = y - r - 24;
      ctx.fillStyle = 'rgba(0,0,0,.76)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx2, by2, bw, bh, 5); else ctx.rect(bx2, by2, bw, bh);
      ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(name, x, by2 + bh / 2 + .5);
      ctx.restore();
    }
  }

  function drawVelocityPowerUp(ctx, x, y, r) {
    const img = IMGS['vel'], s = r * 2;
    if (img) {
      ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(x + 2, y + r * .75, r * .78, r * .38, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.drawImage(img, x - r, y - r, s, s);
    } else {
      ctx.save();
      ctx.shadowColor = '#00FFFF'; ctx.shadowBlur = 10;
      ctx.fillStyle   = '#00FFFF'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.font = `900 ${r}px Nunito`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowBlur = 0;
      ctx.fillText('⚡', x, y + 2); ctx.restore();
    }
  }

  function drawShurikenPowerUp(ctx, x, y, r, angle) {
    const img = IMGS['shuriken'], s = r * 2.2;
    ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x + 2, y + r * .8, r * .78, r * .38, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = .32;
    const gr = ctx.createRadialGradient(x, y, r * .2, x, y, r * 2.6);
    gr.addColorStop(0, 'rgba(255,60,60,.7)'); gr.addColorStop(1, 'transparent');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    if (img) { ctx.drawImage(img, -s / 2, -s / 2, s, s); }
    else { ctx.fillStyle = '#FF4444'; ctx.font = `900 ${r * 1.4}px Nunito`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✦', 0, 1); }
    ctx.restore();
  }

  function drawEggPowerUp(ctx, x, y, r, bob) {
    const img = IMGS['huevos'], s = r * 2.2, floatY = Math.sin(bob) * 4;
    ctx.save(); ctx.globalAlpha = .22; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x + 2, y + r * .9, r * .7, r * .32, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = .28;
    const gr = ctx.createRadialGradient(x, y + floatY, r * .2, x, y + floatY, r * 2.8);
    gr.addColorStop(0, 'rgba(255,220,50,.75)'); gr.addColorStop(1, 'transparent');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y + floatY, r * 2.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (img) { ctx.drawImage(img, x - r, y - r + floatY, s, s); }
    else { ctx.save(); ctx.font = `900 ${r * 1.5}px Nunito`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🥚', x, y + floatY + 2); ctx.restore(); }
  }

  function drawPlacedEgg(ctx, x, y, r) {
    const img = IMGS['huevo'], s = r * 2;
    ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x + 1, y + r * .8, r * .65, r * .3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = .15;
    const gr = ctx.createRadialGradient(x, y, r * .1, x, y, r * 2);
    gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'transparent');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r * 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (img) { ctx.drawImage(img, x - r, y - r, s, s); }
    else { ctx.save(); ctx.font = `900 ${r * 1.4}px Nunito`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🥚', x, y + 2); ctx.restore(); }
  }

  function drawSkinOverlay(ctx, x, y, r, skinId) {
    if (!skinId || skinId === 'none') return;
    const img = IMGS[`skin_${skinId}`];
    if (!img) return;
    const s      = r * 2;
    const aspect = img.naturalWidth / img.naturalHeight;

    let drawW, drawH;
    if (aspect < 1) {
      /* Skin más alta que ancha: fijamos el ancho al tamaño del jugador
         y escalamos el alto proporcionalmente */
      drawW = s;
      drawH = s / aspect;
    } else {
      /* Skin más ancha que alta (o cuadrada): fijamos el alto y
         escalamos el ancho proporcionalmente */
      drawH = s;
      drawW = s * aspect;
    }

    /* Anclaje en los pies del jugador (y + r) para que skins más
       altas crezcan hacia arriba y no hacia abajo */
    ctx.drawImage(img, x - drawW / 2, y + r - drawH, drawW, drawH);
  }

  function drawProjectile(ctx, x, y, angle, ck) {
    const img = IMGS['shuriken'], s = 20;
    ctx.save(); ctx.globalAlpha = .22;
    const trail = ctx.createRadialGradient(x, y, 1, x, y, s * .9);
    trail.addColorStop(0, (CLR[ck] || CLR.red).g); trail.addColorStop(1, 'transparent');
    ctx.fillStyle = trail; ctx.beginPath(); ctx.arc(x, y, s * .9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    if (img) { ctx.drawImage(img, -s / 2, -s / 2, s, s); }
    else { ctx.fillStyle = (CLR[ck] || CLR.red).h; ctx.font = '900 14px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✦', 0, 1); }
    ctx.restore();
  }

  /* ── Main draw ───────────────────────────── */

  function draw(ctx, cv, camX, camY, gs, scale = 1) {
    const { players, npcs, powerups, shurikenPowerups, eggPowerups, placedEggs, projectiles, parts } = gs;
    const W  = cv.width, H = cv.height;

    /* Con scale < 1 (móvil) el viewport en unidades de mundo es mayor,
       de modo que los personajes se ven proporcionalmente más pequeños. */
    const vw = W / scale, vh = H / scale;
    const ox = Math.round(camX - vw / 2), oy = Math.round(camY - vh / 2);

    ctx.clearRect(0, 0, W, H);

    /* Aplicar zoom — todo lo que se dibuja a partir de aquí usa
       coordenadas de mundo; el scale las convierte a píxeles físicos. */
    ctx.save();
    ctx.scale(scale, scale);

    ctx.drawImage(ofc, -ox, -oy);

    for (const pow of powerups)         drawVelocityPowerUp(ctx, pow.x - ox, pow.y - oy, NR);
    for (const sp  of shurikenPowerups) drawShurikenPowerUp(ctx, sp.x  - ox, sp.y  - oy, NR, sp.spin || 0);
    for (const ep  of eggPowerups)      drawEggPowerUp(ctx, ep.x  - ox, ep.y  - oy, NR, ep.bob || 0);
    for (const eg  of placedEggs)       drawPlacedEgg(ctx, eg.x  - ox, eg.y  - oy, EGG_R);

    for (const n of npcs) { if (n.owner !== null) continue; drawChar(ctx, n.x - ox, n.y - oy, NR, null, null, true, false); }

    const active = players.filter(p => !p.elim);
    for (const p of active) for (const f of p.followers) drawChar(ctx, f.x - ox, f.y - oy, FR, f.ck, null, false, true);

    for (const p of active) {
      if (p.shurikenBoost <= 0) continue;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,50,50,0.75)'; ctx.fillStyle = 'rgba(255,30,30,0.10)';
      ctx.lineWidth = 2.5; ctx.setLineDash([8, 5]);
      ctx.beginPath(); ctx.arc(p.x - ox, p.y - oy, SHURIKEN_RANGE, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }

    for (const p of active) {
      drawChar(ctx, p.x - ox, p.y - oy, PR, p.ck, p.name, false, false);
      if (p.skin && p.skin !== 'none') drawSkinOverlay(ctx, p.x - ox, p.y - oy, PR, p.skin);
      if (p.stunTimer > 0) {
        ctx.save();
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.012);
        ctx.globalAlpha = 0.55 + pulse * 0.3; ctx.strokeStyle = '#AAAAFF';
        ctx.lineWidth = 3; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(p.x - ox, p.y - oy, PR + 6 + pulse * 4, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.85; ctx.font = `${12 + pulse * 3}px Nunito`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const t = performance.now() * 0.003;
        for (let s = 0; s < 3; s++) {
          const a = t + s * (Math.PI * 2 / 3), sr = PR + 14;
          ctx.fillText('★', p.x - ox + Math.cos(a) * sr, p.y - oy + Math.sin(a) * sr);
        }
        ctx.restore();
      }
    }

    for (const pr of projectiles) drawProjectile(ctx, pr.x - ox, pr.y - oy, pr.angle, pr.ownerCk);

    for (const pt of parts) {
      ctx.save(); ctx.globalAlpha = pt.life * .9; ctx.fillStyle = pt.c;
      ctx.beginPath(); ctx.arc(pt.x - ox, pt.y - oy, pt.r * pt.life, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    ctx.restore(); /* fin del ctx.scale() */
  }

  /* ── Minimap / radar ─────────────────────── */

  function drawMinimap(ctx, cv, camX, camY, gs, isMob) {
    const { players, powerups, shurikenPowerups, eggPowerups } = gs;

    /* ── Layout ─────────────────────────────── */
    const SIZE   = isMob ? 52  : 68;   // radio del círculo en px de pantalla
    const MRIGHT = 14;
    const MBOT   = isMob ? 138 : 14;   // margen inferior — esquiva el botón de disparo en móvil

    const cx = cv.width  - SIZE - MRIGHT;
    const cy = cv.height - SIZE - MBOT;

    /* ── Escala mundo → minimap ──────────────── */
    const WORLD_R = 920;                // radio en unidades de mundo que cabe en el minimap
    const s = SIZE / WORLD_R;

    function toMap(wx, wy) {
      return { x: cx + (wx - camX) * s, y: cy + (wy - camY) * s };
    }

    /* ── Clip circular ───────────────────────── */
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, SIZE, 0, Math.PI * 2);
    ctx.clip();

    /* Fondo semitransparente */
    ctx.fillStyle = 'rgba(6,6,14,0.74)';
    ctx.fill();

    /* Grid sutil para dar sensación de mapa */
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth   = 1;
    const gridStep  = WORLD_R / 3;
    for (let gx = -WORLD_R; gx <= WORLD_R; gx += gridStep) {
      const px = cx + gx * s;
      ctx.beginPath(); ctx.moveTo(px, cy - SIZE); ctx.lineTo(px, cy + SIZE); ctx.stroke();
    }
    for (let gy = -WORLD_R; gy <= WORLD_R; gy += gridStep) {
      const py = cy + gy * s;
      ctx.beginPath(); ctx.moveTo(cx - SIZE, py); ctx.lineTo(cx + SIZE, py); ctx.stroke();
    }
    ctx.restore();

    /* Línea de cruz central muy sutil */
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(cx - SIZE, cy); ctx.lineTo(cx + SIZE, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - SIZE); ctx.lineTo(cx, cy + SIZE); ctx.stroke();
    ctx.restore();

    /* ── Power-ups ───────────────────────────── */
    const IC = isMob ? 4.5 : 5.5;   // "radio" base de cada icono en px de pantalla

    /* Velocidad — vial azul intenso con rayo amarillo */
    for (const pow of powerups) {
      const { x, y } = toMap(pow.x, pow.y);
      ctx.save();
      ctx.shadowColor = '#2255FF'; ctx.shadowBlur = 6;
      ctx.translate(x, y);

      /* Cuerpo del vial (rectángulo redondeado, azul intenso) */
      const vw = IC * 0.78, vh = IC * 1.6, vr = IC * 0.28;
      ctx.fillStyle = '#1144EE';
      ctx.beginPath();
      ctx.moveTo(-vw / 2 + vr, -vh / 2);
      ctx.lineTo( vw / 2 - vr, -vh / 2);
      ctx.arcTo(  vw / 2, -vh / 2,  vw / 2, -vh / 2 + vr, vr);
      ctx.lineTo( vw / 2,  vh / 2 - vr);
      ctx.arcTo(  vw / 2,  vh / 2, -vw / 2 + vr,  vh / 2, vr);
      ctx.lineTo(-vw / 2 + vr,  vh / 2);
      ctx.arcTo( -vw / 2,  vh / 2, -vw / 2, -vh / 2 + vr, vr);
      ctx.lineTo(-vw / 2, -vh / 2 + vr);
      ctx.arcTo( -vw / 2, -vh / 2, -vw / 2 + vr, -vh / 2, vr);
      ctx.closePath();
      ctx.fill();

      /* Tapa superior del vial */
      ctx.fillStyle = '#88AAFF';
      ctx.fillRect(-vw * 0.3, -vh / 2 - IC * 0.22, vw * 0.6, IC * 0.22);

      /* Brillo lateral izquierdo */
      ctx.globalAlpha = 0.3;
      ctx.fillStyle   = '#ffffff';
      ctx.fillRect(-vw / 2 + vr * 0.5, -vh * 0.35, vw * 0.22, vh * 0.55);
      ctx.globalAlpha = 1;

      /* Rayo amarillo intenso */
      ctx.shadowColor = '#FFE000'; ctx.shadowBlur = 5;
      ctx.fillStyle   = '#FFE000';
      ctx.beginPath();
      ctx.moveTo( IC * 0.12, -IC * 0.58);
      ctx.lineTo(-IC * 0.18,  IC * 0.08);
      ctx.lineTo( IC * 0.04,  IC * 0.08);
      ctx.lineTo(-IC * 0.12,  IC * 0.58);
      ctx.lineTo( IC * 0.22, -IC * 0.08);
      ctx.lineTo( IC * 0.06, -IC * 0.08);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    /* Shuriken — estrella de 4 puntas girada */
    for (const sp of shurikenPowerups) {
      const { x, y } = toMap(sp.x, sp.y);
      ctx.save();
      ctx.shadowColor = '#FF3333'; ctx.shadowBlur = 6;
      ctx.translate(x, y);
      ctx.rotate(performance.now() * 0.002);   // gira suavemente

      ctx.fillStyle = '#CC1111';
      /* 4 puntas: dibujamos dos rectángulos rotados 45° entre sí */
      for (let blade = 0; blade < 2; blade++) {
        ctx.save();
        ctx.rotate(blade * Math.PI / 4);
        const bw = IC * 0.42, bl = IC * 1.1;
        ctx.beginPath();
        /* punta superior */
        ctx.moveTo(0, -bl);
        ctx.lineTo( bw * 0.55, -IC * 0.22);
        ctx.lineTo(-bw * 0.55, -IC * 0.22);
        ctx.closePath();
        ctx.fill();
        /* punta inferior */
        ctx.beginPath();
        ctx.moveTo(0,  bl);
        ctx.lineTo( bw * 0.55,  IC * 0.22);
        ctx.lineTo(-bw * 0.55,  IC * 0.22);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      /* Centro circular */
      ctx.fillStyle = '#FF4444';
      ctx.beginPath(); ctx.arc(0, 0, IC * 0.28, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    }

    /* Huevo — óvalo rosado con franjas diagonales pastel */
    for (const ep of eggPowerups) {
      const { x, y } = toMap(ep.x, ep.y);
      ctx.save();
      ctx.shadowColor = '#FF66AA'; ctx.shadowBlur = 6;
      ctx.translate(x, y);

      const ew = IC * 0.78, eh = IC * 1.05;

      /* Cuerpo del huevo */
      ctx.fillStyle = '#FF5599';
      ctx.beginPath();
      ctx.ellipse(0, IC * 0.1, ew * 0.5, eh * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();

      /* Banda central blanca/pastel */
      ctx.save();
      ctx.clip();   // ya tenemos el path del huevo activo — hacemos clip para que la banda no salga
      ctx.beginPath();
      ctx.ellipse(0, IC * 0.1, ew * 0.5, eh * 0.52, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,180,210,0.55)';
      ctx.fillRect(-ew, IC * 0.1 - eh * 0.18, ew * 2, eh * 0.36);
      ctx.restore();

      /* Brillo */
      ctx.globalAlpha = 0.45;
      ctx.fillStyle   = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-ew * 0.15, -eh * 0.12, ew * 0.18, eh * 0.13, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.restore();
    }

    /* ── Jugadores ───────────────────────────── */
    for (const p of players) {
      if (p.elim) continue;
      const mp    = toMap(p.x, p.y);
      const color = (CLR[p.ck] || CLR.red).h;

      if (p.human) {
        /* Jugador humano: punto más grande + anillo blanco */
        ctx.save();
        ctx.shadowColor = color; ctx.shadowBlur = 8;
        ctx.fillStyle   = color;
        ctx.beginPath(); ctx.arc(mp.x, mp.y, isMob ? 5.5 : 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur    = 0;
        ctx.strokeStyle   = '#ffffff';
        ctx.lineWidth     = isMob ? 1.5 : 2;
        ctx.stroke();
        ctx.restore();
      } else {
        /* Bots */
        ctx.save();
        ctx.shadowColor = color; ctx.shadowBlur = 5;
        ctx.fillStyle   = color;
        ctx.beginPath(); ctx.arc(mp.x, mp.y, isMob ? 4 : 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore(); /* fin del clip */

    /* ── Borde exterior ──────────────────────── */
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, SIZE, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    /* Anillo interior sutil */
    ctx.beginPath();
    ctx.arc(cx, cy, SIZE - 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.restore();
  }

  return { loadImgs, ensureCity, draw, drawMinimap };
})();