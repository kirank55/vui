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

/** All navigation links shown in the sidebar. Add new pages here. */
const NAV_LINKS = [
  { href: 'index.html',    label: 'Overview' },
  { href: 'modal/',        label: 'Modal' },
  { href: 'dropdown/',     label: 'Dropdown' },
  { href: 'accordion/',    label: 'Accordion' },
  { href: 'tooltip/',      label: 'Tooltip' },
  { href: 'form/',         label: 'Form Controls' },
];

function normalizeDocsPath(path) {
  const normalized = path.replace(/\\/g, '/');

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

    const linksHtml = NAV_LINKS.map(link => {
      const href = basePath + link.href;
      const linkPath = normalizeDocsPath(link.href);

      // Mark the current page as active for screen readers and styling
      const isActive = currentPath === linkPath;
      const activeAttr = isActive ? ' aria-current="page"' : '';

      return `    <a href="${href}" class="docs-nav-link"${activeAttr}>${link.label}</a>`;
    }).join('\n');

    this.innerHTML =
      '<nav class="docs-sidebar">\n' +
      `  <a href="${basePath}../index.html" class="docs-sidebar-brand">vui</a>\n` +
      '  <div class="docs-nav-label">Components</div>\n' +
      linksHtml + '\n' +
      '</nav>';
  }
}

customElements.define('docs-sidebar', DocsSidebar);
