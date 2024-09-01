declare class HandyScroll extends HTMLElement {
  #private;
  static get observedAttributes(): string[];
  get owner(): string | null;
  set owner(ownerId: string);
  get viewport(): string | null;
  set viewport(viewportId: string);
  constructor();
  connectedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(name: string): void;
  update(): void;
}
export default HandyScroll;
