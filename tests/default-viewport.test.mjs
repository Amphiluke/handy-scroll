import {describe, beforeAll, beforeEach, afterEach, test, expect} from "vitest";
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
      [data-testid="focusable"] {
        margin-inline-start: 100vw;
      }
    </style>`);
  document.body.insertAdjacentHTML("beforeend", `
    <div id="owner" data-testid="owner">
      <div data-testid="content"></div>
    </div>`);
});

beforeEach(() => {
  document.body.insertAdjacentHTML("beforeend", "<handy-scroll owner=\"owner\" data-testid=\"scrollbar\"></handy-scroll>");
});

afterEach(() => {
  document.body.querySelector("[data-testid='scrollbar']").remove();
});


describe("Attribute reflection", () => {
  test("The “owner” attribute reflection", async () => {
    const scrollbarLocator = page.getByTestId("scrollbar");
    await expect.element(scrollbarLocator).toHaveAttribute("owner", scrollbarLocator.element().owner);
    document.body.insertAdjacentHTML("beforeend", "<div id=\"new-owner\"></div>");
    // Setting the DOM property updates the attribute
    scrollbarLocator.element().owner = "new-owner";
    await expect.element(scrollbarLocator).toHaveAttribute("owner", "new-owner");
    // Setting the attribute udates the DOM property
    scrollbarLocator.element().setAttribute("owner", "owner");
    await expect.element(scrollbarLocator).toHaveAttribute("owner", scrollbarLocator.element().owner);
    document.getElementById("new-owner").remove();
  });

  test("The “viewport” attrubute reflection", () => {
    expect(page.getByTestId("scrollbar").element().viewport).toBeNull();
  });
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

  test("Syncing component with owner on programmatic scrolling", async () => {
    const ownerLocator = page.getByTestId("owner");
    const scrollbarLocator = page.getByTestId("scrollbar");
    const {scrollWidth} = ownerLocator.element();
    for (const factor of [0.25, 1, 0]) {
      await ownerLocator.element().scroll({left: Math.round(scrollWidth * factor), behavior: "instant"});
      await expect.element(scrollbarLocator).toBeXScrolledTo(ownerLocator.element().scrollLeft);
    }
  });

  test("Syncing component with owner on clear the “hidden” attribute", async () => {
    const ownerLocator = page.getByTestId("owner");
    const scrollbarLocator = page.getByTestId("scrollbar");
    scrollbarLocator.element().hidden = true;
    await ownerLocator.element().scroll({left: 100, behavior: "instant"});
    await expect.element(scrollbarLocator).not.toBeXScrolledTo(ownerLocator.element().scrollLeft);
    scrollbarLocator.element().hidden = false;
    await expect.element(scrollbarLocator).toBeXScrolledTo(ownerLocator.element().scrollLeft);
    await ownerLocator.element().scroll({left: 0, behavior: "instant"});
    await expect.element(scrollbarLocator).toBeXScrolledTo(0);
  });

  test("Syncing component with owner on focus-induced scrolling", async () => {
    page.getByTestId("content").element().insertAdjacentHTML("beforeend", "<input data-testid=\"focusable\">");
    const focusableLocator = page.getByTestId("focusable");
    const ownerLocator = page.getByTestId("owner");
    const scrollbarLocator = page.getByTestId("scrollbar");
    focusableLocator.element().focus();
    expect(ownerLocator.element().scrollLeft).toBeGreaterThan(0);
    await expect.element(scrollbarLocator).toBeXScrolledTo(ownerLocator.element().scrollLeft);
    focusableLocator.element().remove();
  });
});
