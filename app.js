(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ── Mode: system preference first, explicit choice wins. ─────── */
  const dot = document.getElementById('themeDot');
  const btn = document.getElementById('theme');
  const setTheme = t => {
    root.dataset.theme = t;
    dot.textContent = t === 'dark' ? '●' : '○';
    btn.setAttribute('aria-pressed', String(t === 'dark'));
  };
  // Ink is the brand's default surface, so dark leads regardless of the
  // visitor's system setting. An explicit toggle is still remembered.
  setTheme(localStorage.getItem('wa-theme') || 'dark');
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('wa-theme', next);
    setTheme(next);
  });

  /* ── Load sequence: hairline fills, then the page. Once a session. */
  const hairline = document.getElementById('hairline');
  const boot = () => {
    document.body.classList.replace('booting', 'booted');
    hairline.classList.add('done');
    typeOn();
    reveal();
  };
  if (reduce || sessionStorage.getItem('wa-booted')) {
    hairline.style.display = 'none';
    boot();
  } else {
    sessionStorage.setItem('wa-booted', '1');
    requestAnimationFrame(() => { hairline.style.transform = 'scaleX(1)'; });
    setTimeout(boot, 660);
  }

  /* ── Hero type-on: characters resolve left → right, ~760ms, once. */
  function typeOn() {
    const h = document.getElementById('typeon');
    if (!h || reduce || sessionStorage.getItem('wa-typed')) return;
    sessionStorage.setItem('wa-typed', '1');
    const text = h.textContent.trim().replace(/\s+/g, ' ');
    h.textContent = '';
    const step = 760 / text.length;
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch;
      if (ch === ' ') s.style.whiteSpace = 'pre';
      h.appendChild(s);
      setTimeout(() => s.classList.add('lit'), i * step);
    });
  }

  /* ── Section headings: split to words so they can rise out of a mask. */
  function splitWords() {
    document.querySelectorAll('.wr').forEach(h => {
      const words = h.textContent.trim().split(/\s+/);
      h.textContent = '';
      words.forEach((word, i) => {
        const outer = document.createElement('span');
        outer.className = 'w';
        const inner = document.createElement('span');
        inner.className = 'wi';
        inner.textContent = word;
        inner.style.transitionDelay = `${i * 40}ms`;
        outer.appendChild(inner);
        h.appendChild(outer);
        if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
      });
    });
  }

  /* ── Reveal on scroll: once per element, stagger via CSS delay. ── */
  function reveal() {
    splitWords();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    document.querySelectorAll('.rv, .wr, .shot').forEach(el => io.observe(el));
  }

  /* ── Smooth scroll: weighted, not floaty. ─────────────────────── */
  addEventListener('load', () => {
    const jump = () => document.querySelectorAll('a[href^="#"]').forEach(a =>
      a.addEventListener('click', e => {
        const el = document.querySelector(a.getAttribute('href'));
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }));

    if (reduce || typeof Lenis === 'undefined') return jump();

    const lenis = new Lenis({ lerp: 0.1, duration: 0.9 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(a =>
      a.addEventListener('click', e => {
        const el = document.querySelector(a.getAttribute('href'));
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -56 });
      }));
  });

  /* ── Cursor block: the brand mark, as the pointer. ────────────── */
  if (matchMedia('(pointer:fine)').matches && innerWidth >= 1024 && !reduce) {
    root.classList.add('has-cursor');
    const c = document.getElementById('cursor');
    // The figure leans against the pointer. Cursor-linked rather than
    // scroll-linked on purpose: scroll parallax is the move every SaaS hero
    // already makes, and this page already owns the pointer.
    const fig = document.querySelector('.figure img');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, sx = 1, fx = 0, fy = 0;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() {
      cx += (x - cx) * 0.28;
      cy += (y - cy) * 0.28;
      const target = c.classList.contains('on-text') ? 0.2 : 1;
      sx += (target - sx) * 0.25;
      c.style.transform =
        `translate3d(${(cx - 4).toFixed(1)}px, ${(cy - 9).toFixed(1)}px, 0) scaleX(${sx.toFixed(3)})`;

      if (fig) {
        fx += ((cx / innerWidth - 0.5) * -14 - fx) * 0.06;
        fy += ((cy / innerHeight - 0.5) * -9 - fy) * 0.06;
        fig.style.transform =
          `translate3d(${fx.toFixed(2)}px, ${fy.toFixed(2)}px, 0) scale(1.035)`;
      }
      requestAnimationFrame(loop);
    })();
    addEventListener('pointerover', e => {
      c.classList.toggle('on-link', !!e.target.closest('a, button'));
      c.classList.toggle('on-text', !!e.target.closest('input, textarea'));
    }, { passive: true });
  }

  /* ── A bare mailto: silently does nothing on a machine with no mail
     client, which is most work laptops — so the primary CTA could look
     broken. Copy the address too, and say so in the same mono confirmation
     grammar as [ sent ]. The mailto still fires for anyone who has a client. */
  document.querySelectorAll("a.mail").forEach(a => {
    a.addEventListener("click", () => {
      const addr = a.getAttribute("href").replace("mailto:", "");
      if (!navigator.clipboard) return;
      const label = a.textContent;
      navigator.clipboard.writeText(addr).then(() => {
        a.textContent = "[ copied — " + addr + " ]";
        setTimeout(() => { a.textContent = label; }, 2000);
      }).catch(() => {});
    });
  });

  /* ── Note: validate, press feedback, [ sent ] replaces the input. ─ */
  const form = document.getElementById('signup');
  if (!form) return;                                // inner pages have no note form
  const err  = document.getElementById('err');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      err.classList.remove('hidden');
      email.setAttribute('aria-invalid', 'true');
      email.focus();
      return;
    }
    // ponytail: no backend wired — POST to the list provider here.
    err.classList.add('hidden');
    form.classList.add('hidden');
    const sent = document.getElementById('sent');
    sent.classList.remove('hidden');
    sent.setAttribute('role', 'status');
  });
})();
