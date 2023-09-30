/*!
handy-scroll v1.1.4
https://amphiluke.github.io/handy-scroll/
(c) 2023 Amphiluke
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.handyScroll = factory());
})(this, (function () { 'use strict';

    let slice = Array.prototype.slice;

    let dom = {
        // Precaution to avoid reference errors when imported for SSR (issue #13)
        isDOMAvailable: typeof document === "object" && !!document.documentElement,

        ready(handler) {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => void handler(), {once: true});
            } else {
                handler();
            }
        },

        $(ref) {
            if (typeof ref === "string") { // ref is a selector
                return document.body.querySelector(ref);
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
                return slice.call(document.body.querySelectorAll(ref));
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
            instance.addEventHandlers();
            // Set skipSync flags to their initial values (because update() above calls syncWidget())
            instance.skipSyncContainer = instance.skipSyncWidget = false;
        },

        initWidget() {
            let instance = this;
            let widget = instance.widget = document.createElement("div");
            widget.classList.add("handy-scroll");
            let strut = document.createElement("div");
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
                    window.innerHeight || document.documentElement.clientHeight;
                mustHide = ((containerRect.bottom <= maxVisibleY) || (containerRect.top > maxVisibleY));
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

    let instances = []; // if it were not for IE, it would be better to use Map (container -> instance)

    let handyScroll = {
        /**
         * Mount widgets in the given containers
         * @param {HTMLElement|NodeList|HTMLCollection|HTMLElement[]|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
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
         * @param {HTMLElement|NodeList|HTMLCollection|HTMLElement[]|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
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
         * @param {HTMLElement|NodeList|HTMLCollection|HTMLElement[]|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
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
        },

        /**
         * Destroy handyScroll widgets whose containers are not in the document anymore
         */
        destroyDetached() {
            instances = instances.filter(instance => {
                if (!document.body.contains(instance.container)) {
                    instance.destroy();
                    return false;
                }
                return true;
            });
        }
    };

    if (dom.isDOMAvailable) {
        dom.ready(() => {
            handyScroll.mount("[data-handy-scroll]");
        });
    }

    return handyScroll;

}));
