/* ============================================================
   MUSIC WRITER  --  private tool, not linked from the public site.
   Loads the current assets/music-data.js, lets you add, edit,
   reorder and delete singles, then hands you a finished
   music-data.js to save over the old one. Newest goes first -
   that's the one embedded on the home page. Nothing here touches
   the live site until you replace that file yourself.
   ============================================================ */
(function () {
  'use strict';

  var DRAFT_KEY = 'loprimo.music.draft.v1';
  var list = [];
  var editingIndex = -1;

  var f = {
    id: document.getElementById('wId'),
    title: document.getElementById('wTitle'),
    release_date: document.getElementById('wReleaseDate'),
    youtube_url: document.getElementById('wYoutubeUrl'),
    spotify_url: document.getElementById('wSpotifyUrl'),
    apple_music_url: document.getElementById('wAppleUrl'),
    cover_image: document.getElementById('wCover'),
    blurb: document.getElementById('wBlurb')
  };
  var rowList = document.getElementById('wList');
  var output = document.getElementById('wOutput');
  var formTitle = document.getElementById('wFormTitle');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function youtubeIdFromUrl(url) {
    if (!url) return '';
    var m = String(url).match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : '';
  }
  function toast(msg, bad) {
    var t = document.createElement('div');
    t.className = 'toast' + (bad ? ' err' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('hide'); }, 2400);
    setTimeout(function () { t.remove(); }, 2800);
  }

  function loadDraft() {
    try { var raw = localStorage.getItem(DRAFT_KEY); if (raw) return JSON.parse(raw); } catch (err) { /* ignore */ }
    return null;
  }
  function saveDraft() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(list)); } catch (err) { /* ignore */ } }

  function normalise(n, i) {
    return {
      id: n.id || slug(n.title) || ('single-' + (i + 1)),
      title: n.title || '',
      release_date: n.release_date || '',
      youtube_id: n.youtube_id || youtubeIdFromUrl(n.youtube_url) || '',
      youtube_url: n.youtube_url || '',
      spotify_url: n.spotify_url || '',
      apple_music_url: n.apple_music_url || '',
      cover_image: n.cover_image || '',
      blurb: n.blurb || ''
    };
  }

  function start() {
    var draft = loadDraft();
    var live = (window.SINGLES || []).map(normalise);
    if (draft && draft.length && JSON.stringify(draft) !== JSON.stringify(live)) {
      list = draft.map(normalise);
      document.getElementById('wDraftNote').classList.remove('hidden');
    } else { list = live; }
    render();
  }

  function clearForm() {
    Object.keys(f).forEach(function (k) { f[k].value = ''; });
    editingIndex = -1;
    formTitle.textContent = 'New single';
    document.getElementById('wSave').textContent = 'Add single';
  }
  function fillForm(i) {
    var n = list[i];
    f.id.value = n.id; f.title.value = n.title; f.release_date.value = n.release_date;
    f.youtube_url.value = n.youtube_url; f.spotify_url.value = n.spotify_url;
    f.apple_music_url.value = n.apple_music_url; f.cover_image.value = n.cover_image; f.blurb.value = n.blurb;
    editingIndex = i;
    formTitle.textContent = 'Editing: ' + n.title;
    document.getElementById('wSave').textContent = 'Save changes';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    if (!list.length) {
      rowList.innerHTML = '<p class="section-note">No singles yet. Add one above.</p>';
    } else {
      rowList.innerHTML = list.map(function (n, i) {
        return '<div class="writer-row">' +
          '<div class="writer-row-main">' +
            '<div class="news-date">' + esc(n.release_date) + (i === 0 ? ' &middot; latest, shown on home' : '') + '</div>' +
            '<b>' + esc(n.title) + '</b>' +
          '</div>' +
          '<div class="writer-row-actions">' +
            '<button class="btn btn-ghost btn-small" data-up="' + i + '" ' + (i === 0 ? 'disabled' : '') + '>&uarr;</button>' +
            '<button class="btn btn-ghost btn-small" data-down="' + i + '" ' + (i === list.length - 1 ? 'disabled' : '') + '>&darr;</button>' +
            '<button class="btn btn-small" data-edit="' + i + '">Edit</button>' +
            '<button class="btn btn-small btn-danger" data-del="' + i + '">Delete</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }
    output.value = buildFile();
    saveDraft();
  }

  function buildFile() {
    var header = [
      '/* ============================================================',
      '   MUSIC  --  singles and videos. Newest single goes FIRST in',
      '   the list - that\'s the one that shows up on the home page.',
      '   Generated with music-writer.html',
      '   ============================================================ */'
    ].join('\n');
    return header + '\nwindow.SINGLES = ' + JSON.stringify(list, null, 2) + ';\n';
  }

  document.getElementById('wSave').addEventListener('click', function () {
    var title = f.title.value.trim();
    if (!title) { toast('A single needs a title.', true); return; }
    var single = {
      id: f.id.value.trim() || slug(title),
      title: title,
      release_date: f.release_date.value.trim(),
      youtube_url: f.youtube_url.value.trim(),
      youtube_id: youtubeIdFromUrl(f.youtube_url.value.trim()),
      spotify_url: f.spotify_url.value.trim(),
      apple_music_url: f.apple_music_url.value.trim(),
      cover_image: f.cover_image.value.trim(),
      blurb: f.blurb.value.trim()
    };
    if (editingIndex >= 0) { list[editingIndex] = single; toast('Single updated.'); }
    else { list.unshift(single); toast('Single added to the top.'); }
    clearForm(); render();
  });
  document.getElementById('wClear').addEventListener('click', clearForm);

  rowList.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-edit],button[data-del],button[data-up],button[data-down]');
    if (!btn) return;
    var i;
    if ((i = btn.getAttribute('data-edit')) !== null) { fillForm(Number(i)); return; }
    if ((i = btn.getAttribute('data-del')) !== null) {
      if (!window.confirm('Delete this single?')) return;
      list.splice(Number(i), 1); clearForm(); render(); return;
    }
    if ((i = btn.getAttribute('data-up')) !== null) {
      i = Number(i); list.splice(i - 1, 0, list.splice(i, 1)[0]); render(); return;
    }
    if ((i = btn.getAttribute('data-down')) !== null) {
      i = Number(i); list.splice(i + 1, 0, list.splice(i, 1)[0]); render();
    }
  });

  document.getElementById('wCopy').addEventListener('click', function () {
    var code = buildFile();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(
        function () { toast('Copied. Paste it over assets/music-data.js'); },
        function () { output.select(); toast('Press Ctrl/Cmd + C to copy.'); }
      );
    } else { output.select(); toast('Press Ctrl/Cmd + C to copy.'); }
  });
  document.getElementById('wDownload').addEventListener('click', function () {
    var blob = new Blob([buildFile()], { type: 'text/javascript' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'music-data.js';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('Downloaded. Move it into assets/ replacing the old one.');
  });
  document.getElementById('wReset').addEventListener('click', function () {
    if (!window.confirm('Throw away your unsaved changes and reload the singles currently on the site?')) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch (err) { /* ignore */ }
    list = (window.SINGLES || []).map(normalise);
    document.getElementById('wDraftNote').classList.add('hidden');
    clearForm(); render();
  });

  start();
})();
