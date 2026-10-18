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

  const casesTabsRoot = document.querySelector('[data-cases-tabs]');
  const casesPanel = document.querySelector('[data-cases-panel]');

  if (casesTabsRoot && casesPanel) {
    const tabButtons = Array.from(casesTabsRoot.querySelectorAll('[data-cases-filter]'));
    const caseCards = Array.from(casesPanel.querySelectorAll('[data-case-category]'));

    const applyCasesFilter = (category) => {
      caseCards.forEach((card) => {
        const match = card.getAttribute('data-case-category') === category;
        card.classList.toggle('is-hidden', !match);
        card.toggleAttribute('hidden', !match);
      });
    };

    const activateCasesTab = (button) => {
      const category = button.getAttribute('data-cases-filter');
      if (!category) return;

      tabButtons.forEach((tab) => {
        const isActive = tab === button;
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      const panelLabel = button.id;
      if (panelLabel) casesPanel.setAttribute('aria-labelledby', panelLabel);
      applyCasesFilter(category);
    };

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => activateCasesTab(button));
      button.addEventListener('keydown', (event) => {
        const index = tabButtons.indexOf(button);
        if (index < 0) return;

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          const next = tabButtons[(index + 1) % tabButtons.length];
          activateCasesTab(next);
          next.focus();
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          const prev = tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
          activateCasesTab(prev);
          prev.focus();
        }
      });
    });

    const defaultTab = tabButtons.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabButtons[0];
    if (defaultTab) activateCasesTab(defaultTab);
  }

  const portraitRoot = document.querySelector('[data-portrait-carousel]');
  if (portraitRoot) {
    const slides = Array.from(portraitRoot.querySelectorAll('[data-portrait-slide]'));
    const prevBtn = portraitRoot.querySelector('[data-portrait-prev]');
    const nextBtn = portraitRoot.querySelector('[data-portrait-next]');
    const dotsRoot = portraitRoot.querySelector('[data-portrait-dots]');
    let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (activeIndex < 0) activeIndex = 0;

    const renderPortraitDots = () => {
      if (!dotsRoot) return;
      dotsRoot.innerHTML = '';
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'portrait-carousel__dot';
        dot.setAttribute('aria-label', `Фото ${index + 1} из ${slides.length}`);
        if (index === activeIndex) dot.classList.add('is-active');
        dot.addEventListener('click', () => setPortraitSlide(index));
        dotsRoot.appendChild(dot);
      });
    };

    const setPortraitSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.toggleAttribute('hidden', !isActive);
      });
      dotsRoot?.querySelectorAll('.portrait-carousel__dot').forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    prevBtn?.addEventListener('click', () => setPortraitSlide(activeIndex - 1));
    nextBtn?.addEventListener('click', () => setPortraitSlide(activeIndex + 1));
    renderPortraitDots();
  }
})();
