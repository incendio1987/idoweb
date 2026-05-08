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

   Highlight: invisible thick arc segments behind text.
   On hover, the arc segment for that item lights up green,
   text goes white. Follows the circle curve perfectly.

   Click: rotates CLOCKWISE to 12 o'clock.
   ============================================ */
function initCircularMenu() {
  const svg = document.getElementById('menuSvg');
  const mg = document.getElementById('menuGroup');
  const sp = document.getElementById('submenuPanel');
  if (!svg || !mg || !sp) return;

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
  const OFFSETS = menuKeys.map((_, i) => (i * itemSpan) + 1);
  const TOP_PCT = 25;
  const R = 270; // radius of the text path
  const CX = 300, CY = 300; // center of SVG viewBox

  let activeMenu = null;
  let curAng = 0;
  let spinning = true;
  let animatingMenu = false;

  const primaryColor = getCSS('--color-primary') || '#1a5c2a';
  const whiteColor   = getCSS('--color-white') || '#f4f1ea';

  function getCSS(prop) {
    return getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
  }

  // --- Build text first, then measure and create tight arcs ---
  mg.innerHTML = '';
  const items = [];

  // Helper: convert percentage on the CW path to angle in degrees
  function pctToAngle(pct) {
    return 180 + (pct / 100) * 360;
  }

  // Helper: create an arc path for a segment of the circle
  function arcPath(startPct, endPct) {
    const a1 = pctToAngle(startPct) * Math.PI / 180;
    const a2 = pctToAngle(endPct) * Math.PI / 180;
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY + R * Math.sin(a1);
    const x2 = CX + R * Math.cos(a2);
    const y2 = CY + R * Math.sin(a2);
    const sweep = (endPct - startPct) > 50 ? 1 : 0;
    return `M ${x1},${y1} A ${R},${R} 0 ${sweep},1 ${x2},${y2}`;
  }

  // Step 1: Create all text elements
  const textEls = [];
  menuKeys.forEach((key, idx) => {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const tp = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
    tp.setAttribute('href', '#tp');
    tp.setAttribute('startOffset', OFFSETS[idx] + '%');
    tp.textContent = menuLabels[idx];

    tp.style.cssText = [
      "font-family: 'DM Mono', monospace",
      'font-size: var(--font-menu-size, 12px)',
      'font-weight: 500',
      'letter-spacing: var(--font-menu-spacing, 3px)',
      'fill: ' + primaryColor,
      'cursor: pointer',
      'transition: fill 0.35s ease'
    ].join('; ');

    textEl.appendChild(tp);
    mg.appendChild(textEl);
    textEls.push({ textEl, tp, key, idx });
  });

  // Step 2: After render, measure text widths and build tight arcs
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const circumference = 2 * Math.PI * R; // total path length in SVG units

      textEls.forEach(({ textEl, tp, key, idx }) => {
        // Measure text length in SVG units
        let textLen = 0;
        try {
          textLen = tp.getComputedTextLength ? tp.getComputedTextLength() : textEl.getComputedTextLength();
        } catch(e) {
          textLen = 60; // fallback
        }

        // Convert text length to percentage of circumference
        const textPct = (textLen / circumference) * 100;
        // Add small padding on each side (~1.2% of circle)
        const padPct = 1.2;
        const arcStart = OFFSETS[idx] - padPct;
        const arcEnd = OFFSETS[idx] + textPct + padPct;

        // Create arc
        const arcEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arcEl.setAttribute('d', arcPath(arcStart, arcEnd));
        arcEl.setAttribute('fill', 'none');
        arcEl.setAttribute('stroke', 'transparent');
        arcEl.setAttribute('stroke-width', '28');
        arcEl.setAttribute('stroke-linecap', 'round');
        arcEl.style.transition = 'stroke 0.35s ease';
        arcEl.style.pointerEvents = 'stroke';
        arcEl.style.cursor = 'pointer';

        // Insert arc BEFORE text so text renders on top
        mg.insertBefore(arcEl, textEl);

        items.push({ tp, textEl, arcEl, key, idx });
      });

      // Attach events after arcs are built
      attachEvents();
    });
  });

  // --- Events (called after arcs are built) ---
  function attachEvents() {
    items.forEach(item => {
      function onEnter() {
        if (item.key === activeMenu) return;
        item.arcEl.setAttribute('stroke', primaryColor);
        item.tp.style.fill = whiteColor;
      }
      function onLeave() {
        if (item.key === activeMenu) return;
        item.arcEl.setAttribute('stroke', 'transparent');
        item.tp.style.fill = primaryColor;
      }
      item.textEl.addEventListener('mouseenter', onEnter);
      item.textEl.addEventListener('mouseleave', onLeave);
      item.arcEl.addEventListener('mouseenter', onEnter);
      item.arcEl.addEventListener('mouseleave', onLeave);
      item.arcEl.addEventListener('click', (e) => { e.stopPropagation(); handleClick(item); });
      item.textEl.addEventListener('click', (e) => { e.stopPropagation(); handleClick(item); });
    });
  }

  function handleClick(item) {
    if (animatingMenu) return;
    if (activeMenu === item.key) { closeMenu(); return; }

    spinning = false;

    // Center of text in path percentage
    const textCenterPct = OFFSETS[item.idx] + 3;
    const diffPct = TOP_PCT - textCenterPct;
    // Convert to degrees
    let targetDeg = (diffPct / 100) * 360;

    // FORCE CLOCKWISE: delta must be positive (or zero)
    // Normalize targetDeg relative to curAng
    let delta = targetDeg - curAng;
    // Normalize to 0..360 range (always clockwise)
    while (delta < 0) delta += 360;
    // If delta is 0, no rotation needed
    if (delta > 359) delta = 0;

    animatingMenu = true;
    animateRotation(curAng, curAng + delta, 900, () => {
      curAng = (curAng + delta) % 360;
      animatingMenu = false;

      // Reset all
      items.forEach(mi => {
        mi.tp.style.fill = primaryColor;
        mi.arcEl.setAttribute('stroke', 'transparent');
      });
      // Active
      item.tp.style.fill = whiteColor;
      item.arcEl.setAttribute('stroke', primaryColor);
      activeMenu = item.key;

      // Submenu
      const data = MENU_DATA[item.key];
      if (data) {
        sp.innerHTML = data.items.map(it => `<a href="${it.url}">${it.label}</a>`).join('');
        requestAnimationFrame(() => sp.classList.add('open'));
      }
    });
  }

  function closeMenu() {
    sp.classList.remove('open');
    items.forEach(mi => {
      mi.tp.style.fill = primaryColor;
      mi.arcEl.setAttribute('stroke', 'transparent');
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

  // Continuous spin — CLOCKWISE (positive direction)
  (function spin() {
    if (spinning && !animatingMenu) {
      curAng = (curAng + 0.06) % 360;
      mg.setAttribute('transform', `rotate(${curAng}, 300, 300)`);
    }
    requestAnimationFrame(spin);
  })();
}
