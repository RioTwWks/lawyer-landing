(() => {
  const header = document.querySelector('[data-header]');
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const menuIconOpen = document.querySelector('[data-icon-open]');
  const menuIconClose = document.querySelector('[data-icon-close]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImg = document.querySelector('[data-lightbox-img]');
  let lightboxSource = null;
  let lightboxClosing = false;

  const setMenuOpen = (open) => {
    if (!mobileNav || !menuBtn) return;
    mobileNav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('overflow-hidden', open);
    if (menuIconOpen) menuIconOpen.hidden = open;
    if (menuIconClose) menuIconClose.hidden = !open;
  };

  const fitLightboxSize = (naturalW, naturalH) => {
    const maxW = Math.min(window.innerWidth * 0.92, 1100);
    const maxH = window.innerHeight * 0.88;
    const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);
    const width = Math.max(1, naturalW * scale);
    const height = Math.max(1, naturalH * scale);
    return {
      width,
      height,
      left: (window.innerWidth - width) / 2,
      top: (window.innerHeight - height) / 2,
    };
  };

  const applyRect = (el, rect) => {
    el.style.top = `${rect.top}px`;
    el.style.left = `${rect.left}px`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
  };

  const openLightbox = (trigger) => {
    if (!lightbox || !lightboxImg || lightboxClosing) return;
    const sourceImg = trigger.querySelector('img');
    if (!sourceImg?.src) return;

    lightboxSource = trigger;
    trigger.classList.add('is-active');
    lightboxImg.src = sourceImg.currentSrc || sourceImg.src;
    lightboxImg.alt = sourceImg.alt || '';

    const start = sourceImg.getBoundingClientRect();
    lightbox.hidden = false;
    document.body.classList.add('overflow-hidden');
    applyRect(lightboxImg, start);

    const runOpen = () => {
      const nw = lightboxImg.naturalWidth || sourceImg.naturalWidth || start.width;
      const nh = lightboxImg.naturalHeight || sourceImg.naturalHeight || start.height;
      const end = fitLightboxSize(nw, nh);

      requestAnimationFrame(() => {
        lightbox.classList.add('is-open');
        if (reduceMotion) {
          applyRect(lightboxImg, end);
          return;
        }
        requestAnimationFrame(() => applyRect(lightboxImg, end));
      });
    };

    if (lightboxImg.complete && lightboxImg.naturalWidth) runOpen();
    else lightboxImg.addEventListener('load', runOpen, { once: true });
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImg || lightbox.hidden || lightboxClosing) return;
    lightboxClosing = true;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      lightbox.classList.remove('is-open');
      lightbox.hidden = true;
      lightboxImg.removeAttribute('src');
      lightboxImg.alt = '';
      lightboxImg.style.top = '';
      lightboxImg.style.left = '';
      lightboxImg.style.width = '';
      lightboxImg.style.height = '';
      lightboxSource?.classList.remove('is-active');
      lightboxSource?.focus({ preventScroll: true });
      lightboxSource = null;
      document.body.classList.remove('overflow-hidden');
      lightboxClosing = false;
    };

    const sourceImg = lightboxSource?.querySelector('img');
    const endRect = sourceImg?.getBoundingClientRect();

    lightbox.classList.remove('is-open');

    if (!endRect || reduceMotion) {
      finish();
      return;
    }

    applyRect(lightboxImg, endRect);

    const onEnd = (event) => {
      if (event.target !== lightboxImg) return;
      lightboxImg.removeEventListener('transitionend', onEnd);
      finish();
    };

    lightboxImg.addEventListener('transitionend', onEnd);
    window.setTimeout(finish, 500);
  };

  menuBtn?.addEventListener('click', () => {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (lightbox && !lightbox.hidden) {
      closeLightbox();
      return;
    }
    setMenuOpen(false);
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

  document.querySelectorAll('[data-lightbox-open]').forEach((btn) => {
    btn.addEventListener('click', () => openLightbox(btn));
  });

  lightbox?.querySelectorAll('[data-lightbox-close]').forEach((el) => {
    el.addEventListener('click', closeLightbox);
  });

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
