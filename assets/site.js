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
  let active = -1;
  let frame = 0;
  let observer;

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
      voices.classList.toggle('is-resting', p >= .8);
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

  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pageshow', requestUpdate);
  addEventListener('load', requestUpdate);
  reduced.addEventListener('change', setupMotion);
  desktop.addEventListener('change', requestUpdate);
  // Any initialization failure must leave all reading content visible.
  try { setupMotion(); } catch (error) { revealAll(); console.error(error); }
})();
