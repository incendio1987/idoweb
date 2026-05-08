/* ============================================
   IDOIA ESTEBAN — Diseño de Producción
   main.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 900);

  document.querySelectorAll('.poster-strip').forEach(s => {
    s.innerHTML += s.innerHTML;
  });

  initFlipText();
  initBeforeAfter();
  initCircularMenu();
});

/* ============================================
   FLIP TEXT — no setInterval polling, no freeze
   ============================================ */
function initFlipText() {
  const flipEl = document.getElementById('flipText');
  const headerName = document.getElementById('headerName');
  if (!flipEl || !headerName) return;

  const origName = flipEl.dataset.original || 'idoia esteban';
  const altName  = flipEl.dataset.alt || 'diseño de producción';
  const alphabet = 'abcdefghijklmnñopqrstuvwxyz';
  let busy = false;
  let pendingTarget = null;
  let isShowingAlt = false;

  function wrapChars(text) {
    flipEl.innerHTML = '';
    for (const c of text) {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = c === ' ' ? '\u00A0' : c;
      flipEl.appendChild(s);
    }
  }
  wrapChars(origName);

  function flipTo(target, cb) {
    busy = true;
    const maxLen = Math.max(flipEl.children.length, target.length);
    while (flipEl.children.length < maxLen) {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = '\u00A0';
      flipEl.appendChild(s);
    }
    let done = 0;
    const chars = Array.from(flipEl.querySelectorAll('.char'));
    chars.forEach((el, i) => {
      const tc = i < target.length ? target[i] : '';
      const delay = i * 28;
      const scrambles = 3 + Math.floor(Math.random() * 3);
      setTimeout(() => {
        let c = 0;
        const iv = setInterval(() => {
          if (c < scrambles) {
            el.textContent = alphabet[Math.floor(Math.random() * alphabet.length)];
            el.classList.add('flipping');
            c++;
          } else {
            el.textContent = tc === ' ' ? '\u00A0' : tc;
            el.classList.remove('flipping');
            clearInterval(iv);
            done++;
            if (done >= maxLen) {
              while (flipEl.children.length > target.length)
                flipEl.removeChild(flipEl.lastChild);
              busy = false;
              if (cb) cb();
              if (pendingTarget !== null) {
                const pt = pendingTarget;
                pendingTarget = null;
                flipTo(pt, () => { isShowingAlt = (pt === altName); });
              }
            }
          }
        }, 45);
      }, delay);
    });
  }

  headerName.addEventListener('mouseenter', () => {
    if (isShowingAlt && !busy) return;
    if (busy) { pendingTarget = altName; return; }
    flipTo(altName, () => { isShowingAlt = true; });
  });

  headerName.addEventListener('mouseleave', () => {
    if (!isShowingAlt && !busy) return;
    if (busy) { pendingTarget = origName; return; }
    flipTo(origName, () => { isShowingAlt = false; });
  });
}

/* ============================================
   BEFORE / AFTER
   ============================================ */
function initBeforeAfter() {
  const slides = document.querySelectorAll('.ba-slide');
  if (slides.length < 2) return;
  let cur = 0;
  setInterval(() => {
    slides[cur].classList.remove('active');
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add('active');
  }, 3000);
}

/* ============================================
   CIRCULAR MENU

   SVG path #tp: CW from 9 o'clock
     0%=left  25%=top  50%=right  75%=bottom

   Highlight: paintOrder stroke trick on textPath
   (thick stroke behind text = curved "rectangle")

   Submenu opens BELOW the top of circle area.
   ============================================ */
function initCircularMenu() {
  const mg = document.getElementById('menuGroup');
  const sp = document.getElementById('submenuPanel');
  if (!mg || !sp) return;

  const MENU_DATA = window.IDOIA_MENU || {
    'películas':  { items: [{label:'peli 1',url:'pages/pelicula.html?id=1'},{label:'peli 2',url:'pages/pelicula.html?id=2'},{label:'peli 3',url:'pages/pelicula.html?id=3'},{label:'peli 4',url:'pages/pelicula.html?id=4'}] },
    'contacto':   { items: [{label:'email',url:'mailto:idoia@ejemplo.com'},{label:'instagram',url:'#'},{label:'imdb',url:'#'}] },
    'trabajos':   { items: [{label:'largometrajes',url:'#'},{label:'series',url:'#'},{label:'publicidad',url:'#'}] },
    'galardones': { items: [{label:'premios',url:'#'},{label:'nominaciones',url:'#'},{label:'festivales',url:'#'}] },
    'sobre mí':   { items: [{label:'biografía',url:'pages/sobre-mi.html'},{label:'cv',url:'pages/sobre-mi.html#cv'}] },
    'proceso':    { items: [{label:'cómo trabajo',url:'pages/proceso.html'},{label:'bocetos',url:'pages/proceso.html#bocetos'},{label:'maquetas',url:'pages/proceso.html#maquetas'}] }
  };

  const menuKeys   = Object.keys(MENU_DATA);
  const menuLabels = ['PELÍCULAS','CONTACTO','TRABAJOS','GALARDONES','SOBRE MÍ','PROCESO'];
  const N = menuKeys.length;
  const itemSpan = 100 / N;
  // Center each label roughly in its segment
  const OFFSETS = menuKeys.map((_, i) => (i * itemSpan) + 1);
  const TOP_PCT = 25;

  let activeMenu = null;
  let curAng = 0;
  let spinning = true;
  let animatingMenu = false;

  const primaryColor = getCSS('--color-primary') || '#1a5c2a';
  const whiteColor   = getCSS('--color-white') || '#f4f1ea';

  function getCSS(prop) {
    return getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
  }

  // Build text elements
  mg.innerHTML = '';
  const items = [];

  menuKeys.forEach((key, idx) => {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const tp = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
    tp.setAttribute('href', '#tp');
    tp.setAttribute('startOffset', OFFSETS[idx] + '%');
    tp.textContent = menuLabels[idx];

    tp.style.cssText = [
      "font-family: 'DM Mono', monospace",
      'font-size: var(--font-menu-size, 11px)',
      'font-weight: 500',
      'letter-spacing: var(--font-menu-spacing, 3px)',
      'fill: ' + primaryColor,
      'cursor: pointer',
      'paint-order: stroke',
      'stroke: transparent',
      'stroke-width: 20px',
      'stroke-linejoin: round',
      'stroke-linecap: round',
      'transition: fill 0.35s ease, stroke 0.35s ease'
    ].join('; ');

    textEl.appendChild(tp);
    mg.appendChild(textEl);
    items.push({ tp, textEl, key, idx });
  });

  // Hover
  items.forEach(item => {
    item.textEl.addEventListener('mouseenter', () => {
      if (item.key === activeMenu) return;
      item.tp.style.fill = whiteColor;
      item.tp.style.stroke = primaryColor;
    });
    item.textEl.addEventListener('mouseleave', () => {
      if (item.key === activeMenu) return;
      item.tp.style.fill = primaryColor;
      item.tp.style.stroke = 'transparent';
    });
  });

  // Click
  items.forEach(item => {
    item.textEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (animatingMenu) return;
      if (activeMenu === item.key) { closeMenu(); return; }

      spinning = false;

      // Center of text ~ offset + ~3% (half a label width)
      const textCenterPct = OFFSETS[item.idx] + 3;
      const diffPct = TOP_PCT - textCenterPct;
      const targetDeg = (diffPct / 100) * 360;

      let delta = targetDeg - curAng;
      while (delta > 180) delta -= 360;
      while (delta < -180) delta += 360;

      animatingMenu = true;
      animateRotation(curAng, curAng + delta, 900, () => {
        curAng = (curAng + delta) % 360;
        if (curAng < 0) curAng += 360;
        animatingMenu = false;

        // Reset all
        items.forEach(mi => {
          mi.tp.style.fill = primaryColor;
          mi.tp.style.stroke = 'transparent';
        });
        // Active
        item.tp.style.fill = whiteColor;
        item.tp.style.stroke = primaryColor;
        activeMenu = item.key;

        // Submenu
        const data = MENU_DATA[item.key];
        if (data) {
          sp.innerHTML = data.items.map(it => `<a href="${it.url}">${it.label}</a>`).join('');
          requestAnimationFrame(() => sp.classList.add('open'));
        }
      });
    });
  });

  function closeMenu() {
    sp.classList.remove('open');
    items.forEach(mi => {
      mi.tp.style.fill = primaryColor;
      mi.tp.style.stroke = 'transparent';
    });
    activeMenu = null;
    setTimeout(() => { spinning = true; }, 300);
  }

  document.addEventListener('click', (e) => {
    if (activeMenu && !e.target.closest('#menuGroup') && !e.target.closest('.submenu-overlay'))
      closeMenu();
  });

  function animateRotation(from, to, dur, cb) {
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
      mg.setAttribute('transform', `rotate(${from+(to-from)*ease}, 300, 300)`);
      if (t < 1) requestAnimationFrame(step); else if (cb) cb();
    })(performance.now());
  }

  (function spin() {
    if (spinning && !animatingMenu) {
      curAng = (curAng + 0.06) % 360;
      mg.setAttribute('transform', `rotate(${curAng}, 300, 300)`);
    }
    requestAnimationFrame(spin);
  })();
}
