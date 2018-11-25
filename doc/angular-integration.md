# Using handy-scroll in an Angular app

handy-scroll is a “VanillaJS” module, which means that you may need to perform a few additional steps to make it ready for use with your favorite framework. Here are the steps to install and use the handy-scroll widget in a sample Angular app. This instruction is partly adopted from the [“official” Angular CLI guide](https://github.com/angular/angular-cli/wiki/stories-third-party-lib) on installing a third party library in an Angular project.

1. Install the handy-scroll package locally as your project’s dependency:
    ```
    npm install --save handy-scroll
    ```
1. Include widget styles into your project’s [global styles](https://github.com/angular/angular-cli/wiki/stories-global-styles). You may import widget styles in your global stylesheet file `styles.css`:
    ```css
    @import "../node_modules/handy-scroll/dist/handy-scroll.css";
    ```
1. Create a `typings.d.ts` file in your `src/` folder. This file will be automatically included as global type definition.
1. In `src/typings.d.ts`, add the following code:
    ```typescript
    declare module 'handy-scroll';
    ```
1.  In the component or file that uses the handy-scroll widget, add the following code:
    ```typescript
    import handyScroll from 'handy-scroll';
    ```
1. You may now use the widget API in your code as usual. E.g. in a component:
    ```typescript
    import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
    import handyScroll from 'handy-scroll'; // 1) import
    
    @Component({
      selector: 'app-root',
      template: `
        <div #mycontainer class="my-container">
          <div>{{ "Long contents. ".repeat(2000) }}</div>
        </div>
      `,
      styles: ['.my-container {overflow:auto} .my-container div {min-width:150vw}']
    })
    export class AppComponent implements AfterViewInit {
      @ViewChild('mycontainer') myContainer: ElementRef;
    
      ngAfterViewInit() {
        handyScroll.mount(this.myContainer.nativeElement); // 2) use
      }
    }
    ```

You may also play with a [live demo](https://stackblitz.com/edit/angular-handy-scroll-integration).