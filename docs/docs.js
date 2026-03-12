/* ============================================================
   docs.js  --  Shared docs site behaviour
   - <docs-sidebar> Web Component for the shared sidebar nav
   - Renders <template class="component-tpl"> into preview panels
   - Populates code panels from the same template source
   - Handles Preview / Code tab switching
   ============================================================ */

/* ---------- Sidebar Web Component ---------- */
(function () {
  var NAV_LINKS = [
    { href: 'index.html', label: 'Overview' },
    { href: 'modal.html', label: 'Modal' },
    { href: 'dropdown.html', label: 'Dropdown' },
    { href: 'accordion/', label: 'Accordion' },
    { href: 'tooltip.html', label: 'Tooltip' },
    { href: 'form.html', label: 'Form Controls' },
  ];

  function DocsSidebar() {
    return Reflect.construct(HTMLElement, [], DocsSidebar);
  }
  DocsSidebar.prototype = Object.create(HTMLElement.prototype);
  DocsSidebar.prototype.constructor = DocsSidebar;
  DocsSidebar.prototype.connectedCallback = function () {
    var cur = location.pathname.split('/').pop() || '';
    var linksHtml = NAV_LINKS.map(function (l) {
      var active = cur === l.href ? ' aria-current="page"' : '';
      return '    <a href="' + l.href + '" class="docs-nav-link"' + active + '>' + l.label + '</a>';
    }).join('\n');
    this.innerHTML =
      '<nav class="docs-sidebar">\n' +
      '    <a href="../index.html" class="docs-sidebar-brand">vui</a>\n' +
      '    <div class="docs-nav-label">Components</div>\n' +
      linksHtml + '\n' +
      '  </nav>';
  };
  customElements.define('docs-sidebar', DocsSidebar);
}());

/* ---------- Template rendering + Tab switching ---------- */
(function () {
  var cssSourceCache = {};

  function dedent(str) {
    var lines = str.split('\n');
    var nonEmpty = lines.filter(function (l) { return l.trim().length > 0; });
    if (!nonEmpty.length) return str.trim();
    var min = Math.min.apply(null, nonEmpty.map(function (l) {
      return l.match(/^(\s*)/)[1].length;
    }));
    return lines.map(function (l) { return l.slice(min); }).join('\n').trim();
  }

  function decodeHtmlEntities(str) {
    return String(str || '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  function formatCss(code) {
    var input = code.replace(/\r\n?/g, '\n').trim();
    var formatted = '';
    var indentLevel = 0;
    var inComment = false;
    var stringQuote = '';
    var parenDepth = 0;

    function addIndent() {
      formatted += new Array(indentLevel + 1).join('  ');
    }

    function trimTrailingWhitespace() {
      formatted = formatted.replace(/[ \t]+$/g, '');
    }

    if (!input) return '';

    for (var index = 0; index < input.length; index += 1) {
      var char = input.charAt(index);
      var next = input.charAt(index + 1);

      if (inComment) {
        formatted += char;
        if (char === '*' && next === '/') {
          formatted += '/';
          index += 1;
          inComment = false;
        }
        continue;
      }

      if (stringQuote) {
        formatted += char;
        if (char === stringQuote && input.charAt(index - 1) !== '\\') {
          stringQuote = '';
        }
        continue;
      }

      if (char === '/' && next === '*') {
        inComment = true;
        formatted += '/*';
        index += 1;
        continue;
      }

      if (char === '"' || char === "'") {
        stringQuote = char;
        formatted += char;
        continue;
      }

      if (char === '(') {
        parenDepth += 1;
        formatted += char;
        continue;
      }

      if (char === ')') {
        parenDepth = Math.max(parenDepth - 1, 0);
        formatted += char;
        continue;
      }

      if (char === '{' && parenDepth === 0) {
        formatted = formatted.replace(/[ \t]+$/g, '');
        formatted += ' {' + '\n';
        indentLevel += 1;
        addIndent();
        continue;
      }

      if (char === '}' && parenDepth === 0) {
        indentLevel = Math.max(indentLevel - 1, 0);
        trimTrailingWhitespace();
        formatted = formatted.replace(/\n\s*$/g, '\n');
        if (formatted && formatted.charAt(formatted.length - 1) !== '\n') {
          formatted += '\n';
        }
        addIndent();
        formatted += '}';
        if (index < input.length - 1) {
          formatted += '\n';
          if (input.slice(index + 1).trim()) {
            formatted += '\n';
            addIndent();
          }
        }
        continue;
      }

      if (char === ';' && parenDepth === 0) {
        formatted += ';' + '\n';
        addIndent();
        continue;
      }

      if (/\s/.test(char)) {
        if (!formatted || /[\s\n]/.test(formatted.charAt(formatted.length - 1))) {
          continue;
        }
        formatted += ' ';
        continue;
      }

      formatted += char;
    }

    return formatted
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function countCodeLines(code) {
    return code ? code.split(/\r?\n/).length : 0;
  }

  function shouldCollapseCode(code) {
    return countCodeLines(code) > 25;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlightHtmlAttributes(attrs) {
    return attrs
      .replace(/([\s\n\r]+)([\w:-]+)(=)(&quot;.*?&quot;|&#39;.*?&#39;)/g,
        '$1<span class="token attr-name">$2</span><span class="token punctuation">$3</span><span class="token attr-value">$4</span>')
      .replace(/([\s\n\r]+)([\w:-]+)(?=[\s/]|$)/g,
        '$1<span class="token attr-name">$2</span>');
  }

  function highlightHtml(code) {
    return escapeHtml(code)
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="token comment">$1</span>')
      .replace(/(&lt;\/?)([a-zA-Z][\w:-]*)([^<>]*?)(\/?&gt;)/g, function (_, open, tag, attrs, close) {
        return '<span class="token punctuation">' + open + '</span>' +
          '<span class="token tag">' + tag + '</span>' +
          highlightHtmlAttributes(attrs) +
          '<span class="token punctuation">' + close + '</span>';
      });
  }

  function highlightCssValue(value) {
    return value
      .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="token string">$1</span>')
      .replace(/(#[0-9a-fA-F]{3,8})/g, '<span class="token number">$1</span>')
      .replace(/\b(rgba?\([^)]*\)|hsla?\([^)]*\)|calc\([^)]*\)|anchor\([^)]*\)|url\([^)]*\)|var\([^)]*\))\b/g,
        '<span class="token function">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|deg|ms|s)?)\b/g, '<span class="token number">$1</span>')
      .replace(/(--[\w-]+)/g, '<span class="token variable">$1</span>');
  }

  function highlightCss(code) {
    return escapeHtml(code)
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>')
      .replace(/(^|\n)(\s*@[^\n{;]+)/g, '$1<span class="token at-rule">$2</span>')
      .replace(/(^|\n)(\s*)([^{}\n][^{]*?)(\s*\{)/g, function (_, lineStart, indent, selector, brace) {
        return lineStart + indent + '<span class="token selector">' + selector + '</span><span class="token punctuation">' + brace + '</span>';
      })
      .replace(/(^|\n)(\s*)(--[\w-]+|[\w-]+)(\s*:)([^;\n}]*)(;?)/g, function (_, lineStart, indent, property, colon, value, semicolon) {
        return lineStart + indent +
          '<span class="token property">' + property + '</span>' +
          '<span class="token punctuation">' + colon + '</span>' +
          highlightCssValue(value) +
          '<span class="token punctuation">' + semicolon + '</span>';
      });
  }

  function highlightCode(code, typeClass) {
    if (typeClass === 'is-css') {
      return highlightCss(code);
    }
    return highlightHtml(code);
  }

  function createToggleButton() {
    return '<button class="docs-toggle-btn" type="button" aria-expanded="false">Show More</button>';
  }

  function createCopyButton() {
    return '<button class="docs-copy-btn" type="button"><span class="docs-copy-icon" aria-hidden="true">⧉</span><span class="docs-copy-text">Copy</span></button>';
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function createCodeBlock(label, code, typeClass) {
    var decodedCode = decodeHtmlEntities(code);
    var normalizedCode = typeClass === 'is-css' ? formatCss(decodedCode) : decodedCode;
    var isCollapsible = shouldCollapseCode(normalizedCode);
    return (
      '<section class="docs-code-block ' + typeClass + (isCollapsible ? ' is-collapsible is-collapsed' : '') + '">' +
      '<div class="docs-code-block-header">' +
      '<span class="docs-code-label">' + label + '</span>' +
      '<div class="docs-code-actions">' +
      createCopyButton() +
      '</div>' +
      '</div>' +
      '<pre><code>' + highlightCode(normalizedCode, typeClass) + '</code></pre>' +
      (isCollapsible ? '<div class="docs-code-toggle-row">' + createToggleButton() + '</div>' : '') +
      '</section>'
    );
  }

  function hasMajorCompatIssue(value) {
    var normalized = String(value || '').toLowerCase();
    return (
      !normalized ||
      normalized.indexOf('no') !== -1 ||
      normalized.indexOf('partial') !== -1 ||
      normalized.indexOf('flag') !== -1 ||
      normalized.indexOf('disabled') !== -1 ||
      normalized.indexOf('preview') !== -1 ||
      normalized.indexOf('behind') !== -1 ||
      normalized.indexOf('unknown') !== -1
    );
  }

  function isHealthyCompatRow(row) {
    return !Object.keys(row.browsers).some(function (browser) {
      return hasMajorCompatIssue(row.browsers[browser]);
    });
  }

  function renderCompatTable(container, compatKey) {
    var compatData = window.VUI_BROWSER_COMPAT;
    var componentData = compatData && compatData.components && compatData.components[compatKey];
    if (!componentData) return;

    var hasOnlyHealthyRows = componentData.rows.every(isHealthyCompatRow);

    var rows = componentData.rows.map(function (row) {
      var isHealthy = isHealthyCompatRow(row);
      var note = row.note ? escapeHtml(row.note) : 'Stable support with no major notes in MDN BCD.';
      var mdnLink = row.mdnUrl
        ? '<a class="docs-compat-link" href="' + row.mdnUrl + '" target="_blank" rel="noreferrer">MDN</a>'
        : '';
      var status = isHealthy
        ? '<span class="docs-compat-signal is-good">Broad support</span>'
        : '<span class="docs-compat-signal">Review support</span>';

      return (
        '<tr class="docs-compat-row' + (isHealthy ? ' is-healthy' : '') + '">' +
        '<td><code>' + escapeHtml(row.feature) + '</code>' + status + '</td>' +
        '<td>' + escapeHtml(row.browsers.chrome) + '</td>' +
        '<td>' + escapeHtml(row.browsers.edge) + '</td>' +
        '<td>' + escapeHtml(row.browsers.firefox) + '</td>' +
        '<td>' + escapeHtml(row.browsers.safari) + '</td>' +
        '<td>' + note + '</td>' +
        '<td>' + mdnLink + '</td>' +
        '</tr>'
      );
    }).join('');

    container.innerHTML =
      '<div class="docs-compat-block">' +
      '<div class="docs-compat-heading">Browser Compatibility' +
      (hasOnlyHealthyRows
        ? '<span class="docs-compat-summary is-good">No major browser issues</span>'
        : '<span class="docs-compat-summary">Some features need a support check</span>') +
      '</div>' +
      '<table class="docs-table docs-compat-table">' +
      '<thead>' +
      '<tr><th>Feature</th><th>Chrome</th><th>Edge</th><th>Firefox</th><th>Safari</th><th>Notes</th><th>Source</th></tr>' +
      '</thead>' +
      '<tbody>' + rows + '</tbody>' +
      '</table>' +
      '<p class="docs-compat-meta">Generated from MDN Browser Compat Data ' + escapeHtml(compatData.sourceVersion) + '.</p>' +
      '</div>';
  }

  function renderCodePanel(panel, htmlCode, cssCode) {
    var stackClass = cssCode ? 'docs-code-stack has-two-blocks' : 'docs-code-stack';
    var blocks = '';
    blocks += createCodeBlock('HTML', htmlCode, 'is-html');
    if (cssCode) {
      blocks += createCodeBlock('CSS', cssCode, 'is-css');
    }

    panel.innerHTML =
      '<div class="docs-code-shell">' +
      '<div class="docs-panel-label">code</div>' +
      '<div class="docs-code-window">' +
      '<div class="' + stackClass + '">' + blocks + '</div>' +
      '</div>' +
      '</div>';
  }

  function getCssCode(card) {
    var cssTpl = card.querySelector('.component-css-tpl') || document.querySelector('.page-css-tpl');
    if (cssTpl) {
      return Promise.resolve(dedent(cssTpl.innerHTML));
    }

    var cssSource = card.getAttribute('data-css-source');
    if (!cssSource) {
      return Promise.resolve('');
    }

    if (!cssSourceCache[cssSource]) {
      cssSourceCache[cssSource] = fetch(cssSource)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Failed to load CSS source: ' + cssSource);
          }
          return response.text();
        })
        .then(function (text) {
          return dedent(text);
        })
        .catch(function () {
          return '';
        });
    }

    return cssSourceCache[cssSource];
  }

  function ensurePanelLabel(panel, label) {
    if (!panel || panel.querySelector('.docs-panel-label')) return;

    var panelLabel = document.createElement('div');
    panelLabel.className = 'docs-panel-label';
    panelLabel.textContent = label;
    panel.insertBefore(panelLabel, panel.firstChild);
  }

  function enhanceLegacyCodeBlocks() {
    document.querySelectorAll('.docs-code').forEach(function (block) {
      var pre = block.querySelector('pre');
      var label = block.querySelector('.docs-code-label');
      if (!pre || !label || block.classList.contains('is-enhanced')) return;

      var code = dedent(decodeHtmlEntities(pre.textContent || ''));
      pre.textContent = code;
      block.classList.add('is-enhanced');

      if (!shouldCollapseCode(code)) return;

      var footer = document.createElement('div');
      var toggleBtn = document.createElement('button');

      footer.className = 'docs-code-toggle-row is-legacy';
      toggleBtn.className = 'docs-toggle-btn';
      toggleBtn.type = 'button';
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.textContent = 'Show More';
      footer.appendChild(toggleBtn);
      block.appendChild(footer);

      block.classList.add('is-collapsible', 'is-collapsed');
    });
  }

  function toggleCodeBlock(container, button) {
    var isExpanded = container.classList.toggle('is-expanded');

    container.classList.toggle('is-collapsed', !isExpanded);
    button.textContent = isExpanded ? 'Show Less' : 'Show More';
    button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Render every template into its adjacent component-card
    document.querySelectorAll('.component-tpl').forEach(function (tpl) {
      var card = tpl.nextElementSibling;
      if (!card || !card.classList.contains('component-card')) return;

      card.querySelectorAll('.tab-bar').forEach(function (tabBar) {
        tabBar.remove();
      });

      var preview = card.querySelector('[data-panel="preview"]');
      var codePanel = card.querySelector('[data-panel="code"]');

      if (preview && tpl.content) {
        ensurePanelLabel(preview, 'Preview');
        preview.appendChild(tpl.content.cloneNode(true));
      }
      if (codePanel) {
        codePanel.hidden = false;
        var htmlCode = dedent(tpl.innerHTML);
        getCssCode(card).then(function (cssCode) {
          renderCodePanel(codePanel, htmlCode, cssCode);
        });
      }
    });

    document.querySelectorAll('[data-compat-key]').forEach(function (node) {
      renderCompatTable(node, node.getAttribute('data-compat-key'));
    });

    enhanceLegacyCodeBlocks();

    document.addEventListener('click', function (e) {
      var toggleBtn = e.target.closest('.docs-toggle-btn');
      if (toggleBtn) {
        var codeBlock = toggleBtn.closest('.docs-code-block, .docs-code');
        if (!codeBlock) return;
        toggleCodeBlock(codeBlock, toggleBtn);
        return;
      }

      var copyBtn = e.target.closest('.docs-copy-btn');
      if (!copyBtn) return;

      var codeEl = copyBtn.closest('.docs-code-block').querySelector('code');
      var previousText = copyBtn.textContent;

      copyText(codeEl.textContent)
        .then(function () {
          copyBtn.textContent = 'Copied';
          copyBtn.classList.add('is-copied');
          window.setTimeout(function () {
            copyBtn.textContent = previousText;
            copyBtn.classList.remove('is-copied');
          }, 1400);
        })
        .catch(function () {
          copyBtn.textContent = 'Error';
          window.setTimeout(function () {
            copyBtn.textContent = previousText;
          }, 1400);
        });
    });
  });
})();
