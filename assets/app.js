/* Site behaviour for LO'PRIMO. The site is now a single page
   (index.html) — a "save the date" splash — so this file only
   carries what that page actually uses: the footer's real social
   logo links and the save-the-date calendar menu. Every block still
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

  /* ---------- save-the-date: Google Calendar link + downloadable .ics ----------
     Monday, October 12 2026 — an all-day placeholder event (no time yet,
     "mas informacion esta semana"). Update STD_START/STD_END here if the
     date ever changes. */
  var stdBtn = document.getElementById('saveDateBtn');
  var stdMenu = document.getElementById('saveDateMenu');
  if (stdBtn && stdMenu) {
    var STD_TITLE = 'LO’PRIMO — Reencuentro (Save the Date)';
    var STD_DETAILS = 'Guarda la fecha: LO’PRIMO vuelve. Mas informacion muy pronto.';
    var STD_START = '20261012';
    var STD_END = '20261013'; /* Google's all-day "dates" end is exclusive */

    function gcalLink() {
      var q = {
        action: 'TEMPLATE',
        text: STD_TITLE,
        dates: STD_START + '/' + STD_END,
        details: STD_DETAILS
      };
      var parts = [];
      for (var k in q) { if (Object.prototype.hasOwnProperty.call(q, k)) parts.push(k + '=' + encodeURIComponent(q[k])); }
      return 'https://calendar.google.com/calendar/render?' + parts.join('&');
    }
    function icsStamp() {
      return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    function icsContent() {
      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//LOPRIMO//SaveTheDate//ES',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:loprimo-save-the-date-' + STD_START + '@loprimofficial.vip',
        'DTSTAMP:' + icsStamp(),
        'DTSTART;VALUE=DATE:' + STD_START,
        'DTEND;VALUE=DATE:' + STD_END,
        'SUMMARY:' + STD_TITLE,
        'DESCRIPTION:' + STD_DETAILS,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');
    }
    function downloadIcs() {
      var blob = new Blob([icsContent()], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'loprimo-save-the-date.ics';
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
