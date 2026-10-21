import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AutoGrid } from './AutoGrid';
import { composeAs, concatAs } from './composeAs';

describe('composeAs / concatAs', () => {
  it('returns the same cached composite component instance when called with same arguments', () => {
    const Composed1 = composeAs(AutoGrid, 'section');
    const Composed2 = composeAs(AutoGrid, 'section');

    expect(Composed1).toBe(Composed2);
  });

  it('renders correctly as composite component', () => {
    const PaperGrid = concatAs(AutoGrid, 'article');

    const { container } = render(
      <PaperGrid className="paper">
        <div>Content</div>
      </PaperGrid>
    );

    const articleElement = container.querySelector('article');
    expect(articleElement).not.toBeNull();
    expect(articleElement?.classList.contains('ag-layout')).toBe(true);
    expect(articleElement?.classList.contains('paper')).toBe(true);
    expect(screen.getByText('Content')).toBeDefined();
  });
});
