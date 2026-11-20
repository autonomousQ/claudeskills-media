/* claudeskills gallery: vanilla JS, no build step. Data: site/data.json (built by
   claudeskills/motion-graphics/scripts/build-gallery.py). Media: motion-graphics/<en|zh>/<id>.gif + posters/<id>.webp */
(() => {
  'use strict';
  const T = {
    en: {
      brand: 'CLAUDESKILLS · MOTION GRAPHICS', dark: 'Dark', light: 'Light', categories: 'Categories', skill: 'Agent entry: SKILL.md',
      github: 'claudeskills on GitHub', shotcraft: 'video-shotcraft (16:9 promos)', title: 'Motion Graphics Elements',
      lede: 'Agent-ready Remotion elements for 9:16 · 1080×1920 · 60 fps reels and shorts, inside IG Reels / YT Shorts safe zones. Hover a card to play its 3 s preview, select a few and copy a ready-made prompt for your agent.',
      statElements: 'Elements', stat3d: '3D (GPU)', statStyles: 'Styles', search: 'Search names, uses and descriptions…',
      empty: 'No elements match. Try another word or category.', clear: 'Clear', copyPrompt: 'Copy prompt',
      footer: 'Previews are 270×480 at 15 fps. 3D previews are rendered on an RTX GPU. Elements, docs and code:',
      all: 'All elements', styles: 'Styles (art directions)', allGroups: 'All', select: 'Select', copy: 'Copy', recipe: 'Skill file',
      noPreview: 'Preview pending', vertical: 'Vertical', gpu: '3D GPU', results: (n) => `${n} shown`, selected: (n) => `${n} selected`,
      copied: 'Copied', copiedPrompt: 'Prompt copied', other: 'switch to',
      prompt: (ids, skill) => `Use the motion-graphics skill in autonomousQ/claudeskills (start at ${skill}).\nMake a 9:16, 1080x1920, 60 fps piece that uses these elements, in this order unless the storyboard says otherwise:\n${ids.map((x) => `- ${x}`).join('\n')}\nFollow foundations/pipeline-framework.md: brief, storyboard for my sign-off, edit list, stills critique, then render (finals on the RTX desktop).`,
    },
    zh: {
      brand: 'CLAUDESKILLS · 動態圖形', dark: '深色', light: '淺色', categories: '分類', skill: 'AI 入口：SKILL.md',
      github: 'GitHub 上嘅 claudeskills', shotcraft: 'video-shotcraft（16:9 宣傳片）', title: '動態圖形元件',
      lede: '俾 AI 助手揸嘅 Remotion 元件：直幅 9:16 · 1080×1920 · 60 fps，避開 IG Reels／YT Shorts 上下 banner。滑過卡片睇 3 秒預覽，揀幾款再一撳複製現成提示詞俾你個 AI。',
      statElements: '元件', stat3d: '3D（GPU）', statStyles: '風格', search: '搵名、用途、描述…',
      empty: '冇元件啱。試吓第二個字或者分類。', clear: '清除', copyPrompt: '複製提示詞',
      footer: '預覽 270×480，15 fps。3D 預覽係用 RTX GPU 出。元件、文件同程式碼：',
      all: '全部元件', styles: '風格（美術方向）', allGroups: '全部', select: '揀', copy: '複製', recipe: '技能檔',
      noPreview: '預覽未出', vertical: '直排', gpu: '3D GPU', results: (n) => `顯示 ${n} 款`, selected: (n) => `揀咗 ${n} 款`,
      copied: '複製咗', copiedPrompt: '提示詞複製咗', other: '轉做',
      prompt: (ids, skill) => `用 autonomousQ/claudeskills 嘅 motion-graphics-zh 技能（由 ${skill} 開始）。\n做一條 9:16、1080x1920、60 fps 嘅片，用以下元件（除非分鏡另有安排，就跟呢個次序）：\n${ids.map((x) => `- ${x}`).join('\n')}\n跟 foundations/pipeline-framework.md：簡報、分鏡等我簽名、剪接表、靜止畫面評片，然後出片（成品喺 RTX 桌機出）。`,
    },
  };
  const $ = (s) => document.querySelector(s);
  const el = (tag, attrs = {}, kids = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (v !== false && v != null) n.setAttribute(k, v);
    }
    for (const c of [].concat(kids)) if (c) n.append(c);
    return n;
  };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  const hoverable = window.matchMedia('(hover: hover)').matches;

  let DATA = null;
  const params = new URLSearchParams(location.hash.slice(1));
  const state = {
    lang: params.get('lang') || store.get('cs-lang') || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'),
    cat: params.get('cat') || 'all', group: params.get('group') || '', q: params.get('q') || '', sel: new Set(),
  };
  if (!['en', 'zh'].includes(state.lang)) state.lang = 'en';
  const t = () => T[state.lang];
  const ed = () => DATA.editions[state.lang];
  const media = (id, kind) => kind === 'gif' ? `motion-graphics/${state.lang}/${id}.gif` : `motion-graphics/${state.lang}/posters/${id}.webp`;

  function syncHash() {
    const p = new URLSearchParams();
    if (state.lang !== 'en') p.set('lang', state.lang);
    if (state.cat !== 'all') p.set('cat', state.cat);
    if (state.group) p.set('group', state.group);
    if (state.q) p.set('q', state.q);
    const h = p.toString();
    history.replaceState(null, '', h ? `#${h}` : location.pathname);
  }

  function toast(msg) {
    const n = $('#toast'); n.textContent = msg; n.classList.add('show');
    clearTimeout(toast.tm); toast.tm = setTimeout(() => n.classList.remove('show'), 1400);
  }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const ta = el('textarea', {style: 'position:fixed;opacity:0'}); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toast(msg);
  }

  function applyI18n() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-HK' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((n) => { const v = t()[n.dataset.i18n]; if (typeof v === 'string') n.textContent = v; });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((n) => { n.placeholder = t()[n.dataset.i18nPlaceholder]; });
    $('#langLabel').textContent = state.lang === 'en' ? '繁中' : 'EN';
    $('#langBtn').setAttribute('aria-label', state.lang === 'en' ? 'Switch to Traditional Chinese (zh-HK) edition' : 'Switch to English edition');
    $('#skillLink').href = ed().skill;
    updateThemeLabel();
  }
  function isDark() {
    const t0 = document.documentElement.dataset.theme;
    return t0 ? t0 === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function updateThemeLabel() { $('#themeLabel').textContent = isDark() ? t().light : t().dark; }

  function renderNav() {
    const nav = $('#catNav'); nav.replaceChildren();
    const els = ed().elements;
    const item = (id, label, n) => el('button', {class: 'cat-link', 'aria-current': state.cat === id ? 'true' : 'false',
      onclick: () => { state.cat = id; state.group = ''; closeMenu(); render(); window.scrollTo({top: 0, behavior: 'smooth'}); }},
      [el('span', {text: label}), el('span', {class: 'n', text: String(n)})]);
    nav.append(item('all', t().all, els.length));
    for (const c of ed().categories) nav.append(item(c.id, c.label, c.count));
    nav.append(el('div', {class: 'cat-sep'}));
    nav.append(item('styles', t().styles, ed().styles.length));
  }

  function matches(e) {
    if (state.cat !== 'all' && e.cat !== state.cat) return false;
    if (state.group && e.group !== state.group) return false;
    if (!state.q) return true;
    const q = state.q.toLowerCase();
    return [e.id, e.title, e.desc, e.use, e.cat].some((s) => (s || '').toLowerCase().includes(q));
  }

  let io = null;
  function play(card, on) {
    const img = card.querySelector('img'); if (!img || !card.dataset.gif) return;
    const want = on ? card.dataset.gif : (card.dataset.poster || card.dataset.gif);
    if (img.getAttribute('src') !== want) img.src = want;
    card.classList.toggle('playing', on);
  }

  function card(e) {
    const selected = state.sel.has(e.id);
    const badges = el('div', {class: 'badges'}, [
      e.gpu ? el('span', {class: 'badge gpu', text: t().gpu}) : null,
      e.vertical ? el('span', {class: 'badge', text: t().vertical}) : null,
    ]);
    let mediaBox;
    if (e.gif) {
      const poster = e.poster ? media(e.id, 'poster') : media(e.id, 'gif');
      mediaBox = el('div', {class: 'media'}, [
        el('img', {src: poster, alt: `${e.title} preview`, loading: 'lazy', decoding: 'async', width: '270', height: '480'}), badges,
        el('span', {class: 'play', 'aria-hidden': 'true'}),
      ]);
    } else {
      mediaBox = el('div', {class: 'media'}, [el('div', {class: 'no-preview', text: t().noPreview}), badges]);
    }
    const node = el('article', {class: `card${selected ? ' is-selected' : ''}`, 'data-id': e.id}, [
      mediaBox,
      el('div', {class: 'card-body'}, [
        el('h2', {text: e.title}), el('div', {class: 'cid', text: e.id}), el('p', {text: e.desc || e.use}),
        el('div', {class: 'card-actions'}, [
          el('button', {class: 'act', 'aria-pressed': selected ? 'true' : 'false', 'aria-label': `${t().select} ${e.id}`, onclick: (ev) => toggleSel(e.id, ev.currentTarget)},
            [el('span', {class: 'box'}), el('span', {class: 'lbl', text: t().select})]),
          el('button', {class: 'act', 'aria-label': `${t().copy} ${e.id}`, onclick: () => copy(`${e.id}: ${e.title} (${e.md})`, `${t().copied}: ${e.id}`)},
            el('span', {class: 'lbl', text: t().copy})),
          el('a', {class: 'recipe', href: e.md, target: '_blank', rel: 'noopener', text: t().recipe}),
        ]),
      ]),
    ]);
    if (e.gif) {
      node.dataset.gif = media(e.id, 'gif');
      if (e.poster) node.dataset.poster = media(e.id, 'poster');
      if (hoverable) {
        node.addEventListener('mouseenter', () => play(node, true));
        node.addEventListener('mouseleave', () => play(node, false));
        node.addEventListener('focusin', () => play(node, true));
        node.addEventListener('focusout', () => play(node, false));
      } else if (io) io.observe(node);
    }
    return node;
  }

  function styleCard(s) {
    return el('article', {class: 'card style-card'}, el('div', {class: 'card-body'}, [
      el('h2', {text: s.title}), el('div', {class: 'cid', text: `styles/${s.id}.md`}), el('p', {text: s.desc}),
      el('div', {class: 'card-actions'}, [
        el('button', {class: 'act', onclick: () => copy(`${s.id}: ${s.md}`, `${t().copied}: ${s.id}`)}, el('span', {class: 'lbl', text: t().copy})),
        el('a', {class: 'recipe', href: s.md, target: '_blank', rel: 'noopener', text: t().recipe}),
      ]),
    ]));
  }

  function render() {
    renderNav();
    const grid = $('#grid');
    if (io) io.disconnect();
    io = hoverable ? null : new IntersectionObserver((ents) => ents.forEach((x) => play(x.target, x.intersectionRatio > 0.6)), {threshold: [0, 0.6]});
    const chips = $('#groupChips'); chips.replaceChildren();
    let list;
    if (state.cat === 'styles') {
      list = ed().styles.filter((s) => !state.q || [s.id, s.title, s.desc].some((v) => (v || '').toLowerCase().includes(state.q.toLowerCase())));
      grid.className = 'grid styles'; grid.replaceChildren(...list.map(styleCard));
    } else {
      if (state.cat === 'animated-text') {
        const groups = ed().groups;
        chips.append(el('button', {class: 'chip', 'aria-pressed': state.group ? 'false' : 'true', text: t().allGroups, onclick: () => { state.group = ''; render(); }}));
        for (const [g, label] of Object.entries(groups)) {
          chips.append(el('button', {class: 'chip', 'aria-pressed': state.group === g ? 'true' : 'false', text: label, onclick: () => { state.group = g; render(); }}));
        }
      }
      list = ed().elements.filter(matches);
      grid.className = 'grid'; grid.replaceChildren(...list.map(card));
    }
    $('#resultCount').textContent = t().results(list.length);
    $('#empty').hidden = list.length > 0;
    renderSel(); syncHash();
  }

  function toggleSel(id, btn) {
    if (state.sel.has(id)) state.sel.delete(id); else state.sel.add(id);
    const on = state.sel.has(id);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.closest('.card').classList.toggle('is-selected', on);
    renderSel();
  }
  function renderSel() {
    const n = state.sel.size;
    $('#selBar').hidden = n === 0;
    $('#selCount').textContent = t().selected(n);
  }

  function openMenu() { $('#sidebar').classList.add('open'); $('#scrim').hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true'); }
  function closeMenu() { $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }

  function init() {
    $('#statElements').textContent = ed().elements.length;
    $('#stat3d').textContent = ed().elements.filter((e) => e.gpu).length;
    $('#statStyles').textContent = ed().styles.length;
    const s = $('#search'); s.value = state.q;
    let tm; s.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { state.q = s.value.trim(); render(); }, 120); });
    document.addEventListener('keydown', (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); s.focus(); s.select(); }
      if (ev.key === 'Escape') { if (document.activeElement === s && s.value) { s.value = ''; state.q = ''; render(); } closeMenu(); }
    });
    $('#langBtn').addEventListener('click', () => {
      state.lang = state.lang === 'en' ? 'zh' : 'en'; store.set('cs-lang', state.lang); state.sel.clear(); applyI18n(); render();
    });
    $('#themeBtn').addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = next; store.set('cs-theme', next); updateThemeLabel();
    });
    $('#menuBtn').addEventListener('click', () => ($('#sidebar').classList.contains('open') ? closeMenu() : openMenu()));
    $('#scrim').addEventListener('click', closeMenu);
    $('#selClear').addEventListener('click', () => { state.sel.clear(); render(); });
    $('#selCopy').addEventListener('click', () => copy(t().prompt([...state.sel], ed().skill), t().copiedPrompt));
    applyI18n(); render();
  }

  fetch('site/data.json').then((r) => r.json()).then((d) => { DATA = d; init(); })
    .catch(() => { $('#grid').textContent = 'Could not load site/data.json.'; });
})();
