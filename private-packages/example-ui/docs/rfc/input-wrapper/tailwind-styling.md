# Tailwind Styling Architecture

- Status: Draft/Implementation ready
- Start Date: 2026-10-18

## Summary
[summary]: #summary

Define the ITCSS and Tailwind v4 `@theme` styling for `.input-frame`. This introduces custom `@theme` namespaces (`--effect-*`, `--color-identity-*`, `--color-grayscale-*`), `@utility effect-*`, fixed `px` spacing, `--icon-fill` inheritance, and zero-JS focus transitions via `&:has(input:focus)`.

## Motivation
[motivation]: #motivation

1. **Figma "Effects" vs. Tailwind Shadow Split:** Figma treats `Inner Shadow/2 dp` (rest) and `Drop Shadow/2 dp` (typing) as mutually exclusive values of one "Effect". Tailwind v4 splits `--inset-shadow-*` and `--shadow-*` additively. A unified `--effect-*` namespace + `@utility effect-*` matches Figma 1:1.
2. **Zero-JS "Typing" State:** Switching shadow and text color on focus belongs in CSS (`&:has(input:focus)`), not React state.
3. **Prevent `rem` Whitespace Inflation:** Using `px` instead of `rem` for `padding` and `gap` stops empty whitespace from expanding and crushing input text when users scale browser font sizes.
4. **Decoupled Icon Coloring:** Broadcasting `--icon-fill` from `.input-frame` styles child SVG icons without React prop drilling.

# Guide-level explanation
[guide-level-explanation]: #guide-level-explanation

`.input-frame` sets layout, rest tokens, and focus transitions automatically. Child icons consume `var(--icon-fill, currentColor)`.

### Examples of Use

```html
<!-- Standard usage -->
<div class="input-frame">
  <svg fill="var(--icon-fill, currentColor)" viewBox="0 0 16 16">...</svg>
  <input type="search" placeholder="Search items..." />
</div>

<!-- Overriding effect or icon color with Tailwind utilities -->

  <svg fill="var(--icon-fill, currentColor)" viewBox="0 0 16 16">...</svg>
  <input type="search" placeholder="Custom effect & icon color..." />
</div>
```

# Reference-level explanation
[reference-level-explanation]: #reference-level-explanation

```css
@import "tailwindcss";

@theme {
  /* Figma Effects */
  --effect-inner-2dp: inset 0px 1px 3px 1px rgb(0 0 0 / 0.25);
  --effect-drop-2dp: 0px 1px 3px 1px rgb(0 0 0 / 0.2);
  --effect-drop-6dp: 0px 3px 6px 2px rgb(0 0 0 / 0.2);

  /* Figma Colors */
  --color-identity-primary: #dc0a2d;
  --color-identity-secondary: #28aafd;
  --color-grayscale-dark: #212121;
  --color-grayscale-medium: #666666;
  --color-grayscale-light: #e0e0e0;
  --color-grayscale-background: #efefef;
  --color-grayscale-white: #ffffff;
}

@utility effect-* {
  box-shadow: --value(--effect-*);
}

@layer components {
  .input-frame {
    --input-frame-effect: var(--effect-inner-2dp);
    --input-frame-bg: var(--color-grayscale-white);
    --input-frame-text: var(--color-grayscale-medium);
    --icon-fill: var(--color-identity-primary);

    display: flex;
    align-items: center;
    gap: 8px;
    padding-block: 8px;
    padding-inline: 12px;

    background-color: var(--input-frame-bg);
    color: var(--input-frame-text);
    box-shadow: var(--input-frame-effect);

    &:has(input:focus) {
      --input-frame-effect: var(--effect-drop-2dp);
      --input-frame-text: var(--color-grayscale-dark);
    }
  }
}
```

## Drawbacks
[drawbacks]: #drawbacks

- `@utility effect-*` writes directly to `box-shadow`, bypassing Tailwind's internal `--tw-shadow` composition if combined with `ring-*` utilities.

# Rationale and alternatives
[rationale-and-alternatives]: #rationale-and-alternatives

- **Flexbox over Grid:** `display: flex; gap: 8px` collapses cleanly when `endElement` unmounts, avoiding empty grid tracks.
- **`&:has(input:focus)` over `:focus-within`:** Triggers the "Typing" state strictly when `<input>` is focused, ignoring focus on the `endElement` button.
- **`px` over `rem` for Spacing:** Preserves horizontal text room when root font size (`rem`) scales up.

## Prior art
[prior-art]: #prior-art

- ITCSS (`@theme` Settings -> `@layer components` -> `@layer utilities`) and Bootstrap 5.3 local CSS variable reassignment.

## Unresolved questions
[unresolved-questions]: #unresolved-questions

- What `border-radius` value from Figma applies to `.input-frame`?
- Should child `<input>` resets (`outline: none; flex: 1`) live inside `.input-frame` or a separate `.input-control` class?

## Future possibilities
[future-possibilities]: #future-possibilities

- Extract this stylesheet into a standalone `@computerwwwizards/example-ui-tailwind-styles` package if non-React apps need it.
