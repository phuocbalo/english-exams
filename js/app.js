/* Hani Desk – main app (plain JavaScript, no build step). */
(function () {
  'use strict';

  var CFG = window.HANI_CONFIG;
  var TYPE_ORDER = ['picture_choice', 'missing_letter', 'odd_one_out', 'fill_blank', 'response'];
  var PART_NAMES = {
    picture_choice: 'Look and choose',
    missing_letter: 'Find the missing letter',
    odd_one_out: 'Find the odd one out',
    fill_blank: 'Choose the word',
    response: 'Choose the answer'
  };
  var LETTERS = ['A', 'B', 'C', 'D'];
  var COLORS = ['#FFC93C', '#FF9EAA', '#A9CCFF', '#7BD88F'];
  var MODE_NAMES = { unit: 'Unit Practice', hk1: 'Semester 1 Review', hk2: 'Semester 2 Review', year: 'Final Test' };

  var app = document.getElementById('app');

  /* ---------------- storage ---------------- */
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('hani.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem('hani.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
    }
  };

  var state = {
    profiles: store.get('profiles', []),
    profileId: store.get('profileId', null),
    grade: store.get('grade', 3),
    muted: store.get('muted', false),
    progress: store.get('progress', {}),
    data: {},          // grade -> { questions, structure }
    quiz: null,        // current quiz
    lastResult: null,
    draft: null,       // new profile form
    manage: false,     // profile delete mode
    unitTab: 1
  };

  function save() {
    store.set('profiles', state.profiles);
    store.set('profileId', state.profileId);
    store.set('grade', state.grade);
    store.set('muted', state.muted);
    store.set('progress', state.progress);
  }

  function currentProfile() {
    for (var i = 0; i < state.profiles.length; i++) if (state.profiles[i].id === state.profileId) return state.profiles[i];
    return null;
  }

  function progressFor() {
    var key = state.profileId + ':g' + state.grade;
    if (!state.progress[key]) state.progress[key] = {};
    return state.progress[key];
  }

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function fmtScore(x) { return (Math.round(x * 10) / 10).toString(); }
  function isImageUrl(s) { return /^(https?:)?\/\//.test(s) || /\.(png|jpe?g|gif|webp|svg)$/i.test(s); }
  function isShort(s) { return String(s).length <= 3; }

  /* ---------------- icons & mascots ---------------- */
  var I = {
    back: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    close: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    plus: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    soundOn: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    soundOff: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
    lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    book: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/><path d="M9 8h6"/></svg>',
    loop: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v6h6"/><path d="M20 20v-6h-6"/><path d="M19 9a8 8 0 0 0-14.3-2.7L4 10"/><path d="M5 15a8 8 0 0 0 14.3 2.7L20 14"/></svg>',
    trophy: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v2a3 3 0 0 0 3 3"/><path d="M17 6h3v2a3 3 0 0 1-3 3"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    cross: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    search: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    bulb: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>',
    trash: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A3412" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg>'
  };

  // Mascot B (girl) and E (boy). mood: 'happy' | 'party'
  function mascot(gender, w, mood) {
    var h = Math.round(w * 100 / 140);
    var open = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 140 100" aria-hidden="true" style="flex-shrink:0">';
    var party = mood === 'party';
    if (gender === 'boy') {
      return open +
        '<rect x="18" y="70" width="108" height="20" rx="10" fill="#FFC93C" stroke="#2B2A4A" stroke-width="3"/>' +
        '<rect x="110" y="40" width="24" height="44" rx="12" fill="#FFC93C" stroke="#2B2A4A" stroke-width="3"/>' +
        '<line x1="116" y1="42" x2="' + (party ? 106 : 110) + '" y2="20" stroke="#2B2A4A" stroke-width="3" stroke-linecap="round"/>' +
        '<line x1="128" y1="42" x2="' + (party ? 138 : 134) + '" y2="20" stroke="#2B2A4A" stroke-width="3" stroke-linecap="round"/>' +
        (party
          ? '<circle cx="106" cy="17" r="6" fill="#FFFFFF" stroke="#2B2A4A" stroke-width="3"/><path d="M103 18 Q106 14 109 18" fill="none" stroke="#2B2A4A" stroke-width="2.5" stroke-linecap="round"/><circle cx="138" cy="17" r="6" fill="#FFFFFF" stroke="#2B2A4A" stroke-width="3"/><path d="M135 18 Q138 14 141 18" fill="none" stroke="#2B2A4A" stroke-width="2.5" stroke-linecap="round"/>'
          : '<circle cx="110" cy="17" r="6" fill="#FFFFFF" stroke="#2B2A4A" stroke-width="3"/><circle cx="112" cy="18" r="2.5" fill="#2B2A4A"/><circle cx="134" cy="17" r="6" fill="#FFFFFF" stroke="#2B2A4A" stroke-width="3"/><circle cx="136" cy="18" r="2.5" fill="#2B2A4A"/>') +
        '<rect x="109" y="46" width="26" height="7" rx="2" fill="#FF8A66" stroke="#2B2A4A" stroke-width="2"/>' +
        '<path d="M134 50 l6 -6 M134 50 l7 3" stroke="#FF8A66" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M114 62 Q122 72 130 62 Z" fill="#2B2A4A" stroke="#2B2A4A" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="66" cy="52" r="32" fill="#FF8A66" stroke="#2B2A4A" stroke-width="3"/>' +
        '<path d="M66 52 m-6 0 a6 6 0 1 1 12 0 a12 12 0 1 1 -24 0 a18 18 0 1 1 36 0" fill="none" stroke="#2B2A4A" stroke-width="3" stroke-linecap="round"/>' +
        '</svg>';
    }
    return open +
      '<rect x="18" y="72" width="104" height="18" rx="9" fill="#FFD6A5" stroke="#2B2A4A" stroke-width="3"/>' +
      '<line x1="104" y1="38" x2="' + (party ? 94 : 98) + '" y2="18" stroke="#2B2A4A" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="120" y1="38" x2="' + (party ? 130 : 126) + '" y2="18" stroke="#2B2A4A" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="' + (party ? 94 : 98) + '" cy="16" r="4.5" fill="' + (party ? '#FFC93C' : '#FF9EAA') + '" stroke="#2B2A4A" stroke-width="2.5"/>' +
      '<circle cx="' + (party ? 130 : 126) + '" cy="16" r="4.5" fill="' + (party ? '#FFC93C' : '#FF9EAA') + '" stroke="#2B2A4A" stroke-width="2.5"/>' +
      '<circle cx="112" cy="58" r="22" fill="#FFD6A5" stroke="#2B2A4A" stroke-width="3"/>' +
      (party
        ? '<path d="M99 56 Q104 50 109 56" fill="none" stroke="#2B2A4A" stroke-width="3" stroke-linecap="round"/><path d="M115 56 Q120 50 125 56" fill="none" stroke="#2B2A4A" stroke-width="3" stroke-linecap="round"/><path d="M106 64 Q112 74 118 64 Z" fill="#2B2A4A" stroke="#2B2A4A" stroke-width="2" stroke-linejoin="round"/>'
        : '<ellipse cx="104" cy="56" rx="4.5" ry="6" fill="#2B2A4A"/><circle cx="105.6" cy="53.6" r="1.8" fill="#FFFFFF"/><ellipse cx="120" cy="56" rx="4.5" ry="6" fill="#2B2A4A"/><circle cx="121.6" cy="53.6" r="1.8" fill="#FFFFFF"/><path d="M108 67 Q112 71 116 67" fill="none" stroke="#2B2A4A" stroke-width="2.5" stroke-linecap="round"/>') +
      '<ellipse cx="98" cy="66" rx="4" ry="2.5" fill="#FF9EAA"/><ellipse cx="126" cy="66" rx="4" ry="2.5" fill="#FF9EAA"/>' +
      '<circle cx="54" cy="52" r="30" fill="#FFB3C7" stroke="#2B2A4A" stroke-width="3"/>' +
      '<path d="M54 52 m-6 0 a6 6 0 1 1 12 0 a12 12 0 1 1 -24 0 a18 18 0 1 1 36 0" fill="none" stroke="#2B2A4A" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="38" cy="34" r="2.5" fill="#FFFFFF"/><circle cx="72" cy="70" r="2" fill="#FFFFFF"/>' +
      '</svg>';
  }

  function avatar(p, size) {
    return '<span class="avatar' + (size === 'lg' ? ' lg' : '') + '" style="background:' + esc(p.color) + '">' + esc(p.name.charAt(0).toUpperCase()) + '</span>';
  }

  /* ---------------- sound (Web Audio, no files) ---------------- */
  var audioCtx = null;
  function tone(freq, start, dur, type, vol) {
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, audioCtx.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(audioCtx.currentTime + start); o.stop(audioCtx.currentTime + start + dur + 0.05);
  }
  function play(kind) {
    if (state.muted) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      if (kind === 'tap') tone(660, 0, 0.08, 'triangle', 0.12);
      else if (kind === 'pick') tone(880, 0, 0.12, 'sine', 0.15);
      else if (kind === 'great') { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.25, 'triangle', 0.18); }); }
      else if (kind === 'done') { [523, 659, 784].forEach(function (f, i) { tone(f, i * 0.13, 0.25, 'sine', 0.15); }); }
    } catch (e) { /* audio unavailable */ }
  }

  /* ---------------- data ---------------- */
  function parseCSV(text) {
    var rows = [], row = [], cell = '', q = false;
    text = text.replace(/^﻿/, '');
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    rows = rows.filter(function (r) { return r.some(function (x) { return x.trim() !== ''; }); });
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return h.trim(); });
    return rows.slice(1).map(function (r) {
      var o = {}; head.forEach(function (h, k) { o[h] = (r[k] || '').trim(); }); return o;
    });
  }

  function validQuestion(q) {
    if (String(q.active).toUpperCase() === 'FALSE') return false;
    if (TYPE_ORDER.indexOf(q.type) < 0) return false;
    if (LETTERS.indexOf(String(q.answer).toUpperCase()) < 0) return false;
    if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d) return false;
    return !isNaN(parseInt(q.unit, 10));
  }

  function loadGrade(grade) {
    if (state.data[grade]) return Promise.resolve(state.data[grade]);
    var g = CFG.grades[grade];
    var get = function (url) {
      return fetch(url, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
        return r.text();
      });
    };
    return Promise.all([get(g.questions), get(g.structure)]).then(function (res) {
      var questions = parseCSV(res[0]).filter(validQuestion).map(function (q) {
        return {
          id: q.id, unit: parseInt(q.unit, 10), type: q.type, text: q.question, image: q.image || '',
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          answer: LETTERS.indexOf(q.answer.toUpperCase()), explanation: q.explanation || ''
        };
      });
      var structure = {};
      parseCSV(res[1]).forEach(function (r) {
        var s = { name: r.name, from: parseInt(r.unit_from, 10), to: parseInt(r.unit_to, 10), counts: {} };
        TYPE_ORDER.forEach(function (t) { s.counts[t] = parseInt(r[t], 10) || 0; });
        structure[r.mode] = s;
      });
      state.data[grade] = { questions: questions, structure: structure };
      return state.data[grade];
    });
  }

  function unitCount(unit) {
    var d = state.data[state.grade];
    return d ? d.questions.filter(function (q) { return q.unit === unit; }).length : 0;
  }

  function buildQuiz(mode, unit) {
    var d = state.data[state.grade], s = d.structure[mode];
    var from = mode === 'unit' ? unit : s.from, to = mode === 'unit' ? unit : s.to;
    var pool = d.questions.filter(function (q) { return q.unit >= from && q.unit <= to; });
    var list = [];
    TYPE_ORDER.forEach(function (t) {
      shuffle(pool.filter(function (q) { return q.type === t; })).slice(0, s.counts[t]).forEach(function (q) { list.push(q); });
    });
    var units = CFG.grades[state.grade].units;
    return {
      mode: mode, unit: unit,
      title: mode === 'unit' ? 'Unit ' + unit + ' · ' + units[unit - 1] : MODE_NAMES[mode],
      questions: list, answers: list.map(function () { return null; }), index: 0
    };
  }

  /* ---------------- routing ---------------- */
  function go(route) {
    if (location.hash === '#/' + route) render(); else location.hash = '#/' + route;
  }
  function route() { return (location.hash || '').replace(/^#\//, '') || 'profiles'; }

  function render() {
    var r = route();
    if (!currentProfile() && r !== 'new-profile') r = 'profiles';
    if ((r === 'quiz' && !state.quiz) || ((r === 'result' || r === 'review') && !state.lastResult)) r = 'home';
    var screens = { profiles: viewProfiles, 'new-profile': viewNewProfile, grades: viewGrades, home: viewHome, units: viewUnits, quiz: viewQuiz, result: viewResult, review: viewReview };
    var view = screens[r] || viewProfiles;
    var needsData = ['home', 'units', 'quiz', 'result', 'review'].indexOf(r) >= 0;
    if (needsData && !state.data[state.grade]) {
      app.innerHTML = '<div class="loading">Loading…</div>';
      loadGrade(state.grade).then(render).catch(function (e) {
        app.innerHTML = '<div class="error-box">Could not load questions<p>' + esc(e.message) + '</p><p><button class="btn green" data-action="reload">Try again</button></p></div>';
      });
      return;
    }
    app.innerHTML = view();
    window.scrollTo(0, 0);
    var focus = app.querySelector('[autofocus]');
    if (focus) focus.focus();
  }

  /* ---------------- views ---------------- */
  function soundBtn() {
    return '<button class="icon-btn" data-action="sound" aria-label="' + (state.muted ? 'Sound off' : 'Sound on') + '">' + (state.muted ? I.soundOff : I.soundOn) + '</button>';
  }
  function backBtn(to, label) {
    return '<a class="icon-btn" href="#/' + to + '" aria-label="' + (label || 'Back') + '">' + I.back + '</a>';
  }
  function profileChip(link) {
    var p = currentProfile();
    return '<a class="chip" href="#/' + (link || 'profiles') + '">' + avatar(p) + esc(p.name) + '</a>';
  }

  function viewProfiles() {
    var list = state.profiles.map(function (p) {
      return '<div class="row">' +
        '<button class="profile-btn" data-action="pick-profile" data-id="' + esc(p.id) + '">' + avatar(p, 'lg') +
        '<span class="grow"><span class="name">' + esc(p.name) + '</span><br><span class="small">' + (p.gender === 'boy' ? 'Boy' : 'Girl') + '</span></span>' + I.next + '</button>' +
        (state.manage ? '<button class="del-btn" data-action="del-profile" data-id="' + esc(p.id) + '" aria-label="Delete ' + esc(p.name) + '">' + I.trash + '</button>' : '') +
        '</div>';
    }).join('');
    var canAdd = state.profiles.length < CFG.maxProfiles;
    return '<div class="blob" style="width:360px;height:360px;background:#E3F7EA;top:-140px;right:-160px"></div>' +
      '<div class="blob" style="width:220px;height:220px;background:#FFF1C9;bottom:-80px;left:-90px"></div>' +
      '<div class="row" style="justify-content:flex-end">' + soundBtn() + '</div>' +
      '<div class="stack" style="align-items:center;gap:8px">' + mascot('girl', 168) +
      '<h1 class="logo">Hani <span>Desk</span></h1><p class="subtitle">English practice, one step at a time</p></div>' +
      '<div class="stack" style="margin-top:8px">' +
      '<h2 class="title" style="font-size:26px;text-align:center">' + (state.profiles.length ? 'Who is learning today?' : 'Welcome! Let’s make your profile') + '</h2>' +
      list +
      (canAdd ? '<a class="add-btn" href="#/new-profile">' + I.plus + 'Add profile</a>' : '') +
      '<p class="small" style="text-align:center">Up to ' + CFG.maxProfiles + ' profiles on this device</p>' +
      (state.profiles.length ? '<p style="text-align:center"><button class="link-btn" data-action="manage">' + (state.manage ? 'Done' : 'Manage profiles') + '</button></p>' : '') +
      '</div>';
  }

  function viewNewProfile() {
    if (!state.draft) state.draft = { name: '', gender: 'girl', color: COLORS[0] };
    var d = state.draft;
    var back = state.profiles.length ? backBtn('profiles') : '<span></span>';
    return '<div class="row spread">' + back + soundBtn() + '</div>' +
      '<h1 class="title">New profile</h1>' +
      '<form class="stack" data-form="profile" novalidate>' +
      '<label class="field-label" for="pname">Your name</label>' +
      '<input id="pname" class="text-input" name="name" maxlength="12" autocomplete="off" value="' + esc(d.name) + '" placeholder="Type your name" autofocus>' +
      '<span class="field-label" id="g-label">I am a…</span>' +
      '<div class="grid2" role="group" aria-labelledby="g-label">' +
      '<button type="button" class="choice" data-action="gender" data-v="girl" aria-pressed="' + (d.gender === 'girl') + '">' + mascot('girl', 112) + 'Girl</button>' +
      '<button type="button" class="choice" data-action="gender" data-v="boy" aria-pressed="' + (d.gender === 'boy') + '">' + mascot('boy', 112) + 'Boy</button>' +
      '</div>' +
      '<span class="field-label" id="c-label">Pick a color</span>' +
      '<div class="swatches" role="group" aria-labelledby="c-label">' +
      COLORS.map(function (c, i) { return '<button type="button" class="swatch" data-action="color" data-v="' + c + '" style="background:' + c + '" aria-label="Color ' + (i + 1) + '" aria-pressed="' + (d.color === c) + '"></button>'; }).join('') +
      '</div>' +
      '<p class="small" data-msg style="min-height:20px;color:#9A3412"></p>' +
      '<button type="submit" class="btn green">Save</button>' +
      '</form>';
  }

  function viewGrades() {
    var g = CFG.openGrades;
    var tiles = [1, 2, 3, 4, 5].filter(function (n) { return g.indexOf(n) < 0; }).map(function (n) {
      return '<div class="grade-off"><span class="n">' + n + '</span><span class="g">Grade ' + n + '</span><span class="row small" style="gap:4px">' + I.lock + 'Coming soon</span></div>';
    }).join('');
    var open = g.map(function (n) {
      return '<button class="card-btn grade-main" data-action="pick-grade" data-v="' + n + '"><span class="grade-num">' + n + '</span>' +
        '<span class="grow"><span class="card-title" style="font-size:30px">Grade ' + n + '</span><br><span class="card-sub">20 units · Global Success</span></span>' + I.next + '</button>';
    }).join('');
    return '<div class="row spread">' + backBtn('profiles') + profileChip() + '</div>' +
      '<div><h1 class="title" style="font-size:36px">Choose your grade</h1><p class="subtitle">Tap your class to start</p></div>' +
      open + '<div class="grid2">' + tiles + '</div>';
  }

  function viewHome() {
    var p = currentProfile(), prog = progressFor();
    var units = CFG.grades[state.grade].units;
    var done = units.filter(function (_, i) { return prog['unit-' + (i + 1)] !== undefined; }).length;
    var best = function (k) { return prog[k] !== undefined ? 'Best ' + fmtScore(prog[k]) + '/10' : 'New'; };
    return '<div class="row spread">' + profileChip() +
      '<div class="row" style="gap:10px"><a class="chip plain" href="#/grades">Grade ' + state.grade + '</a>' + soundBtn() + '</div></div>' +
      '<div class="row" style="align-items:flex-end;gap:4px">' + mascot(p.gender, 98) +
      '<div class="bubble"><b>Hi ' + esc(p.name) + '!</b><span class="small">What do you want to practice?</span></div></div>' +
      '<a class="card-btn" href="#/units" style="background:#7BD88F">' +
      '<span class="row" style="gap:14px"><span class="card-icon">' + I.book + '</span><span class="grow"><span class="card-title">Unit Practice</span><br><span class="card-sub">Unit 1 to Unit ' + units.length + '</span></span>' + I.next + '</span>' +
      '<span class="row" style="gap:10px"><span class="bar"><span style="width:' + Math.round(done / units.length * 100) + '%"></span></span><span class="card-sub">' + done + '/' + units.length + ' done</span></span></a>' +
      '<div class="card-btn" style="background:#A9CCFF">' +
      '<span class="row" style="gap:14px"><span class="card-icon">' + I.loop + '</span><span><span class="card-title">Semester Review</span><br><span class="card-sub">Mixed questions</span></span></span>' +
      '<span class="grid2" style="gap:12px">' +
      '<button class="sem-btn" data-action="start" data-mode="hk1"><b>Semester 1</b><span>Units 1–10 · ' + best('hk1') + '</span></button>' +
      '<button class="sem-btn" data-action="start" data-mode="hk2"><b>Semester 2</b><span>Units 11–20 · ' + best('hk2') + '</span></button>' +
      '</span></div>' +
      '<button class="card-btn" data-action="start" data-mode="year" style="background:#FFB59E;flex-direction:row;align-items:center;gap:14px">' +
      '<span class="card-icon">' + I.trophy + '</span><span class="grow"><span class="card-title">Final Test</span><br><span class="card-sub">All units · ' + best('year') + '</span></span>' + I.next + '</button>';
  }

  function viewUnits() {
    var prog = progressFor(), units = CFG.grades[state.grade].units;
    var from = state.unitTab === 1 ? 1 : 11;
    var rows = units.slice(from - 1, from + 9).map(function (title, i) {
      var n = from + i, s = prog['unit-' + n], has = unitCount(n) > 0;
      var badge = !has || s === undefined ? '#FFFFFF' : (s >= 8 ? '#7BD88F' : '#FFC93C');
      var score = !has ? 'Coming soon' : (s === undefined ? 'Not started' : 'Best ' + fmtScore(s) + '/10');
      var color = !has || s === undefined ? '#5B5A7A' : (s >= 8 ? '#1E7A45' : '#9A5B00');
      return '<button class="unit-btn" data-action="start" data-mode="unit" data-unit="' + n + '"' + (has ? '' : ' disabled') + '>' +
        '<span class="unit-badge" style="background:' + badge + '">' + n + '</span>' +
        '<span class="grow"><span class="small" style="font-size:13px">Unit ' + n + '</span><br><span class="unit-name">' + esc(title) + '</span></span>' +
        '<span class="unit-score" style="color:' + color + '">' + score + '</span></button>';
    }).join('');
    return '<div class="row" style="gap:14px">' + backBtn('home') + '<div><h1 class="title" style="font-size:30px">Unit Practice</h1><p class="subtitle">Choose a unit</p></div></div>' +
      '<div class="tabs" role="tablist">' +
      '<button class="tab" role="tab" data-action="tab" data-v="1" aria-selected="' + (state.unitTab === 1) + '">Semester 1</button>' +
      '<button class="tab" role="tab" data-action="tab" data-v="2" aria-selected="' + (state.unitTab === 2) + '">Semester 2</button></div>' +
      '<div class="stack" style="gap:12px">' + rows + '</div>';
  }

  function viewQuiz() {
    var z = state.quiz;
    if (!z.questions.length) {
      return '<div class="row">' + backBtn('home') + '</div><div class="error-box">No questions yet<p>This test has no questions yet. Please try another one.</p></div>';
    }
    var i = z.index, q = z.questions[i], n = z.questions.length, part = TYPE_ORDER.indexOf(q.type) + 1;
    var img = q.image ? '<span class="q-image">' + (isImageUrl(q.image) ? '<img src="' + esc(q.image) + '" alt="">' : esc(q.image)) + '</span>' : '';
    var emojiOpts = q.options.every(isShort) && q.options.every(function (o) { return /\p{Extended_Pictographic}/u.test(o); });
    var opts = q.options.map(function (o, k) {
      return '<button class="opt' + (emojiOpts ? ' emoji' : '') + '" data-action="answer" data-v="' + k + '" aria-pressed="' + (z.answers[i] === k) + '">' +
        (emojiOpts ? '<span class="sr-only">' + LETTERS[k] + '</span>' : '<span class="letter">' + LETTERS[k] + '</span>') + esc(o) + '</button>';
    }).join('');
    var dots = z.questions.map(function (_, k) {
      return '<button class="dot' + (z.answers[k] !== null ? ' done' : '') + (k === i ? ' now' : '') + '" data-action="jump" data-v="' + k + '" aria-label="Question ' + (k + 1) + '">' + (k + 1) + '</button>';
    }).join('');
    var last = i === n - 1;
    return '<div class="row" style="gap:14px"><button class="icon-btn" data-action="quit" aria-label="Quit test">' + I.close + '</button>' +
      '<div class="grow stack" style="gap:6px"><span class="row spread small" style="font-size:14px;color:#2B2A4A"><span>' + esc(z.title) + '</span><span>' + (i + 1) + ' / ' + n + '</span></span>' +
      '<span class="bar"><span style="width:' + Math.round((i + 1) / n * 100) + '%;background:#7BD88F;border-right:2px solid #2B2A4A"></span></span></div></div>' +
      '<div class="dots">' + dots + '</div>' +
      '<span class="part-chip">Part ' + part + ' · ' + PART_NAMES[q.type] + '</span>' +
      '<div class="panel q-card">' + img + '<p class="q-text">' + esc(q.text) + '</p></div>' +
      '<div class="grid2">' + opts + '</div>' +
      '<div class="grow"></div>' +
      '<div class="grid2"><button class="btn" data-action="prev"' + (i === 0 ? ' disabled' : '') + '>Back</button>' +
      (last ? '<button class="btn coral" data-action="submit">Submit</button>' : '<button class="btn green" data-action="next">Next</button>') + '</div>';
  }

  function confetti() {
    return '<svg class="confetti" viewBox="0 0 390 260" preserveAspectRatio="xMidYMin slice" aria-hidden="true">' +
      '<rect x="40" y="40" width="14" height="8" rx="2" fill="#FF8A66" transform="rotate(25 47 44)"/><rect x="320" y="56" width="14" height="8" rx="2" fill="#4C9BFF" transform="rotate(-30 327 60)"/>' +
      '<circle cx="96" cy="120" r="6" fill="#FFC93C"/><circle cx="300" cy="140" r="5" fill="#7BD88F"/><rect x="270" y="22" width="12" height="7" rx="2" fill="#B794FF" transform="rotate(15 276 25)"/>' +
      '<circle cx="60" cy="200" r="5" fill="#4C9BFF"/><rect x="336" y="200" width="14" height="8" rx="2" fill="#FFC93C" transform="rotate(40 343 204)"/><circle cx="150" cy="30" r="4" fill="#FF9EAA"/></svg>';
  }

  function viewResult() {
    var r = state.lastResult, p = currentProfile();
    var head = r.score >= 8 ? 'Great job, ' : (r.score >= 5 ? 'Well done, ' : 'Keep going, ');
    var wrong = r.total - r.correct;
    return (r.score >= 8 ? confetti() : '') +
      '<div class="stack" style="align-items:center;gap:4px;padding-top:24px">' + mascot(p.gender, 154, r.score >= 5 ? 'party' : 'happy') +
      '<h1 class="title" style="font-size:34px;text-align:center">' + head + esc(p.name) + '!</h1><p class="subtitle">' + esc(r.title) + '</p></div>' +
      '<div class="panel stack" style="align-items:center;gap:12px"><span class="small" style="letter-spacing:1px;font-size:15px">YOUR SCORE</span>' +
      '<span class="score-big">' + fmtScore(r.score) + '<small>/10</small></span>' +
      '<span class="row" style="gap:10px;flex-wrap:wrap;justify-content:center"><span class="pill good">' + I.check + r.correct + ' correct</span>' +
      '<span class="pill bad">' + I.cross + wrong + ' wrong</span></span></div>' +
      '<div class="grow"></div>' +
      '<div class="stack">' +
      (wrong ? '<a class="btn coral" href="#/review">' + I.search + 'Review mistakes</a>' : '<p class="subtitle" style="text-align:center">Perfect! No mistakes to review.</p>') +
      '<div class="grid2"><button class="btn green" data-action="again">Try again</button><a class="btn" href="#/home">Home</a></div></div>';
  }

  function viewReview() {
    var r = state.lastResult;
    var cards = r.items.filter(function (it) { return it.picked !== it.q.answer; }).map(function (it) {
      var q = it.q, part = TYPE_ORDER.indexOf(q.type) + 1;
      var opts = q.options.map(function (o, k) {
        var cls = k === q.answer ? ' right' : (k === it.picked ? ' wrong' : '');
        var mark = k === q.answer ? I.check : (k === it.picked ? I.cross : '<span class="l">' + LETTERS[k] + '</span>');
        return '<span class="r-opt' + cls + '">' + mark + esc(o) + '</span>';
      }).join('');
      var chose = it.picked === null ? '<span style="color:#9A3412">No answer</span>' : '<span style="color:#9A3412">You chose: ' + LETTERS[it.picked] + '. ' + esc(q.options[it.picked]) + '</span>';
      var img = q.image ? '<span class="q-image" style="width:56px;height:56px;border-radius:16px;font-size:34px;flex-shrink:0">' + (isImageUrl(q.image) ? '<img src="' + esc(q.image) + '" alt="">' : esc(q.image)) + '</span>' : '';
      return '<div class="panel stack" style="gap:12px;padding:16px">' +
        '<span class="row spread"><span class="small" style="font-size:13px">Question ' + it.n + ' · Part ' + part + '</span><span class="pill bad" style="padding:2px 10px;font-size:13px">' + (it.picked === null ? 'Skipped' : 'Wrong') + '</span></span>' +
        '<div class="row">' + img + '<p class="q-text" style="font-size:22px;text-align:left">' + esc(q.text) + '</p></div>' +
        '<div class="grid2" style="gap:8px">' + opts + '</div>' +
        '<p style="font-size:15px">' + chose + ' · <span style="color:#1E5E36">Answer: ' + LETTERS[q.answer] + '. ' + esc(q.options[q.answer]) + '</span></p>' +
        (q.explanation ? '<div class="explain" lang="vi">' + I.bulb + '<p>' + esc(q.explanation) + '</p></div>' : '') +
        '</div>';
    }).join('');
    var count = r.total - r.correct;
    return '<div class="row" style="gap:14px">' + backBtn('result', 'Back to result') +
      '<div><h1 class="title" style="font-size:30px">Review mistakes</h1><p class="subtitle">' + count + ' question' + (count === 1 ? '' : 's') + ' to look at again</p></div></div>' +
      cards + '<a class="btn green" href="#/home">Back to home</a>';
  }

  /* ---------------- actions ---------------- */
  function startQuiz(mode, unit) {
    loadGrade(state.grade).then(function () {
      state.quiz = buildQuiz(mode, unit);
      go('quiz');
    });
  }

  function submitQuiz() {
    var z = state.quiz;
    var items = z.questions.map(function (q, k) { return { q: q, picked: z.answers[k], n: k + 1 }; });
    var correct = items.filter(function (it) { return it.picked === it.q.answer; }).length;
    var total = items.length;
    var score = total ? correct / total * 10 : 0;
    var key = z.mode === 'unit' ? 'unit-' + z.unit : z.mode;
    var prog = progressFor();
    if (prog[key] === undefined || score > prog[key]) prog[key] = Math.round(score * 10) / 10;
    save();
    state.lastResult = { title: z.title, mode: z.mode, unit: z.unit, items: items, correct: correct, total: total, score: score };
    state.quiz = null;
    play(score >= 8 ? 'great' : 'done');
    go('result');
  }

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    var a = el.getAttribute('data-action'), v = el.getAttribute('data-v');
    var z = state.quiz;
    switch (a) {
      case 'sound':
        state.muted = !state.muted; save(); play('tap'); render(); break;
      case 'reload':
        location.reload(); break;
      case 'manage':
        state.manage = !state.manage; render(); break;
      case 'pick-profile':
        play('tap'); state.profileId = el.getAttribute('data-id'); state.manage = false; save(); go('grades'); break;
      case 'del-profile': {
        var id = el.getAttribute('data-id');
        var p = state.profiles.filter(function (x) { return x.id === id; })[0];
        if (p && window.confirm('Delete profile "' + p.name + '"? Its scores will be removed.')) {
          state.profiles = state.profiles.filter(function (x) { return x.id !== id; });
          Object.keys(state.progress).forEach(function (k) { if (k.indexOf(id + ':') === 0) delete state.progress[k]; });
          if (state.profileId === id) state.profileId = null;
          if (!state.profiles.length) state.manage = false;
          save(); render();
        }
        break;
      }
      case 'gender':
        state.draft.name = app.querySelector('#pname').value; state.draft.gender = v; play('tap'); render(); break;
      case 'color':
        state.draft.name = app.querySelector('#pname').value; state.draft.color = v; play('tap'); render(); break;
      case 'pick-grade':
        play('tap'); state.grade = parseInt(v, 10); save(); go('home'); break;
      case 'tab':
        state.unitTab = parseInt(v, 10); play('tap'); render(); break;
      case 'start':
        play('tap'); startQuiz(el.getAttribute('data-mode'), parseInt(el.getAttribute('data-unit'), 10) || null); break;
      case 'answer':
        z.answers[z.index] = parseInt(v, 10); play('pick'); render(); break;
      case 'jump':
        z.index = parseInt(v, 10); render(); break;
      case 'prev':
        if (z.index > 0) { z.index--; render(); } break;
      case 'next':
        if (z.index < z.questions.length - 1) { z.index++; play('tap'); render(); } break;
      case 'submit': {
        var left = z.answers.filter(function (x) { return x === null; }).length;
        if (left && !window.confirm('You have ' + left + ' unanswered question' + (left === 1 ? '' : 's') + '. Submit anyway?')) break;
        submitQuiz();
        break;
      }
      case 'quit':
        if (window.confirm('Leave the test? Your answers will be lost.')) { state.quiz = null; go('home'); }
        break;
      case 'again': {
        var r = state.lastResult; play('tap'); startQuiz(r.mode, r.unit); break;
      }
    }
  });

  app.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.getAttribute('data-form') !== 'profile') return;
    e.preventDefault();
    var input = f.querySelector('#pname');
    var name = input.value.trim();
    var msg = f.querySelector('[data-msg]');
    if (!name) { msg.textContent = 'Please type your name.'; input.focus(); return; }
    if (state.profiles.length >= CFG.maxProfiles) { msg.textContent = 'This device already has ' + CFG.maxProfiles + ' profiles.'; return; }
    var p = { id: 'p' + Date.now().toString(36), name: name, gender: state.draft.gender, color: state.draft.color };
    state.profiles.push(p);
    state.profileId = p.id;
    state.draft = null;
    save();
    play('great');
    go('grades');
  });

  window.addEventListener('hashchange', function () {
    if (route() !== 'new-profile') state.draft = null;
    render();
  });

  render();
})();
