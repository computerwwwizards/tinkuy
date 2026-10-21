# RFC: MorphContract Polymorphic Pattern Standard

- Status: Draft / Guideline
- Date: 2026-10-19

## Summary
Standardize the polymorphic element morphing type helper `MorphContract` as the canonical typing guideline across component interfaces in `example-ui`.

```ts
export type MorphContract<
  T extends ElementType,
  IntrinsicShape extends Record<string, any> = {}
> = IntrinsicShape & {
  as?: T;
} & Omit<ComponentProps<T>, keyof IntrinsicShape | 'as'>;
```

## Motivation
UI components often need to render as different underlying HTML elements or custom React components (e.g., rendering a wrapper as a `div`, `section`, `article`, `main`, or another React component) without losing static type safety for props specific to the target element.

Traditional polymorphic component type definitions suffer from severe type inference slowdowns, props key collisions, or inability to override default props cleanly. `MorphContract` resolves this by taking an `IntrinsicShape` (the component's explicit prop interface) and combining it with `Omit<ComponentProps<T>, keyof IntrinsicShape | 'as'>`.

## Guidelines for Component Authors

When implementing a polymorphic view component:

1. **Define the Intrinsic Shape:**
   Define the props intrinsic to the component (e.g., `children`, `className`, component-specific flags).

2. **Wrap View Props in `MorphContract<T, IntrinsicShape>`:**
   In the view component signature, default generic `T extends ElementType = 'div'`.

   ```tsx
   export interface AutoGridShape {
     children?: ReactNode;
     className?: string;
   }

   export function AutoGridView<T extends ElementType = 'div'>({
     as,
     children,
     ...restProps
   }: MorphContract<T, AutoGridShape>): ReactElement {
     const Component = (as || 'div') as ElementType;
     return <Component {...restProps}>{children}</Component>;
   }
   ```

3. **Integrate with `createComponent` Bridge:**
   Pass `MorphContract<ElementType, IntrinsicShape>` as the inner props parameter to `createComponent`:

   ```tsx
   export const AutoGrid = createComponent<
     AutoGridShape,
     {},
     MorphContract<ElementType, AutoGridShape>
   >({
     displayName: 'AutoGrid',
     render: AutoGridView,
     defaultPlugin: autoGridPropEmitter,
   });
   ```

## Key Rules
- Always preserve `IntrinsicShape` priority over intrinsic `ComponentProps<T>`.
- Always support `as` prop defaulting cleanly to `'div'` (or another appropriate intrinsic tag).
