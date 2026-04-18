'use strict';

/* ══════════════════════════════════
   FOLLOWERS — CONFIG & CONSTANTS
   Expuesto como window.FC
══════════════════════════════════ */
window.FC = (function () {

  /* ── World ──────────────────────────────── */
  const WW = 3000, WH = 3000;
  const ROAD = 80, BLOCK = 170, STEP = 250;

  /* ── Radii ──────────────────────────────── */
  const PR = 22, FR = 14, NR = 14;

  /* ── Speeds ─────────────────────────────── */
  const PSPD = 300, BSPD = 230, CSPD = 440, FSPD = 260;

  /* ── Spawn counts ───────────────────────── */
  const NPC_N = 50, POW_N = 5, SHURIKEN_POW_N = 4, EGG_POW_N = 3;

  /* ── Round ──────────────────────────────── */
  const RT = 30, MAX_R = 5;

  /* ── Combat ─────────────────────────────── */
  const SHURIKEN_RANGE    = 220;
  const SHURIKEN_SPD      = 480;
  const SHURIKEN_R        = 10;
  const SHURIKEN_DUR      = 10;
  const STEAL_CD          = 0.5;
  const FIRE_RATE         = 0.5;
  const BOT_FIRE_RATE_MIN = 0.35;
  const BOT_FIRE_RATE_MAX = 0.65;

  /* ── Egg power-up ───────────────────────── */
  const EGG_BOOST_DUR = 10;
  const EGG_STUN_DUR  = 2.5;
  const EGG_PLACE_CD  = 3;
  const EGG_R         = 10;

  /* ── Color / character data ─────────────── */
  /* NOTE: `n` is the bot display name — kept in English as the primary language. */
  const CKS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
  const CLR = {
    red:    { h: '#FF3355', d: '#991f33', g: 'rgba(255,51,85,.5)',    n: 'Red',    img: 'Assets/Characters/Rojo.png'     },
    blue:   { h: '#33AAFF', d: '#1a66aa', g: 'rgba(51,170,255,.5)',   n: 'Blue',   img: 'Assets/Characters/Azul.png'     },
    green:  { h: '#33EE66', d: '#1a8840', g: 'rgba(51,238,102,.5)',   n: 'Green',  img: 'Assets/Characters/Verde.png'    },
    yellow: { h: '#FFCC00', d: '#aa8800', g: 'rgba(255,204,0,.5)',    n: 'Yellow', img: 'Assets/Characters/Amarillo.png' },
    purple: { h: '#9933FF', d: '#5c1f99', g: 'rgba(153,51,255,.5)',   n: 'Purple', img: 'Assets/Characters/Morado.png'  },
    pink:   { h: '#FF33AA', d: '#991f66', g: 'rgba(255,51,170,.5)',   n: 'Pink',   img: 'Assets/Characters/Rosa.png'    },
  };

  const SPAWNS = [
    { x: 520,       y: 520       },
    { x: WW - 520,  y: 520       },
    { x: 520,       y: WH - 520  },
    { x: WW - 520,  y: WH - 520  },
    { x: 520,       y: WH / 2    },
    { x: WW - 520,  y: WH / 2    },
  ];

  /* ── Asset paths ────────────────────────── */
  const ASSET_PATHS = {
    red:      'Assets/Characters/Rojo.png',
    blue:     'Assets/Characters/Azul.png',
    green:    'Assets/Characters/Verde.png',
    yellow:   'Assets/Characters/Amarillo.png',
    purple:   'Assets/Characters/Morado.png',
    pink:     'Assets/Characters/Rosa.png',
    npc:      'Assets/Characters/NPC.png',
    vel:      'Assets/Power-Ups/Velocidad.png',
    shuriken: 'Assets/Power-Ups/Shuriken.png',
    huevos:   'Assets/Power-Ups/Huevo Sorpresa.png',
    huevo:    'Assets/Power-Ups/Huevo.png',
  };

  /* ── Math helpers ───────────────────────── */
  const rnd  = (a, b)    => a + Math.random() * (b - a);
  const rI   = (a, b)    => Math.floor(rnd(a, b + 1));
  const cl   = (v, a, b) => Math.max(a, Math.min(b, v));
  const d2   = (a, b)    => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  const norm = (dx, dy)  => { const l = Math.sqrt(dx * dx + dy * dy) || 1; return { x: dx / l, y: dy / l }; };

  return {
    WW, WH, ROAD, BLOCK, STEP,
    PR, FR, NR,
    PSPD, BSPD, CSPD, FSPD,
    NPC_N, POW_N, SHURIKEN_POW_N, EGG_POW_N,
    RT, MAX_R,
    SHURIKEN_RANGE, SHURIKEN_SPD, SHURIKEN_R, SHURIKEN_DUR,
    STEAL_CD, FIRE_RATE, BOT_FIRE_RATE_MIN, BOT_FIRE_RATE_MAX,
    EGG_BOOST_DUR, EGG_STUN_DUR, EGG_PLACE_CD, EGG_R,
    CKS, CLR, SPAWNS, ASSET_PATHS,
    rnd, rI, cl, d2, norm,
  };
})();