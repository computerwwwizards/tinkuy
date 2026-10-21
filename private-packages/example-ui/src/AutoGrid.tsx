import { CSSProperties, ElementType, ReactElement, ReactNode } from 'react';
import { createComponent } from '@computerwwwizards/tinkuy-react';
import { MorphContract } from './types';

export interface AutoGridShape {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  minColumnSize?: string;
  maxColumnSize?: string;
  placement?: 'auto-fill' | 'auto-fit';
  gap?: string;
}

export function AutoGridView<T extends ElementType = 'div'>({
  as,
  children,
  minColumnSize,
  maxColumnSize,
  placement,
  gap,
  ...restProps
}: MorphContract<T, AutoGridShape>): ReactElement {
  const Component = (as || 'div') as ElementType;

  return <Component {...restProps}>{children}</Component>;
}

export function autoGridPropEmitter(
  props: Readonly<{
    className?: string;
    style?: CSSProperties;
    minColumnSize?: string;
    maxColumnSize?: string;
    placement?: 'auto-fill' | 'auto-fit';
    gap?: string;
  }>
) {
  const customVars: Record<string, string> = {};
  if (props.minColumnSize) {
    customVars['--ag-min-column-size'] = props.minColumnSize;
  }
  if (props.maxColumnSize) {
    customVars['--ag-max-column-size'] = props.maxColumnSize;
  }
  if (props.placement) {
    customVars['--ag-grid-placement'] = props.placement;
  }
  if (props.gap) {
    customVars['--ag-grid-gap'] = props.gap;
  }

  const mergedStyle =
    Object.keys(customVars).length > 0
      ? { ...customVars, ...props.style }
      : props.style;

  return {
    className: ['ag-layout', props.className].filter(Boolean).join(' '),
    style: mergedStyle,
    minColumnSize: undefined,
    maxColumnSize: undefined,
    placement: undefined,
    gap: undefined,
  };
}

export const AutoGrid = createComponent<
  AutoGridShape,
  {
    minColumnSize?: string;
    maxColumnSize?: string;
    placement?: 'auto-fill' | 'auto-fit';
    gap?: string;
  },
  MorphContract<ElementType, AutoGridShape>
>({
  displayName: 'AutoGrid',
  render: AutoGridView,
  defaultPlugin: autoGridPropEmitter,
});
