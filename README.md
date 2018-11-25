# handy-scroll

Handy dependency-free floating scrollbar widget

## Synopsis

handy-scroll is a dependency-free module which can be used to solve the problem of scrolling some lengthy containers horizontally when those containers don’t fit into the viewport. The widget is just a scrollbar which is attached at the bottom of the container’s visible area. It doesn’t get out of sight when the page is scrolled, thereby making horizontal scrolling of the container much handier.

:bulb: **Tip:** If you are rather looking for a jQuery plugin with the same functionality, please check out the sibling project [floating-scroll](https://github.com/Amphiluke/floating-scroll) instead.

## Usage

The widget requires the CSS file [handy-scroll.css](dist/handy-scroll.css) to be included on the page (you may also import it in your CSS/LESS files). The module script file [handy-scroll.min.js](dist/handy-scroll.min.js) may be added on the web page either via a separate `<script>` element, or it may be loaded by any AMD/CommonJS compatible module loader.

:bulb: **Tip:** If you don’t care about supporting Internet Explorer, feel free to use the file [handy-scroll.es6.min.js](dist/handy-scroll.es6.min.js), which is de facto the same as handy-scroll.min.js but is written in ES6, and is a bit smaller.

The handy-scroll package is available on npm, so you may add it to your project as usual:

```
npm install handy-scroll
```

## Details & API

The module exports a single object `handyScroll` which provides the following methods:

* [`mount`](#mounting-the-widget) — initializes and “mounts” the widgets in the specified containers;
* [`mounted`](#checking-widget-existence) — checks if the widget is already mounted in the given container;
* [`update`](#updating-scrollbar) — updates the widget parameters and position;
* [`destroy`](#destroying-the-widget) — destroys the widgets mounted in the specified containers and removes all related event handlers.

### Mounting the widget

The only thing required to attach the widget to a static container (whose sizes will never change during the session) is a single call of the `handyScroll.mount()` method. The method expects a single argument, the target containers reference, which can be either an element, or a list of elements, or a selector.

```javascript
// mount widget in the specified container element
handyScroll.mount(document.getElementById("spacious-container"));

// mount widgets in all the container elements in the collection
handyScroll.mount(document.getElementsByClassName("spacious-container"));
handyScroll.mount([myDOMElement1, myDOMElement2, myDOMElement3]);

// mount widgets in all the container elements matching the selector
handyScroll.mount(".examples > .spacious-container");
```

### Auto-initialisation

There is another way to mount the handy-scroll widget without writing a single line of JavaScript code. Just add the attribute `data-handy-scroll` to the desired containers. As the DOM is ready the module will detect all such elements and will mount widgets automatically.

```html
<div class="spacious-container" data-handy-scroll>
    <!-- Horizontally wide contents -->
</div>
```

### Checking widget existence

You may check if the widget is already mounted in the given container by calling the `handyScroll.mounted()` method.

```javascript
handyScroll.mount("#spacious-container");
console.log(handyScroll.mounted("#spacious-container")); // true
```

### Updating scrollbar

If you mount the widget in a container whose size and/or content may dynamically change, then you need a way to update the scrollbar each time the container’s sizes change. This can be done by invoking the method `handyScroll.update()` as in the example below.

```javascript
handyScroll.mount(".spacious-container");
// ... some actions which change the total scroll width of the container ...
handyScroll.update(".spacious-container");
```

The method expects a single argument, the target containers reference, which can be either an element, or a list of elements, or a selector.

### Destroying the widget

To unmount the widget and remove all related event handlers, use the method `handyScroll.destroy()` as follows:

```javascript
handyScroll.destroy(".spacious-container");
```

The method expects a single argument, the target containers reference, which can be either an element, or a list of elements, or a selector.

### Special cases

If you want to attach the widget to a container living in a positioned box (e.g. a modal popup with `position: fixed`) then you need to apply two special indicating class names in the markup. The module detects these indicating class names (they are prefixed with `handy-scroll-`) and switches to a special functioning mode.

```html
<div class="handy-scroll-viewport"><!-- (1) -->
    <div class="handy-scroll-body"><!-- (2) -->
        <div class="spacious-container">
            <!-- Horizontally wide contents -->
        </div>
    </div>
</div>
```

The `.handy-scroll-viewport` element (1) is a positioned block (with any type of positioning except `static`) which serves for correct positioning of the widget. Note that this element itself should _not_ be scrollable. The `.handy-scroll-body` element (2) is a vertically scrollable block (with `overflow: auto`) which encloses the target container the widget is mounted in. After applying these special class names, you may initialise the widget as usual:

```javascript
handyScroll.mount(".spacious-container");
```

The [handy-scroll.css](dist/handy-scroll.css) file provides some basic styles for elements with classes `.handy-scroll-viewport` and `.handy-scroll-body`. Feel free to adjust their styles in your stylesheets as needed.

### “Unobtrusive” mode

You can make the widget more “unobtrusive” so that it will appear only when the mouse pointer hovers over the scrollable container. To do so just apply the class `handy-scroll-hoverable` to the desired scrollable container owning the widget.

### Integration with Angular

If you have problems with the widget integration into your Angular app, please consult [this instruction](doc/angular-integration.md) first.

## Live demos

Check out some usage demos [here](https://amphiluke.github.io/handy-scroll/).
