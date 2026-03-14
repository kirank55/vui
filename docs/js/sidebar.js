/**
 * sidebar.js — <docs-sidebar> Web Component.
 *
 * Renders the shared navigation sidebar for all docs pages.
 * Automatically highlights the link that matches the current URL.
 *
 * Usage in HTML:
 *   <docs-sidebar base-path="../"></docs-sidebar>
 *
 * The `base-path` attribute is prepended to every nav link
 * so the sidebar works from any directory depth.
 */

/** Navigation groups shown in the sidebar. */
const NAV_GROUPS = [
  {
    label: 'Overview',
    href: '',
    links: [
      { href: '', label: 'Project Overview' },
    ],
  },
  {
    label: 'Icons',
    links: [
      // { href: 'icons/', label: 'Icons' },
    ],
  },
  {
    label: 'Components',
    links: [
      { href: 'accordion/', label: 'Accordion' },
      { href: 'alert/', label: 'Alerts' },
      { href: 'avatar/', label: 'Avatar' },
      { href: 'badge/', label: 'Badge' },
      { href: 'breadcrumb/', label: 'Breadcrumb' },
      { href: 'button/', label: 'Button' },
      { href: 'cards/', label: 'Cards' },
      { href: 'checkbox/', label: 'Checkbox' },
      { href: 'divider/', label: 'Divider' },
      { href: 'dropdown/', label: 'Dropdown' },
      { href: 'form/', label: 'Form Controls' },
      { href: 'input-group/', label: 'Input Group' },
      { href: 'kbd/', label: 'Kbd' },
      { href: 'modal/', label: 'Modal' },
      { href: 'pagination/', label: 'Pagination' },
      { href: 'progress/', label: 'Progress' },
      { href: 'radio/', label: 'Radio Buttons' },
      { href: 'sidebar/', label: 'Sidebar' },
      { href: 'skeleton/', label: 'Skeleton' },
      { href: 'spinner/', label: 'Spinner' },
      { href: 'stepper/', label: 'Stepper' },
      { href: 'switch/', label: 'Switch' },
      { href: 'table/', label: 'Table' },
      { href: 'tag/', label: 'Tag' },
      { href: 'tabs/', label: 'Tabs' },
      { href: 'timeline/', label: 'Timeline' },
      { href: 'tooltip/', label: 'Tooltip' },
    ],
  },
];

function normalizeDocsPath(path) {
  const normalized = path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '');

  if (normalized === 'index.html' || normalized === '') {
    return '';
  }

  if (normalized.endsWith('/index.html')) {
    return normalized.slice(0, -'index.html'.length);
  }

  return normalized;
}

class DocsSidebar extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute('base-path') || '';
    const currentPath = normalizeDocsPath(
      location.pathname.replace(/^.*\/docs\//, '') || 'index.html'
    );

    const linksHtml = NAV_GROUPS.map(group => {
      const groupLabel = `  <div class="docs-nav-label">${group.label}</div>`;
      const groupLinks = group.links.map(link => {
        const href = basePath + link.href;
        const linkPath = normalizeDocsPath(link.href);

        // Mark the current page as active for screen readers and styling
        const isActive = currentPath === linkPath;
        const activeAttr = isActive ? ' aria-current="page"' : '';

        return `    <a href="${href}" class="docs-nav-link"${activeAttr}>${link.label}</a>`;
      }).join('\n');

      return `${groupLabel}\n${groupLinks}`;
    }).join('\n');

    this.innerHTML =
      '<div class="docs-topbar">\n' +
      '  <button class="docs-sidebar-toggle" type="button" aria-label="Open navigation" aria-expanded="false">' +
      '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
      '  </button>\n' +
      `  <a href="/" class="docs-sidebar-brand">\n` +
      `    <img src="/assets/logo.svg" alt="VUI logo" width="21" height="21" class="docs-sidebar-logo">\n` +
      `    <span>vui</span>\n` +
      `  </a>\n` +
      '  <div class="docs-sidebar-actions">\n' +
      '    <button class="docs-theme-toggle" id="theme-toggle" type="button" aria-label="Toggle dark mode">\n' +
      '      <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>\n' +
      '      <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>\n' +
      '    </button>\n' +
      '    <a href="https://github.com/kirank55/vui" class="vui-btn vui-btn--primary vui-btn--sm" target="_blank" rel="noreferrer">\n' +
      '      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right:6px"><path d="M8 .2a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 8 .2z"/></svg>\n' +
      '      Star on GitHub\n' +
      '    </a>\n' +
      '  </div>\n' +
      '</div>\n' +
      '<div class="docs-sidebar-overlay" aria-hidden="true"></div>\n' +
      '<nav class="docs-sidebar" aria-label="Documentation navigation">\n' +
      linksHtml + '\n' +
      '</nav>';

    const toggle = this.querySelector('.docs-sidebar-toggle');
    const overlay = this.querySelector('.docs-sidebar-overlay');
    const nav = this.querySelector('.docs-sidebar');

    const open = () => {
      nav.classList.add('is-open');
      overlay.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      nav.classList.remove('is-open');
      overlay.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? close() : open();
    });

    overlay.addEventListener('click', close);
  }
}

customElements.define('docs-sidebar', DocsSidebar);
