/**
 * helpers.js — Small utility functions used across the docs site.
 *
 * These are pure functions with no side effects.
 * Each one does exactly one thing.
 */

/**
 * Remove leading whitespace that is common to all non-empty lines.
 * Useful for cleaning up indented HTML pulled from source files.
 *
 * Example:
 *   dedent("    <div>\n      Hi\n    </div>")
 *   → "<div>\n  Hi\n</div>"
 */
export function dedent(text) {
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);

  if (nonEmptyLines.length === 0) return text.trim();

  const minIndent = Math.min(
    ...nonEmptyLines.map(line => line.match(/^(\s*)/)[1].length)
  );

  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim();
}

/**
 * Convert HTML entities back to their actual characters.
 * Handles the 5 standard XML entities: & < > " '
 */
export function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Escape special HTML characters so text can be safely
 * inserted into the page without being treated as markup.
 */
export function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format raw CSS into nicely indented, readable code.
 * Handles block comments, strings, nested braces, and
 * parenthetical values like var(...) and calc(...).
 */
export function formatCss(rawCode) {
  const input = rawCode.replace(/\r\n?/g, '\n').trim();
  if (!input) return '';

  let result = '';
  let indentLevel = 0;
  let insideComment = false;
  let stringQuote = '';
  let parenDepth = 0;

  function addIndent() {
    result += '  '.repeat(indentLevel);
  }

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    // --- Inside a block comment: keep writing until */
    if (insideComment) {
      result += char;
      if (char === '*' && next === '/') {
        result += '/';
        i++;
        insideComment = false;
      }
      continue;
    }

    // --- Inside a quoted string: keep writing until closing quote
    if (stringQuote) {
      result += char;
      if (char === stringQuote && input[i - 1] !== '\\') {
        stringQuote = '';
      }
      continue;
    }

    // --- Start of a block comment
    if (char === '/' && next === '*') {
      insideComment = true;
      result += '/*';
      i++;
      continue;
    }

    // --- Start of a quoted string
    if (char === '"' || char === "'") {
      stringQuote = char;
      result += char;
      continue;
    }

    // --- Track parentheses (for var(...), calc(...), etc.)
    if (char === '(') {
      parenDepth++;
      result += char;
      continue;
    }
    if (char === ')') {
      parenDepth = Math.max(parenDepth - 1, 0);
      result += char;
      continue;
    }

    // --- Opening brace: increase indent
    if (char === '{' && parenDepth === 0) {
      result = result.replace(/[ \t]+$/, '');
      result += ' {\n';
      indentLevel++;
      addIndent();
      continue;
    }

    // --- Closing brace: decrease indent
    if (char === '}' && parenDepth === 0) {
      indentLevel = Math.max(indentLevel - 1, 0);
      result = result.replace(/[ \t]+$/, '');
      result = result.replace(/\n\s*$/, '\n');
      if (result && result[result.length - 1] !== '\n') {
        result += '\n';
      }
      addIndent();
      result += '}';
      if (i < input.length - 1) {
        result += '\n';
        if (input.slice(i + 1).trim()) {
          result += '\n';
          addIndent();
        }
      }
      continue;
    }

    // --- Semicolon: newline after property
    if (char === ';' && parenDepth === 0) {
      result += ';\n';
      addIndent();
      continue;
    }

    // --- Whitespace: collapse to single space
    if (/\s/.test(char)) {
      if (!result || /[\s\n]/.test(result[result.length - 1])) {
        continue;
      }
      result += ' ';
      continue;
    }

    result += char;
  }

  return result
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Count how many lines a code string has.
 */
export function countLines(code) {
  return code ? code.split(/\r?\n/).length : 0;
}

/**
 * Copy text to the clipboard.
 * Falls back to the legacy execCommand approach for older browsers.
 */
export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for browsers without Clipboard API
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
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
