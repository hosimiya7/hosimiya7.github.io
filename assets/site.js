(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 769px)');
  const hero = document.querySelector('.hero');
  const heroStage = document.querySelector('.hero-stage');
  const voices = document.querySelector('.voices');
  const voiceStage = document.querySelector('.voice-stage');
  const voiceWords = [...document.querySelectorAll('.voice-list li')];
  const voiceWindows = voiceWords.map(el => [Number(el.dataset.in), Number(el.dataset.out)]);
  const features = [...document.querySelectorAll('.feature')];
  const phones = [...document.querySelectorAll('.stage-phone')];
  const steps = [...document.querySelectorAll('.stage-steps span')];
  const photos = [...document.querySelectorAll('[data-parallax]')];
  const reveals = [...document.querySelectorAll('[data-p], .voice-center')];
  const clamp = n => Math.max(0, Math.min(1, n));
  const REST_P = .8;
  const REST_LOCK_MS = 2200;
  let active = -1;
  let frame = 0;
  let observer;
  let prevVoiceP = null;
  let voiceLocked = false;
  let navigating = false;
  let navTimer = 0;
  let glideFrame = 0;

  // In-page links (header, CTA) scroll smoothly through the voices. The rest
  // lock is for someone reading along, so it stays off until the jump settles.
  function holdNavigation() {
    navigating = true;
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { navigating = false; }, 250);
  }

  // A long smooth scroll crawls through the pinned evening and reads as a pause.
  // Far links jump to just short of the target and glide only the last stretch.
  // The glide is stepped by hand: starting the browser's smooth scroll right
  // after a jump paints a blank band at the top for a few frames in Chrome.
  function glideTo(target) {
    const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const goal = Math.max(0, Math.min(target.getBoundingClientRect().top + scrollY - pad, root.scrollHeight - innerHeight));
    const from = Math.max(0, goal > scrollY ? goal - innerHeight * .35 : goal + innerHeight * .35);
    const start = performance.now();
    stopGlide();
    root.style.scrollBehavior = 'auto';
    const step = now => {
      const t = Math.min(1, (now - start) / 420);
      holdNavigation();
      scrollTo(0, from + (goal - from) * (1 - (1 - t) ** 3));
      glideFrame = t < 1 ? requestAnimationFrame(step) : 0;
      if (!glideFrame) root.style.scrollBehavior = '';
    };
    step(start);
  }

  // Any wheel, touch or key input hands the scroll straight back to the reader.
  function stopGlide() {
    if (!glideFrame) return;
    cancelAnimationFrame(glideFrame);
    glideFrame = 0;
    root.style.scrollBehavior = '';
  }

  // Holds the page still just long enough for the closing line to finish
  // fading in, so a fast scroll (or trackpad momentum) can't carry the
  // reader past it unseen. Pinning body in place (rather than trying to
  // preventDefault every wheel/touch event) also stops scroll-behavior:
  // smooth's own in-flight animation, which a per-event block cannot.
  function lockVoiceRest() {
    if (voiceLocked) return;
    voiceLocked = true;
    const y = scrollY;
    const prevOverflow = root.style.overflow;
    const body = document.body.style;
    const prevBody = { position: body.position, top: body.top, left: body.left, right: body.right, width: body.width };
    root.style.overflow = 'hidden';
    body.position = 'fixed';
    body.top = `-${y}px`;
    body.left = '0';
    body.right = '0';
    body.width = '100%';
    setTimeout(() => {
      root.style.overflow = prevOverflow;
      body.position = prevBody.position;
      body.top = prevBody.top;
      body.left = prevBody.left;
      body.right = prevBody.right;
      body.width = prevBody.width;
      // Restore the scroll position instantly -- root's own scroll-behavior:
      // smooth would otherwise animate this jump and re-trigger the lock
      // partway through it.
      const prevScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      scrollTo(0, y);
      root.style.scrollBehavior = prevScrollBehavior;
      voiceLocked = false;
      requestUpdate();
    }, REST_LOCK_MS);
  }

  function revealAll() {
    root.classList.remove('motion');
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  function setupMotion() {
    if (observer) observer.disconnect();
    if (reduced.matches || !('IntersectionObserver' in window)) {
      revealAll();
    } else {
      root.classList.add('motion');
      observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          target.classList.add('is-visible');
          observer.unobserve(target);
        });
      }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
      reveals.forEach(el => {
        const shift = Number(el.dataset.shift || 0);
        el.style.setProperty('--reveal-delay', `${Math.min(shift * 900, 140)}ms`);
        observer.observe(el);
      });
    }
    requestUpdate();
  }

  function update() {
    frame = 0;
    const vh = innerHeight;
    const scrollable = root.scrollHeight - vh;
    root.style.setProperty('--page-progress', scrollable > 0 ? clamp(scrollY / scrollable).toFixed(4) : 0);
    if (reduced.matches) return;
    // Collect geometry first; write visual state only after all reads.
    const heroRect = heroStage.getBoundingClientRect();
    const voiceRect = voices.getBoundingClientRect();
    const voiceStageHeight = voiceStage.offsetHeight;
    const photoRects = photos.map(el => el.getBoundingClientRect());
    const featureRects = desktop.matches ? features.map(el => el.getBoundingClientRect()) : [];
    hero.style.setProperty('--hero-progress', clamp(-heroRect.top / Math.max(1, heroRect.height - vh)).toFixed(4));
    if (voiceRect.top < vh && voiceRect.bottom > 0) {
      // Progress runs only while the stage is pinned, so scroll distance reads as time.
      const p = clamp(-voiceRect.top / Math.max(1, voiceRect.height - voiceStageHeight));
      voices.style.setProperty('--voice-progress', p.toFixed(4));
      voiceWords.forEach((el, i) => {
        const [start, end] = voiceWindows[i];
        el.classList.toggle('is-on', p >= start && p < end);
        el.classList.toggle('is-past', p >= end);
      });
      voices.classList.toggle('is-resting', p >= REST_P);
      if (p >= REST_P && prevVoiceP !== null && prevVoiceP < REST_P && !navigating) lockVoiceRest();
      prevVoiceP = p;
    }
    photos.forEach((el, i) => {
      const rect = photoRects[i];
      if (rect.top < vh && rect.bottom > 0) el.style.setProperty('--photo-progress', clamp((vh - rect.top) / (vh + rect.height)).toFixed(4));
    });
    if (featureRects.length) {
      let nearest = 0;
      let distance = Infinity;
      featureRects.forEach((rect, i) => {
        const d = Math.abs(rect.top + rect.height / 2 - vh / 2);
        if (d < distance) { nearest = i; distance = d; }
      });
      if (active !== nearest) {
        active = nearest;
        phones.forEach((el, i) => {
          el.classList.toggle('is-active', i === active);
          el.setAttribute('aria-hidden', String(i !== active));
        });
        steps.forEach((el, i) => el.classList.toggle('is-active', i === active));
      }
    }
  }

  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    holdNavigation();
    const target = link.hash.length > 1 && document.getElementById(link.hash.slice(1));
    // Short hops, reduced motion and modified clicks keep the browser's own behavior.
    if (!target || reduced.matches || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (Math.abs(target.getBoundingClientRect().top) < innerHeight * 1.5) return;
    e.preventDefault();
    history.pushState(null, '', link.hash);
    glideTo(target);
    if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
  });
  ['wheel', 'touchstart', 'keydown'].forEach(type => addEventListener(type, stopGlide, { passive: true }));
  addEventListener('scroll', () => { if (navigating) holdNavigation(); requestUpdate(); }, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pageshow', requestUpdate);
  addEventListener('load', requestUpdate);
  reduced.addEventListener('change', setupMotion);
  desktop.addEventListener('change', requestUpdate);
  // Any initialization failure must leave all reading content visible.
  try { setupMotion(); } catch (error) { revealAll(); console.error(error); }
})();
