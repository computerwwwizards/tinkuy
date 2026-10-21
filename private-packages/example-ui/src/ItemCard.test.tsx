import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import {
  ItemCard,
  ItemCardView,
  itemCardPropEmitter,
} from './ItemCard';

describe('itemCardPropEmitter', () => {
  afterEach(cleanup);

  it('emits paper, paper-drop, and item-card by default', () => {
    const result = itemCardPropEmitter({});
    expect(result.className).toBe('paper paper-drop item-card');
  });

  it('emits paper-inner when shadow is inner', () => {
    const result = itemCardPropEmitter({ shadow: 'inner' });
    expect(result.className).toBe('paper paper-inner item-card');
  });

  it('appends custom className when provided', () => {
    const result = itemCardPropEmitter({ className: 'custom-class' });
    expect(result.className).toBe('paper paper-drop item-card custom-class');
  });
});

describe('ItemCard (createComponent bound)', () => {
  afterEach(cleanup);

  it('renders an li element by default with formatted number and slots', () => {
    render(
      <ItemCard
        number={1}
        image={<div data-testid="card-img">Image Placeholder</div>}
        name={<a href="/item/1">Item 1</a>}
        data-testid="item-card"
      />
    );

    const card = screen.getByTestId('item-card');
    expect(card.tagName).toBe('LI');
    expect(card.className).toContain('paper');
    expect(card.className).toContain('paper-drop');
    expect(card.className).toContain('item-card');

    expect(screen.getByText('#001')).toBeDefined();
    expect(screen.getByTestId('card-img')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Item 1' })).toBeDefined();
  });

  it('formats multi-digit numbers correctly', () => {
    render(
      <ItemCard
        number={25}
        image={<div>Item 25</div>}
        name="Item 25"
      />
    );

    expect(screen.getByText('#025')).toBeDefined();
  });

  it('renders as custom element when "as" prop is provided', () => {
    render(
      <ItemCard
        as="article"
        number={150}
        image={<div>Item 150</div>}
        name="Item 150"
        data-testid="custom-card"
      />
    );

    const card = screen.getByTestId('custom-card');
    expect(card.tagName).toBe('ARTICLE');
    expect(screen.getByText('#150')).toBeDefined();
  });
});
