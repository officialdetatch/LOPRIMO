/* Site behaviour for LO'PRIMO. The site is a single page
   (index.html), so this file only carries what that page uses:
   the footer's social logo links, the próximo-evento countdown,
   the add-to-calendar menu and the dev-cameo greeting. Every block still
   checks that its element exists first, so trimming a chunk of HTML
   can never take the rest of the page down with it. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- footer social icons (real logo badges, images/social/*.webp) ---------- */
  var SOCIAL_LABELS = { instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', spotify: 'Spotify' };
  var SOCIAL_IMG = {
    instagram: 'images/social/instagram.webp',
    facebook: 'images/social/facebook.webp',
    spotify: 'images/social/spotify.webp',
    youtube: 'images/social/youtube.webp'
  };
  var SOCIAL_IMG_ORDER = ['instagram', 'facebook', 'spotify', 'youtube'];
  function socialImgLinksHTML(socials) {
    socials = socials || {};
    return SOCIAL_IMG_ORDER.map(function (key) {
      var url = socials[key];
      if (!url || !SOCIAL_IMG[key]) return '';
      return '<a class="social-link social-link-img" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + SOCIAL_LABELS[key] + '"><img src="' + SOCIAL_IMG[key] + '" alt="" loading="lazy"></a>';
    }).join('');
  }
  var footerSocial = document.getElementById('footerSocial');
  if (footerSocial) {
    footerSocial.innerHTML = socialImgLinksHTML(window.BAND_ABOUT && window.BAND_ABOUT.socials);
  }

  /* ---------- PRÓXIMO EVENTO: one place to change the show ----------
     EVENT_START is the show time with the Dominican Republic offset
     (-04:00), so the countdown is right for anyone, wherever they are.
     EVENT_HOURS only sets how long the calendar entry lasts. */
  var EVENT_START = new Date('2026-10-12T20:30:00-04:00');
  var EVENT_HOURS = 3;
  var EVENT_TITLE = 'LO\u2019PRIMO en Lunes De Jazz';
  var EVENT_DETAILS = 'Cover: RD$350. instagram.com/lunesdejazz';
  var EVENT_LOCATION = 'UnoSieteOcho, Av. Juan Pablo Duarte 178, Santiago de los Caballeros';
  var EVENT_END = new Date(EVENT_START.getTime() + EVENT_HOURS * 3600000);

  function utcStamp(d) {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /* ---------- countdown to the show ---------- */
  var cdBox = document.getElementById('eventCountdown');
  if (cdBox) {
    var cdDone = document.getElementById('cdDone');
    var cdD = document.getElementById('cdDays'), cdH = document.getElementById('cdHours'),
        cdM = document.getElementById('cdMins'), cdS = document.getElementById('cdSecs');
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    var tick = function () {
      var diff = EVENT_START.getTime() - Date.now();
      if (isNaN(diff) || diff <= 0) {
        cdBox.hidden = true;
        if (cdDone) cdDone.hidden = false;
        return false;
      }
      var secs = Math.floor(diff / 1000);
      cdD.textContent = pad(Math.floor(secs / 86400));
      cdH.textContent = pad(Math.floor(secs % 86400 / 3600));
      cdM.textContent = pad(Math.floor(secs % 3600 / 60));
      cdS.textContent = pad(secs % 60);
      return true;
    };
    if (tick()) {
      var cdTimer = setInterval(function () { if (!tick()) clearInterval(cdTimer); }, 1000);
    }
  }

  /* ---------- "agregar al calendario": Google Calendar link + .ics ---------- */
  var stdBtn = document.getElementById('saveDateBtn');
  var stdMenu = document.getElementById('saveDateMenu');
  if (stdBtn && stdMenu) {
    function gcalLink() {
      var q = {
        action: 'TEMPLATE',
        text: EVENT_TITLE,
        dates: utcStamp(EVENT_START) + '/' + utcStamp(EVENT_END),
        details: EVENT_DETAILS,
        location: EVENT_LOCATION
      };
      var parts = [];
      for (var k in q) { if (Object.prototype.hasOwnProperty.call(q, k)) parts.push(k + '=' + encodeURIComponent(q[k])); }
      return 'https://calendar.google.com/calendar/render?' + parts.join('&');
    }
    function icsText(s) {
      return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
    }
    function icsContent() {
      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//LOPRIMO//ProximoEvento//ES',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:loprimo-' + utcStamp(EVENT_START) + '@loprimofficial.vip',
        'DTSTAMP:' + utcStamp(new Date()),
        'DTSTART:' + utcStamp(EVENT_START),
        'DTEND:' + utcStamp(EVENT_END),
        'SUMMARY:' + icsText(EVENT_TITLE),
        'LOCATION:' + icsText(EVENT_LOCATION),
        'DESCRIPTION:' + icsText(EVENT_DETAILS),
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');
    }
    function downloadIcs() {
      var blob = new Blob([icsContent()], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'loprimo-lunes-de-jazz.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    var gcalA = document.getElementById('saveDateGcal');
    if (gcalA) gcalA.href = gcalLink();
    var icsA = document.getElementById('saveDateIcs');
    if (icsA) {
      icsA.addEventListener('click', function (ev) {
        ev.preventDefault();
        downloadIcs();
        closeStd();
      });
    }

    function closeStd() {
      stdMenu.hidden = true;
      stdBtn.setAttribute('aria-expanded', 'false');
    }
    stdBtn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var wasHidden = stdMenu.hidden;
      stdMenu.hidden = !wasHidden;
      stdBtn.setAttribute('aria-expanded', wasHidden ? 'true' : 'false');
    });
    document.addEventListener('click', function (ev) {
      if (!stdMenu.hidden && !stdMenu.contains(ev.target) && ev.target !== stdBtn) closeStd();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeStd();
    });
  }

  /* ---------- dev cameo: greeting bubble shows itself shortly after
     load, then fades out on its own — the little circle stays put. ---------- */
  var devBubble = document.getElementById('devCameoBubble');
  if (devBubble) {
    var devShowTimer = setTimeout(function () { devBubble.classList.add('show'); }, 700);
    var devHideTimer = setTimeout(function () { devBubble.classList.remove('show'); }, 6500);
    var devCameo = document.querySelector('.dev-cameo');
    if (devCameo) {
      devCameo.addEventListener('mouseenter', function () {
        clearTimeout(devShowTimer);
        clearTimeout(devHideTimer);
        devBubble.classList.add('show');
      });
      devCameo.addEventListener('mouseleave', function () {
        devHideTimer = setTimeout(function () { devBubble.classList.remove('show'); }, 1200);
      });
    }
  }
})();
