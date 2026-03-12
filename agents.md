# VUI -- Project Context

Zero-dependency, copy-paste UI component library built entirely with native HTML and CSS.
No bundler, no transpiler, no framework. Served as static files.

## Tech Stack

- **Language**: HTML, CSS, vanilla JavaScript (ES modules)
- **Build**: None for components. One Node script for browser compat data (`npm run generate:compat`)
- **Package manager**: npm (only dev dependency: `@mdn/browser-compat-data`)
- **Serving**: Static file server (no build step)
- **Browser targets**: Chrome 120+, Edge 120+, Firefox 130+, Safari 17.2+

## Project Structure

```
index.html                              Landing page
css/global.css                          Design tokens + minimal reset
scripts/generate-browser-compat.mjs     Compat data generator

docs/                                   Documentation site
  index.html                            Component listing (standalone layout, no sidebar)
  css/
    layout.css                          Two-column docs layout
    content.css                         Headings, previews, cards
    code-blocks.css                     Syntax highlighting, copy/toggle
    compat-table.css                    Browser compat table
    responsive.css                      Mobile breakpoints
  js/
    app.js                              Entry point, bootstraps docs
    sidebar.js                          <docs-sidebar> web component
    helpers.js                          Pure utility functions
    highlight.js                        Zero-dep regex syntax highlighter
    code-panel.js                       Code panel rendering + interactions
  accordion/                            Accordion component docs
    index.html                          Docs page
    accordion.component.html            Standalone HTML snippet
    accordion.component.css             Component styles
```

## Architecture Principles

1. **No JS in components** -- Components are pure HTML+CSS. JavaScript exists only in the docs site.
2. **Native-first** -- Use native HTML elements over ARIA re-implementations:
   - `<details>`/`<summary>` for accordion
   - `<dialog>` for modal
   - Popover API for dropdown/tooltip
   - HTML5 Validation for forms
3. **Copy-paste distribution** -- Each component is a self-contained CSS file + HTML snippet. No npm install.
4. **Standalone fallbacks** -- Components work without `global.css` via private CSS custom property fallbacks.
5. **Prefer clean implementation over browser support** -- When there is a tradeoff, favor the cleaner native pattern. Document limited availability clearly in component compatibility sections when newer native APIs are used.

## Design Tokens

All tokens live in `css/global.css` under `:root`. Naming: `--vui-{category}-{variant}`.

Categories: `bg`, `fg`, `border`, `accent`, `danger`, `success`, `radius`, `space`, `font`, `font-size`, `line-height`, `shadow`, `duration`, `easing`.

## CSS Conventions

### Class naming
- **Component classes**: `.vui-{component}` root, `.vui-{component}-{child}` for children
  - Example: `.vui-accordion`, `.vui-accordion-item`, `.vui-accordion-body`
- **Modifiers**: BEM-style double-dash (`.vui-btn--primary`)
- **State classes**: `.is-{state}` (e.g. `.is-expanded`, `.is-collapsed`, `.is-copied`)
- **Docs classes**: `.docs-{element}` (e.g. `.docs-sidebar`, `.docs-preview`, `.docs-title`)

### Private custom properties (critical pattern)
Every component MUST re-declare needed global tokens as private `--_vui-*` properties at its root element, referencing the public token with a hardcoded fallback:

```css
.vui-accordion {
  --_vui-border: var(--vui-border, #d4d4d4);
  --_vui-radius-md: var(--vui-radius-md, 6px);
  /* ... */
}
```

All internal rules reference `--_vui-*`, never `--vui-*` directly. This makes components work without `global.css`.

### Responsive
Mobile breakpoint: `@media (max-width: 768px)`. Every component CSS file should include a responsive section.

### File header comment
```css
/* ============================================================
   {filename}  --  {description}
   {brief note about native element usage}
   ============================================================ */
```

## JavaScript Conventions

- ES modules only (`type="module"`, `import`/`export`)
- No bundler -- browser loads modules directly
- Event delegation via `event.target.closest()` on `document`
- `DOMContentLoaded` for bootstrap logic
- Fetch caching via a simple object keyed by URL

### Docs sidebar web component
`<docs-sidebar>` is a custom element. New component pages must be added to `NAV_LINKS` in `docs/js/sidebar.js`.

## Adding a New Component

Follow the accordion as the reference implementation.

### 1. Create component directory
```
docs/{component}/
  index.html                    Docs page
  {component}.component.html    Standalone HTML snippet
  {component}.component.css     Component styles
```

### 2. Component CSS (`{component}.component.css`)
- File header comment
- Root selector `.vui-{component}` with private tokens (`--_vui-*` with fallbacks)
- Child selectors `.vui-{component}-{child}`
- State via `.is-{state}` or native attributes (`[open]`, etc.)
- `@media (max-width: 768px)` responsive section
- Reference: `docs/accordion/accordion.component.css`

### 3. Component HTML snippet (`{component}.component.html`)
- Standalone HTML fragment (no `<html>`, `<head>`, etc.)
- Uses native elements where possible (`<details>`, `<dialog>`, etc.)
- Reference: `docs/accordion/accordion.component.html`

### 4. Docs page (`{component}/index.html`)
Required structure:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{Component} -- vui</title>
  <link rel="stylesheet" href="/css/global.css" />
  <link rel="stylesheet" href="../css/layout.css" />
  <link rel="stylesheet" href="../css/content.css" />
  <link rel="stylesheet" href="../css/code-blocks.css" />
  <link rel="stylesheet" href="../css/compat-table.css" />
  <link rel="stylesheet" href="../css/responsive.css" />
  <link rel="stylesheet" href="{component}.component.css" />
</head>
<body>
  <div class="docs-layout">
    <docs-sidebar base-path="../"></docs-sidebar>
    <main class="docs-main">
      <h1 class="docs-title">{Component}</h1>
      <p class="docs-subtitle">{Description}</p>
      <!-- Live preview + code panel -->
      <section style="margin: 2em 0;">
        <div class="component-card"
             data-html-source="{component}.component.html"
             data-css-source="{component}.component.css">
          <div class="docs-panel-label">Preview</div>
          <div data-panel="preview" class="docs-preview"></div>
          <div data-panel="code" hidden><pre><code></code></pre></div>
        </div>
      </section>
      <!-- Variant sections as needed -->
      <!-- Browser Compatibility table -->
    </main>
  </div>
  <script type="module" src="../js/app.js"></script>
</body>
</html>
```

### 5. Register in sidebar
Add entry to `NAV_LINKS` in `docs/js/sidebar.js`:
```js
{ href: '{component}/', label: '{Component}' },
```

## Planned Components (Not Yet Implemented)

| Component     | Native API                | Directory           |
|---------------|---------------------------|----------------------|
| Modal         | `<dialog>` element        | `docs/modal/`        |
| Dropdown      | Popover API               | `docs/dropdown/`     |
| Tooltip       | Popover + CSS Anchor      | `docs/tooltip/`      |
| Form Controls | HTML5 Validation          | `docs/form/`         |

## Accessibility

- Rely on native element semantics (`<details>`, `<dialog>`, etc.) over ARIA
- `aria-current="page"` on active sidebar link
- `aria-expanded` on toggle buttons
- `aria-hidden="true"` on decorative icons
- `.vui-sr-only` for screen-reader-only text
- `user-select: none` on interactive summaries

## Things to Avoid

- No dark mode (light-only token system)
- No JavaScript in components -- pure HTML+CSS only
- No build tools for components
- No third-party CSS frameworks
- No CSS-in-JS or preprocessors
- Don't reference `--vui-*` tokens directly inside component rules -- always use `--_vui-*` private versions
