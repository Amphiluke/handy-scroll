import css from "./handy-scroll.css?inline";

let getAttributeErrorMessage = (attribute) => `Attribute ‘${attribute}’ must reference a valid container ‘id’`;

class HandyScroll extends HTMLElement {
  static get observedAttributes() {
    return ["owner", "viewport"];
  }

  #internals = null;

  #viewport = null;
  #owner = null;
  #strut = null;

  #eventHandlers = new Map();
  #resizeObserver = null;

  #syncingOwner = true;
  #syncingComponent = true;

  get owner() {
    return this.getAttribute("owner");
  }
  set owner(ownerId) {
    this.setAttribute("owner", ownerId);
  }

  get viewport() {
    return this.getAttribute("viewport");
  }
  set viewport(viewportId) {
    this.setAttribute("viewport", viewportId);
  }

  get #isLatent() {
    return this.#internals.states.has("latent");
  }
  set #isLatent(value) {
    this.#internals.states[value ? "add" : "delete"]("latent");
  }

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: "open"});

    let style = document.createElement("style");
    style.textContent = css;
    shadowRoot.appendChild(style);

    this.#strut = document.createElement("div");
    this.#strut.classList.add("strut");
    shadowRoot.appendChild(this.#strut);

    this.#internals = this.attachInternals();
  }

  connectedCallback() {
    this.#bindOwner();
    this.#bindViewport();
    this.#addEventHandlers();
    this.#addResizeObserver();
    this.update();
  }

  disconnectedCallback() {
    this.#removeEventHandlers();
    this.#removeResizeObserver();
    this.#owner = this.#viewport = null;
  }

  attributeChangedCallback(name) {
    if (!this.#eventHandlers.size) { // handle only dynamic changes when the element is completely connected
      return;
    }
    if (name === "owner") {
      this.#bindOwner();
    } else if (name === "viewport") {
      this.#bindViewport();
    }
    this.#removeEventHandlers();
    this.#removeResizeObserver();
    this.#addEventHandlers();
    this.#addResizeObserver();
    this.update();
  }

  #bindOwner() {
    let ownerId = this.getAttribute("owner");
    this.#owner = document.getElementById(ownerId);
    if (!this.#owner) {
      throw new DOMException(getAttributeErrorMessage("owner"));
    }
  }

  #bindViewport() {
    if (!this.hasAttribute("viewport")) {
      this.#viewport = window;
      return;
    }
    let viewportId = this.getAttribute("viewport");
    this.#viewport = document.getElementById(viewportId);
    if (!this.#viewport) {
      throw new DOMException(getAttributeErrorMessage("viewport"));
    }
  }

  #addEventHandlers() {
    this.#eventHandlers.set(this.#viewport, {
      scroll: () => this.#recheckLatency(),
      ...(this.#viewport === window ? {resize: () => this.update()} : {}),
    });
    this.#eventHandlers.set(this, {
      scroll: () => {
        if (this.#syncingOwner && !this.#isLatent) {
          this.#syncOwner();
        }
        // Resume component->owner syncing after the component scrolling has finished
        // (it might be temporally disabled by the owner while syncing the component)
        this.#syncingOwner = true;
      },
    });
    this.#eventHandlers.set(this.#owner, {
      scroll: () => {
        if (this.#syncingComponent) {
          this.#syncComponent();
        }
        // Resume owner->component syncing after the owner scrolling has finished
        // (it might be temporally disabled by the component while syncing the owner)
        this.#syncingComponent = true;
      },
      focusin: () => {
        setTimeout(() => {
          // The widget might be destroyed before the timer is triggered (issue #14)
          if (this.isConnected) {
            this.#syncComponent();
          }
        }, 0);
      },
    });
    this.#eventHandlers.forEach((handlers, el) => {
      Object.entries(handlers).forEach(([event, handler]) => el.addEventListener(event, handler, false));
    });
  }

  #removeEventHandlers() {
    this.#eventHandlers.forEach((handlers, el) => {
      Object.entries(handlers).forEach(([event, handler]) => el.removeEventListener(event, handler, false));
    });
    this.#eventHandlers.clear();
  }

  #addResizeObserver() {
    if (this.#viewport === window) {
      return;
    }
    this.#resizeObserver = new ResizeObserver(([entry]) => {
      if (entry.contentBoxSize?.[0]?.inlineSize) {
        this.update();
      }
    });
    this.#resizeObserver.observe(this.#viewport);
  }

  #removeResizeObserver() {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
  }

  #syncOwner() {
    let {scrollLeft} = this;
    if (this.#owner.scrollLeft !== scrollLeft) {
      // Prevents owner’s “scroll” event handler from syncing back again the component’s scroll position
      this.#syncingComponent = false;
      // Note that this makes owner’s “scroll” event handlers execute
      this.#owner.scrollLeft = scrollLeft;
    }
  }

  #syncComponent() {
    let {scrollLeft} = this.#owner;
    if (this.scrollLeft !== scrollLeft) {
      // Prevents component’s “scroll” event handler from syncing back again the owner’s scroll position
      this.#syncingOwner = false;
      // Note that this makes component’s “scroll” event handlers execute
      this.scrollLeft = scrollLeft;
    }
  }

  #recheckLatency() {
    let isLatent = this.scrollWidth <= this.offsetWidth;
    if (!isLatent) {
      let ownerRect = this.#owner.getBoundingClientRect();
      let maxVisibleY = (this.#viewport === window) ?
        window.innerHeight || document.documentElement.clientHeight :
        this.#viewport.getBoundingClientRect().bottom;
      isLatent = ((ownerRect.bottom <= maxVisibleY) || (ownerRect.top > maxVisibleY));
    }
    if (this.#isLatent !== isLatent) {
      this.#isLatent = isLatent;
    }
  }

  update() {
    let {clientWidth, scrollWidth} = this.#owner;
    let {style} = this;
    style.width = `${clientWidth}px`;
    if (this.#viewport === window) {
      style.left = `${this.#owner.getBoundingClientRect().left}px`;
    }
    this.#strut.style.width = `${scrollWidth}px`;
    // Fit component height to the native scroll bar height if needed
    if (scrollWidth > clientWidth) {
      style.height = `${this.offsetHeight - this.clientHeight + 1}px`; // +1px JIC
    }
    this.#syncComponent();
    this.#recheckLatency(); // fixes issue Amphiluke/floating-scroll#2
  }
}

customElements.define("handy-scroll", HandyScroll);

export default HandyScroll;