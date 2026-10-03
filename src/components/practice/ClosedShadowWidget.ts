// A custom element whose shadow root is CLOSED: host.shadowRoot is null, so
// querySelector and Playwright's shadow piercing cannot reach the input.
export const CLOSED_SHADOW_TAG = 'closed-shadow-widget';

export function defineClosedShadowWidget() {
  if (customElements.get(CLOSED_SHADOW_TAG)) return;

  class ClosedShadowWidget extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'closed' });
      root.innerHTML = `
        <style>
          :host { display: inline-flex; flex-wrap: wrap; max-width: 100%; gap: 8px; align-items: center; }
          input { min-width: 0; max-width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; }
          button { padding: 8px 16px; border: 0; border-radius: 8px; background: #4f46e5; color: #fff; font: inherit; cursor: pointer; }
        </style>
        <input type="text" aria-label="Closed shadow input" placeholder="Type here" />
        <button type="button">Submit</button>
      `;
      const input = root.querySelector('input') as HTMLInputElement;
      root.querySelector('button')!.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('widget-submit', {
          detail: { value: input.value },
          bubbles: true,
          composed: true,
        }));
      });
    }
  }

  customElements.define(CLOSED_SHADOW_TAG, ClosedShadowWidget);
}
