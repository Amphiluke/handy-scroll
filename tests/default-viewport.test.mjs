import {describe, beforeAll, test, expect} from "vitest";
import {page} from "vitest/browser";
import "../dist/handy-scroll.mjs";


beforeAll(() => {
  document.head.insertAdjacentHTML("beforeend", `
    <style>
      body {
        width: 50vw;
        margin: 2rem auto;
        padding-top: 200vh;
      }
      [data-testid="owner"] {
        overflow: auto;
      }
      [data-testid="content"] {
        height: 150vh;
        width: 150vw;
      }
    </style>`);
  document.body.insertAdjacentHTML("beforeend", `
    <div id="owner" data-testid="owner">
      <div data-testid="content"></div>
    </div>
    <handy-scroll owner="owner" data-testid="scrollbar"></handy-scroll>`);
});


describe("Latency", () => {
  test("Component is latent when owner is outside the viewport", async () => {
    await expect.element(page.getByTestId("scrollbar")).toBeLatent();
  });

  test("Component is operative when owner is within the viewport", async () => {
    page.getByTestId("owner").element().scrollIntoView({block: "start", behavior: "instant"});
    await expect.element(page.getByTestId("scrollbar")).not.toBeLatent();
  });

  test("Component is latent when owner’s own scrollbar is visible", async () => {
    page.getByTestId("owner").element().scrollIntoView({block: "end", behavior: "instant"});
    await expect.element(page.getByTestId("scrollbar")).toBeLatent();
  });

  test("Forced manual recalculation of latency", async () => {
    const contentLocator = page.getByTestId("content");
    const scrollbarLocator = page.getByTestId("scrollbar");

    page.getByTestId("owner").element().scrollIntoView({block: "start", behavior: "instant"});
    await expect.element(scrollbarLocator).not.toBeLatent();

    contentLocator.element().style.setProperty("width", "90%");
    scrollbarLocator.element().update();
    await expect.element(scrollbarLocator).toBeLatent();

    contentLocator.element().style.removeProperty("width");
    scrollbarLocator.element().update();
    await expect.element(scrollbarLocator).not.toBeLatent();
  });
});


describe("Scrolling", () => {
  test("Component and owner have equal scroll widths", () => {
    const ownerLocator = page.getByTestId("owner");
    const scrollbarLocator = page.getByTestId("scrollbar");
    expect(ownerLocator.element().scrollWidth).toBe(scrollbarLocator.element().scrollWidth);
  });

  test("Syncing component with owner on wheel", async () => {
    const ownerLocator = page.getByTestId("owner");
    const scrollbarLocator = page.getByTestId("scrollbar");
    const {scrollWidth} = ownerLocator.element();
    for (const factor of [0.25, 1, -1]) {
      await ownerLocator.wheel({delta: {x: Math.round(scrollWidth * factor)}});
      await expect.element(scrollbarLocator).toBeXScrolledTo(ownerLocator.element().scrollLeft);
    }
  });

  test("Syncing owner with component on wheel", async () => {
    const ownerLocator = page.getByTestId("owner");
    const scrollbarLocator = page.getByTestId("scrollbar");
    const {scrollWidth} = scrollbarLocator.element();
    for (const factor of [0.25, 1, -1]) {
      await scrollbarLocator.wheel({delta: {x: Math.round(scrollWidth * factor)}});
      await expect.element(ownerLocator).toBeXScrolledTo(scrollbarLocator.element().scrollLeft);
    }
  });

  test("Syncing component with owner on programmatic scroll", async () => {
    const ownerLocator = page.getByTestId("owner");
    const scrollbarLocator = page.getByTestId("scrollbar");
    const {scrollWidth} = ownerLocator.element();
    for (const factor of [0.25, 1, -1]) {
      await ownerLocator.element().scrollTo({x: Math.round(scrollWidth * factor)});
      await expect.element(scrollbarLocator).toBeXScrolledTo(ownerLocator.element().scrollLeft);
    }
  });
});
