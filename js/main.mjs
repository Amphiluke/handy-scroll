let doc = document;
let {body} = doc;

let dom = {
  $i(id) {
    return doc.getElementById(id);
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
handscrollsContainer.scrollLeft = handscrollsContainer.scrollWidth;

dom.$i("handscrolls-nav").addEventListener("change", () => {
  handscrollsContainer.scrollLeft = handscrollsContainer.scrollWidth;
  dom.$("handy-scroll[owner='handscrolls']").update();
});

// endregion


// region Handscroll popup

dom.$i("hs-open-popup").addEventListener("click", () => {
  let popup = dom.$i("hs-popup");
  popup.showModal();
  let popupContainer = dom.$i("qingming-fest");
  popupContainer.scrollLeft = popupContainer.scrollWidth;
  dom.$("handy-scroll[owner='qingming-fest']").update();
}, false);

dom.$i("hs-popup-close").addEventListener("click", () => {
  dom.$i("hs-popup").close();
});

// endregion
