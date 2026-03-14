/**
 * app.js — Main entry point for the docs site.
 *
 * Runs on DOMContentLoaded and wires everything together:
 *   1. Loads the sidebar (via the <docs-sidebar> web component).
 *   2. Finds component cards and fetches their HTML/CSS sources.
 *   3. Renders live previews and syntax-highlighted code panels.
 *   4. Enhances any static code blocks with collapse/expand.
 *   5. Sets up click handlers for copy and toggle buttons.
 */

import './sidebar.js';
import { dedent } from './helpers.js';
import { renderCodePanel, enhanceLegacyBlocks, setupClickHandlers } from './code-panel.js';

const PREVIEW_WIDTH_DEFAULT = 'default';
const PREVIEW_WIDTH_NARROW = 'narrow';

/**
 * Simple fetch cache so we don't re-download the same file twice.
 * Keys are source file paths, values are Promises that resolve to text.
 */
const fetchCache = {};

/**
 * Fetch a text file and cache the result.
 * Returns empty string on failure so the page still works.
 */
function fetchSource(url) {
  if (!url) return Promise.resolve('');

  if (!fetchCache[url]) {
    fetchCache[url] = fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load: ' + url);
        return response.text();
      })
      .then(text => dedent(text))
      .catch(() => '');
  }

  return fetchCache[url];
}

function enhancePreviewPanel(card) {
  const previewPanel = card.querySelector('[data-panel="preview"]');
  if (!previewPanel || previewPanel.dataset.previewEnhanced === 'true') return;

  previewPanel.dataset.previewEnhanced = 'true';
  const previewLabel = previewPanel.previousElementSibling;

  const toolbar = document.createElement('div');
  toolbar.className = 'docs-preview-toolbar';
  toolbar.innerHTML =
    '<span class="docs-preview-toolbar-label">Width</span>' +
    '<div class="docs-preview-toggle" role="group" aria-label="Preview width">' +
      `<button class="docs-preview-toggle-btn is-active" type="button" data-preview-width="${PREVIEW_WIDTH_DEFAULT}" aria-pressed="true" aria-label="Desktop preview width">` +
        '<svg class="docs-preview-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /><path d="M12 16v4" /></svg>' +
        '<span class="vui-sr-only">Desktop preview width</span>' +
      '</button>' +
      `<button class="docs-preview-toggle-btn" type="button" data-preview-width="${PREVIEW_WIDTH_NARROW}" aria-pressed="false" aria-label="Mobile preview width">` +
        '<svg class="docs-preview-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>' +
        '<span class="vui-sr-only">Mobile preview width</span>' +
      '</button>' +
    '</div>';

  const stage = document.createElement('div');
  stage.className = 'docs-preview-stage';

  while (previewPanel.firstChild) {
    stage.appendChild(previewPanel.firstChild);
  }

  if (previewLabel?.classList.contains('docs-panel-label')) {
    previewLabel.classList.add('docs-panel-label--with-toolbar');
    previewLabel.appendChild(toolbar);
  }

  previewPanel.append(stage);

  toolbar.addEventListener('click', event => {
    const button = event.target.closest('.docs-preview-toggle-btn');
    if (!button) return;

    const isNarrow = button.dataset.previewWidth === PREVIEW_WIDTH_NARROW;
    previewPanel.classList.toggle('is-preview-narrow', isNarrow);

    toolbar.querySelectorAll('.docs-preview-toggle-btn').forEach(toggleButton => {
      const isActive = toggleButton === button;
      toggleButton.classList.toggle('is-active', isActive);
      toggleButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  });
}

/**
 * Initialise a single component card.
 *
 * Reads `data-html-source` and `data-css-source` attributes,
 * fetches the files, renders the live preview, and builds
 * the syntax-highlighted code panel.
 */
function initComponentCard(card) {
  const htmlSourceUrl = card.getAttribute('data-html-source');
  const cssSourceUrl = card.getAttribute('data-css-source');
  enhancePreviewPanel(card);

  const previewPanel = card.querySelector('[data-panel="preview"]');
  const previewStage = previewPanel?.querySelector('.docs-preview-stage');
  const codePanel = card.querySelector('[data-panel="code"]');

  if (!htmlSourceUrl) return;

  Promise.all([fetchSource(htmlSourceUrl), fetchSource(cssSourceUrl)])
    .then(([htmlCode, cssCode]) => {
      // Insert the component HTML into the live preview
      if (previewStage) {
        previewStage.insertAdjacentHTML('beforeend', htmlCode);
      }

      // Build the syntax-highlighted code panel
      if (codePanel) {
        codePanel.hidden = false;
        renderCodePanel(codePanel, htmlCode, cssCode);
      }
    })
    .catch(error => {
      // Show the error in the code panel so it's visible during dev
      if (codePanel) {
        codePanel.hidden = false;
        renderCodePanel(codePanel, error.message, '');
      }
    });
}

/* ---------------------------------------------------------- */
/*  Bootstrap                                                 */
/* ---------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialise every component card on the page
  document.querySelectorAll('.component-card').forEach(initComponentCard);

  // 2. Add collapse/expand to any static code blocks
  enhanceLegacyBlocks();

  // 3. Wire up copy and toggle button clicks
  setupClickHandlers();
});

/* ---------------------------------------------------------- */
/*  add favicons to doc                                       */
/* ---------------------------------------------------------- */


const faviconLinks = [
  { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'shortcut icon', href: '/favicon.ico' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
  { rel: 'manifest', href: '/site.webmanifest' },
];

for (const attrs of faviconLinks) {
  const selector = attrs.rel === 'manifest'
    ? 'link[rel="manifest"]'
    : `link[rel="${attrs.rel}"][href="${attrs.href}"]`;

  if (document.head.querySelector(selector)) continue;

  const link = document.createElement('link');
  Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
  document.head.appendChild(link);
}