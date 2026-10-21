import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { InputFrame, InputFrameView, inputFramePropEmitter } from './InputFrame';

describe('inputFramePropEmitter', () => {
  afterEach(cleanup);

  it('returns className "input-frame" by default', () => {
    const result = inputFramePropEmitter({});
    expect(result).toEqual({ className: 'input-frame' });
  });

  it('appends custom className when provided', () => {
    const result = inputFramePropEmitter({ className: 'custom-class' });
    expect(result).toEqual({ className: 'input-frame custom-class' });
  });
});

describe('InputFrameView', () => {
  afterEach(cleanup);

  it('renders a div element by default with children', () => {
    render(
      <InputFrameView data-testid="frame">
        <input placeholder="Search" />
      </InputFrameView>
    );

    const frame = screen.getByTestId('frame');
    expect(frame.tagName).toBe('DIV');
    expect(screen.getByPlaceholderText('Search')).toBeDefined();
  });

  it('renders as a morphed tag when "as" prop is provided', () => {
    render(
      <InputFrameView as="section" data-testid="frame">
        <input placeholder="Search" />
      </InputFrameView>
    );

    const frame = screen.getByTestId('frame');
    expect(frame.tagName).toBe('SECTION');
  });

  it('renders startElement and endElement slots', () => {
    render(
      <InputFrameView
        startElement={<span data-testid="start">Start</span>}
        endElement={<button data-testid="end">End</button>}
      >
        <input placeholder="Search" />
      </InputFrameView>
    );

    expect(screen.getByTestId('start')).toBeDefined();
    expect(screen.getByTestId('end')).toBeDefined();
  });
});

describe('InputFrame (createComponent bound)', () => {
  afterEach(cleanup);

  it('applies input-frame class name via default styling plugin', () => {
    render(
      <InputFrame data-testid="frame">
        <input placeholder="Search" />
      </InputFrame>
    );

    const frame = screen.getByTestId('frame');
    expect(frame.className).toBe('input-frame');
  });

  it('combines custom className with input-frame', () => {
    render(
      <InputFrame className="my-custom-style" data-testid="frame">
        <input placeholder="Search" />
      </InputFrame>
    );

    const frame = screen.getByTestId('frame');
    expect(frame.className).toBe('input-frame my-custom-style');
  });
});
