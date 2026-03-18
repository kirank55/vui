/* ============================================================
   vui-tabs.js  --  Tabs Web Component
   Vanilla Custom Element — no dependencies, no build step.
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


// ── Assets ───────────────────────────────────────────────────
//
// Both the stylesheet and the HTML template are fetched once at module load
// and shared across all instances. import.meta.url keeps paths relative to
// this file rather than the page that loads it.

const sharedSheet = new CSSStyleSheet();

/** Resolves when both CSS and the template <template> node are ready. */
const assetsReady = Promise.all([
  // CSS → shared CSSStyleSheet
  fetch(new URL('./vui-tabs.css', import.meta.url))
    .then(r => r.text())
    .then(css => sharedSheet.replace(css)),

  // HTML → shared <template> element
  fetch(new URL('./vui-tabs.html', import.meta.url))
    .then(r => r.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.querySelector('#vui-tabs-tmpl');
    }),
]).then(([, tmpl]) => tmpl); // expose only the template node


// ── Component ────────────────────────────────────────────────

class VuiTabs extends HTMLElement {

  /** @type {HTMLElement[]} */ #tabBtns = [];
  /** @type {HTMLElement[]} */ #panelWrappers = [];
  /** @type {number}        */ #activeIndex = 0;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const tmpl = await assetsReady;
    this.shadowRoot.adoptedStyleSheets = [sharedSheet];
    this.#render(tmpl);
    this.#movePill();
  }

  // ── Private methods ────────────────────────────────────────

  /**
   * Clone the shared template into shadow DOM, then populate tabs and panels
   * from the slotted light-DOM children.
   *
   * @param {HTMLTemplateElement} tmpl
   */
  #render(tmpl) {
    const shadow = this.shadowRoot;

    // Clear any previous render (re-entry safe), keep pill style if present
    shadow.querySelectorAll(':not(#vui-pill-style)').forEach(el => el.remove());

    // Stamp out the structural skeleton from the template
    const fragment = tmpl.content.cloneNode(true);
    shadow.appendChild(fragment);

    const tablist     = shadow.querySelector('.tablist');
    const panelWrapper = shadow.querySelector('.panel-wrapper');

    // Collect slotted tabs and panels from light DOM
    const tabSlots   = [...this.querySelectorAll('[slot="tab"]')];
    const panelSlots = [...this.querySelectorAll('[slot="panel"]')];
    const count = Math.min(tabSlots.length, panelSlots.length);

    if (count === 0) return;

    tablist.setAttribute('aria-label', this.getAttribute('label') || 'Tabs');
    // CSS var drives the pill width; set once, never changes
    tablist.style.setProperty('--_pill-width', `${100 / count}%`);

    // ── Tab buttons
    this.#tabBtns = tabSlots.slice(0, count).map((slotEl, i) => {
      const tabId   = `vui-tab-${this.#uid()}-${i}`;
      const panelId = `vui-panel-${this.#uid()}-${i}`;

      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.setAttribute('role',          'tab');
      btn.setAttribute('id',            tabId);
      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('tabindex',      i === 0 ? '0' : '-1');
      btn.textContent = slotEl.textContent.trim();

      btn.addEventListener('click',   () => this.#activate(i));
      btn.addEventListener('keydown', (e) => this.#handleKey(e));

      tablist.appendChild(btn);
      return btn;
    });

    // ── Panels
    this.#panelWrappers = panelSlots.slice(0, count).map((slotEl, i) => {
      const panelId = `vui-panel-${this.#uid()}-${i}`;
      const tabId   = `vui-tab-${this.#uid()}-${i}`;

      const wrapper = document.createElement('div');
      wrapper.className = 'panel-slot-wrapper' + (i === 0 ? ' is-active' : '');
      wrapper.setAttribute('role',            'tabpanel');
      wrapper.setAttribute('id',              panelId);
      wrapper.setAttribute('aria-labelledby', tabId);
      wrapper.setAttribute('tabindex',        '0');
      // Clone content into shadow DOM (non-destructive; light DOM stays intact)
      wrapper.innerHTML = slotEl.innerHTML;

      panelWrapper.appendChild(wrapper);
      return wrapper;
    });
  }

  /** Switch to the given tab index and dispatch a change event. */
  #activate(index) {
    this.#activeIndex = index;

    this.#tabBtns.forEach((btn, i) => {
      const active = i === index;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.setAttribute('tabindex',      active ? '0'    : '-1');
    });

    this.#panelWrappers.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === index);
    });

    this.#movePill();

    this.dispatchEvent(new CustomEvent('vui-tab-change', {
      bubbles: true,
      detail: { index },
    }));
  }

  /**
   * Move the sliding pill to the active tab.
   *
   * Because ::before pseudo-elements can't be targeted from JS directly,
   * we inject a tiny scoped <style> block that overrides the transform.
   */
  #movePill() {
    const tablist = this.shadowRoot?.querySelector('.tablist');
    if (!tablist) return;

    let dynStyle = this.shadowRoot.querySelector('#vui-pill-style');

    if (!dynStyle) {
      dynStyle = document.createElement('style');
      dynStyle.id = 'vui-pill-style';
      this.shadowRoot.appendChild(dynStyle);
    }

    dynStyle.textContent = `
      .tablist::before {
        transform: translateX(${this.#activeIndex * 100}%);
      }
    `;
  }

  /** Handle keyboard navigation within the tab bar (ARIA pattern). */
  #handleKey(e) {
    const count = this.#tabBtns.length;
    let next = this.#activeIndex;

    switch (e.key) {
      case 'ArrowRight': next = (this.#activeIndex + 1) % count;         break;
      case 'ArrowLeft':  next = (this.#activeIndex - 1 + count) % count; break;
      case 'Home':       next = 0;                                        break;
      case 'End':        next = count - 1;                                break;
      default: return;
    }

    e.preventDefault();
    this.#activate(next);
    this.#tabBtns[next].focus();
  }

  /**
   * Returns a short random suffix, stable per element instance,
   * to prevent ID collisions when multiple <vui-tabs> exist on the page.
   */
  #uid() {
    if (!this.__uid) {
      this.__uid = Math.random().toString(36).slice(2, 7);
    }
    return this.__uid;
  }
}


// ── Register ─────────────────────────────────────────────────

customElements.define('vui-tabs', VuiTabs);
