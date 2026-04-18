'use strict';

/* ══════════════════════════════════
   FOLLOWERS — LANG (i18n)
   Expuesto como window.FLang
   Sin dependencias externas
══════════════════════════════════ */
window.FLang = (function () {

  const STORAGE_KEY = 'followers_lang';

  /* ── String catalogue ────────────────────── */
  const STRINGS = {

    en: {
      /* ── Menu ─────────────────────────────── */
      logo_sub:            'The followers game',
      menu_play:           '&#9654;&nbsp; Play',
      menu_settings:       '&#9881;&nbsp; Settings',
      menu_skins:          '&#10022;&nbsp; Outfits',
      menu_exit:           '&#10005;&nbsp; Exit',
      menu_hint:           'WASD / Arrows to move &nbsp;&middot;&nbsp; SHIFT = Shuriken &nbsp;&middot;&nbsp; Mouse = Aim &nbsp;&middot;&nbsp; ESC = Menu',
      menu_lang_btn:       '&#127758; Espa&ntilde;ol',

      /* ── Settings ─────────────────────────── */
      settings_title:      '&#9881; Settings',
      settings_nametag:    'Your Nametag',
      settings_color:      'Skin Color',
      settings_audio:      'Audio',
      settings_music:      '&#127925; Music',
      settings_sfx:        '&#128266; Sound Effects',
      settings_lang:       '&#127758; Language',
      settings_back:       '&#8592; Back',
      settings_save:       'Done &#10003;',
      name_placeholder:    'Your name...',

      /* ── Color labels ─────────────────────── */
      color_red:           'Red',
      color_blue:          'Blue',
      color_green:         'Green',
      color_yellow:        'Yellow',
      color_purple:        'Purple',
      color_pink:          'Pink',

      /* ── Skins screen ─────────────────────── */
      skins_title:         '&#10022; Outfits',
      skins_back:          '&#8592; Back',
      skins_preview:       'Preview',
      skins_choose:        'Choose your outfit',
      skins_buy:           'Buy',
      skins_price:         'Price: {n} coins',

      /* ── HUD ──────────────────────────────── */
      hud_round:           'Round {r} of {max}',
      hud_spectator:       '&#128123; Spectator Mode &nbsp;&middot;&nbsp; WASD = move camera &nbsp;&middot;&nbsp; ESC = exit to menu',

      /* ── Round end ────────────────────────── */
      rend_title:          'Round {r} End!',
      rend_elim_winner:    '{name} was eliminated. There\'s a winner!',
      rend_elim_followers: '{name} had fewer followers and was eliminated.',
      rend_see_winner:     'See winner &#127942;',
      rend_continue:       'Continue &#8594;',
      rend_elim_tag:       'ELIMINATED',

      /* ── Game over ────────────────────────── */
      gover_winner_lbl:    '&#127942; WINNER!',
      gover_followers:     'with {n} followers at the end',
      gover_hint:          'Press the screen or Space to continue.',
      gover_coins_title:   '&#127881; Coins earned!',
      gover_coins_total:   'Total accumulated: {n} &#129689;',
      gover_play_again:    '&#9654; Play again',
      gover_main_menu:     '&#8592; Main menu',

      /* ── Exit ─────────────────────────────── */
      exit_msg:            'Goodbye! &#128075;',
      exit_sub:            'Thanks for playing Followers',
      exit_back:           '&#8592; Back to menu',

      /* ── Pause ────────────────────────────── */
      pause_title:         'Are you sure you want to exit?',
      pause_yes:           'Yes',
      pause_no:            'No',

      /* ── Loading ──────────────────────────── */
      loading_start:       'Press the screen or any key to start',
    },

    es: {
      /* ── Menu ─────────────────────────────── */
      logo_sub:            'El juego de los seguidores',
      menu_play:           '&#9654;&nbsp; Jugar',
      menu_settings:       '&#9881;&nbsp; Configuraci&oacute;n',
      menu_skins:          '&#10022;&nbsp; Atuendos',
      menu_exit:           '&#10005;&nbsp; Salir',
      menu_hint:           'WASD / Flechas para moverte &nbsp;&middot;&nbsp; SHIFT = Shuriken &nbsp;&middot;&nbsp; Mouse = Apuntar &nbsp;&middot;&nbsp; ESC = Men&uacute;',
      menu_lang_btn:       '&#127758; English',

      /* ── Settings ─────────────────────────── */
      settings_title:      '&#9881; Configuraci&oacute;n',
      settings_nametag:    'Tu Nametag',
      settings_color:      'Color de Skin',
      settings_audio:      'Audio',
      settings_music:      '&#127925; M&uacute;sica',
      settings_sfx:        '&#128266; Efectos de Sonido',
      settings_lang:       '&#127758; Idioma',
      settings_back:       '&#8592; Volver',
      settings_save:       'Listo &#10003;',
      name_placeholder:    'Tu nombre...',

      /* ── Color labels ─────────────────────── */
      color_red:           'Rojo',
      color_blue:          'Azul',
      color_green:         'Verde',
      color_yellow:        'Amarillo',
      color_purple:        'Morado',
      color_pink:          'Rosa',

      /* ── Skins screen ─────────────────────── */
      skins_title:         '&#10022; Atuendos',
      skins_back:          '&#8592; Volver',
      skins_preview:       'Vista previa',
      skins_choose:        'Elige tu atuendo',
      skins_buy:           'Comprar',
      skins_price:         'Precio: {n} monedas',

      /* ── HUD ──────────────────────────────── */
      hud_round:           'Ronda {r} de {max}',
      hud_spectator:       '&#128123; Modo Espectador &nbsp;&middot;&nbsp; WASD = mover c&aacute;mara &nbsp;&middot;&nbsp; ESC = salir al men&uacute;',

      /* ── Round end ────────────────────────── */
      rend_title:          '&#161;Fin de Ronda {r}!',
      rend_elim_winner:    '{name} fue eliminado. &#161;Hay un ganador!',
      rend_elim_followers: '{name} tuvo menos seguidores y fue eliminado.',
      rend_see_winner:     'Ver ganador &#127942;',
      rend_continue:       'Continuar &#8594;',
      rend_elim_tag:       'ELIMINADO',

      /* ── Game over ────────────────────────── */
      gover_winner_lbl:    '&#161;GANADOR!',
      gover_followers:     'con {n} seguidores al final',
      gover_hint:          'Presiona la pantalla o Espacio para continuar.',
      gover_coins_title:   '&#127881; &#161;Monedas ganadas!',
      gover_coins_total:   'Total acumulado: {n} &#129689;',
      gover_play_again:    '&#9654; Jugar de nuevo',
      gover_main_menu:     '&#8592; Men&uacute; principal',

      /* ── Exit ─────────────────────────────── */
      exit_msg:            '&#161;Hasta luego! &#128075;',
      exit_sub:            'Gracias por jugar Followers',
      exit_back:           '&#8592; Volver al men&uacute;',

      /* ── Pause ────────────────────────────── */
      pause_title:         '&#191;Seguro que quieres salir?',
      pause_yes:           'S&iacute;',
      pause_no:            'No',

      /* ── Loading ──────────────────────────── */
      loading_start:       'Presiona la pantalla o cualquier tecla para comenzar',
    },

    pt: {
      /* ── Menu ─────────────────────────────── */
      logo_sub:            'O jogo dos seguidores',
      menu_play:           '&#9654;&nbsp; Jogar',
      menu_settings:       '&#9881;&nbsp; Configura&ccedil;&otilde;es',
      menu_skins:          '&#10022;&nbsp; Figurinos',
      menu_exit:           '&#10005;&nbsp; Sair',
      menu_hint:           'WASD / Setas para mover &nbsp;&middot;&nbsp; SHIFT = Shuriken &nbsp;&middot;&nbsp; Mouse = Mirar &nbsp;&middot;&nbsp; ESC = Menu',
      menu_lang_btn:       '&#127758; English',

      /* ── Settings ─────────────────────────── */
      settings_title:      '&#9881; Configura&ccedil;&otilde;es',
      settings_nametag:    'Seu Apelido',
      settings_color:      'Cor da Skin',
      settings_audio:      '&Aacute;udio',
      settings_music:      '&#127925; M&uacute;sica',
      settings_sfx:        '&#128266; Efeitos Sonoros',
      settings_lang:       '&#127758; Idioma',
      settings_back:       '&#8592; Voltar',
      settings_save:       'Pronto &#10003;',
      name_placeholder:    'Seu nome...',

      /* ── Color labels ─────────────────────── */
      color_red:           'Vermelho',
      color_blue:          'Azul',
      color_green:         'Verde',
      color_yellow:        'Amarelo',
      color_purple:        'Roxo',
      color_pink:          'Rosa',

      /* ── Skins screen ─────────────────────── */
      skins_title:         '&#10022; Figurinos',
      skins_back:          '&#8592; Voltar',
      skins_preview:       'Pr&eacute;via',
      skins_choose:        'Escolha seu figurino',
      skins_buy:           'Comprar',
      skins_price:         'Pre&ccedil;o: {n} moedas',

      /* ── HUD ──────────────────────────────── */
      hud_round:           'Rodada {r} de {max}',
      hud_spectator:       '&#128123; Modo Espectador &nbsp;&middot;&nbsp; WASD = mover c&acirc;mera &nbsp;&middot;&nbsp; ESC = sair para o menu',

      /* ── Round end ────────────────────────── */
      rend_title:          'Fim da Rodada {r}!',
      rend_elim_winner:    '{name} foi eliminado. H&aacute; um vencedor!',
      rend_elim_followers: '{name} tinha menos seguidores e foi eliminado.',
      rend_see_winner:     'Ver vencedor &#127942;',
      rend_continue:       'Continuar &#8594;',
      rend_elim_tag:       'ELIMINADO',

      /* ── Game over ────────────────────────── */
      gover_winner_lbl:    '&#127942; VENCEDOR!',
      gover_followers:     'com {n} seguidores ao final',
      gover_hint:          'Pressione a tela ou Espa&ccedil;o para continuar.',
      gover_coins_title:   '&#127881; Moedas ganhas!',
      gover_coins_total:   'Total acumulado: {n} &#129689;',
      gover_play_again:    '&#9654; Jogar novamente',
      gover_main_menu:     '&#8592; Menu principal',

      /* ── Exit ─────────────────────────────── */
      exit_msg:            'Tchau! &#128075;',
      exit_sub:            'Obrigado por jogar Followers',
      exit_back:           '&#8592; Voltar ao menu',

      /* ── Pause ────────────────────────────── */
      pause_title:         'Tem certeza que quer sair?',
      pause_yes:           'Sim',
      pause_no:            'N&atilde;o',

      /* ── Loading ──────────────────────────── */
      loading_start:       'Pressione a tela ou qualquer tecla para come&ccedil;ar',
    },
  };

  /* ── State ───────────────────────────────── */
  let currentLang = 'en';

  /* ── Persistence ─────────────────────────── */
  function loadLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (STRINGS[saved]) currentLang = saved;
    } catch { /* silent */ }
  }

  function saveLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* silent */ }
  }

  /* ── Core ────────────────────────────────── */

  /**
   * Returns the translated string for `key`.
   * Variables in {braces} are replaced from the `vars` object.
   * If a variable is not provided, the placeholder is left intact —
   * this lets callers manually inject HTML after the fact.
   */
  function t(key, vars = {}) {
    const dict = STRINGS[currentLang] || STRINGS.en;
    const str  = dict[key] !== undefined ? dict[key] : (STRINGS.en[key] || key);
    return str.replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] !== undefined ? String(vars[k]) : `{${k}}`
    );
  }

  function getLang()  { return currentLang; }

  function setLang(lang) {
    if (!STRINGS[lang]) return;
    currentLang = lang;
    saveLang(lang);
    applyToDOM();
  }

  function toggleLang() {
    const langs = Object.keys(STRINGS);
    const next  = langs[(langs.indexOf(currentLang) + 1) % langs.length];
    setLang(next);
  }

  /* ── DOM application ─────────────────────── */
  function applyToDOM() {
    /* Static text nodes */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.innerHTML = t(el.dataset.i18n);
    });
    /* Input placeholders */
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    /* Language button active states */
    ['en', 'es', 'pt'].forEach(lang => {
      const btn = document.getElementById(`lang-${lang}`);
      if (btn) btn.classList.toggle('active', currentLang === lang);
    });
  }

  /* ── Init ────────────────────────────────── */
  loadLang();
  /* Deferred scripts run after HTML is parsed (readyState = 'interactive'),
     so we can call applyToDOM immediately. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyToDOM);
  } else {
    applyToDOM();
  }

  return { t, getLang, setLang, toggleLang, applyToDOM };
})();