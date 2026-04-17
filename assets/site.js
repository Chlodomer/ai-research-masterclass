/* AI for Research Master Class — site-wide behavior
   - Scroll-reveal for content cards (auto-tagged from known selectors)
   - Top scroll-progress bar
   - Respects prefers-reduced-motion and gracefully degrades. */

(function () {
  const doc = document.documentElement;
  if (!doc.classList.contains('js')) doc.classList.add('js');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const REVEAL_SELECTORS = [
    '.section',
    '.section-card',
    '.prompt-card',
    '.phase',
    '.info-box',
    '.info-bar',
    '.video-section',
    '.resources',
    '.overview',
    '.intro',
    '.gate',
    '.dates-banner',
    '.download-section',
    '.download-wrap',
    '.contents',
    '.title-bar',
    '.footer'
  ].join(',');

  function init() {
    const targets = Array.from(document.querySelectorAll(REVEAL_SELECTORS));
    targets.forEach(el => {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
    });

    if (!reduced && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      targets.forEach(t => io.observe(t));
    } else {
      targets.forEach(t => t.classList.add('is-visible'));
    }

    if (!reduced) {
      const bar = document.createElement('div');
      bar.className = 'scroll-progress';
      document.body.prepend(bar);
      const update = () => {
        const max = doc.scrollHeight - doc.clientHeight;
        const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
        bar.style.width = pct + '%';
      };
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
