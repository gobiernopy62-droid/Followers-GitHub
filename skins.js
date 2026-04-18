'use strict';

/* ══════════════════════════════════
   FOLLOWERS — SKINS
   Expuesto como window.FSkins
   Sin dependencias externas
══════════════════════════════════ */
window.FSkins = (function () {

  const STORAGE_KEY  = 'followers_skin';
  const COINS_KEY    = 'followers_coins';
  const UNLOCKED_KEY = 'followers_unlocked';

  /* ── Skin catalogue ──────────────────────── */
  /* `name` and `desc` are objects { en, es, pt } to support i18n.
     Use getSkinName(skin) / getSkinDesc(skin) to get the localized string. */
  const SKINS = [
    {
      id:    'none',
      name:  { en: 'None',        es: 'Nada',         pt: 'Nenhum' },
      file:  null,
      price: 0,
      desc:  {
        en: 'This outfit is very... classic, and... common, and... well, it really has nothing interesting. Buy a nice outfit!',
        es: 'Este es un atuendo muy... clásico, y... común, y... bueno, realmente no tiene nada interesante, ¡Compra algún atuendo bonico!',
        pt: 'Este figurino é muito... clássico, e... comum, e... bem, não tem nada de interessante mesmo. Compra um figurino bonito!',
      },
    },
    {
      id:    'boca',
      name:  { en: 'Mouth',        es: 'Boca',         pt: 'Boca' },
      file:  'Assets/Skins/Boca.png',
      price: 30,
      desc:  {
        en: 'A budget outfit that truly lives up to its price lol',
        es: 'Un atuendo económico y que le hace honor a su precio XD',
        pt: 'Um figurino baratinho que faz jus ao seu preço kkkk',
      },
    },
    {
      id:    'sunglasses',
      name:  { en: 'Sunglasses',  es: 'Gafas de Sol', pt: 'Óculos de Sol' },
      file:  'Assets/Skins/Sunglasses.png',
      price: 50,
      desc:  {
        en: 'These glasses are so cool! With this outfit you\'ll show other players you have style.',
        es: '¡Estas gafas son muy guays!, con este atuendo le demostrarás a los otros jugadores que tienes estilo.',
        pt: 'Esses óculos são demais! Com este figurino você vai mostrar pros outros jogadores que tem estilo.',
      },
    },
    {
      id:    'scientist',
      name:  { en: 'Scientist',   es: 'Científico',   pt: 'Cientista' },
      file:  'Assets/Skins/TheScientist.png',
      price: 60,
      desc:  {
        en: 'Looking for the smartest and most scientific outfit? Eureka, you found it — this is it!',
        es: '¿Estás buscando el atuendo más inteligente y científico?, ¡Eureka, lo has encontrado, este es!',
        pt: 'Procurando o figurino mais inteligente e científico? Eureka, você encontrou — é esse aqui!',
      },
    },
    {
      id:    'collar',
      name:  { en: 'Collar',      es: 'Collar',       pt: 'Colar' },
      file:  'Assets/Skins/Collar.png',
      price: 70,
      desc:  {
        en: 'A very elegant and refined outfit, excellent for special and formal occasions... Is this game formal? No, but you\'ll show everyone you have class!',
        es: 'Un atuendo muy elegante y fino, excelente para ocasiones especiales y formales... ¿Este juego es formal?, no, pero... ¡Podrás demostrarles a todos que tú sí tienes clase!',
        pt: 'Um figurino muito elegante e refinado, ótimo para ocasiões especiais e formais... Este jogo é formal? Não, mas você vai mostrar a todos que tem classe!',
      },
    },
    {
      id:    'police',
      name:  { en: 'Police',      es: 'Policía',      pt: 'Policial' },
      file:  'Assets/Skins/The Police.png',
      price: 100,
      desc:  {
        en: 'With this outfit you\'ll show your authority and prove you\'re the boss of this game!',
        es: 'Con este atuendo demostrarás tu autoridad y demostrarás que eres el jefe de este juego!',
        pt: 'Com este figurino você vai mostrar sua autoridade e provar que é o chefe deste jogo!',
      },
    },
    {
      id:    'ninja',
      name:  { en: 'Ninja',       es: 'Ninja',        pt: 'Ninja' },
      file:  'Assets/Skins/Ninja.png',
      price: 110,
      desc:  {
        en: 'This outfit will show everyone you\'re no simple rival — you have the skills of an ancient samurai (ninja skills not included).',
        es: 'Este atuendo demostrará a todos que no eres un simple rival, tienes las habilidades de un antiguo samurái (las habilidades ninja no vienen incluidas).',
        pt: 'Este figurino vai mostrar a todos que você não é um rival qualquer — tem as habilidades de um samurai antigo (habilidades ninja não inclusas).',
      },
    },
    {
      id:    'among',
      name:  { en: 'Among Us',    es: 'Among Us',     pt: 'Among Us' },
      file:  'Assets/Skins/Among Us.png',
      price: 120,
      desc:  {
        en: 'This outfit is very suspicious... is it an impostor or a crewmate?...',
        es: 'Este atuendo es muy sospechoso... ¿será un impostor o un tripulante?...',
        pt: 'Este figurino é muito suspeito... será um impostor ou um tripulante?...',
      },
    },
    {
      id:    'knight',
      name:  { en: 'Knight',     es: 'Caballero',      pt: 'Cavaleiro' },
      file:  'Assets/Skins/Knight.png',
      price: 90,
      desc:  {
        en: 'With this outfit you\'ll be the Dark Knight... just kidding, but at least you\'ll be a normal knight!', 
        es: 'Con este atuendo serás el Caballero de la Noche... es broma, ¡Pero al menos serás un caballero normal!', 
        pt: 'Este figurino e um boné, sim, basicamente',
      },
    },
    {
      id:    'luigi',
      name:  { en: 'Luigi',       es: 'Luigi',        pt: 'Luigi' },
      file:  'Assets/Skins/Luigi.png',
      price: 120,
      desc:  {
        en: 'This is the second-player outfit, but... that\'s in another game — it doesn\'t matter here!',
        es: 'Este es el atuendo del segundón, pero... eso es en otro juego, eso aquí no importa!.',
        pt: 'Este é o figurino do player 2, mas... isso é em outro jogo, aqui não importa!',
      },
    },
    {
      id:    'abrigo',
      name:  { en: 'Coat',        es: 'Abrigo',       pt: 'Casaco' },
      file:  'Assets/Skins/Abrigo.png',
      price: 130,
      desc:  {
        en: 'This outfit is a COAT, not a beard — although many people confuse it...',
        es: 'Este atuendo es un ABRIGO, no es una barba, aunque muchos lo confundan...',
        pt: 'Este figurino é um CASACO, não é uma barba — embora muita gente confunda...',
      },
    },
    {
      id:    'mario',
      name:  { en: 'Mario',       es: 'Mario',        pt: 'Mario' },
      file:  'Assets/Skins/Mario.png',
      price: 150,
      desc:  {
        en: 'It\'s-a me, the most iconic hat in gaming history. Does it grant you extra lives? Absolutely not. Does it make you jump higher? Also no. Does it look amazing? ...Maybe.',
        es: 'Si te pones este sombrero, serás plomero, o... al menos eso dicen...',
        pt: 'É-a mim! O chapéu mais icônico da história dos jogos. Dá vidas extras? De jeito nenhum. Faz você pular mais alto? Também não. Fica incrível? ...Talvez.',
      },
    },
    {
      id:    'ignaciomc999',
      name:  { en: 'Ignacio',     es: 'Ignacio',      pt: 'Ignacio' },
      file:  'Assets/Skins/IgnacioMC999.png',
      price: 200,
      desc:  {
        en: 'This outfit was made in collaboration with the very famous YouTuber with millions of followers called IgnacioMC999',
        es: 'Este atuendo se hizo en colaboración con el famosísimo youtuber de millones de seguidores llamado IgnacioMC999',
        pt: 'Este figurino foi feito em colaboração com o famosíssimo YouTuber de milhões de seguidores chamado IgnacioMC999',
      },
    },
   {
      id:    'cappy',
      name:  { en: 'Cap',     es: 'Gorra',      pt: 'Boné' },
      file:  'Assets/Skins/Gorra.png',
      price: 40,
      desc:  {
        en: 'This outfit is a cap... regular, yeah, basically',
        es: 'Este atuendo es una gorra... normal, sí, básicamente',
        pt: 'Este figurino e um boné, sim, basicamente',
      },
    },
  ];

  /* ── i18n helpers ────────────────────────── */

  function _currentLang() {
    return (window.FLang ? window.FLang.getLang() : 'en');
  }

  /** Returns the localized display name for a skin. */
  function getSkinName(skin) {
    if (!skin) return '';
    if (typeof skin.name === 'object') {
      const lang = _currentLang();
      return skin.name[lang] || skin.name.en || '';
    }
    return skin.name; // backwards-compatibility fallback
  }

  /** Returns the localized description for a skin. */
  function getSkinDesc(skin) {
    if (!skin) return '';
    if (typeof skin.desc === 'object') {
      const lang = _currentLang();
      return skin.desc[lang] || skin.desc.en || '';
    }
    return skin.desc; // backwards-compatibility fallback
  }

  /* ── Coins ───────────────────────────────── */

  function loadCoins() {
    try { return Math.max(0, parseInt(localStorage.getItem(COINS_KEY) || '0', 10)); }
    catch { return 0; }
  }

  function saveCoins(n) {
    try { localStorage.setItem(COINS_KEY, String(Math.max(0, n))); } catch { /* silent */ }
  }

  /** Adds `amount` coins to the balance and returns the new total. */
  function addCoins(amount) {
    const total = loadCoins() + amount;
    saveCoins(total);
    return total;
  }

  /* ── Unlock tracking ─────────────────────── */

  function loadUnlocked() {
    try {
      const arr = JSON.parse(localStorage.getItem(UNLOCKED_KEY) || '[]');
      if (!arr.includes('none')) arr.push('none');
      return arr;
    } catch { return ['none']; }
  }

  function saveUnlocked(arr) {
    try { localStorage.setItem(UNLOCKED_KEY, JSON.stringify(arr)); } catch { /* silent */ }
  }

  function isUnlocked(id) {
    if (id === 'none') return true;
    return loadUnlocked().includes(id);
  }

  /**
   * Attempts to buy a skin. Returns true on success.
   * Fails if: already unlocked, doesn't exist, or insufficient coins.
   */
  function buySkin(id) {
    const skin = SKINS.find(s => s.id === id);
    if (!skin || skin.price === 0 || isUnlocked(id)) return false;
    const coins = loadCoins();
    if (coins < skin.price) return false;
    saveCoins(coins - skin.price);
    const unlocked = loadUnlocked();
    if (!unlocked.includes(id)) { unlocked.push(id); saveUnlocked(unlocked); }
    return true;
  }

  /* ── Selected skin ───────────────────────── */

  function loadSkin() {
    try {
      const id = localStorage.getItem(STORAGE_KEY);
      return (SKINS.find(s => s.id === id) && isUnlocked(id)) ? id : 'none';
    } catch { return 'none'; }
  }

  function saveSkin(id) {
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* silent */ }
  }

  function getSkinById(id) {
    return SKINS.find(s => s.id === id) || SKINS[0];
  }

  return {
    SKINS,
    getSkinName, getSkinDesc,
    loadCoins, saveCoins, addCoins,
    loadUnlocked, isUnlocked, buySkin,
    loadSkin, saveSkin, getSkinById,
  };
})();