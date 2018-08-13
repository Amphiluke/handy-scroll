import dom from "./dom.js";
import handyScrollProto from "./handy-scroll-proto";

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

export default handyScroll;

function autoInit() {
    handyScroll.mount("[data-handy-scroll]");
}

if (dom.doc.readyState === "loading") {
    dom.doc.addEventListener("DOMContentLoaded", autoInit, false);
} else {
    autoInit();
}