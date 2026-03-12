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
  { href: 'modal.html',    label: 'Modal' },
  { href: 'dropdown.html', label: 'Dropdown' },
  { href: 'accordion/',    label: 'Accordion' },
  { href: 'tooltip.html',  label: 'Tooltip' },
  { href: 'form.html',     label: 'Form Controls' },
];

class DocsSidebar extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute('base-path') || '';
    const currentPage = location.pathname.split('/').pop() || '';

    const linksHtml = NAV_LINKS.map(link => {
      const href = basePath + link.href;

      // Mark the current page as active for screen readers and styling
      const isActive = (currentPage === link.href) ||
                       (currentPage === '' && link.href.endsWith('/'));
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
