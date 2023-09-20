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
        instance.update(); // recalculate scrollbar parameters and set its visibility
        instance.addEventHandlers();
        // Set skipSync flags to their initial values (because update() above calls syncWidget())
        instance.skipSyncContainer = instance.skipSyncWidget = false;
    },

    initWidget() {
        let instance = this;
        let widget = instance.widget = dom.doc().createElement("div");
        widget.classList.add("handy-scroll");
        let strut = dom.doc().createElement("div");
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
                        if (instance.visible && !instance.skipSyncContainer) {
                            instance.syncContainer();
                        }
                        // Resume widget->container syncing after the widget scrolling has finished
                        // (it might be temporally disabled by the container while syncing the widget)
                        instance.skipSyncContainer = false;
                    }
                }
            },
            {
                el: instance.container,
                handlers: {
                    scroll() {
                        if (!instance.skipSyncWidget) {
                            instance.syncWidget();
                        }
                        // Resume container->widget syncing after the container scrolling has finished
                        // (it might be temporally disabled by the widget while syncing the container)
                        instance.skipSyncWidget = false;
                    },
                    focusin() {
                        setTimeout(() => {
                            // The widget might be destroyed before the timer is triggered (issue #14)
                            if (instance.widget) {
                                instance.syncWidget();
                            }
                        }, 0);
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
            mustHide = ((containerRect.bottom <= maxVisibleY) || (containerRect.top > maxVisibleY));

            if (scrollBody) {
                widget.style.bottom = `calc(100% - ${scrollBody.getBoundingClientRect().bottom}px`;
            }
        }
        if (instance.visible === mustHide) {
            instance.visible = !mustHide;
            // We cannot simply hide the scrollbar since its scrollLeft property will not update in that case
            widget.classList.toggle("handy-scroll-hidden");
        }
    },

    syncContainer() {
        let instance = this;
        let {scrollLeft} = instance.widget;
        if (instance.container.scrollLeft !== scrollLeft) {
            // Prevents container’s “scroll” event handler from syncing back again widget scroll position
            instance.skipSyncWidget = true;
            // Note that this makes container’s “scroll” event handlers execute
            instance.container.scrollLeft = scrollLeft;
        }
    },

    syncWidget() {
        let instance = this;
        let {scrollLeft} = instance.container;
        if (instance.widget.scrollLeft !== scrollLeft) {
            // Prevents widget’s “scroll” event handler from syncing back again container scroll position
            instance.skipSyncContainer = true;
            // Note that this makes widget’s “scroll” event handlers execute
            instance.widget.scrollLeft = scrollLeft;
        }
    },

    // Recalculate scroll width and container boundaries
    update() {
        let instance = this;
        let {widget, container, scrollBody} = instance;
        let {clientWidth, scrollWidth} = container;
        widget.style.width = `${clientWidth}px`;
        if (!scrollBody) {
            widget.style.left = `${container.getBoundingClientRect().left}px`;
        }
        widget.firstElementChild.style.width = `${scrollWidth}px`;
        // Fit widget height to the native scroll bar height if needed
        if (scrollWidth > clientWidth) {
            widget.style.height = `${widget.offsetHeight - widget.clientHeight + 1}px`; // +1px JIC
        }
        instance.syncWidget();
        instance.checkVisibility(); // fixes issue Amphiluke/floating-scroll#2
    },

    // Remove a scrollbar and all related event handlers
    destroy() {
        let instance = this;
        instance.eventHandlers.forEach(({el, handlers}) => {
            Object.keys(handlers).forEach(event => el.removeEventListener(event, handlers[event], false));
        });
        instance.widget.parentNode.removeChild(instance.widget);
        instance.eventHandlers = instance.widget = instance.container = instance.scrollBody = null;
    }
};

export default handyScrollProto;