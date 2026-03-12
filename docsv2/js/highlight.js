/**
 * highlight.js — Syntax highlighting for HTML and CSS code.
 *
 * Wraps recognised tokens (tags, attributes, properties, etc.)
 * in <span class="token ..."> for CSS colouring.
 *
 * This is a lightweight, zero-dependency highlighter.
 * It does NOT parse a full AST — it uses simple regex passes,
 * which is good enough for documentation code snippets.
 */

import { escapeHtml } from './helpers.js';

/* ---------------------------------------------------------- */
/*  HTML highlighting                                         */
/* ---------------------------------------------------------- */

/**
 * Highlight attribute pairs inside an HTML tag.
 * Turns `class="foo"` into coloured attr-name + attr-value spans.
 */
function highlightHtmlAttributes(attrs) {
  return attrs
    // Attributes with values: name="value" or name='value'
    .replace(
      /([\s\n\r]+)([\w:-]+)(=)(&quot;.*?&quot;|&#39;.*?&#39;)/g,
      '$1<span class="token attr-name">$2</span>' +
      '<span class="token punctuation">$3</span>' +
      '<span class="token attr-value">$4</span>'
    )
    // Boolean attributes (no value): e.g. `open`, `disabled`
    .replace(
      /([\s\n\r]+)([\w:-]+)(?=[\s/]|$)/g,
      '$1<span class="token attr-name">$2</span>'
    );
}

/**
 * Apply syntax highlighting to an HTML code string.
 * The input should already be escaped via escapeHtml().
 */
export function highlightHtml(code) {
  return escapeHtml(code)
    // Comments: <!-- ... -->
    .replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="token comment">$1</span>'
    )
    // Tags: <tagname attrs> or </tagname>
    .replace(
      /(&lt;\/?)([a-zA-Z][\w:-]*)([^<>]*?)(\/?&gt;)/g,
      (_, open, tag, attrs, close) =>
        '<span class="token punctuation">' + open + '</span>' +
        '<span class="token tag">' + tag + '</span>' +
        highlightHtmlAttributes(attrs) +
        '<span class="token punctuation">' + close + '</span>'
    );
}

/* ---------------------------------------------------------- */
/*  CSS highlighting                                          */
/* ---------------------------------------------------------- */

/**
 * Highlight values on the right side of a CSS property declaration.
 * Catches strings, hex colours, numbers with units, functions, and variables.
 */
function highlightCssValue(value) {
  return value
    .replace(
      /(&quot;.*?&quot;|&#39;.*?&#39;)/g,
      '<span class="token string">$1</span>'
    )
    .replace(
      /(#[0-9a-fA-F]{3,8})/g,
      '<span class="token number">$1</span>'
    )
    .replace(
      /\b(rgba?\([^)]*\)|hsla?\([^)]*\)|calc\([^)]*\)|anchor\([^)]*\)|url\([^)]*\)|var\([^)]*\))\b/g,
      '<span class="token function">$1</span>'
    )
    .replace(
      /\b(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|deg|ms|s)?)\b/g,
      '<span class="token number">$1</span>'
    )
    .replace(
      /(--[\w-]+)/g,
      '<span class="token variable">$1</span>'
    );
}

/**
 * Apply syntax highlighting to a CSS code string.
 * The input should already be escaped via escapeHtml().
 */
export function highlightCss(code) {
  return escapeHtml(code)
    // Block comments
    .replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="token comment">$1</span>'
    )
    // At-rules: @media, @keyframes, etc.
    .replace(
      /(^|\n)(\s*@[^\n{;]+)/g,
      '$1<span class="token at-rule">$2</span>'
    )
    // Selectors (everything before an opening brace)
    .replace(
      /(^|\n)(\s*)([^{}\n][^{]*?)(\s*\{)/g,
      (_, lineStart, indent, selector, brace) =>
        lineStart + indent +
        '<span class="token selector">' + selector + '</span>' +
        '<span class="token punctuation">' + brace + '</span>'
    )
    // Property declarations: property: value;
    .replace(
      /(^|\n)(\s*)(--[\w-]+|[\w-]+)(\s*:)([^;\n}]*)(;?)/g,
      (_, lineStart, indent, property, colon, value, semicolon) =>
        lineStart + indent +
        '<span class="token property">' + property + '</span>' +
        '<span class="token punctuation">' + colon + '</span>' +
        highlightCssValue(value) +
        '<span class="token punctuation">' + semicolon + '</span>'
    );
}

/* ---------------------------------------------------------- */
/*  Public entry point                                        */
/* ---------------------------------------------------------- */

/**
 * Highlight code using the right language.
 *
 * @param {string} code       — Raw code string (unescaped).
 * @param {'is-html'|'is-css'} language — Which highlighter to use.
 * @returns {string} HTML string with <span class="token ..."> wrappers.
 */
export function highlightCode(code, language) {
  if (language === 'is-css') return highlightCss(code);
  return highlightHtml(code);
}
