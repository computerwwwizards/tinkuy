# RFC: Input Wrapper

- status: draft/implementation ready
- Start Date: 2026-10-18

## Summary
[summary]: #summary

Introduce `InputFrame`, a headless, morphable React 19 input container for `example-ui`. It provides `startElement`, `children` (`InputLikeChild`), and `endElement` slots inside a default `<div>` host, paired with a pure Prop Reader/Emitter function.

## Motivation
[motivation]: #motivation

1. **Avoid Monolithic Prop Drilling:** Wrapping an `<input>` via JSX composition (`children`) avoids splitting `inputProps` and `wrapperProps` on a single bloated component.
2. **Preserve RSC & Compiler Boundaries:** Avoiding `React.cloneElement`, render props, and `useState` focus listeners lets `InputFrame` render in Next.js SSG Server Components while wrapping `'use client'` inputs.
3. **Prevent `<label>` Nesting Violations:** Defaulting the host to `<div>` instead of `<label>` prevents accessibility bugs when an interactive reset `<button>` is placed inside `endElement`.

## Guide-level explanation
[guide-level-explanation]: #guide-level-explanation

`InputFrame` renders a container (defaulting to `<div>`, morphable via `as`) around `startElement`, `children` (which must satisfy `<input>` props), and `endElement`.

### Examples of Use

```tsx
import { useRef, useState } from 'react';
import { InputFrame } from '@computerwwwizards/example-ui';
import { SearchIcon, CloseIcon } from '@computerwwwizards/example-ui/icons';

export function ItemSearchBar() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <InputFrame
      startElement={<SearchIcon aria-hidden="true" />}
      endElement={
        query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <CloseIcon />
          </button>
        ) : undefined
      }
    >
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search items..."
      />
    </InputFrame>
  );
}
```

Morphing the container via `as`:

```tsx
<InputFrame as="search" aria-label="Item Filter" startElement={<SearchIcon />}>
  <input type="search" placeholder="Search..." />
</InputFrame>
```

## Reference-level explanation
[reference-level-explanation]: #reference-level-explanation

```tsx
import {
  ComponentProps,
  ElementType,
  JSXElementConstructor,
  ReactElement,
} from 'react';

export type InputLikeChild = ReactElement<
  ComponentProps<'input'>,
  'input' | JSXElementConstructor<ComponentProps<'input'>>
>;

export interface InputFrameShape {
  children: InputLikeChild;
  startElement?: ReactElement;
  endElement?: ReactElement;
}

export type MorphContract<
  T extends ElementType,
  IntrinsicShape extends Record<string, any> = {}
> = IntrinsicShape & {
  as?: T;
} & Omit<ComponentProps<T>, keyof IntrinsicShape | 'as'>;

export function InputFrameView<T extends ElementType = 'div'>({
  as,
  children,
  startElement,
  endElement,
  ...restProps
}: MorphContract<T, InputFrameShape>): ReactElement {
  const Wrapper = (as || 'div') as ElementType;

  return (
    <Wrapper {...restProps}>
      {startElement}
      {children}
      {endElement}
    </Wrapper>
  );
}

export function inputFramePropEmitter<T extends ElementType = 'div'>(
  props: Readonly<MorphContract<T, InputFrameShape>>
) {
  return {
    className: ['input-frame', props.className].filter(Boolean).join(' '),
  };
}
```

## Drawbacks
[drawbacks]: #drawbacks

- **JSX Type Widening:** TypeScript widens `<div />` to `JSX.Element`, so `InputLikeChild` only blocks primitives (`string`, `number`) unless a branded child helper is used.
- **No Automatic Padding Click Focus:** Because the default host is `<div>` (for `endElement` button safety), clicking padding does not focus the `<input>` unless `as="label"` is used when no button is present.

## Rationale and alternatives
[rationale-and-alternatives]: #rationale-and-alternatives

- **Direct `children` over `cloneElement` / Render Props:** Preserves child reference identity and allows Server Components to wrap Client inputs directly.
- **`MorphContract` & `IntrinsicShape` Naming:** Avoids collisions with `PolymorphicProps` and `OwnProps` in external libraries while leveraging React 19's native `ComponentProps<T>` (including `ref`).
- **Predictable Prop Emitter AST:** A pure function (`props => attributes`) is trivial to migrate to other frameworks via AI-generated `ts-morph` codemods.

## Prior art
[prior-art]: #prior-art

- React 19 `ComponentProps<T>` ref-as-prop polymorphism.

## Unresolved questions
[unresolved-questions]: #unresolved-questions

- None.

## Future possibilities
[future-possibilities]: #future-possibilities

- Optional branded `<InputControl />` child to enforce `InputLikeChild` strictly at compile time.
