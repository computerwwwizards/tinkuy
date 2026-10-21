## RFC: Auto Grid Styling
- Status: Draft/Implementation Ready
- Start Date: 2026-10-19

## Summary
[summary]: #summary

Standardize an intrinsic, media-query-free CSS layout primitive (`.ag-layout`) that delegates item sizing entirely to the parent grid container. The pattern combines CSS Grid's `repeat()`, `auto-fill` (as the safe default), `minmax()`, and `min()` functions with cascading, collision-resistant prefixed CSS Custom Property fallbacks (`var(--ag-prop, fallback)`) to create self-regulating, responsive multi-column card layouts while leaving track-expansion control in the hands of the developer.

## Motivation
[motivation]: #motivation

In traditional component-driven web design, developers often couple width constraints directly to child elements (e.g., setting `width: 300px` on a `.card` component) or rely on fragile viewport `@media` queries to step column counts up and down across arbitrary screen breakpoints. 

This causes four primary architectural failures:
1. **Context Blindness:** A card styled for a full-width desktop viewport breaks when placed inside a narrower sidebar or modal, because `@media` queries respond to the *viewport*, not the *parent container*.
2. **Hardcoded Property Collisions:** Defining generic custom properties directly inside a selector block overrides values inherited from higher scopes, breaking the CSS cascade.
3. **Sub-Minimum Viewport Overflow:** Using a static minimum track size like `minmax(256px, 1fr)` causes horizontal overflow when the container shrinks below the specified width (such as on wearable devices, split-screen views, or narrow mobile viewports).
4. **Single-Item Over-Expansion (When Misconfigured):** Naive implementations that default to `auto-fit` collapse empty tracks, causing a single filtered item (e.g., searching a Pokédex and returning only `#0025 Pikachu`) to stretch across an entire `1200px` container.

We need a single, reusable layout primitive where child components remain passive passengers (`width: auto`), the grid defaults to preserving track proportions via `auto-fill`, and the developer retains explicit control to opt into `auto-fit` stretching when desired.

# Guide-level explanation
[guide-level-explanation]: #guide-level-explanation

Think of `.ag-layout` as a "container of invisible, elastic slots" (grid tracks). Instead of telling a Pokédex card how wide it should be, you drop the card into `.ag-layout`. The card automatically stretches to fill whatever slot the grid assigns it.

### 1. Default Behavior (`auto-fill`: Safe Proportions for Dynamic Data)

Apply the `.ag-layout` class to any parent wrapper. Without any extra configuration, it creates columns that are at least `16rem` (`256px`) wide using `auto-fill`. 

If the container is wide enough for 4 columns (`1200px`), `.ag-layout` reserves 4 equal tracks—even if your database query only returns **1 Pikachu card**. Pikachu stays neatly inside Column 1 (`~280px` wide) instead of stretching across the entire screen:

```html
<div class="ag-layout">
  <article class="card">Pikachu (#0025)</article>
  <!-- Invisible columns 2, 3, and 4 are preserved by default via auto-fill -->
</div>
```

### 2. Developer Control: Opting into `auto-fit` (Full-Row Expansion)

Full control remains in the hands of the developer via the `--ag-grid-placement` custom property. If you are building a hero section, pricing table, or feature banner where you *want* 1 or 2 items to collapse empty tracks and stretch edge-to-edge across the entire container, simply pass `--ag-grid-placement: auto-fit`:

```html
<!-- Opt-in to auto-fit: If only 2 cards exist, they stretch to 50% width each -->
<div class="ag-layout" style="--ag-grid-placement: auto-fit;">
  <article class="card">Featured Starter: Bulbasaur</article>
  <article class="card">Featured Starter: Charmander</article>
</div>
```

### 3. Configuring Track Sizes & Gaps Across Scopes

Because `.ag-layout` uses native CSS `var()` fallback syntax with an isolated `--ag-` prefix rather than hardcoded local declarations, you can configure it safely at any level of the DOM tree without colliding with other layout or component systems:

```html
<!-- Global or Section-level inheritance -->
<main style="--ag-min-column-size: 20rem; --ag-grid-gap: 2rem;">
  <div class="ag-layout">
    <!-- Inherits 20rem (320px) minimum columns and 2rem gaps safely -->
  </div>
</main>

<!-- Inline or utility-class override for dense item badges -->
<div class="ag-layout" style="--ag-min-column-size: 9.375rem;">
  <div class="badge">Potion</div>
  <div class="badge">Pokéball</div>
</div>
```

### Child Component Contract

To participate properly in an `.ag-layout`, child elements must obey two rules:
1. **No fixed widths:** Omit `width` and `max-width` on the root card element so it conforms to the grid track.
2. **Fluid height:** Never declare a fixed `height`. Let content dictate vertical growth while the grid automatically equalizes row heights.

# Reference-level explanation
[reference-level-explanation]: #reference-level-explanation

The canonical implementation of the `.ag-layout` primitive is defined as follows:

```css
.ag-layout {
  display: grid;
  grid-template-columns: repeat(
    var(--ag-grid-placement, auto-fill),
    minmax(
      min(100%, var(--ag-min-column-size, 16rem)),
      var(--ag-max-column-size, 1fr)
    )
  );
  gap: var(--ag-grid-gap, 1.25rem);
}
```

### Technical Mechanics & Corner Cases

1. **Track Repetition & Placement Control (`repeat(var(--ag-grid-placement, auto-fill), ...)`):** 
   Instructs the browser's layout engine to calculate the maximum integer number of columns `N` of size `--ag-min-column-size` (plus `--ag-grid-gap`) that can fit into the container's inline size without overflowing.
   - **`auto-fill` (Default):** Retains empty implicit tracks as non-collapsing placeholders so that a partial row of items (e.g., 1 or 2 cards in a 4-column space) maintains identical column widths to a full row.
   - **`auto-fit` (Developer Override):** Folds empty tracks to `0px`, redistributing all remaining horizontal space across the active items in that row.
2. **Overflow Guard (`min(100%, var(--ag-min-column-size, 16rem))`):**
   Evaluates two values and passes the smaller one as the minimum bound of `minmax()`. If the container width is `200px` and `--ag-min-column-size` resolves to `256px` (`16rem`), `100%` (`200px`) is smaller. The minimum track size clamps to `100%`, preventing horizontal scrollbars.
3. **Proportional Distribution (`var(--ag-max-column-size, 1fr)`):**
   Once `N` columns are allocated at their minimum threshold, any remainder space `R = ContainerWidth - (N * MinTrack) - ((N - 1) * Gap)` is divided equally (`1fr`) across all active tracks (and placeholder tracks in `auto-fill` mode). Developers can optionally cap track growth by overriding `--ag-max-column-size`.
4. **Collision-Safe Fallbacks (`var(--ag-*, fallback)`):**
   By omitting custom property declarations from the `.ag-layout` rule block and placing default values inside the second argument of `var()`, the selector never shadows ancestor properties. The `--ag-` namespace prefix prevents collisions with third-party UI libraries. Resolution order:
   - Inline or direct selector override on `.ag-layout`
   - Inherited value from nearest ancestor (`section`, `body`, `:root`)
   - Intrinsic fallback (`auto-fill`, `16rem` / `256px` min column, `1fr` max column, `1.25rem` / `20px` gap)
5. **Relative Units (`rem` over `px`):**
   Default fallbacks use `16rem` (`256px` at standard `16px` root font size) so that minimum column tracks scale proportionally when users increase browser default font sizes for accessibility.

## Drawbacks
[drawbacks]: #drawbacks

- **Trailing Whitespace on Partial Single Rows (in `auto-fill` mode):** If a static component only ever has 2 items on a 4-column desktop screen, `auto-fill` leaves columns 3 and 4 visually empty on the right side of the container. Developers must consciously opt into `--ag-grid-placement: auto-fit` if they want those 2 items to expand across the row.
- **Orphaned Row Alignment:** Unlike Flexbox (`justify-content: center`), if a 4-column grid has 5 items, the 5th item on the second row is strictly bound to Column 1 on the far left and cannot be centered beneath the row above without breaking grid column alignment.

## Rationale and alternatives
[rationale-and-alternatives]: #rationale-and-alternatives

- **Why default to `auto-fill` instead of `auto-fit`?** 
  When rows are completely full (e.g., 12 Pokémon cards across a 4-column grid), `auto-fill` and `auto-fit` render **100% identically**. They only diverge when item count `M` is less than column capacity `N` (`M < N`). In dynamic web applications (search filters, catalog grids, dashboards), returning `1` or `2` items is common. Defaulting to `auto-fill` guarantees that cards never unexpectedly distort or blow up to full container width, while exposing `--ag-grid-placement: auto-fit` gives developers a declarative escape hatch when expansion is intentional.
- **Why not put `max-width` on the `.card` itself?**
  Assigning `max-width` to the child violates separation of concerns and causes the card to stop growing while its parent grid track continues expanding, creating awkward dead space between adjacent cards. Sizing belongs strictly to the grid track.
- **Why not Flexbox (`flex-wrap: wrap`)?**
  In Flexbox, wrapped items on the final row either stretch to fill the entire row (making 1 leftover card 4x wider than the cards above it via `flex-grow: 1`) or fail to align cleanly with the column tracks above them. CSS Grid enforces strict 2D column alignment across all rows.

## Prior art
[prior-art]: #prior-art

- **Every Layout (Heydon Pickering & Andy Bell):** Formalized the intrinsic `Grid` layout primitive using `repeat(auto-fit, minmax(min(var(--minimum), 100%), 1fr))` as part of algorithmic CSS design.
- 9elements Auto-Grid Pattern: Established the terminology of separating the "Auto-Grid" architectural container from the "Card" presentation component.
- CSS-Tricks (auto-fill vs auto-fit): Documented the implicit track preservation mechanics that distinguish auto-fill from auto-fit in dynamic grid tracks.

## Unresolved questions

- Should the base .ag-layout primitive automatically apply container-type: inline-size to its children, or does implicit containment create unexpected stacking context or position: fixed side effects for consumers?
- What is the ergonomic convention for handling grid-auto-rows when consumers want subgrid alignment across internal card headers, bodies, and footers?

## Future possibilities

- CSS Subgrid Integration (grid-template-rows: subgrid): Allowing child .card elements to span 3 vertical tracks (Header, Image, Stats) so that titles and stat bars align horizontally across adjacent cards even when one Pokémon has a three-line description and another has a single line.
- Container Query Pairing (@container): Empowering the passive .card component to switch from a vertical portrait card to a horizontal badge layout whenever .ag-layout stretches a track wider than 400px (particularly useful when a developer opts into --ag-grid-placement: auto-fit).

