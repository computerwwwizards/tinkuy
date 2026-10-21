// @vitest-environment jsdom

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { BootingAnimation } from './BootingAnimation';

afterEach(() => {
  cleanup();
});

describe('BootingAnimation', () => {
  it('renders upper and lower panels directly as sibling fixed 50dvh elements with accessibility attributes', () => {
    render(<BootingAnimation />);

    const topPanel = screen.getByTestId('boot-panel-top');
    const bottomPanel = screen.getByTestId('boot-panel-bottom');

    expect(topPanel).toBeDefined();
    expect(bottomPanel).toBeDefined();

    expect(topPanel.getAttribute('aria-hidden')).toBe('true');
    expect(topPanel.getAttribute('role')).toBe('presentation');
    expect(topPanel.className).toContain('fixed top-0');
    expect(topPanel.className).toContain('h-[50dvh]');
    expect(topPanel.className).toContain('pointer-events-none');
    expect(topPanel.className).toContain('animate-boot-curtain-top');

    expect(bottomPanel.getAttribute('aria-hidden')).toBe('true');
    expect(bottomPanel.getAttribute('role')).toBe('presentation');
    expect(bottomPanel.className).toContain('fixed bottom-0');
    expect(bottomPanel.className).toContain('h-[50dvh]');
    expect(bottomPanel.className).toContain('pointer-events-none');
    expect(bottomPanel.className).toContain('animate-boot-curtain-bottom');
  });

  it('renders Chacana halves for boot animation', () => {
    render(<BootingAnimation />);

    const topHalf = screen.getByTestId('boot-half-top');
    const bottomHalf = screen.getByTestId('boot-half-bottom');

    expect(topHalf).toBeDefined();
    expect(bottomHalf).toBeDefined();

    expect(topHalf.className).toContain('chacana-half-top');
    expect(bottomHalf.className).toContain('chacana-half-bottom');
  });

  it('accepts additional custom className on both panels', () => {
    render(<BootingAnimation className="custom-boot-class" />);

    const topPanel = screen.getByTestId('boot-panel-top');
    const bottomPanel = screen.getByTestId('boot-panel-bottom');

    expect(topPanel.className).toContain('custom-boot-class');
    expect(bottomPanel.className).toContain('custom-boot-class');
  });
});
