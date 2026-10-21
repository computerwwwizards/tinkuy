# RFC: Item Card

- Status: Draft/Ready for Implementation
- Start Date: 2026-10-19

## Summary
[summary]: #summary

This RFC defines the semantic HTML and CSS architecture for the Item Card (`item-card`). Outer surface responsibilities (white background, outer border-radius, drop shadows) are delegated to the existing `Paper` component, and parent grid layout is delegated to the existing Auto-Grid pattern (which must render as a `<ul>` with `position: relative`). Internally, `item-card` uses a 3-row CSS `subgrid`, a `::before` pseudo-element (`2/5` / `40%` height) for the overlapping `--color-grayscale-background` plate, and a `::after` stretched link overlay.

## Motivation
[motivation]: #motivation

1. **Sprite Overlap & `2/5` Proportion:** The bottom gray surface (`--color-grayscale-background`) occupies `2/5` (`40%`, simplified from Figma's `44px/108px` or `11/27`) of the card height while allowing the item sprite in row 2 to overlap its top edge.
2. **Subgrid Row Alignment:** Binding the card's 3 children to the parent `<ul>` tracks via `subgrid` ensures numbers, sprites, and multi-line names stay horizontally aligned across each row.
3. **Separation of Concerns (`Paper` & Auto-Grid Delegation):** Avoid duplicating container surface styles owned by `Paper` or grid track definitions owned by the Auto-Grid container.
4. **Screen Reader Clarity:** Scoping the `<a>` (or `<button>`) strictly to the heading text avoids concatenating the index number and image into the accessible label.

## Guide-level explanation
[guide-level-explanation]: #guide-level-explanation

### 1. Parent Container Contract (`<ul>`)
Although the Auto-Grid container implementation is already established in the codebase and outside the scope of this RFC, its integration with `item-card` requires two strict rules:
- **Semantic Tag (`<ul>`):** Because each `item-card` is an `<li>`, the Auto-Grid container **must** be rendered as a `<ul>` (or `<ol>`) with `position: relative`.
- **Card Boundary (`position: relative`):** Each `<li class="item-card">` also declares `position: relative` so that both the `2/5` bottom gray plate (`::before`) and the stretched clickable hitbox (`::after`) stay strictly contained within the individual card rather than escaping to the parent `<ul>`.

### 2. Card Markup (`<li>`)
Each card is composed with `Paper` and contains exactly three direct children:

```html
<!-- Existing Auto-Grid container: MUST be a <ul> with position: relative -->
<ul class="auto-grid">
  <li class="item-card">
    <span class="item-number">#001</span>
    <img src="/sprites/jarjacha.png" alt="" class="item-img" />
    <h2 class="item-name">
      <a href="/item?id=1" class="item-link">Jarjacha</a>
    </h2>
  </li>
</ul>
```

### 3. Theme Tokens Consumed
The card consumes existing `@theme` grayscale tokens without introducing new color primitives:

```css
@theme {
  --color-grayscale-dark: #212121;
  --color-grayscale-medium: #666666;
  --color-grayscale-background: #efefef;
}
```

## Reference-level explanation
[reference-level-explanation]: #reference-level-explanation

### Layering & Z-Index Stack (`Approach 2`)
To allow the sprite in Track 2 to overlap the `2/5` (`40%`) gray background while keeping the 3 `subgrid` tracks intact:
1. **Layer 0 (`.item-card::before`):** Positioned at the bottom (`inset: auto 0 0 0; height: 40%`), painted with `var(--color-grayscale-background)` and `z-index: 0`. Because it is `position: absolute`, it does not occupy a `subgrid` track.
2. **Layer 1 (In-Flow Subgrid Children):** `.item-number`, `.item-img`, and `.item-name` sit above the `::before` plate (`z-index: 1`), allowing the bottom of `.item-img` to visually overlap the top edge of the `40%` gray plate.
3. **Layer 2 (`.item-link::after`):** Stretches over the entire `.item-card` (`inset: 0; z-index: 2`) to capture clicks across the whole card.

### CSS Specification

```css
.item-card {
  position: relative;
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
}

/* 2/5 (40%) bottom gray background plate behind sprite and name */
.item-card::before {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 40%;
  background-color: var(--color-grayscale-background);
  border-radius: 7px;
  z-index: 0;
}

.item-number {
  justify-self: end;
  color: var(--color-grayscale-medium);
  z-index: 1;
}

.item-img {
  place-self: center;
  z-index: 1;
}

.item-name {
  margin: 0;
  place-self: center;
  text-align: center;
  color: var(--color-grayscale-dark);
  z-index: 1;
}

.item-link {
  text-decoration: none;
  color: inherit;
}

/* Full-card clickable overlay */
.item-link::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
}
```

### Constraints
* **Specificity:** All class selectors maintain flat `(0,1,0)` specificity (with `(0,1,1)` only where `::before` and `::after` pseudo-elements are required).
* **No Surface Duplication:** `.item-card` omits `background-color: var(--color-grayscale-white)`, outer `border-radius`, and `box-shadow`, as those are provided by `Paper`.
* **Positioning Trap:** `.item-name` and `.item-link` must **never** declare `position: relative`, `transform`, or `filter`, as doing so traps `.item-link::after` inside the heading instead of stretching to `.item-card`.
* **Containing Block Coupling:** Both `.item-card::before` (gray plate) and `.item-link::after` (hitbox) depend on `.item-card` having `position: relative`. If removed, both layers will escape to the parent `<ul>` Auto-Grid container.
* **Pseudo-Element Exhaustion on `.item-card`:** Using `::before` for the `2/5` gray surface consumes the card's before pseudo-element slot.

## Drawbacks
[drawbacks]: #drawbacks

* **Containing Block Coupling:** Both `.item-card::before` (gray plate) and `.item-link::after` (hitbox) depend on `.item-card` having `position: relative`. If removed, both layers will escape to the parent `<ul>` Auto-Grid container.
* **Pseudo-Element Exhaustion on `.item-card`:** Using `::before` for the `2/5` gray surface consumes the card's before pseudo-element slot.

## Rationale and alternatives
[rationale-and-alternatives]: #rationale-and-alternatives

* **`2/5` (`40%`) `::before` Plate vs. Background on `.item-name`:** Applying `background-color` directly to `.item-name` (Track 3) prevents `.item-img` (Track 2) from overlapping the gray area because subgrid rows do not overlap by default. Using `::before` decouples the visual `2/5` background plate from the 3 text/image tracks.
* **`2/5` (`40%`) vs `11/27` (`40.74%`):** `2/5` (`40%`) is chosen over `11/27` (`44px / 108px`) as a clean, standard ratio with negligible visual difference (`0.74%`).

## Prior art
[prior-art]: #prior-art

* **[Figma Community Spec](https://figma.com):** Source of the `@theme` grayscale tokens and overlapping bottom gray plate layout.
* **[Bootstrap `.stretched-link`](https://getbootstrap.com):** Absolute `inset: 0` hitbox overlay pattern.

# Unresolved questions
[unresolved-questions]: #unresolved-questions

* Should the `7px` top border-radius on `.item-card::before` be extracted into a `@theme` radius token or inherited from `Paper`?

# Future possibilities
[future-possibilities]: #future-possibilities

* Secondary interactive controls (e.g., a favorite toggle) can be added as direct children of `.item-card` with `position: relative; z-index: 3` to sit above `.item-link::after`.
