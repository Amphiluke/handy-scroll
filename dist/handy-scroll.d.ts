declare namespace handyScroll {
    export function mount(containerRef: HTMLElement | NodeList | HTMLCollection | HTMLElement[] | string): void;
    export function mounted(containerRef: HTMLElement | string): boolean;
    export function update(containerRef: HTMLElement | NodeList | HTMLCollection | HTMLElement[] | string): void;
    export function destroy(containerRef: HTMLElement | NodeList | HTMLCollection | HTMLElement[] | string): void;
    export function destroyDetached(): void;
}

export default handyScroll;
export as namespace handyScroll;
