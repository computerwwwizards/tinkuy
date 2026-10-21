# RFC: Item Card Interface
- Status: Draft/Implementation Ready
- Start Date: 2026-10-19

## Summary
[summary]: #summary

Define the TypeScript contract (`ItemCardProps`) for the `ItemCard` component using **named `ReactNode` slots** (`image` and `name`) alongside a primitive `number` prop. This decouples the component's public interface from specific routing libraries (such as Next.js App Router or React Router) and image optimization primitives without exposing internal DOM structure or requiring compound-component boilerplate.

## Motivation
[motivation]: #motivation

UI card components often suffer from rigid prop contracts when typed strictly with primitive `string` values (e.g., `imageUrl: string`, `name: string`, `href: string`).

1. **Router Agnosticism:** Different React environments handle navigation links differently (`next/link` uses `href`, `react-router-dom` uses `to`, and standard web uses `<a href="...">`). Passing a `string` forces `ItemCard` to either hardcode a specific router dependency or accept clunky adapter props.
2. **Media Rendering Flexibility:** Passing a raw image URL string prevents consumers from choosing between native `<img loading="lazy" />`, framework-specific `<Image />` components, or fallback avatars.
3. **Encapsulated Layout:** While the visual layout and styling of `ItemCard` are already solved and fixed, the *interactive and media elements* inside those layout regions must be inverted to the consumer.

By typing `image` and `name` as `ReactNode` slots on the root interface, `ItemCard` maintains strict control over its layout while delegating link and image instantiation to the caller.

## Guide-level explanation
[guide-level-explanation]: #guide-level-explanation

Consumers interact with `ItemCard` through a single flat interface. The `number` prop accepts a standard numeric value, while `image` and `name` act as composition slots that accept any valid `ReactNode` (JSX elements, strings, or fragments).

### Consumer Usage Across Routers

```tsx
// Next.js App Router consumer
<ItemCard
  number={1}
  image={<Image src="/jarjacha.png" alt="Jarjacha" width={200} height={200} />}
  name={<Link href="/item?id=1">Jarjacha</Link>}
/>

// React Router consumer
<ItemCard
  number={1}
  image={<img src="/jarjacha.png" alt="Jarjacha" />}
  name={<Link to="/item?id=1">Jarjacha</Link>}
/>
```

## Reference-level explanation
[reference-level-explanation]: #reference-level-explanation

The public TypeScript contract consists strictly of the `ItemCardProps` interface exported from the component module:

```tsx
import { ReactNode } from 'react';

export interface ItemCardProps {
  /**
   * The item identifier.
   */
  number: number;

  /**
   * Slot for the item visual representation (e.g., <img>, Next <Image />, or SVG).
   */
  image: ReactNode;

  /**
   * Slot for the item title and navigation trigger (e.g., router <Link>, <a>, or plain text).
   */
  name: ReactNode;
}
```

### Type Semantics & Corner Cases
- **`number: number`**: Enforces a numeric primitive at compile time. Formatting (such as zero-padding) remains an internal concern.
- **`image: ReactNode` & `name: ReactNode`**: Because `ReactNode` includes `ReactElement | string | number | Iterable<ReactNode> | ReactPortal | boolean | null | undefined`, consumers can pass router links (`<Link>`), plain strings (`"Jarjacha"`), or conditional fallbacks (`null`).

## Drawbacks
[drawbacks]: #drawbacks

- **Permissive Type Width:** Because `ReactNode` allows `null`, `undefined`, and `boolean`, TypeScript will not raise a compile-time error if a consumer passes `name={null}` or `image={false}`, potentially resulting in an empty visual slot at runtime.
- **No Structural Enforcement on Passed Elements:** The interface cannot statically guarantee that the `ReactNode` passed to `name` is specifically an anchor/link element, nor that `image` contains valid accessible attributes (`alt`).

## Rationale and alternatives
[rationale-and-alternatives]: #rationale-and-alternatives

- **Why `ReactNode` Slots (Chosen):** Provides the lowest friction and highest flexibility. It supports both rich JSX elements (`<Link>`, `<Image>`) and simple strings for unit tests or non-linked contexts without forcing consumers to import sub-components.
- **Alternative 1: Primitive String Props (`name: string`, `href: string`, `imageUrl: string`):** Rejected because it couples the component to a single link/image strategy and breaks compatibility across routers.
- **Alternative 2: Compound Components (`<ItemCard.Title>`, `<ItemCard.Image>`):** Rejected because the card's internal layout and styling are already fixed. Exposing structural sub-components leaks layout responsibility and forces unnecessary JSX nesting on the consumer.
- **Alternative 3: `ReactElement` Instead of `ReactNode`:** Rejected because `ReactElement` forbids passing raw strings (e.g., `name="Jarjacha"` in a static preview or test) or fragments.

## Prior art
[prior-art]: #prior-art

- **Slot-based Props in React Design Systems:** Component libraries such as Material UI (`icon: ReactNode`, `action: ReactNode`) and Ant Design (`cover: ReactNode`, `title: ReactNode` on `Card`) use named `ReactNode` props to inject framework-specific links and media into fixed-layout cards.

# Unresolved questions
[unresolved-questions]: #unresolved-questions

- Should `image` and `name` eventually exclude `null | undefined | boolean` via `NonNullable<ReactNode>` if empty slots become a common runtime bug?

## Future possibilities
[future-possibilities]: #future-possibilities

- **Additional Metadata Slots:** If the card design expands (e.g., type badges or action buttons), the interface can be extended non-breakingly with optional `ReactNode` slots such as `badges?: ReactNode` or `actions?: ReactNode`.
