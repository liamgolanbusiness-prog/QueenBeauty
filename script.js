/* =========================================================
   QUEEN BEAUTY · BAT YAM
   Interactivity: scroll reveals, parallax, tilt cards,
   counters, mobile menu, smooth scroll, form
   ========================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- NAV scroll state -------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');

    const fab = document.getElementById('fabTop');
    if (window.scrollY > 600) fab.classList.add('is-visible');
    else fab.classList.remove('is-visible');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------- Mobile menu -------- */
  const burger = document.querySelector('.nav__burger');
  const menu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* -------- Smooth scroll w/ offset -------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* -------- Back to top -------- */
  document.getElementById('fabTop').addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  );

  /* -------- Reveal on scroll -------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* -------- Counters -------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 1600;
        const start = performance.now();
        const isFloat = el.parentElement.querySelector('.stat__suffix'); // 4.9 case
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          let current = target * eased;
          el.textContent = isFloat
            ? (current / 10).toFixed(1)  // 49 → 4.9
            : Math.floor(current).toLocaleString('en-US');
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = isFloat ? (target/10).toFixed(1) : target.toLocaleString('en-US');
        };
        if (!reduceMotion) requestAnimationFrame(tick);
        else el.textContent = isFloat ? (target/10).toFixed(1) : target.toLocaleString('en-US');
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => cio.observe(c));
  }

  /* -------- Parallax (hero crown + hero deco) -------- */
  if (!reduceMotion) {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        el.style.setProperty('--py', `${y * speed}px`);
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* -------- 3D Tilt on service cards -------- */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tiltEls = document.querySelectorAll('.tilt');
    tiltEls.forEach(el => {
      let raf;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (0.5 - y) * 8;
        const ry = (x - 0.5) * 10;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* -------- Booking form -------- */
  const form = document.getElementById('bookForm');
  if (form) {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const service = (data.get('service') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !phone || !service) {
        status.textContent = 'נא למלא שם, טלפון וסוג טיפול.';
        status.style.color = '#a4364c';
        return;
      }

      // Open WhatsApp with prefilled message
      const text = `שלום, אני ${name}.%0Aמעוניינת ב: ${service}.%0Aטלפון: ${phone}` +
                   (message ? `%0Aהודעה: ${message}` : '');
      const wa = `https://wa.me/972500000000?text=${text}`;
      status.style.color = 'var(--gold-2)';
      status.textContent = 'פותח/ת WhatsApp...';
      window.open(wa, '_blank', 'noopener');
      setTimeout(() => { status.textContent = 'הבקשה נשלחה — נחזור אלייך בקרוב!'; }, 800);
      form.reset();
    });
  }

  /* -------- Active nav link tracking -------- */
  const sections = ['about','services','why','gallery','reviews','contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = document.querySelectorAll('.nav__links a');
  if (sections.length && 'IntersectionObserver' in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => {
            if (a.getAttribute('href') === `#${id}`) a.style.color = 'var(--wine)';
            else a.style.color = '';
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => sio.observe(s));
  }

})();
