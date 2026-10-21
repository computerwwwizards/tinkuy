import { ElementType, ReactElement, ReactNode } from 'react';
import { createComponent } from '@computerwwwizards/tinkuy-react';
import { MorphContract } from './types';

export interface ItemCardShape {
  /**
   * The item identifier number.
   */
  number: number;

  /**
   * Slot for the item visual representation (e.g., <img>, Next <Image />, SVG, or div placeholder).
   */
  image: ReactNode;

  /**
   * Slot for the item title and navigation trigger (e.g., router <Link>, <a>, or plain text).
   */
  name: ReactNode;

  className?: string;
  shadow?: 'inner' | 'drop';
}

export function ItemCardView<T extends ElementType = 'li'>({
  as,
  number,
  image,
  name,
  shadow,
  ...restProps
}: MorphContract<T, ItemCardShape>): ReactElement {
  const Component = (as || 'li') as ElementType;
  const formattedNumber = `#${String(number).padStart(3, '0')}`;

  return (
    <Component {...restProps}>
      <span className="item-number">{formattedNumber}</span>
      {image}
      <h2 className="item-name">{name}</h2>
    </Component>
  );
}

export function itemCardPropEmitter(
  props: Readonly<{ className?: string; shadow?: 'inner' | 'drop' }>
) {
  const shadowClass = props.shadow === 'inner' ? 'paper-inner' : 'paper-drop';

  return {
    className: ['paper', shadowClass, 'item-card', props.className]
      .filter(Boolean)
      .join(' '),
    shadow: undefined,
  };
}

export const ItemCard = createComponent<
  ItemCardShape,
  { shadow?: 'inner' | 'drop' },
  MorphContract<ElementType, ItemCardShape>
>({
  displayName: 'ItemCard',
  render: ItemCardView,
  defaultPlugin: itemCardPropEmitter,
});
