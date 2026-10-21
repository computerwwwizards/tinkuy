import { ElementType, ComponentProps } from 'react';

const componentCache = new WeakMap<object, Map<ElementType, ElementType>>();
const stringCache = new Map<string, Map<ElementType, ElementType>>();

function getSubCache(outer: ElementType): Map<ElementType, ElementType> {
  if (typeof outer === 'string') {
    let sub = stringCache.get(outer);
    if (!sub) {
      sub = new Map();
      stringCache.set(outer, sub);
    }
    return sub;
  } else {
    let sub = componentCache.get(outer as object);
    if (!sub) {
      sub = new Map();
      componentCache.set(outer as object, sub);
    }
    return sub;
  }
}

/**
 * Creates or retrieves a memoized composite component that renders Outer with as={Inner}.
 * Optimized with WeakMap caching for zero unnecessary allocations on re-renders.
 */
export function composeAs<
  Outer extends ElementType,
  Inner extends ElementType
>(OuterComponent: Outer, InnerComponent: Inner): ElementType {
  const subCache = getSubCache(OuterComponent);
  const cached = subCache.get(InnerComponent);
  if (cached) {
    return cached;
  }

  const Composed = (props: ComponentProps<Inner>) => {
    const Outer = OuterComponent as ElementType;
    return <Outer as={InnerComponent} {...props} />;
  };

  const nameOuter =
    typeof OuterComponent === 'string'
      ? OuterComponent
      : (OuterComponent as any).displayName || OuterComponent.name || 'Component';
  const nameInner =
    typeof InnerComponent === 'string'
      ? InnerComponent
      : (InnerComponent as any).displayName || InnerComponent.name || 'Component';

  Composed.displayName = `ComposeAs(${nameOuter}, ${nameInner})`;

  subCache.set(InnerComponent, Composed as ElementType);
  return Composed as ElementType;
}

export const concatAs = composeAs;
