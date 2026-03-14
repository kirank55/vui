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
      { href: 'icons/', label: 'Icons' },
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
      '<button class="docs-sidebar-toggle" type="button" aria-label="Open navigation" aria-expanded="false">' +
      '  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
      '</button>\n' +
      '<div class="docs-sidebar-overlay" aria-hidden="true"></div>\n' +
      '<nav class="docs-sidebar" aria-label="Documentation navigation">\n' +
      `  <a href="/" class="docs-sidebar-brand">vui</a>\n` +
      linksHtml + '\n' +
      '</nav>';

    const toggle = this.querySelector('.docs-sidebar-toggle');
    const overlay = this.querySelector('.docs-sidebar-overlay');
    const nav = this.querySelector('.docs-sidebar');

    const open = () => {
      nav.classList.add('is-open');
      overlay.classList.add('is-open');
      toggle.hidden = true;
      toggle.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      nav.classList.remove('is-open');
      overlay.classList.remove('is-open');
      toggle.hidden = false;
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? close() : open();
    });

    overlay.addEventListener('click', close);
  }
}

customElements.define('docs-sidebar', DocsSidebar);
