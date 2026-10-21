import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Paper, PaperView, paperPropEmitter } from './Paper';

describe('paperPropEmitter', () => {
  afterEach(cleanup);

  it('emits paper and paper-inner by default', () => {
    const result = paperPropEmitter({});
    expect(result.className).toBe('paper paper-inner');
  });

  it('emits paper-drop when shadow is drop', () => {
    const result = paperPropEmitter({ shadow: 'drop' });
    expect(result.className).toBe('paper paper-drop');
  });
});

describe('Paper (createComponent bound)', () => {
  afterEach(cleanup);

  it('renders a div element with paper classes', () => {
    render(
      <Paper data-testid="paper">
        <span>Paper Content</span>
      </Paper>
    );

    const el = screen.getByTestId('paper');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('paper');
    expect(el.className).toContain('paper-inner');
  });

  it('renders as custom element with "as" prop', () => {
    render(
      <Paper as="section" shadow="drop" data-testid="paper">
        <span>Section Paper</span>
      </Paper>
    );

    const el = screen.getByTestId('paper');
    expect(el.tagName).toBe('SECTION');
    expect(el.className).toContain('paper-drop');
  });
});
