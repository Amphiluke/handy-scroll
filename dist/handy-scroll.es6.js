/*!
handy-scroll v1.0.0
https://amphiluke.github.io/handy-scroll/
(c) 2018 Amphiluke
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.handyScroll = factory());
}(this, (function () { 'use strict';

    let slice = Array.prototype.slice;
    let doc = document;

    let dom = {
        doc,
        html: doc.documentElement,
        body: doc.body,

        $(ref) {
            if (typeof ref === "string") { // ref is a selector
                return dom.body.querySelector(ref);
            }
            return ref; // ref is already an element
        },

        $$(ref) {
            if (Array.isArray(ref)) { // ref is an array of elements
                return ref;
            }
            if (ref.nodeType === Node.ELEMENT_NODE) { // ref is an element
                return [ref];
            }
            if (typeof ref === "string") { // ref is a selector
                return slice.call(dom.body.querySelectorAll(ref));
            }
            return slice.call(ref); // ref is an array-like object (NodeList or HTMLCollection)
        }
    };

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
            instance.syncWidget();
            instance.addEventHandlers();
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
            let containerRect = container.getBoundingClientRect();
            widget.style.width = `${containerRect.width}px`;
            if (!scrollBody) {
                widget.style.left = `${containerRect.left}px`;
            }
            widget.firstElementChild.style.width = `${container.scrollWidth}px`;
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

    let instances = []; // if it were not for IE it would be better to use WeakMap (container -> instance)

    let handyScroll = {
        /**
         * Mount widgets in the given containers
         * @param {HTMLElement|NodeList|HTMLCollection|Array|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
         */
        mount(containerRef) {
            dom.$$(containerRef).forEach(container => {
                if (handyScroll.mounted(container)) {
                    return;
                }
                let instance = Object.create(handyScrollProto);
                instances.push(instance);
                instance.init(container);
            });
        },

        /**
         * Check if a widget is already mounted in the given container
         * @param {HTMLElement|String} containerRef - Widget container reference (either an element, or a selector)
         * @returns {Boolean}
         */
        mounted(containerRef) {
            let container = dom.$(containerRef);
            return instances.some(instance => instance.container === container);
        },

        /**
         * Update widget parameters and position
         * @param {HTMLElement|NodeList|HTMLCollection|Array|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
         */
        update(containerRef) {
            dom.$$(containerRef).forEach(container => {
                instances.some(instance => {
                    if (instance.container === container) {
                        instance.update();
                        return true;
                    }
                    return false;
                });
            });
        },

        /**
         * Destroy widgets mounted in the given containers
         * @param {HTMLElement|NodeList|HTMLCollection|Array|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
         */
        destroy(containerRef) {
            dom.$$(containerRef).forEach(container => {
                instances.some((instance, index) => {
                    if (instance.container === container) {
                        instances.splice(index, 1)[0].destroy();
                        return true;
                    }
                    return false;
                });
            });
        }
    };

    function autoInit() {
        handyScroll.mount("[data-handy-scroll]");
    }

    if (dom.doc.readyState === "loading") {
        dom.doc.addEventListener("DOMContentLoaded", autoInit, false);
    } else {
        autoInit();
    }

    return handyScroll;

})));
