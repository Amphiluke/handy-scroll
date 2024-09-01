{

let doc = document;
let {body} = doc;
let {handyScroll} = window;

let dom = {
    $i(id) {
        return doc.getElementById(id);
    },
    $t(className, context = body) {
        return Array.from(context.getElementsByTagName(className));
    },
    $c(className, context = body) {
        return Array.from(context.getElementsByClassName(className));
    },
    $(selector, context = body) {
        return context.querySelector(selector);
    },
    $$(selector, context = body) {
        return Array.from(context.querySelectorAll(selector));
    }
};

// region Handscroll gallery

let handscrollsContainer = dom.$i("handscrolls");
let handscrolls = dom.$t("img", handscrollsContainer);
handscrollsContainer.scrollLeft = handscrollsContainer.scrollWidth;

dom.$i("handscrolls-nav").addEventListener("click", ({target}) => {
    if (target.matches("span:not(.active)")) {
        Array.from(target.parentNode.children).forEach((span, index) => {
            let isActive = span === target;
            span.classList.toggle("active", isActive);
            handscrolls[index].classList.toggle("active", isActive);
        });
        handscrollsContainer.scrollLeft = handscrollsContainer.scrollWidth;
        handyScroll.update(handscrollsContainer);
    }
});

dom.$i("handscrolls-toggle").addEventListener("click", ({target}) => {
    let mounted = handyScroll.mounted(handscrollsContainer);
    target.classList.toggle("disabled", mounted);
    handyScroll[mounted ? "destroy" : "mount"](handscrollsContainer);
});

// endregion


// region Handscroll popup

let popupContainer = dom.$i("qingming-fest");

dom.$i("hs-open-popup").addEventListener("click", e => {
    let popup = dom.$i("hs-popup");
    popup.classList.toggle("hs-popup-hidden");
    if (popup.classList.contains("hs-popup-hidden")) {
        return;
    }
    popupContainer.scrollLeft = popupContainer.scrollWidth;
    let update = () => handyScroll.update(popupContainer);
    update();
    e.stopPropagation();

    // See css/main.less
    let mql = window.matchMedia && window.matchMedia("(max-width:719px), (max-height:569px)");
    if (mql && mql.addEventListener) {
        mql.addEventListener("change", update);
    } else {
        mql = null;
    }

    doc.addEventListener("click", function popupOutClick({target}) {
        if (target.classList.contains("hs-popup-close") || !popup.contains(target)) {
            popup.classList.add("hs-popup-hidden");
            doc.removeEventListener("click", popupOutClick, false);
            if (mql) {
                mql.removeEventListener("change", update);
            }
        }
    }, false);
}, false);

// endregion


// region Unobtrusive mode

dom.$i("is-unobtrusive").addEventListener("change", ({target: {checked}}) => {
    dom.$c("hs-demo").forEach(node => {
        node.classList.toggle("handy-scroll-hoverable", checked);
    });
}, false);

// endregion


handyScroll.mount(".hs-demo");

}
