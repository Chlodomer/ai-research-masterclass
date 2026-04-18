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

  const PAGES = [
    { href: 'index.html',          label: 'Home' },
    { href: 'context-brief.html',  label: 'Context Brief', children: [
      { href: 'demo-filled.html',  label: 'Filled Example' }
    ]},
    { href: 'workshop-guide.html', label: 'Workshop Guide' },
    { href: 'verification.html',   label: 'Verification Checklist' },
    { href: 'isf-reference.html',  label: 'ISF Proposal Structure' },
    { href: 'packet.html',         label: 'Workshop Packet' },
    { href: 'about.html',          label: 'About AI Initiatives' }
  ];

  function buildNav() {
    if (document.querySelector('.site-nav')) return;
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    function renderPage(p, depth) {
      const active = p.href === current || (current === '' && p.href === 'index.html');
      const classes = ['site-nav-item'];
      if (active) classes.push('is-active');
      if (depth > 0) classes.push('is-child');
      const ariaCurrent = active ? ' aria-current="page"' : '';
      const main = `<a class="${classes.join(' ')}" href="${p.href}"${ariaCurrent}>${p.label}</a>`;
      const kids = (p.children || []).map(c => renderPage(c, depth + 1)).join('');
      return main + kids;
    }
    const items = PAGES.map(p => renderPage(p, 0)).join('');

    const root = document.createElement('div');
    root.className = 'site-nav';
    root.innerHTML = `
      <button class="site-nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="siteNavPanel">
        <span class="nav-bar"></span><span class="nav-bar"></span><span class="nav-bar"></span>
      </button>
      <div class="site-nav-backdrop" aria-hidden="true"></div>
      <aside class="site-nav-panel" id="siteNavPanel" aria-label="Workshop pages" aria-hidden="true">
        <div class="site-nav-header">
          <div class="site-nav-eyebrow">AI for Research</div>
          <div class="site-nav-title">Workshop Pages</div>
        </div>
        <nav class="site-nav-list">${items}</nav>
      </aside>
    `;
    document.body.prepend(root);

    const toggle = root.querySelector('.site-nav-toggle');
    const backdrop = root.querySelector('.site-nav-backdrop');
    const panel = root.querySelector('.site-nav-panel');

    // Align the button's vertical center with the BIU header's center.
    // Headers vary in padding/size (landing is taller), so measure rather
    // than guess. Runs on initial layout only; if the user scrolls the
    // header away, the fixed button stays put.
    const header = document.querySelector('.biu-header') || document.querySelector('.header');
    if (header) {
      requestAnimationFrame(() => {
        const rect = header.getBoundingClientRect();
        const btnH = toggle.offsetHeight || 34;
        const top = Math.max(16, Math.round(rect.top + rect.height / 2 - btnH / 2));
        toggle.style.top = top + 'px';
      });
    }

    function setOpen(open) {
      root.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      doc.classList.toggle('nav-open', open);
    }
    toggle.addEventListener('click', () => setOpen(!root.classList.contains('is-open')));
    backdrop.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('is-open')) setOpen(false);
    });
  }

  function init() {
    buildNav();
    const targets = Array.from(document.querySelectorAll(REVEAL_SELECTORS));
    const viewportH = window.innerHeight;

    // Measure first (before mutating any styles) to avoid forced layout
    // thrashing. Anything already in the initial viewport is marked
    // visible in the same pass as [data-reveal] is applied, so the
    // browser batches styles and no fade-in fires. Only off-screen
    // elements animate as they scroll into view.
    const measurements = targets.map(el => {
      const rect = el.getBoundingClientRect();
      return [el, rect.top < viewportH && rect.bottom > 0];
    });
    const pending = [];
    measurements.forEach(([el, inViewport]) => {
      el.setAttribute('data-reveal', '');
      if (inViewport) {
        el.classList.add('is-visible');
      } else {
        pending.push(el);
      }
    });

    if (!reduced && 'IntersectionObserver' in window && pending.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      pending.forEach(t => io.observe(t));
    } else {
      pending.forEach(t => t.classList.add('is-visible'));
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
