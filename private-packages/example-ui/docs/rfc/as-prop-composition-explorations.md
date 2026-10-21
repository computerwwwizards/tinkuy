# RFC: Future Exploration — Polymorphic `as` Prop Composition Strategies

- Status: Future Exploration / Draft
- Date: 2026-10-19

## Context & Background

In `tinkuy-react` and `example-ui`, components leverage `createComponent` along with styling plugins (e.g. `stylingPlugin`) and the `MorphContract` type helper to enable polymorphic element rendering (`as` prop).

When combining polymorphic wrappers (for example, passing another component into `as`, such as `<AutoGrid as={Paper} />`), prop handling and CSS class merging mechanics come into question.

Currently, `tinkuy-react` delegates class combination to styling plugins where each component's styling plugin receives incoming `props.className` and appends its own default class (e.g., `['ag-layout', props.className].filter(Boolean).join(' ')`).

This document outlines two architectural paradigms as future explorations for polymorphic composition in the monorepo.

---

## Strategy A: Currying / Higher-Order Factory Composition

In a curried approach, components do not accept a runtime React component directly as an `as` prop. Instead, polymorphic composition happens ahead-of-time via higher-order functions or factory currying:

```tsx
const PaperAutoGrid = createPaperGrid(AutoGrid); // Curries Paper styling onto AutoGrid
```

### Pros
- Explicit compile-time boundary with zero runtime prop collision risks.
- Avoids deep dynamic prop merging at render time.

### Cons
- High visual noise in consumer code when quick composition is desired.
- Lacks inline flexibility for rapid UI prototyping (`<AutoGrid as={...}>`).

---

## Strategy B: Array Merging / Pipeline Class Merging inside Bridge / Plugin

In an array merging or pipeline strategy, the `as` prop is recognized directly by the bridge or styling plugin system. When a component receives another component or element in `as`, prop mergers automatically aggregate class names into an ordered list or execution pipeline:

```tsx
// Automatic pipeline execution
<AutoGrid as={Paper} />
```

Under the hood, styling plugins or bridge factories maintain a class name array pipeline:
```ts
const mergedClasses = mergeClassPipelines(paperPluginOutput.className, autoGridPluginOutput.className);
```

### Pros
- Highly ergonomic for consumers (`as={Paper}`).
- Preserves flat specificity rules and Tailwind class order predictable resolution.

### Cons
- Requires bridge awareness of nested component signatures when `as` is a custom React component rather than an intrinsic string (`'section'`, `'article'`).

---

## Recommendation & Current Decision

For current development in `example-ui`:
- For intrinsic HTML elements, use `as="section"`, `as="article"`, etc., paired with utility CSS classes (e.g., `<AutoGrid as="section" className="paper">`).
- Keep styling plugins additive (`['ag-layout', props.className].filter(Boolean).join(' ')`).
- Future iterations may explore standardizing Strategy B inside `tinkuy-react`'s `createComponent` bridge factory.
