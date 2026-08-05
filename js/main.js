(() => {
  const header = document.querySelector('[data-header]');
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const menuIconOpen = document.querySelector('[data-icon-open]');
  const menuIconClose = document.querySelector('[data-icon-close]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setMenuOpen = (open) => {
    if (!mobileNav || !menuBtn) return;
    mobileNav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('overflow-hidden', open);
    if (menuIconOpen) menuIconOpen.hidden = open;
    if (menuIconClose) menuIconClose.hidden = !open;
  };

  menuBtn?.addEventListener('click', () => {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  const syncHeader = () => {
    if (!header) return;
    const scrolled = window.scrollY > 12;
    header.classList.toggle('bg-navy-950/90', scrolled);
    header.classList.toggle('backdrop-blur-md', scrolled);
    header.classList.toggle('border-white/10', scrolled);
    if (scrolled) header.dataset.scrolled = '';
    else delete header.dataset.scrolled;
  };

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const headerOffset = header?.offsetHeight ?? 68;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.pushState(null, '', id);
    });
  });

  /* Reveal: staggered entrance for hero + future sections */
  const reveals = document.querySelectorAll('[data-reveal]');

  const showReveal = (el) => {
    const delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
    /* Line children inherit parent delay unless they set their own */
    el.querySelectorAll('.reveal-line:not([style*="--reveal-delay"])').forEach((line) => {
      if (delay) line.style.setProperty('--reveal-delay', `${delay}ms`);
    });
    el.classList.add('is-in');
  };

  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          showReveal(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    reveals.forEach((el) => {
      /* Hero starts immediately; rest wait for scroll */
      if (el.closest('[data-hero]')) {
        requestAnimationFrame(() => showReveal(el));
      } else {
        io.observe(el);
      }
    });
  } else {
    reveals.forEach((el) => showReveal(el));
  }

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
