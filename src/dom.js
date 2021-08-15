let slice = Array.prototype.slice;

// Precaution to avoid reference errors when imported for SSR (issue #13)
let isDOMAvailable = typeof document === "object" && !!document.documentElement;

let dom = {
    isDOMAvailable,

    doc: isDOMAvailable ? document : null,
    html: isDOMAvailable ? document.documentElement : null,
    body: isDOMAvailable ? document.body : null,

    ready(handler) {
        if (dom.doc.readyState === "loading") {
            dom.doc.addEventListener("DOMContentLoaded", () => void handler(), {once: true});
        } else {
            handler();
        }
    },

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

export default dom;
