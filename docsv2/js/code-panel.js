/**
 * code-panel.js — Code block rendering, copy-to-clipboard,
 * and collapse/expand ("Show More" / "Show Less") behaviour.
 *
 * Exports:
 *   renderCodePanel()      — Build the HTML+CSS code panel for a component card.
 *   enhanceLegacyBlocks()  — Add collapse/expand to static .docs-code blocks.
 *   setupClickHandlers()   — Delegate click events for copy and toggle buttons.
 */

import { decodeHtmlEntities, formatCss, countLines, copyToClipboard } from './helpers.js';
import { highlightCode } from './highlight.js';

/** Code blocks taller than this many lines get a "Show More" toggle. */
const COLLAPSE_LINE_THRESHOLD = 25;

/* ---------------------------------------------------------- */
/*  HTML builders                                             */
/* ---------------------------------------------------------- */

/** Build the copy button markup. */
function buildCopyButton() {
  return (
    '<button class="docs-copy-btn" type="button">' +
      '<span class="docs-copy-icon" aria-hidden="true">⧉</span>' +
      '<span class="docs-copy-text">Copy</span>' +
    '</button>'
  );
}

/** Build the toggle button markup. */
function buildToggleButton() {
  return '<button class="docs-toggle-btn" type="button" aria-expanded="false">Show More</button>';
}

/**
 * Build a single code block (HTML or CSS).
 *
 * @param {string} label     — Display label, e.g. "HTML" or "CSS".
 * @param {string} rawCode   — The raw (possibly entity-encoded) source code.
 * @param {string} typeClass — "is-html" or "is-css".
 */
function buildCodeBlock(label, rawCode, typeClass) {
  const decoded = decodeHtmlEntities(rawCode);
  const code = typeClass === 'is-css' ? formatCss(decoded) : decoded;
  const isCollapsible = countLines(code) > COLLAPSE_LINE_THRESHOLD;

  const collapseClass = isCollapsible ? ' is-collapsible is-collapsed' : '';

  return (
    '<section class="docs-code-block ' + typeClass + collapseClass + '">' +
      '<div class="docs-code-block-header">' +
        '<span class="docs-code-label">' + label + '</span>' +
        '<div class="docs-code-actions">' + buildCopyButton() + '</div>' +
      '</div>' +
      '<pre><code>' + highlightCode(code, typeClass) + '</code></pre>' +
      (isCollapsible
        ? '<div class="docs-code-toggle-row">' + buildToggleButton() + '</div>'
        : '') +
    '</section>'
  );
}

/* ---------------------------------------------------------- */
/*  Public API                                                */
/* ---------------------------------------------------------- */

/**
 * Render the full code panel (HTML block + optional CSS block)
 * into the given container element.
 */
export function renderCodePanel(container, htmlCode, cssCode) {
  const stackClass = cssCode
    ? 'docs-code-stack has-two-blocks'
    : 'docs-code-stack';

  let blocks = buildCodeBlock('HTML', htmlCode, 'is-html');
  if (cssCode) {
    blocks += buildCodeBlock('CSS', cssCode, 'is-css');
  }

  container.innerHTML =
    '<div class="docs-code-shell">' +
      '<div class="docs-panel-label">code</div>' +
      '<div class="docs-code-window">' +
        '<div class="' + stackClass + '">' + blocks + '</div>' +
      '</div>' +
    '</div>';
}

/**
 * Enhance any static `.docs-code` blocks already in the page.
 * If a block has more than 25 lines, add a collapse/expand toggle.
 */
export function enhanceLegacyBlocks() {
  document.querySelectorAll('.docs-code').forEach(block => {
    const pre = block.querySelector('pre');
    const label = block.querySelector('.docs-code-label');
    if (!pre || !label || block.classList.contains('is-enhanced')) return;

    const code = pre.textContent || '';
    block.classList.add('is-enhanced');

    if (countLines(code) <= COLLAPSE_LINE_THRESHOLD) return;

    // Add toggle button
    const footer = document.createElement('div');
    footer.className = 'docs-code-toggle-row is-legacy';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'docs-toggle-btn';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.textContent = 'Show More';

    footer.appendChild(toggleBtn);
    block.appendChild(footer);
    block.classList.add('is-collapsible', 'is-collapsed');
  });
}

/**
 * Set up delegated click handlers on `document` for:
 *   - Toggle buttons (Show More / Show Less)
 *   - Copy buttons (copy code to clipboard)
 */
export function setupClickHandlers() {
  document.addEventListener('click', (event) => {
    // --- Toggle button ---
    const toggleBtn = event.target.closest('.docs-toggle-btn');
    if (toggleBtn) {
      handleToggleClick(toggleBtn);
      return;
    }

    // --- Copy button ---
    const copyBtn = event.target.closest('.docs-copy-btn');
    if (copyBtn) {
      handleCopyClick(copyBtn);
    }
  });
}

/* ---------------------------------------------------------- */
/*  Click handlers                                            */
/* ---------------------------------------------------------- */

/** Toggle a code block between collapsed and expanded. */
function handleToggleClick(button) {
  const codeBlock = button.closest('.docs-code-block, .docs-code');
  if (!codeBlock) return;

  const isExpanded = codeBlock.classList.toggle('is-expanded');
  codeBlock.classList.toggle('is-collapsed', !isExpanded);
  button.textContent = isExpanded ? 'Show Less' : 'Show More';
  button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
}

/** Copy a code block's content to the clipboard with visual feedback. */
function handleCopyClick(button) {
  const codeEl = button.closest('.docs-code-block').querySelector('code');
  const previousText = button.textContent;

  copyToClipboard(codeEl.textContent)
    .then(() => {
      button.textContent = 'Copied';
      button.classList.add('is-copied');
      setTimeout(() => {
        button.textContent = previousText;
        button.classList.remove('is-copied');
      }, 1400);
    })
    .catch(() => {
      button.textContent = 'Error';
      setTimeout(() => {
        button.textContent = previousText;
      }, 1400);
    });
}
