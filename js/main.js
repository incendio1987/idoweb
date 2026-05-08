/* ============================================
   IDOIA ESTEBAN — Diseño de Producción
   main.js — Shared JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Loader --- */
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 900);

  /* --- Poster strips: duplicate for infinite scroll --- */
  document.querySelectorAll('.poster-strip').forEach(s => {
    s.innerHTML += s.innerHTML;
  });

  /* --- Init modules --- */
  initFlipText();
  initBeforeAfter();
  initCircularMenu();
});


/* ============================================
   FLIP TEXT — Airport Board
   Smoother: wave delay, more scramble steps,
   mouseout reverts back
   ============================================ */
function initFlipText() {
  const flipEl = document.getElementById('flipText');
  const headerName = document.getElementById('headerName');
  if (!flipEl || !headerName) return;

  const origName = flipEl.dataset.original || 'idoia esteban';
  const altName  = flipEl.dataset.alt || 'diseño de producción';
  const alphabet = 'abcdefghijklmnñopqrstuvwxyzáéíóú·•–—';
  let showing = 'original'; // 'original' | 'alt' | 'animating'

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
    const maxLen = Math.max(flipEl.children.length, target.length);

    // Pad extra chars if needed
    while (flipEl.children.length < maxLen) {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = '\u00A0';
      s.style.opacity = '0';
      flipEl.appendChild(s);
      // Fade in
      requestAnimationFrame(() => { s.style.transition = 'opacity 0.3s'; s.style.opacity = '1'; });
    }

    const chars = flipEl.querySelectorAll('.char');
    let done = 0;

    chars.forEach((el, i) => {
      const tc = i < target.length ? target[i] : '';

      // Wave delay: smooth left-to-right cascade
      const delay = i * 30;
      // More scramble steps for smoother feel
      const scrambles = 4 + Math.floor(Math.random() * 5);
      const interval = 40; // faster interval for smoother look

      setTimeout(() => {
        let c = 0;
        const iv = setInterval(() => {
          if (c < scrambles) {
            // Random char with occasional hold on near-target chars
            const rndChar = alphabet[Math.floor(Math.random() * alphabet.length)];
            el.textContent = rndChar;
            el.classList.add('flipping');
            c++;
          } else {
            el.textContent = tc === ' ' ? '\u00A0' : tc;
            el.classList.remove('flipping');
            clearInterval(iv);
            done++;
            if (done >= maxLen) {
              // Remove extra chars smoothly
              while (flipEl.children.length > target.length) {
                const last = flipEl.lastChild;
                last.style.transition = 'opacity 0.2s';
                last.style.opacity = '0';
                setTimeout(() => last.remove(), 200);
              }
              if (cb) setTimeout(cb, 50);
            }
          }
        }, interval);
      }, delay);
    });
  }

  headerName.addEventListener('mouseenter', () => {
    if (showing === 'animating') return;
    if (showing === 'original') {
      showing = 'animating';
      flipTo(altName, () => { showing = 'alt'; });
    }
  });

  headerName.addEventListener('mouseleave', () => {
    if (showing === 'animating') {
      // Queue revert after current animation
      const waitForDone = setInterval(() => {
        if (showing === 'alt') {
          clearInterval(waitForDone);
          showing = 'animating';
          flipTo(origName, () => { showing = 'original'; });
        }
      }, 100);
      return;
    }
    if (showing === 'alt') {
      showing = 'animating';
      flipTo(origName, () => { showing = 'original'; });
    }
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
   - SVG rects for hover/active (proper rounded rectangles)
   - Text in UPPERCASE
   - Rotates clicked item to 12 o'clock (top)
   - Smooth everything
   ============================================ */
function initCircularMenu() {
  const svg = document.getElementById('menuSvg');
  const mg  = document.getElementById('menuGroup');
  const sp  = document.getElementById('submenuPanel');
  if (!svg || !mg || !sp) return;

  const MENU_DATA = window.IDOIA_MENU || {
    'películas': { items: [
      { label: 'peli 1', url: 'pages/pelicula.html?id=1' },
      { label: 'peli 2', url: 'pages/pelicula.html?id=2' },
      { label: 'peli 3', url: 'pages/pelicula.html?id=3' },
      { label: 'peli 4', url: 'pages/pelicula.html?id=4' },
    ]},
    'contacto': { items: [
      { label: 'email', url: 'mailto:idoia@ejemplo.com' },
      { label: 'instagram', url: '#' },
      { label: 'imdb', url: '#' },
    ]},
    'trabajos': { items: [
      { label: 'largometrajes', url: '#' },
      { label: 'series', url: '#' },
      { label: 'publicidad', url: '#' },
    ]},
    'sobre mí': { items: [
      { label: 'biografía', url: 'pages/sobre-mi.html' },
      { label: 'premios', url: 'pages/sobre-mi.html#premios' },
      { label: 'cv', url: 'pages/sobre-mi.html#cv' },
    ]},
    'proceso': { items: [
      { label: 'cómo trabajo', url: 'pages/proceso.html' },
      { label: 'bocetos', url: 'pages/proceso.html#bocetos' },
      { label: 'maquetas', url: 'pages/proceso.html#maquetas' },
    ]}
  };

  /*
    The SVG path goes CLOCKWISE starting from 9 o'clock (left, 270°).
    So on this path:
      0%   = 9 o'clock (left)
      25%  = 12 o'clock (top)
      50%  = 3 o'clock (right)
      75%  = 6 o'clock (bottom)
    
    We want clicked items to go to 12 o'clock = 25%.
  */
  const OFFSETS = [2, 20, 38, 56, 74]; // startOffset % for each item
  const TOP_PCT = 25; // 12 o'clock position on this CW path

  let activeMenu = null;
  let curAng = 0;
  let spinning = true;
  let menuItems = []; // Will hold references to text + rect groups

  // Build proper SVG groups with rect backgrounds
  buildMenuItems();

  function buildMenuItems() {
    const keys = Object.keys(MENU_DATA);
    const labels = ['PELÍCULAS', 'CONTACTO', 'TRABAJOS', 'SOBRE MÍ', 'PROCESO'];
    const dataKeys = ['películas', 'contacto', 'trabajos', 'sobre mí', 'proceso'];

    // Clear existing content in menuGroup
    mg.innerHTML = '';

    // We need a circular path for text
    // The path is already defined as #tp in the SVG

    keys.forEach((key, idx) => {
      const label = labels[idx] || key.toUpperCase();
      const offset = OFFSETS[idx];

      // Create text element
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
      textPath.setAttribute('href', '#tp');
      textPath.setAttribute('startOffset', offset + '%');
      textPath.textContent = label;
      textPath.setAttribute('data-menu', dataKeys[idx]);
      textPath.setAttribute('data-idx', idx);

      // Style
      const cs = getComputedStyle(document.documentElement);
      const menuFontSize = cs.getPropertyValue('--font-menu-size').trim() || '11px';
      const menuSpacing = cs.getPropertyValue('--font-menu-spacing').trim() || '3px';

      textPath.style.fontFamily = "'DM Mono', monospace";
      textPath.style.fontSize = menuFontSize;
      textPath.style.fontWeight = '500';
      textPath.style.letterSpacing = menuSpacing;
      textPath.style.fill = cs.getPropertyValue('--color-primary').trim();
      textPath.style.cursor = 'pointer';
      textPath.style.transition = 'fill 0.3s ease';

      textEl.appendChild(textPath);
      mg.appendChild(textEl);

      menuItems.push({
        textPath,
        textEl,
        key: dataKeys[idx],
        idx,
        offset,
        bgRect: null // will create on first hover measurement
      });
    });

    // After a frame, measure text positions and create background rects
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        menuItems.forEach(item => {
          createBgRect(item);
        });
        // Attach events
        attachMenuEvents();
      });
    });
  }

  function createBgRect(item) {
    try {
      const bbox = item.textPath.getBBox ? item.textPath.getBBox() :
                   item.textEl.getBBox();
      const pad = 6;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', bbox.x - pad);
      rect.setAttribute('y', bbox.y - pad + 1);
      rect.setAttribute('width', bbox.width + pad * 2);
      rect.setAttribute('height', bbox.height + pad * 2 - 2);
      rect.setAttribute('rx', 5);
      rect.setAttribute('ry', 5);
      rect.style.fill = 'transparent';
      rect.style.transition = 'fill 0.35s ease';
      rect.style.pointerEvents = 'none';

      // Insert rect before text so text is on top
      mg.insertBefore(rect, item.textEl);
      item.bgRect = rect;
    } catch (e) {
      // getBBox may fail if not rendered
    }
  }

  function attachMenuEvents() {
    menuItems.forEach(item => {
      const { textPath, textEl } = item;
      const cs = getComputedStyle(document.documentElement);
      const primaryColor = cs.getPropertyValue('--color-primary').trim();
      const whiteColor = cs.getPropertyValue('--color-white').trim();

      // Hover
      textEl.addEventListener('mouseenter', () => {
        if (item.key === activeMenu) return;
        if (item.bgRect) item.bgRect.style.fill = primaryColor;
        textPath.style.fill = whiteColor;
      });
      textEl.addEventListener('mouseleave', () => {
        if (item.key === activeMenu) return;
        if (item.bgRect) item.bgRect.style.fill = 'transparent';
        textPath.style.fill = primaryColor;
      });

      // Click
      textEl.addEventListener('click', (e) => {
        e.stopPropagation();
        handleMenuClick(item);
      });
      textPath.addEventListener('click', (e) => {
        e.stopPropagation();
        handleMenuClick(item);
      });
    });
  }

  function handleMenuClick(item) {
    const cs = getComputedStyle(document.documentElement);
    const primaryColor = cs.getPropertyValue('--color-primary').trim();
    const whiteColor = cs.getPropertyValue('--color-white').trim();

    if (activeMenu === item.key) {
      closeMenu();
      return;
    }

    // Stop spinning
    spinning = false;

    // Calculate rotation to bring item to 12 o'clock (TOP_PCT = 25%)
    const itemPct = OFFSETS[item.idx];
    const diffPct = TOP_PCT - itemPct;
    const targetDeg = (diffPct / 100) * 360;

    // Find shortest rotation from current angle
    let delta = targetDeg - curAng;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    const finalAngle = curAng + delta;

    // Animate rotation
    animateRotation(curAng, finalAngle, 1000, () => {
      curAng = finalAngle % 360;
      if (curAng < 0) curAng += 360;

      // Reset all items
      menuItems.forEach(mi => {
        mi.textPath.style.fill = primaryColor;
        if (mi.bgRect) mi.bgRect.style.fill = 'transparent';
      });

      // Set active
      item.textPath.style.fill = whiteColor;
      if (item.bgRect) item.bgRect.style.fill = primaryColor;
      activeMenu = item.key;

      // Rebuild bg rect at new position
      if (item.bgRect) {
        item.bgRect.remove();
        createBgRect(item);
        if (item.bgRect) item.bgRect.style.fill = primaryColor;
      }

      // Show submenu
      const data = MENU_DATA[item.key];
      if (data) {
        sp.innerHTML = data.items.map(
          it => `<a href="${it.url}">${it.label}</a>`
        ).join('');
        // Smooth open
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            sp.classList.add('open');
          });
        });
      }
    });
  }

  function closeMenu() {
    sp.classList.remove('open');
    const cs = getComputedStyle(document.documentElement);
    const primaryColor = cs.getPropertyValue('--color-primary').trim();
    menuItems.forEach(mi => {
      mi.textPath.style.fill = primaryColor;
      if (mi.bgRect) mi.bgRect.style.fill = 'transparent';
    });
    activeMenu = null;
    setTimeout(() => { spinning = true; }, 350);
  }

  // Click outside
  document.addEventListener('click', (e) => {
    if (activeMenu && !e.target.closest('#menuGroup') && !e.target.closest('.submenu-overlay')) {
      closeMenu();
    }
  });

  // --- Smooth rotation animation ---
  function animateRotation(from, to, duration, cb) {
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / duration, 1);
      // Smooth ease-in-out
      const ease = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const angle = from + (to - from) * ease;
      mg.setAttribute('transform', `rotate(${angle}, 300, 300)`);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        if (cb) cb();
      }
    })(performance.now());
  }

  // --- Continuous spin ---
  function spin() {
    if (spinning) {
      curAng = (curAng + 0.06) % 360;
      mg.setAttribute('transform', `rotate(${curAng}, 300, 300)`);
    }
    requestAnimationFrame(spin);
  }
  requestAnimationFrame(spin);
}
