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

function submitToCodePen({ title, html, css }) {
  const form = document.createElement('form');
  form.action = 'https://codepen.io/pen/define';
  form.method = 'POST';
  form.target = '_blank';
  form.hidden = true;

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'data';
  input.value = JSON.stringify({
    title,
    html,
    css,
    js: '',
    editors: '110',
    layout: 'left',
  });

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  form.remove();
}

function injectPageCodePenLinks() {
  if (document.querySelector('a[href*="codepen.io"]') || document.querySelector('.docs-demo-links')) {
    return;
  }

  const subtitle = document.querySelector('.docs-subtitle');
  if (!subtitle) return;

  const cards = Array.from(document.querySelectorAll('.component-card[data-html-source][data-codepen-title]'));
  if (!cards.length) return;

  const row = document.createElement('div');
  row.className = 'docs-demo-links';

  cards.forEach(card => {
    const title = card.getAttribute('data-codepen-title') || 'vui component';
    const htmlSourceUrl = card.getAttribute('data-html-source');
    const cssSourceUrl = card.getAttribute('data-css-source');
    const button = document.createElement('button');
    button.className = 'docs-demo-link';
    button.type = 'button';
    button.textContent = `${title} on CodePen`;
    button.addEventListener('click', () => {
      Promise.all([fetchSource(htmlSourceUrl), fetchSource(cssSourceUrl)]).then(([html, css]) => {
        submitToCodePen({ title, html, css });
      });
    });
    row.appendChild(button);
  });

  subtitle.insertAdjacentElement('afterend', row);
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
  const codePenTitle = card.getAttribute('data-codepen-title') || document.title.replace(/\s+--\s+vui$/, '');

  if (!htmlSourceUrl) return;

  const previewPanel = card.querySelector('[data-panel="preview"]');
  const codePanel = card.querySelector('[data-panel="code"]');

  Promise.all([fetchSource(htmlSourceUrl), fetchSource(cssSourceUrl)])
    .then(([htmlCode, cssCode]) => {
      // Insert the component HTML into the live preview
      if (previewPanel) {
        previewPanel.insertAdjacentHTML('beforeend', htmlCode);
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
  injectPageCodePenLinks();

  // 1. Initialise every component card on the page
  document.querySelectorAll('.component-card').forEach(initComponentCard);

  // 2. Add collapse/expand to any static code blocks
  enhanceLegacyBlocks();

  // 3. Wire up copy and toggle button clicks
  setupClickHandlers();
});
