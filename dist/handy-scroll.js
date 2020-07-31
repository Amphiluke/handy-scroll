/*!
handy-scroll v1.0.2
https://amphiluke.github.io/handy-scroll/
(c) 2020 Amphiluke
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.handyScroll = factory());
}(this, (function () { 'use strict';

    var slice = Array.prototype.slice;
    var doc = document;
    var dom = {
      doc: doc,
      html: doc.documentElement,
      body: doc.body,
      $: function $(ref) {
        if (typeof ref === "string") {
          // ref is a selector
          return dom.body.querySelector(ref);
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
          return slice.call(dom.body.querySelectorAll(ref));
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
        instance.syncWidget();
        instance.addEventHandlers();
        instance.initResizeObserver();
      },
      initResizeObserver: function initResizeObserver() {
        var instance = this;
        instance.resizeObserver = new ResizeObserver(function () {
          instance.update();
        });
        instance.resizeObserver.observe(instance.container.firstChild);
      },
      initWidget: function initWidget() {
        var instance = this;
        var widget = instance.widget = dom.doc.createElement("div");
        widget.classList.add("handy-scroll");
        var strut = dom.doc.createElement("div");
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
              if (instance.visible) {
                instance.syncContainer(true);
              }
            }
          }
        }, {
          el: instance.container,
          handlers: {
            scroll: function scroll() {
              instance.syncWidget(true);
            },
            focusin: function focusin() {
              setTimeout(function () {
                return instance.syncWidget();
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
          var scrollMarginBottom = parseInt(window.getComputedStyle(widget).marginBottom);
          maxVisibleY -= scrollMarginBottom;
          mustHide = containerRect.bottom <= maxVisibleY || containerRect.top > maxVisibleY;
        }

        if (instance.visible === mustHide) {
          instance.visible = !mustHide; // We cannot simply hide the scrollbar since its scrollLeft property will not update in that case

          widget.classList.toggle("handy-scroll-hidden");
        }
      },
      syncContainer: function syncContainer(skipSyncWidget) {
        if (skipSyncWidget === void 0) {
          skipSyncWidget = false;
        }

        var instance = this; // Prevents next syncWidget function from changing scroll position

        if (instance.skipSyncContainer === true) {
          instance.skipSyncContainer = false;
          return;
        }

        instance.skipSyncWidget = skipSyncWidget;

        if (instance.container && instance.widget) {
          instance.container.scrollLeft = instance.widget.scrollLeft;
        }
      },
      syncWidget: function syncWidget(skipSyncContainer) {
        if (skipSyncContainer === void 0) {
          skipSyncContainer = false;
        }

        var instance = this; // Prevents next syncContainer function from changing scroll position

        if (instance.skipSyncWidget === true) {
          instance.skipSyncWidget = false;
          return;
        }

        instance.skipSyncContainer = skipSyncContainer;

        if (instance.widget && instance.container) {
          instance.widget.scrollLeft = instance.container.scrollLeft;
        }
      },
      // Recalculate scroll width and container boundaries
      update: function update() {
        var instance = this;
        var widget = instance.widget,
            container = instance.container,
            scrollBody = instance.scrollBody;
        widget.style.width = container.clientWidth + "px";

        if (!scrollBody) {
          widget.style.left = container.getBoundingClientRect().left + "px";
        }

        widget.firstElementChild.style.width = container.scrollWidth + "px";
        instance.syncWidget();
        instance.checkVisibility(); // fixes issue Amphiluke/floating-scroll#2
      },
      // Remove a scrollbar and all related event handlers
      destroy: function destroy() {
        var instance = this;
        instance.resizeObserver.disconnect();
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

    var instances = []; // if it were not for IE it would be better to use WeakMap (container -> instance)

    var handyScroll = {
      /**
       * Mount widgets in the given containers
       * @param {HTMLElement|NodeList|HTMLCollection|Array|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
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
       * @param {HTMLElement|NodeList|HTMLCollection|Array|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
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
       * @param {HTMLElement|NodeList|HTMLCollection|Array|String} containerRef - Widget container reference (either an element, or a list of elements, or a selector)
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
