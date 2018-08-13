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

export default dom;