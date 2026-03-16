/* ============================================================
   vui-tabs.js  --  Tabs Web Component
   Vanilla Custom Element (no dependencies, no build step).
   Uses Shadow DOM for style encapsulation.
   Usage:
     <script type="module" src="vui-tabs.js"></script>
     <vui-tabs>
       <button slot="tab">One</button>
       <button slot="tab">Two</button>
       <div slot="panel">Panel one content</div>
       <div slot="panel">Panel two content</div>
     </vui-tabs>
   ============================================================ */

const STYLES = /* css */`
  :host {
    /* Design token integration — reads from page :root when available,
       falls back to hardcoded values so it works without global.css     */
    --_bg-elevated:  var(--vui-bg-elevated,  #ffffff);
    --_bg-surface:   var(--vui-bg-surface,   #f2f2f2);
    --_fg:           var(--vui-fg,           #1a1a1a);
    --_fg-muted:     var(--vui-fg-muted,     #6b6b6b);
    --_border:       var(--vui-border,       #d4d4d4);
    --_radius-lg:    var(--vui-radius-lg,    10px);
    --_duration:     var(--vui-duration,     150ms);
    --_font-sans:    var(--vui-font-sans,    "Inter", "Segoe UI", system-ui, sans-serif);
    --_shadow-sm:    var(--vui-shadow-sm,    0 1px 3px rgba(0,0,0,0.08));

    display: block;
    font-family: var(--_font-sans);
    box-sizing: border-box;
  }

  *, *::before, *::after { box-sizing: inherit; }

  /* ---- Tab bar ---- */

  [role="tablist"] {
    position: relative;
    display: flex;
    padding: 0.25rem;
    border: 1px solid var(--_border);
    border-radius: 999px;
    background: var(--_bg-surface);
    margin-bottom: 1rem;
  }

  /* Sliding pill indicator */
  [role="tablist"]::before {
    content: "";
    position: absolute;
    top: 0.25rem;
    bottom: 0.25rem;
    left: 0.25rem;
    width: var(--_pill-width, 33.333%);
    border-radius: 999px;
    background: var(--_bg-elevated);
    box-shadow: var(--_shadow-sm);
    transition: transform var(--_duration) cubic-bezier(0.25, 1, 0.5, 1),
                width var(--_duration) cubic-bezier(0.25, 1, 0.5, 1);
    z-index: 0;
    pointer-events: none;
  }

  /* ---- Individual tab buttons ---- */

  .tab-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0.7rem 1rem;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--_fg-muted);
    font-family: var(--_font-sans);
    font-size: inherit;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    transition: color 200ms ease;
  }

  .tab-btn[aria-selected="true"] {
    color: var(--_fg);
  }

  .tab-btn:focus-visible {
    outline: 2px solid var(--_fg);
    outline-offset: -3px;
    border-radius: 999px;
  }

  /* ---- Panels ---- */

  .panel-wrapper {
    border: 1px solid var(--_border);
    border-radius: var(--_radius-lg);
    background: var(--_bg-elevated);
    overflow: hidden;
  }

  .panel-slot-wrapper {
    display: none;
    padding: 1rem 1.1rem;
  }

  .panel-slot-wrapper.is-active {
    display: block;
  }

  /* ---- Responsive ---- */

  @media (max-width: 768px) {
    .tab-btn {
      min-height: 36px;
      padding: 0.5rem 0.6rem;
      font-size: 0.875rem;
    }
  }
`;

class VuiTabs extends HTMLElement {
  /** @type {HTMLElement[]} */
  #tabBtns = [];
  /** @type {HTMLElement[]} */
  #panelWrappers = [];
  /** @type {number} */
  #activeIndex = 0;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.#render();
    this.#syncPill();
  }

  #render() {
    const shadow = this.shadowRoot;
    shadow.innerHTML = '';

    // Styles
    const sheet = document.createElement('style');
    sheet.textContent = STYLES;
    shadow.appendChild(sheet);

    // Collect slotted tabs and panels from light DOM
    const tabSlots = [...this.querySelectorAll('[slot="tab"]')];
    const panelSlots = [...this.querySelectorAll('[slot="panel"]')];
    const count = Math.min(tabSlots.length, panelSlots.length);

    if (count === 0) return;

    // ---- Tab bar ----
    const tablist = document.createElement('div');
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', this.getAttribute('label') || 'Tabs');

    this.#tabBtns = tabSlots.slice(0, count).map((slotEl, i) => {
      const id = `vui-tab-${this.#uid()}-${i}`;
      const panelId = `vui-panel-${this.#uid()}-${i}`;

      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('id', id);
      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
      // Copy the text / children from the slot element
      btn.textContent = slotEl.textContent.trim();

      btn.addEventListener('click', () => this.#activate(i));
      btn.addEventListener('keydown', (e) => this.#handleKey(e));

      tablist.appendChild(btn);
      return btn;
    });

    shadow.appendChild(tablist);

    // ---- Panels ----
    const panelWrapper = document.createElement('div');
    panelWrapper.className = 'panel-wrapper';

    this.#panelWrappers = panelSlots.slice(0, count).map((slotEl, i) => {
      const panelId = `vui-panel-${this.#uid()}-${i}`;
      const tabId   = `vui-tab-${this.#uid()}-${i}`;

      const wrapper = document.createElement('div');
      wrapper.className = 'panel-slot-wrapper' + (i === 0 ? ' is-active' : '');
      wrapper.setAttribute('role', 'tabpanel');
      wrapper.setAttribute('id', panelId);
      wrapper.setAttribute('aria-labelledby', tabId);
      wrapper.setAttribute('tabindex', '0');

      // Move panel content into shadow DOM
      // Clone so slotted element stays in light DOM (non-destructive)
      wrapper.innerHTML = slotEl.innerHTML;

      panelWrapper.appendChild(wrapper);
      return wrapper;
    });

    shadow.appendChild(panelWrapper);

    // Set pill width CSS var based on tab count
    tablist.style.setProperty('--_pill-width', `${100 / count}%`);
  }

  #activate(index) {
    this.#activeIndex = index;

    this.#tabBtns.forEach((btn, i) => {
      const active = i === index;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.setAttribute('tabindex', active ? '0' : '-1');
    });

    this.#panelWrappers.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === index);
    });

    this.#syncPill();

    // Dispatch event so host page can listen
    this.dispatchEvent(new CustomEvent('vui-tab-change', {
      bubbles: true,
      detail: { index }
    }));
  }

  #syncPill() {
    const tablist = this.shadowRoot?.querySelector('[role="tablist"]');
    if (!tablist) return;
    tablist.style.setProperty(
      '--_pill-transform',
      `translateX(${this.#activeIndex * 100}%)`
    );
    tablist.style.setProperty('transform', ''); // nudge repaint
    // Apply transform to the ::before pseudo via a CSS var
    tablist.style.setProperty('--_pill-offset', `${this.#activeIndex}`);

    // Drive the pseudo-element via a data attribute trick:
    // we inline the transform as a CSS custom property on the element itself
    tablist.style.cssText = tablist.style.cssText; // force recalc
    // Actually, drive it with a direct inline style override using @property-less approach:
    this.#drivePill(tablist);
  }

  /**
   * Because we can't target ::before from JS directly, we inject a tiny
   * scoped <style> block into the shadow root that overrides the transform.
   */
  #drivePill(tablist) {
    let dynStyle = this.shadowRoot.querySelector('#vui-dynamic');
    if (!dynStyle) {
      dynStyle = document.createElement('style');
      dynStyle.id = 'vui-dynamic';
      this.shadowRoot.appendChild(dynStyle);
    }
    dynStyle.textContent = `
      [role="tablist"]::before {
        transform: translateX(${this.#activeIndex * 100}%);
      }
    `;
  }

  #handleKey(e) {
    const count = this.#tabBtns.length;
    let next = this.#activeIndex;

    switch (e.key) {
      case 'ArrowRight': next = (this.#activeIndex + 1) % count; break;
      case 'ArrowLeft':  next = (this.#activeIndex - 1 + count) % count; break;
      case 'Home':       next = 0; break;
      case 'End':        next = count - 1; break;
      default: return;
    }

    e.preventDefault();
    this.#activate(next);
    this.#tabBtns[next].focus();
  }

  /** Short unique suffix to avoid ID collisions when multiple instances exist. */
  #uid() {
    if (!this.__uid) {
      this.__uid = Math.random().toString(36).slice(2, 7);
    }
    return this.__uid;
  }
}

customElements.define('vui-tabs', VuiTabs);
