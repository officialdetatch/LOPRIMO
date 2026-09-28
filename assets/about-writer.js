/* ============================================================
   ABOUT WRITER  --  private tool, not linked from the public site.
   Loads the current assets/about-data.js, lets you edit the title,
   intro line, the stack of paragraph/image blocks, and the social
   links, then hands you a finished about-data.js to save over the
   old one. Nothing here touches the live site until you replace
   that file yourself.
   ============================================================ */
(function () {
  'use strict';

  var DRAFT_KEY = 'loprimo.about.draft.v1';
  var state = { title: '', lede: '', blocks: [], members: [], socials: {} };

  var els = {
    title: document.getElementById('amTitle'),
    lede: document.getElementById('amLede'),
    instagram: document.getElementById('amInstagram'),
    youtube: document.getElementById('amYoutube'),
    facebook: document.getElementById('amFacebook'),
    spotify: document.getElementById('amSpotify'),
    blocks: document.getElementById('amBlocks'),
    members: document.getElementById('amMembers'),
    output: document.getElementById('amOutput'),
    draftNote: document.getElementById('amDraftNote')
  };
  if (!els.blocks) return; /* this script only runs on about-writer.html */

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
  function flashSaved(el) {
    el.classList.add('field-saved');
    setTimeout(function () { el.classList.remove('field-saved'); }, 700);
  }

  function normaliseBlock(b) {
    if (b && b.type === 'image') return { type: 'image', src: b.src || '', caption: b.caption || '' };
    return { type: 'p', text: (b && b.text) || '' };
  }
  function normaliseMember(m) {
    m = m || {};
    return { name: m.name || '', role: m.role || '', bio: m.bio || '', photo: m.photo || '', instagram: m.instagram || '' };
  }
  function normalise(about) {
    about = about || {};
    var s = about.socials || {};
    return {
      title: about.title || '',
      lede: about.lede || '',
      blocks: Array.isArray(about.blocks) ? about.blocks.map(normaliseBlock) : [],
      members: Array.isArray(about.members) ? about.members.map(normaliseMember) : [],
      socials: {
        instagram: s.instagram || '',
        youtube: s.youtube || '',
        facebook: s.facebook || '',
        spotify: s.spotify || ''
      }
    };
  }

  function loadDraft() {
    try { var raw = localStorage.getItem(DRAFT_KEY); if (raw) return JSON.parse(raw); } catch (err) { /* ignore */ }
    return null;
  }
  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch (err) { /* ignore */ }
  }

  function buildFile() {
    var header = [
      '/* ============================================================',
      '   ABOUT PAGE \u2014 bio, blocks and social links.',
      '   Edited as a list of blocks in order (paragraphs and images,',
      '   mixed however you like), plus a fixed socials object.',
      '   Generated with about-writer.html',
      '   ============================================================ */'
    ].join('\n');
    return header + '\nwindow.BAND_ABOUT = ' + JSON.stringify(state, null, 2) + ';\n';
  }

  function blockRowHTML(b, i) {
    var n = state.blocks.length;
    var actions = '<div class="writer-row-actions">' +
      '<button class="btn btn-ghost btn-small" data-up="' + i + '" ' + (i === 0 ? 'disabled' : '') + '>&uarr;</button>' +
      '<button class="btn btn-ghost btn-small" data-down="' + i + '" ' + (i === n - 1 ? 'disabled' : '') + '>&darr;</button>' +
      '<button class="btn btn-small btn-danger" data-del="' + i + '">Delete</button>' +
      '</div>';
    if (b.type === 'image') {
      return '<div class="writer-row"><div class="writer-row-main"><div class="writer-grid">' +
        '<div class="field" style="margin-bottom:0"><label>Image path</label>' +
          '<input type="text" class="block-input" data-field="src" data-idx="' + i + '" value="' + esc(b.src) + '" placeholder="images/about/photo.jpg"></div>' +
        '<div class="field" style="margin-bottom:0"><label>Caption (optional)</label>' +
          '<input type="text" class="block-input" data-field="caption" data-idx="' + i + '" value="' + esc(b.caption) + '" placeholder="Optional caption"></div>' +
        '</div></div>' + actions + '</div>';
    }
    return '<div class="writer-row"><div class="writer-row-main">' +
      '<div class="field" style="margin-bottom:0"><label>Paragraph</label>' +
        '<textarea class="block-input" data-field="text" data-idx="' + i + '" rows="3">' + esc(b.text) + '</textarea></div>' +
      '</div>' + actions + '</div>';
  }

  function renderBlocks() {
    els.blocks.innerHTML = state.blocks.length
      ? state.blocks.map(blockRowHTML).join('')
      : '<p class="section-note">No blocks yet. Add a paragraph or image below.</p>';
  }

  function memberRowHTML(m, i) {
    var n = state.members.length;
    var actions = '<div class="writer-row-actions">' +
      '<button class="btn btn-ghost btn-small" data-mup="' + i + '" ' + (i === 0 ? 'disabled' : '') + '>&uarr;</button>' +
      '<button class="btn btn-ghost btn-small" data-mdown="' + i + '" ' + (i === n - 1 ? 'disabled' : '') + '>&darr;</button>' +
      '<button class="btn btn-small btn-danger" data-mdel="' + i + '">Delete</button>' +
      '</div>';
    return '<div class="writer-row"><div class="writer-row-main"><div class="writer-grid">' +
      '<div class="field" style="margin-bottom:0"><label>Name</label>' +
        '<input type="text" class="member-input" data-field="name" data-idx="' + i + '" value="' + esc(m.name) + '" placeholder="Roberto"></div>' +
      '<div class="field" style="margin-bottom:0"><label>Role (optional)</label>' +
        '<input type="text" class="member-input" data-field="role" data-idx="' + i + '" value="' + esc(m.role) + '" placeholder="Voz &amp; guitarra"></div>' +
      '<div class="field" style="margin-bottom:0"><label>Photo path (optional)</label>' +
        '<input type="text" class="member-input" data-field="photo" data-idx="' + i + '" value="' + esc(m.photo) + '" placeholder="images/about/photo.jpg"></div>' +
      '</div>' +
      '<div class="field" style="margin-bottom:0;margin-top:10px"><label>Instagram URL (optional)</label>' +
        '<input type="text" class="member-input" data-field="instagram" data-idx="' + i + '" value="' + esc(m.instagram) + '" placeholder="https://instagram.com/usuario"></div>' +
      '<div class="field" style="margin-bottom:0;margin-top:10px"><label>Short bio (optional)</label>' +
        '<textarea class="member-input" data-field="bio" data-idx="' + i + '" rows="2">' + esc(m.bio) + '</textarea></div>' +
      '</div>' + actions + '</div>';
  }
  function renderMembers() {
    els.members.innerHTML = state.members.length
      ? state.members.map(memberRowHTML).join('')
      : '<p class="section-note">No members yet. Add one below.</p>';
  }

  function updateOutput() { els.output.value = buildFile(); saveDraft(); }
  function render() {
    els.title.value = state.title;
    els.lede.value = state.lede;
    els.instagram.value = state.socials.instagram;
    els.youtube.value = state.socials.youtube;
    els.facebook.value = state.socials.facebook;
    els.spotify.value = state.socials.spotify;
    renderBlocks();
    renderMembers();
    updateOutput();
  }

  function start() {
    var draft = loadDraft();
    var live = normalise(window.BAND_ABOUT);
    if (draft && JSON.stringify(normalise(draft)) !== JSON.stringify(live)) {
      state = normalise(draft);
      els.draftNote.classList.remove('hidden');
    } else {
      state = live;
    }
    render();
  }

  els.title.addEventListener('change', function () { state.title = els.title.value.trim(); updateOutput(); flashSaved(els.title); });
  els.lede.addEventListener('change', function () { state.lede = els.lede.value.trim(); updateOutput(); flashSaved(els.lede); });
  ['instagram', 'youtube', 'facebook', 'spotify'].forEach(function (key) {
    els[key].addEventListener('change', function () { state.socials[key] = els[key].value.trim(); updateOutput(); flashSaved(els[key]); });
  });

  els.blocks.addEventListener('change', function (ev) {
    var target = ev.target;
    if (!target.classList.contains('block-input')) return;
    var i = Number(target.getAttribute('data-idx'));
    var field = target.getAttribute('data-field');
    var block = state.blocks[i];
    if (!block) return;
    block[field] = target.value.trim();
    updateOutput();
    flashSaved(target);
  });
  els.blocks.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter') return;
    var target = ev.target;
    if (target.classList.contains('block-input') && target.tagName === 'INPUT') { ev.preventDefault(); target.blur(); }
  });
  els.blocks.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-up],button[data-down],button[data-del]');
    if (!btn) return;
    var i;
    if ((i = btn.getAttribute('data-up')) !== null) {
      i = Number(i);
      if (i > 0) { state.blocks.splice(i - 1, 0, state.blocks.splice(i, 1)[0]); renderBlocks(); updateOutput(); }
      return;
    }
    if ((i = btn.getAttribute('data-down')) !== null) {
      i = Number(i);
      if (i < state.blocks.length - 1) { state.blocks.splice(i + 1, 0, state.blocks.splice(i, 1)[0]); renderBlocks(); updateOutput(); }
      return;
    }
    if ((i = btn.getAttribute('data-del')) !== null) {
      i = Number(i);
      if (!window.confirm('Delete this block?')) return;
      state.blocks.splice(i, 1);
      renderBlocks();
      updateOutput();
    }
  });

  els.members.addEventListener('change', function (ev) {
    var target = ev.target;
    if (!target.classList.contains('member-input')) return;
    var i = Number(target.getAttribute('data-idx'));
    var field = target.getAttribute('data-field');
    var member = state.members[i];
    if (!member) return;
    member[field] = target.value.trim();
    updateOutput();
    flashSaved(target);
  });
  els.members.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter') return;
    var target = ev.target;
    if (target.classList.contains('member-input') && target.tagName === 'INPUT') { ev.preventDefault(); target.blur(); }
  });
  els.members.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-mup],button[data-mdown],button[data-mdel]');
    if (!btn) return;
    var i;
    if ((i = btn.getAttribute('data-mup')) !== null) {
      i = Number(i);
      if (i > 0) { state.members.splice(i - 1, 0, state.members.splice(i, 1)[0]); renderMembers(); updateOutput(); }
      return;
    }
    if ((i = btn.getAttribute('data-mdown')) !== null) {
      i = Number(i);
      if (i < state.members.length - 1) { state.members.splice(i + 1, 0, state.members.splice(i, 1)[0]); renderMembers(); updateOutput(); }
      return;
    }
    if ((i = btn.getAttribute('data-mdel')) !== null) {
      i = Number(i);
      if (!window.confirm('Delete this member?')) return;
      state.members.splice(i, 1);
      renderMembers();
      updateOutput();
    }
  });
  document.getElementById('amAddMember').addEventListener('click', function () {
    state.members.push({ name: '', role: '', bio: '', photo: '', instagram: '' });
    renderMembers(); updateOutput();
    var inputs = els.members.querySelectorAll('input.member-input[data-field="name"]');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });

  document.getElementById('amAddP').addEventListener('click', function () {
    state.blocks.push({ type: 'p', text: '' });
    renderBlocks(); updateOutput();
    var areas = els.blocks.querySelectorAll('textarea.block-input');
    if (areas.length) areas[areas.length - 1].focus();
  });
  document.getElementById('amAddImg').addEventListener('click', function () {
    state.blocks.push({ type: 'image', src: '', caption: '' });
    renderBlocks(); updateOutput();
    var inputs = els.blocks.querySelectorAll('input.block-input[data-field="src"]');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });

  document.getElementById('amDownload').addEventListener('click', function () {
    var blob = new Blob([buildFile()], { type: 'text/javascript' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'about-data.js';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast('Downloaded. Move it into assets/ replacing the old one.');
  });
  document.getElementById('amCopy').addEventListener('click', function () {
    var code = buildFile();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(
        function () { toast('Copied. Paste it over assets/about-data.js'); },
        function () { els.output.select(); toast('Press Ctrl/Cmd + C to copy.'); }
      );
    } else { els.output.select(); toast('Press Ctrl/Cmd + C to copy.'); }
  });
  document.getElementById('amReset').addEventListener('click', function () {
    if (!window.confirm('Throw away your unsaved changes and reload the About page currently on the site?')) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch (err) { /* ignore */ }
    state = normalise(window.BAND_ABOUT);
    els.draftNote.classList.add('hidden');
    render();
  });

  start();
})();
