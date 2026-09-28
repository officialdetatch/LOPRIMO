/* ============================================================
   SHOWS WRITER  --  private tool, not linked from the public site.
   Loads the current assets/shows-data.js, lets you add, edit,
   reorder and delete show dates, then hands you a finished
   shows-data.js to save over the old one. The public site sorts
   by date automatically, so list order here is just for your
   convenience. Nothing here touches the live site until you
   replace that file yourself.
   ============================================================ */
(function () {
  'use strict';

  var DRAFT_KEY = 'loprimo.shows.draft.v1';
  var list = [];
  var editingIndex = -1;

  var f = {
    id: document.getElementById('wId'),
    date: document.getElementById('wDate'),
    city: document.getElementById('wCity'),
    venue: document.getElementById('wVenue'),
    ticket_url: document.getElementById('wTicketUrl'),
    note: document.getElementById('wNote'),
    status: document.getElementById('wStatus')
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
      id: n.id || slug((n.city || '') + '-' + (n.date || '')) || ('show-' + (i + 1)),
      date: n.date || '',
      city: n.city || '',
      venue: n.venue || '',
      ticket_url: n.ticket_url || '',
      note: n.note || '',
      status: n.status === 'past' ? 'past' : 'upcoming'
    };
  }

  function start() {
    var draft = loadDraft();
    var live = (window.SHOWS || []).map(normalise);
    if (draft && draft.length && JSON.stringify(draft) !== JSON.stringify(live)) {
      list = draft.map(normalise);
      document.getElementById('wDraftNote').classList.remove('hidden');
    } else { list = live; }
    render();
  }

  function clearForm() {
    Object.keys(f).forEach(function (k) { f[k].value = k === 'status' ? 'upcoming' : ''; });
    editingIndex = -1;
    formTitle.textContent = 'New show';
    document.getElementById('wSave').textContent = 'Add show';
  }
  function fillForm(i) {
    var n = list[i];
    f.id.value = n.id; f.date.value = n.date; f.city.value = n.city; f.venue.value = n.venue;
    f.ticket_url.value = n.ticket_url; f.note.value = n.note; f.status.value = n.status;
    editingIndex = i;
    formTitle.textContent = 'Editing: ' + n.city;
    document.getElementById('wSave').textContent = 'Save changes';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    if (!list.length) {
      rowList.innerHTML = '<p class="section-note">No shows yet. Add one above.</p>';
    } else {
      rowList.innerHTML = list.map(function (n, i) {
        return '<div class="writer-row">' +
          '<div class="writer-row-main">' +
            '<div class="news-date">' + esc(n.date) + ' &middot; ' + (n.status === 'past' ? 'past' : 'upcoming') + '</div>' +
            '<b>' + esc(n.city) + '</b>' + (n.venue ? ' &mdash; ' + esc(n.venue) : '') +
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
      '   SHOWS  --  this is the only file you edit to post or remove a',
      '   show date. Edit it by hand or with shows-writer.html.',
      '   Sorted automatically by date on the public site.',
      '   Generated with shows-writer.html',
      '   ============================================================ */'
    ].join('\n');
    return header + '\nwindow.SHOWS = ' + JSON.stringify(list, null, 2) + ';\n';
  }

  document.getElementById('wSave').addEventListener('click', function () {
    var city = f.city.value.trim();
    if (!city) { toast('A show needs a city at least.', true); return; }
    var show = {
      id: f.id.value.trim() || slug(city + '-' + f.date.value.trim()),
      date: f.date.value.trim(),
      city: city,
      venue: f.venue.value.trim(),
      ticket_url: f.ticket_url.value.trim(),
      note: f.note.value.trim(),
      status: f.status.value === 'past' ? 'past' : 'upcoming'
    };
    if (editingIndex >= 0) { list[editingIndex] = show; toast('Show updated.'); }
    else { list.unshift(show); toast('Show added.'); }
    clearForm(); render();
  });
  document.getElementById('wClear').addEventListener('click', clearForm);

  rowList.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-edit],button[data-del],button[data-up],button[data-down]');
    if (!btn) return;
    var i;
    if ((i = btn.getAttribute('data-edit')) !== null) { fillForm(Number(i)); return; }
    if ((i = btn.getAttribute('data-del')) !== null) {
      if (!window.confirm('Delete this show?')) return;
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
        function () { toast('Copied. Paste it over assets/shows-data.js'); },
        function () { output.select(); toast('Press Ctrl/Cmd + C to copy.'); }
      );
    } else { output.select(); toast('Press Ctrl/Cmd + C to copy.'); }
  });
  document.getElementById('wDownload').addEventListener('click', function () {
    var blob = new Blob([buildFile()], { type: 'text/javascript' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'shows-data.js';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('Downloaded. Move it into assets/ replacing the old one.');
  });
  document.getElementById('wReset').addEventListener('click', function () {
    if (!window.confirm('Throw away your unsaved changes and reload the shows currently on the site?')) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch (err) { /* ignore */ }
    list = (window.SHOWS || []).map(normalise);
    document.getElementById('wDraftNote').classList.add('hidden');
    clearForm(); render();
  });

  start();
})();
