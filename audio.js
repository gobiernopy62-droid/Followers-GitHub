'use strict';

/* ══════════════════════════════════
   FOLLOWERS — AUDIO
   Expuesto como window.FAudio
   Sin dependencias externas
══════════════════════════════════ */
window.FAudio = (function () {

  const BASE = 'Assets/Audio/';

  /* ── Asset paths ─────────────────────────── */
  const MUSIC_SRCS = {
    menu:     BASE + 'Menu.ogg',
    dresser:  BASE + 'Dresser.ogg',
    gameplay: BASE + 'GamePlay.ogg',
  };

  const SFX_SRCS = {
    click:    BASE + 'Click.wav',
    pop:      BASE + 'Pop.wav',
    shuriken: BASE + 'Shuriken.wav',
  };

  const STORAGE_KEY = 'followers_audio';

  /* ── Persistence ─────────────────────────── */
  let musicEnabled = true;
  let sfxEnabled   = true;

  function loadSettings() {
    try {
      const d  = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      musicEnabled = d.music !== false;
      sfxEnabled   = d.sfx   !== false;
    } catch { /* falla silenciosamente */ }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ music: musicEnabled, sfx: sfxEnabled }));
    } catch { /* falla silenciosamente */ }
  }

  /* ── Precarga ────────────────────────────────────────────────
     FIX: todos los archivos se descargan UNA sola vez al inicio.
     Antes se hacía new Audio(src) en cada llamada, lo que forzaba
     un fetch de red en el momento del play → los SFX no sonaban
     hasta que el browser los cacheaba (típicamente ronda 3).
  ─────────────────────────────────────────────────────────── */

  /* Música: un elemento Audio fijo por pista, reutilizado siempre */
  const _musicCache = {};
  (function _preloadMusic() {
    for (const [key, src] of Object.entries(MUSIC_SRCS)) {
      const audio    = new Audio(src);
      audio.preload  = 'auto';
      audio.loop     = true;
      audio.volume   = 0.5;
      audio.load();
      _musicCache[key] = audio;
    }
  })();

  /* SFX: un elemento Audio base por sonido; se clona para cada reproducción
     (cloneNode reutiliza los datos ya descargados → instantáneo) */
  const _sfxCache = {};
  (function _preloadSfx() {
    for (const [key, src] of Object.entries(SFX_SRCS)) {
      const audio   = new Audio(src);
      audio.preload = 'auto';
      audio.load();
      _sfxCache[key] = audio;
    }
  })();

  /* ── Audio ready Promise ─────────────────────────────────────
     Resuelve cuando todos los elementos de audio tienen datos
     suficientes para reproducirse (readyState ≥ 3), o tras un
     timeout de seguridad de 4 s — necesario en móvil, donde el
     navegador bloquea la carga de audio hasta la primera
     interacción del usuario y canplaythrough nunca dispara.
  ─────────────────────────────────────────────────────────── */
  const _allAudioElements = [
    ...Object.values(_musicCache),
    ...Object.values(_sfxCache),
  ];

  const _audioSettledPromise = new Promise(resolve => {
    const total = _allAudioElements.length;
    if (total === 0) { resolve(); return; }
    let settled = 0;
    function check() { if (++settled >= total) resolve(); }
    for (const audio of _allAudioElements) {
      if (audio.readyState >= 3) { check(); continue; }
      audio.addEventListener('canplaythrough', check, { once: true });
      audio.addEventListener('error',          check, { once: true });
    }
  });

  /* El race garantiza que en móvil nunca nos quedemos bloqueados */
  const audioReady = Promise.race([
    _audioSettledPromise,
    new Promise(r => setTimeout(r, 4000)),
  ]);

  /* ── Music ───────────────────────────────── */
  let currentTrack        = null;
  let currentKey          = null;
  let _currentPlayPromise = null;   /* FIX Bug #2: rastrea la Promise pendiente de play() */

  function playMusic(key) {
    const next = _musicCache[key];
    if (!next) return;

    /* Si ya está sonando la misma pista, no hacer nada */
    if (currentTrack === next && !currentTrack.paused) return;

    const prevTrack = currentTrack;
    currentKey      = key;
    currentTrack    = next;

    /* FIX Bug #2: esperamos la Promise activa antes de hacer pause(),
       evitando el AbortError que ocurre cuando pause() se llama
       antes de que play() haya resuelto (race condition). */
    (_currentPlayPromise ?? Promise.resolve()).finally(() => {
      if (prevTrack && prevTrack !== next) {
        prevTrack.pause();
        prevTrack.currentTime = 0;
      }

      if (musicEnabled) {
        next.currentTime    = 0;
        _currentPlayPromise = next.play().catch(() => {});
      }
    });
  }

  /* ── Autoplay unlock ─────────────────────────────────────────
     En la primera interacción real del usuario, reanudamos la
     pista que el navegador pudo haber bloqueado por autoplay.
     Un solo disparo — después el audio ya está desbloqueado.
  ─────────────────────────────────────────────────────────── */
  function _unlock() {
    if (currentTrack && currentTrack.paused && musicEnabled) {
      currentTrack.play().catch(() => {});
    }
  }
  document.addEventListener('pointerdown', _unlock, { once: true });

  /* ── SFX ─────────────────────────────────── */

  /* Pool de referencias activas para evitar que el GC destruya
     el objeto Audio antes de que termine de reproducirse. */
  const _sfxPool = new Set();

  function playSfx(key) {
    if (!sfxEnabled) return;
    const template = _sfxCache[key];
    if (!template) return;

    /* cloneNode() copia el elemento ya cargado → sin fetch, sin delay */
    const audio = template.cloneNode();
    audio.volume = 0.65;

    _sfxPool.add(audio);
    audio.addEventListener('ended', () => _sfxPool.delete(audio), { once: true });
    audio.play().catch(() => _sfxPool.delete(audio));
  }

  /* ── Controles públicos ──────────────────── */
  function setMusicEnabled(val) {
    musicEnabled = !!val;
    saveSettings();
    if (!currentTrack) return;
    if (musicEnabled) {
      currentTrack.volume     = 0.5;
      _currentPlayPromise     = currentTrack.play().catch(() => {});
    } else {
      (_currentPlayPromise ?? Promise.resolve()).finally(() => {
        currentTrack.pause();
      });
    }
  }

  function setSfxEnabled(val) {
    sfxEnabled = !!val;
    saveSettings();
  }

  function isMusicEnabled() { return musicEnabled; }
  function isSfxEnabled()   { return sfxEnabled;   }

  /* ── Init ────────────────────────────────── */
  loadSettings();

  return { playMusic, playSfx, setMusicEnabled, setSfxEnabled, isMusicEnabled, isSfxEnabled, audioReady };
})();