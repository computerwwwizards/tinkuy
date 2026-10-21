import { ElementType, ReactElement, ReactNode } from 'react';
import { createComponent } from '@computerwwwizards/tinkuy-react';
import { MorphContract } from './types';

export interface PaperShape {
  children?: ReactNode;
  className?: string;
  shadow?: 'inner' | 'drop';
}

export function PaperView<T extends ElementType = 'div'>({
  as,
  children,
  shadow,
  ...restProps
}: MorphContract<T, PaperShape>): ReactElement {
  const Component = (as || 'div') as ElementType;

  return <Component {...restProps}>{children}</Component>;
}

export function paperPropEmitter(
  props: Readonly<{ className?: string; shadow?: 'inner' | 'drop' }>
) {
  const shadowClass = props.shadow === 'drop' ? 'paper-drop' : 'paper-inner';

  return {
    className: ['paper', shadowClass, props.className].filter(Boolean).join(' '),
    shadow: undefined,
  };
}

export const Paper = createComponent<
  PaperShape,
  { shadow?: 'inner' | 'drop' },
  MorphContract<ElementType, PaperShape>
>({
  displayName: 'Paper',
  render: PaperView,
  defaultPlugin: paperPropEmitter,
});
