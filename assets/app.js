/* Site behaviour for LO'PRIMO. Every block checks that its element
   exists first, so deleting a chunk of HTML can never take the rest
   of the page down with it. */
(function () {
  'use strict';

  /* Replace this with the band's real inbox once you have one -
     it's only used for the "couldn't send" fallback messages. */
  var CONTACT_EMAIL = window.SITE_CONTACT_EMAIL || 'hello@loprimomusic.com';

  var MONTHS_ES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  var MONTHS_ES_FULL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function parseDate(d) {
    if (!d) return null;
    var parts = String(d).split('-');
    if (parts.length !== 3) return null;
    var dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(dt.getTime()) ? null : dt;
  }
  function fmtDateBadge(d) {
    var dt = parseDate(d);
    if (!dt) return { day: '--', mon: '' };
    return { day: dt.getDate(), mon: MONTHS_ES[dt.getMonth()] };
  }
  function fmtDateLong(d) {
    var dt = parseDate(d);
    if (!dt) return '';
    return dt.getDate() + ' de ' + MONTHS_ES_FULL[dt.getMonth()] + ', ' + dt.getFullYear();
  }

  function shows() {
    var list = window.SHOWS || [];
    return list.map(function (s, i) {
      var copy = {};
      for (var k in s) { if (Object.prototype.hasOwnProperty.call(s, k)) copy[k] = s[k]; }
      copy.id = copy.id || slug(copy.city + '-' + copy.date) || ('show-' + (i + 1));
      copy.status = copy.status === 'past' ? 'past' : 'upcoming';
      return copy;
    });
  }
  function singles() {
    var list = window.SINGLES || [];
    return list.map(function (s, i) {
      var copy = {};
      for (var k in s) { if (Object.prototype.hasOwnProperty.call(s, k)) copy[k] = s[k]; }
      copy.id = copy.id || slug(copy.title) || ('single-' + (i + 1));
      return copy;
    });
  }
  function posts() {
    return (window.LATEST_POSTS || []).slice();
  }

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- footer + about social icons ---------- */
  var SOCIAL_ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.2 15 12l-4.5 2.8z" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" font-family="Georgia, serif">f</text></svg>',
    spotify: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" font-family="Arial, sans-serif">S</text></svg>'
  };
  var SOCIAL_LABELS = { instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', spotify: 'Spotify' };
  function socialLinksHTML(socials) {
    socials = socials || {};
    return Object.keys(SOCIAL_ICONS).map(function (key) {
      var url = socials[key];
      if (!url) return '';
      return '<a class="social-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + SOCIAL_LABELS[key] + '">' + SOCIAL_ICONS[key] + '</a>';
    }).join('');
  }
  var footerSocial = document.getElementById('footerSocial');
  if (footerSocial) {
    footerSocial.innerHTML = socialLinksHTML(window.BAND_ABOUT && window.BAND_ABOUT.socials);
  }

  /* ---------- about page ---------- */
  var aboutBody = document.getElementById('aboutBody');
  if (aboutBody) {
    var about = window.BAND_ABOUT || {};
    var aboutTitleEl = document.getElementById('aboutTitle');
    var aboutLedeEl = document.getElementById('aboutLede');
    if (aboutTitleEl && about.title) aboutTitleEl.textContent = about.title;
    if (aboutLedeEl) aboutLedeEl.textContent = about.lede || '';
    var aboutBlocks = about.blocks || [];
    aboutBody.innerHTML = aboutBlocks.length ? aboutBlocks.map(function (b) {
      if (b.type === 'image' && b.src) {
        return '<figure class="article-figure"><img src="' + esc(b.src) + '" alt="' + esc(b.caption || '') + '" onerror="this.closest(\'figure\').remove()">' +
          (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
      }
      return '<p>' + esc(b.text || '') + '</p>';
    }).join('') : '<p class="section-note">Nada por aqu\u00ed todav\u00eda \u2014 agrega algo en about-writer.html.</p>';
    var aboutSocials = document.getElementById('aboutSocials');
    if (aboutSocials) aboutSocials.innerHTML = socialLinksHTML(about.socials);
  }

  /* ---------- band members (about page) ---------- */
  var membersGrid = document.getElementById('aboutMembers');
  if (membersGrid) {
    var members = (window.BAND_ABOUT && window.BAND_ABOUT.members) || [];
    membersGrid.innerHTML = members.length ? members.map(function (m) {
      var photo = m.photo
        ? '<div class="member-photo"><img src="' + esc(m.photo) + '" alt="' + esc(m.name || '') + '" onerror="this.remove()"></div>'
        : '<div class="member-photo"><span class="crest-fallback" style="position:static;width:100%;height:100%;display:flex">' + esc((m.name || '?').charAt(0)) + '</span></div>';
      return '<div class="card member-card">' + photo +
        '<h3>' + esc(m.name || '') + '</h3>' +
        (m.role ? '<div class="eyebrow">' + esc(m.role) + '</div>' : '') +
        (m.bio ? '<p>' + esc(m.bio) + '</p>' : '') +
        (m.instagram ? '<div class="social-row member-social">' + socialLinksHTML({ instagram: m.instagram }) + '</div>' : '') +
      '</div>';
    }).join('') : '<p class="section-note">Todav\u00eda no hay integrantes cargados \u2014 agr\u00e9galos en about-writer.html.</p>';
  }

  /* ---------- show cards ---------- */
  function showCardHTML(s) {
    var badge = fmtDateBadge(s.date);
    var ticket = s.ticket_url
      ? '<a class="btn btn-solid btn-small" href="' + esc(s.ticket_url) + '" target="_blank" rel="noopener noreferrer">Boletos</a>'
      : '';
    return '<div class="show-card">' +
      '<div class="show-date"><span class="d">' + esc(badge.day) + '</span><span class="m">' + esc(badge.mon) + '</span></div>' +
      '<div class="show-main">' +
        '<h3>' + esc(s.city) + '</h3>' +
        (s.venue ? '<div class="venue">' + esc(s.venue) + '</div>' : '') +
        (s.note ? '<div class="section-note">' + esc(s.note) + '</div>' : '') +
      '</div>' +
      '<span class="show-tag' + (s.status === 'past' ? ' past' : '') + '">' + (s.status === 'past' ? 'Ya pas\u00f3' : 'Pr\u00f3ximo') + '</span>' +
      ticket +
    '</div>';
  }

  /* ---------- shows page: split lists + filter tabs (Todos/Pr\u00f3ximos/Anteriores) ---------- */
  var showsUpcomingEl = document.getElementById('showsUpcoming');
  var showsPastEl = document.getElementById('showsPast');
  if (showsUpcomingEl || showsPastEl) {
    var all = shows();
    var up = all.filter(function (s) { return s.status !== 'past'; }).sort(function (a, b) { return parseDate(a.date) - parseDate(b.date); });
    var past = all.filter(function (s) { return s.status === 'past'; }).sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); });

    if (showsUpcomingEl) {
      showsUpcomingEl.innerHTML = up.length ? up.map(showCardHTML).join('') : '<p class="section-note">Todav\u00eda no hay fechas anunciadas \u2014 estamos de vuelta y preparando todo. S\u00edguenos en redes para ser los primeros en enterarte.</p>';
    }
    var pastBlock = document.getElementById('showsPastBlock');
    if (showsPastEl) showsPastEl.innerHTML = past.map(showCardHTML).join('');
    if (pastBlock && !past.length) pastBlock.classList.add('hidden');

    var upcomingBlock = document.getElementById('showsUpcomingBlock');
    var tabs = document.querySelectorAll('#showsFilterTabs .filter-tab');
    for (var ti = 0; ti < tabs.length; ti++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          for (var tj = 0; tj < tabs.length; tj++) tabs[tj].classList.toggle('active', tabs[tj] === btn);
          var f = btn.getAttribute('data-filter');
          if (upcomingBlock) upcomingBlock.classList.toggle('hidden', f === 'past');
          if (pastBlock) {
            if (f === 'past') pastBlock.classList.remove('hidden');
            else if (f === 'upcoming') pastBlock.classList.add('hidden');
            else pastBlock.classList.toggle('hidden', !past.length);
          }
        });
      })(tabs[ti]);
    }
  }

  /* ---------- home: next-show banner with a live countdown ---------- */
  function nextShowBannerHTML(s) {
    var ticket = s.ticket_url
      ? '<a class="btn btn-solid btn-small nsb-cta" href="' + esc(s.ticket_url) + '" target="_blank" rel="noopener noreferrer">Boletos</a>'
      : '';
    return '<div class="next-show-banner">' +
      '<div class="nsb-info">' +
        '<div class="nsb-label">Pr\u00f3ximo show</div>' +
        '<h3>' + esc(s.city) + '</h3>' +
        '<div class="venue">' + (s.venue ? esc(s.venue) + ' \u00b7 ' : '') + fmtDateLong(s.date) + '</div>' +
      '</div>' +
      '<div class="nsb-countdown">' +
        '<div class="nsb-unit"><span class="nsb-num" id="cdD">00</span><span class="nsb-label-sm">D\u00edas</span></div>' +
        '<div class="nsb-unit"><span class="nsb-num" id="cdH">00</span><span class="nsb-label-sm">Hrs</span></div>' +
        '<div class="nsb-unit"><span class="nsb-num" id="cdM">00</span><span class="nsb-label-sm">Min</span></div>' +
        '<div class="nsb-unit"><span class="nsb-num" id="cdS">00</span><span class="nsb-label-sm">Seg</span></div>' +
      '</div>' +
      ticket +
    '</div>';
  }
  function startCountdown(dateStr) {
    var target = parseDate(dateStr);
    if (!target) return;
    var targetTime = target.getTime();
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    function tick() {
      var diff = Math.max(0, targetTime - Date.now());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var sec = Math.floor((diff % 60000) / 1000);
      var elD = document.getElementById('cdD'), elH = document.getElementById('cdH'),
          elM = document.getElementById('cdM'), elS = document.getElementById('cdS');
      if (elD) elD.textContent = pad(d);
      if (elH) elH.textContent = pad(h);
      if (elM) elM.textContent = pad(m);
      if (elS) elS.textContent = pad(sec);
    }
    tick();
    setInterval(tick, 1000);
  }
  var homeShow = document.getElementById('homeNextShow');
  if (homeShow) {
    var homeUp = shows().filter(function (s) { return s.status !== 'past' && parseDate(s.date); })
      .sort(function (a, b) { return parseDate(a.date) - parseDate(b.date); });
    if (homeUp.length) {
      homeShow.innerHTML = nextShowBannerHTML(homeUp[0]);
      startCountdown(homeUp[0].date);
    } else {
      homeShow.innerHTML = '<p class="section-note">Todav\u00eda no hay fechas anunciadas. <a href="shows.html">Revisa la p\u00e1gina de shows</a> para lo que viene.</p>';
    }
  }

  /* ---------- singles / video embeds ---------- */
  function youtubeIdFromUrl(url) {
    if (!url) return '';
    var m = String(url).match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : '';
  }
  function streamingRowHTML(s) {
    var out = '';
    if (s.spotify_url) {
      out += '<a class="streaming-btn" href="' + esc(s.spotify_url) + '" target="_blank" rel="noopener noreferrer">' + SOCIAL_ICONS.spotify + ' Spotify</a>';
    }
    if (s.apple_music_url) {
      out += '<a class="streaming-btn" href="' + esc(s.apple_music_url) + '" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.3"/><circle cx="17" cy="16" r="2.3"/></svg> Apple Music</a>';
    }
    if (s.youtube_url) {
      out += '<a class="streaming-btn" href="' + esc(s.youtube_url) + '" target="_blank" rel="noopener noreferrer">' + SOCIAL_ICONS.youtube + ' YouTube</a>';
    }
    return out;
  }
  function singleCardHTML(s) {
    var vid = s.youtube_id || youtubeIdFromUrl(s.youtube_url);
    var media = vid
      ? '<div class="video-embed"><iframe src="https://www.youtube.com/embed/' + esc(vid) + '" title="' + esc(s.title) + '" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>'
      : s.cover_image
        ? '<div class="single-cover"><img src="' + esc(s.cover_image) + '" alt="' + esc(s.title) + '" onerror="this.remove()"></div>'
        : '<div class="single-cover"><span class="crest-fallback" style="position:static;width:100%;height:100%;display:flex">' + esc((s.title || '?').charAt(0)) + '</span></div>';
    return '<div class="card single-card">' + media +
      '<h3>' + esc(s.title) + '</h3>' +
      (s.release_date ? '<div class="eyebrow">' + esc(s.release_date) + '</div>' : '') +
      (s.blurb ? '<p>' + esc(s.blurb) + '</p>' : '') +
      '<div class="streaming-row">' + streamingRowHTML(s) + '</div>' +
    '</div>';
  }

  var singlesGrid = document.getElementById('singlesGrid');
  if (singlesGrid) {
    var allSingles2 = singles();
    singlesGrid.innerHTML = allSingles2.length
      ? allSingles2.map(singleCardHTML).join('')
      : '<p class="section-note">Todav\u00eda no hay sencillos publicados \u2014 agrega uno en assets/music-data.js o con music-writer.html.</p>';
  }

  /* ---------- home page singles: last 3, as cards (same format as music.html) ---------- */
  var homeSinglesGrid = document.getElementById('homeSinglesGrid');
  if (homeSinglesGrid) {
    var latestThree = singles().slice(0, 3);
    homeSinglesGrid.innerHTML = latestThree.length
      ? latestThree.map(singleCardHTML).join('')
      : '<p class="section-note">Todav\u00eda no hay sencillos publicados. <a href="music.html">Revisa la p\u00e1gina de m\u00fasica</a>.</p>';
  }

  /* ---------- latest instagram posts (official embeds) ---------- */
  var igGrid = document.getElementById('igGrid');
  if (igGrid) {
    var allPosts = posts();
    if (!allPosts.length) {
      var igUrl = (window.BAND_ABOUT && window.BAND_ABOUT.socials && window.BAND_ABOUT.socials.instagram) || '';
      igGrid.innerHTML = '<div class="ig-fallback"><div class="eyebrow">Instagram</div>' +
        '<p class="section-note">Todav\u00eda no hay posts cargados aqu\u00ed. Agrega enlaces en posts-writer.html.</p>' +
        (igUrl ? '<a class="btn btn-small" href="' + esc(igUrl) + '" target="_blank" rel="noopener noreferrer">Ver Instagram</a>' : '') +
        '</div>';
    } else {
      igGrid.innerHTML = allPosts.map(function (p) {
        return '<blockquote class="instagram-media" data-instgrm-permalink="' + esc(p.url) + '" data-instgrm-version="14">' +
          '<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.caption || 'Ver en Instagram') + '</a>' +
        '</blockquote>';
      }).join('');
      var processEmbeds = function () { if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process(); };
      if (window.instgrm && window.instgrm.Embeds) {
        processEmbeds();
      } else {
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.instagram.com/embed.js';
        s.onload = processEmbeds;
        document.body.appendChild(s);
      }
    }
  }

  /* ---------- custom select dropdowns (contact page) ---------- */
  var customSelects = document.querySelectorAll('.custom-select');
  for (var csi = 0; csi < customSelects.length; csi++) {
    (function (wrap) {
      var btn = wrap.querySelector('.custom-select-btn');
      var valueEl = wrap.querySelector('.custom-select-value');
      var list = wrap.querySelector('.custom-select-list');
      var hiddenField = wrap.querySelector('input[type="hidden"]');
      var options = Array.prototype.slice.call(list.querySelectorAll('li'));
      var activeIndex = 0;
      for (var oi = 0; oi < options.length; oi++) {
        if (options[oi].getAttribute('aria-selected') === 'true') { activeIndex = oi; break; }
      }
      function highlight(i) {
        for (var j = 0; j < options.length; j++) { options[j].classList.toggle('active', j === i); }
      }
      function close() {
        wrap.classList.remove('open');
        list.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
      function open() {
        wrap.classList.add('open');
        list.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        highlight(activeIndex);
        list.focus();
      }
      function choose(i) {
        activeIndex = i;
        for (var j = 0; j < options.length; j++) { options[j].setAttribute('aria-selected', j === i ? 'true' : 'false'); }
        valueEl.textContent = options[i].textContent;
        if (hiddenField) hiddenField.value = options[i].getAttribute('data-value') || options[i].textContent;
        close();
        btn.focus();
      }
      btn.addEventListener('click', function () {
        if (wrap.classList.contains('open')) { close(); } else { open(); }
      });
      btn.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowDown' || ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(); }
      });
      list.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowDown') { ev.preventDefault(); activeIndex = Math.min(activeIndex + 1, options.length - 1); highlight(activeIndex); }
        else if (ev.key === 'ArrowUp') { ev.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); highlight(activeIndex); }
        else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choose(activeIndex); }
        else if (ev.key === 'Escape') { close(); btn.focus(); }
        else if (ev.key === 'Tab') { close(); }
      });
      for (var oi2 = 0; oi2 < options.length; oi2++) {
        (function (idx) {
          options[idx].addEventListener('click', function () { choose(idx); });
          options[idx].addEventListener('mouseenter', function () { activeIndex = idx; highlight(idx); });
        })(oi2);
      }
      document.addEventListener('click', function (ev) {
        if (!wrap.contains(ev.target)) close();
      });
    })(customSelects[csi]);
  }

  /* ---------- contact form ---------- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var cfStatus = document.getElementById('cfStatus');
    var cfSubmit = document.getElementById('cfSubmit');
    contactForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (/YOUR_FORM_ID/.test(contactForm.action)) {
        cfStatus.textContent = 'Este formulario a\u00fan no est\u00e1 conectado \u2014 escr\u00edbenos directo a ' + CONTACT_EMAIL + ' por ahora.';
        return;
      }
      cfSubmit.disabled = true;
      cfStatus.textContent = 'Enviando...';
      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          cfStatus.textContent = 'Gracias \u2014 tu mensaje va en camino. Te responderemos pronto.';
          contactForm.reset();
        } else {
          cfStatus.textContent = 'Algo sali\u00f3 mal. Intenta de nuevo o escr\u00edbenos a ' + CONTACT_EMAIL + '.';
        }
      }).catch(function () {
        cfStatus.textContent = 'Algo sali\u00f3 mal. Intenta de nuevo o escr\u00edbenos a ' + CONTACT_EMAIL + '.';
      }).then(function () { cfSubmit.disabled = false; });
    });
  }
})();
