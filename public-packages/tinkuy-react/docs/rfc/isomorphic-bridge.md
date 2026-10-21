# RFC: Isomorphic Headless Component Bridge Factory (`createComponent`)

- **Status:** Draft / Reference Implementation Ready
- **Author:** Shadowrunner11
- **Target Runtime:** React 19 (RSC & Client Components), React Compiler

---

## 1. Summary

This RFC proposes a universal, zero-runtime-tax meta-factory (`createComponent`) that decouples **Headless Component Logic/Structure** from **Styling & Attribute Resolution (`StylingPlugin`)**. 

Instead of mixing styling logic inside headless components or forcing consumers to manually invoke class-resolver utilities at every call site, `createComponent` generates an **Isomorphic Bridge Component (`DefaultBoundBridge`)**. This bridge resolves styling plugins into a strictly serializable subset of attributes before forwarding props to the underlying headless render target.

---

## 2. Motivation & Problem Statement

Modern React design systems face four colliding architectural constraints:

1. **Coupling of Headless Logic and Styling:** Headless primitives should only care about structure, accessibility, and behavior. However, consumers want ergonomic, out-of-the-box styled components (e.g., via subpath imports like `@lib/tailwind` or `@lib/itcss`) without losing the ability to override styling per instance.
2. **React 19 Server Component (RSC) Serialization Boundaries:** Interactive headless primitives require `'use client'`, whereas styling plugins are JavaScript functions. Passing a `stylingPlugin` function directly into a `'use client'` component from a Server Component violates RSC serialization rules.
3. **Principle of Least Privilege & DOM Prop Leakage:** If a styling plugin is given unconstrained control over a component's props, a faulty plugin can accidentally strip critical behavioral props (`children`, `ref`, `onChange`) or leak custom design-system variant props (`intent="primary"`, `compact`) onto native HTML DOM elements.
4. **React Compiler (`useMemoCache`) Compatibility:** Dynamic Higher-Order Component (HOC) chains or runtime prop-merging loops (`for...in` / `delete`) obscure data flow and cause the React Compiler's static mutability analysis to bail out of memoization.

---

## 3. Core Architectural Design

### 3.1 Separation of Concerns: The Three Roles

The architecture strictly divides every component into three orthogonal units:

1. **The Inner Headless Target (`render`):**
   - Owns the DOM topology, slots (e.g., `startElement`, `children`, `endElement`), and interactive state.
   - Can be an inline PascalCase function (for Server/Isomorphic components) or an imported reference from a dedicated `'use client'` module (for interactive Client Components).
   - Remains 100% ignorant of how classes, themes, or CSS variables are resolved.

2. **The Styling Plugin (`StylingPlugin`):**
   - A pure, synchronous function that receives `Readonly<BaseProps & ExtraProps>`.
   - Inspects component props and child element props (e.g., `props.children.props.disabled`) to compute styling and accessibility attributes (`className`, `style`, `data-*`, `aria-*`, `htmlFor`).
   - Restricted at compile time via `SerializableSubset<InnerProps, ExtraProps>` so it can **only** output serializable primitives/objects and suppress its own custom variant props (`variant: undefined`). It cannot mutate or strip behavioral handlers, `ref`, or `children`.

3. **The Bound Bridge (`DefaultBoundBridge` inside `createComponent`):**
   - An isomorphic (directive-free) component closure generated once at module scope.
   - When rendered inside a **Server Component**, it executes `stylingPlugin` on the server and passes only resolved, serializable attributes across the `'use client'` boundary to `InnerComponent`.
   - When rendered inside a **Client Component**, it automatically executes on the client as part of the client bundle graph, reacting to dynamic client state props with zero configuration changes.

---

## 4. Detailed Specification & Reference Types

```tsx
import { CSSProperties, JSXElementConstructor, ReactElement } from 'react';

/**
 * 1. Compile-Time Serialization Firewall
 * Restricts plugin outputs to RSC-serializable primitives and CSSProperties.
 * Explicitly prevents plugins from returning functions (event handlers),
 * ReactElements (`children`), or Symbols.
 */
type SerializableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | CSSProperties;

export type SerializableSubset<InnerProps, ExtraProps = {}> = {
  [K in keyof InnerProps as InnerProps[K] extends SerializableValue
    ? K
    : never]?: InnerProps[K];
} & {
  // Allows plugins to nullify their own flat variant props (`intent: undefined`)
  // so custom props never leak to native DOM spreads inside `InnerProps`.
  [K in keyof ExtraProps]?: undefined;
} & Record<`data-${string}`, string | number | boolean | undefined>;

/**
 * 2. Styling Plugin Contract
 * Infers flat `ExtraProps` (variants) at definition time while locking
 * the output to `SerializableSubset`.
 */
export type StylingPlugin<
  BaseProps extends Record<string, any>,
  ExtraProps extends Record<string, any> = {},
  InnerProps extends Record<string, any> = BaseProps
> = (
  props: Readonly<BaseProps & ExtraProps>
) => SerializableSubset<InnerProps, ExtraProps>;

/**
 * 3. Plug-and-Play Custom Bound Bridge Escape Hatch
 * Only invoked at module initialization if a component requires non-standard bridging.
 */
export type CustomBoundFactory<
  BaseProps extends Record<string, any>,
  DefaultExtraProps extends Record<string, any>,
  InnerProps extends Record<string, any>
> = (
  config: ComponentFactoryConfig<BaseProps, DefaultExtraProps, InnerProps>
) => <InstanceExtraProps extends Record<string, any> = DefaultExtraProps>(
  props: BaseProps &
    InstanceExtraProps & {
      stylingPlugin?: StylingPlugin<BaseProps, InstanceExtraProps, InnerProps>;
    }
) => ReactElement;

export interface ComponentFactoryConfig<
  BaseProps extends Record<string, any>,
  DefaultExtraProps extends Record<string, any> = {},
  InnerProps extends Record<string, any> = BaseProps
> {
  displayName: string;
  render: JSXElementConstructor<InnerProps>;
  defaultPlugin?: StylingPlugin<BaseProps, DefaultExtraProps, InnerProps>;
  defaultProps?: Partial<BaseProps & DefaultExtraProps>;
  customBoundFactory?: CustomBoundFactory<
    BaseProps,
    DefaultExtraProps,
    InnerProps
  >;
}

/**
 * 4. The Universal Bridge Factory
 */
export function createComponent<
  BaseProps extends Record<string, any>,
  DefaultExtraProps extends Record<string, any> = {},
  InnerProps extends Record<string, any> = BaseProps
>(
  config: ComponentFactoryConfig<BaseProps, DefaultExtraProps, InnerProps>
) {
  const {
    displayName,
    render: InnerComponent,
    defaultPlugin,
    defaultProps,
    customBoundFactory,
  } = config;

  function DefaultBoundBridge<
    InstanceExtraProps extends Record<string, any> = DefaultExtraProps
  >(
    props: BaseProps &
      InstanceExtraProps & {
        stylingPlugin?: StylingPlugin<BaseProps, InstanceExtraProps, InnerProps>;
      }
  ): ReactElement {
    const {
      stylingPlugin = defaultPlugin as
        | StylingPlugin<BaseProps, InstanceExtraProps, InnerProps>
        | undefined,
      ...restProps
    } = props;

    // Avoid extra object allocation when `defaultProps` is not configured
    const mergedProps = (
      defaultProps ? { ...defaultProps, ...restProps } : restProps
    ) as BaseProps & InstanceExtraProps;

    const serializableStyleProps = stylingPlugin
      ? stylingPlugin(mergedProps)
      : undefined;

    // Additive spread guarantees a plugin cannot strip core behavioral props
    return (
      <InnerComponent
        {...(mergedProps as unknown as InnerProps)}
        {...serializableStyleProps}
      />
    );
  }

  const BoundComponent = customBoundFactory
    ? customBoundFactory(config)
    : DefaultBoundBridge;

  Object.defineProperty(BoundComponent, 'displayName', {
    value: displayName,
    writable: false,
  });

  return BoundComponent;
}
```

---

## 5. Subpath Distribution & Styling Plugin Decoupling Strategy

`tinkuy-react` is strictly an isomorphic headless component bridge factory. It is completely styling-agnostic and does **not** package or export concrete styling plugins or design system implementations (such as Tailwind or ITCSS plugins).

Concrete styling plugins and pre-bound styled component libraries live in separate dedicated packages/libraries:
1. **Core Bridge Factory (`tinkuy-react`)**: Provides `createComponent`, `StylingPlugin`, and `SerializableSubset` contracts.
2. **External Styling & Component Packages**: Separate libraries (e.g. `@tinkuy/tailwind`, `@tinkuy/itcss`) import `tinkuy-react` and bind their specific styling plugins to target render components.
3. **Instance-Level Overrides**: Every bound component created via `createComponent` retains the optional `stylingPlugin` prop so consumers can swap or curry plugins at the call site when needed.

---

## 6. Performance & React Compiler Guarantees

- **Single Lexical Closure at Module Scope:** `createComponent` is invoked strictly at module initialization. `DefaultBoundBridge` closes over immutable `const` bindings (`InnerComponent`, `defaultPlugin`, `defaultProps`), adding zero runtime garbage-collection pressure.
- **No Imperative Prop Mutation Loops:** By outlawing `delete` loops and hardcoded `mergeProps` iterators inside `DefaultBoundBridge`, the component body remains free of mutable aliasing.
- **Downstream Compiler Preservation:** Because `serializableStyleProps` resolves to primitive strings and booleans before entering `InnerComponent`, a `'use client'` `InnerComponent` compiled by `babel-plugin-react-compiler` retains 100% granular memoization on its internal hooks and DOM children.
