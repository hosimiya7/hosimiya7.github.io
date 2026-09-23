/* Every screen is readable without JavaScript (phone pairs still swipe natively). Native anchors keep scrolling free. */
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
  // Phone-width pairs scroll sideways; the step buttons follow the swipe and jump to a screen.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pairs = [...document.querySelectorAll('.pair-art')].map(art => {
    const row = art.querySelector('.screen-pair');
    const screens = [...row.children];
    const buttons = [...art.querySelectorAll('.pair-steps button')];
    const left = screen => screen.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft);
    const sync = () => {
      const max = row.scrollWidth - row.clientWidth;
      const index = max > 0 ? Math.round(row.scrollLeft / max * (screens.length - 1)) : 0;
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    };
    row.addEventListener('scroll', sync, { passive: true });
    buttons.forEach((button, i) => button.addEventListener('click', () => {
      row.scrollTo({ left: left(screens[i]), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }));
    return row;
  });
  // Once per visit, the first pair seen slides a little and back to show that it moves sideways.
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const nudge = new IntersectionObserver(entries => {
      const row = entries.find(entry => entry.isIntersecting)?.target;
      if (!row || row.scrollWidth <= row.clientWidth || row.scrollLeft > 0) return;
      nudge.disconnect();
      row.style.scrollSnapType = 'none';
      row.scrollTo({ left: 56, behavior: 'smooth' });
      setTimeout(() => {
        row.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(() => row.style.removeProperty('scroll-snap-type'), 500);
      }, 550);
    }, { threshold: 0.6 });
    pairs.forEach(row => nudge.observe(row));
  }
  // The hero conversation replays once over its screenshot. Without motion it stays the screenshot.
  const chat = document.querySelector('.chat-live');
  if (chat && 'IntersectionObserver' in window && !reduceMotion.matches) {
    const screen = chat.parentElement;
    const log = chat.querySelector('.chat-log');
    const [goodnight, reply, nextDay, morning, typing, remembered] = log.querySelectorAll('[data-step]');
    // A new message lands below the view and the log scrolls to it, as in the app.
    const step = (show, hide) => {
      show.classList.add('is-shown');
      if (hide) hide.classList.remove('is-shown');
      chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
    };
    // The log scrolls natively by wheel and touch; a mouse can also drag it like a finger.
    let drag = null;
    chat.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = { y: event.clientY, top: chat.scrollTop };
      chat.setPointerCapture(event.pointerId);
      chat.classList.add('is-dragging');
    });
    chat.addEventListener('pointermove', event => {
      if (drag) chat.scrollTop = drag.top - (event.clientY - drag.y);
    });
    const endDrag = () => { drag = null; chat.classList.remove('is-dragging'); };
    chat.addEventListener('pointerup', endDrag);
    chat.addEventListener('pointercancel', endDrag);
    const play = () => {
      screen.classList.add('chat-ready');
      chat.scrollTop = chat.scrollHeight;
      [[900, () => step(goodnight)], [1800, () => step(reply)], [3000, () => step(nextDay)],
        [3600, () => step(morning)], [4300, () => step(typing)], [5600, () => step(remembered, typing)],
        [6400, () => chat.classList.add('is-remembered')]].forEach(([ms, fn]) => setTimeout(fn, ms));
    };
    screen.querySelector('img').decode().catch(() => {}).then(() => {
      const start = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        start.disconnect();
        play();
      }, { threshold: 0.5 });
      start.observe(screen);
    });
  }
  // The last five characters before each line break or block end stay together, so a line never ends with a lone "す。".
  document.querySelectorAll('main p, main dd').forEach(block => {
    if (block.closest('.screen-image')) return;
    [...block.childNodes].forEach(node => {
      const next = node.nextSibling;
      if (node.nodeType !== Node.TEXT_NODE || (next && next.nodeName !== 'BR')) return;
      const text = node.data.trimEnd();
      if (text.length < 6) return;
      const tail = document.createElement('span');
      tail.className = 'nowrap';
      tail.textContent = text.slice(-5);
      node.data = text.slice(0, -5);
      block.insertBefore(tail, next);
    });
  });
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
