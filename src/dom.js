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

export default dom;
