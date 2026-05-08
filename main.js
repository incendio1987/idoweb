/* ============================================
   IDOIA ESTEBAN — Diseño de Producción
   Shared JavaScript — main.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ====== LOADER ====== */
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 900);
  }

  /* ====== POSTER STRIPS — duplicate for infinite loop ====== */
  document.querySelectorAll('.poster-strip').forEach(strip => {
    strip.innerHTML += strip.innerHTML;
  });

  /* ====== FLIP TEXT ====== */
  initFlipText();

  /* ====== BEFORE / AFTER ====== */
  initBeforeAfter();

  /* ====== CIRCULAR MENU ====== */
  initCircularMenu();
});

/* ==============================
   FLIP TEXT (Airport Board)
   ============================== */
function initFlipText() {
  const flipEl = document.getElementById('flipText');
  const headerName = document.getElementById('headerName');
  if (!flipEl || !headerName) return;

  const origName = flipEl.dataset.original || 'idoia esteban';
  const altName = flipEl.dataset.alt || 'diseño de producción';
  const alphabet = 'abcdefghijklmnñopqrstuvwxyzáéíóú';
  let isAlt = false;
  let flipBusy = false;

  // Wrap each character
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

  // Flip animation
  function flipTo(target, cb) {
    const maxLen = Math.max(flipEl.children.length, target.length);
    while (flipEl.children.length < maxLen) {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = '\u00A0';
      flipEl.appendChild(s);
    }
    let done = 0;
    flipEl.querySelectorAll('.char').forEach((el, i) => {
      const tc = i < target.length ? target[i] : '';
      const delay = i * 38 + Math.random() * 50;
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
              if (cb) cb();
            }
          }
        }, 50);
      }, delay);
    });
  }

  headerName.addEventListener('mouseenter', () => {
    if (flipBusy) return;
    flipBusy = true;
    flipTo(isAlt ? origName : altName, () => {
      isAlt = !isAlt;
      flipBusy = false;
    });
  });
}

/* ==============================
   BEFORE / AFTER
   ============================== */
function initBeforeAfter() {
  const slides = document.querySelectorAll('.ba-slide');
  if (slides.length < 2) return;

  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 3000);
}

/* ==============================
   CIRCULAR MENU
   ============================== */
function initCircularMenu() {
  const mg = document.getElementById('menuGroup');
  const mts = document.querySelectorAll('.menu-text');
  const sp = document.getElementById('submenuPanel');
  if (!mg || !mts.length || !sp) return;

  // Menu data — editable, will come from JSON in future
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

  const OFFSETS = [2, 18, 35, 53, 70];
  const TOP_POS = 75;

  let activeMenu = null;
  let curAng = 0;
  let spinning = true;

  // --- Hover: inverted rectangle effect ---
  function resetStyle(t) {
    t.style.fill = '';
    t.style.paintOrder = '';
    t.style.stroke = '';
    t.style.strokeWidth = '';
    t.style.strokeLinejoin = '';
  }

  function setActiveStyle(t) {
    t.style.fill = 'var(--color-white)';
    t.style.paintOrder = 'stroke';
    t.style.stroke = 'var(--color-primary)';
    t.style.strokeWidth = '9px';
    t.style.strokeLinejoin = 'round';
  }

  mts.forEach(t => {
    t.addEventListener('mouseenter', () => {
      if (t.classList.contains('active')) return;
      setActiveStyle(t);
    });
    t.addEventListener('mouseleave', () => {
      if (t.classList.contains('active')) return;
      resetStyle(t);
    });
  });

  // --- Spin animation ---
  function spin() {
    if (spinning) {
      curAng = (curAng + 0.08) % 360;
      mg.setAttribute('transform', `rotate(${curAng}, 300, 300)`);
    }
    requestAnimationFrame(spin);
  }
  requestAnimationFrame(spin);

  // --- Smooth rotation ---
  function animateRotation(from, to, duration, cb) {
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      mg.setAttribute('transform', `rotate(${from + (to - from) * ease}, 300, 300)`);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        if (cb) cb();
      }
    })(performance.now());
  }

  // --- Click: rotate to 12 and open submenu ---
  mts.forEach((t, idx) => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuKey = t.getAttribute('data-menu');

      if (activeMenu === menuKey) {
        closeMenu();
        return;
      }

      spinning = false;

      // Calculate target rotation
      const offsetPct = OFFSETS[idx];
      const targetDeg = ((TOP_POS - offsetPct) / 100) * 360;
      let delta = targetDeg - curAng;
      while (delta > 180) delta -= 360;
      while (delta < -180) delta += 360;
      const finalAngle = curAng + delta;

      // Animate
      animateRotation(curAng, finalAngle, 900, () => {
        curAng = finalAngle % 360;
        if (curAng < 0) curAng += 360;

        // Update active state
        mts.forEach(x => { x.classList.remove('active'); resetStyle(x); });
        t.classList.add('active');
        setActiveStyle(t);
        activeMenu = menuKey;

        // Show submenu
        const data = MENU_DATA[menuKey];
        if (data) {
          sp.innerHTML = data.items.map(
            it => `<a href="${it.url}">${it.label}</a>`
          ).join('');
          requestAnimationFrame(() => sp.classList.add('open'));
        }
      });
    });
  });

  function closeMenu() {
    sp.classList.remove('open');
    mts.forEach(x => { x.classList.remove('active'); resetStyle(x); });
    activeMenu = null;
    setTimeout(() => { spinning = true; }, 300);
  }

  // Click outside closes
  document.addEventListener('click', (e) => {
    if (activeMenu && !e.target.closest('.menu-text') && !e.target.closest('.submenu-overlay')) {
      closeMenu();
    }
  });
}
