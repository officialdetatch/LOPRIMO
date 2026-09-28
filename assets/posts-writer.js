/* ============================================================
   POSTS WRITER  --  private tool, not linked from the public site.
   Loads the current assets/posts-data.js, lets you add, edit,
   reorder and delete the Instagram links shown on the home page,
   then hands you a finished posts-data.js to save over the old
   one. Nothing here touches the live site until you replace that
   file yourself.
   ============================================================ */
(function () {
  'use strict';

  var DRAFT_KEY = 'loprimo.posts.draft.v1';
  var list = [];
  var editingIndex = -1;

  var f = {
    id: document.getElementById('wId'),
    url: document.getElementById('wUrl'),
    caption: document.getElementById('wCaption')
  };
  var rowList = document.getElementById('wList');
  var output = document.getElementById('wOutput');
  var formTitle = document.getElementById('wFormTitle');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
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
    return { id: n.id || ('post-' + (i + 1)), url: n.url || '', caption: n.caption || '' };
  }

  function start() {
    var draft = loadDraft();
    var live = (window.LATEST_POSTS || []).map(normalise);
    if (draft && draft.length && JSON.stringify(draft) !== JSON.stringify(live)) {
      list = draft.map(normalise);
      document.getElementById('wDraftNote').classList.remove('hidden');
    } else { list = live; }
    render();
  }

  function clearForm() {
    Object.keys(f).forEach(function (k) { f[k].value = ''; });
    editingIndex = -1;
    formTitle.textContent = 'New post';
    document.getElementById('wSave').textContent = 'Add post';
  }
  function fillForm(i) {
    var n = list[i];
    f.id.value = n.id; f.url.value = n.url; f.caption.value = n.caption;
    editingIndex = i;
    formTitle.textContent = 'Editing post';
    document.getElementById('wSave').textContent = 'Save changes';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    if (!list.length) {
      rowList.innerHTML = '<p class="section-note">No posts yet. Add one above.</p>';
    } else {
      rowList.innerHTML = list.map(function (n, i) {
        return '<div class="writer-row">' +
          '<div class="writer-row-main">' +
            '<div class="news-date">' + (i === 0 ? 'Top of the home page' : '') + '</div>' +
            '<b>' + esc(n.url || '(no link yet)') + '</b>' +
            (n.caption ? '<p class="section-note" style="margin:4px 0 0">' + esc(n.caption) + '</p>' : '') +
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
      '   LATEST POSTS  --  Instagram posts embedded on the home page.',
      '   Newest goes FIRST. Generated with posts-writer.html',
      '   ============================================================ */'
    ].join('\n');
    return header + '\nwindow.LATEST_POSTS = ' + JSON.stringify(list, null, 2) + ';\n';
  }

  document.getElementById('wSave').addEventListener('click', function () {
    var url = f.url.value.trim();
    if (!url) { toast('Paste the post link first.', true); return; }
    var post = { id: f.id.value.trim() || ('post-' + Date.now()), url: url, caption: f.caption.value.trim() };
    if (editingIndex >= 0) { list[editingIndex] = post; toast('Post updated.'); }
    else { list.unshift(post); toast('Post added to the top.'); }
    clearForm(); render();
  });
  document.getElementById('wClear').addEventListener('click', clearForm);

  rowList.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-edit],button[data-del],button[data-up],button[data-down]');
    if (!btn) return;
    var i;
    if ((i = btn.getAttribute('data-edit')) !== null) { fillForm(Number(i)); return; }
    if ((i = btn.getAttribute('data-del')) !== null) {
      if (!window.confirm('Delete this post?')) return;
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
        function () { toast('Copied. Paste it over assets/posts-data.js'); },
        function () { output.select(); toast('Press Ctrl/Cmd + C to copy.'); }
      );
    } else { output.select(); toast('Press Ctrl/Cmd + C to copy.'); }
  });
  document.getElementById('wDownload').addEventListener('click', function () {
    var blob = new Blob([buildFile()], { type: 'text/javascript' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'posts-data.js';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('Downloaded. Move it into assets/ replacing the old one.');
  });
  document.getElementById('wReset').addEventListener('click', function () {
    if (!window.confirm('Throw away your unsaved changes and reload the posts currently on the site?')) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch (err) { /* ignore */ }
    list = (window.LATEST_POSTS || []).map(normalise);
    document.getElementById('wDraftNote').classList.add('hidden');
    clearForm(); render();
  });

  start();
})();
