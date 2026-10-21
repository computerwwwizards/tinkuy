import {
  ComponentProps,
  ElementType,
  JSXElementConstructor,
  ReactElement,
} from 'react';
import { createComponent } from '@computerwwwizards/tinkuy-react';
import { MorphContract } from './types';

export type InputLikeChild = ReactElement<
  ComponentProps<'input'>,
  'input' | JSXElementConstructor<ComponentProps<'input'>>
>;

export interface InputFrameShape {
  children: InputLikeChild;
  startElement?: ReactElement;
  endElement?: ReactElement;
  className?: string;
}

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

export function inputFramePropEmitter(
  props: Readonly<{ className?: string }>
) {
  return {
    className: ['input-frame', props.className].filter(Boolean).join(' '),
  };
}

export const InputFrame = createComponent<
  InputFrameShape,
  {},
  MorphContract<ElementType, InputFrameShape>
>({
  displayName: 'InputFrame',
  render: InputFrameView,
  defaultPlugin: inputFramePropEmitter,
});
