/*!
handy-scroll v1.1.3
https://amphiluke.github.io/handy-scroll/
(c) 2023 Amphiluke
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.handyScroll = factory());
})(this, (function () { 'use strict';

    var slice = Array.prototype.slice;

    // Precaution to avoid reference errors when imported for SSR (issue #13)
    var isDOMAvailable = typeof document === "object" && !!document.documentElement;
    var dom = {
      isDOMAvailable: isDOMAvailable,
      doc: function doc() {
        return isDOMAvailable ? document : null;
      },
      html: function html() {
        return isDOMAvailable ? document.documentElement : null;
      },
      body: function body() {
        return isDOMAvailable ? document.body : null;
      },
      ready: function ready(handler) {
        if (dom.doc().readyState === "loading") {
          dom.doc().addEventListener("DOMContentLoaded", function () {
            return void handler();
          }, {
            once: true
          });
        } else {
          handler();
        }
      },
      $: function $(ref) {
        if (typeof ref === "string") {
          // ref is a selector
          return dom.body().querySelector(ref);
        }
        return ref; // ref is already an element
      },
      $$: function $$(ref) {
        if (Array.isArray(ref)) {
          // ref is an array of elements
          return ref;
        }
        if (ref.nodeType === Node.ELEMENT_NODE) {
          // ref is an element
          return [ref];
        }
        if (typeof ref === "string") {
          // ref is a selector
          return slice.call(dom.body().querySelectorAll(ref));
        }
        return slice.call(ref); // ref is an array-like object (NodeList or HTMLCollection)
      }
    };

    var handyScrollProto = {
      init: function init(container) {
        var instance = this;
        var scrollBodies = dom.$$(".handy-scroll-body").filter(function (node) {
          return node.contains(container);
        });
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
      initWidget: function initWidget() {
        var instance = this;
        var widget = instance.widget = dom.doc().createElement("div");
        widget.classList.add("handy-scroll");
        var strut = dom.doc().createElement("div");
        strut.style.width = instance.container.scrollWidth + "px";
        widget.appendChild(strut);
        instance.container.appendChild(widget);
      },
      addEventHandlers: function addEventHandlers() {
        var instance = this;
        var eventHandlers = instance.eventHandlers = [{
          el: instance.scrollBody || window,
          handlers: {
            scroll: function scroll() {
              instance.checkVisibility();
            },
            resize: function resize() {
              instance.update();
            }
          }
        }, {
          el: instance.widget,
          handlers: {
            scroll: function scroll() {
              if (instance.visible && !instance.skipSyncContainer) {
                instance.syncContainer();
              }
              // Resume widget->container syncing after the widget scrolling has finished
              // (it might be temporally disabled by the container while syncing the widget)
              instance.skipSyncContainer = false;
            }
          }
        }, {
          el: instance.container,
          handlers: {
            scroll: function scroll() {
              if (!instance.skipSyncWidget) {
                instance.syncWidget();
              }
              // Resume container->widget syncing after the container scrolling has finished
              // (it might be temporally disabled by the widget while syncing the container)
              instance.skipSyncWidget = false;
            },
            focusin: function focusin() {
              setTimeout(function () {
                // The widget might be destroyed before the timer is triggered (issue #14)
                if (instance.widget) {
                  instance.syncWidget();
                }
              }, 0);
            }
          }
        }];
        eventHandlers.forEach(function (_ref) {
          var el = _ref.el,
            handlers = _ref.handlers;
          Object.keys(handlers).forEach(function (event) {
            return el.addEventListener(event, handlers[event], false);
          });
        });
      },
      checkVisibility: function checkVisibility() {
        var instance = this;
        var widget = instance.widget,
          container = instance.container,
          scrollBody = instance.scrollBody;
        var mustHide = widget.scrollWidth <= widget.offsetWidth;
        if (!mustHide) {
          var containerRect = container.getBoundingClientRect();
          var maxVisibleY = scrollBody ? scrollBody.getBoundingClientRect().bottom : window.innerHeight || dom.html.clientHeight;
          mustHide = containerRect.bottom <= maxVisibleY || containerRect.top > maxVisibleY;
        }
        if (instance.visible === mustHide) {
          instance.visible = !mustHide;
          // We cannot simply hide the scrollbar since its scrollLeft property will not update in that case
          widget.classList.toggle("handy-scroll-hidden");
        }
      },
      syncContainer: function syncContainer() {
        var instance = this;
        var scrollLeft = instance.widget.scrollLeft;
        if (instance.container.scrollLeft !== scrollLeft) {
          // Prevents container’s “scroll” event handler from syncing back again widget scroll position
          instance.skipSyncWidget = true;
          // Note that this makes container’s “scroll” event handlers execute
          instance.container.scrollLeft = scrollLeft;
        }
      },
      syncWidget: function syncWidget() {
        var instance = this;
        var scrollLeft = instance.container.scrollLeft;
        if (instance.widget.scrollLeft !== scrollLeft) {
          // Prevents widget’s “scroll” event handler from syncing back again container scroll position
          instance.skipSyncContainer = true;
          // Note that this makes widget’s “scroll” event handlers execute
          instance.widget.scrollLeft = scrollLeft;
        }
      },
      // Recalculate scroll width and container boundaries
      update: function update() {
        var instance = this;
        var widget = instance.widget,
          container = instance.container,
          scrollBody = instance.scrollBody;
        var clientWidth = container.clientWidth,
          scrollWidth = container.scrollWidth;
        widget.style.width = clientWidth + "px";
        if (!scrollBody) {
          widget.style.left = container.getBoundingClientRect().left + "px";
        }
        widget.firstElementChild.style.width = scrollWidth + "px";
        // Fit widget height to the native scroll bar height if needed
        if (scrollWidth > clientWidth) {
          widget.style.height = widget.offsetHeight - widget.clientHeight + 1 + "px"; // +1px JIC
        }

        instance.syncWidget();
        instance.checkVisibility(); // fixes issue Amphiluke/floating-scroll#2
      },
      // Remove a scrollbar and all related event handlers
      destroy: function destroy() {
        var instance = this;
        instance.eventHandlers.forEach(function (_ref2) {
          var el = _ref2.el,
            handlers = _ref2.handlers;
          Object.keys(handlers).forEach(function (event) {
            return el.removeEventListener(event, handlers[event], false);
          });
        });
        instance.widget.parentNode.removeChild(instance.widget);
        instance.eventHandlers = instance.widget = instance.container = instance.scrollBody = null;
      }
    };

    var instances = []; // if it were not for IE, it would be better to use Map (container -> instance)

    var handyScroll = {
      /**
       * Mount widgets in the given containers
       * @param {HTMLElement|NodeList|HTMLCollection|HTMLElement[]|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
       */
      mount: function mount(containerRef) {
        dom.$$(containerRef).forEach(function (container) {
          if (handyScroll.mounted(container)) {
            return;
          }
          var instance = Object.create(handyScrollProto);
          instances.push(instance);
          instance.init(container);
        });
      },
      /**
       * Check if a widget is already mounted in the given container
       * @param {HTMLElement|String} containerRef - Widget container reference (either an element, or a selector)
       * @returns {Boolean}
       */
      mounted: function mounted(containerRef) {
        var container = dom.$(containerRef);
        return instances.some(function (instance) {
          return instance.container === container;
        });
      },
      /**
       * Update widget parameters and position
       * @param {HTMLElement|NodeList|HTMLCollection|HTMLElement[]|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
       */
      update: function update(containerRef) {
        dom.$$(containerRef).forEach(function (container) {
          instances.some(function (instance) {
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
      destroy: function destroy(containerRef) {
        dom.$$(containerRef).forEach(function (container) {
          instances.some(function (instance, index) {
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
      destroyDetached: function destroyDetached() {
        instances = instances.filter(function (instance) {
          if (!dom.body().contains(instance.container)) {
            instance.destroy();
            return false;
          }
          return true;
        });
      }
    };
    if (dom.isDOMAvailable) {
      dom.ready(function () {
        handyScroll.mount("[data-handy-scroll]");
      });
    }

    return handyScroll;

}));
