import dom from "./dom.js";

let handyScrollProto = {
    init(container) {
        let instance = this;
        let scrollBodies = dom.$$(".handy-scroll-body")
            .filter(node => node.contains(container));
        if (scrollBodies.length) {
            instance.scrollBody = scrollBodies[0];
        }
        instance.container = container;
        instance.visible = true;
        instance.initWidget();
        instance.syncWidget();
        instance.addEventHandlers();
        instance.initResizeObserver();
    },

    initResizeObserver() {
        let instance = this;
        instance.resizeObserver = new ResizeObserver(() => {
            instance.update();
        });
        instance.resizeObserver.observe(instance.container.firstChild);
    },

    initWidget() {
        let instance = this;
        let widget = instance.widget = dom.doc.createElement("div");
        widget.classList.add("handy-scroll");
        let strut = dom.doc.createElement("div");
        strut.style.width = `${instance.container.scrollWidth}px`;
        widget.appendChild(strut);
        instance.container.appendChild(widget);
    },

    addEventHandlers() {
        let instance = this;
        let eventHandlers = instance.eventHandlers = [
            {
                el: instance.scrollBody || window,
                handlers: {
                    scroll() {
                        instance.checkVisibility();
                    },
                    resize() {
                        instance.update();
                    }
                }
            },
            {
                el: instance.widget,
                handlers: {
                    scroll() {
                        if (instance.visible) {
                            instance.syncContainer(true);
                        }
                    }
                }
            },
            {
                el: instance.container,
                handlers: {
                    scroll() {
                        instance.syncWidget(true);
                    },
                    focusin() {
                        setTimeout(() => instance.syncWidget(), 0);
                    }
                }
            }
        ];
        eventHandlers.forEach(({el, handlers}) => {
            Object.keys(handlers).forEach(event => el.addEventListener(event, handlers[event], false));
        });
    },

    checkVisibility() {
        let instance = this;
        let {widget, container, scrollBody} = instance;
        let mustHide = (widget.scrollWidth <= widget.offsetWidth);
        if (!mustHide) {
            let containerRect = container.getBoundingClientRect();
            let maxVisibleY = scrollBody ?
                scrollBody.getBoundingClientRect().bottom :
                window.innerHeight || dom.html.clientHeight;

            let scrollMarginBottom = parseInt(window.getComputedStyle(widget).marginBottom);

            maxVisibleY -= scrollMarginBottom;

            mustHide = ((containerRect.bottom <= maxVisibleY) || (containerRect.top > maxVisibleY));
        }
        if (instance.visible === mustHide) {
            instance.visible = !mustHide;
            // We cannot simply hide the scrollbar since its scrollLeft property will not update in that case
            widget.classList.toggle("handy-scroll-hidden");
        }
    },

    syncContainer(skipSyncWidget = false) {
        let instance = this;
        // Prevents next syncWidget function from changing scroll position
        if (instance.skipSyncContainer === true) {
            instance.skipSyncContainer = false;
            return;
        }
        instance.skipSyncWidget = skipSyncWidget;
        instance.container.scrollLeft = instance.widget.scrollLeft;
    },

    syncWidget(skipSyncContainer = false) {
        let instance = this;
        // Prevents next syncContainer function from changing scroll position
        if (instance.skipSyncWidget === true) {
            instance.skipSyncWidget = false;
            return;
        }
        instance.skipSyncContainer = skipSyncContainer;
        instance.widget.scrollLeft = instance.container.scrollLeft;
    },

    // Recalculate scroll width and container boundaries
    update() {
        let instance = this;
        let {widget, container, scrollBody} = instance;
        widget.style.width = `${container.clientWidth}px`;
        if (!scrollBody) {
            widget.style.left = `${container.getBoundingClientRect().left}px`;
        }
        widget.firstElementChild.style.width = `${container.scrollWidth}px`;
        instance.syncWidget();
        instance.checkVisibility(); // fixes issue Amphiluke/floating-scroll#2
    },

    // Remove a scrollbar and all related event handlers
    destroy() {
        let instance = this;
        instance.resizeObserver.disconnect();
        instance.eventHandlers.forEach(({el, handlers}) => {
            Object.keys(handlers).forEach(event => el.removeEventListener(event, handlers[event], false));
        });
        instance.widget.parentNode.removeChild(instance.widget);
        instance.eventHandlers = instance.widget = instance.container = instance.scrollBody = null;
    }
};

export default handyScrollProto;