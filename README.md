# handy-scroll

Handy dependency-free floating scrollbar web component.

## Synopsis

handy-scroll is a dependency-free web component which can be used to solve the problem of scrolling lengthy containers horizontally when those containers don’t fit into the viewport. The component is just a scrollbar which is attached at the bottom of the container’s visible area. It doesn’t get out of sight when the page is scrolled, thereby making horizontal scrolling of the container much handier.

> [!NOTE]
> Current version of the component targets modern browsers only. If you need to support older browser versions, please stick to the former implementation [handy-scroll@1.x](https://github.com/Amphiluke/handy-scroll/tree/v1).

## Installation and import

If you use a bundler in your project, install handy-scroll as a dependency:

```shell
npm install handy-scroll
```

Now you may import it wherever it’s needed:

```javascript
import "handy-scroll";
```

If you don’t use bundlers, just import the component as a module in your HTML files:

```html
<script type="module" src="https://esm.run/handy-scroll"></script>
```

## Standard usage

Drop the custom element `<handy-scroll>` where you need in your markup and link the component to the horizontally-scrollable target using the `owner` attribute:

```html
<div id="horizontally-scrollable">
  <!-- Horizontally wide contents -->
</div>
<handy-scroll owner="horizontally-scrollable"></handy-scroll>
```

## Custom viewport element

Standard use case above implies that handy-scroll will stick to the bottom of the browser window viewport. If instead you want to attach a floating scrollbar at the bottom of your custom scrollable “viewport” (e.g. a scrollable modal popup), then you need to link the component to your custom viewport element using the `viewport` attribute:

```html
<div id="custom-viewport">
  <div id="horizontally-scrollable">
    <!-- Horizontally wide contents -->
  </div>
  <handy-scroll owner="horizontally-scrollable" viewport="custom-viewport"></handy-scroll>
</div>
```

## API

### `HandyScroll.prototype.update()`

handy-scroll automatically tracks viewport changes in order to keep the component’s size, position and visibility in sync with the owner’s metrics. However there can be some cases when you’ll need to trigger the component update programmatically (e.g. after some changes in DOM). To do so, just call the method `update()` on the specific `<handy-scroll>` element:

```javascript
document.getElementById("my-handy-scroll").update();
```

### `HandyScroll.prototype.owner`

Reflects the value of the `owner` attribute, which in turn should reference the `id` attribute of the horizontally-scrollable container (owner).

### `HandyScroll.prototype.viewport`

Reflects the value of the `viewport` attribute, which (if present) should reference the `id` attribute of the element serving as custom viewport.

## Live demos

Check out some usage demos [here](https://amphiluke.github.io/handy-scroll/).
