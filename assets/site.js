/* Every screen is readable without JavaScript. Native anchors keep scrolling free. */
(() => {
  'use strict';
  const root = document.documentElement;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
    }, { rootMargin: '100px' });
    document.querySelectorAll('.hero, .feature, .cycle, .world').forEach(section => observer.observe(section));
    root.classList.add('motion-ready');
  }
  const syncVisibility = () => root.classList.toggle('page-hidden', document.hidden);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();
